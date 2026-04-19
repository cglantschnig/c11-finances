import {
  SignedIn,
  SignInButton,
  SignedOut,
  UserButton,
} from '@clerk/clerk-react'
import { LogIn } from 'lucide-react'
import { hasClerkPublishableKey } from './config'
import { Button } from '#/components/ui/button'

export default function HeaderUser() {
  if (!hasClerkPublishableKey) {
    return (
      <Button variant="outline" size="sm" disabled className="rounded-xl">
        Auth setup required
      </Button>
    )
  }

  return (
    <>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal">
          <Button size="sm" className="rounded-xl">
            <LogIn className="size-4" />
            Sign in
          </Button>
        </SignInButton>
      </SignedOut>
    </>
  )
}
