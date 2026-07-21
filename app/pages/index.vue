<script setup lang="ts">
import audFlag from '~/assets/images/flags/au.webp'
import bdtFlag from '~/assets/images/flags/bd.webp'
import cadFlag from '~/assets/images/flags/ca.webp'
import chfFlag from '~/assets/images/flags/ch.webp'
import cnyFlag from '~/assets/images/flags/cn.webp'
import gbpFlag from '~/assets/images/flags/gb.webp'
import inrFlag from '~/assets/images/flags/in.webp'
import jpyFlag from '~/assets/images/flags/jp.webp'
import ComparisonCard from '~/components/ComparisonCard.vue'
import ConversionLogCard, { type ConversionLogItem } from '~/components/ConversionLogCard.vue'
import FavoritesCard, { type FavoritePair } from '~/components/FavoritesCard.vue'
import RateChartCard from '~/components/RateChartCard.vue'
import RateMetricCard from '~/components/RateMetricCard.vue'
import TimeRangeSelector from '~/components/TimeRangeSelector.vue'

const activeMarketTab = ref('history')
const selectedTimeRange = ref('1m')

const conversionLogs = ref<ConversionLogItem[]>([
  { id: 'log-1', timestampLabel: '20m', fromCurrency: 'USD', toCurrency: 'EUR', fromAmount: '1,000.00', toAmount: '853.02' },
  { id: 'log-2', timestampLabel: '34m', fromCurrency: 'EUR', toCurrency: 'JPY', fromAmount: '500.00', toAmount: '92,490' },
  { id: 'log-3', timestampLabel: '50m', fromCurrency: 'GBP', toCurrency: 'USD', fromAmount: '250.00', toAmount: '339.38' },
  { id: 'log-4', timestampLabel: '1h', fromCurrency: 'USD', toCurrency: 'GBP', fromAmount: '1,500.00', toAmount: '1,104.95' },
  { id: 'log-5', timestampLabel: '2h', fromCurrency: 'BDT', toCurrency: 'USD', fromAmount: '50,000', toAmount: '406.77' },
  { id: 'log-6', timestampLabel: '4h', fromCurrency: 'EUR', toCurrency: 'INR', fromAmount: '100.00', toAmount: '11,127.43' },
  { id: 'log-7', timestampLabel: '13 May', fromCurrency: 'AUD', toCurrency: 'USD', fromAmount: '2,000.00', toAmount: '1,441.60' },
  { id: 'log-8', timestampLabel: '11 May', fromCurrency: 'CHF', toCurrency: 'USD', fromAmount: '750.00', toAmount: '824.36' },
])

