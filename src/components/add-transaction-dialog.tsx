import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { IconX } from '@tabler/icons-react'
import { useMutation } from 'convex/react'
import { toast } from 'sonner'
import type { Doc } from '../../convex/_generated/dataModel'
import { api } from '../../convex/_generated/api'
import {
  defaultUserCurrency,
  userCurrencyOptions,
} from '#/config/currencies'
import {
  findAssetAutocompleteOption,
  getAssetAutocompleteOptions,
  type AssetAutocompleteOption,
} from '#/lib/asset-autocomplete'
import { todayIsoDate } from '#/lib/format'
import { resolveTransactionFxRate } from '#/lib/transaction-fx'
import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'
import {
  DialogClose,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Input } from '#/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'

function createInitialState(defaultCurrency: string) {
  const normalizedCurrency = defaultCurrency.trim().toUpperCase()

  return {
    assetName: '',
    assetType: 'equity' as 'equity' | 'crypto',
    date: todayIsoDate(),
    nativeCurrency:
      /^[A-Z]{3}$/.test(normalizedCurrency)
        ? normalizedCurrency
        : defaultUserCurrency,
    pricePerUnit: '',
    quantity: '',
    side: 'buy' as 'buy' | 'sell',
    ticker: '',
  }
}

type AddTransactionDialogProps = {
  onOpenChange: (open: boolean) => void
  open: boolean
  portfolio: Doc<'portfolios'>
}

function Field({
  children,
  label,
}: {
  children: React.ReactNode
  label: string
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  )
}

function SideToggle({
  onChange,
  value,
}: {
  onChange: (value: 'buy' | 'sell') => void
  value: 'buy' | 'sell'
}) {
  const isBuy = value === 'buy'
  return (
    <button
      type="button"
      onClick={() => onChange(isBuy ? 'sell' : 'buy')}
      style={
        isBuy
          ? {
              borderColor: 'oklch(0.64 0.156 149.56)',
              backgroundColor: 'color-mix(in oklch, oklch(0.64 0.156 149.56) 12%, transparent)',
              color: 'oklch(0.44 0.13 149.56)',
            }
          : {
              borderColor: 'oklch(0.637 0.237 25.331)',
              backgroundColor: 'color-mix(in oklch, oklch(0.637 0.237 25.331) 12%, transparent)',
              color: 'oklch(0.52 0.2 25.331)',
            }
      }
      aria-label={isBuy ? 'Buy (click to switch to Sell)' : 'Sell (click to switch to Buy)'}
      className="flex h-9 w-24 cursor-pointer items-center justify-center border px-4 text-[13px] font-semibold tracking-[0.03em] whitespace-nowrap transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      {isBuy ? '▲ Buy' : '▼ Sell'}
    </button>
  )
}

