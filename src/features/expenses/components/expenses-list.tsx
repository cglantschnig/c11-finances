import { useMemo } from 'react'
import { useMutation } from 'convex/react'
import { format, parseISO } from 'date-fns'
import type { FunctionReturnType } from 'convex/server'
import type { Id } from '../../../../convex/_generated/dataModel'
import { api } from '../../../../convex/_generated/api'
import { formatCurrency } from '#/shared/lib/format'
import { categoryEmoji, categoryLabel } from '../lib/expense-categories'

type ExpensesList = NonNullable<
  FunctionReturnType<typeof api.queries.listExpensesByMonth>
>
type Expense = ExpensesList[number]

type CategoryFilter = Expense['category'] | 'income' | 'all'

type Props = {
  currency: string
  expenses: ExpensesList
  filter: CategoryFilter
}

export default function ExpensesList({ currency, expenses, filter }: Props) {
  const deleteExpense = useMutation(api.mutations.deleteExpense)

  const filtered = useMemo(() => {
    if (filter === 'all') return expenses
    if (filter === 'income') return expenses.filter((e) => e.type === 'income')
    return expenses.filter((e) => e.category === filter)
  }, [expenses, filter])

  const grouped = useMemo(() => {
    const map = new Map<string, Expense[]>()
    for (const expense of filtered) {
      const day = expense.date
      if (!map.has(day)) map.set(day, [])
      map.get(day)!.push(expense)
    }
    return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a))
  }, [filtered])

  if (grouped.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No entries for this filter.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {grouped.map(([date, items]) => {
        const dayNet = items.reduce(
          (sum, e) => sum + (e.type === 'income' ? e.amount : -e.amount),
          0,
        )
        return (
          <div key={date}>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {format(parseISO(date), 'EEE, MMM d')}
              </p>
              <p
                className={`text-xs font-medium ${dayNet >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}
              >
                {dayNet >= 0 ? '+' : ''}
                {formatCurrency(dayNet, currency)}
              </p>
            </div>
            <div className="divide-y divide-border rounded-xl border bg-card">
              {items.map((expense) => (
                <div
                  key={expense._id}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <span className="text-xl leading-none">
                    {expense.type === 'income'
                      ? '💰'
                      : categoryEmoji(expense.category)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {expense.type === 'income'
                        ? 'Income'
                        : categoryLabel(expense.category)}
                    </p>
                    {expense.note && (
                      <p className="truncate text-xs text-muted-foreground">
                        {expense.note}
                      </p>
                    )}
                  </div>
                  <p
                    className={`shrink-0 text-sm font-semibold tabular-nums ${
                      expense.type === 'income'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-500 dark:text-red-400'
                    }`}
                  >
                    {expense.type === 'income' ? '+' : '-'}
                    {formatCurrency(expense.amount, currency)}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      void deleteExpense({
                        expenseId: expense._id as Id<'expenses'>,
                      })
                    }
                    className="shrink-0 rounded p-1 text-muted-foreground/50 hover:text-destructive"
                    aria-label="Delete"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
