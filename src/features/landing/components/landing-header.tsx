import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react'
import { Link } from '@tanstack/react-router'
import { IconMoon, IconSun } from '@tabler/icons-react'
import Logo from '#/shared/components/logo'
import type { LandingPalette } from '#/features/landing/constants/landing-theme'
import NavGhostButton from './nav-ghost-button'

type LandingHeaderProps = {
  hasClerkPublishableKey: boolean
  isDark: boolean
  onToggleTheme: () => void
  palette: LandingPalette
}

export default function LandingHeader({
  hasClerkPublishableKey,
  isDark,
  onToggleTheme,
  palette,
}: LandingHeaderProps) {
  return (
    <nav
      className="relative left-1/2 right-1/2 -mx-[50vw] w-screen"
      style={{ backgroundColor: palette.headerBackground }}
    >
      <div className="mx-auto flex max-w-[80rem] items-center justify-between gap-3 px-5 py-4 sm:px-8 sm:py-5 lg:px-12 lg:py-[1.375rem]">
        <Link to="/" className="flex min-w-0 items-center gap-2.5 no-underline sm:gap-3">
          <Logo className="size-8 sm:size-[2.375rem]" />
          <div>
            <p
              className="text-[0.5625rem] font-semibold uppercase"
              style={{ letterSpacing: '0.22em', color: palette.mutedStrong }}
            >
              c11
            </p>
            <p
              className="text-base font-semibold leading-none"
              style={{ color: palette.foreground }}
            >
              Finances
            </p>
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <SignedIn>
            <Link
              to="/dashboard"
              className="text-[0.75rem] font-medium transition-colors sm:text-[0.8125rem]"
              style={{
                background: 'none',
                border: `0.0625rem solid ${palette.border}`,
                color: palette.foreground,
                padding: '0.4375rem 0.875rem',
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.background = palette.surfaceAlt
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background = 'none'
              }}
            >
              Workspace
            </Link>
          </SignedIn>
          <SignedOut>
            {hasClerkPublishableKey ? (
              <SignInButton mode="modal">
                <NavGhostButton
                  borderColor={palette.border}
                  foreground={palette.foreground}
                  hoverBackground={palette.surfaceAlt}
                >
                  Sign in
                </NavGhostButton>
              </SignInButton>
            ) : null}
          </SignedOut>
          <NavGhostButton
            className="w-[2.1875rem] px-0"
            borderColor={palette.border}
            foreground={palette.foreground}
            hoverBackground={palette.surfaceAlt}
            onClick={onToggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? (
              <IconMoon
                aria-hidden
                className="shrink-0"
                size="1rem"
                strokeWidth={2}
                style={{ color: palette.foreground }}
              />
            ) : (
              <IconSun
                aria-hidden
                className="shrink-0"
                size="1rem"
                strokeWidth={2}
                style={{ color: palette.foreground }}
              />
            )}
          </NavGhostButton>
        </div>
      </div>
    </nav>
  )
}
