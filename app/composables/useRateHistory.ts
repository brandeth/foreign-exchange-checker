import { computed, ref, shallowRef } from 'vue'
import type { HistoryQuery, RateHistoryResponse } from '#shared/rateHistory.ts'

export function useRateHistory(fetchHistory: (query: HistoryQuery) => Promise<RateHistoryResponse>) {
  const data = shallowRef<RateHistoryResponse | null>(null)
  const loading = ref(true)
  const error = ref('')
  let requestId = 0

  async function load(query: HistoryQuery) {
    const id = ++requestId
    data.value = null
    loading.value = true
    error.value = ''
    try {
      const response = await fetchHistory({ ...query })
      if (id === requestId) data.value = response
    }
    catch {
      if (id === requestId) error.value = 'Could not load rate history. Please try again.'
    }
    finally {
      if (id === requestId) loading.value = false
    }
  }

  const points = computed(() => (data.value?.points ?? []).map(point => ({
    ...point, label: point.date,
  })))
  const metrics = computed(() => {
    const first = points.value[0]?.value
    const last = points.value.at(-1)?.value
    if (first === undefined || last === undefined) return { first: '—', last: '—', change: '—', percent: '—', direction: 0 }
    const delta = last - first
    const signed = (value: number, digits: number) => `${value > 0 ? '+' : ''}${value.toFixed(digits)}`
    return {
      first: first.toFixed(4), last: last.toFixed(4), change: signed(delta, 4),
      percent: `${signed(delta / first * 100, 2)}%`, direction: Math.sign(delta),
    }
  })
  return { data, loading, error, points, metrics, load }
}
