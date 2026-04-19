import { useEffect, useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useQuery } from 'convex/react'
import type { FunctionReturnType } from 'convex/server'
import {
  ChartColumnIncreasing,
  ChevronRight,
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
          className="border-[hsl(var(--warning)/0.3)] bg-[hsl(var(--warning)/0.12)] text-[hsl(var(--warning))]"
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

function AssetTypePill({ assetType }: { assetType: string }) {
  const label = assetType.toUpperCase()
  const className =
    assetType === 'crypto' ? 'type-pill type-pill-crypto' : 'type-pill type-pill-equity'

  return <span className={className}>{label}</span>
}

function holdingsStatus(
  snapshot: HoldingsSnapshot | null,
  isRefreshing: boolean,
  progressCount: number,
  refreshError: string | null,
  didRefresh: boolean,
) {
  if (refreshError) {
    return refreshError
  }

  if (isRefreshing) {
    return `Refreshing prices ${progressCount}/${snapshot?.openPositionsCount ?? 0}`
  }

  if (!snapshot?.hasOpenPositions) {
    return 'No open holdings'
  }

  if (didRefresh) {
    return 'Updated just now'
  }

  if (snapshot.anyStale) {
    return 'Using cached prices'
  }

  return 'Live values shown'
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
  }, [cachedHoldings, needsRefresh, portfolio._id, refreshHoldingsFn])

  const snapshot = useMemo(
    () => refreshedHoldings ?? cachedHoldings ?? null,
    [cachedHoldings, refreshedHoldings],
  )

  const coldLoad =
    (cachedHoldings?.hasOpenPositions ?? false) &&
    (cachedHoldings?.cachedCount ?? 0) === 0 &&
    isRefreshing &&
    refreshedHoldings === null

  const statusText = holdingsStatus(
    snapshot,
    isRefreshing,
    progressCount,
    refreshError,
    refreshedHoldings !== null,
  )

  return (
    <>
      <PortfolioAppShell
        title="Portfolio"
        onOpenAddTransaction={() => setAddDialogOpen(true)}
        portfolio={portfolio}
      >
        {snapshot && snapshot.hasTransactions === false ? (
          <section className="app-shell overflow-hidden rounded-[1.8rem]">
            <div className="flex flex-col gap-8 px-6 py-7 md:px-8 md:py-9 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <p className="eyebrow">Portfolio</p>
                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-foreground md:text-5xl">
                  Your dashboard is ready for its first transaction.
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground md:text-base">
                  Add a buy or sell to start building holdings, market value,
                  and performance in {portfolio.homeCurrency}.
                </p>
              </div>

              <Button
                onClick={() => setAddDialogOpen(true)}
                size="lg"
                className="h-12 rounded-2xl px-5"
              >
                <Plus className="size-4" />
                Add Transaction
              </Button>
            </div>

            <div className="surface-line" />

            <div className="px-6 py-12 md:px-8">
              <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
                <div className="rounded-[1.5rem] border border-primary/20 bg-primary/10 p-4 text-primary">
                  <ChartColumnIncreasing className="size-6" />
                </div>
                <h2 className="mt-5 text-2xl font-semibold text-foreground md:text-3xl">
                  Nothing is being tracked yet.
                </h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">
                  The layout is in place. Once you add transactions, this page
                  will show open positions, current prices, and unrealized P&amp;L.
                </p>
              </div>
            </div>
          </section>
        ) : (
          <section className="app-shell overflow-hidden rounded-[1.8rem]">
            <div className="flex flex-col gap-6 px-6 py-7 md:px-8 md:py-8 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="eyebrow">Total Portfolio Value</p>
                <h1 className="mt-2 tabular-nums text-5xl font-semibold tracking-[-0.05em] text-foreground md:text-6xl">
                  {snapshot
                    ? formatCurrency(snapshot.totalValue, portfolio.homeCurrency)
                    : formatCurrency(0, portfolio.homeCurrency)}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span>{snapshot?.items.length ?? 0} holdings</span>
                  <span>&middot;</span>
                  <span>{portfolio.homeCurrency}</span>
                  <span>&middot;</span>
                  <span>{statusText}</span>
                  {snapshot?.anyStale ? <StaleBadge /> : null}
                  {snapshot?.totalValueIsPartial ? (
                    <Badge variant="outline">Partial</Badge>
                  ) : null}
                </div>
              </div>

              <Button
                onClick={() => setAddDialogOpen(true)}
                size="lg"
                className="h-12 rounded-2xl px-5"
              >
                <Plus className="size-4" />
                Add Transaction
              </Button>
            </div>

            <div className="surface-line" />

            {coldLoad ? (
              <div className="px-4 py-4 md:px-6">
                <div className="overflow-hidden rounded-[1.4rem] border border-border/80">
                  <div className="grid grid-cols-[72px_1.1fr_0.9fr_repeat(4,minmax(120px,1fr))] gap-3 px-5 py-4">
                    {Array.from({ length: 7 }).map((_, index) => (
                      <Skeleton
                        key={index}
                        className="h-4 w-full rounded-full bg-muted/55"
                      />
                    ))}
                  </div>
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-[72px_1.1fr_0.9fr_repeat(4,minmax(120px,1fr))] gap-3 border-t border-border/70 px-5 py-5"
                    >
                      {Array.from({ length: 7 }).map((__, cellIndex) => (
                        <Skeleton
                          key={cellIndex}
                          className="h-5 w-full rounded-full bg-muted/55"
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ) : snapshot && snapshot.items.length > 0 ? (
              <div className="px-4 py-4 md:px-6">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[72px]" />
                      <TableHead>Ticker</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Avg Cost</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead className="text-right">P&amp;L %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {snapshot.items.map((holding) => {
                      const pnlIsPositive = (holding.pnl ?? 0) >= 0

                      return (
                        <TableRow key={holding.ticker}>
                          <TableCell className="text-muted-foreground">
                            <ChevronRight className="size-4" />
                          </TableCell>
                          <TableCell className="font-semibold text-foreground">
                            {holding.ticker}
                          </TableCell>
                          <TableCell>
                            <AssetTypePill assetType={holding.assetType} />
                          </TableCell>
                          <TableCell className="tabular-nums text-right text-foreground">
                            {formatQuantity(holding.quantity)}
                          </TableCell>
                          <TableCell className="tabular-nums text-right text-foreground">
                            {formatCurrency(
                              holding.avgCostBasis,
                              portfolio.homeCurrency,
                            )}
                          </TableCell>
                          <TableCell className="tabular-nums text-right text-foreground">
                            <div className="space-y-1">
                              <div>
                                {holding.currentPrice === null
                                  ? '—'
                                  : formatCurrency(
                                      holding.currentPrice,
                                      portfolio.homeCurrency,
                                    )}
                              </div>
                              {holding.cacheStatus === 'stale' ? (
                                <div className="flex justify-end">
                                  <StaleBadge />
                                </div>
                              ) : null}
                            </div>
                          </TableCell>
                          <TableCell className="tabular-nums text-right font-semibold text-foreground">
                            {holding.value === null
                              ? '—'
                              : formatCurrency(
                                  holding.value,
                                  portfolio.homeCurrency,
                                )}
                          </TableCell>
                          <TableCell
                            className={`tabular-nums text-right font-semibold ${
                              pnlIsPositive
                                ? 'text-[hsl(var(--positive))]'
                                : 'text-[hsl(var(--negative))]'
                            }`}
                          >
                            {holding.pnlPct === null ? '—' : formatPercent(holding.pnlPct)}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="px-6 py-14 text-center md:px-8">
                <p className="text-lg font-medium text-foreground">
                  No open positions right now.
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Your transaction history exists, but every position is fully sold.
                </p>
              </div>
            )}
          </section>
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
