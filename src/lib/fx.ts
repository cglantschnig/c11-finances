export const COMMON_CURRENCIES = ['EUR', 'USD', 'GBP'] as const

export async function fetchHistoricalFxRate(options: {
  base: string
  date: string
  quote: string
  signal?: AbortSignal
}) {
  const { base, date, quote, signal } = options

  if (base === quote) {
    return 1
  }

  const url = new URL(`https://api.frankfurter.dev/v1/${date}`)
  url.searchParams.set('base', base)
  url.searchParams.set('symbols', quote)

  const response = await fetch(url, { signal })
  if (!response.ok) {
    throw new Error(`FX lookup failed with ${response.status}.`)
  }

  const payload = (await response.json()) as {
    rates?: Record<string, number>
  }
  const rate = payload.rates?.[quote]

  if (!Number.isFinite(rate) || !rate || rate <= 0) {
    throw new Error(`No FX rate found for ${base}/${quote} on ${date}.`)
  }

  return rate
}
