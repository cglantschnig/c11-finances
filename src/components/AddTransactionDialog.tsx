import { useEffect, useMemo, useState } from 'react'
import { useMutation } from 'convex/react'
import { toast } from 'sonner'
import {
  IconArrowsExchange,
  IconCalendar,
  IconCoin,
  IconReceipt2,
} from '@tabler/icons-react'
import type { Doc } from '../../convex/_generated/dataModel'
import { api } from '../../convex/_generated/api'
import { COMMON_CURRENCIES, fetchHistoricalFxRate } from '#/lib/fx'
import { todayIsoDate } from '#/lib/format'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Separator } from '#/components/ui/separator'

function createInitialState(homeCurrency: string) {
  const isCommon = COMMON_CURRENCIES.includes(
    homeCurrency as (typeof COMMON_CURRENCIES)[number],
  )

  return {
    assetType: 'equity' as 'equity' | 'crypto',
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
  hint,
  label,
}: {
  children: React.ReactNode
  hint?: string
  label: string
}) {
  return (
    <label className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {hint ? (
          <span className="text-xs text-muted-foreground">{hint}</span>
        ) : null}
      </div>
      {children}
    </label>
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
    if (!open) {
      return
    }

    setForm(createInitialState(portfolio.homeCurrency))
    setError(null)
  }, [open, portfolio.homeCurrency])

  const resolvedNativeCurrency =
    form.nativeCurrency === 'OTHER'
      ? form.nativeCurrencyOther.trim().toUpperCase()
      : form.nativeCurrency

  useEffect(() => {
    if (!open) {
      return
    }

    if (!resolvedNativeCurrency || form.date.length !== 10) {
      return
    }

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
        setForm((current) => ({
          ...current,
          fxRate: rate.toFixed(6),
        }))
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
        assetType: form.assetType,
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
      <DialogContent className="max-w-4xl gap-0 overflow-hidden p-0 sm:max-w-4xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="px-6 pt-6 pb-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-3">
                <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <IconReceipt2 className="size-5" />
                </div>
                <div>
                  <DialogTitle className="text-2xl sm:text-3xl">
                    Add transaction
                  </DialogTitle>
                  <DialogDescription className="mt-2 max-w-2xl leading-6">
                    Record a buy or sell. Include any fees directly in the unit
                    price so cost basis stays accurate.
                  </DialogDescription>
                </div>
              </div>
              <div className="rounded-lg border bg-muted/35 px-4 py-3 text-sm">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  Home currency
                </p>
                <p className="mt-1 font-medium text-foreground">
                  {portfolio.homeCurrency}
                </p>
              </div>
            </div>
          </DialogHeader>

          <Separator />

          <div className="grid gap-6 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Ticker">
                <Input
                  value={form.ticker}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      ticker: event.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="AAPL"
                  className="h-10 uppercase"
                />
              </Field>

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
                  className="h-10"
                />
              </Field>

              <Field label="Asset type">
                <Select
                  value={form.assetType}
                  onValueChange={(value: 'equity' | 'crypto') =>
                    setForm((current) => ({ ...current, assetType: value }))
                  }
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equity">Equity</SelectItem>
                    <SelectItem value="crypto">Crypto</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Side">
                <Select
                  value={form.side}
                  onValueChange={(value: 'buy' | 'sell') =>
                    setForm((current) => ({ ...current, side: value }))
                  }
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buy">Buy</SelectItem>
                    <SelectItem value="sell">Sell</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

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
                  className="h-10"
                />
              </Field>

              <Field label="Price per unit">
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
                  className="h-10"
                />
              </Field>

              <Field label="Native currency">
                <Select
                  value={form.nativeCurrency}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      nativeCurrency: value,
                    }))
                  }
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_CURRENCIES.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Reporting currency">
                <div className="flex h-10 items-center rounded-lg border bg-muted/35 px-3 text-sm text-foreground">
                  {portfolio.homeCurrency}
                </div>
              </Field>

              {form.nativeCurrency === 'OTHER' ? (
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
                    className="h-10 uppercase"
                  />
                </Field>
              ) : null}

              {showFxField ? (
                <Field
                  label="FX rate"
                  hint={
                    isFetchingFx
                      ? 'Fetching rate...'
                      : `${resolvedNativeCurrency} → ${portfolio.homeCurrency}`
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
                    className="h-10"
                  />
                </Field>
              ) : null}
            </div>

            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/35 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <IconCoin className="size-4 text-primary" />
                  Transaction notes
                </div>
                <ul className="mt-3 space-y-3 text-sm leading-6 text-muted-foreground">
                  <li>Use the trade date that should drive the FX lookup.</li>
                  <li>
                    Enter fees directly into the unit price if you want them
                    reflected in average cost.
                  </li>
                  <li>
                    Tickers are stored uppercase to keep holdings grouped
                    cleanly.
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border bg-muted/35 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <IconCalendar className="size-4 text-primary" />
                  Pricing flow
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  When the native currency differs from{' '}
                  {portfolio.homeCurrency}, the dialog fetches a historical FX
                  rate automatically and lets you override it if needed.
                </p>
              </div>

              <div className="rounded-lg border bg-muted/35 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <IconArrowsExchange className="size-4 text-primary" />
                  Current pair
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {resolvedNativeCurrency || '---'} → {portfolio.homeCurrency}
                </p>
              </div>
            </div>
          </div>

          {error ? (
            <p className="px-6 pb-2 text-sm text-destructive">{error}</p>
          ) : null}

          <DialogFooter className="px-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || isSaving}>
              {isSaving ? 'Saving...' : 'Save transaction'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
