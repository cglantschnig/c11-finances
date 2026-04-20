import type { ReactNode } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { ConvexReactClient } from 'convex/react'
import { ConvexProvider } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { convexUrl } from '../config/convex'
import { hasClerkPublishableKey } from '../config/clerk'

const convexClient = convexUrl ? new ConvexReactClient(convexUrl) : null

export default function AppConvexProvider({
  children,
}: {
  children: ReactNode
}) {
  if (!convexClient) {
    return children
  }

  if (!hasClerkPublishableKey) {
    return <ConvexProvider client={convexClient}>{children}</ConvexProvider>
  }

  return (
    <ConvexProviderWithClerk client={convexClient} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  )
}
