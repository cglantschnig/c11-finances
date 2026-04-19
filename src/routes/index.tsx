import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { IconArrowRight, IconMoon, IconSun } from '@tabler/icons-react'
import { useTheme } from 'next-themes'
import Logo from '#/components/logo'
import { hasClerkPublishableKey } from '#/integrations/clerk/config'
import { cn } from '#/lib/utils'

export const Route = createFileRoute('/')({
  ssr: false,
  component: HomePage,
})

const MOCK_HOLDINGS = [
  { ticker: 'AAPL', qty: '14 shares', value: '$2,940', change: '+12.4%' },
  { ticker: 'MSFT', qty: '8 shares', value: '$3,120', change: '+8.1%' },
  { ticker: 'NVDA', qty: '3 shares', value: '$2,817', change: '+44.2%' },
  { ticker: 'BTC', qty: '0.12', value: '$7,680', change: '+61.0%' },
]

const LANDING_THEME = {
  dark: {
    background: 'oklch(0.148 0.004 228.8)',
    backgroundImage:
      'radial-gradient(circle at top left, rgba(76, 201, 240, 0.16), transparent 34%), radial-gradient(circle at top right, rgba(34, 197, 94, 0.12), transparent 28%)',
    foreground: '#fff',
    headerBackground: 'transparent',
    gridLine: 'rgba(255,255,255,0.04)',
    border: 'rgba(255,255,255,0.1)',
    borderSoft: 'rgba(255,255,255,0.08)',
    borderSubtle: 'rgba(255,255,255,0.06)',
    muted: 'rgba(255,255,255,0.5)',
    mutedStrong: 'rgba(255,255,255,0.4)',
    mutedSoft: 'rgba(255,255,255,0.35)',
    surface: 'oklch(0.218 0.008 223.9 / 0.92)',
    surfaceAlt: 'rgba(255,255,255,0.07)',
    positive: 'oklch(0.64 0.156 149.56)',
    watermarkOpacity: 0.05,
    watermarkFilter: 'brightness(10)',
  },
  light: {
    background: 'oklch(0.982 0.007 220)',
    backgroundImage:
      'radial-gradient(circle at top left, rgba(15, 118, 110, 0.16), transparent 34%), radial-gradient(circle at top right, rgba(59, 130, 246, 0.12), transparent 28%)',
    foreground: 'oklch(0.19 0.014 236)',
    headerBackground: 'rgba(255,255,255,0.96)',
    gridLine: 'rgba(15,23,42,0.04)',
    border: 'rgba(15,23,42,0.12)',
    borderSoft: 'rgba(15,23,42,0.08)',
    borderSubtle: 'rgba(15,23,42,0.06)',
    muted: 'rgba(15,23,42,0.62)',
    mutedStrong: 'rgba(15,23,42,0.5)',
    mutedSoft: 'rgba(15,23,42,0.38)',
    surface: 'rgba(255,255,255,0.82)',
    surfaceAlt: 'rgba(15,23,42,0.05)',
    positive: 'oklch(0.59 0.165 149.56)',
    watermarkOpacity: 0.08,
    watermarkFilter: 'none',
  },
} as const

