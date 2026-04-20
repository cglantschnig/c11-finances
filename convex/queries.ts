import { internalQuery, query, type QueryCtx } from './_generated/server'
import { v } from 'convex/values'
import type { Doc, Id } from './_generated/dataModel'
import {
  aggregateOpenHoldings,
  STALE_PRICE_MS,
  unrealizedPnl,
  unrealizedPnlPct,
  type PortfolioTransactionLike,
} from '../shared/portfolio'
import { resolveAssetTypeForPricing } from '../shared/asset-type'

type HoldingSnapshot = {
  assetType: 'equity' | 'crypto'
  avgCostBasis: number
  cacheStatus: 'fresh' | 'missing' | 'stale'
  currentPrice: number | null
  fetchedAt: number | null
  needsPriceRefresh: boolean
  nativeCurrency: string
  pnl: number | null
  pnlPct: number | null
  quantity: number
  ticker: string
  value: number | null
}

const DEFAULT_USER_CURRENCY = 'EUR' as const

function normalizeCurrency(currency: string) {
  return currency.trim().toUpperCase()
}

async function getViewerTokenIdentifier(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity()
  return identity?.tokenIdentifier ?? null
}

async function getOwnedPortfolio(
  ctx: QueryCtx,
  portfolioId: Id<'portfolios'>,
  tokenIdentifier: string,
) {
  const portfolio = await ctx.db.get(portfolioId)
  if (!portfolio || portfolio.userTokenIdentifier !== tokenIdentifier) {
    throw new Error('Portfolio not found.')
  }
  return portfolio
}

function toPortfolioTransaction(
  transaction: Doc<'transactions'>,
): PortfolioTransactionLike {
  return {
    assetType: transaction.assetType,
    creationTime: transaction._creationTime,
    date: transaction.date,
    fxRate: transaction.fxRate,
    nativeCurrency: transaction.nativeCurrency,
    pricePerUnit: transaction.pricePerUnit,
    quantity: transaction.quantity,
    side: transaction.side,
    ticker: transaction.ticker,
  }
}

async function listPortfolioTransactions(
  ctx: QueryCtx,
  portfolioId: Id<'portfolios'>,
) {
  return await ctx.db
    .query('transactions')
    .withIndex('by_portfolio_id_and_date', (query) =>
      query.eq('portfolioId', portfolioId),
    )
    .order('desc')
    .take(500)
}

function buildHoldingSnapshots(
  holdings: ReturnType<typeof aggregateOpenHoldings>,
  cacheEntries: Map<string, Doc<'priceCache'>>,
) {
  const now = Date.now()

  return holdings.map<HoldingSnapshot>((holding) => {
    const cacheEntry = cacheEntries.get(holding.ticker)
    const pricingAssetType = resolveAssetTypeForPricing(
      holding.assetType,
      holding.ticker,
    )
    const currentPrice = cacheEntry?.price ?? null
    const value = currentPrice === null ? null : holding.quantity * currentPrice
    const pnl = value === null ? null : unrealizedPnl(value, holding.costBasis)
    const pnlPct =
      value === null ? null : unrealizedPnlPct(value, holding.costBasis)
    const cacheStatus =
      cacheEntry === undefined
        ? 'missing'
        : now - cacheEntry.fetchedAt > STALE_PRICE_MS
          ? 'stale'
          : 'fresh'
    const needsPriceRefresh = pricingAssetType !== holding.assetType

    return {
      assetType: holding.assetType,
      avgCostBasis: holding.avgCostBasis,
      cacheStatus,
      currentPrice,
      fetchedAt: cacheEntry?.fetchedAt ?? null,
      needsPriceRefresh,
      nativeCurrency: holding.nativeCurrency,
      pnl,
      pnlPct,
      quantity: holding.quantity,
      ticker: holding.ticker,
      value,
    }
  })
}

export const getViewerPortfolio = query({
  args: {},
  handler: async (ctx) => {
    const tokenIdentifier = await getViewerTokenIdentifier(ctx)
    if (!tokenIdentifier) {
      return null
    }

    return await ctx.db
      .query('portfolios')
      .withIndex('by_user_token_identifier', (query) =>
        query.eq('userTokenIdentifier', tokenIdentifier),
      )
      .unique()
  },
})

export const listTransactions = query({
  args: {
    portfolioId: v.id('portfolios'),
  },
  handler: async (ctx, args) => {
    const tokenIdentifier = await getViewerTokenIdentifier(ctx)
    if (!tokenIdentifier) {
      return null
    }

    await getOwnedPortfolio(ctx, args.portfolioId, tokenIdentifier)
    return await listPortfolioTransactions(ctx, args.portfolioId)
  },
})

