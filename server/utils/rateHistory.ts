import { converterCurrencies } from '#shared/exchangeRates.ts'
import { historyRanges, historyWindow, type HistoryQuery, type HistoryPoint, type RateHistoryResponse } from '#shared/rateHistory.ts'

export function validateHistoryQuery(query: Record<string, unknown>): HistoryQuery {
  if (!converterCurrencies.some(code => code === query.base)
    || !converterCurrencies.some(code => code === query.quote)
    || !historyRanges.some(range => range === query.range)) throw new Error('Invalid history query')
  return query as HistoryQuery
}

export function historyUrl(query: HistoryQuery, now: Date) {
  const params = new URLSearchParams({ base: query.base, quotes: query.quote })
  if (query.range !== '1d') {
    const { from, to } = historyWindow(query.range, now)
    params.set('from', from)
    params.set('to', to)
  }
  return `https://api.frankfurter.dev/v2/rates?${params}`
}

export function parseHistory(payload: unknown, query: HistoryQuery, now: Date): HistoryPoint[] {
  if (!Array.isArray(payload)) throw new Error('Invalid history response')
  const points = new Map<string, number>()
  const { from, to } = historyWindow(query.range, now)
  for (const row of payload) {
    if (!row || typeof row !== 'object' || row.base !== query.base || row.quote !== query.quote
      || typeof row.rate !== 'number' || !Number.isFinite(row.rate) || row.rate <= 0
      || typeof row.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(row.date)
      || !Number.isFinite(Date.parse(row.date)) || new Date(row.date).toISOString().slice(0, 10) !== row.date
      || row.date > to || (points.has(row.date) && points.get(row.date) !== row.rate)) {
      throw new Error('Invalid history response')
    }
    if (query.range === '1d' || row.date >= from) points.set(row.date, row.rate)
  }
  const sorted = [...points].sort(([a], [b]) => a.localeCompare(b)).map(([date, value]) => ({ date, value }))
  return query.range === '1d' ? sorted.slice(-1) : sorted
}

export function createHistoryService(fetchHistory: (url: string) => Promise<unknown>, now = Date.now) {
  const cache = new Map<string, RateHistoryResponse>()
  const pending = new Map<string, Promise<RateHistoryResponse>>()
  return async function getHistory(query: HistoryQuery): Promise<RateHistoryResponse> {
    const date = new Date(now())
    const key = `${query.base}/${query.quote}/${query.range}/${date.toISOString().slice(0, 10)}`
    const cached = cache.get(key)
    if (cached && now() - Date.parse(cached.fetchedAt) < 3600000) return cached
    if (pending.has(key)) return pending.get(key)!
    const request = Promise.resolve().then(async () => {
      try {
        const points = query.base === query.quote
          ? [...new Set(Object.values(historyWindow(query.range, date)))].map(day => ({ date: day, value: 1 }))
          : parseHistory(await fetchHistory(historyUrl(query, date)), query, date)
        const response = { ...query, points, fetchedAt: new Date(now()).toISOString(), stale: false }
        if (cache.size >= 128) cache.delete(cache.keys().next().value!)
        cache.set(key, response)
        return response
      }
      catch (error) {
        if (cached) return { ...cached, stale: true }
        throw error
      }
    }).finally(() => { pending.delete(key) })
    pending.set(key, request)
    return request
  }
}
