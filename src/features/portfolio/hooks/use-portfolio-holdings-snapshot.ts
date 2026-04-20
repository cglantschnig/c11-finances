import { useEffect, useMemo, useState } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import type { ViewerPortfolio } from '#/features/portfolio/components/portfolio-gate'
import { refreshHoldings } from '#/features/portfolio/server/refresh-holdings'

export function usePortfolioHoldingsSnapshot(portfolio: ViewerPortfolio) {
  const cachedHoldings = useQuery(api.queries.getCachedHoldings, {
    portfolioId: portfolio._id,
  })
  const refreshHoldingsFn = useServerFn(refreshHoldings)
  const [refreshError, setRefreshError] = useState<string | null>(null)
  const [refreshedHoldings, setRefreshedHoldings] = useState<
    NonNullable<typeof cachedHoldings> | null
  >(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [progressCount, setProgressCount] = useState(0)

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
        setProgressCount((count) =>
          Math.min(count + 1, cachedHoldings.openPositionsCount - 1),
        )
      }, 450)
    } else {
      setProgressCount(cachedHoldings.cachedCount)
    }

    void refreshHoldingsFn({ data: { portfolioId: portfolio._id } })
      .then((result) => {
        if (!isCancelled) {
          setRefreshedHoldings(result)
          setProgressCount(result.openPositionsCount)
        }
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

  const coldLoad =
    (cachedHoldings?.hasOpenPositions ?? false) &&
    (cachedHoldings?.cachedCount ?? 0) === 0 &&
    isRefreshing &&
    refreshedHoldings === null

  return {
    cachedHoldings,
    coldLoad,
    isInitialLoad: cachedHoldings === undefined && refreshedHoldings === null,
    isRefreshing,
    lastUpdatedAt,
    progressCount,
    refreshError,
    snapshot,
  }
}
