import {
  IconTrendingDown,
  IconTrendingUp,
} from '@tabler/icons-react'
import { cn } from '#/shared/lib/utils'
import { formatCurrency, formatPercent } from '#/shared/lib/format'
import { Badge } from '#/shared/ui/badge'
import { Skeleton } from '#/shared/ui/skeleton'
import { LiveBadge, StaleBadge } from './price-status-badges'

type DashboardSummaryProps = {
  displayFxError: string | null
  displayedTotalValue: number
  holdingsDisplayCurrency: string
  isLoading: boolean
  lastUpdatedAt: number | null
  positionCount: number
  snapshotAnyStale: boolean
  statusText: string | null
  totalPnlIsPositive: boolean
  totalPnlPct: number
  totalValueIsPartial: boolean
}

export default function DashboardSummary({
  displayFxError,
  displayedTotalValue,
  holdingsDisplayCurrency,
  isLoading,
  lastUpdatedAt,
  positionCount,
  snapshotAnyStale,
  statusText,
  totalPnlIsPositive,
  totalPnlPct,
  totalValueIsPartial,
}: DashboardSummaryProps) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Total value
        </p>
        {isLoading ? null : (
          <p
            className={cn(
              'inline-flex items-center gap-1 text-xs font-medium tabular-nums',
              totalPnlIsPositive ? 'text-positive' : 'text-negative',
            )}
          >
            {totalPnlIsPositive ? (
              <IconTrendingUp className="size-3.5" />
            ) : (
              <IconTrendingDown className="size-3.5" />
            )}
            {formatPercent(totalPnlPct)}
          </p>
        )}
      </div>
      <div className="mt-2">
        {isLoading ? (
          <Skeleton className="h-14 w-56 rounded-full" />
        ) : (
          <p className="font-heading text-5xl tabular-nums text-foreground sm:text-6xl">
            {formatCurrency(displayedTotalValue, holdingsDisplayCurrency)}
          </p>
        )}
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        {isLoading ? null : (
          <>
            {positionCount} positions {' · '} total in {holdingsDisplayCurrency}
            {statusText ? (
              <>
                {' · '} {statusText}
              </>
            ) : lastUpdatedAt !== null ? (
              <>
                {' · '} <LiveBadge lastUpdatedAt={lastUpdatedAt} />
              </>
            ) : null}
            {snapshotAnyStale ? (
              <>
                {' · '} <StaleBadge />
              </>
            ) : null}
            {totalValueIsPartial ? (
              <>
                {' · '} <Badge variant="outline">Partial</Badge>
              </>
            ) : null}
            {displayFxError ? <> {' · '} FX unavailable</> : null}
          </>
        )}
      </p>
    </div>
  )
}
