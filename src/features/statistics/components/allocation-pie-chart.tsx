import { formatCurrency } from '#/shared/lib/format'
import { cn } from '#/shared/lib/utils'

export type AllocationPieChartDatum = {
  color: string
  label: string
  value: number
}

type AllocationPieChartProps = {
  centerLabel: string
  currency: string
  data: AllocationPieChartDatum[]
  emptyMessage?: string
}

function buildGradient(data: AllocationPieChartDatum[]) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  if (total <= 0) {
    return null
  }

  let current = 0
  const segments = data.map((item) => {
    const start = current
    current += (item.value / total) * 100
    return `${item.color} ${start}% ${current}%`
  })

  return `conic-gradient(${segments.join(', ')})`
}

function formatAllocationPercent(value: number) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: 'percent',
  }).format(value / 100)
}

export default function AllocationPieChart({
  centerLabel,
  currency,
  data,
  emptyMessage = 'No allocation data available.',
}: AllocationPieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const chartGradient = buildGradient(data)
  const hasData = total > 0

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:items-center">
      <div className="mx-auto flex w-full max-w-[18rem] justify-center">
        <div className="relative aspect-square w-full">
          <div
            aria-hidden
            className={cn(
              'size-full rounded-full ring-1 ring-foreground/10',
              hasData ? '' : 'bg-muted/70',
            )}
            style={
              chartGradient === null
                ? undefined
                : { backgroundImage: chartGradient }
            }
          />
          <div className="absolute inset-[22%] flex flex-col items-center justify-center rounded-full bg-card text-center ring-1 ring-foreground/5">
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              {centerLabel}
            </p>
            <p className="mt-2 font-heading text-xl text-foreground sm:text-2xl">
              {hasData ? formatCurrency(total, currency) : '—'}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {data.map((item) => {
          const share = total > 0 ? (item.value / total) * 100 : 0

          return (
            <div
              key={item.label}
              className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-muted/20 px-3 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  aria-hidden
                  className="size-3 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate font-medium text-foreground">
                  {item.label}
                </span>
              </div>
              <div className="text-right">
                <p className="tabular-nums text-foreground">
                  {formatCurrency(item.value, currency)}
                </p>
                <p className="text-xs tabular-nums text-muted-foreground">
                  {formatAllocationPercent(share)}
                </p>
              </div>
            </div>
          )
        })}

        {!hasData ? (
          <p className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
            {emptyMessage}
          </p>
        ) : null}
      </div>
    </div>
  )
}
