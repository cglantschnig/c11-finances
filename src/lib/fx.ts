export const COMMON_CURRENCIES = ['EUR', 'USD', 'GBP'] as const

async function fetchFrankfurterRate(options: {
  base: string
  date?: string
  quote: string
  signal?: AbortSignal
}) {
  const { base, date, quote, signal } = options

  if (base === quote) {
    return 1
  }

  const url = new URL('https://api.frankfurter.dev/v2/rates')
  url.searchParams.set('base', base)
  url.searchParams.set('quotes', quote)
  if (date) {
    url.searchParams.set('date', date)
  }

  const response = await fetch(url, { signal })
  if (!response.ok) {
    throw new Error(`FX lookup failed with ${response.status}.`)
  }

  const payload = (await response.json()) as Array<{
    rate?: number
  }>
  const rate = payload[0]?.rate

  if (!Number.isFinite(rate) || !rate || rate <= 0) {
    throw new Error(`No FX rate found for ${base}/${quote}.`)
  }

  return rate
}

export async function fetchHistoricalFxRate(options: {
  base: string
  date: string
  quote: string
  signal?: AbortSignal
}) {
  const { base, date, quote, signal } = options
  return await fetchFrankfurterRate({
    base,
    date,
    quote,
    signal,
  })
}

export async function fetchLatestFxRate(options: {
  base: string
  quote: string
  signal?: AbortSignal
}) {
  const { base, quote, signal } = options

  return await fetchFrankfurterRate({
    base,
    quote,
    signal,
  })
}
