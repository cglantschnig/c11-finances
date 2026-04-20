import { useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import type { ViewerPortfolio } from '#/features/portfolio/components/portfolio-gate'

export function useSelectedDisplayCurrency(portfolio: ViewerPortfolio) {
  const userSettings = useQuery(api.queries.getUserSettings, {})
  return userSettings?.currency ?? portfolio.homeCurrency
}
