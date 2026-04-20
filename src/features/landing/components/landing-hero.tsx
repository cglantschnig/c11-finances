import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react'
import { Link } from '@tanstack/react-router'
import { IconArrowRight } from '@tabler/icons-react'
import type { LandingPalette } from '#/features/landing/constants/landing-theme'
import MockPortfolioCard from './mock-portfolio-card'
import TealCtaButton from './teal-cta-button'

type LandingHeroProps = {
  hasClerkPublishableKey: boolean
  palette: LandingPalette
}

export default function LandingHero({
  hasClerkPublishableKey,
  palette,
}: LandingHeroProps) {
  return (
    <section className="grid flex-1 grid-cols-1 items-start gap-10 py-8 sm:gap-12 sm:py-12 md:py-16 lg:grid-cols-2 lg:items-center lg:gap-[4.5rem] lg:py-[4.5rem]">
      <div className="max-w-[35rem]">
        <div
          className="mb-6 inline-block text-[0.625rem] font-semibold uppercase sm:mb-8 sm:text-[0.6875rem]"
          style={{
            border: `0.0625rem solid ${palette.border}`,
            color: palette.muted,
            letterSpacing: '0.16em',
            padding: '0.25rem 0.875rem',
          }}
        >
          Portfolio Tracker
        </div>

        <h1
          className="mb-5 max-w-[12ch] text-[2.5rem] font-bold sm:text-[3rem] lg:mb-[1.375rem] lg:max-w-[30rem] lg:text-[3.375rem]"
          style={{ letterSpacing: '-0.025em', lineHeight: 1.07 }}
        >
          Every position.
          <br />
          One clear picture.
        </h1>

        <p
          className="mb-8 max-w-[36ch] text-[0.9375rem] sm:mb-10 sm:text-base lg:mb-11 lg:max-w-[26.25rem]"
          style={{ color: palette.muted, lineHeight: 1.65 }}
        >
          Record transactions across currencies, track open positions by market
          value, and maintain a complete FX-aware ledger.
        </p>

        <SignedIn>
          <Link
            to="/dashboard"
            className="inline-flex w-full items-center justify-center gap-2.5 text-[0.9375rem] font-semibold no-underline transition-opacity hover:opacity-85 active:scale-[0.98] sm:w-auto"
            style={{
              background: palette.positive,
              color: '#fff',
              padding: '0.875rem 2rem',
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
                color: '#fff',
                padding: '0.875rem 2rem',
              }}
            >
              Open portfolio
              <IconArrowRight className="size-4" strokeWidth={2.2} />
            </Link>
          )}
        </SignedOut>
      </div>

      <MockPortfolioCard palette={palette} />
    </section>
  )
}
