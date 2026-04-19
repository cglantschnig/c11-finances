import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { History, Plus, Trash2 } from 'lucide-react'
import type { Doc } from '../../convex/_generated/dataModel'
import type { Id } from '../../convex/_generated/dataModel'
import { api } from '../../convex/_generated/api'
import AddTransactionDialog from '#/components/AddTransactionDialog'
import PortfolioAppShell from '#/components/PortfolioAppShell'
import PortfolioGate from '#/components/PortfolioGate'
import { formatCurrency, formatQuantity } from '#/lib/format'
import { Button } from '#/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'

type Portfolio = Doc<'portfolios'>

export const Route = createFileRoute('/transactions')({
  ssr: false,
  component: TransactionsRoute,
})

function TransactionsRoute() {
  return (
    <PortfolioGate>
      {(portfolio) => <TransactionsScreen portfolio={portfolio} />}
    </PortfolioGate>
  )
}

function TransactionsScreen({ portfolio }: { portfolio: Portfolio }) {
  const transactions = useQuery(api.queries.listTransactions, {
    portfolioId: portfolio._id,
  })
  const deleteTransaction = useMutation(api.mutations.deleteTransaction)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  async function handleDelete(transactionId: Id<'transactions'>) {
    try {
      setDeleteError(null)
      setPendingDeleteId(transactionId)
      await deleteTransaction({
        transactionId,
      })
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
      <PortfolioAppShell
        title="Transactions"
        description="Raw reverse-chronological trade history for your default portfolio."
        onOpenAddTransaction={() => setAddDialogOpen(true)}
        portfolio={portfolio}
      >
        {transactions && transactions.length === 0 ? (
          <section className="app-shell rounded-[1.75rem] p-8 md:p-10">
            <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
              <div className="rounded-[1.5rem] border border-primary/20 bg-primary/10 p-4 text-primary">
                <History className="size-6" />
              </div>
              <h2 className="mt-5 text-3xl font-semibold text-foreground">
                No transactions yet.
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">
                Add your first buy or sell and it will appear here instantly.
              </p>
              <Button
                onClick={() => setAddDialogOpen(true)}
                className="mt-6 h-11 rounded-xl px-5"
              >
                <Plus className="size-4" />
                Add transaction
              </Button>
            </div>
          </section>
        ) : (
          <section className="app-shell rounded-[1.75rem] p-4 md:p-6">
            <div className="mb-4 px-2">
              <p className="eyebrow">Ledger</p>
              <h2 className="mt-1 text-xl font-semibold text-foreground">
                Transaction log
              </h2>
            </div>

            {!transactions ? (
              <div className="rounded-[1.25rem] border border-border/70 px-6 py-12 text-center text-sm text-muted-foreground">
                Loading transactions...
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border/70">
                    <TableHead>Date</TableHead>
                    <TableHead>Ticker</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Currency</TableHead>
                    <TableHead className="text-right">FX rate</TableHead>
                    <TableHead className="w-[96px] text-right">Delete</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) =>
                    confirmingId === transaction._id ? (
                      <TableRow key={transaction._id} className="border-border/60">
                        <TableCell colSpan={8}>
                          <div className="flex flex-col gap-3 rounded-[1.25rem] border border-destructive/35 bg-destructive/8 px-4 py-4 md:flex-row md:items-center md:justify-between">
                            <div className="space-y-1">
                              <p className="font-medium text-foreground">
                                Delete this transaction?
                              </p>
                              {deleteError ? (
                                <p className="text-sm text-destructive">
                                  {deleteError}
                                </p>
                              ) : null}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setConfirmingId(null)
                                  setDeleteError(null)
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleDelete(transaction._id)}
                                disabled={pendingDeleteId === transaction._id}
                              >
                                {pendingDeleteId === transaction._id
                                  ? 'Deleting...'
                                  : 'Confirm'}
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <TableRow
                        key={transaction._id}
                        className="border-border/60 hover:bg-muted/20"
                      >
                        <TableCell className="tabular-nums text-muted-foreground">
                          {transaction.date}
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          {transaction.ticker}
                        </TableCell>
                        <TableCell className="uppercase text-muted-foreground">
                          {transaction.side}
                        </TableCell>
                        <TableCell className="tabular-nums text-right text-foreground">
                          {formatQuantity(transaction.quantity)}
                        </TableCell>
                        <TableCell className="tabular-nums text-right text-foreground">
                          {formatCurrency(
                            transaction.pricePerUnit,
                            transaction.nativeCurrency,
                          )}
                        </TableCell>
                        <TableCell className="tabular-nums text-right text-muted-foreground">
                          {transaction.nativeCurrency}
                        </TableCell>
                        <TableCell className="tabular-nums text-right text-muted-foreground">
                          {transaction.fxRate.toFixed(6)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Delete ${transaction.ticker} transaction`}
                            onClick={() => {
                              setDeleteError(null)
                              setConfirmingId(transaction._id)
                            }}
                            className="rounded-xl text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            )}
          </section>
        )}
      </PortfolioAppShell>

      <AddTransactionDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        portfolio={portfolio}
      />
    </>
  )
}
