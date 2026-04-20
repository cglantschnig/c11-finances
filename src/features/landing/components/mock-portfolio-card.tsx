import type { LandingPalette } from '#/features/landing/constants/landing-theme'

const MOCK_HOLDINGS = [
  { ticker: 'AAPL', qty: '14 shares', value: '$2,940', change: '+12.4%' },
  { ticker: 'MSFT', qty: '8 shares', value: '$3,120', change: '+8.1%' },
  { ticker: 'NVDA', qty: '3 shares', value: '$2,817', change: '+44.2%' },
  { ticker: 'BTC', qty: '0.12', value: '$7,680', change: '+61.0%' },
]

export default function MockPortfolioCard({
  palette,
}: {
  palette: LandingPalette
}) {
  return (
    <div
      className="overflow-hidden shadow-[0_1.25rem_4.375rem_rgba(15,23,42,0.12)]"
      style={{
        background: palette.surface,
        backdropFilter: 'blur(1.25rem)',
        border: `0.0625rem solid ${palette.border}`,
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
        {MOCK_HOLDINGS.map((row, index) => (
          <div
            key={row.ticker}
            className="flex items-start justify-between gap-4 px-5 py-4"
            style={
              index > 0
                ? { borderTop: `0.0625rem solid ${palette.borderSubtle}` }
                : undefined
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
            {['Asset', 'Value', 'Change'].map((heading) => (
              <th
                key={heading}
                className="text-left text-[0.6875rem] font-semibold uppercase"
                style={{
                  borderBottom: `0.0625rem solid ${palette.borderSoft}`,
                  color: palette.mutedSoft,
                  letterSpacing: '0.1em',
                  padding: '0.625rem 1.125rem',
                }}
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MOCK_HOLDINGS.map((row, index) => (
            <tr
              key={row.ticker}
              style={
                index > 0
                  ? { borderTop: `0.0625rem solid ${palette.borderSubtle}` }
                  : undefined
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
                style={{ color: palette.muted, padding: '0.8125rem 1.125rem' }}
              >
                {row.value}
              </td>
              <td
                className="align-middle text-[0.8125rem] font-semibold"
                style={{ color: palette.positive, padding: '0.8125rem 1.125rem' }}
              >
                {row.change}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
