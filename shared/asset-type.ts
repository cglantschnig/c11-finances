import type { AssetType } from './portfolio'
import { COMMON_CRYPTO_TICKERS } from './crypto-assets'

export function resolveAssetTypeForPricing(
  assetType: AssetType,
  ticker: string,
): AssetType {
  const normalizedTicker = ticker.trim().toUpperCase()

  if (assetType === 'crypto' || COMMON_CRYPTO_TICKERS.has(normalizedTicker)) {
    return 'crypto'
  }

  return 'equity'
}
