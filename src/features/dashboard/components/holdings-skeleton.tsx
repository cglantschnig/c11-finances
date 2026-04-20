import { Card, CardContent } from '#/shared/ui/card'
import { Skeleton } from '#/shared/ui/skeleton'

export default function HoldingsSkeleton() {
  return (
    <>
      <div className="hidden md:block">
        <div className="overflow-hidden rounded-lg border">
          <div className="grid grid-cols-[140px_repeat(5,minmax(100px,1fr))] gap-3 border-b px-4 py-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-4 rounded-full" />
            ))}
          </div>
          {Array.from({ length: 4 }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="grid grid-cols-[140px_repeat(5,minmax(100px,1fr))] gap-3 border-b px-4 py-4 last:border-b-0"
            >
              {Array.from({ length: 6 }).map((__, cellIndex) => (
                <Skeleton key={cellIndex} className="h-5 rounded-full" />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-3 md:hidden">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} size="sm">
            <CardContent className="grid gap-3 pt-3">
              <Skeleton className="h-5 w-28 rounded-full" />
              <Skeleton className="h-4 w-full rounded-full" />
              <Skeleton className="h-4 w-3/4 rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}
