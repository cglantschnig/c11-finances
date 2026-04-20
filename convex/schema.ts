import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  fxCache: defineTable({
    baseCurrency: v.string(),
    key: v.string(),
    lastModifiedAt: v.number(),
    quoteCurrency: v.string(),
    rate: v.number(),
  }).index('by_key', ['key']),
  portfolios: defineTable({
    homeCurrency: v.string(),
    name: v.string(),
    userTokenIdentifier: v.string(),
  }).index('by_user_token_identifier', ['userTokenIdentifier']),
  priceCache: defineTable({
    currency: v.string(),
    fetchedAt: v.number(),
    key: v.string(),
    price: v.number(),
    ticker: v.string(),
  }).index('by_key', ['key']),
  transactions: defineTable({
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
    userTokenIdentifier: v.string(),
  })
    .index('by_portfolio_id_and_date', ['portfolioId', 'date'])
    .index('by_portfolio_id_and_ticker', ['portfolioId', 'ticker']),
  expenses: defineTable({
    amount: v.number(),
    category: v.optional(
      v.union(
        v.literal('food'),
        v.literal('transport'),
        v.literal('housing'),
        v.literal('health'),
        v.literal('entertainment'),
        v.literal('shopping'),
        v.literal('work'),
        v.literal('other'),
      ),
    ),
    currency: v.string(),
    date: v.string(),
    note: v.optional(v.string()),
    type: v.union(v.literal('expense'), v.literal('income')),
    userTokenIdentifier: v.string(),
  }).index('by_user_and_date', ['userTokenIdentifier', 'date']),
  userSettings: defineTable({
    currency: v.union(
      v.literal('EUR'),
      v.literal('USD'),
      v.literal('THB'),
      v.literal('PHP'),
    ),
    userTokenIdentifier: v.string(),
  }).index('by_user_token_identifier', ['userTokenIdentifier']),
})
