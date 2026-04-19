import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
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
  userSettings: defineTable({
    currency: v.union(
      v.literal('EUR'),
      v.literal('USD'),
      v.literal('BHT'),
      v.literal('PHP'),
    ),
    userTokenIdentifier: v.string(),
  }).index('by_user_token_identifier', ['userTokenIdentifier']),
})
