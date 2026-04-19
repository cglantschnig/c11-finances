export const STALE_PRICE_MS = 15 * 60 * 1000
const EPSILON = 1e-8

export type AssetType = 'equity' | 'crypto'
export type TransactionSide = 'buy' | 'sell'

export type PortfolioTransactionLike = {
  assetType: AssetType
  creationTime: number
  date: string
  fxRate: number
  nativeCurrency: string
  pricePerUnit: number
  quantity: number
  side: TransactionSide
  ticker: string
}

export type AggregatedHolding = {
  assetType: AssetType
  avgCostBasis: number
  costBasis: number
  nativeCurrency: string
  quantity: number
  ticker: string
}

function clampZero(value: number) {
  return Math.abs(value) < EPSILON ? 0 : value
}

export function avgCostBasis(costBasis: number, quantity: number) {
  if (Math.abs(quantity) < EPSILON) {
    return 0
  }

  return costBasis / quantity
}

export function unrealizedPnl(currentValue: number, costBasis: number) {
  return currentValue - costBasis
}

export function unrealizedPnlPct(currentValue: number, costBasis: number) {
  if (Math.abs(costBasis) < EPSILON) {
    return 0
  }

  return (unrealizedPnl(currentValue, costBasis) / costBasis) * 100
}

export function sortTransactionsChronologically<T extends PortfolioTransactionLike>(
  transactions: T[],
) {
  return [...transactions].sort((left, right) => {
    if (left.date === right.date) {
      return left.creationTime - right.creationTime
    }

    return left.date.localeCompare(right.date)
  })
}

export function hasNegativePosition(transactions: PortfolioTransactionLike[]) {
  const holdings = new Map<string, number>()

  for (const transaction of sortTransactionsChronologically(transactions)) {
    const nextQuantity =
      (holdings.get(transaction.ticker) ?? 0) +
      (transaction.side === 'buy'
        ? transaction.quantity
        : -transaction.quantity)

    if (nextQuantity < -EPSILON) {
      return true
    }

    holdings.set(transaction.ticker, clampZero(nextQuantity))
  }

  return false
}

export function aggregateOpenHoldings(
  transactions: PortfolioTransactionLike[],
): AggregatedHolding[] {
  const holdings = new Map<
    string,
    {
      assetType: AssetType
      costBasis: number
      nativeCurrency: string
      quantity: number
      ticker: string
    }
  >()

  for (const transaction of sortTransactionsChronologically(transactions)) {
    const holding = holdings.get(transaction.ticker) ?? {
      assetType: transaction.assetType,
      costBasis: 0,
      nativeCurrency: transaction.nativeCurrency,
      quantity: 0,
      ticker: transaction.ticker,
    }

    holding.assetType = transaction.assetType
    holding.nativeCurrency = transaction.nativeCurrency

    if (transaction.side === 'buy') {
      holding.quantity += transaction.quantity
      holding.costBasis +=
        transaction.quantity * transaction.pricePerUnit * transaction.fxRate
    } else {
      const currentAvgCost = avgCostBasis(holding.costBasis, holding.quantity)
      holding.quantity = clampZero(holding.quantity - transaction.quantity)
      holding.costBasis = clampZero(
        holding.costBasis - currentAvgCost * transaction.quantity,
      )
    }

    holdings.set(transaction.ticker, holding)
  }

  return [...holdings.values()]
    .filter((holding) => holding.quantity > EPSILON)
    .map((holding) => ({
      ...holding,
      avgCostBasis: avgCostBasis(holding.costBasis, holding.quantity),
    }))
}
