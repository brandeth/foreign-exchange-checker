export type ConversionSnapshot = {
  fromCurrency: string
  toCurrency: string
  fromAmount: string
  toAmount: string
  exchangeRate: number
  rateDates: string
  stale: boolean
}

export type LoggedConversion = ConversionSnapshot & {
  id: string
  createdAt: string
}
