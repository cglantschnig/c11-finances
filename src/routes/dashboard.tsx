import { useEffect, useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useQuery } from 'convex/react'
import type { FunctionReturnType } from 'convex/server'
import {
  ChartColumnIncreasing,
  Plus,
  TriangleAlert,
} from 'lucide-react'
import { api } from '../../convex/_generated/api'
import type { Doc } from '../../convex/_generated/dataModel'
import {
  formatCurrency,
  formatPercent,
  formatQuantity,
} from '#/lib/format'
import AddTransactionDialog from '#/components/AddTransactionDialog'
import PortfolioAppShell from '#/components/PortfolioAppShell'
import PortfolioGate from '#/components/PortfolioGate'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Skeleton } from '#/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#/components/ui/tooltip'
import { refreshHoldings } from '#/lib/server/refresh-holdings'

type Portfolio = Doc<'portfolios'>
type HoldingsSnapshot = NonNullable<
  FunctionReturnType<typeof api.queries.getCachedHoldings>
>

export const Route = createFileRoute('/dashboard')({
  ssr: false,
  component: DashboardRoute,
})

function StaleBadge() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="outline"
          className="border-[hsl(var(--warning)/0.35)] bg-[hsl(var(--warning)/0.12)] text-[hsl(var(--warning))]"
        >
          <TriangleAlert className="size-3" />
          Stale
        </Badge>
      </TooltipTrigger>
      <TooltipContent sideOffset={8}>
        Price may be up to 15 min old.
      </TooltipContent>
    </Tooltip>
  )
}

function DashboardRoute() {
  return (
    <PortfolioGate>
      {(portfolio) => <DashboardScreen portfolio={portfolio} />}
    </PortfolioGate>
  )
}

