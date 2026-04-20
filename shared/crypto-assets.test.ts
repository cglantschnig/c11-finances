import { describe, expect, it } from 'vitest'
import {
  COMMON_CRYPTO_TICKERS,
  getCoinGeckoIdForTicker,
} from './crypto-assets'

describe('crypto-assets', () => {
  it('resolves exact CoinGecko ids for common app tickers', () => {
    expect(getCoinGeckoIdForTicker('btc')).toBe('bitcoin')
    expect(getCoinGeckoIdForTicker('TON')).toBe('the-open-network')
    expect(getCoinGeckoIdForTicker('matic')).toBe('matic-network')
  })

  it('tracks the shared common crypto ticker set', () => {
    expect(COMMON_CRYPTO_TICKERS.has('USDT')).toBe(true)
    expect(COMMON_CRYPTO_TICKERS.has('HBAR')).toBe(true)
    expect(COMMON_CRYPTO_TICKERS.has('AAPL')).toBe(false)
  })

  it('returns null for unknown tickers', () => {
    expect(getCoinGeckoIdForTicker('AAPL')).toBeNull()
  })
})
