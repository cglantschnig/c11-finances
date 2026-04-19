import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { History, Plus, Trash2 } from 'lucide-react'
import type { Doc, Id } from '../../convex/_generated/dataModel'
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
        onOpenAddTransaction={() => setAddDialogOpen(true)}
        portfolio={portfolio}
      >
        {transactions && transactions.length === 0 ? (
          <section className="app-shell overflow-hidden rounded-[1.8rem]">
            <div className="flex flex-col gap-8 px-6 py-7 md:px-8 md:py-9 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <p className="eyebrow">Transactions</p>
                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-foreground md:text-5xl">
                  No trades have been recorded yet.
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground md:text-base">
                  Add your first buy or sell and the full ledger will appear here
                  in reverse chronological order.
                </p>
              </div>

              <Button
                onClick={() => setAddDialogOpen(true)}
                size="lg"
                className="h-12 rounded-2xl px-5"
              >
                <Plus className="size-4" />
                Add Transaction
              </Button>
            </div>

            <div className="surface-line" />

            <div className="px-6 py-12 md:px-8">
              <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
                <div className="rounded-[1.5rem] border border-primary/20 bg-primary/10 p-4 text-primary">
                  <History className="size-6" />
                </div>
                <h2 className="mt-5 text-2xl font-semibold text-foreground md:text-3xl">
                  The ledger is empty.
                </h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">
                  This page will keep the raw history of every transaction,
                  including pricing currency and FX conversion details.
                </p>
              </div>
            </div>
          </section>
        ) : (
          <section className="app-shell overflow-hidden rounded-[1.8rem]">
            <div className="flex flex-col gap-6 px-6 py-7 md:px-8 md:py-8 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="eyebrow">Ledger</p>
                <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-foreground md:text-5xl">
                  Transactions
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span>{transactions?.length ?? 0} entries</span>
                  <span>&middot;</span>
                  <span>{portfolio.homeCurrency} home currency</span>
                  <span>&middot;</span>
                  <span>Reverse chronological</span>
                </div>
              </div>

              <Button
                onClick={() => setAddDialogOpen(true)}
                size="lg"
                className="h-12 rounded-2xl px-5"
              >
                <Plus className="size-4" />
                Add Transaction
              </Button>
            </div>

            <div className="surface-line" />

            {!transactions ? (
              <div className="px-6 py-14 text-center text-sm text-muted-foreground md:px-8">
                Loading transactions...
              </div>
            ) : (
              <div className="px-4 py-4 md:px-6">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Date</TableHead>
                      <TableHead>Ticker</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Currency</TableHead>
                      <TableHead className="text-right">FX Rate</TableHead>
                      <TableHead className="w-[104px] text-right">Delete</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) =>
                      confirmingId === transaction._id ? (
                        <TableRow key={transaction._id}>
                          <TableCell colSpan={8} className="px-4 py-4">
                            <div className="rounded-[1.4rem] border border-destructive/30 bg-destructive/8 px-4 py-4 md:flex md:items-center md:justify-between">
                              <div className="space-y-1">
                                <p className="font-medium text-foreground">
                                  Delete this transaction?
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {transaction.date} · {transaction.ticker} ·{' '}
                                  {formatQuantity(transaction.quantity)} units
                                </p>
                                {deleteError ? (
                                  <p className="text-sm text-destructive">
                                    {deleteError}
                                  </p>
                                ) : null}
                              </div>
                              <div className="mt-4 flex gap-2 md:mt-0">
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
                        <TableRow key={transaction._id}>
                          <TableCell className="tabular-nums text-muted-foreground">
                            {transaction.date}
                          </TableCell>
                          <TableCell className="font-semibold text-foreground">
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
                              size="icon-sm"
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
              </div>
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
