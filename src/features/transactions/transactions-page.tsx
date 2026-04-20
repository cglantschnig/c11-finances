import { useMemo, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import type { FunctionReturnType } from 'convex/server'
import type { Id } from '../../../convex/_generated/dataModel'
import { api } from '../../../convex/_generated/api'
import { PortfolioPageLayout, type ViewerPortfolio } from '#/features/portfolio'
import DeleteTransactionAlert from '#/features/transactions/components/delete-transaction-alert'
import TransactionsEmptyState from '#/features/transactions/components/transactions-empty-state'
import TransactionsTable from '#/features/transactions/components/transactions-table'
import TransactionCards from '#/features/transactions/components/transaction-cards'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/shared/ui/card'
import { Skeleton } from '#/shared/ui/skeleton'

type TransactionsList = NonNullable<
  FunctionReturnType<typeof api.queries.listTransactions>
>

export function TransactionsPage() {
  return (
    <PortfolioPageLayout title="Transactions">
      {({ openAddTransaction, portfolio }) => (
        <TransactionsScreen
          portfolio={portfolio}
          onOpenAddTransaction={openAddTransaction}
        />
      )}
    </PortfolioPageLayout>
  )
}

function TransactionsScreen({
  onOpenAddTransaction,
  portfolio,
}: {
  onOpenAddTransaction: () => void
  portfolio: ViewerPortfolio
}) {
  const transactions = useQuery(api.queries.listTransactions, {
    portfolioId: portfolio._id,
  })
  const deleteTransaction = useMutation(api.mutations.deleteTransaction)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const confirmingTransaction = useMemo(
    () => transactions?.find((transaction) => transaction._id === confirmingId) ?? null,
    [confirmingId, transactions],
  )

  async function handleDelete(transactionId: Id<'transactions'>) {
    try {
      setDeleteError(null)
      setPendingDeleteId(transactionId)
      await deleteTransaction({ transactionId })
      setConfirmingId(null)
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : 'Unable to delete this transaction.',
      )
    } finally {
      setPendingDeleteId(null)
    }
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h2 className="font-heading text-3xl text-foreground sm:text-4xl">
            Transactions
          </h2>
        </div>

        {transactions === undefined ? (
          <Card className="shadow-sm">
            <CardHeader className="border-b">
              <CardTitle>Ledger</CardTitle>
              <CardDescription>Loading transactions...</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-12 rounded-lg" />
              ))}
            </CardContent>
          </Card>
        ) : transactions.length === 0 ? (
          <TransactionsEmptyState onOpenAddTransaction={onOpenAddTransaction} />
        ) : (
          <Card className="shadow-sm">
            <CardHeader className="border-b">
              <CardTitle>Ledger</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="hidden md:block">
                <TransactionsTable
                  transactions={transactions}
                  onDelete={(transactionId) => {
                    setDeleteError(null)
                    setConfirmingId(transactionId)
                  }}
                />
              </div>
              <div className="grid gap-3 md:hidden">
                <TransactionCards
                  transactions={transactions}
                  onDelete={(transactionId) => {
                    setDeleteError(null)
                    setConfirmingId(transactionId)
                  }}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <DeleteTransactionAlert
        deleteError={deleteError}
        confirmingId={confirmingId}
        confirmingTransaction={confirmingTransaction}
        pendingDeleteId={pendingDeleteId}
        onDelete={(transactionId) => {
          void handleDelete(transactionId)
        }}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmingId(null)
            setDeleteError(null)
          }
        }}
      />
    </>
  )
}

export type TransactionListItem = TransactionsList[number]
