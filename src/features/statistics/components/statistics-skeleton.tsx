import { Card, CardContent, CardHeader } from '#/shared/ui/card'
import { Skeleton } from '#/shared/ui/skeleton'

export default function StatisticsSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {Array.from({ length: 2 }).map((_, index) => (
        <Card key={index} className="shadow-sm">
          <CardHeader className="border-b">
            <Skeleton className="h-5 w-36 rounded-full" />
            <Skeleton className="h-4 w-56 rounded-full" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
              <Skeleton className="mx-auto aspect-square w-full max-w-[18rem] rounded-full" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((__, rowIndex) => (
                  <Skeleton key={rowIndex} className="h-14 rounded-lg" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
