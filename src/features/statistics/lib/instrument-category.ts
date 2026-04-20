import listingStatusCsv from '../../../../data/listing_status.csv?raw'

export type PortfolioInstrumentCategory = 'stock' | 'etf' | 'crypto' | 'cash'

const listingTypeBySymbol = new Map<string, 'Stock' | 'ETF'>(
  listingStatusCsv
    .split(/\r?\n/)
    .slice(1)
    .flatMap((line) => {
      const trimmedLine = line.trim()

      if (!trimmedLine) {
        return []
      }

      const [rawSymbol, , , rawAssetType] = trimmedLine.split(',', 4)
      const symbol = rawSymbol?.trim().toUpperCase()
      const assetType = rawAssetType?.trim()

      if (!symbol || (assetType !== 'Stock' && assetType !== 'ETF')) {
        return []
      }

      return [[symbol, assetType] as const]
    }),
)

export function resolvePortfolioInstrumentCategory(options: {
  assetType: 'equity' | 'crypto'
  ticker: string
}): Exclude<PortfolioInstrumentCategory, 'cash'> {
  const normalizedTicker = options.ticker.trim().toUpperCase()

  if (options.assetType === 'crypto') {
    return 'crypto'
  }

  return listingTypeBySymbol.get(normalizedTicker) === 'ETF' ? 'etf' : 'stock'
}
