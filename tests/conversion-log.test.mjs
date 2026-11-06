import assert from 'node:assert/strict'
import test from 'node:test'
import { ref, shallowRef } from 'vue'
import { useConverter } from '../app/composables/useConverter.ts'
import { useConversionLog } from '../app/composables/useConversionLog.ts'

const rates = {
  rates: { USD: { rate: 1, date: null }, PHP: { rate: 63.49, date: '2026-11-05' } },
  stale: false,
}

test('captures the displayed conversion and retains it after amount, pair, and rate changes', () => {
  const currentRates = shallowRef(rates)
  const converter = useConverter('1000.123', 'USD', 'PHP', currentRates)
  const log = useConversionLog()
  log.add(converter.conversionSnapshot.value)
  const saved = log.entries.value[0]
  assert.equal(saved.fromAmount, '1,000.123')
  assert.equal(saved.toAmount, converter.formattedReceiveAmount.value)
  assert.equal(saved.exchangeRate, 63.49)
  assert.equal(saved.rateDates, 'PHP: 2026-11-05')
  converter.sendAmount.value = '5'
  converter.swapCurrencies()
  currentRates.value = { ...rates, rates: { ...rates.rates, PHP: { rate: 64, date: '2026-11-06' } } }
  assert.equal(saved.fromCurrency, 'USD')
  assert.equal(saved.toCurrency, 'PHP')
  assert.equal(saved.fromAmount, '1,000.123')
  assert.equal(saved.exchangeRate, 63.49)
  assert.notEqual(saved.toAmount, converter.formattedReceiveAmount.value)
})

test('empty, invalid, or unavailable conversions cannot produce a log snapshot', () => {
  const converter = useConverter('100', 'USD', 'PHP')
  assert.equal(converter.conversionSnapshot.value, null)
  const valid = useConverter('100', 'USD', 'PHP', rates)
  for (const amount of ['', ' ', '-1', 'abc', '1.2.3']) {
    valid.sendAmount.value = amount
    assert.equal(valid.conversionSnapshot.value, null, amount)
  }
  valid.sendAmount.value = '0'
  assert.equal(valid.conversionSnapshot.value.toAmount, '0.00')
})

test('logs newest first with distinct IDs and exact timestamps, including repeated conversions', () => {
  let counter = 0
  const now = () => new Date(`2026-11-05T03:00:0${counter}Z`)
  const log = useConversionLog(ref([]), now, () => `log-${++counter}`)
  const snapshot = useConverter('100', 'USD', 'PHP', rates).conversionSnapshot.value
  log.add(snapshot)
  log.add(snapshot)
  snapshot.fromAmount = 'changed later'
  assert.deepEqual(log.entries.value.map(entry => entry.id), ['log-2', 'log-1'])
  assert.equal(log.entries.value[0].createdAt, '2026-11-05T03:00:02.000Z')
  assert.equal(log.entries.value[0].fromAmount, '100.00')
  log.remove('log-1')
  assert.deepEqual(log.entries.value.map(entry => entry.id), ['log-2'])
  log.clear()
  assert.deepEqual(log.entries.value, [])
})

test('cached rate status is captured with the conversion', () => {
  const converter = useConverter('100', 'USD', 'PHP', { ...rates, stale: true })
  assert.equal(converter.conversionSnapshot.value.stale, true)
})
