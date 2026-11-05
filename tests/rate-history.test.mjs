import assert from 'node:assert/strict'
import test from 'node:test'
import { historyWindow } from '#shared/rateHistory.ts'
import { validateHistoryQuery, historyUrl, parseHistory, createHistoryService } from '../server/utils/rateHistory.ts'
import { useRateHistory } from '../app/composables/useRateHistory.ts'

const now = new Date('2026-11-05T08:00:00Z')
const query = { base: 'USD', quote: 'EUR', range: '1m' }
const rows = [
  { base: 'USD', quote: 'EUR', date: '2026-11-04', rate: 0.9 },
  { base: 'USD', quote: 'EUR', date: '2026-10-06', rate: 0.8 },
]
const response = points => ({ ...query, points, fetchedAt: now.toISOString(), stale: false })

test('validates currencies and time ranges, rejecting arrays and arbitrary queries', () => {
  assert.deepEqual(validateHistoryQuery(query), query)
  for (const invalid of [{ base: '../x' }, { base: ['USD'] }, { quote: 'XXX' }, { range: '50y' }, { range: undefined }]) {
    assert.throws(() => validateHistoryQuery({ ...query, ...invalid }))
  }
})

test('builds calendar windows with month-end and leap-year clamping', () => {
  const windows = { '1d': '2026-11-05', '1w': '2026-10-29', '1m': '2026-10-05', '3m': '2026-08-05', '1y': '2025-11-05', '5y': '2021-11-05' }
  for (const [range, from] of Object.entries(windows)) assert.deepEqual(historyWindow(range, now), { from, to: '2026-11-05' })
  assert.equal(historyWindow('1m', new Date('2024-03-31Z')).from, '2024-02-29')
  assert.equal(historyWindow('1y', new Date('2024-02-29Z')).from, '2023-02-28')
  assert.equal(new URL(historyUrl({ ...query, range: '1d' }, now)).searchParams.has('from'), false)
  assert.equal(new URL(historyUrl(query, now)).searchParams.get('from'), '2026-10-05')
})

test('sorts and deduplicates observations without inventing missing dates', () => {
  assert.deepEqual(parseHistory([...rows, rows[0]], query, now), [
    { date: '2026-10-06', value: 0.8 }, { date: '2026-11-04', value: 0.9 },
  ])
  assert.deepEqual(parseHistory(rows, { ...query, range: '1d' }, now), [{ date: '2026-11-04', value: 0.9 }])
  assert.deepEqual(parseHistory([], query, now), [])
  for (const change of [{ rate: 0 }, { rate: NaN }, { date: '2026-02-30' }, { date: '2026-11-06' }, { base: 'EUR' }, { quote: 'GBP' }]) {
    assert.throws(() => parseHistory([{ ...rows[0], ...change }], query, now))
  }
  assert.throws(() => parseHistory([...rows, { ...rows[0], rate: 2 }], query, now))
})

test('isolates cached histories by pair and range, deduplicates requests, and falls back on refresh failure', async () => {
  let time = now.getTime()
  let fail = false
  let calls = 0
  const service = createHistoryService(async url => {
    calls++
    if (fail) throw Error('offline')
    const params = new URL(url).searchParams
    return rows.map(row => ({ ...row, base: params.get('base'), quote: params.get('quotes') }))
  }, () => time)
  const [first] = await Promise.all([service(query), service(query)])
  await service(query)
  assert.equal(calls, 1)
  await service({ ...query, range: '1w' })
  await service({ ...query, base: 'GBP' })
  assert.equal(calls, 3)
  time += 3600000
  fail = true
  const stale = await service(query)
  assert.equal(stale.stale, true)
  assert.equal(stale.fetchedAt, first.fetchedAt)
  await assert.rejects(service({ ...query, quote: 'BDT' }))
  fail = false
  assert.equal((await service(query)).stale, false)
})

test('same-currency history is flat and needs no upstream request', async () => {
  const service = createHistoryService(async () => { throw Error('should not fetch') }, () => now.getTime())
  const result = await service({ ...query, quote: 'USD' })
  assert.deepEqual(result.points, [{ date: '2026-10-05', value: 1 }, { date: '2026-11-05', value: 1 }])
})

test('client hides previous pair immediately and ignores out-of-order responses', async () => {
  const requests = []
  const client = useRateHistory(input => new Promise(resolve => requests.push({ input, resolve })))
  const first = client.load(query)
  const second = client.load({ ...query, quote: 'GBP' })
  assert.equal(client.points.value.length, 0)
  requests[1].resolve({ ...response([{ date: '2026-11-04', value: 0.75 }]), quote: 'GBP' })
  await second
  requests[0].resolve(response([{ date: '2026-11-04', value: 0.9 }]))
  await first
  assert.equal(client.data.value.quote, 'GBP')
  assert.equal(client.metrics.value.last, '0.7500')
  assert.equal(client.loading.value, false)
})

test('client calculates period changes and supports failure, retry, and empty results', async () => {
  let fail = true
  let points = [{ date: '2026-10-06', value: 1 }, { date: '2026-11-04', value: 0.9 }]
  const client = useRateHistory(async () => {
    if (fail) throw Error('offline')
    return response(points)
  })
  await client.load(query)
  assert.match(client.error.value, /Could not load/)
  assert.equal(client.metrics.value.last, '—')
  fail = false
  await client.load(query)
  assert.equal(client.error.value, '')
  assert.equal(client.metrics.value.change, '-0.1000')
  assert.equal(client.metrics.value.percent, '-10.00%')
  assert.equal(client.metrics.value.direction, -1)
  points = []
  await client.load(query)
  assert.equal(client.points.value.length, 0)
  assert.equal(client.metrics.value.last, '—')
})
