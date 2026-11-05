import assert from 'node:assert/strict'
import test from 'node:test'
import { createExchangeRateService, parseRates, RATE_CACHE_TTL } from '../server/utils/exchangeRates.ts'
import { useExchangeRates } from '../app/composables/useExchangeRates.ts'

const rows = [
  { base: 'USD', quote: 'EUR', rate: 0.85, date: '2026-11-04' },
  { base: 'USD', quote: 'GBP', rate: 0.74, date: '2026-11-03' },
]

test('validates provider rows and preserves partial coverage and individual dates', () => {
  const rates = parseRates(rows)
  assert.deepEqual(rates.USD, { rate: 1, date: null })
  assert.deepEqual(rates.GBP, { rate: 0.74, date: '2026-11-03' })
  assert.equal(rates.AED, undefined)
  for (const payload of [null, {}, [], [null], [...rows, rows[0]]]) {
    assert.throws(() => parseRates(payload))
  }
  for (const change of [{ rate: 0 }, { rate: -1 }, { rate: NaN }, { rate: Infinity }, { rate: '0.85' }, { base: 'EUR' }, { quote: 'XXX' }, { date: '2026-02-30' }, { date: 'yesterday' }]) {
    assert.throws(() => parseRates([{ ...rows[0], ...change }]), JSON.stringify(change))
  }
})

test('caches for an hour, falls back after failure, and retries without resetting freshness', async () => {
  let time = Date.parse('2026-11-05T00:00:00Z')
  let calls = 0
  let fail = false
  const getRates = createExchangeRateService(async () => {
    calls++
    if (fail) throw new Error('offline')
    return rows
  }, () => time)
  const first = await getRates()
  assert.equal(first.cached, false)
  time += RATE_CACHE_TTL - 1
  assert.equal((await getRates()).cached, true)
  assert.equal(calls, 1)
  time++
  fail = true
  const fallback = await getRates()
  assert.equal(fallback.stale, true)
  assert.equal(fallback.cached, true)
  assert.equal(fallback.fetchedAt, first.fetchedAt)
  fail = false
  const recovered = await getRates()
  assert.equal(recovered.stale, false)
  assert.notEqual(recovered.fetchedAt, first.fetchedAt)
  assert.equal(calls, 3)
})

test('initial errors and malformed refreshes never become valid cache entries', async () => {
  let payload = []
  let time = 0
  const getRates = createExchangeRateService(async () => payload, () => time)
  await assert.rejects(getRates())
  payload = rows
  const good = await getRates()
  time += RATE_CACHE_TTL
  payload = [{ ...rows[0], rate: 'bad' }]
  const fallback = await getRates()
  assert.equal(fallback.stale, true)
  assert.deepEqual(fallback.rates, good.rates)
})

test('concurrent requests share the upstream refresh', async () => {
  let calls = 0
  const getRates = createExchangeRateService(async () => { calls++; return rows })
  await Promise.all([getRates(), getRates(), getRates()])
  assert.equal(calls, 1)
})

test('client loading, initial failure, retry, and retained data after refresh failure', async () => {
  let fail = true
  let calls = 0
  const snapshot = { base: 'USD', rates: parseRates(rows), fetchedAt: '2026-11-05T00:00:00Z', cached: false, stale: false }
  const client = useExchangeRates(() => {
    calls++
    if (fail) throw new Error('offline')
    return Promise.resolve(snapshot)
  })
  assert.equal(client.loading.value, true)
  await Promise.all([client.refresh(), client.refresh()])
  assert.equal(calls, 1)
  assert.equal(client.data.value, null)
  assert.equal(client.loading.value, false)
  assert.match(client.error.value, /Could not load/)
  fail = false
  await client.refresh()
  assert.equal(client.data.value, snapshot)
  assert.equal(client.error.value, '')
  fail = true
  await client.refresh()
  assert.equal(client.data.value, snapshot)
  assert.equal(client.stale.value, true)
  fail = false
  await client.refresh()
  assert.equal(client.stale.value, false)
})

test('client marks a successful server fallback response as stale', async () => {
  const client = useExchangeRates(async () => ({ rates: parseRates(rows), stale: true, cached: true }))
  await client.refresh()
  assert.equal(client.stale.value, true)
  assert.equal(client.error.value, '')
})
