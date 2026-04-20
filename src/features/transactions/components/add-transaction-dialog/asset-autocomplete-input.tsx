import { cn } from '#/shared/lib/utils'
import { Input } from '#/shared/ui/input'
import type { AssetAutocompleteOption } from '#/features/transactions/lib/asset-autocomplete'

type AssetAutocompleteInputProps = {
  assetAutocompleteOptions: AssetAutocompleteOption[]
  assetName: string
  highlightedAssetIndex: number
  isAssetInputFocused: boolean
  isAssetMenuOpen: boolean
  onBlur: (event: React.FocusEvent<HTMLDivElement>) => void
  onFocus: () => void
  onHighlightChange: (index: number) => void
  onInputChange: (value: string) => void
  onMenuOpenChange: (open: boolean) => void
  onSelect: (option: AssetAutocompleteOption) => void
  ticker: string
}

export default function AssetAutocompleteInput({
  assetAutocompleteOptions,
  assetName,
  highlightedAssetIndex,
  isAssetInputFocused,
  isAssetMenuOpen,
  onBlur,
  onFocus,
  onHighlightChange,
  onInputChange,
  onMenuOpenChange,
  onSelect,
  ticker,
}: AssetAutocompleteInputProps) {
  const shouldShowAssetMenu = isAssetMenuOpen && ticker.trim().length > 0

  return (
    <div className="relative" onBlur={onBlur}>
      <Input
        value={ticker}
        onFocus={onFocus}
        onChange={(event) => {
          onInputChange(event.target.value.toUpperCase())
          onMenuOpenChange(true)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            onMenuOpenChange(false)
            return
          }

          if (assetAutocompleteOptions.length === 0) {
            return
          }

          if (event.key === 'ArrowDown') {
            event.preventDefault()
            onMenuOpenChange(true)
            onHighlightChange(
              highlightedAssetIndex === assetAutocompleteOptions.length - 1
                ? 0
                : highlightedAssetIndex + 1,
            )
          }

          if (event.key === 'ArrowUp') {
            event.preventDefault()
            onMenuOpenChange(true)
            onHighlightChange(
              highlightedAssetIndex === 0
                ? assetAutocompleteOptions.length - 1
                : highlightedAssetIndex - 1,
            )
          }

          if (event.key === 'Enter' && shouldShowAssetMenu) {
            const selectedOption = assetAutocompleteOptions[highlightedAssetIndex]
            if (selectedOption) {
              event.preventDefault()
              onSelect(selectedOption)
            }
          }
        }}
        placeholder="AAPL or Bitcoin"
        autoComplete="off"
        className={cn(
          'h-9 font-semibold uppercase',
          assetName &&
            !isAssetInputFocused &&
            'text-transparent selection:bg-transparent',
        )}
      />

      {assetName && !isAssetInputFocused ? (
        <div className="pointer-events-none absolute inset-0 flex items-center px-2.5">
          <span className="font-semibold uppercase text-foreground">{ticker}</span>
          <span className="relative top-px ml-2 truncate text-xs font-medium normal-case text-muted-foreground">
            {assetName}.
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
                  onMouseEnter={() => onHighlightChange(index)}
                  onClick={() => onSelect(option)}
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
  )
}
