import { createFileRoute, Link } from '@tanstack/react-router'
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react'
import { ArrowRight, ChartColumnIncreasing, ShieldCheck } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { hasClerkPublishableKey } from '#/integrations/clerk/config'

export const Route = createFileRoute('/')({
  ssr: false,
  component: HomePage,
})

function HomePage() {
  const signedOutPrimaryAction = hasClerkPublishableKey ? (
    <SignInButton mode="modal">
      <Button className="h-11 rounded-xl px-5">
        <ShieldCheck className="size-4" />
        Sign in to begin
      </Button>
    </SignInButton>
  ) : (
    <Button asChild variant="outline" className="h-11 rounded-xl px-5">
      <Link to="/dashboard">Open setup state</Link>
    </Button>
  )

  return (
    <main className="page-wrap flex min-h-[calc(100svh-4rem)] items-center px-4 py-10 md:px-6">
      <section className="app-shell relative w-full overflow-hidden rounded-[2rem] p-8 md:p-12">
        <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <p className="eyebrow">Portfolio Tracker</p>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-foreground md:text-6xl">
                Record transactions, cache live prices, and monitor open positions in one dark workspace.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                F11 Finances keeps a simple transaction ledger, converts values
                into your home currency, and refreshes holdings from cached or
                live market data.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {hasClerkPublishableKey ? (
                <>
                  <SignedIn>
                    <Button asChild className="h-11 rounded-xl px-5">
                      <Link to="/dashboard">
                        Open dashboard
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </SignedIn>

                  <SignedOut>{signedOutPrimaryAction}</SignedOut>
                </>
              ) : (
                signedOutPrimaryAction
              )}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[1.75rem] border border-border bg-muted/25 p-6">
              <div className="mb-4 inline-flex rounded-2xl bg-primary/14 p-3 text-primary">
                <ChartColumnIncreasing className="size-5" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                Basic v1 workflow
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Set your home currency, add transactions with historical FX, and
                review holdings and raw transaction history on separate screens.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-border bg-card/60 p-6">
              <p className="eyebrow">What ships now</p>
              <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
                <div className="rounded-2xl border border-border bg-background/30 px-4 py-3">
                  Cached holdings with stale price indicators.
                </div>
                <div className="rounded-2xl border border-border bg-background/30 px-4 py-3">
                  Transaction log with inline delete confirmation.
                </div>
                <div className="rounded-2xl border border-border bg-background/30 px-4 py-3">
                  Auto-fetched historical FX for multi-currency entries.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
