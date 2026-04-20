import { IconTrash } from '@tabler/icons-react'
import { formatCurrency, formatQuantity } from '#/shared/lib/format'
import { Button } from '#/shared/ui/button'
import { Card, CardContent } from '#/shared/ui/card'
import type { TransactionListItem } from '#/features/transactions/transactions-page'

type TransactionCardsProps = {
  onDelete: (transactionId: string) => void
  transactions: TransactionListItem[]
}

function sideBadgeClass(side: TransactionListItem['side']) {
  return side === 'buy'
    ? 'border-primary/20 bg-primary/10 text-primary'
    : 'border-destructive/20 bg-destructive/10 text-destructive'
}

export default function TransactionCards({
  onDelete,
  transactions,
}: TransactionCardsProps) {
  return transactions.map((transaction) => (
    <Card key={transaction._id} size="sm">
      <CardContent className="grid gap-4 pt-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-lg font-medium text-foreground">
              {transaction.ticker}
            </p>
            <p className="text-sm text-muted-foreground">{transaction.date}</p>
          </div>
          <span
            className={`inline-flex items-center rounded-md border px-2 py-1 text-[0.7rem] font-medium uppercase tracking-[0.14em] ${sideBadgeClass(transaction.side)}`}
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
              {formatCurrency(transaction.pricePerUnit, transaction.nativeCurrency)}
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
        </div>

        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(transaction._id)}
            className="text-muted-foreground hover:text-destructive"
          >
            <IconTrash className="size-4" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  ))
}
