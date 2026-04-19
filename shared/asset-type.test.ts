import { describe, expect, it } from 'vitest'
import { resolveAssetTypeForPricing } from './asset-type'

describe('resolveAssetTypeForPricing', () => {
  it('preserves explicit crypto asset types', () => {
    expect(resolveAssetTypeForPricing('crypto', 'BTC')).toBe('crypto')
  })

  it('treats common crypto tickers as crypto for legacy pricing data', () => {
    expect(resolveAssetTypeForPricing('equity', 'BTC')).toBe('crypto')
    expect(resolveAssetTypeForPricing('equity', 'eth')).toBe('crypto')
  })

  it('keeps non-crypto tickers as equities', () => {
    expect(resolveAssetTypeForPricing('equity', 'AAPL')).toBe('equity')
  })
})
