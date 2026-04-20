import type { ConvexHttpClient } from 'convex/browser'
import { api } from '../../../convex/_generated/api'
import { fetchLatestFxRate } from '#/lib/fx'
import { getAuthenticatedConvexClient } from '#/lib/server/convex-client.server'

const FX_CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000

function normalizeCurrency(currency: string) {
  return currency.trim().toUpperCase()
}

function isFxCacheStale(lastModifiedAt: number, now: number) {
  return now - lastModifiedAt > FX_CACHE_MAX_AGE_MS
}

export async function getCachedLatestFxRates(options: {
  baseCurrencies: string[]
  convex?: ConvexHttpClient
  quoteCurrency: string
}) {
  const quoteCurrency = normalizeCurrency(options.quoteCurrency)
  const baseCurrencies = [...new Set(options.baseCurrencies.map(normalizeCurrency))]
  const ratesByCurrency: Record<string, number> = {}
  const requestedBaseCurrencies = baseCurrencies.filter(
    (baseCurrency) => baseCurrency !== quoteCurrency,
  )

  for (const baseCurrency of baseCurrencies) {
    if (baseCurrency === quoteCurrency) {
      ratesByCurrency[baseCurrency] = 1
    }
  }

  if (requestedBaseCurrencies.length === 0) {
    return ratesByCurrency
  }

  const convex = options.convex ?? (await getAuthenticatedConvexClient())
  const cachedRates = await convex.query(api.queries.getCachedFxRates, {
    baseCurrencies: requestedBaseCurrencies,
    quoteCurrency,
  })
  const cachedRatesByCurrency = new Map(
    cachedRates.map((rate) => [rate.baseCurrency, rate]),
  )
  const now = Date.now()
  const staleCurrencies: string[] = []

  for (const baseCurrency of requestedBaseCurrencies) {
    const cachedRate = cachedRatesByCurrency.get(baseCurrency)
    if (cachedRate) {
      ratesByCurrency[baseCurrency] = cachedRate.rate
    }

    if (!cachedRate || isFxCacheStale(cachedRate.lastModifiedAt, now)) {
      staleCurrencies.push(baseCurrency)
    }
  }

  for (const baseCurrency of staleCurrencies) {
    try {
      const rate = await fetchLatestFxRate({
        base: baseCurrency,
        quote: quoteCurrency,
      })
      await convex.mutation(api.mutations.upsertFxCache, {
        baseCurrency,
        lastModifiedAt: Date.now(),
        quoteCurrency,
        rate,
      })
      ratesByCurrency[baseCurrency] = rate
    } catch (error) {
      if (!cachedRatesByCurrency.has(baseCurrency)) {
        throw new Error(`Unable to load FX rate for ${baseCurrency}/${quoteCurrency}.`, {
          cause: error,
        })
      }
    }
  }

  return ratesByCurrency
}
