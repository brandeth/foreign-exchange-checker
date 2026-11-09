import assert from 'node:assert/strict'
import test from 'node:test'
import { buildMarketRates, formatMarketRate, marketPairs, marketQuoteCodes } from '#shared/marketRates.ts'
import { converterCurrencies } from '#shared/currencies.ts'
import { createMarketRateService, MARKET_CACHE_TTL, marketRatesUrl, parseMarketObservations } from '../server/utils/marketRates.ts'
import { useLiveMarketRates } from '../app/composables/useLiveMarketRates.ts'

const day = (date, rates) => Object.entries(rates).map(([quote, rate]) => ({ date, base: 'USD', quote, rate }))
const rows = [
  ...day('2026-11-05', { EUR: 0.86, JPY: 155.0, GBP: 0.75, CHF: 0.80, AUD: 1.50, CAD: 1.40 }),
  ...day('2026-11-06', { EUR: 0.85, JPY: 155.5, GBP: 0.75, CHF: 0.81, AUD: 1.52, CAD: 1.40 }),
]

test('every ticker currency is a supported converter currency', () => {
  for (const code of marketPairs.flat()) assert.ok(converterCurrencies.includes(code), code)
  assert.ok(!marketQuoteCodes.includes('USD'))
})

test('requests USD-based rates for the ticker legs over a two-week window', () => {
  const url = new URL(marketRatesUrl(new Date('2026-11-09T15:00:00Z')))
  assert.equal(url.searchParams.get('base'), 'USD')
  assert.deepEqual(url.searchParams.get('quotes').split(',').sort(), [...marketQuoteCodes].sort())
  assert.equal(url.searchParams.get('from'), '2026-10-26')
  assert.equal(url.searchParams.get('to'), '2026-11-09')
})

test('rejects malformed or conflicting provider rows', () => {
  assert.throws(() => parseMarketObservations([]))
  assert.throws(() => parseMarketObservations([{ date: '2026-11-06', base: 'EUR', quote: 'USD', rate: 1.1 }]))
  assert.throws(() => parseMarketObservations([{ date: '2026-11-06', base: 'USD', quote: 'PHP', rate: 58 }]))
  assert.throws(() => parseMarketObservations([{ date: '2026-02-30', base: 'USD', quote: 'EUR', rate: 0.9 }]))
  assert.throws(() => parseMarketObservations([...day('2026-11-06', { EUR: 0.85 }), ...day('2026-11-06', { EUR: 0.86 })]))
})

test('builds latest and previous rates, including cross pairs, for every ticker pair', () => {
  const rates = buildMarketRates(parseMarketObservations(rows))
  assert.deepEqual(rates.map(rate => rate.pair), marketPairs.map(([base, quote]) => `${base}/${quote}`))
  const eurUsd = rates.find(rate => rate.pair === 'EUR/USD')
  assert.equal(eurUsd.rate, 1 / 0.85)
  assert.equal(eurUsd.previousRate, 1 / 0.86)
  assert.equal(eurUsd.date, '2026-11-06')
  assert.equal(eurUsd.previousDate, '2026-11-05')
  assert.equal(rates.find(rate => rate.pair === 'EUR/GBP').rate, 0.75 / 0.85)
})

test('skips days missing a leg instead of filling them', () => {
  const observations = parseMarketObservations([
    ...day('2026-11-04', { EUR: 0.87, GBP: 0.76 }),
    ...day('2026-11-05', { EUR: 0.86 }),
    ...day('2026-11-06', { EUR: 0.85, GBP: 0.75 }),
  ])
  const rates = buildMarketRates(observations)
  const eurGbp = rates.find(rate => rate.pair === 'EUR/GBP')
  assert.equal(eurGbp.previousDate, '2026-11-04')
  assert.equal(rates.find(rate => rate.pair === 'EUR/USD').previousDate, '2026-11-05')
  assert.equal(rates.find(rate => rate.pair === 'USD/JPY'), undefined)
})

test('formats rates and signed changes for the ticker', () => {
  assert.deepEqual(
    formatMarketRate({ pair: 'USD/JPY', rate: 157.912, previousRate: 157.85, date: 'd', previousDate: 'p' }),
    { pair: 'USD/JPY', rate: '157.91', change: '+0.04%', direction: 'up' },
  )
  assert.deepEqual(
    formatMarketRate({ pair: 'GBP/USD', rate: 1.3575, previousRate: 1.3605, date: 'd', previousDate: 'p' }),
    { pair: 'GBP/USD', rate: '1.3575', change: '-0.22%', direction: 'down' },
  )
  assert.equal(formatMarketRate({ pair: 'A/B', rate: 1.2, previousRate: 1.20001, date: 'd', previousDate: 'p' }).direction, 'flat')
  assert.deepEqual(
    formatMarketRate({ pair: 'A/B', rate: 1.2, previousRate: null, date: 'd', previousDate: null }),
    { pair: 'A/B', rate: '1.2000', change: '—', direction: 'flat' },
  )
})

test('caches market rates, shares refreshes, and falls back to stale data', async () => {
  let time = Date.parse('2026-11-09T12:00:00Z')
  let calls = 0
  let fail = false
  const service = createMarketRateService(async () => {
    calls++
    if (fail) throw new Error('down')
    return rows
  }, () => time)

  const [first, second] = await Promise.all([service(), service()])
  assert.equal(calls, 1)
  assert.equal(first, second)
  assert.equal(first.stale, false)
  await service()
  assert.equal(calls, 1)

  time += MARKET_CACHE_TTL
  fail = true
  const stale = await service()
  assert.equal(calls, 2)
  assert.equal(stale.stale, true)
  assert.deepEqual(stale.rates, first.rates)

  await assert.rejects(createMarketRateService(async () => { throw new Error('down') })())
})

test('client formats fetched rates, prefers provided rates, and reports failures', async () => {
  const response = { rates: buildMarketRates(parseMarketObservations(rows)), fetchedAt: '2026-11-09T12:00:00Z', stale: false }
  const live = useLiveMarketRates(undefined, async () => response)
  assert.deepEqual(live.displayRates.value, [])
  await live.refresh()
  assert.equal(live.displayRates.value.length, marketPairs.length)
  assert.equal(live.latestDate.value, '2026-11-06')
  assert.equal(live.stale.value, false)

  const sample = [{ pair: 'EUR/USD', rate: '1.1000', change: '+0.10%', direction: 'up' }]
  let fetched = false
  const provided = useLiveMarketRates(sample, async () => { fetched = true; return response })
  await provided.refresh()
  assert.equal(fetched, false)
  assert.deepEqual(provided.displayRates.value, sample)

  const failing = useLiveMarketRates(undefined, async () => { throw new Error('down') })
  await failing.refresh()
  assert.equal(failing.error.value, 'Market rates are unavailable.')
  assert.deepEqual(failing.displayRates.value, [])
})
