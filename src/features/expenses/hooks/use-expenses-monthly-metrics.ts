import { useMemo } from 'react'
import type { FunctionReturnType } from 'convex/server'
import type { api } from '../../../../convex/_generated/api'

type ExpensesList = NonNullable<
  FunctionReturnType<typeof api.queries.listExpensesByMonth>
>

export type MonthlyMetrics = {
  income: number
  savingsRate: number | null
  saved: number
  spent: number
}

export function useExpensesMonthlyMetrics(
  expenses: ExpensesList | null | undefined,
): MonthlyMetrics {
  return useMemo(() => {
    if (!expenses) {
      return { income: 0, savingsRate: null, saved: 0, spent: 0 }
    }

    const income = expenses
      .filter((e) => e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0)

    const spent = expenses
      .filter((e) => e.type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0)

    const saved = income - spent
    const savingsRate = income > 0 && saved > 0 ? (saved / income) * 100 : null

    return { income, savingsRate, saved, spent }
  }, [expenses])
}
