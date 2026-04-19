import listingStatusCsv from '../../data/listing_status.csv?raw'

export type AssetAutocompleteOption = {
  assetType: 'equity' | 'crypto'
  label: 'stock' | 'crypto'
  name: string
  symbol: string
}

type IndexedAssetAutocompleteOption = AssetAutocompleteOption & {
  nameSearch: string
  symbolSearch: string
}

const commonCryptoAssets: AssetAutocompleteOption[] = [
  { symbol: 'BTC', name: 'Bitcoin', label: 'crypto', assetType: 'crypto' },
  { symbol: 'ETH', name: 'Ethereum', label: 'crypto', assetType: 'crypto' },
  { symbol: 'USDT', name: 'Tether', label: 'crypto', assetType: 'crypto' },
  { symbol: 'BNB', name: 'BNB', label: 'crypto', assetType: 'crypto' },
  { symbol: 'SOL', name: 'Solana', label: 'crypto', assetType: 'crypto' },
  { symbol: 'USDC', name: 'USD Coin', label: 'crypto', assetType: 'crypto' },
  { symbol: 'XRP', name: 'XRP', label: 'crypto', assetType: 'crypto' },
  { symbol: 'DOGE', name: 'Dogecoin', label: 'crypto', assetType: 'crypto' },
  { symbol: 'ADA', name: 'Cardano', label: 'crypto', assetType: 'crypto' },
  { symbol: 'TRX', name: 'TRON', label: 'crypto', assetType: 'crypto' },
  { symbol: 'LINK', name: 'Chainlink', label: 'crypto', assetType: 'crypto' },
  { symbol: 'AVAX', name: 'Avalanche', label: 'crypto', assetType: 'crypto' },
  { symbol: 'DOT', name: 'Polkadot', label: 'crypto', assetType: 'crypto' },
  { symbol: 'TON', name: 'Toncoin', label: 'crypto', assetType: 'crypto' },
  { symbol: 'SHIB', name: 'Shiba Inu', label: 'crypto', assetType: 'crypto' },
  { symbol: 'LTC', name: 'Litecoin', label: 'crypto', assetType: 'crypto' },
  { symbol: 'BCH', name: 'Bitcoin Cash', label: 'crypto', assetType: 'crypto' },
  { symbol: 'UNI', name: 'Uniswap', label: 'crypto', assetType: 'crypto' },
  { symbol: 'XLM', name: 'Stellar', label: 'crypto', assetType: 'crypto' },
  { symbol: 'HBAR', name: 'Hedera', label: 'crypto', assetType: 'crypto' },
  { symbol: 'ATOM', name: 'Cosmos', label: 'crypto', assetType: 'crypto' },
  { symbol: 'NEAR', name: 'NEAR Protocol', label: 'crypto', assetType: 'crypto' },
  { symbol: 'ICP', name: 'Internet Computer', label: 'crypto', assetType: 'crypto' },
  { symbol: 'APT', name: 'Aptos', label: 'crypto', assetType: 'crypto' },
  { symbol: 'FIL', name: 'Filecoin', label: 'crypto', assetType: 'crypto' },
  { symbol: 'ARB', name: 'Arbitrum', label: 'crypto', assetType: 'crypto' },
  { symbol: 'OP', name: 'Optimism', label: 'crypto', assetType: 'crypto' },
  { symbol: 'SUI', name: 'Sui', label: 'crypto', assetType: 'crypto' },
  { symbol: 'MATIC', name: 'Polygon', label: 'crypto', assetType: 'crypto' },
  { symbol: 'ALGO', name: 'Algorand', label: 'crypto', assetType: 'crypto' },
]

function createIndexEntry(
  option: AssetAutocompleteOption,
): IndexedAssetAutocompleteOption {
  return {
    ...option,
    nameSearch: option.name.toLowerCase(),
    symbolSearch: option.symbol.toUpperCase(),
  }
}

function parseListingStatusOptions(): IndexedAssetAutocompleteOption[] {
  return listingStatusCsv
    .split(/\r?\n/)
    .slice(1)
    .flatMap((line) => {
      const trimmedLine = line.trim()

      if (!trimmedLine) {
        return []
      }

      const [rawSymbol, rawName] = trimmedLine.split(',', 3)
      const symbol = rawSymbol?.trim().toUpperCase()
      const name = rawName?.trim()

      if (!symbol || !name) {
        return []
      }

      return [
        createIndexEntry({
          symbol,
          name,
          label: 'stock',
          assetType: 'equity',
        }),
      ]
    })
}

const indexedAutocompleteOptions = [
  ...commonCryptoAssets.map(createIndexEntry),
  ...parseListingStatusOptions(),
]

export function getAssetAutocompleteOptions(
  query: string,
  limit = 10,
): AssetAutocompleteOption[] {
  const trimmedQuery = query.trim()

  if (!trimmedQuery) {
    return []
  }

  const normalizedSymbolQuery = trimmedQuery.toUpperCase()
  const normalizedNameQuery = trimmedQuery.toLowerCase()

  return indexedAutocompleteOptions
    .flatMap((option) => {
      let score = -1

      if (option.symbolSearch === normalizedSymbolQuery) {
        score = 0
      } else if (option.symbolSearch.startsWith(normalizedSymbolQuery)) {
        score = 1
      } else if (option.nameSearch.startsWith(normalizedNameQuery)) {
        score = 2
      } else if (option.symbolSearch.includes(normalizedSymbolQuery)) {
        score = 3
      } else if (option.nameSearch.includes(normalizedNameQuery)) {
        score = 4
      }

      if (score === -1) {
        return []
      }

      return [{ option, score }]
    })
    .sort((left, right) => {
      if (left.score !== right.score) {
        return left.score - right.score
      }

      if (left.option.label !== right.option.label) {
        return left.option.label === 'crypto' ? -1 : 1
      }

      if (left.option.symbol.length !== right.option.symbol.length) {
        return left.option.symbol.length - right.option.symbol.length
      }

      return left.option.symbol.localeCompare(right.option.symbol)
    })
    .slice(0, limit)
    .map(({ option }) => ({
      assetType: option.assetType,
      label: option.label,
      name: option.name,
      symbol: option.symbol,
    }))
}

export function findAssetAutocompleteOption(
  query: string,
): AssetAutocompleteOption | null {
  const trimmedQuery = query.trim()

  if (!trimmedQuery) {
    return null
  }

  const normalizedSymbolQuery = trimmedQuery.toUpperCase()

  const option = indexedAutocompleteOptions.find(
    (candidate) => candidate.symbolSearch === normalizedSymbolQuery,
  )

  if (!option) {
    return null
  }

  return {
    assetType: option.assetType,
    label: option.label,
    name: option.name,
    symbol: option.symbol,
  }
}
