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
            `linear-gradient(${palette.gridLine} 1px, transparent 1px), linear-gradient(90deg, ${palette.gridLine} 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Logo watermark */}
      <img
        src="/logo.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute right-[-80px] top-1/2 z-0 w-[580px] -translate-y-1/2"
        style={{
          opacity: palette.watermarkOpacity,
          filter: palette.watermarkFilter,
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-svh max-w-[1280px] flex-col px-12">
        {/* Nav */}
        <nav className="flex items-center justify-between py-[22px]">
          <Link to="/" className="flex items-center gap-3 no-underline">
            <Logo className="size-[38px]" />
            <div>
              <p
                className="text-[9px] font-semibold uppercase"
                style={{ letterSpacing: '0.22em', color: palette.mutedStrong }}
              >
                F11
              </p>
              <p
                className="text-base font-semibold leading-none"
                style={{ color: palette.foreground }}
              >
                Finances
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <SignedIn>
              <Link
                to="/dashboard"
                className="text-[13px] font-medium transition-colors"
                style={{
                  border: `1px solid ${palette.border}`,
                  padding: '7px 18px',
                  background: 'none',
                  color: palette.foreground,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = palette.surfaceAlt)
                }
                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
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
              className="w-[35px] px-0"
              borderColor={palette.border}
              foreground={palette.foreground}
              hoverBackground={palette.surfaceAlt}
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? (
                <IconMoon className="size-4" />
              ) : (
                <IconSun className="size-4" />
              )}
            </NavGhostButton>
          </div>
        </nav>

        {/* Hero */}
        <section className="grid flex-1 grid-cols-2 items-center gap-[72px] py-[72px]">
          {/* Left: copy + CTA */}
          <div>
            <div
              className="mb-8 inline-block text-[11px] font-semibold uppercase"
              style={{
                border: `1px solid ${palette.border}`,
                padding: '4px 14px',
                letterSpacing: '0.16em',
                color: palette.muted,
              }}
            >
              Portfolio Tracker
            </div>

            <h1
              className="mb-[22px] max-w-[480px] text-[54px] font-bold"
              style={{ lineHeight: 1.07, letterSpacing: '-0.025em' }}
            >
              Every position.
              <br />
              One clear picture.
            </h1>

            <p
              className="mb-11 max-w-[420px] text-base"
              style={{ lineHeight: 1.65, color: palette.muted }}
            >
              Record transactions across currencies, track open positions by
              market value, and maintain a complete FX-aware ledger.
            </p>

            <SignedIn>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2.5 text-[15px] font-semibold no-underline transition-opacity hover:opacity-85 active:scale-[0.98]"
                style={{
                  background: palette.positive,
                  padding: '14px 32px',
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
                  className="inline-flex items-center gap-2.5 text-[15px] font-semibold no-underline transition-opacity hover:opacity-85"
                  style={{
                    background: palette.positive,
                    padding: '14px 32px',
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
            style={{
              border: `1px solid ${palette.border}`,
              background: palette.surface,
              backdropFilter: 'blur(20px)',
            }}
          >
            <div
              className="px-[26px] py-[22px]"
              style={{ borderBottom: `1px solid ${palette.borderSoft}` }}
            >
              <p
                className="mb-2.5 text-[11px] font-semibold uppercase"
                style={{ letterSpacing: '0.14em', color: palette.mutedStrong }}
              >
                Portfolio · USD
              </p>
              <p
                className="text-[34px] font-bold leading-none"
                style={{ letterSpacing: '-0.025em' }}
              >
                $16,557
              </p>
              <p
                className="mt-1.5 text-[13px] font-medium"
                style={{ color: palette.positive }}
              >
                ↑ +$1,842 today
              </p>
            </div>

            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {['Asset', 'Value', 'Change'].map((h) => (
                    <th
                      key={h}
                      className="text-left text-[11px] font-semibold uppercase"
                      style={{
                        padding: '10px 18px',
                        letterSpacing: '0.1em',
                        color: palette.mutedSoft,
                        borderBottom: `1px solid ${palette.borderSoft}`,
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
                    style={i > 0 ? { borderTop: `1px solid ${palette.borderSubtle}` } : {}}
                  >
                    <td className="align-middle" style={{ padding: '13px 18px' }}>
                      <div
                        className="text-[14px] font-semibold"
                        style={{ color: palette.foreground }}
                      >
                        {row.ticker}
                      </div>
                      <div
                        className="mt-0.5 text-[11px]"
                        style={{ color: palette.mutedSoft }}
                      >
                        {row.qty}
                      </div>
                    </td>
                    <td
                      className="align-middle text-[14px] font-medium"
                      style={{ padding: '13px 18px', color: palette.muted }}
                    >
                      {row.value}
                    </td>
                    <td
                      className="align-middle text-[13px] font-semibold"
                      style={{ padding: '13px 18px', color: palette.positive }}
                    >
                      {row.change}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
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
        'inline-flex h-[35px] cursor-pointer items-center justify-center gap-2 px-[18px] text-[13px] font-medium transition-colors',
        className,
      )}
      style={{
        background: 'none',
        border: `1px solid ${borderColor}`,
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
      className="inline-flex cursor-pointer items-center gap-2.5 text-[15px] font-semibold text-white transition-opacity hover:opacity-85 active:scale-[0.98]"
      style={{
        background,
        border: 'none',
        padding: '14px 32px',
        fontFamily: 'inherit',
      }}
    >
      Sign in to begin
      <IconArrowRight className="size-4" strokeWidth={2.2} />
    </button>
  )
}
