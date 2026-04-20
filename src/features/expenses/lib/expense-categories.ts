export type ExpenseCategory =
  | 'entertainment'
  | 'food'
  | 'health'
  | 'housing'
  | 'other'
  | 'shopping'
  | 'transport'
  | 'work'

export const EXPENSE_CATEGORIES: {
  emoji: string
  label: string
  value: ExpenseCategory
}[] = [
  { emoji: '🍔', label: 'Food', value: 'food' },
  { emoji: '🚗', label: 'Transport', value: 'transport' },
  { emoji: '🏠', label: 'Housing', value: 'housing' },
  { emoji: '💊', label: 'Health', value: 'health' },
  { emoji: '🎉', label: 'Entertainment', value: 'entertainment' },
  { emoji: '📦', label: 'Shopping', value: 'shopping' },
  { emoji: '💼', label: 'Work', value: 'work' },
  { emoji: '⋯', label: 'Other', value: 'other' },
]

export function categoryLabel(category: ExpenseCategory | undefined): string {
  if (!category) return 'Income'
  return EXPENSE_CATEGORIES.find((c) => c.value === category)?.label ?? 'Other'
}

export function categoryEmoji(category: ExpenseCategory | undefined): string {
  if (!category) return '💰'
  return EXPENSE_CATEGORIES.find((c) => c.value === category)?.emoji ?? '⋯'
}
