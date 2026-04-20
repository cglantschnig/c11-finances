import type { ErrorComponentProps } from '@tanstack/react-router'
import { Link, useRouter } from '@tanstack/react-router'
import {
  IconAlertTriangle,
  IconBug,
  IconHome,
  IconRefresh,
} from '@tabler/icons-react'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  if (typeof error === 'string' && error.trim().length > 0) {
    return error
  }

  return 'An unexpected error interrupted this page.'
}

function getErrorDetails(error: unknown, componentStack: string) {
  const parts: string[] = []

  if (error instanceof Error) {
    parts.push(error.name)
    if (error.stack) {
      parts.push(error.stack)
    } else if (error.message) {
      parts.push(error.message)
    }
  } else if (typeof error === 'string') {
    parts.push(error)
  } else {
    try {
      parts.push(JSON.stringify(error, null, 2))
    } catch {
      parts.push(String(error))
    }
  }

  if (componentStack.trim().length > 0) {
    parts.push(componentStack.trim())
  }

  return parts.filter(Boolean).join('\n\n')
}

export default function RootErrorComponent({
  error,
  info,
  reset,
}: ErrorComponentProps) {
  const router = useRouter()
  const message = getErrorMessage(error)
  const errorDetails = getErrorDetails(error, info?.componentStack ?? '')

  const handleRetry = async () => {
    reset()
    await router.invalidate()
  }

  return (
    <div className="relative isolate min-h-svh overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(15,118,110,0.14),transparent_38%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.12),transparent_38%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:5rem_5rem] dark:bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)]" />

      <div className="relative mx-auto flex min-h-svh w-full max-w-6xl items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <Card className="w-full max-w-2xl overflow-hidden border-0 bg-card/88 py-0 shadow-[0_2rem_6rem_-2rem_rgba(15,23,42,0.28)] backdrop-blur">
          <CardHeader className="gap-4 border-b border-border/70 bg-muted/35 px-6 py-6 sm:px-8">
            <div className="flex items-start gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-destructive/12 text-destructive ring-1 ring-destructive/15">
                <IconAlertTriangle className="size-7" strokeWidth={1.8} />
              </div>

              <div className="space-y-2">
                <p className="text-[0.7rem] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                  Unexpected error
                </p>
                <CardTitle className="text-2xl sm:text-3xl">
                  Something broke outside the happy path.
                </CardTitle>
                <CardDescription className="max-w-xl text-sm leading-6 sm:text-base">
                  {message}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 px-6 py-6 sm:px-8">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border/70 bg-background/70 p-4">
                <p className="text-sm font-medium text-foreground">
                  Retry the current route
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Re-run route loaders and reset the error boundary without
                  leaving the current page.
                </p>
              </div>

              <div className="rounded-xl border border-border/70 bg-background/70 p-4">
                <p className="text-sm font-medium text-foreground">
                  Return to a safe page
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Jump back to the home screen if this route is stuck in a bad
                  state.
                </p>
              </div>
            </div>

            {import.meta.env.DEV && errorDetails ? (
              <details className="group rounded-xl border border-border/70 bg-background/80">
                <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium text-foreground">
                  <IconBug className="size-4 text-muted-foreground" />
                  Technical details
                </summary>
                <pre className="max-h-80 overflow-auto border-t border-border/70 px-4 py-4 text-xs leading-6 whitespace-pre-wrap text-muted-foreground">
                  {errorDetails}
                </pre>
              </details>
            ) : null}
          </CardContent>

          <CardFooter className="flex flex-col gap-3 border-t border-border/70 px-6 py-5 sm:flex-row sm:justify-between sm:px-8">
            <div className="text-sm text-muted-foreground">
              The app shell is still running, but this route needs a reset.
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => {
                  void handleRetry()
                }}
              >
                <IconRefresh className="size-4" />
                Try again
              </Button>

              <Button asChild className="w-full sm:w-auto">
                <Link to="/">
                  <IconHome className="size-4" />
                  Back home
                </Link>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
