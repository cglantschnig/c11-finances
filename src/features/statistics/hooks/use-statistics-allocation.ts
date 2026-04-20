import { useMemo } from 'react'
import type { FunctionReturnType } from 'convex/server'
import { api } from '../../../../convex/_generated/api'
import { useDisplayFxRates } from '#/features/portfolio'
import {
  type PortfolioInstrumentCategory,
  resolvePortfolioInstrumentCategory,
} from '#/features/statistics/lib/instrument-category'

type HoldingsSnapshot = NonNullable<
  FunctionReturnType<typeof api.queries.getCachedHoldings>
>

export function buildStatisticsAllocationData(options: {
  displayFxError: string | null
  displayFxRate: number | null
  selectedDisplayCurrency: string
  snapshot: HoldingsSnapshot | null
  homeCurrency: string
}) {
  const {
    displayFxError,
    displayFxRate,
    homeCurrency,
    selectedDisplayCurrency,
    snapshot,
  } = options

  const canDisplaySelectedCurrency =
    selectedDisplayCurrency === homeCurrency || displayFxRate !== null
  const holdingsDisplayCurrency =
    displayFxError !== null || !canDisplaySelectedCurrency
      ? homeCurrency
      : selectedDisplayCurrency
  const holdingsDisplayFxRate =
    holdingsDisplayCurrency === homeCurrency ? 1 : (displayFxRate ?? 1)

  const holdings =
    snapshot?.items.map((item) => ({
      ...item,
      displayedValue: item.value === null ? null : item.value * holdingsDisplayFxRate,
    })) ?? []

  const pricedHoldings = holdings
    .filter(
      (holding): holding is typeof holding & { displayedValue: number } =>
        holding.displayedValue !== null,
    )
    .sort((left, right) => right.displayedValue - left.displayedValue)

  const totalTrackedValue = pricedHoldings.reduce(
    (sum, holding) => sum + holding.displayedValue,
    0,
  )

  const typeColors: Record<PortfolioInstrumentCategory, string> = {
    cash: '#64748b',
    crypto: '#0284c7',
    etf: '#d97706',
    stock: '#0f766e',
  }

  const typeLabels: Record<PortfolioInstrumentCategory, string> = {
    cash: 'Cash',
    crypto: 'Crypto',
    etf: 'ETFs',
    stock: 'Stocks',
  }

  const assetColors = [
    '#0f766e',
    '#1d4ed8',
    '#d97706',
    '#dc2626',
    '#7c3aed',
    '#0891b2',
    '#65a30d',
    '#db2777',
    '#ea580c',
    '#4f46e5',
    '#0d9488',
    '#c2410c',
  ]

  const totals: Record<PortfolioInstrumentCategory, number> = {
    cash: 0,
    crypto: 0,
    etf: 0,
    stock: 0,
  }

  for (const holding of pricedHoldings) {
    const category = resolvePortfolioInstrumentCategory({
      assetType: holding.assetType,
      ticker: holding.ticker,
    })
    totals[category] += holding.displayedValue
  }

  return {
    assetAllocationData: pricedHoldings.map((holding, index) => ({
      color: assetColors[index % assetColors.length]!,
      label: holding.ticker,
      value: holding.displayedValue,
    })),
    assetTypeData: (Object.keys(typeLabels) as PortfolioInstrumentCategory[])
      .map((category) => ({
        color: typeColors[category],
        label: typeLabels[category],
        value: totals[category],
      }))
      .sort((left, right) => right.value - left.value),
    hasOpenPositions: (snapshot?.items.length ?? 0) > 0,
    hasTransactions: snapshot?.hasTransactions ?? false,
    holdingsDisplayCurrency,
    pricedCoverageText: `${pricedHoldings.length} of ${snapshot?.items.length ?? 0} positions priced`,
    totalTrackedValue,
  }
}

export function useStatisticsAllocation(options: {
  homeCurrency: string
  selectedDisplayCurrency: string
  snapshot: HoldingsSnapshot | null
}) {
  const requestedDisplayFxCurrencies = useMemo(
    () =>
      options.selectedDisplayCurrency === options.homeCurrency
        ? []
        : [options.homeCurrency],
    [options.homeCurrency, options.selectedDisplayCurrency],
  )

  const { error, rates } = useDisplayFxRates({
    baseCurrencies: requestedDisplayFxCurrencies,
    quoteCurrency: options.selectedDisplayCurrency,
  })

  return useMemo(
    () =>
      buildStatisticsAllocationData({
        displayFxError: error,
        displayFxRate:
          options.selectedDisplayCurrency === options.homeCurrency
            ? 1
            : (rates?.[options.homeCurrency] ?? null),
        homeCurrency: options.homeCurrency,
        selectedDisplayCurrency: options.selectedDisplayCurrency,
        snapshot: options.snapshot,
      }),
    [
      error,
      options.homeCurrency,
      options.selectedDisplayCurrency,
      options.snapshot,
      rates,
    ],
  )
}
