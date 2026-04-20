import {
  IconTrendingDown,
  IconTrendingUp,
} from '@tabler/icons-react'
import { formatCurrency, formatPercent, formatQuantity } from '#/shared/lib/format'
import { cn } from '#/shared/lib/utils'
import { Card, CardContent } from '#/shared/ui/card'
import type { DashboardHoldingRow } from '#/features/dashboard/hooks/use-dashboard-display-metrics'
import { StaleBadge } from './price-status-badges'

type HoldingsCardsProps = {
  currency: string
  rows: DashboardHoldingRow[]
}

export default function HoldingsCards({ currency, rows }: HoldingsCardsProps) {
  return rows.map((holding) => (
    <Card key={holding.ticker} size="sm">
      <CardContent className="grid gap-4 pt-3">
        <div className="flex items-start justify-between gap-3">
          <p className="text-lg font-medium text-foreground">{holding.ticker}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Units
            </p>
            <p className="mt-1 tabular-nums text-foreground">
              {formatQuantity(holding.quantity)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Average cost
            </p>
            <p className="mt-1 tabular-nums text-foreground">
              {formatCurrency(holding.avgCostBasis, currency)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Current price
            </p>
            <p className="mt-1 tabular-nums text-foreground">
              {holding.currentPrice === null
                ? '—'
                : formatCurrency(holding.currentPrice, currency)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Current value
            </p>
            <div className="mt-1 flex items-center gap-2">
              <p className="tabular-nums font-medium text-foreground">
                {holding.currentValue === null
                  ? '—'
                  : formatCurrency(holding.currentValue, currency)}
              </p>
              {holding.cacheStatus === 'stale' ? <StaleBadge /> : null}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              P&amp;L
            </p>
            <p
              className={cn(
                'mt-1 inline-flex items-center gap-1 tabular-nums font-medium',
                holding.pnlIsPositive ? 'text-positive' : 'text-negative',
              )}
            >
              {holding.pnlIsPositive ? (
                <IconTrendingUp className="size-4" />
              ) : (
                <IconTrendingDown className="size-4" />
              )}
              {holding.pnlPct === null ? '—' : formatPercent(holding.pnlPct)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  ))
}
