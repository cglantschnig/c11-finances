import { describe, expect, it, vi } from 'vitest'
import { resolveTransactionFxRate } from './resolve-transaction-fx'

describe('resolveTransactionFxRate', () => {
  it('returns 1 when the trade currency matches the portfolio home currency', async () => {
    const fetchRate = vi.fn()

    await expect(
      resolveTransactionFxRate(
        {
          date: '2026-04-20',
          homeCurrency: 'USD',
          nativeCurrency: 'USD',
        },
        fetchRate as never,
      ),
    ).resolves.toBe(1)

    expect(fetchRate).not.toHaveBeenCalled()
  })

  it('fetches the historical rate from trade currency into home currency', async () => {
    const fetchRate = vi.fn().mockResolvedValue(0.91)

    await expect(
      resolveTransactionFxRate(
        {
          date: '2026-04-20',
          homeCurrency: 'EUR',
          nativeCurrency: 'USD',
        },
        fetchRate,
      ),
    ).resolves.toBe(0.91)

    expect(fetchRate).toHaveBeenCalledWith({
      base: 'USD',
      date: '2026-04-20',
      quote: 'EUR',
      signal: undefined,
    })
  })
})
