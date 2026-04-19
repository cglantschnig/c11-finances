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
        className="max-w-xl rounded-[1.75rem] border border-border/80 bg-[linear-gradient(180deg,hsl(var(--card)),hsl(var(--card)/0.94))] p-0 shadow-2xl"
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
        showCloseButton={false}
      >
        <DialogHeader className="px-6 pt-6 md:px-8 md:pt-8">
          <p className="eyebrow">Welcome</p>
          <DialogTitle className="text-2xl text-foreground md:text-3xl">
            Choose your home currency
          </DialogTitle>
          <DialogDescription className="max-w-lg leading-6">
            Choose your home currency — your returns will be calculated in this
            currency. You can change it in Settings.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 px-6 pb-2 md:grid-cols-2 md:px-8">
          {DEFAULT_OPTIONS.map((currency) => (
            <button
              key={currency}
              type="button"
              onClick={() => setSelectedCurrency(currency)}
              className={`rounded-[1.25rem] border px-4 py-4 text-left transition ${
                selectedCurrency === currency
                  ? 'border-primary/60 bg-primary/12 text-foreground shadow-[0_12px_30px_rgba(99,102,241,0.16)]'
                  : 'border-border bg-muted/35 text-muted-foreground hover:border-primary/40 hover:text-foreground'
              }`}
            >
              <div className="text-sm font-medium">{currency}</div>
              <div className="mt-1 text-xs">Use {currency} for all portfolio returns.</div>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSelectedCurrency('OTHER')}
            className={`rounded-[1.25rem] border px-4 py-4 text-left transition md:col-span-2 ${
              selectedCurrency === 'OTHER'
                ? 'border-primary/60 bg-primary/12 text-foreground shadow-[0_12px_30px_rgba(99,102,241,0.16)]'
                : 'border-border bg-muted/35 text-muted-foreground hover:border-primary/40 hover:text-foreground'
            }`}
          >
            <div className="text-sm font-medium">Other</div>
            <div className="mt-1 text-xs">Enter any ISO 4217 currency code.</div>
          </button>
        </div>

        {selectedCurrency === 'OTHER' && (
          <div className="px-6 md:px-8">
            <Input
              aria-label="Home currency"
              maxLength={3}
              value={otherCurrency}
              onChange={(event) =>
                setOtherCurrency(event.target.value.toUpperCase())
              }
              placeholder="CHF"
              className="h-11 rounded-xl border-border bg-muted/30 uppercase"
            />
          </div>
        )}

        {error && (
          <p className="px-6 text-sm text-destructive md:px-8">{error}</p>
        )}

        <DialogFooter className="rounded-b-[1.75rem] border-border/80 bg-muted/20 px-6 py-4 md:px-8">
          <Button
            onClick={() => onCreate(resolvedCurrency)}
            disabled={isSubmitting || resolvedCurrency.length !== 3}
            className="h-10 rounded-xl px-4"
          >
            {isSubmitting ? 'Creating portfolio...' : 'Continue'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
