import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchHistoricalFxRate, fetchLatestFxRate } from './fx'

describe('fx', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('uses the Frankfurter v2 latest rates endpoint', async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ rate: 0.91 }],
    })
    vi.stubGlobal('fetch', fetch)

    await expect(
      fetchLatestFxRate({
        base: 'USD',
        quote: 'EUR',
      }),
    ).resolves.toBe(0.91)

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenCalledWith(
      new URL('https://api.frankfurter.dev/v2/rates?base=USD&quotes=EUR'),
      { signal: undefined },
    )
  })

  it('uses the Frankfurter v2 historical date query parameter', async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ rate: 0.90755 }],
    })
    vi.stubGlobal('fetch', fetch)

    await expect(
      fetchHistoricalFxRate({
        base: 'USD',
        date: '2024-01-02',
        quote: 'EUR',
      }),
    ).resolves.toBe(0.90755)

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenCalledWith(
      new URL(
        'https://api.frankfurter.dev/v2/rates?base=USD&quotes=EUR&date=2024-01-02',
      ),
      { signal: undefined },
    )
  })
})
