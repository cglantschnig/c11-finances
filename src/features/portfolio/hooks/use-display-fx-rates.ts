import { useEffect, useState } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { getLatestFxRates } from '#/features/portfolio/server/fx-cache.functions'

type UseDisplayFxRatesOptions = {
  baseCurrencies: string[] | null
  quoteCurrency: string
}

export function normalizeDisplayFxBaseCurrencies(baseCurrencies: string[] | null) {
  return baseCurrencies === null ? null : [...new Set(baseCurrencies)].sort()
}

export function getDisplayFxBaseCurrenciesKey(baseCurrencies: string[] | null) {
  const normalizedBaseCurrencies = normalizeDisplayFxBaseCurrencies(baseCurrencies)
  return normalizedBaseCurrencies === null ? null : normalizedBaseCurrencies.join('|')
}

function parseDisplayFxBaseCurrenciesKey(baseCurrenciesKey: string | null) {
  if (baseCurrenciesKey === null) {
    return null
  }

  return baseCurrenciesKey === '' ? [] : baseCurrenciesKey.split('|')
}

export function useDisplayFxRates({
  baseCurrencies,
  quoteCurrency,
}: UseDisplayFxRatesOptions) {
  const getLatestFxRatesFn = useServerFn(getLatestFxRates)
  const [rates, setRates] = useState<Record<string, number> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const baseCurrenciesKey = getDisplayFxBaseCurrenciesKey(baseCurrencies)

  useEffect(() => {
    const normalizedBaseCurrencies =
      parseDisplayFxBaseCurrenciesKey(baseCurrenciesKey)

    if (normalizedBaseCurrencies === null) {
      setRates(null)
      setError(null)
      return
    }

    if (normalizedBaseCurrencies.length === 0) {
      setRates({})
      setError(null)
      return
    }

    let isCancelled = false

    setRates(null)
    setError(null)

    void getLatestFxRatesFn({
      data: {
        baseCurrencies: normalizedBaseCurrencies,
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
  }, [baseCurrenciesKey, getLatestFxRatesFn, quoteCurrency])

  return {
    error,
    rates,
  }
}
