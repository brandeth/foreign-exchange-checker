import { computed, ref, shallowRef } from 'vue'
import type { DailyObservationsResponse, MarketObservations } from '#shared/marketRates.ts'

export function useDailyObservations(
  fetchObservations: () => Promise<DailyObservationsResponse> = () => $fetch<DailyObservationsResponse>('/api/daily-observations'),
) {
  const data = shallowRef<DailyObservationsResponse | null>(null)
  const loading = ref(false)
  const error = ref('')
  let pending: Promise<void> | undefined

  const observations = computed<MarketObservations | null>(() => data.value
    ? new Map(Object.entries(data.value.observations))
    : null)
  const stale = computed(() => !!data.value && (data.value.stale || !!error.value))

  function refresh(): Promise<void> {
    if (pending) return pending
    loading.value = true
    error.value = ''
    pending = Promise.resolve().then(fetchObservations)
      .then((response) => { data.value = response })
      .catch(() => {
        error.value = data.value
          ? 'Could not refresh daily changes. Showing previously fetched observations.'
          : 'Daily changes are unavailable.'
      })
      .finally(() => {
        loading.value = false
        pending = undefined
      })
    return pending
  }

  return { observations, loading, error, stale, refresh }
}
