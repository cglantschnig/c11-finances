import { IconHistory, IconPlus } from '@tabler/icons-react'
import { Button } from '#/shared/ui/button'
import { Card, CardContent } from '#/shared/ui/card'

type TransactionsEmptyStateProps = {
  onOpenAddTransaction: () => void
}

export default function TransactionsEmptyState({
  onOpenAddTransaction,
}: TransactionsEmptyStateProps) {
  return (
    <Card className="shadow-sm">
      <CardContent className="py-12 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <IconHistory className="size-7" />
        </div>
        <h3 className="mt-5 font-heading text-2xl text-foreground sm:text-3xl">
          No trades have been recorded yet.
        </h3>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Add your first buy or sell and the full ledger will appear here in
          reverse chronological order.
        </p>
        <Button onClick={onOpenAddTransaction} className="mt-6">
          <IconPlus className="size-4" />
          Add transaction
        </Button>
      </CardContent>
    </Card>
  )
}
