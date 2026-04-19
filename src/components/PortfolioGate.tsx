import type { ReactNode } from 'react'
import { useState } from 'react'
import { SignInButton, useUser } from '@clerk/clerk-react'
import { useMutation, useQuery } from 'convex/react'
import type { FunctionReturnType } from 'convex/server'
import { ShieldCheck } from 'lucide-react'
import { api } from '../../convex/_generated/api'
import { hasClerkPublishableKey } from '#/integrations/clerk/config'
import { hasConvexUrl } from '#/integrations/convex/config'
import { Button } from '#/components/ui/button'
import HomeCurrencyDialog from '#/components/HomeCurrencyDialog'
import SetupState from '#/components/SetupState'

type Portfolio = NonNullable<
  FunctionReturnType<typeof api.queries.getViewerPortfolio>
>

type PortfolioGateProps = {
  children: (portfolio: Portfolio) => ReactNode
}

function LoadingState({
  eyebrow,
  title,
}: {
  eyebrow: string
  title: string
}) {
  return (
    <main className="page-wrap px-1 py-3 md:px-0 md:py-4">
      <section className="workspace-frame flex min-h-[calc(100svh-1.5rem)] items-center justify-center rounded-[2rem] px-4 py-10 md:rounded-[2.15rem]">
        <div className="app-shell w-full max-w-2xl rounded-[1.8rem] p-8 text-center">
          <p className="eyebrow">{eyebrow}</p>
          <div className="mx-auto mt-5 size-12 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
          <h1 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-foreground">
            {title}
          </h1>
        </div>
      </section>
    </main>
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
      <main className="page-wrap px-1 py-3 md:px-0 md:py-4">
        <section className="workspace-frame flex min-h-[calc(100svh-1.5rem)] items-center justify-center rounded-[2rem] px-4 py-10 md:rounded-[2.15rem] md:px-8">
          <div className="app-shell grid w-full max-w-4xl gap-6 rounded-[1.8rem] p-8 md:p-10">
            <p className="eyebrow">Authentication</p>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl space-y-3">
                <h1 className="text-4xl font-semibold tracking-[-0.05em] text-foreground md:text-5xl">
                  Track your portfolio with live holdings and transaction history.
                </h1>
                <p className="text-sm leading-7 text-muted-foreground md:text-base">
                  Sign in to create your home-currency portfolio, record buys and
                  sells, and refresh current market values from cached or live data.
                </p>
              </div>
              <SignInButton mode="modal">
                <Button size="lg" className="h-12 rounded-2xl px-5">
                  <ShieldCheck className="size-4" />
                  Sign in
                </Button>
              </SignInButton>
            </div>
          </div>
        </section>
      </main>
    )
  }

  if (portfolio === undefined) {
    return <LoadingState eyebrow="Portfolio" title="Loading your workspace..." />
  }

  if (portfolio === null) {
    return (
      <>
        <main className="page-wrap px-1 py-3 md:px-0 md:py-4">
          <section className="workspace-frame flex min-h-[calc(100svh-1.5rem)] items-center justify-center rounded-[2rem] px-4 py-10 md:rounded-[2.15rem]">
            <div className="app-shell max-w-2xl rounded-[1.8rem] p-8 text-center">
              <p className="eyebrow">First Sign-In</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-foreground">
                Let’s set up your portfolio.
              </h1>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Pick your home currency first. The app will create your default
                portfolio immediately after.
              </p>
            </div>
          </section>
        </main>
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
