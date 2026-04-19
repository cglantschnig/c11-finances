import { useEffect, useMemo, useState } from 'react'
import { IconX } from '@tabler/icons-react'
import { useMutation, useQuery } from 'convex/react'
import { toast } from 'sonner'
import type { Doc } from '../../convex/_generated/dataModel'
import { api } from '../../convex/_generated/api'
import {
  defaultUserCurrency,
  isUserCurrency,
  userCurrencyOptions,
} from '#/config/currencies'
import { todayIsoDate } from '#/lib/format'
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
    assetType: 'equity' as 'equity' | 'crypto',
    date: todayIsoDate(),
    nativeCurrency: isUserCurrency(normalizedCurrency)
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
  const userSettings = useQuery(api.queries.getUserSettings, {})
  const defaultCurrency = userSettings?.currency ?? portfolio.homeCurrency
  const [form, setForm] = useState(() => createInitialState(defaultCurrency))
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm(createInitialState(defaultCurrency))
    setError(null)
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSaving(true)

    try {
      await addTransaction({
        assetType: form.assetType,
        date: form.date,
        fxRate: 1,
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
        className="gap-0 overflow-hidden p-0 sm:max-w-[420px]"
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
            <div className="grid grid-cols-[minmax(0,1fr)_120px_auto] items-end gap-2.5">
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
              <Field label="Type">
                <Select
                  value={form.assetType}
                  onValueChange={(value: 'equity' | 'crypto') =>
                    setForm((current) => ({
                      ...current,
                      assetType: value,
                    }))
                  }
                >
                  <SelectTrigger className="h-9 min-h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equity">Equity</SelectItem>
                    <SelectItem value="crypto">Crypto</SelectItem>
                  </SelectContent>
                </Select>
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
                      {userCurrencyOptions.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