export const getUserSettings = query({
  args: {},
  handler: async (ctx) => {
    const tokenIdentifier = await getViewerTokenIdentifier(ctx)
    if (!tokenIdentifier) {
      return null
    }

    const settings = await ctx.db
      .query('userSettings')
      .withIndex('by_user_token_identifier', (query) =>
        query.eq('userTokenIdentifier', tokenIdentifier),
      )
      .unique()

    return {
      currency: settings?.currency ?? DEFAULT_USER_CURRENCY,
    }
  },
})

export const getCachedFxRates = query({
  args: {
    baseCurrencies: v.array(v.string()),
    quoteCurrency: v.string(),
  },
  handler: async (ctx, args) => {
    const quoteCurrency = normalizeCurrency(args.quoteCurrency)
    const requestedBaseCurrencies = [
      ...new Set(args.baseCurrencies.map(normalizeCurrency)),
    ].filter((baseCurrency) => baseCurrency !== quoteCurrency)
    const cachedRates: Doc<'fxCache'>[] = []

    for (const baseCurrency of requestedBaseCurrencies) {
      const cachedRate = await ctx.db
        .query('fxCache')
        .withIndex('by_key', (query) =>
          query.eq('key', `${baseCurrency}:${quoteCurrency}`),
        )
        .unique()

      if (cachedRate) {
        cachedRates.push(cachedRate)
      }
    }

    return cachedRates
  },
})

export const getCachedHoldings = query({
  args: {
    portfolioId: v.id('portfolios'),
  },
  handler: async (ctx, args) => {
    const tokenIdentifier = await getViewerTokenIdentifier(ctx)
    if (!tokenIdentifier) {
      return null
    }

    const portfolio = await getOwnedPortfolio(ctx, args.portfolioId, tokenIdentifier)
    const transactions = await listPortfolioTransactions(ctx, args.portfolioId)
    const holdings = aggregateOpenHoldings(
      transactions.map(toPortfolioTransaction),
    )
    const cacheEntries = new Map<string, Doc<'priceCache'>>()

    for (const holding of holdings) {
      const cacheEntry = await ctx.db
        .query('priceCache')
        .withIndex('by_key', (query) =>
          query.eq('key', `${holding.ticker}:${portfolio.homeCurrency}`),
        )
        .unique()

      if (cacheEntry) {
        cacheEntries.set(holding.ticker, cacheEntry)
      }
    }

    const items = buildHoldingSnapshots(holdings, cacheEntries)
    const knownValueItems = items.filter((item) => item.value !== null)

    return {
      anyStale: items.some((item) => item.cacheStatus === 'stale'),
      cachedCount: items.filter((item) => item.currentPrice !== null).length,
      hasOpenPositions: holdings.length > 0,
      hasTransactions: transactions.length > 0,
      items,
      missingCount: items.filter((item) => item.cacheStatus === 'missing').length,
      openPositionsCount: holdings.length,
      portfolio,
      requiresRefresh: items.some(
        (item) => item.cacheStatus !== 'fresh' || item.needsPriceRefresh,
      ),
      totalPnl: knownValueItems.reduce(
        (sum, item) => sum + (item.pnl ?? 0),
        0,
      ),
      totalValue: knownValueItems.reduce(
        (sum, item) => sum + (item.value ?? 0),
        0,
      ),
      totalValueIsPartial: knownValueItems.length !== items.length,
    }
  },
})

export const listExpensesByMonth = query({
  args: {
    yearMonth: v.string(),
  },
  handler: async (ctx, args) => {
    const tokenIdentifier = await getViewerTokenIdentifier(ctx)
    if (!tokenIdentifier) {
      return null
    }

    const startDate = `${args.yearMonth}-01`
    const [year, month] = args.yearMonth.split('-').map(Number)
    const nextYear = month === 12 ? year + 1 : year
    const nextMonth = month === 12 ? 1 : month + 1
    const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`

    return await ctx.db
      .query('expenses')
      .withIndex('by_user_and_date', (q) =>
        q
          .eq('userTokenIdentifier', tokenIdentifier)
          .gte('date', startDate)
          .lt('date', endDate),
      )
      .order('desc')
      .take(500)
  },
})

export const getPortfolioByIdInternal = internalQuery({
  args: {
    portfolioId: v.id('portfolios'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.portfolioId)
  },
})

export const getPriceCacheByKeyInternal = internalQuery({
  args: {
    key: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('priceCache')
      .withIndex('by_key', (query) => query.eq('key', args.key))
      .unique()
  },
})

export const getTransactionsForPortfolioInternal = internalQuery({
  args: {
    portfolioId: v.id('portfolios'),
  },
  handler: async (ctx, args) => {
    return await listPortfolioTransactions(ctx, args.portfolioId)
  },
})
