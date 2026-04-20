import { IconCoins, IconPlus } from '@tabler/icons-react'
import { Button } from '#/shared/ui/button'
import { Card, CardContent } from '#/shared/ui/card'

type DashboardEmptyStateProps = {
  homeCurrency: string
  onOpenAddTransaction: () => void
}

export default function DashboardEmptyState({
  homeCurrency,
  onOpenAddTransaction,
}: DashboardEmptyStateProps) {
  return (
    <Card className="shadow-sm">
      <CardContent className="py-12 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <IconCoins className="size-7" />
        </div>
        <h3 className="mt-5 font-heading text-2xl text-foreground sm:text-3xl">
          Your dashboard is ready for its first transaction.
        </h3>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
          Add a buy or sell to start building holdings and performance in{' '}
          {homeCurrency}.
        </p>
        <Button onClick={onOpenAddTransaction} className="mt-6">
          <IconPlus className="size-4" />
          Add transaction
        </Button>
      </CardContent>
    </Card>
  )
}
