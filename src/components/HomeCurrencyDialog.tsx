import { useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'

const DEFAULT_OPTIONS = ['EUR', 'USD', 'GBP'] as const

type HomeCurrencyDialogProps = {
  error: string | null
  isSubmitting: boolean
  onCreate: (homeCurrency: string) => Promise<void>
  open: boolean
}

export default function HomeCurrencyDialog({
  error,
  isSubmitting,
  onCreate,
  open,
}: HomeCurrencyDialogProps) {
  const [selectedCurrency, setSelectedCurrency] =
    useState<(typeof DEFAULT_OPTIONS)[number] | 'OTHER'>('EUR')
  const [otherCurrency, setOtherCurrency] = useState('')

  const resolvedCurrency = useMemo(
    () =>
      selectedCurrency === 'OTHER'
        ? otherCurrency.trim().toUpperCase()
        : selectedCurrency,
    [otherCurrency, selectedCurrency],
  )

  return (
    <Dialog open={open}>
      <DialogContent
        className="max-w-2xl overflow-hidden rounded-[1.9rem] border border-border bg-[linear-gradient(180deg,hsl(var(--surface-strong)),hsl(var(--surface)))] p-0 shadow-[0_36px_90px_rgba(0,0,0,0.55)]"
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
        showCloseButton={false}
      >
        <DialogHeader className="border-b border-border px-6 pt-6 pb-5 md:px-8 md:pt-8">
          <p className="eyebrow">Welcome</p>
          <DialogTitle className="text-2xl text-foreground md:text-3xl">
            Choose your home currency
          </DialogTitle>
          <DialogDescription className="max-w-lg leading-7">
            Returns and portfolio values will be normalized into this currency.
            You can change it later once settings exist.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 px-6 py-6 md:grid-cols-2 md:px-8">
          {DEFAULT_OPTIONS.map((currency) => (
            <button
              key={currency}
              type="button"
              onClick={() => setSelectedCurrency(currency)}
              className={`rounded-[1.3rem] border px-4 py-4 text-left transition ${
                selectedCurrency === currency
                  ? 'border-primary/40 bg-primary/12 text-foreground shadow-[0_16px_36px_rgba(82,95,255,0.14)]'
                  : 'border-border bg-muted/28 text-muted-foreground hover:border-primary/26 hover:text-foreground'
              }`}
            >
              <div className="text-sm font-semibold">{currency}</div>
              <div className="mt-1 text-xs leading-6">
                Use {currency} for all portfolio reporting.
              </div>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSelectedCurrency('OTHER')}
            className={`rounded-[1.3rem] border px-4 py-4 text-left transition md:col-span-2 ${
              selectedCurrency === 'OTHER'
                ? 'border-primary/40 bg-primary/12 text-foreground shadow-[0_16px_36px_rgba(82,95,255,0.14)]'
                : 'border-border bg-muted/28 text-muted-foreground hover:border-primary/26 hover:text-foreground'
            }`}
          >
            <div className="text-sm font-semibold">Other</div>
            <div className="mt-1 text-xs leading-6">
              Enter any valid ISO 4217 currency code.
            </div>
          </button>
        </div>

        {selectedCurrency === 'OTHER' ? (
          <div className="px-6 pb-2 md:px-8">
            <Input
              aria-label="Home currency"
              maxLength={3}
              value={otherCurrency}
              onChange={(event) =>
                setOtherCurrency(event.target.value.toUpperCase())
              }
              placeholder="CHF"
              className="h-11 uppercase"
            />
          </div>
        ) : null}

        {error ? (
          <p className="px-6 pb-2 text-sm text-destructive md:px-8">{error}</p>
        ) : null}

        <DialogFooter className="rounded-b-[1.9rem] border-border bg-muted/18 px-6 py-4 md:px-8">
          <Button
            onClick={() => onCreate(resolvedCurrency)}
            disabled={isSubmitting || resolvedCurrency.length !== 3}
            size="lg"
            className="h-11 rounded-2xl px-5"
          >
            {isSubmitting ? 'Creating portfolio...' : 'Continue'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
