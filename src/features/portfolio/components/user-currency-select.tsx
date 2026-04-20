'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/shared/ui/select'
import {
  defaultUserCurrency,
  isUserCurrency,
  type UserCurrency,
  userCurrencyOptions,
} from '#/shared/config/currencies'

export default function UserCurrencySelect() {
  const settings = useQuery(api.queries.getUserSettings, {})
  const setUserCurrency = useMutation(api.mutations.setUserCurrency)
  const [selectedCurrency, setSelectedCurrency] =
    useState<UserCurrency>(defaultUserCurrency)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isSaving || !settings?.currency) {
      return
    }

    setSelectedCurrency(settings.currency)
  }, [isSaving, settings?.currency])

  async function handleValueChange(value: string) {
    if (!isUserCurrency(value) || value === selectedCurrency) {
      return
    }

    const previousCurrency = selectedCurrency

    try {
      setError(null)
      setIsSaving(true)
      setSelectedCurrency(value)
      await setUserCurrency({ currency: value })
    } catch (mutationError) {
      setSelectedCurrency(previousCurrency)
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : 'Unable to update currency.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-3 rounded-lg px-3 py-2">
        <div>
          <p className="text-sm font-medium text-sidebar-foreground">
            Currency
          </p>
        </div>
        <Select
          value={selectedCurrency}
          disabled={isSaving}
          onValueChange={handleValueChange}
        >
          <SelectTrigger
            aria-label="Select currency"
            className="h-9 min-w-20 border-sidebar-border/80 bg-sidebar-accent/30 text-sidebar-foreground hover:bg-sidebar-accent/60"
          >
            <SelectValue placeholder={defaultUserCurrency} />
          </SelectTrigger>
          <SelectContent>
            {userCurrencyOptions.map((currency) => (
              <SelectItem key={currency} value={currency}>
                {currency}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {error ? (
        <p className="px-3 text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  )
}
