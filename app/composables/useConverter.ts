import { computed, ref, toValue, type MaybeRefOrGetter } from 'vue'
import { converterCurrencies, type ExchangeRatesResponse } from '#shared/exchangeRates.ts'

export function useConverter(
  initialAmount = '1000', initialFrom = 'USD', initialTo = 'EUR',
  rates?: MaybeRefOrGetter<ExchangeRatesResponse | null | undefined>,
) {
  const sendAmount = ref(initialAmount.replaceAll(',', ''))
  const sendCurrency = ref(initialFrom)
  const receiveCurrency = ref(initialTo)
  const amountError = computed(() => {
    const value = sendAmount.value.trim()
    if (!value) return ''
    if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(value)) {
      return 'Enter a valid amount of zero or more.'
    }
    if (!Number.isFinite(Number(value)) || Number(value) > Number.MAX_SAFE_INTEGER) {
      return 'Enter a smaller amount.'
    }
    return ''
  })
  const exchangeRate = computed(() => {
    if (!converterCurrencies.some(code => code === sendCurrency.value)
      || !converterCurrencies.some(code => code === receiveCurrency.value)) return null
    if (sendCurrency.value === receiveCurrency.value) return 1
    const table = toValue(rates)?.rates
    const from = table?.[sendCurrency.value]?.rate
    const to = table?.[receiveCurrency.value]?.rate
    return from && to ? to / from : null
  })
  const rateDates = computed(() => {
    if (sendCurrency.value === receiveCurrency.value) return 'Same currency · No exchange rate needed'
    if (exchangeRate.value === null) return ''
    return [...new Set([sendCurrency.value, receiveCurrency.value])]
      .filter(code => code !== 'USD')
      .map(code => `${code}: ${toValue(rates)?.rates[code]?.date ?? 'Date unavailable'}`)
      .join(' · ')
  })
  const receiveAmount = computed(() => {
    if (!sendAmount.value.trim() || amountError.value || exchangeRate.value === null) return null
    return Number(sendAmount.value) * exchangeRate.value
  })
  const formattedReceiveAmount = computed(() => receiveAmount.value === null
    ? '—'
    : new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(receiveAmount.value))
  const result = computed(() => exchangeRate.value === null
    ? 'Rate unavailable for this currency pair.'
    : `1 ${sendCurrency.value} = ${exchangeRate.value.toFixed(4)} ${receiveCurrency.value}`)

  function swapCurrencies() {
    [sendCurrency.value, receiveCurrency.value] = [receiveCurrency.value, sendCurrency.value]
  }

  return {
    sendAmount, sendCurrency, receiveCurrency, amountError, exchangeRate,
    receiveAmount, formattedReceiveAmount, result, rateDates, swapCurrencies,
  }
}
