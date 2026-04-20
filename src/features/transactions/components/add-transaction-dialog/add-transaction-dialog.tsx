import { IconX } from '@tabler/icons-react'
import type { Doc } from '../../../../../convex/_generated/dataModel'
import { Button } from '#/shared/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '#/shared/ui/dialog'
import { Input } from '#/shared/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/shared/ui/select'
import AssetAutocompleteInput from './asset-autocomplete-input'
import Field from './field'
import SideToggle from './side-toggle'
import { useAddTransactionForm } from './use-add-transaction-form'

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
  const {
    assetAutocompleteOptions,
    canSubmit,
    error,
    form,
    handleAssetInputChange,
    handleAssetOptionSelect,
    handleSubmit,
    highlightedAssetIndex,
    isAssetInputFocused,
    isAssetMenuOpen,
    isSaving,
    setForm,
    setHighlightedAssetIndex,
    setIsAssetInputFocused,
    setIsAssetMenuOpen,
    transactionCurrencyOptions,
  } = useAddTransactionForm(open, onOpenChange, portfolio)

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
            <input type="hidden" name="asset-name" value={form.assetName} />
            <input type="hidden" name="asset-type" value={form.assetType} />

            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2.5">
              <Field label="Asset">
                <AssetAutocompleteInput
                  assetAutocompleteOptions={assetAutocompleteOptions}
                  assetName={form.assetName}
                  highlightedAssetIndex={highlightedAssetIndex}
                  isAssetInputFocused={isAssetInputFocused}
                  isAssetMenuOpen={isAssetMenuOpen}
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
                  onFocus={() => {
                    setIsAssetInputFocused(true)
                    setIsAssetMenuOpen(true)
                  }}
                  onHighlightChange={setHighlightedAssetIndex}
                  onInputChange={handleAssetInputChange}
                  onMenuOpenChange={setIsAssetMenuOpen}
                  onSelect={handleAssetOptionSelect}
                  ticker={form.ticker}
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
                    Saved in {portfolio.homeCurrency} using the historical FX rate
                    for {form.date}.
                  </p>
                ) : null}
              </Field>
            </div>

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
