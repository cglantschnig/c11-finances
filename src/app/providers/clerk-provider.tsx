import type { ReactNode } from 'react'
import { ClerkProvider } from '@clerk/clerk-react'
import { clerkPublishableKey } from '../config/clerk'

export default function AppClerkProvider({
  children,
}: {
  children: ReactNode
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
