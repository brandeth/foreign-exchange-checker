import { computed, ref, shallowRef } from 'vue'
import type { ExchangeRatesResponse } from '../../shared/exchangeRates.ts'

export function useExchangeRates(fetchRates: () => Promise<ExchangeRatesResponse>) {
  const data = shallowRef<ExchangeRatesResponse | null>(null)
  const loading = ref(true)
  const error = ref('')
  const stale = computed(() => !!data.value && (data.value.stale || !!error.value))
  let pending: Promise<void> | undefined

  function refresh(): Promise<void> {
    if (pending) return pending
    loading.value = true
    error.value = ''
    pending = Promise.resolve().then(fetchRates)
      .then((response) => { data.value = response })
      .catch(() => {
        error.value = data.value
          ? 'Could not refresh rates. Showing previously fetched rates.'
          : 'Could not load exchange rates. Please try again.'
      })
      .finally(() => {
        loading.value = false
        pending = undefined
      })
    return pending
  }

  return { data, loading, error, stale, refresh }
}
