import { Link } from '@tanstack/react-router'
import {
  IconChartHistogram,
  IconList,
  IconPlus,
} from '@tabler/icons-react'
import Logo from '#/components/logo'
import ModeToggle from '#/components/mode-toggle'
import UserCurrencySelect from '#/components/user-currency-select'
import HeaderUser from '#/integrations/clerk/header-user'
import { Button } from '#/components/ui/button'
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

type PortfolioAppShellProps = {
  children: React.ReactNode
  onOpenAddTransaction: () => void
  title: string
}

const navigationItems = [
  {
    icon: IconChartHistogram,
    label: 'Portfolio',
    to: '/dashboard' as const,
  },
  {
    icon: IconList,
    label: 'Transactions',
    to: '/transactions' as const,
  },
]

function Brand() {
  return (
    <Link
      to="/dashboard"
      className="flex items-center gap-3 rounded-lg px-3 py-3 no-underline"
    >
      <Logo className="size-11" />
      <div className="min-w-0">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-sidebar-foreground/60">
          c11
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

export default function PortfolioAppShell({
  children,
  onOpenAddTransaction,
  title,
}: PortfolioAppShellProps) {
  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="offcanvas">
        <SidebarHeader className="gap-4 p-4">
          <Brand />
        </SidebarHeader>

        <SidebarSeparator />

        <SidebarContent className="gap-4 px-2 py-3">
          <Navigation />
        </SidebarContent>

        <SidebarSeparator />

        <SidebarFooter className="p-4">
          <UserCurrencySelect />

          <ModeToggle
            variant="ghost"
            size="default"
            className="h-auto w-full justify-between rounded-lg px-3 py-2 text-left hover:bg-sidebar-accent/70"
          >
            {({ icon }) => (
              <>
                <div>
                  <p className="text-sm font-medium text-sidebar-foreground">
                    Theme
                  </p>
                </div>
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-sidebar-border/80">
                  {icon}
                </span>
              </>
            )}
          </ModeToggle>

          <HeaderUser />
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-h-svh">
        <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <SidebarTrigger className="md:hidden" />
            <Logo className="size-9 md:hidden" />
            <div className="min-w-0 flex-1">
              <p className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                c11 Finances
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
