import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  IconArrowRight,
  IconCoins,
  IconRefresh,
  IconShieldLock,
  IconReceipt2,
} from '@tabler/icons-react'
import Logo from '#/components/logo'
import ModeToggle from '#/components/mode-toggle'
import { hasClerkPublishableKey } from '#/integrations/clerk/config'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Separator } from '#/components/ui/separator'

export const Route = createFileRoute('/')({
  ssr: false,
  component: HomePage,
})

function HomePage() {
  const signedOutPrimaryAction = hasClerkPublishableKey ? (
    <SignInButton mode="modal">
      <Button>
        <IconShieldLock className="size-4" />
        Sign in to begin
      </Button>
    </SignInButton>
  ) : (
    <Button asChild variant="outline">
      <Link to="/dashboard">Open setup state</Link>
    </Button>
  )

  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto flex min-h-svh max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 no-underline">
            <Logo className="size-11 sm:size-12" />
            <div>
              <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                F11
              </p>
              <p className="font-heading text-lg text-foreground">Finances</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <SignedIn>
              <Button asChild variant="outline" size="sm">
                <Link to="/dashboard">Workspace</Link>
              </Button>
            </SignedIn>
            <ModeToggle />
          </div>
        </header>

        <section className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="space-y-6">
            <Badge variant="outline" className="w-fit">
              Portfolio tracker
            </Badge>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Logo className="size-14 sm:size-16" />
                <div className="h-px flex-1 bg-border" />
              </div>
              <h1 className="max-w-3xl font-heading text-4xl leading-tight text-foreground sm:text-5xl lg:text-6xl">
                A clean workspace for holdings, market value, and raw trade
                history.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                Record transactions, normalize everything into a home currency,
                and monitor open positions without losing the underlying ledger.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {hasClerkPublishableKey ? (
                <>
                  <SignedIn>
                    <Button asChild>
                      <Link to="/dashboard">
                        Open portfolio
                        <IconArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </SignedIn>
                  <SignedOut>{signedOutPrimaryAction}</SignedOut>
                </>
              ) : (
                signedOutPrimaryAction
              )}
              <Button asChild variant="outline">
                <Link to="/transactions">View ledger</Link>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  icon: IconCoins,
                  title: 'Home-currency reporting',
                  description: 'One base currency across every view.',
                },
                {
                  icon: IconRefresh,
                  title: 'Cached price refresh',
                  description: 'Surface stale values without hiding them.',
                },
                {
                  icon: IconReceipt2,
                  title: 'FX-aware ledger',
                  description: 'Keep the raw transaction history intact.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-lg border bg-muted/35 p-4"
                >
                  <item.icon className="size-5 text-primary" />
                  <h2 className="mt-3 text-sm font-medium text-foreground">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Card className="shadow-sm">
            <CardHeader className="border-b">
              <Badge variant="outline" className="w-fit">
                Inside the workspace
              </Badge>
              <CardTitle className="text-2xl">Built for a focused flow</CardTitle>
              <CardDescription className="leading-6">
                The app keeps setup, dashboard, and transactions aligned around
                the same reporting model.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 pt-6">
              {[
                {
                  title: 'Dashboard',
                  description:
                    'Open positions, current value, and unrealized performance in one view.',
                },
                {
                  title: 'Transactions',
                  description:
                    'A chronological ledger with quantity, pricing currency, and FX rate.',
                },
                {
                  title: 'Setup',
                  description:
                    'Authentication and home-currency creation before the main workspace.',
                },
              ].map((item, index) => (
                <div key={item.title}>
                  <div className="flex items-start gap-4">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-sm font-medium text-primary">
                      0{index + 1}
                    </div>
                    <div>
                      <h2 className="font-medium text-foreground">{item.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  {index < 2 ? <Separator className="mt-5" /> : null}
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}
