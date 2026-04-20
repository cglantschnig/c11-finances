import { createServerFn } from '@tanstack/react-start'
import { getCachedLatestFxRates } from '#/features/portfolio/server/fx-cache.server'

export const getLatestFxRates = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: { baseCurrencies: string[]; quoteCurrency: string }) => data,
  )
  .handler(async ({ data }) => {
    return await getCachedLatestFxRates(data)
  })
