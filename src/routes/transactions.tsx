import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { cva } from 'class-variance-authority'
import { useMutation, useQuery } from 'convex/react'
import {
  IconArrowsSort,
  IconHistory,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react'
import type { Doc, Id } from '../../convex/_generated/dataModel'
import { api } from '../../convex/_generated/api'
import AddTransactionDialog from '#/components/add-transaction-dialog'
import PortfolioAppShell from '#/components/portfolio-app-shell'
import PortfolioGate from '#/components/portfolio-gate'
import { formatCurrency, formatQuantity } from '#/lib/format'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '#/components/ui/alert-dialog'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Skeleton } from '#/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'

type Portfolio = Doc<'portfolios'>

const sideBadgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-1 text-[0.7rem] font-medium uppercase tracking-[0.14em]',
  {
    variants: {
      side: {
        buy: 'border-primary/20 bg-primary/10 text-primary',
        sell: 'border-destructive/20 bg-destructive/10 text-destructive',
      },
    },
    defaultVariants: {
      side: 'buy',
    },
  },
)

export const Route = createFileRoute('/transactions')({
  ssr: false,
  component: TransactionsRoute,
})

function SummaryCard({
  description,
  title,
  value,
}: {
  description: string
  title: string
  value: React.ReactNode
}) {
  return (
    <Card size="sm" className="shadow-sm">
      <CardHeader>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {title}
        </p>
        <CardTitle className="mt-2 text-2xl">{value}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm leading-6 text-muted-foreground">
        {description}
      </CardContent>
    </Card>
  )
}

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

  const confirmingTransaction = useMemo(
    () => transactions?.find((transaction) => transaction._id === confirmingId) ?? null,
    [confirmingId, transactions],
  )

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
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <Badge variant="outline" className="w-fit">
              Ledger
            </Badge>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="font-heading text-3xl text-foreground sm:text-4xl">
                  Transactions
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Review the raw chronological history for every buy and sell,
                  including native pricing and FX conversion.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>{transactions?.length ?? 0} entries</span>
                <span className="hidden sm:inline">&middot;</span>
                <span>{portfolio.homeCurrency} reporting base</span>
              </div>
            </div>
          </div>

          {transactions === undefined ? (
            <>
              <div className="grid gap-4 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index} size="sm" className="shadow-sm">
                    <CardContent className="grid gap-3 pt-3">
                      <Skeleton className="h-4 w-24 rounded-full" />
                      <Skeleton className="h-8 w-32 rounded-full" />
                      <Skeleton className="h-4 w-full rounded-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
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
            </>
          ) : transactions.length === 0 ? (
            <Card className="shadow-sm">
              <CardContent className="py-12 text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <IconHistory className="size-7" />
                </div>
                <h3 className="mt-5 font-heading text-2xl text-foreground sm:text-3xl">
                  No trades have been recorded yet.
                </h3>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Add your first buy or sell and the full ledger will appear
                  here in reverse chronological order.
                </p>
                <Button onClick={() => setAddDialogOpen(true)} className="mt-6">
                  <IconPlus className="size-4" />
                  Add transaction
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 lg:grid-cols-3">
                <SummaryCard
                  title="Entries"
                  value={transactions.length}
                  description="Every buy and sell is preserved in the raw ledger."
                />
                <SummaryCard
                  title="Home currency"
                  value={portfolio.homeCurrency}
                  description="Dashboard totals and portfolio summaries normalize into this base."
                />
                <SummaryCard
                  title="Order"
                  value="Newest first"
                  description="The ledger is rendered in reverse chronological order."
                />
              </div>

              <Card className="shadow-sm">
                <CardHeader className="border-b">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <IconArrowsSort className="size-4" />
                    Reverse chronological
                  </div>
                  <CardTitle>Ledger</CardTitle>
                  <CardDescription>
                    Trade date, quantity, native pricing, and FX rate for each
                    recorded transaction.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead>Date</TableHead>
                          <TableHead>Ticker</TableHead>
                          <TableHead>Side</TableHead>
                          <TableHead className="text-right">Quantity</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead className="text-right">Currency</TableHead>
                          <TableHead className="text-right">FX rate</TableHead>
                          <TableHead className="text-right">Delete</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((transaction) => (
                          <TableRow key={transaction._id}>
                            <TableCell className="tabular-nums text-muted-foreground">
                              {transaction.date}
                            </TableCell>
                            <TableCell className="font-medium text-foreground">
                              {transaction.ticker}
                            </TableCell>
                            <TableCell>
                              <span
                                className={sideBadgeVariants({
                                  side: transaction.side,
                                })}
                              >
                                {transaction.side}
                              </span>
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {formatQuantity(transaction.quantity)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {formatCurrency(
                                transaction.pricePerUnit,
                                transaction.nativeCurrency,
                              )}
                            </TableCell>
                            <TableCell className="text-right tabular-nums text-muted-foreground">
                              {transaction.nativeCurrency}
                            </TableCell>
                            <TableCell className="text-right tabular-nums text-muted-foreground">
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
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <IconTrash className="size-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="grid gap-3 md:hidden">
                    {transactions.map((transaction) => (
                      <Card key={transaction._id} size="sm">
                        <CardContent className="grid gap-4 pt-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-lg font-medium text-foreground">
                                {transaction.ticker}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {transaction.date}
                              </p>
                            </div>
                            <span
                              className={sideBadgeVariants({
                                side: transaction.side,
                              })}
                            >
                              {transaction.side}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                                Quantity
                              </p>
                              <p className="mt-1 tabular-nums text-foreground">
                                {formatQuantity(transaction.quantity)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                                Price
                              </p>
                              <p className="mt-1 tabular-nums text-foreground">
                                {formatCurrency(
                                  transaction.pricePerUnit,
                                  transaction.nativeCurrency,
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                                Currency
                              </p>
                              <p className="mt-1 tabular-nums text-foreground">
                                {transaction.nativeCurrency}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                                FX rate
                              </p>
                              <p className="mt-1 tabular-nums text-foreground">
                                {transaction.fxRate.toFixed(6)}
                              </p>
                            </div>
                          </div>

                          <div className="flex justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDeleteError(null)
                                setConfirmingId(transaction._id)
                              }}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <IconTrash className="size-4" />
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </PortfolioAppShell>

      <AlertDialog
        open={confirmingId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmingId(null)
            setDeleteError(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <IconTrash className="size-5" />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete this transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmingTransaction
                ? `${confirmingTransaction.date} • ${confirmingTransaction.ticker} • ${formatQuantity(
                    confirmingTransaction.quantity,
                  )} units`
                : 'This action removes the selected ledger entry.'}
            </AlertDialogDescription>
            {deleteError ? (
              <p className="text-sm text-destructive">{deleteError}</p>
            ) : null}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={pendingDeleteId === confirmingId || !confirmingId}
              onClick={() => {
                if (confirmingId) {
                  void handleDelete(confirmingId as Id<'transactions'>)
                }
              }}
            >
              {pendingDeleteId === confirmingId ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AddTransactionDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        portfolio={portfolio}
      />
    </>
  )
}
