import { IconTrash } from '@tabler/icons-react'
import { formatCurrency, formatQuantity } from '#/shared/lib/format'
import { Button } from '#/shared/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/shared/ui/table'
import type { TransactionListItem } from '#/features/transactions/transactions-page'

type TransactionsTableProps = {
  onDelete: (transactionId: string) => void
  transactions: TransactionListItem[]
}

function sideBadgeClass(side: TransactionListItem['side']) {
  return side === 'buy'
    ? 'border-primary/20 bg-primary/10 text-primary'
    : 'border-destructive/20 bg-destructive/10 text-destructive'
}

export default function TransactionsTable({
  onDelete,
  transactions,
}: TransactionsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Date</TableHead>
          <TableHead>Ticker</TableHead>
          <TableHead>Side</TableHead>
          <TableHead className="text-right">Quantity</TableHead>
          <TableHead className="text-right">Price</TableHead>
          <TableHead className="text-right">Currency</TableHead>
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
                className={`inline-flex items-center rounded-md border px-2 py-1 text-[0.7rem] font-medium uppercase tracking-[0.14em] ${sideBadgeClass(transaction.side)}`}
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
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Delete ${transaction.ticker} transaction`}
                onClick={() => onDelete(transaction._id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <IconTrash className="size-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
