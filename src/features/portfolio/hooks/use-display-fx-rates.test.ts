import { describe, expect, it } from 'vitest'
import { normalizeDisplayFxBaseCurrencies } from './use-display-fx-rates'

describe('normalizeDisplayFxBaseCurrencies', () => {
  it('deduplicates and stabilizes equivalent currency lists', () => {
    expect(normalizeDisplayFxBaseCurrencies(['USD', 'GBP', 'USD'])).toEqual([
      'GBP',
      'USD',
    ])
    expect(normalizeDisplayFxBaseCurrencies(['GBP', 'USD'])).toEqual([
      'GBP',
      'USD',
    ])
    expect(normalizeDisplayFxBaseCurrencies(null)).toBeNull()
  })
})
