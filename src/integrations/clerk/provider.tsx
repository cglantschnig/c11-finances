import { ClerkProvider } from '@clerk/clerk-react'
import { clerkPublishableKey } from './config'

export default function AppClerkProvider({
  children,
}: {
  children: React.ReactNode
}) {
  if (!clerkPublishableKey) {
    return children
  }

  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      afterSignOutUrl="/"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    >
      {children}
    </ClerkProvider>
  )
}
