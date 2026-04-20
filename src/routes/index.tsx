import { createFileRoute } from '@tanstack/react-router'
import { LandingPage } from '#/features/landing'

export const Route = createFileRoute('/')({
  ssr: false,
  component: LandingPage,
})
