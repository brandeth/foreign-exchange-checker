import { computed, ref, shallowRef, toValue, type MaybeRefOrGetter } from 'vue'
import { formatMarketRate, type LiveMarketRate, type MarketRatesResponse } from '#shared/marketRates.ts'

export type { LiveMarketRate }

export function useLiveMarketRates(
  rates?: MaybeRefOrGetter<LiveMarketRate[] | undefined>,
  fetchRates: () => Promise<MarketRatesResponse> = () => $fetch<MarketRatesResponse>('/api/market-rates'),
) {
  const data = shallowRef<MarketRatesResponse | null>(null)
  const loading = ref(false)
  const error = ref('')
  let pending: Promise<void> | undefined

  const displayRates = computed<LiveMarketRate[]>(() => toValue(rates) ?? data.value?.rates.map(formatMarketRate) ?? [])
  const latestDate = computed(() => data.value?.rates.map(rate => rate.date).sort().at(-1) ?? '')
  const stale = computed(() => !!data.value && (data.value.stale || !!error.value))

  function refresh(): Promise<void> {
    if (toValue(rates)) return Promise.resolve()
    if (pending) return pending
    loading.value = true
    error.value = ''
    pending = Promise.resolve().then(fetchRates)
      .then((response) => { data.value = response })
      .catch(() => {
        error.value = data.value
          ? 'Could not refresh market rates. Showing previously fetched rates.'
          : 'Market rates are unavailable.'
      })
      .finally(() => {
        loading.value = false
        pending = undefined
      })
    return pending
  }

  return { displayRates, latestDate, loading, error, stale, refresh }
}
