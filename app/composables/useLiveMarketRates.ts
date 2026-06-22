import { computed, toValue, type MaybeRefOrGetter } from 'vue'

export type LiveMarketRate = {
  pair: string
  rate: string
  change: string
  direction: 'up' | 'down'
}

const defaultRates: LiveMarketRate[] = [
  { pair: 'EUR/USD', rate: '1.1591', change: '-0.14%', direction: 'down' },
  { pair: 'USD/JPY', rate: '157.91', change: '+0.04%', direction: 'up' },
  { pair: 'GBP/USD', rate: '1.3575', change: '-0.22%', direction: 'down' },
  { pair: 'USD/CHF', rate: '0.9098', change: '+0.13%', direction: 'up' },
  { pair: 'EUR/GBP', rate: '0.8633', change: '+0.11%', direction: 'up' },
  { pair: 'AUD/USD', rate: '0.7208', change: '+0.08%', direction: 'up' },
  { pair: 'USD/CAD', rate: '1.3815', change: '+0.04%', direction: 'up' },
]

export function useLiveMarketRates(rates?: MaybeRefOrGetter<LiveMarketRate[] | undefined>) {
  const displayRates = computed(() => toValue(rates) ?? defaultRates)

  return {
    displayRates,
  }
}
