import { useEffect, useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { cva } from 'class-variance-authority'
import { useQuery } from 'convex/react'
import type { FunctionReturnType } from 'convex/server'
import {
  IconAlertTriangle,
  IconArrowUpRight,
  IconBuildingBank,
  IconCoins,
  IconPlus,
  IconRefresh,
  IconTrendingDown,
  IconTrendingUp,
} from '@tabler/icons-react'
import { api } from '../../convex/_generated/api'
import type { Doc } from '../../convex/_generated/dataModel'
import AddTransactionDialog from '#/components/add-transaction-dialog'
import PortfolioAppShell from '#/components/portfolio-app-shell'
import PortfolioGate from '#/components/portfolio-gate'
import {
  formatCurrency,
  formatPercent,
  formatQuantity,
} from '#/lib/format'
import { cn } from '#/lib/utils'
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

type Portfolio = Doc<'portfolios'>
type HoldingsSnapshot = NonNullable<
  FunctionReturnType<typeof api.queries.getCachedHoldings>
>

const assetBadgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-1 text-[0.7rem] font-medium uppercase tracking-[0.14em]',
  {
    variants: {
      tone: {
        equity: 'border-primary/20 bg-primary/10 text-primary',
        crypto: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      },
    },
    defaultVariants: {
      tone: 'equity',
    },
  },
)

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
          className="border-warning/20 bg-warning/10 text-warning"
        >
          <IconAlertTriangle className="size-3" />
          Stale
        </Badge>
      </TooltipTrigger>
      <TooltipContent sideOffset={8}>
        Price may be up to 15 min old.
      </TooltipContent>
    </Tooltip>
  )
}

function AssetTypeBadge({ assetType }: { assetType: string }) {
  const tone = assetType === 'crypto' ? 'crypto' : 'equity'

  return (
    <span className={assetBadgeVariants({ tone })}>
      {assetType.toUpperCase()}
    </span>
  )
}

function MetricCard({
  description,
  icon: Icon,
  label,
  value,
}: {
  description: React.ReactNode
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: React.ReactNode
}) {
  return (
    <Card size="sm" className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {label}
            </p>
            <CardTitle className="mt-2 text-2xl sm:text-3xl">{value}</CardTitle>
          </div>
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="text-sm leading-6 text-muted-foreground">
        {description}
      </CardContent>
    </Card>
  )
}

