import {
  IconAlertTriangle,
  IconCircleOff,
  IconSettingsBolt,
} from '@tabler/icons-react'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'

type SetupStateProps = {
  description: string
  missing: string[]
  title: string
}

export default function SetupState({
  description,
  missing,
  title,
}: SetupStateProps) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/25 px-4 py-10">
      <Card className="w-full max-w-3xl shadow-sm">
        <CardHeader className="gap-4 border-b">
          <div className="flex size-12 items-center justify-center rounded-lg bg-warning/15 text-warning">
            <IconAlertTriangle className="size-6" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              <IconSettingsBolt className="size-3.5" />
              Configuration required
            </div>
            <CardTitle className="text-2xl sm:text-3xl">{title}</CardTitle>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 pt-6">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <IconCircleOff className="size-4 text-warning" />
            Missing environment variables
          </div>
          <div className="flex flex-wrap gap-2">
            {missing.map((item) => (
              <code
                key={item}
                className="rounded-md border bg-muted px-3 py-1.5 text-xs text-muted-foreground"
              >
                {item}
              </code>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
