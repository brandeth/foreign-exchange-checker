import assert from 'node:assert/strict'
import test from 'node:test'
import { shallowRef } from 'vue'
import { useConverter as createConverter } from '../app/composables/useConverter.ts'
import { converterCurrencies } from '#shared/currencies.ts'

const fixture = {
  rates: Object.fromEntries(Object.entries({ USD: 1, EUR: 0.85302, GBP: 0.73665, AED: 3.6725, ARS: 1200, AUD: 1.38735, BDT: 122.92 })
    .map(([code, rate]) => [code, { rate, date: code === 'USD' ? null : '2026-11-04' }])),
}
const useConverter = (amount, from, to) => createConverter(amount, from, to, fixture)

test('converts amounts reactively and formats the received value', () => {
  const converter = useConverter()
  assert.equal(converter.formattedReceiveAmount.value, '853.02')
  converter.sendAmount.value = '12.50'
  assert.equal(converter.formattedReceiveAmount.value, '10.66')
  converter.receiveCurrency.value = 'GBP'
  assert.equal(converter.formattedReceiveAmount.value, '9.21')
  converter.sendCurrency.value = 'EUR'
  assert.ok(Math.abs(converter.receiveAmount.value - 12.5 * 0.73665 / 0.85302) < 1e-10)
})

test('swaps currencies, inverts the rate, and preserves the entered amount', () => {
  const converter = useConverter('125.50')
  const originalRate = converter.exchangeRate.value
  converter.swapCurrencies()
  assert.equal(converter.sendCurrency.value, 'EUR')
  assert.equal(converter.receiveCurrency.value, 'USD')
  assert.equal(converter.sendAmount.value, '125.50')
  assert.ok(Math.abs(converter.exchangeRate.value * originalRate - 1) < 1e-10)
  converter.swapCurrencies()
  assert.equal(converter.exchangeRate.value, originalRate)
})

test('handles empty, zero, decimal, and invalid amounts without producing a false result', () => {
  const converter = useConverter()
  for (const value of ['', '   ']) {
    converter.sendAmount.value = value
    assert.equal(converter.amountError.value, '')
    assert.equal(converter.formattedReceiveAmount.value, '—')
  }
  for (const value of ['-1', 'abc', '1.2.3', '1e3', 'Infinity', '1,000', '9007199254740992']) {
    converter.sendAmount.value = value
    assert.ok(converter.amountError.value, value)
    assert.equal(converter.receiveAmount.value, null, value)
  }
  for (const value of ['0', '0.00', '.5', '1.']) {
    converter.sendAmount.value = value
    assert.equal(converter.amountError.value, '', value)
    assert.equal(converter.receiveAmount.value, Number(value) * 0.85302)
  }
})

test('supports same-currency conversions and every selectable currency', () => {
  const rates = { rates: Object.fromEntries(converterCurrencies.map((code, index) => [code, { rate: index + 1, date: '2026-11-05' }])) }
  const converter = createConverter('1,000', 'USD', 'EUR', rates)
  assert.equal(converter.sendAmount.value, '1000')
  for (const from of converterCurrencies) {
    converter.sendCurrency.value = from
    for (const to of converterCurrencies) {
      converter.receiveCurrency.value = to
      assert.ok(Number.isFinite(converter.receiveAmount.value), `${from}/${to}`)
      if (from === to) assert.equal(converter.receiveAmount.value, 1000)
    }
  }
  converter.receiveCurrency.value = 'UNKNOWN'
  assert.equal(converter.receiveAmount.value, null)
  assert.match(converter.result.value, /unavailable/)
})

test('waits for rates, reacts to replacements, and exposes both effective dates', () => {
  const rates = shallowRef(null)
  const converter = createConverter('100', 'EUR', 'GBP', rates)
  assert.equal(converter.receiveAmount.value, null)
  rates.value = { rates: { USD: { rate: 1, date: null }, EUR: { rate: 0.8, date: '2026-11-04' }, GBP: { rate: 0.7, date: '2026-11-03' } } }
  assert.equal(converter.formattedReceiveAmount.value, '87.50')
  assert.equal(converter.rateDates.value, 'EUR: 2026-11-04 · GBP: 2026-11-03')
  converter.swapCurrencies()
  assert.equal(converter.formattedReceiveAmount.value, '114.29')
  assert.equal(converter.rateDates.value, 'GBP: 2026-11-03 · EUR: 2026-11-04')
  converter.receiveCurrency.value = 'AED'
  assert.equal(converter.receiveAmount.value, null)
  assert.equal(converter.rateDates.value, '')
  converter.receiveCurrency.value = 'GBP'
  assert.equal(converter.receiveAmount.value, 100)
  rates.value = null
  assert.equal(converter.receiveAmount.value, 100)
})
