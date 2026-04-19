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
      <Button size="lg" className="h-12 rounded-2xl px-5">
        <ShieldCheck className="size-4" />
        Sign in to begin
      </Button>
    </SignInButton>
  ) : (
    <Button asChild variant="outline" size="lg" className="h-12 rounded-2xl px-5">
      <Link to="/dashboard">Open setup state</Link>
    </Button>
  )

  return (
    <main className="page-wrap px-1 py-3 md:px-0 md:py-4">
      <section className="workspace-frame overflow-hidden rounded-[2rem] md:rounded-[2.15rem]">
        <div className="grid min-h-[calc(100svh-1.5rem)] md:grid-cols-[320px_minmax(0,1fr)]">
          <div className="border-b border-border px-6 py-8 md:border-b-0 md:border-r md:px-8 md:py-10">
            <div className="brand-wordmark text-[2rem] leading-none">
              f11 <span>finances</span>
            </div>
            <div className="mt-10 space-y-3">
              <p className="eyebrow">Portfolio Tracker</p>
              <h1 className="text-4xl font-semibold tracking-[-0.05em] text-foreground md:text-5xl">
                A focused workspace for holdings, prices, and raw trade history.
              </h1>
              <p className="text-sm leading-7 text-muted-foreground md:text-base">
                Record transactions, convert everything into a home currency, and
                monitor open positions in a single data-first interface.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {hasClerkPublishableKey ? (
                <>
                  <SignedIn>
                    <Button asChild size="lg" className="h-12 rounded-2xl px-5">
                      <Link to="/dashboard">
                        Open portfolio
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

          <div className="p-6 md:p-8 md:pt-10">
            <div className="app-shell overflow-hidden rounded-[1.8rem]">
              <div className="flex items-center justify-between border-b border-border px-6 py-6">
                <div>
                  <p className="eyebrow">Preview</p>
                  <h2 className="mt-1 text-2xl font-semibold text-foreground">
                    Product direction
                  </h2>
                </div>
                <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3 text-primary">
                  <ChartColumnIncreasing className="size-5" />
                </div>
              </div>

              <div className="grid gap-4 p-6 lg:grid-cols-[minmax(0,1fr)_280px]">
                <div className="panel-muted rounded-[1.45rem] p-5">
                  <p className="eyebrow">What it handles</p>
                  <div className="mt-4 grid gap-3">
                    <div className="rounded-[1.1rem] border border-border/80 bg-background/20 px-4 py-4 text-sm text-muted-foreground">
                      Holdings valued in your portfolio home currency.
                    </div>
                    <div className="rounded-[1.1rem] border border-border/80 bg-background/20 px-4 py-4 text-sm text-muted-foreground">
                      Cached and refreshed prices with stale indicators.
                    </div>
                    <div className="rounded-[1.1rem] border border-border/80 bg-background/20 px-4 py-4 text-sm text-muted-foreground">
                      A transaction ledger with FX-aware historical entries.
                    </div>
                  </div>
                </div>

                <div className="panel-muted rounded-[1.45rem] p-5">
                  <p className="eyebrow">Current Scope</p>
                  <div className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                    <p>Dashboard for open positions and unrealized performance.</p>
                    <p>Transactions page for raw chronological trade records.</p>
                    <p>First-run setup flow for auth and home-currency creation.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
