import assert from 'node:assert/strict'
import test from 'node:test'
import { buildComparison, comparisonCurrencyCodes, getComparisonCodes } from '#shared/comparison.ts'
import { converterCurrencies } from '#shared/currencies.ts'

const rates = Object.fromEntries(Object.entries({
  USD: 1, GBP: 0.73665, JPY: 157.91, CHF: 0.9098, CAD: 1.3815, AUD: 1.38735, INR: 94.91, CNY: 7.21, BDT: 122.92, EUR: 0.85302,
}).map(([code, rate]) => [code, { rate, date: code === 'USD' ? null : '2026-11-04' }]))

test('every comparison target is a supported converter currency', () => {
  for (const code of comparisonCurrencyCodes) assert.ok(converterCurrencies.includes(code), code)
})

test('replaces the send currency with USD so the list keeps eight distinct pairs', () => {
  assert.deepEqual(getComparisonCodes('USD'), comparisonCurrencyCodes)
  const fromGbp = getComparisonCodes('GBP')
  assert.equal(fromGbp.length, 8)
  assert.equal(fromGbp[0], 'USD')
  assert.ok(!fromGbp.includes('GBP'))
  assert.equal(new Set(fromGbp).size, 8)
})

test('converts the entered amount from the send currency', () => {
  const comparison = buildComparison(1000, 'USD', rates)
  assert.equal(comparison.amountLabel, '1,000 from USD')
  assert.equal(comparison.rows.length, 8)
  assert.deepEqual(comparison.rows[0], { code: 'GBP', name: 'British Pound', flag: 'gb', value: '736.65', rate: '0.7367' })
  assert.equal(comparison.rows.find(row => row.code === 'JPY').value, '157,910.00')
})

test('uses cross rates when the send currency is not USD', () => {
  const comparison = buildComparison(12.5, 'EUR', rates)
  assert.equal(comparison.amountLabel, '12.5 from EUR')
  const gbp = comparison.rows.find(row => row.code === 'GBP')
  assert.equal(gbp.rate, (0.73665 / 0.85302).toFixed(4))
  assert.equal(gbp.value, (12.5 * 0.73665 / 0.85302).toFixed(2))
})

test('marks targets without a rate as unavailable instead of inventing values', () => {
  const { BDT: _missing, ...partial } = rates
  const bdt = buildComparison(10, 'USD', partial).rows.find(row => row.code === 'BDT')
  assert.equal(bdt.value, '—')
  assert.equal(bdt.rate, '—')
})

test('returns no comparison without a valid amount or loaded rates', () => {
  assert.equal(buildComparison(null, 'USD', rates), null)
  assert.equal(buildComparison(Number.NaN, 'USD', rates), null)
  assert.equal(buildComparison(-1, 'USD', rates), null)
  assert.equal(buildComparison(10, 'USD', undefined), null)
  assert.equal(buildComparison(0, 'USD', rates).rows[0].value, '0.00')
})
