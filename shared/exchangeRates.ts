export { converterCurrencies } from '#shared/currencies.ts'

export type ExchangeRate = { rate: number; date: string | null }

export type ExchangeRatesResponse = {
  base: 'USD'
  rates: Record<string, ExchangeRate>
  fetchedAt: string
  cached: boolean
  stale: boolean
}

export function getPairRate(from: string, to: string, rates?: ExchangeRatesResponse['rates']): number | null {
  if (from === to) return 1
  const fromRate = rates?.[from]?.rate
  const toRate = rates?.[to]?.rate
  return fromRate && toRate ? toRate / fromRate : null
}
