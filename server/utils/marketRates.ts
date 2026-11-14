import {
  buildMarketRates,
  dailyQuoteCodes,
  marketQuoteCodes,
  type DailyObservationsResponse,
  type MarketObservations,
  type MarketRatesResponse,
} from '#shared/marketRates.ts'

export const MARKET_CACHE_TTL = 60 * 60 * 1000
// Wide enough to span weekends and holidays and still find two observations.
const LOOKBACK_DAYS = 14

export function marketRatesUrl(now: Date, quotes: readonly string[] = marketQuoteCodes) {
  const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const from = new Date(to)
  from.setUTCDate(from.getUTCDate() - LOOKBACK_DAYS)
  const params = new URLSearchParams({
    base: 'USD',
    quotes: quotes.join(','),
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  })
  return `https://api.frankfurter.dev/v2/rates?${params}`
}

export function parseMarketObservations(payload: unknown, quotes: readonly string[] = marketQuoteCodes): MarketObservations {
  if (!Array.isArray(payload) || !payload.length) throw new Error('Empty market response')
  const observations: MarketObservations = new Map()
  for (const row of payload) {
    if (!row || typeof row !== 'object'
      || row.base !== 'USD'
      || !quotes.includes(row.quote)
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

type CachedResponse = { fetchedAt: string; stale: boolean }

// Cache is scoped to a server instance; concurrent requests share one refresh.
// A failed refresh falls back to the last good response, marked stale.
function createCachedService<T extends CachedResponse>(load: (fetchedAt: string) => Promise<T>, now: () => number) {
  let cached: T | undefined
  let pending: Promise<T> | undefined

  async function refresh(): Promise<T> {
    try {
      cached = await load(new Date(now()).toISOString())
      return cached
    }
    catch (error) {
      if (cached) return { ...cached, stale: true }
      throw error
    }
  }

  return async function get(): Promise<T> {
    if (cached && now() - Date.parse(cached.fetchedAt) < MARKET_CACHE_TTL) return cached
    if (!pending) pending = refresh().finally(() => { pending = undefined })
    return pending
  }
}

export function createMarketRateService(fetchMarket: (url: string) => Promise<unknown>, now = Date.now) {
  return createCachedService<MarketRatesResponse>(async (fetchedAt) => {
    const rates = buildMarketRates(parseMarketObservations(await fetchMarket(marketRatesUrl(new Date(now())))))
    if (!rates.length) throw new Error('No market rates available')
    return { rates, fetchedAt, stale: false }
  }, now)
}

export function createDailyObservationService(fetchMarket: (url: string) => Promise<unknown>, now = Date.now) {
  return createCachedService<DailyObservationsResponse>(async (fetchedAt) => {
    const payload = await fetchMarket(marketRatesUrl(new Date(now()), dailyQuoteCodes))
    const observations = parseMarketObservations(payload, dailyQuoteCodes)
    return { observations: Object.fromEntries(observations), fetchedAt, stale: false }
  }, now)
}
