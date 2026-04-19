import {
  SignedIn,
  SignInButton,
  SignedOut,
  UserButton,
} from '@clerk/clerk-react'
import { IconLogin2 } from '@tabler/icons-react'
import { hasClerkPublishableKey } from './config'
import { Button } from '#/components/ui/button'

export default function HeaderUser() {
  if (!hasClerkPublishableKey) {
    return (
      <Button variant="outline" size="sm" disabled>
        Auth setup required
      </Button>
    )
  }

  return (
    <>
      <SignedIn>
        <div className="rounded-lg border border-border/70 bg-background/80 p-1">
          <UserButton
            appearance={{
              elements: {
                avatarBox:
                  'size-8 rounded-md ring-1 ring-border ring-offset-0',
                userButtonTrigger:
                  'rounded-md focus:shadow-none focus-visible:ring-0',
              },
            }}
          />
        </div>
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal">
          <Button size="sm">
            <IconLogin2 className="size-4" />
            Sign in
          </Button>
        </SignInButton>
      </SignedOut>
    </>
  )
}
