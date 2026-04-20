import { useEffect, useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useQuery } from 'convex/react'
import type { FunctionReturnType } from 'convex/server'
import {
  IconChartPie,
  IconCoins,
  IconPlus,
} from '@tabler/icons-react'
import { api } from '../../convex/_generated/api'
import type { Doc } from '../../convex/_generated/dataModel'
import AddTransactionDialog from '#/components/add-transaction-dialog'
import AllocationPieChart from '#/components/allocation-pie-chart'
import PortfolioAppShell from '#/components/portfolio-app-shell'
import PortfolioGate from '#/components/portfolio-gate'
import { formatCurrency } from '#/lib/format'
import {
  type PortfolioInstrumentCategory,
  resolvePortfolioInstrumentCategory,
} from '#/lib/instrument-category'
import { getLatestFxRates } from '#/lib/server/fx-cache.functions'
import { refreshHoldings } from '#/lib/server/refresh-holdings'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Skeleton } from '#/components/ui/skeleton'

type Portfolio = Doc<'portfolios'>
type HoldingsSnapshot = NonNullable<
  FunctionReturnType<typeof api.queries.getCachedHoldings>
>

type HoldingWithDisplayedValue = HoldingsSnapshot['items'][number] & {
  displayedValue: number | null
}

const TYPE_COLORS: Record<PortfolioInstrumentCategory, string> = {
  stock: '#0f766e',
  etf: '#d97706',
  crypto: '#0284c7',
  cash: '#64748b',
}

const TYPE_LABELS: Record<PortfolioInstrumentCategory, string> = {
  stock: 'Stocks',
  etf: 'ETFs',
  crypto: 'Crypto',
  cash: 'Cash',
}

