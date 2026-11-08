<script setup lang="ts">
import ComparisonCard from '~/components/ComparisonCard.vue'
import ConversionLogCard, { type ConversionLogItem } from '~/components/ConversionLogCard.vue'
import FavoritesCard, { type FavoritePair } from '~/components/FavoritesCard.vue'
import RateChartCard from '~/components/RateChartCard.vue'
import RateMetricCard from '~/components/RateMetricCard.vue'
import TimeRangeSelector from '~/components/TimeRangeSelector.vue'
import type { HistoryRange, RateHistoryResponse } from '#shared/rateHistory'
import { buildComparison } from '#shared/comparison'
import { conversionPairLabel, type ConversionSnapshot, type LoggedConversion } from '#shared/conversionLog'
import { converterCurrencies } from '#shared/currencies'
import { getPairRate, type ExchangeRatesResponse } from '#shared/exchangeRates'

const pageTitle = 'FX Checker | Currency Converter'
const pageDescription = 'Convert currencies using daily exchange rates from Frankfurter. Explore rate history, compare observations, and log conversions.'
const { baseURL } = useRuntimeConfig().app
const pageUrl = new URL(`${baseURL.replace(/\/$/, '')}/`, useRequestURL().origin)
const socialImageUrl = new URL('social-preview.png', pageUrl).href
const socialImageAlt = 'FX Checker currency converter with a lime exchange-rate history chart.'

useSeoMeta({
  description: pageDescription,
  ogType: 'website',
  ogSiteName: 'FX Checker',
  ogTitle: pageTitle,
  ogDescription: pageDescription,
  ogUrl: pageUrl.href,
  ogImage: socialImageUrl,
  ogImageType: 'image/png',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: socialImageAlt,
  twitterCard: 'summary_large_image',
  twitterTitle: pageTitle,
  twitterDescription: pageDescription,
  twitterImage: socialImageUrl,
  twitterImageAlt: socialImageAlt,
})

const activeMarketTab = ref('history')
const selectedTimeRange = ref('1m')
type CurrencyPair = { base: string; quote: string }
const selectedPair = ref<CurrencyPair>({ base: 'USD', quote: 'EUR' })
const favoritePairs = ref<CurrencyPair[]>([])
const favoriteStorageKey = 'foreign-exchange-checker:favorite-pairs'
const latestRates = shallowRef<ExchangeRatesResponse | null>(null)

function isCurrencyPair(value: unknown): value is CurrencyPair {
  if (typeof value !== 'object' || value === null) return false
  const { base, quote } = value as Partial<CurrencyPair>
  return typeof base === 'string' && typeof quote === 'string'
    && converterCurrencies.includes(base) && converterCurrencies.includes(quote)
}

onMounted(() => {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(favoriteStorageKey) ?? 'null')
    if (Array.isArray(saved)) favoritePairs.value = saved.filter(isCurrencyPair)
  } catch {
    // Favorites can still be used for the current visit.
  }
})

function isFavorite({ base, quote }: CurrencyPair) {
  return favoritePairs.value.some(pair => pair.base === base && pair.quote === quote)
}

function toggleFavorite(pair: CurrencyPair) {
  favoritePairs.value = isFavorite(pair)
    ? favoritePairs.value.filter(({ base, quote }) => base !== pair.base || quote !== pair.quote)
    : [pair, ...favoritePairs.value]
  try {
    localStorage.setItem(favoriteStorageKey, JSON.stringify(favoritePairs.value))
  } catch {
    // Keep the updated list in memory when storage is unavailable.
  }
}

const favoriteItems = computed<FavoritePair[]>(() => favoritePairs.value.map(({ base, quote }) => ({
  fromCurrency: base,
  toCurrency: quote,
  exchangeRate: getPairRate(base, quote, latestRates.value?.rates)?.toFixed(4) ?? '—',
})))

const logEntries = useState<LoggedConversion[]>('conversion-log', () => [])
const logPairFilter = ref('')
const { entries, restore: restoreConversionLogs, add: addConversionLog, remove: removeConversionLog, clear: clearConversionLogs } = useConversionLog(logEntries)
onMounted(() => restoreConversionLogs())
const conversionLogs = computed<ConversionLogItem[]>(() => entries.value.map(entry => ({
  ...entry,
  timestampLabel: new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(new Date(entry.createdAt)),
})))
function logConversion(snapshot: ConversionSnapshot) {
  addConversionLog(snapshot)
  if (logPairFilter.value !== conversionPairLabel(snapshot)) logPairFilter.value = ''
  activeMarketTab.value = 'log'
}

