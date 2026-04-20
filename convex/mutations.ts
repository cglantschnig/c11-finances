import { internalMutation, mutation, type MutationCtx } from './_generated/server'
import { v } from 'convex/values'
import type { Id } from './_generated/dataModel'
import { hasNegativePosition, type PortfolioTransactionLike } from '../shared/portfolio'

async function requireViewerTokenIdentifier(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw new Error('You must be signed in.')
  }

  return identity.tokenIdentifier
}

async function getOwnedPortfolio(
  ctx: MutationCtx,
  portfolioId: Id<'portfolios'>,
  tokenIdentifier: string,
) {
  const portfolio = await ctx.db.get(portfolioId)
  if (!portfolio || portfolio.userTokenIdentifier !== tokenIdentifier) {
    throw new Error('Portfolio not found.')
  }

  return portfolio
}

function normalizeCurrency(currency: string) {
  return currency.trim().toUpperCase()
}

function normalizeTicker(ticker: string) {
  return ticker.trim().toUpperCase()
}

function assertIsoCurrency(currency: string) {
  if (!/^[A-Z]{3}$/.test(currency)) {
    throw new Error('Use a valid 3-letter currency code.')
  }
}

function assertDate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error('Use a valid transaction date.')
  }
}

function toPortfolioTransaction(
  transaction: {
    _creationTime: number
    assetType: 'equity' | 'crypto'
    date: string
    fxRate: number
    nativeCurrency: string
    pricePerUnit: number
    quantity: number
    side: 'buy' | 'sell'
    ticker: string
  },
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

export const createPortfolio = mutation({
  args: {
    homeCurrency: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const tokenIdentifier = await requireViewerTokenIdentifier(ctx)
    const homeCurrency = normalizeCurrency(args.homeCurrency)
    assertIsoCurrency(homeCurrency)

    const existing = await ctx.db
      .query('portfolios')
      .withIndex('by_user_token_identifier', (query) =>
        query.eq('userTokenIdentifier', tokenIdentifier),
      )
      .unique()

    if (existing) {
      return existing._id
    }

    const portfolioId = await ctx.db.insert('portfolios', {
      homeCurrency,
      name: args.name?.trim() || 'My Portfolio',
      userTokenIdentifier: tokenIdentifier,
    })

    await ctx.db.insert('userSettings', {
      currency: 'EUR',
      userTokenIdentifier: tokenIdentifier,
    })

    return portfolioId
  },
})

export const setUserCurrency = mutation({
  args: {
    currency: v.union(
      v.literal('EUR'),
      v.literal('USD'),
      v.literal('THB'),
      v.literal('PHP'),
    ),
  },
  handler: async (ctx, args) => {
    const tokenIdentifier = await requireViewerTokenIdentifier(ctx)
    const existing = await ctx.db
      .query('userSettings')
      .withIndex('by_user_token_identifier', (query) =>
        query.eq('userTokenIdentifier', tokenIdentifier),
      )
      .unique()

    if (existing) {
      await ctx.db.patch(existing._id, {
        currency: args.currency,
      })
      return existing._id
    }

    return await ctx.db.insert('userSettings', {
      currency: args.currency,
      userTokenIdentifier: tokenIdentifier,
    })
  },
})

export const addTransaction = mutation({
  args: {
    assetName: v.optional(v.string()),
    assetType: v.union(v.literal('equity'), v.literal('crypto')),
    date: v.string(),
    fxRate: v.number(),
    nativeCurrency: v.string(),
    portfolioId: v.id('portfolios'),
    pricePerUnit: v.number(),
    quantity: v.number(),
    side: v.union(v.literal('buy'), v.literal('sell')),
    ticker: v.string(),
  },
  handler: async (ctx, args) => {
    const tokenIdentifier = await requireViewerTokenIdentifier(ctx)
    const portfolio = await getOwnedPortfolio(ctx, args.portfolioId, tokenIdentifier)
    const assetName = args.assetName?.trim()
    const ticker = normalizeTicker(args.ticker)
    const nativeCurrency = normalizeCurrency(args.nativeCurrency)
    const fxRate =
      nativeCurrency === portfolio.homeCurrency ? 1 : args.fxRate

    assertDate(args.date)
    assertIsoCurrency(nativeCurrency)

    if (!ticker) {
      throw new Error('Ticker is required.')
    }
    if (args.quantity <= 0) {
      throw new Error('Quantity must be greater than 0.')
    }
    if (args.pricePerUnit <= 0) {
      throw new Error('Price must be greater than 0.')
    }
    if (fxRate <= 0) {
      throw new Error('FX rate must be greater than 0.')
    }

    if (args.side === 'sell') {
      const transactions = await ctx.db
        .query('transactions')
        .withIndex('by_portfolio_id_and_ticker', (query) =>
          query.eq('portfolioId', args.portfolioId).eq('ticker', ticker),
        )
        .take(500)

      const isInvalid = hasNegativePosition([
        ...transactions.map(toPortfolioTransaction),
        {
          assetType: args.assetType,
          creationTime: Date.now(),
          date: args.date,
          fxRate,
          nativeCurrency,
          pricePerUnit: args.pricePerUnit,
          quantity: args.quantity,
          side: args.side,
          ticker,
        },
      ])

      if (isInvalid) {
        throw new Error('Sell quantity exceeds your current holdings.')
      }
    }

    return await ctx.db.insert('transactions', {
      ...(assetName ? { assetName } : {}),
      assetType: args.assetType,
      date: args.date,
      fxRate,
      nativeCurrency,
      portfolioId: args.portfolioId,
      pricePerUnit: args.pricePerUnit,
      quantity: args.quantity,
      side: args.side,
      ticker,
      userTokenIdentifier: tokenIdentifier,
    })
  },
})

export const deleteTransaction = mutation({
  args: {
    transactionId: v.id('transactions'),
  },
  handler: async (ctx, args) => {
    const tokenIdentifier = await requireViewerTokenIdentifier(ctx)
    const transaction = await ctx.db.get(args.transactionId)

    if (!transaction || transaction.userTokenIdentifier !== tokenIdentifier) {
      throw new Error('Transaction not found.')
    }

    const siblingTransactions = await ctx.db
      .query('transactions')
      .withIndex('by_portfolio_id_and_ticker', (query) =>
        query
          .eq('portfolioId', transaction.portfolioId)
          .eq('ticker', transaction.ticker),
      )
      .take(500)

    const remainingTransactions = siblingTransactions
      .filter((sibling) => sibling._id !== transaction._id)
      .map(toPortfolioTransaction)

    if (hasNegativePosition(remainingTransactions)) {
      throw new Error('Cannot delete — a sell depends on this.')
    }

    await ctx.db.delete(args.transactionId)
    return null
  },
})

export const upsertPriceCache = mutation({
  args: {
    fetchedAt: v.number(),
    portfolioId: v.id('portfolios'),
    price: v.number(),
    ticker: v.string(),
  },
  handler: async (ctx, args) => {
    const tokenIdentifier = await requireViewerTokenIdentifier(ctx)
    const portfolio = await getOwnedPortfolio(ctx, args.portfolioId, tokenIdentifier)
    const ticker = normalizeTicker(args.ticker)
    const key = `${ticker}:${portfolio.homeCurrency}`

    const existing = await ctx.db
      .query('priceCache')
      .withIndex('by_key', (query) => query.eq('key', key))
      .unique()

    if (existing) {
      await ctx.db.patch(existing._id, {
        currency: portfolio.homeCurrency,
        fetchedAt: args.fetchedAt,
        price: args.price,
        ticker,
      })
      return existing._id
    }

    return await ctx.db.insert('priceCache', {
      currency: portfolio.homeCurrency,
      fetchedAt: args.fetchedAt,
      key,
      price: args.price,
      ticker,
    })
  },
})

export const upsertPriceCacheInternal = internalMutation({
  args: {
    currency: v.string(),
    fetchedAt: v.number(),
    key: v.string(),
    price: v.number(),
    ticker: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('priceCache')
      .withIndex('by_key', (query) => query.eq('key', args.key))
      .unique()

    if (existing) {
      await ctx.db.patch(existing._id, {
        currency: args.currency,
        fetchedAt: args.fetchedAt,
        price: args.price,
        ticker: args.ticker,
      })
      return existing._id
    }

    return await ctx.db.insert('priceCache', args)
  },
})

export const upsertFxCache = mutation({
  args: {
    baseCurrency: v.string(),
    lastModifiedAt: v.number(),
    quoteCurrency: v.string(),
    rate: v.number(),
  },
  handler: async (ctx, args) => {
    await requireViewerTokenIdentifier(ctx)

    const baseCurrency = normalizeCurrency(args.baseCurrency)
    const quoteCurrency = normalizeCurrency(args.quoteCurrency)
    const key = `${baseCurrency}:${quoteCurrency}`

    assertIsoCurrency(baseCurrency)
    assertIsoCurrency(quoteCurrency)

    if (args.rate <= 0) {
      throw new Error('FX rate must be greater than 0.')
    }

    const existing = await ctx.db
      .query('fxCache')
      .withIndex('by_key', (query) => query.eq('key', key))
      .unique()

    if (existing) {
      await ctx.db.patch(existing._id, {
        baseCurrency,
        lastModifiedAt: args.lastModifiedAt,
        quoteCurrency,
        rate: args.rate,
      })
      return existing._id
    }

    return await ctx.db.insert('fxCache', {
      baseCurrency,
      key,
      lastModifiedAt: args.lastModifiedAt,
      quoteCurrency,
      rate: args.rate,
    })
  },
})
