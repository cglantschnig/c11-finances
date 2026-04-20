export type CommonCryptoAsset = {
  coinGeckoId: string
  name: string
  symbol: string
}

export const COMMON_CRYPTO_ASSETS: CommonCryptoAsset[] = [
  { symbol: 'AAVE', name: 'Aave', coinGeckoId: 'aave' },
  { symbol: 'ADA', name: 'Cardano', coinGeckoId: 'cardano' },
  { symbol: 'ALGO', name: 'Algorand', coinGeckoId: 'algorand' },
  { symbol: 'APT', name: 'Aptos', coinGeckoId: 'aptos' },
  { symbol: 'ARB', name: 'Arbitrum', coinGeckoId: 'arbitrum' },
  { symbol: 'ATOM', name: 'Cosmos Hub', coinGeckoId: 'cosmos' },
  { symbol: 'AVAX', name: 'Avalanche', coinGeckoId: 'avalanche-2' },
  { symbol: 'BCH', name: 'Bitcoin Cash', coinGeckoId: 'bitcoin-cash' },
  { symbol: 'BNB', name: 'BNB', coinGeckoId: 'binancecoin' },
  { symbol: 'BTC', name: 'Bitcoin', coinGeckoId: 'bitcoin' },
  { symbol: 'DOGE', name: 'Dogecoin', coinGeckoId: 'dogecoin' },
  { symbol: 'DOT', name: 'Polkadot', coinGeckoId: 'polkadot' },
  { symbol: 'ETC', name: 'Ethereum Classic', coinGeckoId: 'ethereum-classic' },
  { symbol: 'ETH', name: 'Ethereum', coinGeckoId: 'ethereum' },
  { symbol: 'FIL', name: 'Filecoin', coinGeckoId: 'filecoin' },
  { symbol: 'HBAR', name: 'Hedera', coinGeckoId: 'hedera-hashgraph' },
  { symbol: 'ICP', name: 'Internet Computer', coinGeckoId: 'internet-computer' },
  { symbol: 'LINK', name: 'Chainlink', coinGeckoId: 'chainlink' },
  { symbol: 'LTC', name: 'Litecoin', coinGeckoId: 'litecoin' },
  { symbol: 'MATIC', name: 'Polygon', coinGeckoId: 'matic-network' },
  { symbol: 'NEAR', name: 'NEAR Protocol', coinGeckoId: 'near' },
  { symbol: 'OP', name: 'Optimism', coinGeckoId: 'optimism' },
  { symbol: 'PEPE', name: 'Pepe', coinGeckoId: 'pepe' },
  { symbol: 'SHIB', name: 'Shiba Inu', coinGeckoId: 'shiba-inu' },
  { symbol: 'SOL', name: 'Solana', coinGeckoId: 'solana' },
  { symbol: 'SUI', name: 'Sui', coinGeckoId: 'sui' },
  { symbol: 'TON', name: 'Toncoin', coinGeckoId: 'the-open-network' },
  { symbol: 'TRX', name: 'TRON', coinGeckoId: 'tron' },
  { symbol: 'UNI', name: 'Uniswap', coinGeckoId: 'uniswap' },
  { symbol: 'USDC', name: 'USD Coin', coinGeckoId: 'usd-coin' },
  { symbol: 'USDT', name: 'Tether', coinGeckoId: 'tether' },
  { symbol: 'VET', name: 'VeChain', coinGeckoId: 'vechain' },
  { symbol: 'XLM', name: 'Stellar', coinGeckoId: 'stellar' },
  { symbol: 'XRP', name: 'XRP', coinGeckoId: 'ripple' },
]

const commonCryptoAssetByTicker = new Map(
  COMMON_CRYPTO_ASSETS.map((asset) => [asset.symbol, asset]),
)

export const COMMON_CRYPTO_TICKERS = new Set(commonCryptoAssetByTicker.keys())

export function getCommonCryptoAsset(
  ticker: string,
): CommonCryptoAsset | null {
  const normalizedTicker = ticker.trim().toUpperCase()
  return commonCryptoAssetByTicker.get(normalizedTicker) ?? null
}

export function getCoinGeckoIdForTicker(ticker: string): string | null {
  return getCommonCryptoAsset(ticker)?.coinGeckoId ?? null
}