export default function AddTransactionDialog({
  onOpenChange,
  open,
  portfolio,
}: AddTransactionDialogProps) {
  const addTransaction = useMutation(api.mutations.addTransaction)
  const defaultCurrency = portfolio.homeCurrency
  const [form, setForm] = useState(() => createInitialState(defaultCurrency))
  const [error, setError] = useState<string | null>(null)
  const [highlightedAssetIndex, setHighlightedAssetIndex] = useState(0)
  const [isAssetInputFocused, setIsAssetInputFocused] = useState(false)
  const [isAssetMenuOpen, setIsAssetMenuOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const deferredTicker = useDeferredValue(form.ticker)

  useEffect(() => {
    if (!open) return
    setForm(createInitialState(defaultCurrency))
    setError(null)
    setHighlightedAssetIndex(0)
    setIsAssetInputFocused(false)
    setIsAssetMenuOpen(false)
  }, [defaultCurrency, open])

  const canSubmit = useMemo(
    () =>
      Boolean(
        form.ticker.trim() &&
          form.nativeCurrency.length === 3 &&
          form.quantity &&
          form.pricePerUnit &&
          form.date,
      ),
    [form.date, form.nativeCurrency, form.pricePerUnit, form.quantity, form.ticker],
  )
  const assetAutocompleteOptions = useMemo(
    () => getAssetAutocompleteOptions(deferredTicker),
    [deferredTicker],
  )
  const transactionCurrencyOptions = useMemo(() => {
    const currencies = new Set([
      portfolio.homeCurrency,
      ...userCurrencyOptions,
    ])

    return [...currencies]
  }, [portfolio.homeCurrency])
  const shouldShowAssetMenu =
    isAssetMenuOpen && form.ticker.trim().length > 0

  useEffect(() => {
    setHighlightedAssetIndex(0)
  }, [deferredTicker])

  function handleAssetOptionSelect(option: AssetAutocompleteOption) {
    setForm((current) => ({
      ...current,
      assetName: option.name,
      ticker: option.symbol,
      assetType: option.assetType,
    }))
    setHighlightedAssetIndex(0)
    setIsAssetMenuOpen(false)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSaving(true)

    try {
      const fxRate = await resolveTransactionFxRate({
        date: form.date,
        homeCurrency: portfolio.homeCurrency,
        nativeCurrency: form.nativeCurrency,
      })

      await addTransaction({
        ...(form.assetName.trim()
          ? { assetName: form.assetName.trim() }
          : {}),
        assetType: form.assetType,
        date: form.date,
        fxRate,
        nativeCurrency: form.nativeCurrency,
        portfolioId: portfolio._id,
        pricePerUnit: Number(form.pricePerUnit),
        quantity: Number(form.quantity),
        side: form.side,
        ticker: form.ticker.trim().toUpperCase(),
      })

      toast.success('Transaction added', { duration: 2000 })
      onOpenChange(false)
      setForm(createInitialState(defaultCurrency))
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to save the transaction.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="gap-0 overflow-visible p-0 sm:max-w-[420px]"
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader className="border-b px-6 py-3.5">
            <div className="flex items-center justify-between gap-3">
              <DialogTitle className="text-[15px] font-semibold tracking-[-0.01em]">
                Add transaction
              </DialogTitle>
              <DialogClose asChild>
                <Button variant="ghost" size="icon-sm" className="shrink-0">
                  <IconX />
                  <span className="sr-only">Close</span>
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>

          <div className="flex flex-col gap-3.5 px-6 py-5">
            {/* Asset + Side */}
            <input type="hidden" name="asset-name" value={form.assetName} />
            <input type="hidden" name="asset-type" value={form.assetType} />

            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2.5">
              <Field label="Asset">
                <div
                  className="relative"
                  onBlur={(event) => {
                    const nextFocused =
                      event.relatedTarget instanceof Node
                        ? event.relatedTarget
                        : null

                    if (!event.currentTarget.contains(nextFocused)) {
                      setIsAssetInputFocused(false)
                      setIsAssetMenuOpen(false)
                    }
                  }}
                >
                  <Input
                    value={form.ticker}
                    onFocus={() => {
                      setIsAssetInputFocused(true)
                      setIsAssetMenuOpen(true)
                    }}
                    onChange={(event) => {
                      const nextTicker = event.target.value.toUpperCase()
                      const matchedOption =
                        findAssetAutocompleteOption(nextTicker)

                      setForm((current) => ({
                        ...current,
                        assetName: matchedOption?.name ?? '',
                        assetType: matchedOption?.assetType ?? 'equity',
                        ticker: nextTicker,
                      }))
                      setIsAssetMenuOpen(true)
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') {
                        setIsAssetMenuOpen(false)
                        return
                      }

                      if (assetAutocompleteOptions.length === 0) {
                        return
                      }

                      if (event.key === 'ArrowDown') {
                        event.preventDefault()
                        setIsAssetMenuOpen(true)
                        setHighlightedAssetIndex((current) =>
                          current === assetAutocompleteOptions.length - 1
                            ? 0
                            : current + 1,
                        )
                      }

                      if (event.key === 'ArrowUp') {
                        event.preventDefault()
                        setIsAssetMenuOpen(true)
                        setHighlightedAssetIndex((current) =>
                          current === 0
                            ? assetAutocompleteOptions.length - 1
                            : current - 1,
                        )
                      }

                      if (event.key === 'Enter' && shouldShowAssetMenu) {
                        const selectedOption =
                          assetAutocompleteOptions[highlightedAssetIndex]

                        if (!selectedOption) {
                          return
                        }

                        event.preventDefault()
                        handleAssetOptionSelect(selectedOption)
                      }
                    }}
                    placeholder="AAPL or Bitcoin"
                    autoComplete="off"
                    className={cn(
                      'h-9 font-semibold uppercase',
                      form.assetName &&
                        !isAssetInputFocused &&
                        'text-transparent selection:bg-transparent',
                    )}
                  />

                  {form.assetName && !isAssetInputFocused ? (
                    <div className="pointer-events-none absolute inset-0 flex items-center px-2.5">
                      <span className="font-semibold uppercase text-foreground">
                        {form.ticker}
                      </span>
                      <span className="relative top-px ml-2 truncate text-xs font-medium normal-case text-muted-foreground">
                        {form.assetName}.
                      </span>
                    </div>
                  ) : null}

                  {shouldShowAssetMenu ? (
                    <div className="absolute top-full z-20 mt-1 w-full overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-lg">
                      {assetAutocompleteOptions.length > 0 ? (
                        <div className="max-h-64 overflow-y-auto py-1">
                          {assetAutocompleteOptions.map((option, index) => (
                            <button
                              key={`${option.label}:${option.symbol}`}
                              type="button"
                              onMouseDown={(event) => event.preventDefault()}
                              onMouseEnter={() => setHighlightedAssetIndex(index)}
                              onClick={() => handleAssetOptionSelect(option)}
                              className={cn(
                                'flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition-colors hover:bg-accent/60 focus:bg-accent/60 focus:outline-none',
                                index === highlightedAssetIndex && 'bg-accent/60',
                              )}
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold uppercase">
                                    {option.symbol}
                                  </span>
                                  <span
                                    className={cn(
                                      'rounded-full border px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.08em] lowercase',
                                      option.label === 'crypto'
                                        ? 'border-primary/20 bg-primary/10 text-primary'
                                        : 'border-border bg-muted text-muted-foreground',
                                    )}
                                  >
                                    {option.label}
                                  </span>
                                </div>
                                <p className="truncate text-xs text-muted-foreground">
                                  {option.name}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="px-3 py-2 text-xs text-muted-foreground">
                          No matching assets found.
                        </p>
                      )}
                    </div>
                  ) : null}
                </div>
              </Field>
              <div className="grid gap-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Side
                </span>
                <SideToggle
                  value={form.side}
                  onChange={(side) => setForm((current) => ({ ...current, side }))}
                />
              </div>
            </div>

            {/* Quantity + Price/Currency */}
            <div className="grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-2.5">
              <Field label="Quantity">
                <Input
                  inputMode="decimal"
                  value={form.quantity}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      quantity: event.target.value,
                    }))
                  }
                  placeholder="10"
                  className="h-9"
                />
              </Field>
            <Field label="Price per unit">
                <div className="flex">
                  <Input
                    inputMode="decimal"
                    value={form.pricePerUnit}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        pricePerUnit: event.target.value,
                      }))
                    }
                    placeholder="183.40"
                    className="h-9 flex-1 rounded-r-none border-r-0 focus-visible:z-10"
                  />
                  <Select
                    value={form.nativeCurrency}
                    onValueChange={(value) =>
                      setForm((current) => ({
                        ...current,
                        nativeCurrency: value,
                      }))
                    }
                  >
                    <SelectTrigger
                      aria-label="Currency"
                      className="h-9 min-h-9 w-[104px] shrink-0 rounded-l-none border-l-0 bg-background px-3 text-[12px] text-foreground"
                    >
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent position="popper" align="end">
                      {transactionCurrencyOptions.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {form.nativeCurrency !== portfolio.homeCurrency ? (
                  <p className="text-[11px] leading-4 text-muted-foreground">
                    Saved in {portfolio.homeCurrency} using the historical FX rate for {form.date}.
                  </p>
                ) : null}
              </Field>
            </div>

            {/* Date */}
            <Field label="Date">
              <Input
                type="date"
                value={form.date}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    date: event.target.value,
                  }))
                }
                className="h-9"
              />
            </Field>

          </div>

          {error ? (
            <p className="px-6 pb-2 text-sm text-destructive">{error}</p>
          ) : null}

          <div className="flex justify-end gap-2 border-t px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
