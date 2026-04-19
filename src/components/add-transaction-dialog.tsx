import { useEffect, useMemo, useState } from 'react'
import { useMutation } from 'convex/react'
import { toast } from 'sonner'
import type { Doc } from '../../convex/_generated/dataModel'
import { api } from '../../convex/_generated/api'
import { COMMON_CURRENCIES, fetchHistoricalFxRate } from '#/lib/fx'
import { todayIsoDate } from '#/lib/format'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Input } from '#/components/ui/input'

function createInitialState(homeCurrency: string) {
  const isCommon = COMMON_CURRENCIES.includes(
    homeCurrency as (typeof COMMON_CURRENCIES)[number],
  )

  return {
    date: todayIsoDate(),
    fxRate: '1',
    nativeCurrency: isCommon ? homeCurrency : 'OTHER',
    nativeCurrencyOther: isCommon ? '' : homeCurrency,
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
      className="h-9 cursor-pointer border px-4 text-[13px] font-semibold tracking-[0.03em] whitespace-nowrap transition-all duration-150"
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
  const [form, setForm] = useState(() => createInitialState(portfolio.homeCurrency))
  const [error, setError] = useState<string | null>(null)
  const [isFetchingFx, setIsFetchingFx] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm(createInitialState(portfolio.homeCurrency))
    setError(null)
  }, [open, portfolio.homeCurrency])

  const resolvedNativeCurrency =
    form.nativeCurrency === 'OTHER'
      ? form.nativeCurrencyOther.trim().toUpperCase()
      : form.nativeCurrency

  useEffect(() => {
    if (!open) return
    if (!resolvedNativeCurrency || form.date.length !== 10) return

    if (resolvedNativeCurrency === portfolio.homeCurrency) {
      setForm((current) => ({ ...current, fxRate: '1' }))
      setIsFetchingFx(false)
      return
    }

    const controller = new AbortController()
    const timeout = window.setTimeout(async () => {
      try {
        setIsFetchingFx(true)
        setError(null)
        const rate = await fetchHistoricalFxRate({
          base: resolvedNativeCurrency,
          date: form.date,
          quote: portfolio.homeCurrency,
          signal: controller.signal,
        })
        setForm((current) => ({ ...current, fxRate: rate.toFixed(6) }))
      } catch (fetchError) {
        if (!controller.signal.aborted) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : 'Unable to fetch the FX rate.',
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsFetchingFx(false)
        }
      }
    }, 350)

    return () => {
      controller.abort()
      window.clearTimeout(timeout)
    }
  }, [form.date, open, portfolio.homeCurrency, resolvedNativeCurrency])

  const showFxField = resolvedNativeCurrency !== portfolio.homeCurrency
  const canSubmit = useMemo(
    () =>
      Boolean(
        form.ticker.trim() &&
          resolvedNativeCurrency.length === 3 &&
          form.quantity &&
          form.pricePerUnit &&
          form.date,
      ),
    [form.date, form.pricePerUnit, form.quantity, form.ticker, resolvedNativeCurrency],
  )

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSaving(true)

    try {
      await addTransaction({
        assetType: 'equity',
        date: form.date,
        fxRate: Number(form.fxRate),
        nativeCurrency: resolvedNativeCurrency,
        portfolioId: portfolio._id,
        pricePerUnit: Number(form.pricePerUnit),
        quantity: Number(form.quantity),
        side: form.side,
        ticker: form.ticker.trim().toUpperCase(),
      })

      toast.success('Transaction added', { duration: 2000 })
      onOpenChange(false)
      setForm(createInitialState(portfolio.homeCurrency))
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
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[400px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="border-b px-6 py-[18px]">
            <DialogTitle className="text-[15px] font-semibold tracking-[-0.01em]">
              Add transaction
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3.5 px-6 py-5">
            {/* Asset + Side */}
            <div className="grid grid-cols-[1fr_auto] items-end gap-2.5">
              <Field label="Asset">
                <Input
                  value={form.ticker}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      ticker: event.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="AAPL"
                  className="h-9 font-semibold uppercase"
                />
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
            <div className="grid grid-cols-2 gap-2.5">
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
                  <select
                    value={form.nativeCurrency}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        nativeCurrency: event.target.value,
                      }))
                    }
                    className="h-9 w-[68px] shrink-0 border border-input bg-transparent px-2 text-[12px] text-muted-foreground focus:outline-none focus:ring-3 focus:ring-ring/50 focus:border-ring"
                  >
                    {COMMON_CURRENCIES.map((currency) => (
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    ))}
                    <option value="OTHER">Other</option>
                  </select>
                </div>
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

            {/* ISO 4217 code — only shown when Other is selected */}
            {form.nativeCurrency === 'OTHER' && (
              <Field label="ISO 4217 code">
                <Input
                  maxLength={3}
                  value={form.nativeCurrencyOther}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      nativeCurrencyOther: event.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="CHF"
                  className="h-9 uppercase"
                />
              </Field>
            )}

            {/* FX rate — only shown when currency differs from home */}
            {showFxField && (
              <Field
                label={
                  isFetchingFx
                    ? 'FX rate · Fetching...'
                    : `FX rate · ${resolvedNativeCurrency} → ${portfolio.homeCurrency}`
                }
              >
                <Input
                  inputMode="decimal"
                  value={form.fxRate}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      fxRate: event.target.value,
                    }))
                  }
                  className="h-9"
                />
              </Field>
            )}
          </div>

          {error ? (
            <p className="px-6 pb-2 text-sm text-destructive">{error}</p>
          ) : null}

          <DialogFooter className="border-t px-6 py-3.5">
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
