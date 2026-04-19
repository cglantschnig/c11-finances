import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import type { FunctionReturnType } from 'convex/server'
import {
  ArrowUpDown,
  ChartColumnIncreasing,
  Menu,
  Plus,
  Wallet,
} from 'lucide-react'
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
  description: string
  onOpenAddTransaction: () => void
  portfolio: Portfolio
  title: string
}

const navigationItems = [
  {
    icon: ChartColumnIncreasing,
    label: 'Dashboard',
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
    <div className="flex h-full flex-col">
      <div className="space-y-6">
        <Link
          to="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-[1.5rem] border border-border/80 bg-card/85 px-4 py-4 text-foreground no-underline shadow-[0_20px_50px_rgba(3,5,17,0.26)]"
        >
          <div className="rounded-2xl bg-primary/14 p-2 text-primary">
            <Wallet className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">F11 Finances</p>
            <p className="text-xs text-muted-foreground">{portfolio.name}</p>
          </div>
        </Link>

        <div className="grid gap-2">
          {navigationItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className="nav-item"
              activeProps={{ className: 'nav-item nav-item-active' }}
            >
              <item.icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-auto space-y-5">
        <Button
          onClick={onOpenAddTransaction}
          className="h-11 w-full rounded-xl"
        >
          <Plus className="size-4" />
          Add transaction
        </Button>

        <div className="rounded-[1.5rem] border border-border bg-muted/25 p-4">
          <p className="eyebrow mb-2">Home Currency</p>
          <p className="text-2xl font-semibold text-foreground">
            {portfolio.homeCurrency}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Returns and current portfolio values are converted into this currency.
          </p>
        </div>

        <div className="flex items-center justify-between rounded-[1.25rem] border border-border bg-card/70 px-3 py-2">
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
  description,
  onOpenAddTransaction,
  portfolio,
  title,
}: PortfolioAppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="page-wrap min-h-screen px-4 py-4 md:px-6 md:py-6">
      <div className="grid gap-4 md:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="app-shell hidden min-h-[calc(100svh-3rem)] rounded-[2rem] p-5 md:block">
          <Navigation
            onOpenAddTransaction={onOpenAddTransaction}
            portfolio={portfolio}
          />
        </aside>

        <div className="grid gap-4">
          <header className="app-shell sticky top-4 z-30 rounded-[1.75rem] px-4 py-4 md:px-6">
            <div className="flex items-start justify-between gap-3 md:hidden">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Open navigation"
                  onClick={() => setMobileNavOpen(true)}
                  className="rounded-xl"
                >
                  <Menu className="size-4" />
                </Button>
                <div>
                  <p className="eyebrow">Portfolio</p>
                  <h1 className="text-xl font-semibold text-foreground">{title}</h1>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Add transaction"
                  onClick={onOpenAddTransaction}
                  className="rounded-xl"
                >
                  <Plus className="size-4" />
                </Button>
                <HeaderUser />
              </div>
            </div>

            <div className="hidden items-start justify-between gap-4 md:flex">
              <div className="space-y-2">
                <p className="eyebrow">Portfolio</p>
                <div className="space-y-1">
                  <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                    {title}
                  </h1>
                  <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                    {description}
                  </p>
                </div>
              </div>

              <Button
                onClick={onOpenAddTransaction}
                className="h-11 rounded-xl px-4"
              >
                <Plus className="size-4" />
                Add transaction
              </Button>
            </div>
          </header>

          <main className="grid gap-4">{children}</main>
        </div>
      </div>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent
          side="left"
          className="border-border/80 bg-[linear-gradient(180deg,hsl(var(--popover)),hsl(var(--popover)/0.96))] p-0"
        >
          <SheetHeader className="border-b border-border/80 px-5 py-5 text-left">
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription>
              Move between portfolio views and add a new transaction.
            </SheetDescription>
          </SheetHeader>
          <div className="h-full px-5 py-5">
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
