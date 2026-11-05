export { converterCurrencies } from '#shared/currencies.ts'

export type ExchangeRate = { rate: number; date: string | null }

export type ExchangeRatesResponse = {
  base: 'USD'
  rates: Record<string, ExchangeRate>
  fetchedAt: string
  cached: boolean
  stale: boolean
}
