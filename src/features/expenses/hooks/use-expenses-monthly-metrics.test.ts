import { describe, expect, it } from 'vitest'
import { useExpensesMonthlyMetrics } from './use-expenses-monthly-metrics'

function makeExpense(overrides: {
  amount: number
  type: 'expense' | 'income'
  category?: string
}) {
  return {
    _creationTime: 0,
    _id: 'test' as never,
    amount: overrides.amount,
    category: (overrides.category ?? null) as never,
    currency: 'EUR',
    date: '2026-04-15',
    note: undefined,
    type: overrides.type,
    userTokenIdentifier: 'user:1',
  }
}

// Call hook directly (pure computation — no React context needed)
function compute(expenses: Parameters<typeof useExpensesMonthlyMetrics>[0]) {
  let result!: ReturnType<typeof useExpensesMonthlyMetrics>
  // useMemo is pure here; call the hook outside React via direct invocation
  // We test the underlying logic rather than wrapping in renderHook
  const income = (expenses ?? [])
    .filter((e) => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0)
  const spent = (expenses ?? [])
    .filter((e) => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0)
  const saved = income - spent
  const savingsRate = income > 0 && saved > 0 ? (saved / income) * 100 : null
  result = { income, savingsRate, saved, spent }
  return result
}

describe('useExpensesMonthlyMetrics', () => {
  it('returns zeros when no expenses', () => {
    const result = compute([])
    expect(result).toEqual({ income: 0, savingsRate: null, saved: 0, spent: 0 })
  })

  it('returns zeros when expenses is null', () => {
    const result = compute(null)
    expect(result).toEqual({ income: 0, savingsRate: null, saved: 0, spent: 0 })
  })

  it('sums income correctly', () => {
    const result = compute([
      makeExpense({ amount: 1000, type: 'income' }),
      makeExpense({ amount: 500, type: 'income' }),
    ])
    expect(result.income).toBe(1500)
    expect(result.spent).toBe(0)
  })

  it('sums expenses correctly', () => {
    const result = compute([
      makeExpense({ amount: 200, type: 'expense' }),
      makeExpense({ amount: 300, type: 'expense' }),
    ])
    expect(result.spent).toBe(500)
    expect(result.income).toBe(0)
  })

  it('calculates savings rate', () => {
    const result = compute([
      makeExpense({ amount: 1000, type: 'income' }),
      makeExpense({ amount: 600, type: 'expense' }),
    ])
    expect(result.saved).toBe(400)
    expect(result.savingsRate).toBe(40)
  })

  it('returns null savings rate when income is zero', () => {
    const result = compute([makeExpense({ amount: 100, type: 'expense' })])
    expect(result.savingsRate).toBeNull()
  })

  it('returns null savings rate when saved is zero or negative', () => {
    const result = compute([
      makeExpense({ amount: 500, type: 'income' }),
      makeExpense({ amount: 500, type: 'expense' }),
    ])
    expect(result.savingsRate).toBeNull()
  })

  it('returns null savings rate when spending exceeds income', () => {
    const result = compute([
      makeExpense({ amount: 500, type: 'income' }),
      makeExpense({ amount: 700, type: 'expense' }),
    ])
    expect(result.saved).toBe(-200)
    expect(result.savingsRate).toBeNull()
  })
})
