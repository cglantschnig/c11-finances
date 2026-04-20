import {
  SignedIn,
  SignInButton,
  SignedOut,
  useClerk,
  useUser,
} from '@clerk/clerk-react'
import {
  IconLogin2,
  IconLogout2,
  IconSettings,
} from '@tabler/icons-react'
import { hasClerkPublishableKey } from './config'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '#/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className={accountRowClassName} disabled={!isLoaded}>
          <AccountRowContent label={label} imageUrl={user?.imageUrl} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" className="w-56">
        <DropdownMenuItem onClick={() => clerk.openUserProfile()}>
          <IconSettings className="size-4" />
          <span>Manage account</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onClick={() => void clerk.signOut({ redirectUrl: '/' })}
        >
          <IconLogout2 className="size-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
