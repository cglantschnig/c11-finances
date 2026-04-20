import { fetchHistoricalFxRate } from '#/shared/lib/fx'

type HistoricalFxFetcher = typeof fetchHistoricalFxRate

export async function resolveTransactionFxRate(
  options: {
    date: string
    homeCurrency: string
    nativeCurrency: string
    signal?: AbortSignal
  },
  fetchRate: HistoricalFxFetcher = fetchHistoricalFxRate,
) {
  const { date, homeCurrency, nativeCurrency, signal } = options

  if (nativeCurrency === homeCurrency) {
    return 1
  }

  return await fetchRate({
    base: nativeCurrency,
    date,
    quote: homeCurrency,
    signal,
  })
}
