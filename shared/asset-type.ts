import type { AssetType } from './portfolio'

const COMMON_CRYPTO_TICKERS = new Set([
  'AAVE',
  'ADA',
  'ARB',
  'ATOM',
  'AVAX',
  'BCH',
  'BNB',
  'BTC',
  'DOGE',
  'DOT',
  'ETC',
  'ETH',
  'FIL',
  'ICP',
  'LINK',
  'LTC',
  'MATIC',
  'NEAR',
  'OP',
  'PEPE',
  'SHIB',
  'SOL',
  'SUI',
  'TON',
  'TRX',
  'UNI',
  'VET',
  'XLM',
  'XRP',
])

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
