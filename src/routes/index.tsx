import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { IconArrowRight } from '@tabler/icons-react'
import Logo from '#/components/logo'
import ModeToggle from '#/components/mode-toggle'
import { hasClerkPublishableKey } from '#/integrations/clerk/config'

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

function HomePage() {
  return (
    <div
      className="relative min-h-svh overflow-hidden font-sans"
      style={{ background: 'oklch(0.148 0.004 228.8)', color: '#fff' }}
    >
      {/* Grid background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* Logo watermark */}
      <img
        src="/logo.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute right-[-80px] top-1/2 z-0 w-[580px] -translate-y-1/2"
        style={{ opacity: 0.05, filter: 'brightness(10)' }}
      />

      <div className="relative z-10 mx-auto flex min-h-svh max-w-[1280px] flex-col px-12">
        {/* Nav */}
        <nav
          className="flex items-center justify-between py-[22px]"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
        >
          <Link to="/" className="flex items-center gap-3 no-underline">
            <Logo className="size-[38px]" />
            <div>
              <p
                className="text-[9px] font-semibold uppercase"
                style={{ letterSpacing: '0.22em', color: 'rgba(255,255,255,0.4)' }}
              >
                F11
              </p>
              <p className="text-base font-semibold leading-none text-white">Finances</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <SignedIn>
              <Link
                to="/dashboard"
                className="text-[13px] font-medium text-white transition-colors"
                style={{
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '7px 18px',
                  background: 'none',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')
                }
                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
              >
                Workspace
              </Link>
            </SignedIn>
            <SignedOut>
              {hasClerkPublishableKey && (
                <SignInButton mode="modal">
                  <NavGhostButton>Sign in</NavGhostButton>
                </SignInButton>
              )}
            </SignedOut>
            <ModeToggle />
          </div>
        </nav>

        {/* Hero */}
        <section className="grid flex-1 grid-cols-2 items-center gap-[72px] py-[72px]">
          {/* Left: copy + CTA */}
          <div>
            <div
              className="mb-8 inline-block text-[11px] font-semibold uppercase"
              style={{
                border: '1px solid rgba(255,255,255,0.15)',
                padding: '4px 14px',
                letterSpacing: '0.16em',
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              Portfolio Tracker
            </div>

            <h1
              className="mb-[22px] max-w-[480px] text-[54px] font-bold text-white"
              style={{ lineHeight: 1.07, letterSpacing: '-0.025em' }}
            >
              Every position.
              <br />
              One clear picture.
            </h1>

            <p
              className="mb-11 max-w-[420px] text-base"
              style={{ lineHeight: 1.65, color: 'rgba(255,255,255,0.5)' }}
            >
              Record transactions across currencies, track open positions by
              market value, and maintain a complete FX-aware ledger.
            </p>

            <SignedIn>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2.5 text-[15px] font-semibold text-white no-underline transition-opacity hover:opacity-85 active:scale-[0.98]"
                style={{
                  background: 'oklch(0.64 0.156 149.56)',
                  padding: '14px 32px',
                }}
              >
                Open portfolio
                <IconArrowRight className="size-4" strokeWidth={2.2} />
              </Link>
            </SignedIn>
            <SignedOut>
              {hasClerkPublishableKey ? (
                <SignInButton mode="modal">
                  <TealCtaButton />
                </SignInButton>
              ) : (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2.5 text-[15px] font-semibold text-white no-underline transition-opacity hover:opacity-85"
                  style={{
                    background: 'oklch(0.64 0.156 149.56)',
                    padding: '14px 32px',
                  }}
                >
                  Open portfolio
                  <IconArrowRight className="size-4" strokeWidth={2.2} />
                </Link>
              )}
            </SignedOut>
          </div>

          {/* Right: portfolio card */}
          <div style={{ border: '1px solid rgba(255,255,255,0.09)', background: 'oklch(0.218 0.008 223.9)' }}>
            <div
              className="px-[26px] py-[22px]"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
            >
              <p
                className="mb-2.5 text-[11px] font-semibold uppercase"
                style={{ letterSpacing: '0.14em', color: 'rgba(255,255,255,0.4)' }}
              >
                Portfolio · USD
              </p>
              <p
                className="text-[34px] font-bold leading-none text-white"
                style={{ letterSpacing: '-0.025em' }}
              >
                $16,557
              </p>
              <p
                className="mt-1.5 text-[13px] font-medium"
                style={{ color: 'oklch(0.64 0.156 149.56)' }}
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
                        color: 'rgba(255,255,255,0.35)',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
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
                    style={i > 0 ? { borderTop: '1px solid rgba(255,255,255,0.06)' } : {}}
                  >
                    <td className="align-middle" style={{ padding: '13px 18px' }}>
                      <div className="text-[14px] font-semibold text-white">{row.ticker}</div>
                      <div
                        className="mt-0.5 text-[11px]"
                        style={{ color: 'rgba(255,255,255,0.35)' }}
                      >
                        {row.qty}
                      </div>
                    </td>
                    <td
                      className="align-middle text-[14px] font-medium"
                      style={{ padding: '13px 18px', color: 'rgba(255,255,255,0.8)' }}
                    >
                      {row.value}
                    </td>
                    <td
                      className="align-middle text-[13px] font-semibold"
                      style={{ padding: '13px 18px', color: 'oklch(0.64 0.156 149.56)' }}
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
  children,
  type = 'button',
  ...props
}: ComponentPropsWithoutRef<'button'> & { children: ReactNode }) {
  return (
    <button
      {...props}
      type={type}
      className="cursor-pointer text-[13px] font-medium text-white transition-colors hover:bg-white/[0.07]"
      style={{
        background: 'none',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '7px 18px',
        fontFamily: 'inherit',
      }}
    >
      {children}
    </button>
  )
}

function TealCtaButton({
  type = 'button',
  ...props
}: ComponentPropsWithoutRef<'button'>) {
  return (
    <button
      {...props}
      type={type}
      className="inline-flex cursor-pointer items-center gap-2.5 text-[15px] font-semibold text-white transition-opacity hover:opacity-85 active:scale-[0.98]"
      style={{
        background: 'oklch(0.64 0.156 149.56)',
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
