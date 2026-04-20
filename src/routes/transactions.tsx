import { createFileRoute } from '@tanstack/react-router'
import { TransactionsPage } from '#/features/transactions'

export const Route = createFileRoute('/transactions')({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    addNew: search.addNew === 'true',
  }),
  component: TransactionsRouteComponent,
})

function TransactionsRouteComponent() {
  const { addNew } = Route.useSearch()
  return <TransactionsPage addNew={addNew} />
}
