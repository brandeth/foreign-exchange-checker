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
import RateChartCard from '~/components/RateChartCard.vue'
import RateMetricCard from '~/components/RateMetricCard.vue'
import TimeRangeSelector from '~/components/TimeRangeSelector.vue'

const activeMarketTab = ref('history')
const selectedTimeRange = ref('1m')

const marketTabs = [
  { label: 'History', value: 'history' },
  { label: 'Compare', value: 'compare' },
  { label: 'Favorites', value: 'favorites', badge: 10 },
  { label: 'Log', value: 'log', badge: 8 },
]

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
  <main class="min-h-screen bg-fx-neutral-900 px-6 py-9 text-fx-neutral-50">
    <div class="mx-auto flex max-w-[1036px] flex-col gap-12">
      <CheckRate />

      <section class="market-history" aria-label="Exchange market views">
        <Tabs
          v-model="activeMarketTab"
          :tabs="marketTabs"
          aria-label="Exchange market views"
        />

        <div v-if="activeMarketTab === 'history'" class="market-history__history">
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

        <ComparisonCard
          v-else-if="activeMarketTab === 'compare'"
          :items="comparisonItems"
        />

        <div v-else class="market-history__panel">
          <p class="market-history__panel-label">{{ activeMarketTab }}</p>
        </div>
      </section>

      <section class="flex flex-col gap-6 border-t border-fx-neutral-400 pt-8">
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

.market-history__panel {
  @apply flex min-h-[220px] items-center justify-center rounded-[14px] border border-fx-neutral-600 bg-fx-neutral-700;
}

.market-history__panel-label {
  @apply text-preset-3-bold uppercase text-fx-neutral-100;
}

@media (max-width: 639px) {
  .market-history__summary {
    @apply gap-4;
  }
}
</style>
