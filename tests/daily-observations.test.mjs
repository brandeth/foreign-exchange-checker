import assert from 'node:assert/strict'
import test from 'node:test'
import { buildMarketRates, buildPairRate, dailyQuoteCodes, formatMarketRate, marketPairs } from '#shared/marketRates.ts'
import { converterCurrencies } from '#shared/currencies.ts'
import { createDailyObservationService, MARKET_CACHE_TTL, marketRatesUrl, parseMarketObservations } from '../server/utils/marketRates.ts'
import { useDailyObservations } from '../app/composables/useDailyObservations.ts'

const day = (date, rates) => Object.entries(rates).map(([quote, rate]) => ({ date, base: 'USD', quote, rate }))
const rows = [
  ...day('2026-11-05', { EUR: 0.86, GBP: 0.75, JPY: 155.0, PHP: 58.0 }),
  ...day('2026-11-06', { EUR: 0.85, GBP: 0.76, JPY: 156.0, PHP: 58.5 }),
]
const observations = parseMarketObservations(rows, dailyQuoteCodes)

test('daily observations cover every converter currency except the USD base', () => {
  assert.deepEqual([...dailyQuoteCodes].sort(), converterCurrencies.filter(code => code !== 'USD').sort())
})

test('requests every converter currency over the same two-week window as the ticker', () => {
  const url = new URL(marketRatesUrl(new Date('2026-11-09T15:00:00Z'), dailyQuoteCodes))
  assert.equal(url.searchParams.get('base'), 'USD')
  assert.deepEqual(url.searchParams.get('quotes').split(',').sort(), [...dailyQuoteCodes].sort())
  assert.equal(url.searchParams.get('from'), '2026-10-26')
  assert.equal(url.searchParams.get('to'), '2026-11-09')
})

test('parser accepts only the requested quotes', () => {
  assert.equal(observations.get('2026-11-06').PHP, 58.5)
  assert.throws(() => parseMarketObservations(day('2026-11-06', { XYZ: 1 }), dailyQuoteCodes))
  assert.throws(() => parseMarketObservations(day('2026-11-06', { PHP: 58 }), ['EUR']))
})

test('buildPairRate derives direct, inverse, and cross pairs from the latest two observations', () => {
  const usdEur = buildPairRate(observations, 'USD', 'EUR')
  assert.deepEqual(usdEur, { pair: 'USD/EUR', rate: 0.85, date: '2026-11-06', previousRate: 0.86, previousDate: '2026-11-05' })
  assert.equal(buildPairRate(observations, 'EUR', 'USD').rate, 1 / 0.85)
  const gbpJpy = buildPairRate(observations, 'GBP', 'JPY')
  assert.equal(gbpJpy.rate, 156.0 / 0.76)
  assert.equal(gbpJpy.previousRate, 155.0 / 0.75)
  assert.equal(formatMarketRate(gbpJpy).direction, 'down')
  assert.equal(formatMarketRate(buildPairRate(observations, 'USD', 'JPY')).direction, 'up')
})

test('buildPairRate skips days missing a leg and reports a missing previous observation', () => {
  const sparse = parseMarketObservations([
    ...day('2026-11-04', { EUR: 0.87, PHP: 57.5 }),
    ...day('2026-11-05', { EUR: 0.86 }),
    ...day('2026-11-06', { EUR: 0.85, PHP: 58.5 }),
  ], dailyQuoteCodes)
  assert.equal(buildPairRate(sparse, 'EUR', 'PHP').previousDate, '2026-11-04')

  const single = parseMarketObservations([...day('2026-11-05', { EUR: 0.86 }), ...day('2026-11-06', { GBP: 0.75, EUR: 0.85 })], dailyQuoteCodes)
  const gbpUsd = buildPairRate(single, 'GBP', 'USD')
  assert.equal(gbpUsd.previousRate, null)
  assert.equal(formatMarketRate(gbpUsd).change, '—')

  assert.equal(buildPairRate(observations, 'USD', 'CAD'), null)
})

test('same-currency pairs are flat at 1', () => {
  const pair = buildPairRate(observations, 'EUR', 'EUR')
  assert.equal(pair.rate, 1)
  assert.deepEqual(formatMarketRate(pair), { pair: 'EUR/EUR', rate: '1.0000', change: '0.00%', direction: 'flat' })
})

test('buildMarketRates matches buildPairRate for every ticker pair', () => {
  const ticker = buildMarketRates(observations)
  for (const [base, quote] of marketPairs) {
    const expected = buildPairRate(observations, base, quote)
    assert.deepEqual(ticker.find(rate => rate.pair === `${base}/${quote}`) ?? null, expected)
  }
})

test('caches observations, shares refreshes, and falls back to stale data', async () => {
  let time = Date.parse('2026-11-09T12:00:00Z')
  let calls = 0
  let fail = false
  const service = createDailyObservationService(async (url) => {
    calls++
    assert.ok(new URL(url).searchParams.get('quotes').includes('PHP'))
    if (fail) throw new Error('down')
    return rows
  }, () => time)

  const [first, second] = await Promise.all([service(), service()])
  assert.equal(calls, 1)
  assert.equal(first, second)
  assert.equal(first.stale, false)
  assert.deepEqual(first.observations['2026-11-06'], { EUR: 0.85, GBP: 0.76, JPY: 156.0, PHP: 58.5 })
  assert.deepEqual(JSON.parse(JSON.stringify(first)), first)
  await service()
  assert.equal(calls, 1)

  time += MARKET_CACHE_TTL
  fail = true
  const stale = await service()
  assert.equal(calls, 2)
  assert.equal(stale.stale, true)
  assert.deepEqual(stale.observations, first.observations)

  await assert.rejects(createDailyObservationService(async () => { throw new Error('down') })())
})

test('client exposes observations as a map and reports failures', async () => {
  const response = { observations: Object.fromEntries(observations), fetchedAt: '2026-11-09T12:00:00Z', stale: false }
  const daily = useDailyObservations(async () => response)
  assert.equal(daily.observations.value, null)
  await daily.refresh()
  assert.equal(buildPairRate(daily.observations.value, 'USD', 'PHP').rate, 58.5)
  assert.equal(daily.stale.value, false)

  let fail = false
  const flaky = useDailyObservations(async () => {
    if (fail) throw new Error('down')
    return response
  })
  await flaky.refresh()
  fail = true
  await flaky.refresh()
  assert.equal(flaky.stale.value, true)
  assert.ok(flaky.observations.value)

  const failing = useDailyObservations(async () => { throw new Error('down') })
  await failing.refresh()
  assert.equal(failing.error.value, 'Daily changes are unavailable.')
  assert.equal(failing.observations.value, null)
  assert.equal(failing.stale.value, false)
})
