import { useEffect, useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useQuery } from 'convex/react'
import type { FunctionReturnType } from 'convex/server'
import {
  IconAlertTriangle,
  IconCoins,
  IconPlus,
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
import { fetchLatestFxRate } from '#/lib/fx'
import { cn } from '#/lib/utils'
import { refreshHoldings } from '#/lib/server/refresh-holdings'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
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

function formatLastUpdatedAt(timestamp: number) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(timestamp)
}

function LiveBadge({ lastUpdatedAt }: { lastUpdatedAt: number | null }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
          Live
        </Badge>
      </TooltipTrigger>
      <TooltipContent sideOffset={8}>
        {lastUpdatedAt === null
          ? 'Last update time unavailable.'
          : `Last updated at ${formatLastUpdatedAt(lastUpdatedAt)}.`}
      </TooltipContent>
    </Tooltip>
  )
}

function HoldingsSkeleton() {
  return (
    <>
      <div className="hidden md:block">
        <div className="overflow-hidden rounded-lg border">
          <div className="grid grid-cols-[140px_repeat(4,minmax(100px,1fr))] gap-3 border-b px-4 py-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-4 rounded-full" />
            ))}
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="grid grid-cols-[140px_repeat(4,minmax(100px,1fr))] gap-3 border-b px-4 py-4 last:border-b-0">
              {Array.from({ length: 5 }).map((__, j) => (
                <Skeleton key={j} className="h-5 rounded-full" />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-3 md:hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} size="sm">
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

function holdingsStatusText(
  snapshot: HoldingsSnapshot | null,
  isRefreshing: boolean,
  progressCount: number,
  refreshError: string | null,
) {
  if (refreshError) return refreshError
  if (isRefreshing) return `Refreshing ${progressCount}/${snapshot?.openPositionsCount ?? 0}`
  if (snapshot?.anyStale) return 'Cached prices'
  return null
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
  const userSettings = useQuery(api.queries.getUserSettings, {})
  const refreshHoldingsFn = useServerFn(refreshHoldings)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [refreshError, setRefreshError] = useState<string | null>(null)
  const [refreshedHoldings, setRefreshedHoldings] = useState<HoldingsSnapshot | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [progressCount, setProgressCount] = useState(0)
  const [totalValueFxRate, setTotalValueFxRate] = useState<number | null>(1)
  const [totalValueFxError, setTotalValueFxError] = useState<string | null>(null)

  const needsRefresh = Boolean(
    cachedHoldings &&
      cachedHoldings.hasOpenPositions &&
      (cachedHoldings.missingCount > 0 || cachedHoldings.anyStale),
  )

  useEffect(() => {
    if (!cachedHoldings || !needsRefresh) {
      if (!cachedHoldings?.hasOpenPositions) setRefreshedHoldings(null)
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
        setProgressCount((c) => Math.min(c + 1, cachedHoldings.openPositionsCount - 1))
      }, 450)
    } else {
      setProgressCount(cachedHoldings.cachedCount)
    }

    void refreshHoldingsFn({ data: { portfolioId: portfolio._id } })
      .then((result) => {
        if (isCancelled) return
        setRefreshedHoldings(result)
        setProgressCount(result.openPositionsCount)
      })
      .catch((error) => {
        if (!isCancelled)
          setRefreshError(error instanceof Error ? error.message : 'Unable to refresh prices right now.')
      })
      .finally(() => {
        if (!isCancelled) setIsRefreshing(false)
        if (progressTimer) window.clearInterval(progressTimer)
      })

    return () => {
      isCancelled = true
      if (progressTimer) window.clearInterval(progressTimer)
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

  const statusText = holdingsStatusText(
    snapshot,
    isRefreshing,
    progressCount,
    refreshError,
  )
  const lastUpdatedAt = useMemo(() => {
    const fetchedAtValues =
      snapshot?.items
        .map((item) => item.fetchedAt)
        .filter((value): value is number => value !== null) ?? []

    if (fetchedAtValues.length === 0) {
      return null
    }

    return Math.max(...fetchedAtValues)
  }, [snapshot])

  const totalValueCurrency = userSettings?.currency ?? portfolio.homeCurrency

  useEffect(() => {
    if (totalValueCurrency === portfolio.homeCurrency) {
      setTotalValueFxRate(1)
      setTotalValueFxError(null)
      return
    }

    const abortController = new AbortController()

    setTotalValueFxRate(null)
    setTotalValueFxError(null)

    void fetchLatestFxRate({
      base: portfolio.homeCurrency,
      quote: totalValueCurrency,
      signal: abortController.signal,
    })
      .then((rate) => {
        setTotalValueFxRate(rate)
      })
      .catch((error) => {
        if (abortController.signal.aborted) {
          return
        }

        setTotalValueFxError(
          error instanceof Error ? error.message : 'Unable to load FX rate.',
        )
      })

    return () => {
      abortController.abort()
    }
  }, [portfolio.homeCurrency, totalValueCurrency])

  const resolvedTotalValueCurrency =
    totalValueFxRate === null ? portfolio.homeCurrency : totalValueCurrency
  const displayedTotalValue =
    (snapshot?.totalValue ?? 0) * (totalValueFxRate ?? 1)
  const isTotalValueLoading =
    !isInitialLoad &&
    snapshot !== null &&
    totalValueCurrency !== portfolio.homeCurrency &&
    totalValueFxRate === null &&
    totalValueFxError === null

  return (
    <>
      <PortfolioAppShell
        title="Portfolio"
        onOpenAddTransaction={() => setAddDialogOpen(true)}
      >
        <div className="space-y-8">

          {/* Hero: total value */}
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Total value
            </p>
            <div className="mt-2">
              {isInitialLoad || isTotalValueLoading ? (
                <Skeleton className="h-14 w-56 rounded-full" />
              ) : (
                <p className="font-heading text-5xl tabular-nums text-foreground sm:text-6xl">
                  {formatCurrency(displayedTotalValue, resolvedTotalValueCurrency)}
                </p>
              )}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {isInitialLoad ? null : (
                <>
                  {snapshot?.items.length ?? 0} positions
                  {' · '}
                  total in {resolvedTotalValueCurrency}
                  {statusText ? (
                    <>
                      {' · '}
                      {statusText}
                    </>
                  ) : lastUpdatedAt !== null ? (
                    <>
                      {' · '}
                      <LiveBadge lastUpdatedAt={lastUpdatedAt} />
                    </>
                  ) : null}
                  {snapshot?.anyStale ? <> · <StaleBadge /></> : null}
                  {snapshot?.totalValueIsPartial ? <> · <Badge variant="outline">Partial</Badge></> : null}
                  {totalValueFxError ? <> · FX unavailable</> : null}
                </>
              )}
            </p>
          </div>

          {/* Empty state */}
          {snapshot && snapshot.hasTransactions === false ? (
            <Card className="shadow-sm">
              <CardContent className="py-12 text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <IconCoins className="size-7" />
                </div>
                <h3 className="mt-5 font-heading text-2xl text-foreground sm:text-3xl">
                  Your dashboard is ready for its first transaction.
                </h3>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                  Add a buy or sell to start building holdings and performance in {portfolio.homeCurrency}.
                </p>
                <Button onClick={() => setAddDialogOpen(true)} className="mt-6">
                  <IconPlus className="size-4" />
                  Add transaction
                </Button>
              </CardContent>
            </Card>
          ) : (
            /* Holdings */
            <div>
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Holdings
              </p>
              {coldLoad || isInitialLoad ? (
                <HoldingsSkeleton />
              ) : snapshot && snapshot.items.length > 0 ? (
                <>
                  {/* Desktop table */}
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead>Ticker</TableHead>
                          <TableHead className="text-right">Qty</TableHead>
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
                              <TableCell className="text-right tabular-nums text-muted-foreground">
                                {formatQuantity(holding.quantity)}
                              </TableCell>
                              <TableCell className="text-right tabular-nums">
                                <div className="inline-flex items-center gap-2">
                                  {holding.currentPrice === null
                                    ? '—'
                                    : formatCurrency(holding.currentPrice, portfolio.homeCurrency)}
                                  {holding.cacheStatus === 'stale' ? <StaleBadge /> : null}
                                </div>
                              </TableCell>
                              <TableCell className="text-right tabular-nums font-medium text-foreground">
                                {holding.value === null
                                  ? '—'
                                  : formatCurrency(holding.value, portfolio.homeCurrency)}
                              </TableCell>
                              <TableCell
                                className={cn(
                                  'text-right tabular-nums font-medium',
                                  pnlIsPositive ? 'text-positive' : 'text-negative',
                                )}
                              >
                                <div className="inline-flex items-center gap-1.5">
                                  {pnlIsPositive
                                    ? <IconTrendingUp className="size-4" />
                                    : <IconTrendingDown className="size-4" />}
                                  {holding.pnlPct === null ? '—' : formatPercent(holding.pnlPct)}
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile cards */}
                  <div className="grid gap-3 md:hidden">
                    {snapshot.items.map((holding) => {
                      const pnlIsPositive = (holding.pnl ?? 0) >= 0
                      return (
                        <Card key={holding.ticker} size="sm">
                          <CardContent className="grid gap-4 pt-3">
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-lg font-medium text-foreground">{holding.ticker}</p>
                              <p className="tabular-nums text-sm text-muted-foreground">
                                {formatQuantity(holding.quantity)} units
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Price</p>
                                <div className="mt-1 flex items-center gap-2">
                                  <span className="tabular-nums text-foreground">
                                    {holding.currentPrice === null
                                      ? '—'
                                      : formatCurrency(holding.currentPrice, portfolio.homeCurrency)}
                                  </span>
                                  {holding.cacheStatus === 'stale' ? <StaleBadge /> : null}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Value</p>
                                <p className="mt-1 tabular-nums font-medium text-foreground">
                                  {holding.value === null
                                    ? '—'
                                    : formatCurrency(holding.value, portfolio.homeCurrency)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">P&amp;L</p>
                                <p className={cn(
                                  'mt-1 inline-flex items-center gap-1 tabular-nums font-medium',
                                  pnlIsPositive ? 'text-positive' : 'text-negative',
                                )}>
                                  {pnlIsPositive
                                    ? <IconTrendingUp className="size-4" />
                                    : <IconTrendingDown className="size-4" />}
                                  {holding.pnlPct === null ? '—' : formatPercent(holding.pnlPct)}
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
                  <p className="font-medium text-foreground">No open positions right now.</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Your transaction history exists, but every position is fully sold.
                  </p>
                </div>
              )}
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
