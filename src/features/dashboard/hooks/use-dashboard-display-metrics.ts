import { useMemo } from 'react'
import type { FunctionReturnType } from 'convex/server'
import { api } from '../../../../convex/_generated/api'
import { useDisplayFxRates } from '#/features/portfolio'
import {
  aggregateOpenHoldingsInCurrency,
  unrealizedPnlPct,
} from '#/features/portfolio/lib/portfolio-domain'

type HoldingsSnapshot = NonNullable<
  FunctionReturnType<typeof api.queries.getCachedHoldings>
>
type TransactionsList = NonNullable<
  FunctionReturnType<typeof api.queries.listTransactions>
>

export type DashboardHoldingRow = {
  avgCostBasis: number
  cacheStatus: HoldingsSnapshot['items'][number]['cacheStatus']
  currentPrice: number | null
  currentValue: number | null
  pnlIsPositive: boolean
  pnlPct: number | null
  quantity: number
  ticker: string
}

export function buildDashboardDisplayMetrics(options: {
  displayFxError: string | null
  displayFxRates: Record<string, number> | null
  portfolioHomeCurrency: string
  selectedDisplayCurrency: string
  snapshot: HoldingsSnapshot | null
  transactions: TransactionsList | undefined
}) {
  const {
    displayFxError,
    displayFxRates,
    portfolioHomeCurrency,
    selectedDisplayCurrency,
    snapshot,
    transactions,
  } = options

  const needsLatestDisplayFx =
    transactions?.some(
      (transaction) => transaction.nativeCurrency !== selectedDisplayCurrency,
    ) ?? false

  const totalValueFxRate =
    selectedDisplayCurrency === portfolioHomeCurrency
      ? 1
      : (displayFxRates?.[portfolioHomeCurrency] ?? null)

  const isTotalValueLoading =
    snapshot !== null &&
    selectedDisplayCurrency !== portfolioHomeCurrency &&
    totalValueFxRate === null &&
    displayFxError === null

  const isLatestDisplayFxLoading =
    snapshot !== null &&
    needsLatestDisplayFx &&
    displayFxRates === null &&
    displayFxError === null

  const hasDisplayCurrencyError = displayFxError !== null
  const holdingsDisplayCurrency = hasDisplayCurrencyError
    ? portfolioHomeCurrency
    : selectedDisplayCurrency
  const holdingsDisplayFxRate =
    holdingsDisplayCurrency === portfolioHomeCurrency
      ? 1
      : (totalValueFxRate ?? 1)

  const displayHoldings =
    transactions === undefined || displayFxRates === null
      ? null
      : aggregateOpenHoldingsInCurrency(
          transactions.map((transaction) => ({
            assetType: transaction.assetType,
            creationTime: transaction._creationTime,
            date: transaction.date,
            fxRate: transaction.fxRate,
            nativeCurrency: transaction.nativeCurrency,
            pricePerUnit: transaction.pricePerUnit,
            quantity: transaction.quantity,
            side: transaction.side,
            ticker: transaction.ticker,
          })),
          {
            nativeToTargetFxRatesByCurrency: displayFxRates ?? undefined,
            targetCurrency: holdingsDisplayCurrency,
          },
        )

  const displayHoldingsByTicker = new Map(
    displayHoldings?.map((holding) => [holding.ticker, holding]) ?? [],
  )

  const rows: DashboardHoldingRow[] =
    snapshot?.items.map((holding) => {
      const displayHolding = displayHoldingsByTicker.get(holding.ticker)
      const avgCostBasis =
        displayHolding?.avgCostBasis ??
        (holding.avgCostBasis * holdingsDisplayFxRate)
      const currentPrice =
        holding.currentPrice === null
          ? null
          : holding.currentPrice * holdingsDisplayFxRate
      const currentValue =
        holding.value === null ? null : holding.value * holdingsDisplayFxRate
      const displayedPnlPct =
        displayHolding && currentValue !== null
          ? unrealizedPnlPct(currentValue, displayHolding.costBasis)
          : holding.pnlPct

      return {
        avgCostBasis,
        cacheStatus: holding.cacheStatus,
        currentPrice,
        currentValue,
        pnlIsPositive: (displayedPnlPct ?? 0) >= 0,
        pnlPct: displayedPnlPct,
        quantity: holding.quantity,
        ticker: holding.ticker,
      }
    }) ?? []

  const displayedTotalValue = (snapshot?.totalValue ?? 0) * holdingsDisplayFxRate
  const fallbackTotalCostBasis =
    ((snapshot?.totalValue ?? 0) - (snapshot?.totalPnl ?? 0)) *
    holdingsDisplayFxRate
  const displayedTotalCostBasis =
    displayHoldings?.reduce((sum, holding) => sum + holding.costBasis, 0) ??
    fallbackTotalCostBasis
  const totalPnl = displayedTotalValue - displayedTotalCostBasis
  const totalPnlPct =
    Math.abs(displayedTotalCostBasis) < Number.EPSILON
      ? 0
      : (totalPnl / displayedTotalCostBasis) * 100

  return {
    displayFxError,
    displayedTotalValue,
    hasDisplayCurrencyError,
    holdingsDisplayCurrency,
    isDisplayMetricsLoading:
      isTotalValueLoading ||
      isLatestDisplayFxLoading ||
      (snapshot !== null && transactions === undefined),
    rows,
    totalPnlIsPositive: totalPnl >= 0,
    totalPnlPct,
  }
}

export function useDashboardDisplayMetrics(options: {
  portfolioHomeCurrency: string
  selectedDisplayCurrency: string
  snapshot: HoldingsSnapshot | null
  transactions: TransactionsList | undefined
}) {
  const requestedDisplayFxCurrencies = useMemo(() => {
    if (options.transactions === undefined) {
      return null
    }

    const currencies = new Set<string>()

    if (options.selectedDisplayCurrency !== options.portfolioHomeCurrency) {
      currencies.add(options.portfolioHomeCurrency)
    }

    for (const transaction of options.transactions) {
      if (transaction.nativeCurrency !== options.selectedDisplayCurrency) {
        currencies.add(transaction.nativeCurrency)
      }
    }

    return [...currencies]
  }, [
    options.portfolioHomeCurrency,
    options.selectedDisplayCurrency,
    options.transactions,
  ])

  const { error, rates } = useDisplayFxRates({
    baseCurrencies: requestedDisplayFxCurrencies,
    quoteCurrency: options.selectedDisplayCurrency,
  })

  return useMemo(
    () =>
      buildDashboardDisplayMetrics({
        displayFxError: error,
        displayFxRates: rates,
        portfolioHomeCurrency: options.portfolioHomeCurrency,
        selectedDisplayCurrency: options.selectedDisplayCurrency,
        snapshot: options.snapshot,
        transactions: options.transactions,
      }),
    [
      error,
      options.portfolioHomeCurrency,
      options.selectedDisplayCurrency,
      options.snapshot,
      options.transactions,
      rates,
    ],
  )
}
