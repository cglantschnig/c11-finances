import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { useMutation } from 'convex/react'
import { toast } from 'sonner'
import { api } from '../../../../../convex/_generated/api'
import type { Doc } from '../../../../../convex/_generated/dataModel'
import {
  defaultUserCurrency,
  userCurrencyOptions,
} from '#/shared/config/currencies'
import {
  findAssetAutocompleteOption,
  getAssetAutocompleteOptions,
  type AssetAutocompleteOption,
} from '#/features/transactions/lib/asset-autocomplete'
import { todayIsoDate } from '#/shared/lib/format'
import { resolveTransactionFxRate } from '#/features/transactions/lib/resolve-transaction-fx'

function createInitialState(defaultCurrency: string) {
  const normalizedCurrency = defaultCurrency.trim().toUpperCase()

  return {
    assetName: '',
    assetType: 'equity' as 'equity' | 'crypto',
    date: todayIsoDate(),
    nativeCurrency:
      /^[A-Z]{3}$/.test(normalizedCurrency)
        ? normalizedCurrency
        : defaultUserCurrency,
    pricePerUnit: '',
    quantity: '',
    side: 'buy' as 'buy' | 'sell',
    ticker: '',
  }
}

export function useAddTransactionForm(
  open: boolean,
  onOpenChange: (open: boolean) => void,
  portfolio: Doc<'portfolios'>,
) {
  const addTransaction = useMutation(api.mutations.addTransaction)
  const defaultCurrency = portfolio.homeCurrency
  const [form, setForm] = useState(() => createInitialState(defaultCurrency))
  const [error, setError] = useState<string | null>(null)
  const [highlightedAssetIndex, setHighlightedAssetIndex] = useState(0)
  const [isAssetInputFocused, setIsAssetInputFocused] = useState(false)
  const [isAssetMenuOpen, setIsAssetMenuOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const deferredTicker = useDeferredValue(form.ticker)

  useEffect(() => {
    if (!open) {
      return
    }

    setForm(createInitialState(defaultCurrency))
    setError(null)
    setHighlightedAssetIndex(0)
    setIsAssetInputFocused(false)
    setIsAssetMenuOpen(false)
  }, [defaultCurrency, open])

  const canSubmit = useMemo(
    () =>
      Boolean(
        form.ticker.trim() &&
          form.nativeCurrency.length === 3 &&
          form.quantity &&
          form.pricePerUnit &&
          form.date,
      ),
    [form.date, form.nativeCurrency, form.pricePerUnit, form.quantity, form.ticker],
  )

  const assetAutocompleteOptions = useMemo(
    () => getAssetAutocompleteOptions(deferredTicker),
    [deferredTicker],
  )

  const transactionCurrencyOptions = useMemo(() => {
    const currencies = new Set([portfolio.homeCurrency, ...userCurrencyOptions])
    return [...currencies]
  }, [portfolio.homeCurrency])

  useEffect(() => {
    setHighlightedAssetIndex(0)
  }, [deferredTicker])

  function handleAssetInputChange(nextTicker: string) {
    const matchedOption = findAssetAutocompleteOption(nextTicker)

    setForm((current) => ({
      ...current,
      assetName: matchedOption?.name ?? '',
      assetType: matchedOption?.assetType ?? 'equity',
      ticker: nextTicker,
    }))
  }

  function handleAssetOptionSelect(option: AssetAutocompleteOption) {
    setForm((current) => ({
      ...current,
      assetName: option.name,
      ticker: option.symbol,
      assetType: option.assetType,
    }))
    setHighlightedAssetIndex(0)
    setIsAssetMenuOpen(false)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSaving(true)

    try {
      const fxRate = await resolveTransactionFxRate({
        date: form.date,
        homeCurrency: portfolio.homeCurrency,
        nativeCurrency: form.nativeCurrency,
      })

      await addTransaction({
        ...(form.assetName.trim()
          ? { assetName: form.assetName.trim() }
          : {}),
        assetType: form.assetType,
        date: form.date,
        fxRate,
        nativeCurrency: form.nativeCurrency,
        portfolioId: portfolio._id,
        pricePerUnit: Number(form.pricePerUnit),
        quantity: Number(form.quantity),
        side: form.side,
        ticker: form.ticker.trim().toUpperCase(),
      })

      toast.success('Transaction added', { duration: 2000 })
      onOpenChange(false)
      setForm(createInitialState(defaultCurrency))
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to save the transaction.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return {
    assetAutocompleteOptions,
    canSubmit,
    error,
    form,
    handleAssetInputChange,
    handleAssetOptionSelect,
    handleSubmit,
    highlightedAssetIndex,
    isAssetInputFocused,
    isAssetMenuOpen,
    isSaving,
    setForm,
    setHighlightedAssetIndex,
    setIsAssetInputFocused,
    setIsAssetMenuOpen,
    transactionCurrencyOptions,
  }
}
