import {
  IconChartPie,
  IconCoins,
  IconPlus,
} from '@tabler/icons-react'
import { Button } from '#/shared/ui/button'
import { Card, CardContent } from '#/shared/ui/card'

type StatisticsEmptyStateProps = {
  mode: 'no-open-positions' | 'no-transactions'
  onOpenAddTransaction: () => void
}

export default function StatisticsEmptyState({
  mode,
  onOpenAddTransaction,
}: StatisticsEmptyStateProps) {
  if (mode === 'no-transactions') {
    return (
      <Card className="shadow-sm">
        <CardContent className="py-12 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <IconCoins className="size-7" />
          </div>
          <h3 className="mt-5 font-heading text-2xl text-foreground sm:text-3xl">
            Add your first transaction to unlock portfolio statistics.
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            Allocation charts appear once the portfolio has holdings with market
            values.
          </p>
          <Button onClick={onOpenAddTransaction} className="mt-6">
            <IconPlus className="size-4" />
            Add transaction
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="py-12 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <IconChartPie className="size-7" />
        </div>
        <h3 className="mt-5 font-heading text-2xl text-foreground sm:text-3xl">
          There are no open positions to chart right now.
        </h3>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
          Add a new buy transaction or review existing sells to build a current
          allocation view.
        </p>
      </CardContent>
    </Card>
  )
}
