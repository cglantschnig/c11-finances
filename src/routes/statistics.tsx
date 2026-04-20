import { createFileRoute } from '@tanstack/react-router'
import { StatisticsPage } from '#/features/statistics'

export const Route = createFileRoute('/statistics')({
  ssr: false,
  component: StatisticsPage,
})
