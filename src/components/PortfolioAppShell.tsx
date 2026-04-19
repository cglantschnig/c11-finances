import { Link } from '@tanstack/react-router'
import type { FunctionReturnType } from 'convex/server'
import {
  IconArrowUpRight,
  IconChartHistogram,
  IconExchange,
  IconLayoutGrid,
  IconPlus,
} from '@tabler/icons-react'
import ModeToggle from '#/components/mode-toggle'
import HeaderUser from '#/integrations/clerk/header-user'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from '#/components/ui/sidebar'

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
    icon: IconChartHistogram,
    label: 'Portfolio',
    to: '/dashboard' as const,
  },
  {
    icon: IconExchange,
    label: 'Transactions',
    to: '/transactions' as const,
  },
]

function Brand() {
  return (
    <Link
      to="/dashboard"
      className="flex items-center gap-3 rounded-lg border border-sidebar-border/80 bg-sidebar-primary/10 px-3 py-3 no-underline"
    >
      <div className="flex size-10 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
        <IconLayoutGrid className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-sidebar-foreground/60">
          F11
        </p>
        <p className="truncate font-heading text-base text-sidebar-foreground">
          Finances
        </p>
      </div>
    </Link>
  )
}

function Navigation({
  onNavigate,
}: {
  onNavigate?: () => void
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Workspace</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.to}>
              <SidebarMenuButton asChild tooltip={item.label}>
                <Link
                  to={item.to}
                  onClick={onNavigate}
                  activeOptions={{ exact: true }}
                  activeProps={{ 'data-active': true }}
                >
                  <item.icon className="size-4" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

function SidebarSummary({ portfolio }: { portfolio: Portfolio }) {
  return (
    <Card size="sm" className="gap-0 bg-sidebar-accent/50 text-sidebar-foreground">
      <CardHeader className="gap-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-sidebar-foreground/60">
          <IconArrowUpRight className="size-3.5" />
          Main portfolio
        </div>
        <CardTitle className="text-sm text-sidebar-foreground">
          {portfolio.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="rounded-md border border-sidebar-border/70 bg-sidebar px-3 py-2">
          <p className="text-xs uppercase tracking-[0.16em] text-sidebar-foreground/60">
            Home currency
          </p>
          <p className="mt-1 text-lg font-medium text-sidebar-foreground">
            {portfolio.homeCurrency}
          </p>
        </div>
        <p className="text-xs leading-5 text-sidebar-foreground/70">
          Holdings, performance, and transactions are normalized into this base
          currency throughout the workspace.
        </p>
      </CardContent>
    </Card>
  )
}

export default function PortfolioAppShell({
  children,
  onOpenAddTransaction,
  portfolio,
  title,
}: PortfolioAppShellProps) {
  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="offcanvas">
        <SidebarHeader className="gap-4 p-4">
          <Brand />
          <Button onClick={onOpenAddTransaction} className="w-full justify-start">
            <IconPlus className="size-4" />
            Add transaction
          </Button>
        </SidebarHeader>

        <SidebarSeparator />

        <SidebarContent className="gap-4 px-2 py-3">
          <Navigation />
          <SidebarGroup className="pt-0">
            <SidebarGroupLabel>Portfolio</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarSummary portfolio={portfolio} />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarSeparator />

        <SidebarFooter className="p-4">
          <div className="flex items-center justify-between rounded-lg border border-sidebar-border/80 bg-sidebar-accent/50 px-3 py-2">
            <div>
              <p className="text-sm font-medium text-sidebar-foreground">Theme</p>
              <p className="text-xs text-sidebar-foreground/70">
                Light, dark, or system
              </p>
            </div>
            <ModeToggle />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-sidebar-border/80 bg-sidebar-accent/50 px-3 py-3">
            <div>
              <p className="text-sm font-medium text-sidebar-foreground">Account</p>
              <p className="text-xs text-sidebar-foreground/70">
                Manage your session
              </p>
            </div>
            <HeaderUser />
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-h-svh">
        <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <SidebarTrigger className="md:hidden" />
            <div className="min-w-0 flex-1">
              <p className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                F11 Finances
              </p>
              <h1 className="truncate font-heading text-lg text-foreground">
                {title}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <ModeToggle className="md:hidden" />
              <Button size="sm" onClick={onOpenAddTransaction}>
                <IconPlus className="size-4" />
                <span className="hidden sm:inline">Add transaction</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
