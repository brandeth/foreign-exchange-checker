import assert from 'node:assert/strict'
import test from 'node:test'
import { useConverter } from '../app/composables/useConverter.ts'

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

test('supports same-currency conversions and every selectable sample currency', () => {
  const converter = useConverter('1,000')
  assert.equal(converter.sendAmount.value, '1000')
  for (const from of ['USD', 'EUR', 'GBP', 'AED', 'ARS', 'AUD', 'BDT']) {
    converter.sendCurrency.value = from
    for (const to of ['USD', 'EUR', 'GBP', 'AED', 'ARS', 'AUD', 'BDT']) {
      converter.receiveCurrency.value = to
      assert.ok(Number.isFinite(converter.receiveAmount.value), `${from}/${to}`)
      if (from === to) assert.equal(converter.receiveAmount.value, 1000)
    }
  }
  converter.receiveCurrency.value = 'UNKNOWN'
  assert.equal(converter.receiveAmount.value, null)
  assert.match(converter.result.value, /unavailable/)
})
