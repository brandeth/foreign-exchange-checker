import { computed, ref } from 'vue'

// Illustrative units per USD, shared by every supported conversion pair.
const sampleRates: Record<string, number> = {
  USD: 1,
  EUR: 0.85302,
  GBP: 0.73665,
  AED: 3.6725,
  ARS: 1200,
  AUD: 1.38735,
  BDT: 122.92,
}

export function useConverter(initialAmount = '1000', initialFrom = 'USD', initialTo = 'EUR') {
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
    const from = sampleRates[sendCurrency.value]
    const to = sampleRates[receiveCurrency.value]
    return from && to ? to / from : null
  })
  const receiveAmount = computed(() => {
    if (!sendAmount.value.trim() || amountError.value || exchangeRate.value === null) return null
    return Number(sendAmount.value) * exchangeRate.value
  })
  const formattedReceiveAmount = computed(() => receiveAmount.value === null
    ? '—'
    : new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(receiveAmount.value))
  const result = computed(() => exchangeRate.value === null
    ? 'Sample rate unavailable for this currency pair.'
    : `1 ${sendCurrency.value} = ${exchangeRate.value.toFixed(4)} ${receiveCurrency.value}`)

  function swapCurrencies() {
    [sendCurrency.value, receiveCurrency.value] = [receiveCurrency.value, sendCurrency.value]
  }

  return {
    sendAmount, sendCurrency, receiveCurrency, amountError, exchangeRate,
    receiveAmount, formattedReceiveAmount, result, swapCurrencies,
  }
}