function HoldingsSkeleton() {
  return (
    <>
      <div className="hidden md:block">
        <div className="overflow-hidden rounded-lg border">
          <div className="grid grid-cols-[140px_120px_repeat(5,minmax(120px,1fr))] gap-3 border-b px-4 py-3">
            {Array.from({ length: 7 }).map((_, index) => (
              <Skeleton key={index} className="h-4 rounded-full" />
            ))}
          </div>
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-[140px_120px_repeat(5,minmax(120px,1fr))] gap-3 border-b px-4 py-4 last:border-b-0"
            >
              {Array.from({ length: 7 }).map((__, cellIndex) => (
                <Skeleton key={cellIndex} className="h-5 rounded-full" />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-3 md:hidden">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} size="sm">
            <CardContent className="grid gap-3 pt-3">
              <Skeleton className="h-5 w-28 rounded-full" />
              <Skeleton className="h-4 w-full rounded-full" />
              <Skeleton className="h-4 w-3/4 rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
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

  const isInitialLoad = cachedHoldings === undefined && refreshedHoldings === null

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
        <div className="space-y-6">
          <div className="space-y-3">
            <Badge variant="outline" className="w-fit">
              Portfolio
            </Badge>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="font-heading text-3xl text-foreground sm:text-4xl">
                  Current holdings
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Track open positions, cached pricing freshness, and unrealized
                  performance in {portfolio.homeCurrency}.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>{snapshot?.items.length ?? 0} holdings</span>
                <span className="hidden sm:inline">&middot;</span>
                <span>{portfolio.homeCurrency} reporting</span>
                {snapshot?.anyStale ? <StaleBadge /> : null}
                {snapshot?.totalValueIsPartial ? (
                  <Badge variant="outline">Partial</Badge>
                ) : null}
              </div>
            </div>
          </div>

          {snapshot && snapshot.hasTransactions === false ? (
            <Card className="shadow-sm">
              <CardContent className="py-12 text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <IconCoins className="size-7" />
                </div>
                <h3 className="mt-5 font-heading text-2xl text-foreground sm:text-3xl">
                  Your dashboard is ready for its first transaction.
                </h3>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Add a buy or sell to start building holdings, market value,
                  and performance in {portfolio.homeCurrency}.
                </p>
                <Button onClick={() => setAddDialogOpen(true)} className="mt-6">
                  <IconPlus className="size-4" />
                  Add transaction
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 lg:grid-cols-3">
                <MetricCard
                  icon={IconCoins}
                  label="Total value"
                  value={
                    isInitialLoad ? (
                      <Skeleton className="mt-2 h-10 w-40 rounded-full" />
                    ) : (
                      formatCurrency(snapshot?.totalValue ?? 0, portfolio.homeCurrency)
                    )
                  }
                  description={
                    <span className="inline-flex items-center gap-2">
                      <IconArrowUpRight className="size-4 text-primary" />
                      Market value across all currently open positions.
                    </span>
                  }
                />

                <MetricCard
                  icon={IconRefresh}
                  label="Pricing status"
                  value={isInitialLoad ? <Skeleton className="mt-2 h-10 w-32 rounded-full" /> : statusText}
                  description={
                    <div className="flex flex-wrap items-center gap-2">
                      <span>{snapshot?.openPositionsCount ?? 0} tracked positions</span>
                      {snapshot?.anyStale ? <StaleBadge /> : null}
                    </div>
                  }
                />

                <MetricCard
                  icon={IconBuildingBank}
                  label="Home currency"
                  value={portfolio.homeCurrency}
                  description="All holdings, performance, and dashboard totals are shown in this base currency."
                />
              </div>

              <Card className="shadow-sm">
                <CardHeader className="border-b">
                  <CardTitle>Holdings</CardTitle>
                  <CardDescription>
                    Open positions with quantity, average cost, current pricing,
                    total value, and unrealized performance.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {coldLoad || isInitialLoad ? (
                    <HoldingsSkeleton />
                  ) : snapshot && snapshot.items.length > 0 ? (
                    <>
                      <div className="hidden md:block">
                        <Table>
                          <TableHeader>
                            <TableRow className="hover:bg-transparent">
                              <TableHead>Ticker</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead className="text-right">Quantity</TableHead>
                              <TableHead className="text-right">Avg cost</TableHead>
                              <TableHead className="text-right">Price</TableHead>
                              <TableHead className="text-right">Value</TableHead>
                              <TableHead className="text-right">P&amp;L</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {snapshot.items.map((holding) => {
                              const pnlIsPositive = (holding.pnl ?? 0) >= 0

                              return (
                                <TableRow key={holding.ticker}>
                                  <TableCell className="font-medium text-foreground">
                                    {holding.ticker}
                                  </TableCell>
                                  <TableCell>
                                    <AssetTypeBadge assetType={holding.assetType} />
                                  </TableCell>
                                  <TableCell className="text-right tabular-nums">
                                    {formatQuantity(holding.quantity)}
                                  </TableCell>
                                  <TableCell className="text-right tabular-nums">
                                    {formatCurrency(
                                      holding.avgCostBasis,
                                      portfolio.homeCurrency,
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right tabular-nums">
                                    <div className="flex flex-col items-end gap-1">
                                      <span>
                                        {holding.currentPrice === null
                                          ? '—'
                                          : formatCurrency(
                                              holding.currentPrice,
                                              portfolio.homeCurrency,
                                            )}
                                      </span>
                                      {holding.cacheStatus === 'stale' ? (
                                        <StaleBadge />
                                      ) : null}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right tabular-nums font-medium text-foreground">
                                    {holding.value === null
                                      ? '—'
                                      : formatCurrency(
                                          holding.value,
                                          portfolio.homeCurrency,
                                        )}
                                  </TableCell>
                                  <TableCell
                                    className={cn(
                                      'text-right tabular-nums font-medium',
                                      pnlIsPositive ? 'text-positive' : 'text-negative',
                                    )}
                                  >
                                    <div className="inline-flex items-center gap-1.5">
                                      {pnlIsPositive ? (
                                        <IconTrendingUp className="size-4" />
                                      ) : (
                                        <IconTrendingDown className="size-4" />
                                      )}
                                      {holding.pnlPct === null
                                        ? '—'
                                        : formatPercent(holding.pnlPct)}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>

                      <div className="grid gap-3 md:hidden">
                        {snapshot.items.map((holding) => {
                          const pnlIsPositive = (holding.pnl ?? 0) >= 0

                          return (
                            <Card key={holding.ticker} size="sm">
                              <CardContent className="grid gap-4 pt-3">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-lg font-medium text-foreground">
                                      {holding.ticker}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {formatQuantity(holding.quantity)} units
                                    </p>
                                  </div>
                                  <AssetTypeBadge assetType={holding.assetType} />
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                                      Avg cost
                                    </p>
                                    <p className="mt-1 tabular-nums text-foreground">
                                      {formatCurrency(
                                        holding.avgCostBasis,
                                        portfolio.homeCurrency,
                                      )}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                                      Price
                                    </p>
                                    <div className="mt-1 flex items-center gap-2">
                                      <span className="tabular-nums text-foreground">
                                        {holding.currentPrice === null
                                          ? '—'
                                          : formatCurrency(
                                              holding.currentPrice,
                                              portfolio.homeCurrency,
                                            )}
                                      </span>
                                      {holding.cacheStatus === 'stale' ? (
                                        <StaleBadge />
                                      ) : null}
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                                      Value
                                    </p>
                                    <p className="mt-1 tabular-nums font-medium text-foreground">
                                      {holding.value === null
                                        ? '—'
                                        : formatCurrency(
                                            holding.value,
                                            portfolio.homeCurrency,
                                          )}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                                      P&amp;L
                                    </p>
                                    <p
                                      className={cn(
                                        'mt-1 inline-flex items-center gap-1 tabular-nums font-medium',
                                        pnlIsPositive
                                          ? 'text-positive'
                                          : 'text-negative',
                                      )}
                                    >
                                      {pnlIsPositive ? (
                                        <IconTrendingUp className="size-4" />
                                      ) : (
                                        <IconTrendingDown className="size-4" />
                                      )}
                                      {holding.pnlPct === null
                                        ? '—'
                                        : formatPercent(holding.pnlPct)}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="py-8 text-center">
                      <p className="font-medium text-foreground">
                        No open positions right now.
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Your transaction history exists, but every position is
                        fully sold.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
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
