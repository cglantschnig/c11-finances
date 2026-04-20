import { useMemo, useState } from 'react'
import { IconCheck, IconCurrencyDollar } from '@tabler/icons-react'
import { cn } from '#/shared/lib/utils'
import { Button } from '#/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/shared/ui/dialog'
import { Input } from '#/shared/ui/input'
import { Separator } from '#/shared/ui/separator'

const DEFAULT_OPTIONS = ['EUR', 'USD', 'GBP'] as const

type HomeCurrencyDialogProps = {
  error: string | null
  isSubmitting: boolean
  onCreate: (homeCurrency: string) => Promise<void>
  open: boolean
}

function CurrencyOption({
  active,
  currency,
  description,
  onClick,
}: {
  active: boolean
  currency: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-lg border px-4 py-4 text-left transition-colors',
        active
          ? 'border-primary bg-primary/10 text-foreground'
          : 'border-border bg-muted/35 text-muted-foreground hover:bg-accent hover:text-foreground',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium">{currency}</span>
        {active ? <IconCheck className="size-4 text-primary" /> : null}
      </div>
      <p className="mt-2 text-xs leading-5">{description}</p>
    </button>
  )
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
        className="max-w-2xl gap-0 overflow-hidden p-0 sm:max-w-2xl"
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
        showCloseButton={false}
      >
        <DialogHeader className="px-6 pt-6 pb-5">
          <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <IconCurrencyDollar className="size-5" />
          </div>
          <DialogTitle className="text-2xl sm:text-3xl">
            Choose your home currency
          </DialogTitle>
          <DialogDescription className="max-w-xl leading-6">
            Portfolio value, returns, and pricing summaries will be normalized
            into this currency across the workspace.
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="grid gap-3 px-6 py-6 sm:grid-cols-3">
          {DEFAULT_OPTIONS.map((currency) => (
            <CurrencyOption
              key={currency}
              active={selectedCurrency === currency}
              currency={currency}
              description={`Use ${currency} for all portfolio reporting.`}
              onClick={() => setSelectedCurrency(currency)}
            />
          ))}

          <div className="sm:col-span-3">
            <CurrencyOption
              active={selectedCurrency === 'OTHER'}
              currency="Other"
              description="Enter any valid ISO 4217 currency code."
              onClick={() => setSelectedCurrency('OTHER')}
            />
          </div>

          {selectedCurrency === 'OTHER' ? (
            <div className="sm:col-span-3">
              <Input
                aria-label="Home currency"
                maxLength={3}
                value={otherCurrency}
                onChange={(event) =>
                  setOtherCurrency(event.target.value.toUpperCase())
                }
                placeholder="CHF"
                className="h-10 uppercase"
              />
            </div>
          ) : null}

          {error ? (
            <p className="sm:col-span-3 text-sm text-destructive">{error}</p>
          ) : null}
        </div>

        <DialogFooter className="px-6">
          <div className="mr-auto hidden text-sm text-muted-foreground sm:block">
            You can change this later once settings exist.
          </div>
          <Button
            onClick={() => onCreate(resolvedCurrency)}
            disabled={isSubmitting || resolvedCurrency.length !== 3}
          >
            {isSubmitting ? 'Creating portfolio...' : 'Continue'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
