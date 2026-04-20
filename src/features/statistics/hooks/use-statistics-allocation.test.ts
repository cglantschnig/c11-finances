import { describe, expect, it } from 'vitest'
import { buildStatisticsAllocationData } from './use-statistics-allocation'

describe('buildStatisticsAllocationData', () => {
  it('builds tracked totals and category allocations in the home currency', () => {
    const result = buildStatisticsAllocationData({
      displayFxError: null,
      displayFxRate: 1,
      homeCurrency: 'USD',
      selectedDisplayCurrency: 'USD',
      snapshot: {
        hasTransactions: true,
        items: [
          {
            assetType: 'equity',
            ticker: 'AAPL',
            value: 60,
          },
          {
            assetType: 'crypto',
            ticker: 'BTC',
            value: 40,
          },
        ],
      } as Parameters<typeof buildStatisticsAllocationData>[0]['snapshot'],
    })

    expect(result.holdingsDisplayCurrency).toBe('USD')
    expect(result.totalTrackedValue).toBe(100)
    expect(result.pricedCoverageText).toBe('2 of 2 positions priced')
    expect(result.assetAllocationData).toEqual([
      { color: '#0f766e', label: 'AAPL', value: 60 },
      { color: '#1d4ed8', label: 'BTC', value: 40 },
    ])
    expect(result.assetTypeData).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'Stocks', value: 60 }),
        expect.objectContaining({ label: 'Crypto', value: 40 }),
      ]),
    )
  })

  it('converts tracked values into the selected display currency', () => {
    const result = buildStatisticsAllocationData({
      displayFxError: null,
      displayFxRate: 0.5,
      homeCurrency: 'USD',
      selectedDisplayCurrency: 'EUR',
      snapshot: {
        hasTransactions: true,
        items: [
          {
            assetType: 'equity',
            ticker: 'AAPL',
            value: 60,
          },
          {
            assetType: 'crypto',
            ticker: 'BTC',
            value: 40,
          },
        ],
      } as Parameters<typeof buildStatisticsAllocationData>[0]['snapshot'],
    })

    expect(result.holdingsDisplayCurrency).toBe('EUR')
    expect(result.totalTrackedValue).toBe(50)
    expect(result.assetAllocationData[0]).toEqual({
      color: '#0f766e',
      label: 'AAPL',
      value: 30,
    })
    expect(result.assetAllocationData[1]).toEqual({
      color: '#1d4ed8',
      label: 'BTC',
      value: 20,
    })
  })

  it('keeps the tracked total in the home currency while display FX is still loading', () => {
    const result = buildStatisticsAllocationData({
      displayFxError: null,
      displayFxRate: null,
      homeCurrency: 'USD',
      selectedDisplayCurrency: 'EUR',
      snapshot: {
        hasTransactions: true,
        items: [
          {
            assetType: 'equity',
            ticker: 'AAPL',
            value: 60,
          },
          {
            assetType: 'crypto',
            ticker: 'BTC',
            value: 40,
          },
        ],
      } as Parameters<typeof buildStatisticsAllocationData>[0]['snapshot'],
    })

    expect(result.holdingsDisplayCurrency).toBe('USD')
    expect(result.totalTrackedValue).toBe(100)
    expect(result.assetAllocationData).toEqual([
      { color: '#0f766e', label: 'AAPL', value: 60 },
      { color: '#1d4ed8', label: 'BTC', value: 40 },
    ])
  })
})
