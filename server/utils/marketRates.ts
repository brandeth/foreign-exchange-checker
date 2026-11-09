import { buildMarketRates, marketQuoteCodes, type MarketObservations, type MarketRatesResponse } from '#shared/marketRates.ts'

export const MARKET_CACHE_TTL = 60 * 60 * 1000
// Wide enough to span weekends and holidays and still find two observations.
const LOOKBACK_DAYS = 14

export function marketRatesUrl(now: Date) {
  const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const from = new Date(to)
  from.setUTCDate(from.getUTCDate() - LOOKBACK_DAYS)
  const params = new URLSearchParams({
    base: 'USD',
    quotes: marketQuoteCodes.join(','),
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  })
  return `https://api.frankfurter.dev/v2/rates?${params}`
}

export function parseMarketObservations(payload: unknown): MarketObservations {
  if (!Array.isArray(payload) || !payload.length) throw new Error('Empty market response')
  const observations: MarketObservations = new Map()
  for (const row of payload) {
    if (!row || typeof row !== 'object'
      || row.base !== 'USD'
      || !marketQuoteCodes.includes(row.quote)
      || typeof row.rate !== 'number' || !Number.isFinite(row.rate) || row.rate <= 0
      || typeof row.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(row.date)
      || !Number.isFinite(Date.parse(row.date))
      || new Date(row.date).toISOString().slice(0, 10) !== row.date) {
      throw new Error('Invalid market response')
    }
    const day = observations.get(row.date) ?? {}
    if (Object.hasOwn(day, row.quote) && day[row.quote] !== row.rate) throw new Error('Invalid market response')
    day[row.quote] = row.rate
    observations.set(row.date, day)
  }
  return observations
}

// Cache is scoped to a server instance; concurrent requests share one refresh.
export function createMarketRateService(fetchMarket: (url: string) => Promise<unknown>, now = Date.now) {
  let cached: MarketRatesResponse | undefined
  let pending: Promise<MarketRatesResponse> | undefined

  async function refresh(): Promise<MarketRatesResponse> {
    try {
      const rates = buildMarketRates(parseMarketObservations(await fetchMarket(marketRatesUrl(new Date(now())))))
      if (!rates.length) throw new Error('No market rates available')
      cached = { rates, fetchedAt: new Date(now()).toISOString(), stale: false }
      return cached
    }
    catch (error) {
      if (cached) return { ...cached, stale: true }
      throw error
    }
  }

  return async function getMarketRates(): Promise<MarketRatesResponse> {
    if (cached && now() - Date.parse(cached.fetchedAt) < MARKET_CACHE_TTL) return cached
    if (!pending) pending = refresh().finally(() => { pending = undefined })
    return pending
  }
}
