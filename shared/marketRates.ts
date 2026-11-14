import { converterCurrencies } from './currencies.ts'

// Pairs shown in the Live Markets ticker, quoted as BASE/QUOTE.
export const marketPairs = [
  ['EUR', 'USD'],
  ['USD', 'JPY'],
  ['GBP', 'USD'],
  ['USD', 'CHF'],
  ['EUR', 'GBP'],
  ['AUD', 'USD'],
  ['USD', 'CAD'],
] as const

// Frankfurter is queried with USD as the base, so only the other legs are requested.
export const marketQuoteCodes = [...new Set(marketPairs.flat())].filter(code => code !== 'USD')

// Daily observations cover every converter currency so any pinned pair can be derived.
export const dailyQuoteCodes = converterCurrencies.filter(code => code !== 'USD')

export type MarketRate = {
  pair: string
  rate: number
  date: string
  previousRate: number | null
  previousDate: string | null
}

export type MarketRatesResponse = {
  rates: MarketRate[]
  fetchedAt: string
  stale: boolean
}

export type LiveMarketRate = {
  pair: string
  rate: string
  change: string
  direction: 'up' | 'down' | 'flat'
}

/** USD-based observations keyed by date, e.g. { '2026-11-06': { EUR: 0.86, GBP: 0.76 } }. */
export type MarketObservations = Map<string, Record<string, number>>

export type DailyObservationsResponse = {
  /** Plain-object form of MarketObservations, so it survives JSON. */
  observations: Record<string, Record<string, number>>
  fetchedAt: string
  stale: boolean
}

function pairRate(day: Record<string, number>, base: string, quote: string): number | null {
  const baseRate = base === 'USD' ? 1 : day[base]
  const quoteRate = quote === 'USD' ? 1 : day[quote]
  return baseRate && quoteRate ? quoteRate / baseRate : null
}

function datesNewestFirst(observations: MarketObservations) {
  return [...observations.keys()].sort((a, b) => b.localeCompare(a))
}

function pairRateFromDates(observations: MarketObservations, dates: string[], base: string, quote: string): MarketRate | null {
  const points = dates.flatMap((date) => {
    const rate = pairRate(observations.get(date)!, base, quote)
    return rate === null ? [] : [{ date, rate }]
  }).slice(0, 2)
  if (!points.length) return null
  const [latest, previous] = points
  return {
    pair: `${base}/${quote}`,
    rate: latest!.rate,
    date: latest!.date,
    previousRate: previous?.rate ?? null,
    previousDate: previous?.date ?? null,
  }
}

/** Uses the two most recent dates on which both legs of a pair were observed. Missing days are skipped, never filled. */
export function buildPairRate(observations: MarketObservations, base: string, quote: string): MarketRate | null {
  return pairRateFromDates(observations, datesNewestFirst(observations), base, quote)
}

/** Builds every ticker pair with the same rules as buildPairRate. */
export function buildMarketRates(observations: MarketObservations): MarketRate[] {
  const dates = datesNewestFirst(observations)
  return marketPairs.flatMap(([base, quote]) => pairRateFromDates(observations, dates, base, quote) ?? [])
}

export function formatMarketRate({ pair, rate, previousRate }: MarketRate): LiveMarketRate {
  const formattedRate = rate.toFixed(rate >= 100 ? 2 : 4)
  if (previousRate === null) return { pair, rate: formattedRate, change: '—', direction: 'flat' }
  const percent = Number(((rate - previousRate) / previousRate * 100).toFixed(2))
  if (percent === 0) return { pair, rate: formattedRate, change: '0.00%', direction: 'flat' }
  return {
    pair,
    rate: formattedRate,
    change: `${percent > 0 ? '+' : ''}${percent.toFixed(2)}%`,
    direction: percent > 0 ? 'up' : 'down',
  }
}
