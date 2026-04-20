import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { PortfolioPageLayout, usePortfolioHoldingsSnapshot, useSelectedDisplayCurrency } from '#/features/portfolio'
import DashboardEmptyState from '#/features/dashboard/components/dashboard-empty-state'
import DashboardSummary from '#/features/dashboard/components/dashboard-summary'
import HoldingsCards from '#/features/dashboard/components/holdings-cards'
import HoldingsSkeleton from '#/features/dashboard/components/holdings-skeleton'
import HoldingsTable from '#/features/dashboard/components/holdings-table'
import { useDashboardDisplayMetrics } from '#/features/dashboard/hooks/use-dashboard-display-metrics'

function holdingsStatusText(
  snapshot: ReturnType<typeof usePortfolioHoldingsSnapshot>['snapshot'],
  isRefreshing: boolean,
  progressCount: number,
  refreshError: string | null,
) {
  if (refreshError) return refreshError
  if (isRefreshing) {
    return `Refreshing ${progressCount}/${snapshot?.openPositionsCount ?? 0}`
  }
  if (snapshot?.anyStale) return 'Cached prices'
  return null
}

export function DashboardPage() {
  return (
    <PortfolioPageLayout
      title="Portfolio"
      showMobileHeaderModeToggle={false}
    >
      {({ openAddTransaction, portfolio }) => (
        <DashboardContent
          portfolio={portfolio}
          onOpenAddTransaction={openAddTransaction}
        />
      )}
    </PortfolioPageLayout>
  )
}

function DashboardContent({
  onOpenAddTransaction,
  portfolio,
}: {
  onOpenAddTransaction: () => void
  portfolio: Parameters<typeof useSelectedDisplayCurrency>[0]
}) {
  const transactions = useQuery(api.queries.listTransactions, {
    portfolioId: portfolio._id,
  })
  const {
    coldLoad,
    isInitialLoad,
    isRefreshing,
    lastUpdatedAt,
    progressCount,
    refreshError,
    snapshot,
  } = usePortfolioHoldingsSnapshot(portfolio)
  const selectedDisplayCurrency = useSelectedDisplayCurrency(portfolio)
  const metrics = useDashboardDisplayMetrics({
    portfolioHomeCurrency: portfolio.homeCurrency,
    selectedDisplayCurrency,
    snapshot,
    transactions,
  })
  const statusText = holdingsStatusText(
    snapshot,
    isRefreshing,
    progressCount,
    refreshError,
  )

  return (
    <div className="space-y-8">
      <DashboardSummary
        displayFxError={metrics.displayFxError}
        displayedTotalValue={metrics.displayedTotalValue}
        holdingsDisplayCurrency={metrics.holdingsDisplayCurrency}
        isLoading={isInitialLoad || metrics.isDisplayMetricsLoading}
        lastUpdatedAt={lastUpdatedAt}
        positionCount={snapshot?.items.length ?? 0}
        snapshotAnyStale={snapshot?.anyStale ?? false}
        statusText={statusText}
        totalPnlIsPositive={metrics.totalPnlIsPositive}
        totalPnlPct={metrics.totalPnlPct}
        totalValueIsPartial={snapshot?.totalValueIsPartial ?? false}
      />

      {snapshot && snapshot.hasTransactions === false ? (
        <DashboardEmptyState
          homeCurrency={portfolio.homeCurrency}
          onOpenAddTransaction={onOpenAddTransaction}
        />
      ) : (
        <div>
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Holdings
          </p>
          {coldLoad || isInitialLoad || metrics.isDisplayMetricsLoading ? (
            <HoldingsSkeleton />
          ) : snapshot && snapshot.items.length > 0 ? (
            <>
              <div className="hidden md:block">
                <HoldingsTable
                  currency={metrics.holdingsDisplayCurrency}
                  rows={metrics.rows}
                />
              </div>
              <div className="grid gap-3 md:hidden">
                <HoldingsCards
                  currency={metrics.holdingsDisplayCurrency}
                  rows={metrics.rows}
                />
              </div>
            </>
          ) : (
            <div className="py-8 text-center">
              <p className="font-medium text-foreground">
                No open positions right now.
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Your transaction history exists, but every position is fully sold.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
