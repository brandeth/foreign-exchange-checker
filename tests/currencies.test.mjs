import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import test from 'node:test'
import { currencies, converterCurrencies, filterCurrencies, getCurrencyForRegion, getRegionalCurrency } from '#shared/currencies.ts'
import { parseRates, FRANKFURTER_URL } from '../server/utils/exchangeRates.ts'
import { validateHistoryQuery, parseHistory } from '../server/utils/rateHistory.ts'
import { useConverter } from '../app/composables/useConverter.ts'

test('starts at one US dollar and resolves supported regional currencies', () => {
  const converter = useConverter()
  assert.equal(converter.sendAmount.value, '1')
  assert.equal(converter.sendCurrency.value, 'USD')
  assert.equal(converter.receiveCurrency.value, 'EUR')
  assert.equal(getRegionalCurrency(['en-SG', 'en-US']), 'SGD')
  assert.equal(getRegionalCurrency(['fil-PH']), 'PHP')
  assert.equal(getRegionalCurrency(['fr-FR']), 'EUR')
  assert.equal(getRegionalCurrency(['en-US']), 'USD')
  assert.equal(getRegionalCurrency(['invalid_locale', 'en', 'en-DM']), 'XCD')
  assert.equal(getRegionalCurrency(['en', 'en-ZW']), undefined)
})

test('uses the device time zone ahead of the browser language region', () => {
  assert.equal(getRegionalCurrency(['en-US'], 'Asia/Singapore'), 'SGD')
  assert.equal(getRegionalCurrency(['en-US'], 'Asia/Manila'), 'PHP')
  assert.equal(getRegionalCurrency(['en-US'], 'Asia/Calcutta'), 'INR')
  assert.equal(getRegionalCurrency(['en-SG'], 'America/Los_Angeles'), 'USD')
  assert.equal(getRegionalCurrency(['en-SG'], 'UTC'), 'SGD')
  assert.equal(getRegionalCurrency(['en-US'], 'Africa/Nairobi'), 'KES')
  assert.equal(getRegionalCurrency(['en-US'], 'Africa/Lagos'), 'NGN')
  assert.equal(getRegionalCurrency(['en-US'], 'Africa/Accra'), undefined)
})

test('search finds the Philippine peso by country, currency name, and code', () => {
  for (const query of ['Philippines', 'Philippine Peso', 'PHP', '  pHp  ', 'Pilipinas', 'Philippines PHP']) {
    assert.deepEqual(filterCurrencies(query).map(currency => currency.code), ['PHP'], query)
  }
})

test('maps a location country code to its supported currency', () => {
  assert.equal(getCurrencyForRegion('PH'), 'PHP')
  assert.equal(getCurrencyForRegion('SG'), 'SGD')
  assert.equal(getCurrencyForRegion('FR'), 'EUR')
  assert.equal(getCurrencyForRegion('ZZ'), undefined)
})

test('search handles country aliases, accents, multiple matches, and empty results', () => {
  assert.deepEqual(filterCurrencies('Türkiye').map(currency => currency.code), ['TRY'])
  assert.deepEqual(filterCurrencies('Germany').map(currency => currency.code), ['EUR'])
  assert.deepEqual(filterCurrencies('United Kingdom').map(currency => currency.code), ['GBP'])
  assert.ok(filterCurrencies('Dollar').length > 1)
  assert.deepEqual(filterCurrencies('not-a-real-country'), [])
  assert.deepEqual(filterCurrencies('   '), currencies)
})

test('every dropdown currency has a flag and is included in latest and history requests', () => {
  assert.equal(new Set(converterCurrencies).size, currencies.length)
  const requested = new URL(FRANKFURTER_URL).searchParams.get('quotes').split(',')
  for (const currency of currencies) {
    assert.ok(existsSync(new URL(`../app/assets/images/flags/${currency.flag}.webp`, import.meta.url)), currency.code)
    assert.ok(currency.code === 'USD' || requested.includes(currency.code), currency.code)
    assert.equal(validateHistoryQuery({ base: 'USD', quote: currency.code, range: '1m' }).quote, currency.code)
  }
})

test('PHP rates flow through the converter, swapping, and history validation', () => {
  const row = { base: 'USD', quote: 'PHP', rate: 63.49, date: '2026-11-05' }
  const rates = { rates: parseRates([row]) }
  const converter = useConverter('100', 'USD', 'PHP', rates)
  assert.equal(converter.formattedReceiveAmount.value, '6,349.00')
  converter.swapCurrencies()
  assert.equal(converter.formattedReceiveAmount.value, '1.58')
  assert.equal(converter.sendAmount.value, '100')
  assert.deepEqual(parseHistory([row], { base: 'USD', quote: 'PHP', range: '1m' }, new Date('2026-11-05T00:00:00Z')), [{ date: '2026-11-05', value: 63.49 }])
})
