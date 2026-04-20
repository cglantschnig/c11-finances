import { auth } from '@clerk/tanstack-react-start/server'
import { createServerFn } from '@tanstack/react-start'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { resolveAssetTypeForPricing } from '../../../shared/asset-type'
import { getCoinGeckoIdForTicker } from '../../../shared/crypto-assets'

class AlphaVantageError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AlphaVantageError'
  }
}

class CoinGeckoError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CoinGeckoError'
  }
}

function getConvexUrl() {
  const url = process.env.VITE_CONVEX_URL
  if (!url) {
    throw new Error('Missing VITE_CONVEX_URL.')
  }
  return url
}

function getAlphaVantageApiKey() {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY
  if (!apiKey) {
    throw new Error('Missing ALPHA_VANTAGE_API_KEY.')
  }
  return apiKey
}

async function getConvexToken() {
  const authState = await auth()
  if (!authState.isAuthenticated) {
    throw new Error('You must be signed in.')
  }

  if (authState.sessionClaims?.aud === 'convex') {
    return await authState.getToken()
  }

  return await authState.getToken({ template: 'convex' })
}

async function fetchAlphaVantage(url: URL) {
  const response = await fetch(url, { cache: 'no-store' })
  if (!response.ok) {
    throw new AlphaVantageError(
      `Alpha Vantage request failed with ${response.status}.`,
    )
  }

  const payload = (await response.json()) as Record<string, unknown>
  const errorMessage =
    (typeof payload['Error Message'] === 'string' && payload['Error Message']) ||
    (typeof payload.Information === 'string' && payload.Information) ||
    (typeof payload.Note === 'string' && payload.Note)

  if (errorMessage) {
    throw new AlphaVantageError(errorMessage)
  }

  return payload
}

async function fetchCoinGecko(url: URL) {
  const response = await fetch(url, { cache: 'no-store' })
  if (!response.ok) {
    throw new CoinGeckoError(
      `CoinGecko request failed with ${response.status}.`,
    )
  }

  const payload = (await response.json()) as Record<string, unknown>
  const status = payload.status

  if (
    status &&
    typeof status === 'object' &&
    typeof (status as Record<string, unknown>).error_message === 'string'
  ) {
    throw new CoinGeckoError(
      (status as Record<string, string>).error_message,
    )
  }

  return payload
}

async function fetchEquityPrice(ticker: string) {
  const url = new URL('https://www.alphavantage.co/query')
  url.searchParams.set('function', 'GLOBAL_QUOTE')
  url.searchParams.set('symbol', ticker)
  url.searchParams.set('apikey', getAlphaVantageApiKey())

  const payload = await fetchAlphaVantage(url)
  const quote = payload['Global Quote']

  if (!quote || typeof quote !== 'object') {
    throw new Error(`No equity quote returned for ${ticker}.`)
  }

  const price = Number((quote as Record<string, unknown>)['05. price'])
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error(`Invalid equity price returned for ${ticker}.`)
  }

  return price
}

async function fetchCryptoPrice(ticker: string, currency: string) {
  const normalizedTicker = ticker.trim().toUpperCase()
  const normalizedCurrency = currency.trim().toLowerCase()
  const coinGeckoId = getCoinGeckoIdForTicker(normalizedTicker)
  const payloadKey = coinGeckoId ?? normalizedTicker.toLowerCase()
  const url = new URL('https://api.coingecko.com/api/v3/simple/price')

  if (coinGeckoId) {
    url.searchParams.set('ids', coinGeckoId)
  } else {
    url.searchParams.set('symbols', normalizedTicker.toLowerCase())
    url.searchParams.set('include_tokens', 'top')
  }

  url.searchParams.set('vs_currencies', normalizedCurrency)

  const payload = await fetchCoinGecko(url)
  const ratePayload = payload[payloadKey]

  if (!ratePayload || typeof ratePayload !== 'object') {
    throw new Error(`No crypto quote returned for ${ticker}.`)
  }

  const price = Number(
    (ratePayload as Record<string, unknown>)[normalizedCurrency],
  )
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error(`Invalid crypto price returned for ${ticker}.`)
  }

  return price
}

async function fetchFxRate(fromCurrency: string, toCurrency: string) {
  if (fromCurrency === toCurrency) {
    return 1
  }

  const url = new URL('https://api.frankfurter.dev/v1/latest')
  url.searchParams.set('base', fromCurrency)
  url.searchParams.set('symbols', toCurrency)

  const response = await fetch(url, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`FX request failed with ${response.status}.`)
  }

  const payload = (await response.json()) as {
    rates?: Record<string, number>
  }
  const rate = payload.rates?.[toCurrency]

  if (!Number.isFinite(rate) || !rate || rate <= 0) {
    throw new Error(`No FX rate returned for ${fromCurrency}/${toCurrency}.`)
  }

  return rate
}

export const refreshHoldings = createServerFn({ method: 'POST' })
  .inputValidator((data: { portfolioId: Id<'portfolios'> }) => data)
  .handler(async ({ data }) => {
    const token = await getConvexToken()
    if (!token) {
      throw new Error('Unable to authenticate Convex request.')
    }

    const convex = new ConvexHttpClient(getConvexUrl())
    convex.setAuth(token)

    const snapshot = await convex.query(api.queries.getCachedHoldings, {
      portfolioId: data.portfolioId,
    })

    if (!snapshot) {
      throw new Error('Portfolio not found.')
    }

    if (
      !snapshot.hasOpenPositions ||
      !snapshot.requiresRefresh
    ) {
      return snapshot
    }

    for (const item of snapshot.items) {
      if (item.cacheStatus === 'fresh' && !item.needsPriceRefresh) {
        continue
      }

      try {
        const pricingAssetType = resolveAssetTypeForPricing(
          item.assetType,
          item.ticker,
        )
        const currentPrice =
          pricingAssetType === 'crypto'
            ? await fetchCryptoPrice(item.ticker, snapshot.portfolio.homeCurrency)
            : (await fetchEquityPrice(item.ticker)) *
              (await fetchFxRate(
                item.nativeCurrency,
                snapshot.portfolio.homeCurrency,
              ))

        await convex.mutation(api.mutations.upsertPriceCache, {
          fetchedAt: Date.now(),
          portfolioId: data.portfolioId,
          price: currentPrice,
          ticker: item.ticker,
        })
      } catch (error) {
        if (
          error instanceof AlphaVantageError ||
          error instanceof CoinGeckoError
        ) {
          console.error('External price refresh failed', {
            assetType: item.assetType,
            portfolioId: data.portfolioId,
            ticker: item.ticker,
            provider:
              error instanceof AlphaVantageError ? 'alpha-vantage' : 'coingecko',
            message: error.message,
          })

          if (item.currentPrice === null || item.fetchedAt === null) {
            throw new Error('Unable to refresh prices right now.', { cause: error })
          }

          continue
        }

        if (item.currentPrice === null || item.fetchedAt === null) {
          throw error
        }
      }
    }

    const refreshed = await convex.query(api.queries.getCachedHoldings, {
      portfolioId: data.portfolioId,
    })

    if (!refreshed) {
      throw new Error('Portfolio not found.')
    }

    return refreshed
  })
