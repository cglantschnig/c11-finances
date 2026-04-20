import { Link } from '@tanstack/react-router'
import { formatCurrency } from '#/shared/lib/format'
import type { MonthlyMetrics } from '../hooks/use-expenses-monthly-metrics'

type Props = {
  currency: string
  metrics: MonthlyMetrics
}

export default function ExpensesSummaryStrip({ currency, metrics }: Props) {
  const { income, savingsRate, saved, spent } = metrics

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Income
          </p>
          <p className="mt-1 font-heading text-xl font-semibold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(income, currency)}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Spent
          </p>
          <p className="mt-1 font-heading text-xl font-semibold text-red-500 dark:text-red-400">
            {formatCurrency(spent, currency)}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Saved
          </p>
          <p
            className={`mt-1 font-heading text-xl font-semibold ${saved < 0 ? 'text-red-500 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}
          >
            {formatCurrency(saved, currency)}
          </p>
          {savingsRate !== null && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {savingsRate.toFixed(0)}% rate
            </p>
          )}
        </div>
      </div>

      {saved > 0 && (
        <Link
          to="/transactions"
          search={{ addNew: true }}
          className="flex items-center gap-1.5 rounded-lg border border-dashed px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground no-underline"
        >
          <span className="text-base">→</span>
          <span>
            {formatCurrency(saved, currency)} available to invest this month
          </span>
        </Link>
      )}
    </div>
  )
}
