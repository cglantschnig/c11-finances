import { describe, expect, it } from 'vitest'
import { buildDashboardDisplayMetrics } from './use-dashboard-display-metrics'

describe('buildDashboardDisplayMetrics', () => {
  it('uses snapshot values directly when no display FX conversion is needed', () => {
    const result = buildDashboardDisplayMetrics({
      displayFxError: null,
      displayFxRates: {},
      portfolioHomeCurrency: 'USD',
      selectedDisplayCurrency: 'USD',
      snapshot: {
        anyStale: false,
        hasTransactions: true,
        items: [
          {
            avgCostBasis: 8,
            cacheStatus: 'fresh',
            currentPrice: 10,
            fetchedAt: 1,
            nativeCurrency: 'USD',
            pnl: 20,
            pnlPct: 25,
            quantity: 10,
            ticker: 'AAPL',
            value: 100,
          },
        ],
        totalPnl: 20,
        totalValue: 100,
      } as Parameters<typeof buildDashboardDisplayMetrics>[0]['snapshot'],
      transactions: [
        {
          _creationTime: 1,
          assetType: 'equity',
          date: '2026-04-20',
          fxRate: 1,
          nativeCurrency: 'USD',
          pricePerUnit: 8,
          quantity: 10,
          side: 'buy',
          ticker: 'AAPL',
        },
      ] as Parameters<typeof buildDashboardDisplayMetrics>[0]['transactions'],
    })

    expect(result.holdingsDisplayCurrency).toBe('USD')
    expect(result.displayedTotalValue).toBe(100)
    expect(result.totalPnlPct).toBe(25)
    expect(result.rows).toEqual([
      {
        avgCostBasis: 8,
        cacheStatus: 'fresh',
        currentPrice: 10,
        currentValue: 100,
        pnlIsPositive: true,
        pnlPct: 25,
        quantity: 10,
        ticker: 'AAPL',
      },
    ])
  })

  it('recomputes cost basis in the selected display currency when FX rates are available', () => {
    const result = buildDashboardDisplayMetrics({
      displayFxError: null,
      displayFxRates: {
        GBP: 2,
        USD: 0.5,
      },
      portfolioHomeCurrency: 'USD',
      selectedDisplayCurrency: 'EUR',
      snapshot: {
        anyStale: false,
        hasTransactions: true,
        items: [
          {
            avgCostBasis: 8,
            cacheStatus: 'stale',
            currentPrice: 10,
            fetchedAt: 1,
            nativeCurrency: 'USD',
            pnl: 20,
            pnlPct: 25,
            quantity: 10,
            ticker: 'AAPL',
            value: 100,
          },
        ],
        totalPnl: 20,
        totalValue: 100,
      } as Parameters<typeof buildDashboardDisplayMetrics>[0]['snapshot'],
      transactions: [
        {
          _creationTime: 1,
          assetType: 'equity',
          date: '2026-04-20',
          fxRate: 1,
          nativeCurrency: 'GBP',
          pricePerUnit: 4,
          quantity: 10,
          side: 'buy',
          ticker: 'AAPL',
        },
      ] as Parameters<typeof buildDashboardDisplayMetrics>[0]['transactions'],
    })

    expect(result.holdingsDisplayCurrency).toBe('EUR')
    expect(result.displayedTotalValue).toBe(50)
    expect(result.rows[0]).toMatchObject({
      avgCostBasis: 8,
      cacheStatus: 'stale',
      currentPrice: 5,
      currentValue: 50,
      pnlIsPositive: false,
      quantity: 10,
      ticker: 'AAPL',
    })
    expect(result.rows[0]?.pnlPct).toBeCloseTo(-37.5, 5)
  })
})
