import { IconAlertTriangle } from '@tabler/icons-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '#/shared/ui/card'

export default function RootErrorComponent() {
  return (
    <div className="relative isolate min-h-svh overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(15,118,110,0.14),transparent_38%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.12),transparent_38%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:5rem_5rem] dark:bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)]" />

      <div className="relative mx-auto flex min-h-svh w-full max-w-6xl items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <Card className="w-full max-w-xl overflow-hidden border-0 bg-card/88 py-0 shadow-[0_2rem_6rem_-2rem_rgba(15,23,42,0.28)] backdrop-blur">
          <CardHeader className="items-center gap-4 px-6 py-8 text-center sm:px-8">
            <div className="flex items-center justify-center">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-destructive/12 text-destructive ring-1 ring-destructive/15">
                <IconAlertTriangle className="size-7" strokeWidth={1.8} />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[0.7rem] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                Unexpected error
              </p>
              <CardTitle className="text-2xl sm:text-3xl">
                Something unexpected went wrong.
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="px-6 pb-8 text-center sm:px-8">
            <p className="text-sm leading-6 text-muted-foreground sm:text-base">
              Please come back soon.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
