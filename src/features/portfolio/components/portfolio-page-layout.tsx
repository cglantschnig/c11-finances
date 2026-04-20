import type { ReactNode } from 'react'
import { useState } from 'react'
import AddTransactionDialog from '#/features/transactions/components/add-transaction-dialog'
import PortfolioAppShell from '#/features/portfolio/components/portfolio-app-shell'
import PortfolioGate, {
  type ViewerPortfolio,
} from '#/features/portfolio/components/portfolio-gate'

type PortfolioPageLayoutProps = {
  children: (context: {
    openAddTransaction: () => void
    portfolio: ViewerPortfolio
  }) => ReactNode
  showMobileHeaderModeToggle?: boolean
  title: string
}

export default function PortfolioPageLayout({
  children,
  showMobileHeaderModeToggle = true,
  title,
}: PortfolioPageLayoutProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  return (
    <PortfolioGate>
      {(portfolio) => (
        <>
          <PortfolioAppShell
            title={title}
            onOpenAddTransaction={() => setAddDialogOpen(true)}
            showMobileHeaderModeToggle={showMobileHeaderModeToggle}
          >
            {children({
              openAddTransaction: () => setAddDialogOpen(true),
              portfolio,
            })}
          </PortfolioAppShell>
          <AddTransactionDialog
            open={addDialogOpen}
            onOpenChange={setAddDialogOpen}
            portfolio={portfolio}
          />
        </>
      )}
    </PortfolioGate>
  )
}
