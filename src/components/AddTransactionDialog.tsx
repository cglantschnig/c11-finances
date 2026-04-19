import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useMutation } from 'convex/react'
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
      <DialogContent className="max-w-2xl rounded-[1.75rem] border border-border/80 bg-[linear-gradient(180deg,hsl(var(--card)),hsl(var(--card)/0.94))] p-0">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="px-6 pt-6 md:px-8 md:pt-8">
            <p className="eyebrow">Portfolio</p>
            <DialogTitle className="text-2xl text-foreground">
              Add transaction
            </DialogTitle>
            <DialogDescription className="leading-6">
              Include any fees in the price per unit.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 px-6 py-5 md:grid-cols-2 md:px-8">
            <label className="grid gap-2">
              <span className="text-sm text-muted-foreground">Ticker</span>
              <Input
                value={form.ticker}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    ticker: event.target.value.toUpperCase(),
                  }))
                }
                placeholder="AAPL"
                className="h-11 rounded-xl border-border bg-muted/30 uppercase"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm text-muted-foreground">Date</span>
              <Input
                type="date"
                value={form.date}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    date: event.target.value,
                  }))
                }
                className="h-11 rounded-xl border-border bg-muted/30"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm text-muted-foreground">Asset type</span>
              <Select
                value={form.assetType}
                onValueChange={(value: 'equity' | 'crypto') =>
                  setForm((current) => ({ ...current, assetType: value }))
                }
              >
                <SelectTrigger className="h-11 w-full rounded-xl border-border bg-muted/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equity">Equity</SelectItem>
                  <SelectItem value="crypto">Crypto</SelectItem>
                </SelectContent>
              </Select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm text-muted-foreground">Type</span>
              <Select
                value={form.side}
                onValueChange={(value: 'buy' | 'sell') =>
                  setForm((current) => ({ ...current, side: value }))
                }
              >
                <SelectTrigger className="h-11 w-full rounded-xl border-border bg-muted/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">Buy</SelectItem>
                  <SelectItem value="sell">Sell</SelectItem>
                </SelectContent>
              </Select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm text-muted-foreground">Quantity</span>
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
                className="h-11 rounded-xl border-border bg-muted/30"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm text-muted-foreground">Price per unit</span>
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
                className="h-11 rounded-xl border-border bg-muted/30"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm text-muted-foreground">Native currency</span>
              <Select
                value={form.nativeCurrency}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    nativeCurrency: value,
                  }))
                }
              >
                <SelectTrigger className="h-11 w-full rounded-xl border-border bg-muted/30">
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
            </label>

            <div className="grid gap-2">
              <span className="text-sm text-muted-foreground">Home currency</span>
              <div className="flex h-11 items-center rounded-xl border border-border bg-muted/20 px-3 text-sm text-foreground">
                {portfolio.homeCurrency}
              </div>
            </div>

            {form.nativeCurrency === 'OTHER' && (
              <label className="grid gap-2 md:col-span-2">
                <span className="text-sm text-muted-foreground">
                  ISO 4217 currency code
                </span>
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
                  className="h-11 rounded-xl border-border bg-muted/30 uppercase"
                />
              </label>
            )}

            {showFxField && (
              <label className="grid gap-2 md:col-span-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-muted-foreground">FX rate</span>
                  <span className="text-xs text-muted-foreground">
                    {isFetchingFx
                      ? 'Fetching rate...'
                      : `${resolvedNativeCurrency} → ${portfolio.homeCurrency}`}
                  </span>
                </div>
                <Input
                  inputMode="decimal"
                  value={form.fxRate}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      fxRate: event.target.value,
                    }))
                  }
                  className="h-11 rounded-xl border-border bg-muted/30"
                />
              </label>
            )}
          </div>

          {error && (
            <p className="px-6 pb-2 text-sm text-destructive md:px-8">{error}</p>
          )}

          <DialogFooter className="rounded-b-[1.75rem] border-border/80 bg-muted/20 px-6 py-4 md:px-8">
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
