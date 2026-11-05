export const converterCurrencies = ['USD', 'EUR', 'GBP', 'AED', 'ARS', 'AUD', 'BDT'] as const

export type ExchangeRate = { rate: number; date: string | null }

export type ExchangeRatesResponse = {
  base: 'USD'
  rates: Record<string, ExchangeRate>
  fetchedAt: string
  cached: boolean
  stale: boolean
}