function HomePage() {
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
      {/* Grid background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            `linear-gradient(${palette.gridLine} 0.0625rem, transparent 0.0625rem), linear-gradient(90deg, ${palette.gridLine} 0.0625rem, transparent 0.0625rem)`,
          backgroundSize: '5rem 5rem',
        }}
      />

      {/* Logo watermark */}
      <img
        src="/logo.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute right-[-7.5rem] top-[20%] z-0 w-[20rem] md:right-[-7.5rem] md:top-1/2 md:w-[28.75rem] md:-translate-y-1/2 lg:right-[-5rem] lg:w-[36.25rem]"
        style={{
          opacity: palette.watermarkOpacity,
          filter: palette.watermarkFilter,
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-svh max-w-[80rem] flex-col px-5 sm:px-8 lg:px-12">
        {/* Nav */}
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
                    border: `0.0625rem solid ${palette.border}`,
                    padding: '0.4375rem 0.875rem',
                    background: 'none',
                    color: palette.foreground,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = palette.surfaceAlt)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = 'none')
                  }
                >
                  Workspace
                </Link>
              </SignedIn>
              <SignedOut>
                {hasClerkPublishableKey && (
                  <SignInButton mode="modal">
                    <NavGhostButton
                      borderColor={palette.border}
                      foreground={palette.foreground}
                      hoverBackground={palette.surfaceAlt}
                    >
                      Sign in
                    </NavGhostButton>
                  </SignInButton>
                )}
              </SignedOut>
              <NavGhostButton
                className="w-[2.1875rem] px-0"
                borderColor={palette.border}
                foreground={palette.foreground}
                hoverBackground={palette.surfaceAlt}
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
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

        {/* Hero */}
        <section className="grid flex-1 grid-cols-1 items-start gap-10 py-8 sm:gap-12 sm:py-12 md:py-16 lg:grid-cols-2 lg:items-center lg:gap-[4.5rem] lg:py-[4.5rem]">
          {/* Left: copy + CTA */}
          <div className="max-w-[35rem]">
            <div
              className="mb-6 inline-block text-[0.625rem] font-semibold uppercase sm:mb-8 sm:text-[0.6875rem]"
              style={{
                border: `0.0625rem solid ${palette.border}`,
                padding: '0.25rem 0.875rem',
                letterSpacing: '0.16em',
                color: palette.muted,
              }}
            >
              Portfolio Tracker
            </div>

            <h1
              className="mb-5 max-w-[12ch] text-[2.5rem] font-bold sm:text-[3rem] lg:mb-[1.375rem] lg:max-w-[30rem] lg:text-[3.375rem]"
              style={{ lineHeight: 1.07, letterSpacing: '-0.025em' }}
            >
              Every position.
              <br />
              One clear picture.
            </h1>

            <p
              className="mb-8 max-w-[36ch] text-[0.9375rem] sm:mb-10 sm:text-base lg:mb-11 lg:max-w-[26.25rem]"
              style={{ lineHeight: 1.65, color: palette.muted }}
            >
              Record transactions across currencies, track open positions by
              market value, and maintain a complete FX-aware ledger.
            </p>

            <SignedIn>
              <Link
                to="/dashboard"
                className="inline-flex w-full items-center justify-center gap-2.5 text-[0.9375rem] font-semibold no-underline transition-opacity hover:opacity-85 active:scale-[0.98] sm:w-auto"
                style={{
                  background: palette.positive,
                  padding: '0.875rem 2rem',
                  color: '#fff',
                }}
              >
                Open portfolio
                <IconArrowRight className="size-4" strokeWidth={2.2} />
              </Link>
            </SignedIn>
            <SignedOut>
              {hasClerkPublishableKey ? (
                <SignInButton mode="modal">
                  <TealCtaButton background={palette.positive} />
                </SignInButton>
              ) : (
                <Link
                  to="/dashboard"
                  className="inline-flex w-full items-center justify-center gap-2.5 text-[0.9375rem] font-semibold no-underline transition-opacity hover:opacity-85 sm:w-auto"
                  style={{
                    background: palette.positive,
                    padding: '0.875rem 2rem',
                    color: '#fff',
                  }}
                >
                  Open portfolio
                  <IconArrowRight className="size-4" strokeWidth={2.2} />
                </Link>
              )}
            </SignedOut>
          </div>

          {/* Right: portfolio card */}
          <div
            className="overflow-hidden shadow-[0_1.25rem_4.375rem_rgba(15,23,42,0.12)]"
            style={{
              border: `0.0625rem solid ${palette.border}`,
              background: palette.surface,
              backdropFilter: 'blur(1.25rem)',
            }}
          >
            <div
              className="px-5 py-5 sm:px-[1.625rem] sm:py-[1.375rem]"
              style={{ borderBottom: `0.0625rem solid ${palette.borderSoft}` }}
            >
              <p
                className="mb-2.5 text-[0.6875rem] font-semibold uppercase"
                style={{ letterSpacing: '0.14em', color: palette.mutedStrong }}
              >
                Portfolio · USD
              </p>
              <p
                className="text-[2.125rem] font-bold leading-none"
                style={{ letterSpacing: '-0.025em' }}
              >
                $16,557
              </p>
              <p
                className="mt-1.5 text-[0.8125rem] font-medium"
                style={{ color: palette.positive }}
              >
                ↑ +$1,842 today
              </p>
            </div>

            <div className="md:hidden">
              {MOCK_HOLDINGS.map((row, i) => (
                <div
                  key={row.ticker}
                  className="flex items-start justify-between gap-4 px-5 py-4"
                  style={
                    i > 0
                      ? { borderTop: `0.0625rem solid ${palette.borderSubtle}` }
                      : {}
                  }
                >
                  <div>
                    <div
                      className="text-[0.875rem] font-semibold"
                      style={{ color: palette.foreground }}
                    >
                      {row.ticker}
                    </div>
                    <div
                      className="mt-1 text-[0.6875rem]"
                      style={{ color: palette.mutedSoft }}
                    >
                      {row.qty}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className="text-[0.875rem] font-medium"
                      style={{ color: palette.muted }}
                    >
                      {row.value}
                    </div>
                    <div
                      className="mt-1 text-[0.75rem] font-semibold"
                      style={{ color: palette.positive }}
                    >
                      {row.change}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <table className="hidden w-full border-collapse md:table">
              <thead>
                <tr>
                  {['Asset', 'Value', 'Change'].map((h) => (
                    <th
                      key={h}
                      className="text-left text-[0.6875rem] font-semibold uppercase"
                      style={{
                        padding: '0.625rem 1.125rem',
                        letterSpacing: '0.1em',
                        color: palette.mutedSoft,
                        borderBottom: `0.0625rem solid ${palette.borderSoft}`,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_HOLDINGS.map((row, i) => (
                  <tr
                    key={row.ticker}
                    style={
                      i > 0
                        ? { borderTop: `0.0625rem solid ${palette.borderSubtle}` }
                        : {}
                    }
                  >
                    <td className="align-middle" style={{ padding: '0.8125rem 1.125rem' }}>
                      <div
                        className="text-[0.875rem] font-semibold"
                        style={{ color: palette.foreground }}
                      >
                        {row.ticker}
                      </div>
                      <div
                        className="mt-0.5 text-[0.6875rem]"
                        style={{ color: palette.mutedSoft }}
                      >
                        {row.qty}
                      </div>
                    </td>
                    <td
                      className="align-middle text-[0.875rem] font-medium"
                      style={{ padding: '0.8125rem 1.125rem', color: palette.muted }}
                    >
                      {row.value}
                    </td>
                    <td
                      className="align-middle text-[0.8125rem] font-semibold"
                      style={{ padding: '0.8125rem 1.125rem', color: palette.positive }}
                    >
                      {row.change}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="pb-5 pt-1 text-center sm:pb-6 sm:pt-2">
          <p
            className="text-[0.6875rem]"
            style={{ letterSpacing: '0.08em', color: palette.mutedSoft }}
          >
            {`© ${currentYear} Christopher Glantschnig`}
          </p>
        </footer>
      </div>
    </div>
  )
}

function NavGhostButton({
  className,
  children,
  borderColor,
  foreground,
  hoverBackground,
  type = 'button',
  ...props
}: ComponentPropsWithoutRef<'button'> & {
  borderColor: string
  children: ReactNode
  className?: string
  foreground: string
  hoverBackground: string
}) {
  return (
    <button
      {...props}
      type={type}
      className={cn(
        'inline-flex h-[2.1875rem] cursor-pointer items-center justify-center gap-2 px-[0.875rem] text-[0.75rem] font-medium transition-colors sm:px-[1.125rem] sm:text-[0.8125rem]',
        className,
      )}
      style={{
        background: 'none',
        border: `0.0625rem solid ${borderColor}`,
        color: foreground,
        fontFamily: 'inherit',
      }}
      onMouseEnter={(e) => {
        props.onMouseEnter?.(e)
        e.currentTarget.style.background = hoverBackground
      }}
      onMouseLeave={(e) => {
        props.onMouseLeave?.(e)
        e.currentTarget.style.background = 'none'
      }}
    >
      {children}
    </button>
  )
}

function TealCtaButton({
  background,
  type = 'button',
  ...props
}: ComponentPropsWithoutRef<'button'> & {
  background: string
}) {
  return (
    <button
      {...props}
      type={type}
      className="inline-flex w-full cursor-pointer items-center justify-center gap-2.5 text-[0.9375rem] font-semibold text-white transition-opacity hover:opacity-85 active:scale-[0.98] sm:w-auto"
      style={{
        background,
        border: 'none',
        padding: '0.875rem 2rem',
        fontFamily: 'inherit',
      }}
    >
      Sign in to begin
      <IconArrowRight className="size-4" strokeWidth={2.2} />
    </button>
  )
}
