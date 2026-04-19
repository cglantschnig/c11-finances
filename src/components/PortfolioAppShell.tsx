import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import type { FunctionReturnType } from 'convex/server'
import { ArrowUpDown, ChartColumnIncreasing, Menu, Plus } from 'lucide-react'
import HeaderUser from '#/integrations/clerk/header-user'
import { Button } from '#/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '#/components/ui/sheet'

type Portfolio = NonNullable<
  FunctionReturnType<typeof import('../../convex/_generated/api').api.queries.getViewerPortfolio>
>

type PortfolioAppShellProps = {
  children: React.ReactNode
  onOpenAddTransaction: () => void
  portfolio: Portfolio
  title: string
}

const navigationItems = [
  {
    icon: ChartColumnIncreasing,
    label: 'Portfolio',
    to: '/dashboard' as const,
  },
  {
    icon: ArrowUpDown,
    label: 'Transactions',
    to: '/transactions' as const,
  },
]

function Navigation({
  onNavigate,
  onOpenAddTransaction,
  portfolio,
}: {
  onNavigate?: () => void
  onOpenAddTransaction: () => void
  portfolio: Portfolio
}) {
  return (
    <div className="flex h-full flex-col gap-10">
      <div className="space-y-8">
        <div className="space-y-2">
          <Link
            to="/dashboard"
            onClick={onNavigate}
            className="inline-flex no-underline"
          >
            <div className="brand-wordmark text-[1.9rem] leading-none">
              f11 <span>finances</span>
            </div>
          </Link>
          <p className="text-sm text-muted-foreground">{portfolio.name}</p>
        </div>

        <nav className="grid gap-2">
          {navigationItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className="nav-item"
              activeProps={{ className: 'nav-item nav-item-active' }}
            >
              <item.icon className="size-4" />
              <span className="text-lg font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto space-y-4">
        <Button
          onClick={onOpenAddTransaction}
          size="lg"
          className="h-12 w-full rounded-2xl"
        >
          <Plus className="size-4" />
          Add Transaction
        </Button>

        <div className="panel-muted rounded-[1.35rem] p-4">
          <p className="eyebrow">Home Currency</p>
          <div className="mt-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-2xl font-semibold text-foreground">
                {portfolio.homeCurrency}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                All values and performance are normalized into this currency.
              </p>
            </div>
          </div>
        </div>

        <div className="panel-muted flex items-center justify-between rounded-[1.35rem] px-4 py-3.5">
          <div>
            <p className="text-sm font-medium text-foreground">Account</p>
            <p className="text-xs text-muted-foreground">Manage your session</p>
          </div>
          <HeaderUser />
        </div>
      </div>
    </div>
  )
}

export default function PortfolioAppShell({
  children,
  onOpenAddTransaction,
  portfolio,
  title,
}: PortfolioAppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="page-wrap px-1 py-3 md:px-0 md:py-4">
      <div className="workspace-frame overflow-hidden rounded-[2rem] md:rounded-[2.15rem]">
        <div className="grid min-h-[calc(100svh-1.5rem)] md:grid-cols-[330px_minmax(0,1fr)]">
          <aside className="hidden border-r border-border px-9 py-8 md:block">
            <Navigation
              onOpenAddTransaction={onOpenAddTransaction}
              portfolio={portfolio}
            />
          </aside>

          <div className="min-w-0">
            <header className="flex items-center justify-between border-b border-border px-4 py-4 md:hidden">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="Open navigation"
                  onClick={() => setMobileNavOpen(true)}
                  className="rounded-xl"
                >
                  <Menu className="size-4" />
                </Button>
                <div>
                  <p className="eyebrow">F11 Finances</p>
                  <h1 className="text-lg font-semibold text-foreground">{title}</h1>
                </div>
              </div>

              <Button
                size="sm"
                onClick={onOpenAddTransaction}
                className="rounded-xl px-3"
              >
                <Plus className="size-4" />
                Add
              </Button>
            </header>

            <main className="min-w-0 p-4 md:p-8 lg:p-10">{children}</main>
          </div>
        </div>
      </div>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent
          side="left"
          className="border-border bg-[linear-gradient(180deg,hsl(var(--surface-strong)),hsl(var(--surface)))] p-0"
        >
          <SheetHeader className="border-b border-border px-5 py-5 text-left">
            <SheetTitle>Workspace</SheetTitle>
            <SheetDescription>
              Navigate between portfolio views and create transactions.
            </SheetDescription>
          </SheetHeader>
          <div className="h-full px-5 py-6">
            <Navigation
              onNavigate={() => setMobileNavOpen(false)}
              onOpenAddTransaction={() => {
                setMobileNavOpen(false)
                onOpenAddTransaction()
              }}
              portfolio={portfolio}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