const marketTabs = computed(() => [
  { label: 'History', value: 'history' },
  { label: 'Compare', value: 'compare' },
  { label: 'Favorites', value: 'favorites', badge: favoritePairs.value.length },
  { label: 'Log', value: 'log', badge: conversionLogs.value.length },
])

const timeRanges = [
  { label: '1D', value: '1d' },
  { label: '1W', value: '1w' },
  { label: '1M', value: '1m' },
  { label: '3M', value: '3m' },
  { label: '1Y', value: '1y' },
  { label: '5Y', value: '5y' },
]

const flagAssets = import.meta.glob<string>('../assets/images/flags/*.webp', { eager: true, query: '?url', import: 'default' })
const sendState = ref<{ amount: number | null; currency: string }>({ amount: null, currency: 'USD' })
const comparison = computed(() => buildComparison(sendState.value.amount, sendState.value.currency, latestRates.value?.rates))
const comparisonRows = computed(() => (comparison.value?.rows ?? []).map(({ flag, ...row }) => ({
  ...row,
  flagSrc: flagAssets[`../assets/images/flags/${flag}.webp`] ?? '',
  favorited: isFavorite({ base: sendState.value.currency, quote: row.code }),
})))
const { data: history, loading: historyLoading, error: historyError, points: rateChartPoints, metrics, load: loadHistory } = useRateHistory(
  query => $fetch<RateHistoryResponse>('/api/rate-history', { query }),
)
const historyQuery = computed(() => ({ ...selectedPair.value, range: selectedTimeRange.value as HistoryRange }))
const chartPair = computed(() => selectedPair.value.base + '/' + selectedPair.value.quote)
function refreshHistory() {
  return loadHistory(historyQuery.value)
}
function updatePair(pair: CurrencyPair) {
  if (pair.base !== selectedPair.value.base || pair.quote !== selectedPair.value.quote) selectedPair.value = pair
}
onMounted(refreshHistory)
watch(historyQuery, refreshHistory)

</script>

