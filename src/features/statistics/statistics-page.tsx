import { Badge } from '#/shared/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/shared/ui/card'
import AllocationPieChart from '#/features/statistics/components/allocation-pie-chart'
import StatisticsEmptyState from '#/features/statistics/components/statistics-empty-state'
import StatisticsSkeleton from '#/features/statistics/components/statistics-skeleton'
import { useStatisticsAllocation } from '#/features/statistics/hooks/use-statistics-allocation'
import { PortfolioPageLayout, usePortfolioHoldingsSnapshot, useSelectedDisplayCurrency } from '#/features/portfolio'
import { formatCurrency } from '#/shared/lib/format'

export function StatisticsPage() {
  return (
    <PortfolioPageLayout title="Statistics">
      {({ openAddTransaction, portfolio }) => (
        <StatisticsContent
          homeCurrency={portfolio.homeCurrency}
          onOpenAddTransaction={openAddTransaction}
          portfolio={portfolio}
        />
      )}
    </PortfolioPageLayout>
  )
}

function StatisticsContent({
  homeCurrency,
  onOpenAddTransaction,
  portfolio,
}: {
  homeCurrency: string
  onOpenAddTransaction: () => void
  portfolio: Parameters<typeof useSelectedDisplayCurrency>[0]
}) {
  const { coldLoad, isInitialLoad, isRefreshing, refreshError, snapshot } =
    usePortfolioHoldingsSnapshot(portfolio)
  const selectedDisplayCurrency = useSelectedDisplayCurrency(portfolio)
  const allocation = useStatisticsAllocation({
    homeCurrency,
    selectedDisplayCurrency,
    snapshot,
  })

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div>
          <h2 className="font-heading text-3xl text-foreground sm:text-4xl">
            Statistics
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">
            {formatCurrency(
              allocation.totalTrackedValue,
              allocation.holdingsDisplayCurrency,
            )}{' '}
            tracked
          </Badge>
          <Badge variant="outline">{allocation.pricedCoverageText}</Badge>
          {isRefreshing ? <Badge variant="outline">Refreshing prices</Badge> : null}
          {snapshot?.anyStale ? <Badge variant="outline">Some prices stale</Badge> : null}
          {snapshot?.totalValueIsPartial ? <Badge variant="outline">Partial coverage</Badge> : null}
          {refreshError ? <Badge variant="outline">{refreshError}</Badge> : null}
        </div>
      </div>

      {isInitialLoad || coldLoad ? (
        <StatisticsSkeleton />
      ) : !allocation.hasTransactions ? (
        <StatisticsEmptyState
          mode="no-transactions"
          onOpenAddTransaction={onOpenAddTransaction}
        />
      ) : !allocation.hasOpenPositions ? (
        <StatisticsEmptyState
          mode="no-open-positions"
          onOpenAddTransaction={onOpenAddTransaction}
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="shadow-sm">
            <CardHeader className="border-b">
              <CardTitle>Asset types</CardTitle>
              <CardDescription>
                Stocks, ETFs, crypto, and cash based on current position value.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <AllocationPieChart
                centerLabel="By type"
                currency={allocation.holdingsDisplayCurrency}
                data={allocation.assetTypeData}
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
                currency={allocation.holdingsDisplayCurrency}
                data={allocation.assetAllocationData}
                emptyMessage="Current prices are unavailable for these holdings."
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
