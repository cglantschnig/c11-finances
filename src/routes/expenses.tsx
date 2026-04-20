import { createFileRoute } from '@tanstack/react-router'
import { ExpensesPage } from '#/features/expenses'

export const Route = createFileRoute('/expenses')({
  ssr: false,
  component: ExpensesPage,
})