<template>
  <main class="home-page min-h-screen bg-fx-neutral-900 px-6 py-9 text-fx-neutral-50">
    <div class="home-page__content mx-auto flex max-w-[1036px] flex-col gap-12">
      <CheckRate
        :favorited="isFavorite(selectedPair)"
        @pair-change="updatePair"
        @rates-change="latestRates = $event"
        @send-change="sendState = $event"
        @toggle-favorite="toggleFavorite(selectedPair)"
        @log-conversion="logConversion"
      />

      <section class="market-history" aria-label="Exchange market views">
        <Tabs
          v-model="activeMarketTab"
          :tabs="marketTabs"
          aria-label="Exchange market views"
        />

        <div v-if="activeMarketTab === 'history'" class="market-history__history">
          <div class="market-history__summary">
            <div class="market-history__metrics">
              <RateMetricCard label="First" :value="metrics.first" />
              <RateMetricCard label="Last" :value="metrics.last" />
              <RateMetricCard label="Change" :value="metrics.change" :increase="metrics.direction > 0" :decrease="metrics.direction < 0" />
              <RateMetricCard label="% Change" :value="metrics.percent" :increase="metrics.direction > 0" :decrease="metrics.direction < 0" show-indicator />
            </div>
            <TimeRangeSelector v-model="selectedTimeRange" :options="timeRanges" aria-label="Chart time range" />
          </div>

          <div role="status" aria-live="polite" class="text-preset-5 text-fx-neutral-200">
            <p v-if="historyLoading">Loading {{ chartPair }} history…</p>
            <p v-else-if="historyError" class="text-fx-red-500">{{ historyError }}</p>
            <p v-else-if="!rateChartPoints.length">No rate history available for {{ chartPair }} in this period.</p>
            <p v-else-if="selectedPair.base === selectedPair.quote">Same currency · The rate remains 1.</p>
            <p v-else>Daily observations from Frankfurter. {{ selectedTimeRange === '1d' ? '1D shows the latest daily observation; intraday data is unavailable.' : 'Changes compare the first and last available observations in this period.' }}</p>
            <p v-if="history?.stale" class="mt-2 text-fx-red-500">Could not refresh history. Showing cached observations.</p>
            <Button v-if="historyError || history?.stale" class="mt-3" :disabled="historyLoading" @click="refreshHistory">Retry history</Button>
          </div>

          <RateChartCard
            v-if="rateChartPoints.length"
            :pair="chartPair"
            :value="metrics.last"
            :timestamp="rateChartPoints.at(-1)?.date ?? ''"
            :points="rateChartPoints"
          />
        </div>

        <div v-else-if="activeMarketTab === 'compare' && comparison" class="market-history__compare">
          <p v-if="latestRates?.stale" role="status" class="m-0 text-preset-5 text-fx-red-500">
            Could not refresh rates. Showing cached rates, which may be out of date.
          </p>
          <ComparisonCard
            :amount-label="comparison.amountLabel"
            :pair-count-label="`${comparisonRows.length} pairs`"
            :items="comparisonRows"
            @toggle-favorite="toggleFavorite({ base: sendState.currency, quote: $event })"
          />
        </div>

        <div v-else-if="activeMarketTab === 'compare' && sendState.amount !== null" class="market-view__empty" role="status">
          <p class="market-view__empty-title">Rates unavailable</p>
          <p class="market-view__empty-message">
            The comparison appears once exchange rates load.
          </p>
        </div>

        <div v-else-if="activeMarketTab === 'compare'" class="market-view__empty" role="status">
          <p class="market-view__empty-title">No comparison available</p>
          <p class="market-view__empty-message">
            Enter an amount in SEND above to see what your<br>
            money is worth in other currencies.
          </p>
        </div>

        <FavoritesCard
          v-else-if="activeMarketTab === 'favorites' && favoritePairs.length"
          :items="favoriteItems"
          @remove="toggleFavorite({ base: $event.fromCurrency, quote: $event.toCurrency })"
        />

        <div v-else-if="activeMarketTab === 'favorites'" class="market-view__empty" role="status">
          <p class="market-view__empty-title">No pinned pairs yet</p>
          <p class="market-view__empty-message">
            Pin a pair to track its rate here. Tap the star<br>
            icon on any conversion or comparison row.
          </p>
        </div>

        <ConversionLogCard
          v-else-if="activeMarketTab === 'log' && conversionLogs.length"
          v-model:pair="logPairFilter"
          :items="conversionLogs"
          @remove="removeConversionLog"
          @clear="clearConversionLogs"
        />

        <div v-else-if="activeMarketTab === 'log'" class="market-view__empty" role="status">
          <p class="market-view__empty-title">No conversions logged yet</p>
          <p class="market-view__empty-message">
            Select Log Conversion to save the current conversion.
            Saved conversions stay in this browser after you refresh or close the page.
          </p>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.market-history {
  @apply grid min-w-0 gap-5;
}

.market-history__history {
  @apply grid min-w-0 gap-5;
}

.market-history__compare {
  @apply grid min-w-0 gap-3;
}

.market-history__summary {
  @apply grid min-w-0 gap-5 lg:grid-cols-[1fr_auto] lg:items-center;
}

.market-history__metrics {
  @apply grid min-w-0 grid-cols-2 gap-4 sm:flex sm:flex-wrap;
}

.market-view__empty {
  @apply flex min-h-[188px] min-w-0 flex-col items-center gap-4 pt-10 text-center;
}

.market-view__empty-title {
  @apply m-0 text-preset-2 text-fx-neutral-100;
}

.market-view__empty-message {
  @apply m-0 text-preset-4 text-fx-neutral-200;
}

@media (min-width: 640px) and (max-width: 1024px) {
  .home-page {
    @apply px-8 py-16;
  }

  .home-page__content {
    @apply max-w-none gap-16;
  }

  .market-history {
    @apply gap-7;
  }

  .market-history__history {
    @apply gap-7;
  }

  .market-history__summary {
    @apply grid-cols-1 gap-7;
  }

  .market-history__metrics {
    @apply grid grid-cols-4 gap-5;
  }
}

@media (max-width: 639px) {
  .home-page {
    @apply px-6 py-12;
  }

  .home-page__content {
    @apply gap-12;
  }

  .market-history {
    @apply gap-5;
  }

  .market-history__history {
    @apply gap-6;
  }

  .market-history__summary {
    @apply gap-6;
  }

  .market-history__metrics {
    @apply gap-3;
  }
}
</style>
