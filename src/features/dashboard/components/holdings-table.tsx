import { formatCurrency, formatPercent, formatQuantity } from '#/shared/lib/format'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/shared/ui/table'
import type { DashboardHoldingRow } from '#/features/dashboard/hooks/use-dashboard-display-metrics'
import { StaleBadge } from './price-status-badges'
import { cn } from '#/shared/lib/utils'
import {
  IconTrendingDown,
  IconTrendingUp,
} from '@tabler/icons-react'

type HoldingsTableProps = {
  currency: string
  rows: DashboardHoldingRow[]
}

export default function HoldingsTable({ currency, rows }: HoldingsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Asset</TableHead>
          <TableHead className="text-right">Qty</TableHead>
          <TableHead className="text-right">Average cost</TableHead>
          <TableHead className="text-right">Current price</TableHead>
          <TableHead className="text-right">Current value</TableHead>
          <TableHead className="text-right">P&amp;L</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((holding) => (
          <TableRow key={holding.ticker}>
            <TableCell className="font-medium text-foreground">
              {holding.ticker}
            </TableCell>
            <TableCell className="text-right tabular-nums text-muted-foreground">
              {formatQuantity(holding.quantity)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatCurrency(holding.avgCostBasis, currency)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {holding.currentPrice === null
                ? '—'
                : formatCurrency(holding.currentPrice, currency)}
            </TableCell>
            <TableCell className="text-right tabular-nums font-medium text-foreground">
              <div className="inline-flex items-center gap-2">
                {holding.currentValue === null
                  ? '—'
                  : formatCurrency(holding.currentValue, currency)}
                {holding.cacheStatus === 'stale' ? <StaleBadge /> : null}
              </div>
            </TableCell>
            <TableCell
              className={cn(
                'text-right tabular-nums font-medium',
                holding.pnlIsPositive ? 'text-positive' : 'text-negative',
              )}
            >
              <div className="inline-flex items-center gap-1.5">
                {holding.pnlIsPositive ? (
                  <IconTrendingUp className="size-4" />
                ) : (
                  <IconTrendingDown className="size-4" />
                )}
                {holding.pnlPct === null ? '—' : formatPercent(holding.pnlPct)}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
