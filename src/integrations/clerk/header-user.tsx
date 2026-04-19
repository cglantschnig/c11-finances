import {
  SignedIn,
  SignInButton,
  SignedOut,
  useClerk,
  useUser,
} from '@clerk/clerk-react'
import { IconLogin2 } from '@tabler/icons-react'
import { hasClerkPublishableKey } from './config'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '#/components/ui/avatar'
import { cn } from '#/lib/utils'

const accountRowClassName =
  'flex w-full items-center justify-between gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-sidebar-accent/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring'

function formatUserName({
  fullName,
  firstName,
  username,
  primaryEmail,
}: {
  fullName: string | null | undefined
  firstName: string | null | undefined
  username: string | null | undefined
  primaryEmail: string | undefined
}) {
  return fullName || firstName || username || primaryEmail || 'Account'
}

function getInitials(name: string) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  return initials || 'A'
}

function AccountRowContent({
  label,
  imageUrl,
}: {
  label: string
  imageUrl?: string
}) {
  return (
    <>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-sidebar-foreground">
          {label}
        </span>
      </span>
      <Avatar className="size-8">
        <AvatarImage src={imageUrl} alt={label} />
        <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground">
          {getInitials(label)}
        </AvatarFallback>
      </Avatar>
    </>
  )
}

function SignedInAccountRow() {
  const clerk = useClerk()
  const { isLoaded, user } = useUser()

  const label = isLoaded
    ? formatUserName({
        fullName: user?.fullName,
        firstName: user?.firstName,
        username: user?.username,
        primaryEmail: user?.primaryEmailAddress?.emailAddress,
      })
    : 'Loading...'

  return (
    <button
      type="button"
      className={accountRowClassName}
      disabled={!isLoaded}
      onClick={() => clerk.openUserProfile()}
    >
      <AccountRowContent label={label} imageUrl={user?.imageUrl} />
    </button>
  )
}

export default function HeaderUser() {
  if (!hasClerkPublishableKey) {
    return (
      <div
        className={cn(
          accountRowClassName,
          'cursor-not-allowed opacity-60 hover:bg-transparent',
        )}
      >
        <AccountRowContent label="Auth setup required" />
      </div>
    )
  }

  return (
    <>
      <SignedIn>
        <SignedInAccountRow />
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal">
          <button type="button" className={accountRowClassName}>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-sidebar-foreground">
                Sign in
              </span>
            </span>
            <span className="flex size-8 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-foreground">
              <IconLogin2 className="size-4" />
            </span>
          </button>
        </SignInButton>
      </SignedOut>
    </>
  )
}
