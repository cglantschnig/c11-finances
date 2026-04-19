export const userCurrencyOptions = ['EUR', 'USD', 'THB', 'PHP'] as const

export type UserCurrency = (typeof userCurrencyOptions)[number]

export const defaultUserCurrency: UserCurrency = 'EUR'

export function isUserCurrency(value: string): value is UserCurrency {
  return userCurrencyOptions.includes(value as UserCurrency)
}
