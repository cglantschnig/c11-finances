export function formatCurrency(
  value: number,
  currency: string,
  options?: Intl.NumberFormatOptions,
) {
  return new Intl.NumberFormat('en-US', {
    currency,
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: 'currency',
    ...options,
  }).format(value)
}

export function formatPercent(value: number) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    signDisplay: 'always',
    style: 'percent',
  }).format(value / 100)
}

export function formatQuantity(value: number) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 6,
  }).format(value)
}

export function todayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}
