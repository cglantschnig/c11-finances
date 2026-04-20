import { useState } from 'react'
import { useQuery } from 'convex/react'
import { format, addMonths, subMonths, parseISO } from 'date-fns'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { api } from '../../../convex/_generated/api'
import { PortfolioGate } from '#/features/portfolio'
import PortfolioAppShell from '#/features/portfolio/components/portfolio-app-shell'
import { todayIsoDate } from '#/shared/lib/format'
import { Skeleton } from '#/shared/ui/skeleton'
import ExpensesSummaryStrip from './components/expenses-summary-strip'
import ExpensesEmptyState from './components/expenses-empty-state'
import ExpensesList from './components/expenses-list'
import AddExpenseSheet from './components/add-expense-sheet'
import { useExpensesMonthlyMetrics } from './hooks/use-expenses-monthly-metrics'
import { EXPENSE_CATEGORIES } from './lib/expense-categories'
import type { ExpenseCategory } from './lib/expense-categories'

type CategoryFilter = ExpenseCategory | 'income' | 'all'

export function ExpensesPage() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const userSettings = useQuery(api.queries.getUserSettings, {})
  const currency = userSettings?.currency ?? 'EUR'

  return (
    <PortfolioGate>
      {() => (
        <>
          <PortfolioAppShell
            title="Expenses"
            headerButtonLabel="Add expense"
            onOpenAddTransaction={() => setSheetOpen(true)}
            showMobileHeaderModeToggle={false}
          >
            <ExpensesScreen
              currency={currency ?? 'EUR'}
              onAdd={() => setSheetOpen(true)}
            />
          </PortfolioAppShell>
          <AddExpenseSheet
            currency={currency ?? 'EUR'}
            open={sheetOpen}
            onOpenChange={setSheetOpen}
          />
        </>
      )}
    </PortfolioGate>
  )
}

function ExpensesScreen({
  currency,
  onAdd,
}: {
  currency: string
  onAdd: () => void
}) {
  const today = todayIsoDate()
  const [yearMonth, setYearMonth] = useState(() => today.slice(0, 7))
  const [filter, setFilter] = useState<CategoryFilter>('all')

  const expenses = useQuery(api.queries.listExpensesByMonth, { yearMonth })
  const metrics = useExpensesMonthlyMetrics(expenses)

  const currentDate = parseISO(`${yearMonth}-01`)
  const prevMonth = format(subMonths(currentDate, 1), 'yyyy-MM')
  const nextMonth = format(addMonths(currentDate, 1), 'yyyy-MM')
  const isCurrentMonth = yearMonth === today.slice(0, 7)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-3xl text-foreground sm:text-4xl">
          Expenses
        </h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setYearMonth(prevMonth)}
            className="rounded-lg p-2 hover:bg-muted"
            aria-label="Previous month"
          >
            <IconChevronLeft className="size-4" />
          </button>
          <span className="min-w-[7rem] text-center text-sm font-medium">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <button
            type="button"
            onClick={() => setYearMonth(nextMonth)}
            disabled={isCurrentMonth}
            className="rounded-lg p-2 hover:bg-muted disabled:opacity-30"
            aria-label="Next month"
          >
            <IconChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {expenses == null ? (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        </div>
      ) : (
        <ExpensesSummaryStrip currency={currency} metrics={metrics} />
      )}

      {/* Category filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(
          [
            { label: 'All', value: 'all' as CategoryFilter },
            ...EXPENSE_CATEGORIES.map((c) => ({
              label: c.label,
              value: c.value as CategoryFilter,
            })),
            { label: 'Income', value: 'income' as CategoryFilter },
          ] as { label: string; value: CategoryFilter }[]
        ).map((pill) => (
          <button
            key={pill.value}
            type="button"
            onClick={() => setFilter(pill.value)}
            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              filter === pill.value
                ? 'border-foreground bg-foreground text-background'
                : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {expenses == null ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : expenses.length === 0 ? (
        <ExpensesEmptyState onAdd={onAdd} />
      ) : (
        <ExpensesList currency={currency} expenses={expenses} filter={filter} />
      )}
    </div>
  )
}