function DashboardScreen({ portfolio }: { portfolio: Portfolio }) {
  const cachedHoldings = useQuery(api.queries.getCachedHoldings, {
    portfolioId: portfolio._id,
  })
  const refreshHoldingsFn = useServerFn(refreshHoldings)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [refreshError, setRefreshError] = useState<string | null>(null)
  const [refreshedHoldings, setRefreshedHoldings] =
    useState<HoldingsSnapshot | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [progressCount, setProgressCount] = useState(0)

  const needsRefresh = Boolean(
    cachedHoldings &&
      cachedHoldings.hasOpenPositions &&
      (cachedHoldings.missingCount > 0 || cachedHoldings.anyStale),
  )

  useEffect(() => {
    if (!cachedHoldings || !needsRefresh) {
      if (!cachedHoldings?.hasOpenPositions) {
        setRefreshedHoldings(null)
      }
      setIsRefreshing(false)
      setProgressCount(cachedHoldings?.cachedCount ?? 0)
      return
    }

    let isCancelled = false
    let progressTimer: number | undefined

    setRefreshError(null)
    setIsRefreshing(true)
    setRefreshedHoldings(null)

    if (cachedHoldings.cachedCount === 0 && cachedHoldings.openPositionsCount > 0) {
      setProgressCount(0)
      progressTimer = window.setInterval(() => {
        setProgressCount((current) =>
          Math.min(current + 1, cachedHoldings.openPositionsCount - 1),
        )
      }, 450)
    } else {
      setProgressCount(cachedHoldings.cachedCount)
    }

    void refreshHoldingsFn({ data: { portfolioId: portfolio._id } })
      .then((result) => {
        if (isCancelled) {
          return
        }
        setRefreshedHoldings(result)
        setProgressCount(result.openPositionsCount)
      })
      .catch((error) => {
        if (!isCancelled) {
          setRefreshError(
            error instanceof Error
              ? error.message
              : 'Unable to refresh prices right now.',
          )
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsRefreshing(false)
        }
        if (progressTimer) {
          window.clearInterval(progressTimer)
        }
      })

    return () => {
      isCancelled = true
      if (progressTimer) {
        window.clearInterval(progressTimer)
      }
    }
  }, [
    cachedHoldings,
    needsRefresh,
    portfolio._id,
    refreshHoldingsFn,
  ])

  const snapshot = useMemo(
    () => refreshedHoldings ?? cachedHoldings ?? null,
    [cachedHoldings, refreshedHoldings],
  )

  const coldLoad =
    (cachedHoldings?.hasOpenPositions ?? false) &&
    (cachedHoldings?.cachedCount ?? 0) === 0 &&
    isRefreshing &&
    refreshedHoldings === null

  return (
    <>
      <PortfolioAppShell
        title="Dashboard"
        description="Open positions, home-currency market value, and unrealized performance."
        onOpenAddTransaction={() => setAddDialogOpen(true)}
        portfolio={portfolio}
      >
        {snapshot && snapshot.hasTransactions === false ? (
          <section className="app-shell rounded-[1.75rem] p-8 md:p-10">
            <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
              <div className="rounded-[1.5rem] border border-primary/20 bg-primary/10 p-4 text-primary">
                <ChartColumnIncreasing className="size-6" />
              </div>
              <h2 className="mt-5 text-3xl font-semibold text-foreground">
                Your dashboard is ready for its first transaction.
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">
                Add a buy or sell to start building holdings and live market value in {portfolio.homeCurrency}.
              </p>
              <Button
                onClick={() => setAddDialogOpen(true)}
                className="mt-6 h-11 rounded-xl px-5"
              >
                <Plus className="size-4" />
                Add transaction
              </Button>
            </div>
          </section>
        ) : (
          <>
            <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="app-shell rounded-[1.75rem] p-6 md:p-7">
                <p className="eyebrow">Total Portfolio Value</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <h2 className="tabular-nums text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
                    {snapshot
                      ? formatCurrency(snapshot.totalValue, portfolio.homeCurrency)
                      : formatCurrency(0, portfolio.homeCurrency)}
                  </h2>
                  {snapshot?.anyStale ? <StaleBadge /> : null}
                  {snapshot?.totalValueIsPartial ? (
                    <Badge variant="outline" className="text-muted-foreground">
                      Partial
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Sold positions reduce holdings but cash proceeds are not tracked. Total value reflects current market value of open positions only.
                </p>
              </div>

              <div className="app-shell rounded-[1.75rem] p-6">
                <p className="eyebrow">Refresh</p>
                <div className="mt-3 space-y-3">
                  <p className="text-sm text-foreground">
                    {isRefreshing
                      ? `Fetching prices... ${progressCount}/${snapshot?.openPositionsCount ?? 0} complete`
                      : snapshot?.hasOpenPositions
                        ? 'Latest cached or refreshed prices are shown below.'
                        : 'No open holdings to price yet.'}
                  </p>
                  {refreshError ? (
                    <p className="text-sm text-[hsl(var(--warning))]">
                      {refreshError}
                    </p>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="app-shell rounded-[1.75rem] p-4 md:p-6">
              <div className="mb-4 flex items-center justify-between gap-3 px-2">
                <div>
                  <p className="eyebrow">Holdings</p>
                  <h3 className="mt-1 text-xl font-semibold text-foreground">
                    Open positions
                  </h3>
                </div>
              </div>

              {coldLoad ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-[1.3fr_repeat(5,minmax(0,1fr))] gap-3 rounded-[1.25rem] border border-border/80 px-4 py-4"
                    >
                      {Array.from({ length: 6 }).map((__, cellIndex) => (
                        <Skeleton
                          key={cellIndex}
                          className="h-5 w-full rounded-full bg-muted/60"
                        />
                      ))}
                    </div>
                  ))}
                </div>
              ) : snapshot && snapshot.items.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/70">
                      <TableHead>Ticker</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead className="text-right">P&amp;L%</TableHead>
                      <TableHead className="hidden text-right xl:table-cell">
                        P&amp;L
                      </TableHead>
                      <TableHead className="hidden text-right xl:table-cell">
                        Qty
                      </TableHead>
                      <TableHead className="hidden text-right xl:table-cell">
                        Avg cost
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {snapshot.items.map((holding) => (
                      <TableRow
                        key={holding.ticker}
                        className="border-border/60 hover:bg-muted/20"
                      >
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-foreground">
                              {holding.ticker}
                            </div>
                            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                              {holding.assetType}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="space-y-1">
                            <div className="tabular-nums font-medium text-foreground">
                              {holding.value === null
                                ? '—'
                                : formatCurrency(
                                    holding.value,
                                    portfolio.homeCurrency,
                                  )}
                            </div>
                            <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
                              <span className="tabular-nums">
                                {holding.currentPrice === null
                                  ? 'No price'
                                  : `${formatCurrency(
                                      holding.currentPrice,
                                      portfolio.homeCurrency,
                                    )} / unit`}
                              </span>
                              {holding.cacheStatus === 'stale' ? <StaleBadge /> : null}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell
                          className={`tabular-nums text-right font-medium ${
                            (holding.pnl ?? 0) >= 0
                              ? 'text-[hsl(var(--positive))]'
                              : 'text-[hsl(var(--negative))]'
                          }`}
                        >
                          {holding.pnlPct === null ? '—' : formatPercent(holding.pnlPct)}
                        </TableCell>
                        <TableCell
                          className={`tabular-nums hidden text-right xl:table-cell ${
                            (holding.pnl ?? 0) >= 0
                              ? 'text-[hsl(var(--positive))]'
                              : 'text-[hsl(var(--negative))]'
                          }`}
                        >
                          {holding.pnl === null
                            ? '—'
                            : formatCurrency(holding.pnl, portfolio.homeCurrency)}
                        </TableCell>
                        <TableCell className="tabular-nums hidden text-right xl:table-cell">
                          {formatQuantity(holding.quantity)}
                        </TableCell>
                        <TableCell className="tabular-nums hidden text-right xl:table-cell">
                          {formatCurrency(
                            holding.avgCostBasis,
                            portfolio.homeCurrency,
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-border px-6 py-12 text-center">
                  <p className="text-lg font-medium text-foreground">
                    No open positions right now.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Your transaction history exists, but every position is fully sold.
                  </p>
                </div>
              )}
            </section>
          </>
        )}
      </PortfolioAppShell>

      <AddTransactionDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        portfolio={portfolio}
      />
    </>
  )
}
