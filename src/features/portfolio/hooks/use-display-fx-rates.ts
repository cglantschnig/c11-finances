import { useEffect, useState } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { getLatestFxRates } from '#/features/portfolio/server/fx-cache.functions'

type UseDisplayFxRatesOptions = {
  baseCurrencies: string[] | null
  quoteCurrency: string
}

export function useDisplayFxRates({
  baseCurrencies,
  quoteCurrency,
}: UseDisplayFxRatesOptions) {
  const getLatestFxRatesFn = useServerFn(getLatestFxRates)
  const [rates, setRates] = useState<Record<string, number> | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (baseCurrencies === null) {
      setRates(null)
      setError(null)
      return
    }

    if (baseCurrencies.length === 0) {
      setRates({})
      setError(null)
      return
    }

    let isCancelled = false

    setRates(null)
    setError(null)

    void getLatestFxRatesFn({
      data: {
        baseCurrencies,
        quoteCurrency,
      },
    })
      .then((nextRates) => {
        if (!isCancelled) {
          setRates(nextRates)
        }
      })
      .catch((nextError) => {
        if (!isCancelled) {
          setError(
            nextError instanceof Error
              ? nextError.message
              : 'Unable to load FX rates.',
          )
        }
      })

    return () => {
      isCancelled = true
    }
  }, [baseCurrencies, getLatestFxRatesFn, quoteCurrency])

  return {
    error,
    rates,
  }
}
