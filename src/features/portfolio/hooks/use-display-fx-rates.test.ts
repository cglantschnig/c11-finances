import { describe, expect, it } from 'vitest'
import {
  getDisplayFxBaseCurrenciesKey,
  normalizeDisplayFxBaseCurrencies,
} from './use-display-fx-rates'

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

  it('builds a stable key for equivalent currency requests', () => {
    expect(getDisplayFxBaseCurrenciesKey(['USD', 'GBP', 'USD'])).toBe('GBP|USD')
    expect(getDisplayFxBaseCurrenciesKey(['GBP', 'USD'])).toBe('GBP|USD')
    expect(getDisplayFxBaseCurrenciesKey([])).toBe('')
    expect(getDisplayFxBaseCurrenciesKey(null)).toBeNull()
  })
})
