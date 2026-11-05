import { converterCurrencies, type ExchangeRatesResponse, type ExchangeRate } from '#shared/exchangeRates.ts'

export const RATE_CACHE_TTL = 60 * 60 * 1000
export const FRANKFURTER_URL = `https://api.frankfurter.dev/v2/rates?base=USD&quotes=${converterCurrencies.filter(code => code !== 'USD').join(',')}`

export function parseRates(payload: unknown): Record<string, ExchangeRate> {
  if (!Array.isArray(payload) || !payload.length) throw new Error('Empty rates response')
  const rates: Record<string, ExchangeRate> = { USD: { rate: 1, date: null } }
  for (const row of payload) {
    if (!row || typeof row !== 'object'
      || row.base !== 'USD'
      || !converterCurrencies.includes(row.quote)
      || row.quote === 'USD'
      || typeof row.rate !== 'number' || !Number.isFinite(row.rate) || row.rate <= 0
      || typeof row.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(row.date)
      || !Number.isFinite(Date.parse(row.date))
      || new Date(row.date).toISOString().slice(0, 10) !== row.date
      || Object.hasOwn(rates, row.quote)) {
      throw new Error('Invalid rates response')
    }
    rates[row.quote] = { rate: row.rate, date: row.date }
  }
  return rates
}

// Cache is scoped to a server instance; concurrent requests share one refresh.
export function createExchangeRateService(fetchRates: () => Promise<unknown>, now = Date.now) {
  let cached: ExchangeRatesResponse | undefined
  let pending: Promise<ExchangeRatesResponse> | undefined

  async function refresh(): Promise<ExchangeRatesResponse> {
    try {
      const rates = parseRates(await fetchRates())
      cached = { base: 'USD', rates, fetchedAt: new Date(now()).toISOString(), cached: false, stale: false }
      return cached
    }
    catch (error) {
      if (cached) return { ...cached, cached: true, stale: true }
      throw error
    }
  }

  return async function getRates(): Promise<ExchangeRatesResponse> {
    if (cached && now() - Date.parse(cached.fetchedAt) < RATE_CACHE_TTL) {
      return { ...cached, cached: true, stale: false }
    }
    if (!pending) pending = refresh().finally(() => { pending = undefined })
    return pending
  }
}
