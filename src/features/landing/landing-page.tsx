import { SignedIn, SignedOut } from '@clerk/clerk-react'
import { Navigate } from '@tanstack/react-router'
import { useTheme } from 'next-themes'
import { hasClerkPublishableKey } from '#/app/config/clerk'
import LandingHeader from './components/landing-header'
import LandingHero from './components/landing-hero'
import { LANDING_THEME } from './constants/landing-theme'

export function LandingPage() {
  if (hasClerkPublishableKey) {
    return (
      <>
        <SignedIn>
          <Navigate to="/dashboard" replace />
        </SignedIn>
        <SignedOut>
          <LandingScreen />
        </SignedOut>
      </>
    )
  }

  return <LandingScreen />
}

function LandingScreen() {
  const { resolvedTheme, setTheme } = useTheme()
  const palette =
    resolvedTheme === 'light' ? LANDING_THEME.light : LANDING_THEME.dark
  const isDark = resolvedTheme === 'dark'
  const currentYear = new Date().getFullYear()

  return (
    <div
      className="relative min-h-svh overflow-hidden font-sans"
      style={{
        backgroundColor: palette.background,
        backgroundImage: palette.backgroundImage,
        color: palette.foreground,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            `linear-gradient(${palette.gridLine} 0.0625rem, transparent 0.0625rem), linear-gradient(90deg, ${palette.gridLine} 0.0625rem, transparent 0.0625rem)`,
          backgroundSize: '5rem 5rem',
        }}
      />

      <img
        src="/logo.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute right-[-7.5rem] top-[20%] z-0 w-[20rem] md:right-[-7.5rem] md:top-1/2 md:w-[28.75rem] md:-translate-y-1/2 lg:right-[-5rem] lg:w-[36.25rem]"
        style={{
          filter: palette.watermarkFilter,
          opacity: palette.watermarkOpacity,
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-svh max-w-[80rem] flex-col px-5 sm:px-8 lg:px-12">
        <LandingHeader
          hasClerkPublishableKey={hasClerkPublishableKey}
          isDark={isDark}
          onToggleTheme={() => setTheme(isDark ? 'light' : 'dark')}
          palette={palette}
        />
        <LandingHero
          hasClerkPublishableKey={hasClerkPublishableKey}
          palette={palette}
        />
        <footer className="pb-5 pt-1 text-center sm:pb-6 sm:pt-2">
          <p
            className="text-[0.6875rem]"
            style={{ color: palette.mutedSoft, letterSpacing: '0.08em' }}
          >
            {`© ${currentYear} Christopher Glantschnig`}
          </p>
        </footer>
      </div>
    </div>
  )
}