const ASSET_COLORS = [
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

export const Route = createFileRoute('/statistics')({
  ssr: false,
  component: StatisticsRoute,
})

function StatisticsRoute() {
  return (
    <PortfolioGate>
      {(portfolio) => <StatisticsScreen portfolio={portfolio} />}
    </PortfolioGate>
  )
}

function StatisticsSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {Array.from({ length: 2 }).map((_, index) => (
        <Card key={index} className="shadow-sm">
          <CardHeader className="border-b">
            <Skeleton className="h-5 w-36 rounded-full" />
            <Skeleton className="h-4 w-56 rounded-full" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
              <Skeleton className="mx-auto aspect-square w-full max-w-[18rem] rounded-full" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((__, rowIndex) => (
                  <Skeleton key={rowIndex} className="h-14 rounded-lg" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function assetColor(index: number) {
  return ASSET_COLORS[index % ASSET_COLORS.length]!
}

function StatisticsScreen({ portfolio }: { portfolio: Portfolio }) {
  const cachedHoldings = useQuery(api.queries.getCachedHoldings, {
    portfolioId: portfolio._id,
  })
  const userSettings = useQuery(api.queries.getUserSettings, {})
  const getLatestFxRatesFn = useServerFn(getLatestFxRates)
  const refreshHoldingsFn = useServerFn(refreshHoldings)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [refreshError, setRefreshError] = useState<string | null>(null)
  const [refreshedHoldings, setRefreshedHoldings] = useState<HoldingsSnapshot | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [displayFxRate, setDisplayFxRate] = useState<number | null>(1)
  const [displayFxError, setDisplayFxError] = useState<string | null>(null)

  const needsRefresh = Boolean(
    cachedHoldings &&
      cachedHoldings.hasOpenPositions &&
      cachedHoldings.requiresRefresh,
  )

  useEffect(() => {
    if (!cachedHoldings || !needsRefresh) {
      if (!cachedHoldings?.hasOpenPositions) {
        setRefreshedHoldings(null)
      }
      setIsRefreshing(false)
      return
    }

    let isCancelled = false

    setRefreshError(null)
    setIsRefreshing(true)
    setRefreshedHoldings(null)

    void refreshHoldingsFn({ data: { portfolioId: portfolio._id } })
      .then((result) => {
        if (isCancelled) {
          return
        }

        setRefreshedHoldings(result)
      })
      .catch((error) => {
        if (isCancelled) {
          return
        }

        setRefreshError(
          error instanceof Error
            ? error.message
            : 'Unable to refresh prices right now.',
        )
      })
      .finally(() => {
        if (!isCancelled) {
          setIsRefreshing(false)
        }
      })

    return () => {
      isCancelled = true
    }
  }, [cachedHoldings, needsRefresh, portfolio._id, refreshHoldingsFn])

  const snapshot = useMemo(
    () => refreshedHoldings ?? cachedHoldings ?? null,
    [cachedHoldings, refreshedHoldings],
  )
  const isInitialLoad = cachedHoldings === undefined && refreshedHoldings === null
  const coldLoad =
    (cachedHoldings?.hasOpenPositions ?? false) &&
    (cachedHoldings?.cachedCount ?? 0) === 0 &&
    isRefreshing &&
    refreshedHoldings === null
  const selectedDisplayCurrency = userSettings?.currency ?? portfolio.homeCurrency

  useEffect(() => {
    if (selectedDisplayCurrency === portfolio.homeCurrency) {
      setDisplayFxRate(1)
      setDisplayFxError(null)
      return
    }

    let isCancelled = false

    setDisplayFxRate(null)
    setDisplayFxError(null)

    void getLatestFxRatesFn({
      data: {
        baseCurrencies: [portfolio.homeCurrency],
        quoteCurrency: selectedDisplayCurrency,
      },
    })
      .then((rates) => {
        if (isCancelled) {
          return
        }

        const rate = rates[portfolio.homeCurrency]

        if (typeof rate !== 'number' || rate <= 0) {
          setDisplayFxRate(null)
          setDisplayFxError(
            `Missing FX rate for ${portfolio.homeCurrency}/${selectedDisplayCurrency}.`,
          )
          return
        }

        setDisplayFxRate(rate)
      })
      .catch((error) => {
        if (isCancelled) {
          return
        }

        setDisplayFxError(
          error instanceof Error ? error.message : 'Unable to load FX rates.',
        )
      })

    return () => {
      isCancelled = true
    }
  }, [
    getLatestFxRatesFn,
    portfolio.homeCurrency,
    selectedDisplayCurrency,
  ])

  const canDisplaySelectedCurrency =
    selectedDisplayCurrency === portfolio.homeCurrency || displayFxRate !== null
  const holdingsDisplayCurrency =
    canDisplaySelectedCurrency && displayFxError === null
      ? selectedDisplayCurrency
      : portfolio.homeCurrency
  const holdingsDisplayFxRate =
    holdingsDisplayCurrency === portfolio.homeCurrency
      ? 1
      : (displayFxRate ?? 1)

  const holdings = useMemo<HoldingWithDisplayedValue[]>(
    () =>
      snapshot?.items.map((item) => ({
        ...item,
        displayedValue:
          item.value === null ? null : item.value * holdingsDisplayFxRate,
      })) ?? [],
    [holdingsDisplayFxRate, snapshot],
  )

  const pricedHoldings = useMemo(
    () =>
      holdings
        .filter(
          (holding): holding is HoldingWithDisplayedValue & { displayedValue: number } =>
            holding.displayedValue !== null,
        )
        .sort((left, right) => right.displayedValue - left.displayedValue),
    [holdings],
  )

  const totalTrackedValue = useMemo(
    () =>
      pricedHoldings.reduce((sum, holding) => sum + holding.displayedValue, 0),
    [pricedHoldings],
  )

  const assetTypeData = useMemo(() => {
    const totals: Record<PortfolioInstrumentCategory, number> = {
      stock: 0,
      etf: 0,
      crypto: 0,
      cash: 0,
    }

    for (const holding of pricedHoldings) {
      const category = resolvePortfolioInstrumentCategory({
        assetType: holding.assetType,
        ticker: holding.ticker,
      })
      totals[category] += holding.displayedValue
    }

    return (Object.keys(TYPE_LABELS) as PortfolioInstrumentCategory[])
      .map((category) => ({
        color: TYPE_COLORS[category],
        label: TYPE_LABELS[category],
        value: totals[category],
      }))
      .sort((left, right) => right.value - left.value)
  }, [pricedHoldings])

  const assetAllocationData = useMemo(
    () =>
      pricedHoldings.map((holding, index) => ({
        color: assetColor(index),
        label: holding.ticker,
        value: holding.displayedValue,
      })),
    [pricedHoldings],
  )

  const hasTransactions = snapshot?.hasTransactions ?? false
  const hasOpenPositions = (snapshot?.items.length ?? 0) > 0
  const pricedCoverageText = `${pricedHoldings.length} of ${snapshot?.items.length ?? 0} positions priced`

  return (
    <>
      <PortfolioAppShell
        title="Statistics"
        onOpenAddTransaction={() => setAddDialogOpen(true)}
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <div>
              <h2 className="font-heading text-3xl text-foreground sm:text-4xl">
                Statistics
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">
                {formatCurrency(totalTrackedValue, holdingsDisplayCurrency)} tracked
              </Badge>
              <Badge variant="outline">{pricedCoverageText}</Badge>
              {isRefreshing ? <Badge variant="outline">Refreshing prices</Badge> : null}
              {snapshot?.anyStale ? <Badge variant="outline">Some prices stale</Badge> : null}
              {snapshot?.totalValueIsPartial ? <Badge variant="outline">Partial coverage</Badge> : null}
              {displayFxError ? <Badge variant="outline">FX unavailable</Badge> : null}
              {refreshError ? <Badge variant="outline">{refreshError}</Badge> : null}
            </div>
          </div>

          {isInitialLoad || coldLoad ? (
            <StatisticsSkeleton />
          ) : !hasTransactions ? (
            <Card className="shadow-sm">
              <CardContent className="py-12 text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <IconCoins className="size-7" />
                </div>
                <h3 className="mt-5 font-heading text-2xl text-foreground sm:text-3xl">
                  Add your first transaction to unlock portfolio statistics.
                </h3>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                  Allocation charts appear once the portfolio has holdings with
                  market values.
                </p>
                <Button onClick={() => setAddDialogOpen(true)} className="mt-6">
                  <IconPlus className="size-4" />
                  Add transaction
                </Button>
              </CardContent>
            </Card>
          ) : !hasOpenPositions ? (
            <Card className="shadow-sm">
              <CardContent className="py-12 text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <IconChartPie className="size-7" />
                </div>
                <h3 className="mt-5 font-heading text-2xl text-foreground sm:text-3xl">
                  There are no open positions to chart right now.
                </h3>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                  Add a new buy transaction or review existing sells to build a
                  current allocation view.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 xl:grid-cols-2">
              <Card className="shadow-sm">
                <CardHeader className="border-b">
                  <CardTitle>Asset types</CardTitle>
                  <CardDescription>
                    Stocks, ETFs, crypto, and cash based on current position
                    value.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <AllocationPieChart
                    centerLabel="By type"
                    currency={holdingsDisplayCurrency}
                    data={assetTypeData}
                    emptyMessage="Current prices are unavailable for these holdings."
                  />
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="border-b">
                  <CardTitle>Portfolio allocation</CardTitle>
                  <CardDescription>
                    Current weighting of each asset in the portfolio.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <AllocationPieChart
                    centerLabel="By asset"
                    currency={holdingsDisplayCurrency}
                    data={assetAllocationData}
                    emptyMessage="Current prices are unavailable for these holdings."
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </PortfolioAppShell>

      <AddTransactionDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        portfolio={portfolio}
      />
    </>
  )
}