const marketTabs = computed(() => [
  { label: 'History', value: 'history' },
  { label: 'Compare', value: 'compare' },
  { label: 'Favorites', value: 'favorites', badge: favoritePairs.length },
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

const comparisonItems = [
  { code: 'GBP', name: 'British Pound', flagSrc: gbpFlag, value: '736.65', rate: '0.7366', favorited: true },
  { code: 'JPY', name: 'Japanese Yen', flagSrc: jpyFlag, value: '157,910', rate: '157.91', favorited: true },
  { code: 'CHF', name: 'Swiss Franc', flagSrc: chfFlag, value: '909.80', rate: '0.9098' },
  { code: 'CAD', name: 'Canadian Dollar', flagSrc: cadFlag, value: '1,381.50', rate: '1.3815' },
  { code: 'AUD', name: 'Australian Dollar', flagSrc: audFlag, value: '1,387.35', rate: '1.3874' },
  { code: 'INR', name: 'Indian Rupee', flagSrc: inrFlag, value: '94,910.00', rate: '94.910', favorited: true },
  { code: 'CNY', name: 'Chinese Yuan', flagSrc: cnyFlag, value: '7,210.00', rate: '7.2100' },
  { code: 'BDT', name: 'Bangladeshi Taka', flagSrc: bdtFlag, value: '122,920', rate: '122.92', favorited: true },
]

const favoritePairs: FavoritePair[] = [
  { fromCurrency: 'USD', toCurrency: 'EUR', exchangeRate: '0.8530', priceChange: '+0.16%', increase: true },
  { fromCurrency: 'GBP', toCurrency: 'USD', exchangeRate: '1.3575', priceChange: '-0.22%' },
  { fromCurrency: 'USD', toCurrency: 'JPY', exchangeRate: '157.91', priceChange: '+0.04%', increase: true },
  { fromCurrency: 'USD', toCurrency: 'BDT', exchangeRate: '122.92', priceChange: '+0.18%', increase: true },
  { fromCurrency: 'EUR', toCurrency: 'GBP', exchangeRate: '0.8633', priceChange: '+0.11%', increase: true },
  { fromCurrency: 'AUD', toCurrency: 'NZD', exchangeRate: '1.2217', priceChange: '+0.23%', increase: true },
  { fromCurrency: 'USD', toCurrency: 'INR', exchangeRate: '94.910', priceChange: '+0.05%', increase: true },
  { fromCurrency: 'EUR', toCurrency: 'CHF', exchangeRate: '1.0668', priceChange: '-0.15%' },
  { fromCurrency: 'GBP', toCurrency: 'JPY', exchangeRate: '213.21', priceChange: '+0.13%', increase: true },
  { fromCurrency: 'USD', toCurrency: 'TRY', exchangeRate: '38.642', priceChange: '+0.54%', increase: true },
]

function removeConversionLog(id: string) {
  conversionLogs.value = conversionLogs.value.filter(item => item.id !== id)
}

function clearConversionLogs() {
  conversionLogs.value = []
}

const rateChartValues = [
  0.8543, 0.8546, 0.8558, 0.8569, 0.8575, 0.8562, 0.8547, 0.8550, 0.8548, 0.8535,
  0.8535, 0.8521, 0.8526, 0.8524, 0.8527, 0.8531, 0.8537, 0.8533, 0.8538, 0.8552,
  0.8550, 0.8565, 0.8558, 0.8543, 0.8539, 0.8532, 0.8537, 0.8525, 0.8521, 0.8524,
  0.8519, 0.8526, 0.8509, 0.8524, 0.8501, 0.8508, 0.8509, 0.8511, 0.8510, 0.8518,
  0.8509, 0.8509, 0.8502, 0.8493, 0.8504, 0.8516, 0.8531, 0.8523, 0.8510, 0.8505,
  0.8494, 0.8489, 0.8502, 0.8492, 0.8505, 0.8496, 0.8498, 0.8484, 0.8490, 0.8482,
  0.8488, 0.8491, 0.8504, 0.8498, 0.8505, 0.8501, 0.8511, 0.8528, 0.8519, 0.8542,
  0.8555, 0.8556, 0.8562, 0.8565, 0.8570, 0.8567, 0.8591, 0.8597, 0.8568, 0.8545,
  0.8547, 0.8532, 0.8520, 0.8517, 0.8538, 0.8546, 0.8540, 0.8568, 0.8569, 0.8582,
  0.8590, 0.8570, 0.8583, 0.8598, 0.8596, 0.8581, 0.8580, 0.8578, 0.8584, 0.8576,
  0.8573, 0.8556, 0.8560, 0.8571, 0.8590,
]

const rateChartPoints = rateChartValues.map((value, index) => ({
  label: index === 0 ? 'Apr 14' : index === rateChartValues.length - 1 ? 'May 14' : `Point ${index + 1}`,
  value,
}))

const rateChartXTicks = [
  { label: 'Apr 14', index: 0 },
  { label: 'Apr 21', index: 26 },
  { label: 'Apr 28', index: 52 },
  { label: 'May 06', index: 78 },
  { label: 'May 14', index: rateChartValues.length - 1 },
]

</script>

<template>
  <main class="home-page min-h-screen bg-fx-neutral-900 px-6 py-9 text-fx-neutral-50">
    <div class="home-page__content mx-auto flex max-w-[1036px] flex-col gap-12">
      <CheckRate />

      <section class="market-history" aria-label="Exchange market views">
        <Tabs
          v-model="activeMarketTab"
          :tabs="marketTabs"
          aria-label="Exchange market views"
        />

        <div
          v-if="activeMarketTab === 'history' && rateChartPoints.length"
          class="market-history__history"
        >
          <div class="market-history__summary">
            <div class="market-history__metrics">
              <RateMetricCard label="Open" value="0.8516" />
              <RateMetricCard label="Last" value="0.8530" />
              <RateMetricCard label="Change" value="+0.0014" increase />
              <RateMetricCard label="% Change" value="+0.16%" increase show-indicator />
            </div>

            <TimeRangeSelector
              v-model="selectedTimeRange"
              :options="timeRanges"
              aria-label="Chart time range"
            />
          </div>

          <RateChartCard
            pair="USD/EUR"
            value="0.8530"
            timestamp="May 14 16:00 CET"
            :points="rateChartPoints"
            :x-ticks="rateChartXTicks"
            :y-ticks="[0.8612, 0.8516, 0.8421]"
            :min-value="0.8421"
            :max-value="0.8612"
          />
        </div>

        <div v-else-if="activeMarketTab === 'history'" class="market-view__empty" role="status">
          <p class="market-view__empty-title">No chart data available</p>
          <p class="market-view__empty-message">
            We couldn't load rate history for USD/EUR right now.<br>
            This usually clears up in a minute.
          </p>
        </div>

        <ComparisonCard
          v-else-if="activeMarketTab === 'compare' && comparisonItems.length"
          :items="comparisonItems"
        />

        <div v-else-if="activeMarketTab === 'compare'" class="market-view__empty" role="status">
          <p class="market-view__empty-title">No comparison available</p>
          <p class="market-view__empty-message">
            Enter an amount in SEND above to see what your<br>
            money is worth in other currencies.
          </p>
        </div>

        <FavoritesCard
          v-else-if="activeMarketTab === 'favorites' && favoritePairs.length"
          :items="favoritePairs"
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
          :items="conversionLogs"
          @remove="removeConversionLog"
          @clear="clearConversionLogs"
        />

        <div v-else-if="activeMarketTab === 'log'" class="market-view__empty" role="status">
          <p class="market-view__empty-title">No conversions logged yet</p>
          <p class="market-view__empty-message">
            Every conversion is recorded here automatically when you tap LOG CONVERSION.<br>
            Your log is private to this session and this browser.
          </p>
        </div>
      </section>

      <section class="hidden flex-col gap-6 border-t border-fx-neutral-400 pt-8 sm:flex">
        <div class="flex flex-col gap-4">
          <p class="text-preset-5-medium uppercase text-fx-lime-500">Foreign Exchange Checker</p>
          <h1 class="text-preset-1-tablet md:text-preset-1 max-w-3xl">
            Build interface primitives from a visible token baseline.
          </h1>
        </div>

        <NuxtLink
          to="/design-system"
          class="text-preset-3-medium inline-flex w-fit items-center justify-center border border-fx-lime-500 bg-fx-lime-500 px-5 py-3 text-fx-neutral-900 transition hover:bg-fx-neutral-900 hover:text-fx-lime-500 focus:outline-2 focus:outline-offset-4 focus:outline-fx-lime-500"
        >
          Open Design System
        </NuxtLink>
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
