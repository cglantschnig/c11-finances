import type { ReactNode } from 'react'
import { useState } from 'react'
import { SignInButton, useUser } from '@clerk/clerk-react'
import { useMutation, useQuery } from 'convex/react'
import type { FunctionReturnType } from 'convex/server'
import {
  IconChartHistogram,
  IconLoader,
  IconLock,
  IconSparkles,
  IconWallet,
} from '@tabler/icons-react'
import { api } from '../../convex/_generated/api'
import { hasClerkPublishableKey } from '#/integrations/clerk/config'
import { hasConvexUrl } from '#/integrations/convex/config'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import HomeCurrencyDialog from '#/components/HomeCurrencyDialog'
import SetupState from '#/components/SetupState'

type Portfolio = NonNullable<
  FunctionReturnType<typeof api.queries.getViewerPortfolio>
>

type PortfolioGateProps = {
  children: (portfolio: Portfolio) => ReactNode
}

function CenteredShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/25 px-4 py-10">
      {children}
    </main>
  )
}

function LoadingState({
  eyebrow,
  title,
}: {
  eyebrow: string
  title: string
}) {
  return (
    <CenteredShell>
      <Card className="w-full max-w-lg shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <IconLoader className="size-3.5 animate-spin" />
            {eyebrow}
          </div>
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <IconLoader className="size-5 animate-spin" />
          </div>
          <h1 className="font-heading text-2xl text-foreground">{title}</h1>
        </CardContent>
      </Card>
    </CenteredShell>
  )
}

export default function PortfolioGate({ children }: PortfolioGateProps) {
  if (!hasClerkPublishableKey || !hasConvexUrl) {
    const missing = [
      !hasClerkPublishableKey && 'VITE_CLERK_PUBLISHABLE_KEY',
      !hasConvexUrl && 'VITE_CONVEX_URL',
    ].filter(Boolean) as string[]

    return (
      <SetupState
        title="The portfolio app needs auth and backend configuration."
        description="This screen only appears because the required environment variables are missing in the current runtime."
        missing={missing}
      />
    )
  }

  return <ConfiguredPortfolioGate>{children}</ConfiguredPortfolioGate>
}

function ConfiguredPortfolioGate({ children }: PortfolioGateProps) {
  const { isLoaded, isSignedIn } = useUser()
  const createPortfolio = useMutation(api.mutations.createPortfolio)
  const portfolio = useQuery(api.queries.getViewerPortfolio, isSignedIn ? {} : 'skip')
  const [creationError, setCreationError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  if (!isLoaded) {
    return <LoadingState eyebrow="Loading" title="Checking your session..." />
  }

  if (!isSignedIn) {
    return (
      <CenteredShell>
        <Card className="w-full max-w-4xl shadow-sm">
          <CardHeader className="gap-4 border-b">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              <IconLock className="size-3.5" />
              Authentication
            </div>
            <CardTitle className="max-w-2xl text-3xl sm:text-4xl">
              Sign in to manage holdings, prices, and raw trade history.
            </CardTitle>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Create a home-currency portfolio, record every buy and sell, and
              keep your current positions in one clean workspace.
            </p>
          </CardHeader>
          <CardContent className="grid gap-4 pt-6 md:grid-cols-3">
            {[
              {
                icon: IconWallet,
                title: 'Single portfolio base',
                description:
                  'Normalize values and performance into one reporting currency.',
              },
              {
                icon: IconChartHistogram,
                title: 'Holdings dashboard',
                description:
                  'Track open positions, current value, and cached pricing freshness.',
              },
              {
                icon: IconSparkles,
                title: 'Raw ledger',
                description:
                  'Keep the full transaction history with price currency and FX details.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-lg border bg-muted/35 p-4"
              >
                <item.icon className="size-5 text-primary" />
                <h2 className="mt-3 font-medium text-foreground">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
            <div className="md:col-span-3">
              <SignInButton mode="modal">
                <Button>
                  <IconLock className="size-4" />
                  Sign in
                </Button>
              </SignInButton>
            </div>
          </CardContent>
        </Card>
      </CenteredShell>
    )
  }

  if (portfolio === undefined) {
    return <LoadingState eyebrow="Portfolio" title="Loading your workspace..." />
  }

  if (portfolio === null) {
    return (
      <>
        <CenteredShell>
          <Card className="w-full max-w-2xl shadow-sm">
            <CardContent className="py-12 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <IconWallet className="size-6" />
              </div>
              <p className="mt-5 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                First sign-in
              </p>
              <h1 className="mt-2 font-heading text-3xl text-foreground">
                Set up your portfolio base currency.
              </h1>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
                Pick the reporting currency once and the app will create your
                default portfolio immediately after.
              </p>
            </CardContent>
          </Card>
        </CenteredShell>
        <HomeCurrencyDialog
          error={creationError}
          isSubmitting={isCreating}
          open
          onCreate={async (homeCurrency) => {
            try {
              setCreationError(null)
              setIsCreating(true)
              await createPortfolio({
                homeCurrency,
                name: 'Main Portfolio',
              })
            } catch (error) {
              setCreationError(
                error instanceof Error
                  ? error.message
                  : 'Unable to create your portfolio.',
              )
            } finally {
              setIsCreating(false)
            }
          }}
        />
      </>
    )
  }

  return children(portfolio)
}
