import { describe, expect, it } from 'vitest'
import {
  aggregateOpenHoldings,
  avgCostBasis,
  unrealizedPnl,
  unrealizedPnlPct,
} from './portfolio'

describe('portfolio math', () => {
  it('handles a buy-only position', () => {
    const [holding] = aggregateOpenHoldings([
      {
        assetType: 'equity',
        creationTime: 1,
        date: '2026-01-10',
        fxRate: 1,
        nativeCurrency: 'USD',
        pricePerUnit: 100,
        quantity: 10,
        side: 'buy',
        ticker: 'AAPL',
      },
    ])

    expect(avgCostBasis(holding.costBasis, holding.quantity)).toBe(100)
    expect(unrealizedPnl(1200, holding.costBasis)).toBe(200)
    expect(unrealizedPnlPct(1200, holding.costBasis)).toBe(20)
  })

  it('keeps average cost basis correct after partial sells', () => {
    const [holding] = aggregateOpenHoldings([
      {
        assetType: 'equity',
        creationTime: 1,
        date: '2026-01-10',
        fxRate: 1,
        nativeCurrency: 'USD',
        pricePerUnit: 100,
        quantity: 10,
        side: 'buy',
        ticker: 'MSFT',
      },
      {
        assetType: 'equity',
        creationTime: 2,
        date: '2026-01-15',
        fxRate: 1,
        nativeCurrency: 'USD',
        pricePerUnit: 120,
        quantity: 10,
        side: 'buy',
        ticker: 'MSFT',
      },
      {
        assetType: 'equity',
        creationTime: 3,
        date: '2026-01-20',
        fxRate: 1,
        nativeCurrency: 'USD',
        pricePerUnit: 130,
        quantity: 5,
        side: 'sell',
        ticker: 'MSFT',
      },
    ])

    expect(holding.quantity).toBe(15)
    expect(holding.costBasis).toBe(1650)
    expect(holding.avgCostBasis).toBe(110)
    expect(unrealizedPnl(2250, holding.costBasis)).toBe(600)
    expect(unrealizedPnlPct(2250, holding.costBasis)).toBeCloseTo(36.3636, 4)
  })

  it('supports multi-currency cost basis in the home currency', () => {
    const [holding] = aggregateOpenHoldings([
      {
        assetType: 'equity',
        creationTime: 1,
        date: '2026-02-10',
        fxRate: 1.08,
        nativeCurrency: 'EUR',
        pricePerUnit: 80,
        quantity: 4,
        side: 'buy',
        ticker: 'ASML',
      },
    ])

    expect(holding.costBasis).toBeCloseTo(345.6, 6)
    expect(holding.avgCostBasis).toBeCloseTo(86.4, 6)
    expect(unrealizedPnl(400, holding.costBasis)).toBeCloseTo(54.4, 6)
    expect(unrealizedPnlPct(400, holding.costBasis)).toBeCloseTo(15.7407, 4)
  })
})
