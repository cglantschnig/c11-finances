import { useAuth } from '@clerk/clerk-react'
import { ConvexReactClient } from 'convex/react'
import { ConvexProvider } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { convexUrl } from './config'
import { hasClerkPublishableKey } from '../clerk/config'

const convexClient = convexUrl ? new ConvexReactClient(convexUrl) : null

export default function AppConvexProvider({
  children,
}: {
  children: React.ReactNode
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
