<script setup lang="ts">
import deleteIcon from '~/assets/images/delete.svg'
import deleteFilledIcon from '~/assets/images/delete-filled.svg'
import exchangeIcon from '~/assets/images/exchange-icon.svg'
import audFlag from '~/assets/images/flags/au.webp'
import bdtFlag from '~/assets/images/flags/bd.webp'
import cadFlag from '~/assets/images/flags/ca.webp'
import chfFlag from '~/assets/images/flags/ch.webp'
import cnyFlag from '~/assets/images/flags/cn.webp'
import gbpFlag from '~/assets/images/flags/gb.webp'
import inrFlag from '~/assets/images/flags/in.webp'
import jpyFlag from '~/assets/images/flags/jp.webp'
import searchIcon from '~/assets/images/search.svg'
import starFilledIcon from '~/assets/images/star-filled.svg'
import starIcon from '~/assets/images/star.svg'
import ComparisonCard from '~/components/ComparisonCard.vue'
import RateChartCard from '~/components/RateChartCard.vue'
import RateMetricCard from '~/components/RateMetricCard.vue'
import TimeRangeSelector from '~/components/TimeRangeSelector.vue'

const activeTab = ref('history')
const selectedTimeRange = ref('1m')

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

const tabs = [
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

const colors = [
  { name: 'Neutral 900', className: 'bg-fx-neutral-900', value: '#0A0A0A', text: 'text-fx-neutral-50' },
  { name: 'Neutral 700', className: 'bg-fx-neutral-700', value: '#171719', text: 'text-fx-neutral-50' },
  { name: 'Neutral 600', className: 'bg-fx-neutral-600', value: '#202022', text: 'text-fx-neutral-50' },
  { name: 'Neutral 500', className: 'bg-fx-neutral-500', value: '#2E2E2E', text: 'text-fx-neutral-50' },
  { name: 'Neutral 400', className: 'bg-fx-neutral-400', value: '#3D3D3D', text: 'text-fx-neutral-50' },
  { name: 'Neutral 300', className: 'bg-fx-neutral-300', value: '#454547', text: 'text-fx-neutral-50' },
  { name: 'Neutral 200', className: 'bg-fx-neutral-200', value: '#9D9D9D', text: 'text-fx-neutral-900' },
  { name: 'Neutral 100', className: 'bg-fx-neutral-100', value: '#C6C6C6', text: 'text-fx-neutral-900' },
  { name: 'Neutral 50', className: 'bg-fx-neutral-50', value: '#FFFFFF', text: 'text-fx-neutral-900' },
  { name: 'Lime 500', className: 'bg-fx-lime-500', value: '#CEF739', text: 'text-fx-neutral-900' },
  { name: 'Lime 800', className: 'bg-fx-lime-800', value: '#283300', text: 'text-fx-neutral-50' },
  { name: 'Green 500', className: 'bg-fx-green-500', value: '#42EB05', text: 'text-fx-neutral-900' },
  { name: 'Red 500', className: 'bg-fx-red-500', value: '#FF4141', text: 'text-fx-neutral-900' },
]

const typePresets = [
  { name: 'Text Preset 1', className: 'text-preset-1', sample: 'FX Rate 1.6842' },
  { name: 'Text Preset 1 Tablet', className: 'text-preset-1-tablet', sample: 'FX Rate 1.6842' },
  { name: 'Text Preset 2', className: 'text-preset-2', sample: 'Compare live conversion costs.' },
  { name: 'Text Preset 2 Bold', className: 'text-preset-2-bold', sample: 'Compare live conversion costs.' },
  { name: 'Text Preset 3', className: 'text-preset-3', sample: 'Market spread' },
  { name: 'Text Preset 3 Medium', className: 'text-preset-3-medium', sample: 'Market spread' },
  { name: 'Text Preset 3 Bold', className: 'text-preset-3-bold', sample: 'Market spread' },
  { name: 'Text Preset 4', className: 'text-preset-4', sample: 'Last updated 20:30 SGT' },
  { name: 'Text Preset 5', className: 'text-preset-5', sample: 'Mid-market benchmark' },
  { name: 'Text Preset 5 Medium', className: 'text-preset-5-medium', sample: 'Mid-market benchmark' },
  { name: 'Text Preset 6', className: 'text-preset-6', sample: 'USD / SGD' },
]
</script>

<template>
  <main class="min-h-screen bg-fx-neutral-900 px-5 py-8 text-fx-neutral-50 md:px-10 md:py-12">
    <div class="mx-auto flex max-w-7xl flex-col gap-10">
      <header class="grid gap-6 border-b border-fx-neutral-400 pb-8 md:grid-cols-[1fr_auto] md:items-end">
        <div class="flex max-w-4xl flex-col gap-4">
          <p class="text-preset-5-medium uppercase text-fx-lime-500">Design System</p>
          <h1 class="text-preset-1-tablet md:text-preset-1">
            Tokens and component demos for the exchange checker.
          </h1>
          <p class="text-preset-3 max-w-3xl text-fx-neutral-100">
            A working reference for colors, type presets, buttons, fields, and rate-display surfaces.
          </p>
        </div>

        <NuxtLink
          to="/"
          class="text-preset-5-medium inline-flex w-fit items-center justify-center border border-fx-neutral-300 px-4 py-3 text-fx-neutral-50 transition hover:border-fx-lime-500 hover:text-fx-lime-500 focus:outline-2 focus:outline-offset-4 focus:outline-fx-lime-500"
        >
          Back Home
        </NuxtLink>
      </header>

      <section class="grid gap-4">
        <div class="flex flex-col gap-2">
          <h2 class="text-preset-2-bold">Color Tokens</h2>
          <p class="text-preset-4 text-fx-neutral-100">Tailwind theme colors exposed through the `fx` token namespace.</p>
        </div>

        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <article
            v-for="color in colors"
            :key="color.name"
            class="overflow-hidden border border-fx-neutral-400 bg-fx-neutral-700"
          >
            <div :class="[color.className, color.text]" class="flex min-h-28 flex-col justify-between p-4">
              <span class="text-preset-5-medium uppercase">{{ color.name }}</span>
              <span class="text-preset-3-bold">{{ color.value }}</span>
            </div>
          </article>
        </div>
      </section>

      <section class="grid gap-4">
        <div class="flex flex-col gap-2">
          <h2 class="text-preset-2-bold">Typography</h2>
          <p class="text-preset-4 text-fx-neutral-100">Current text utilities using JetBrains Mono.</p>
        </div>

        <div class="grid gap-3">
          <article
            v-for="preset in typePresets"
            :key="preset.name"
            class="grid gap-3 border border-fx-neutral-400 bg-fx-neutral-700 p-4 md:grid-cols-[220px_1fr] md:items-center"
          >
            <div class="text-preset-5-medium uppercase text-fx-neutral-100">{{ preset.name }}</div>
            <p :class="preset.className" class="break-words text-fx-neutral-50">{{ preset.sample }}</p>
          </article>
        </div>
      </section>

      <section class="grid gap-4">
        <div class="flex flex-col gap-2">
          <h2 class="text-preset-2-bold">Component Samples</h2>
          <p class="text-preset-4 text-fx-neutral-100">Reusable visual patterns for actions, navigation, inputs, and rate cards.</p>
        </div>

        <article class="grid gap-6 border border-fx-neutral-400 bg-fx-neutral-700 p-5">
          <div class="grid gap-2">
            <h3 class="text-preset-3-bold">Button Component</h3>
            <p class="text-preset-5 text-fx-neutral-100">Slot content with native button states and attributes.</p>
          </div>

          <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <div class="grid min-h-24 content-start gap-3 border border-fx-neutral-400 bg-fx-neutral-900 p-4">
              <span class="text-preset-6 uppercase text-fx-neutral-200">Default</span>
              <Button>Convert</Button>
            </div>

            <div class="grid min-h-24 content-start gap-3 border border-fx-neutral-400 bg-fx-neutral-900 p-4">
              <span class="text-preset-6 uppercase text-fx-neutral-200">Favorite</span>
              <Button variant="favorite" :pressed="false" aria-label="Add USD to SGD to favorites">
                <img :src="starIcon" alt="" class="size-4 shrink-0">
                Favorite
              </Button>
            </div>

            <div class="grid min-h-24 content-start gap-3 border border-fx-neutral-400 bg-fx-neutral-900 p-4">
              <span class="text-preset-6 uppercase text-fx-neutral-200">Favorited</span>
              <Button variant="favorite" pressed aria-label="Remove USD to SGD from favorites">
                <img :src="starFilledIcon" alt="" class="size-5 shrink-0">
                Favorited
              </Button>
            </div>

            <div class="grid min-h-24 content-start gap-3 border border-fx-neutral-400 bg-fx-neutral-900 p-4">
              <span class="text-preset-6 uppercase text-fx-neutral-200">Icon Only</span>
              <Button icon-only variant="clear" aria-label="Add USD to SGD to favorites">
                <img :src="starIcon" alt="">
              </Button>
            </div>

            <div class="grid min-h-24 content-start gap-3 border border-fx-neutral-400 bg-fx-neutral-900 p-4">
              <span class="text-preset-6 uppercase text-fx-neutral-200">Icon Only Pinned</span>
              <Button icon-only variant="favorite" pressed aria-label="Remove USD to SGD from favorites">
                <img :src="starFilledIcon" alt="">
              </Button>
            </div>

            <div class="grid min-h-24 content-start gap-3 border border-fx-neutral-400 bg-fx-neutral-900 p-4">
              <span class="text-preset-6 uppercase text-fx-neutral-200">Exchange</span>
              <Button icon-only variant="exchange" aria-label="Swap currencies">
                <img :src="exchangeIcon" alt="">
              </Button>
            </div>

            <div class="grid min-h-24 content-start gap-3 border border-fx-neutral-400 bg-fx-neutral-900 p-4">
              <span class="text-preset-6 uppercase text-fx-neutral-200">Delete</span>
              <Button icon-only variant="delete" aria-label="Delete currency pair">
                <span class="fx-button__icon-stack" aria-hidden="true">
                  <img :src="deleteIcon" alt="" class="fx-button__icon-default">
                  <img :src="deleteFilledIcon" alt="" class="fx-button__icon-hover">
                </span>
              </Button>
            </div>

            <div class="grid min-h-24 content-start gap-3 border border-fx-neutral-400 bg-fx-neutral-900 p-4">
              <span class="text-preset-6 uppercase text-fx-neutral-200">Long Label</span>
              <Button>Check exchange rate</Button>
            </div>

            <div class="grid min-h-24 content-start gap-3 border border-fx-neutral-400 bg-fx-neutral-900 p-4">
              <span class="text-preset-6 uppercase text-fx-neutral-200">Focusable</span>
              <Button aria-label="Refresh rates">Refresh Rates</Button>
            </div>

            <div class="grid min-h-24 content-start gap-3 border border-fx-neutral-400 bg-fx-neutral-900 p-4">
              <span class="text-preset-6 uppercase text-fx-neutral-200">Disabled</span>
              <Button disabled>Unavailable</Button>
            </div>

            <div class="grid min-h-24 content-start gap-3 border border-fx-neutral-400 bg-fx-neutral-900 p-4">
              <span class="text-preset-6 uppercase text-fx-neutral-200">Clear</span>
              <Button variant="clear">Clear All</Button>
            </div>
          </div>
        </article>

        <article class="grid gap-5 border border-fx-neutral-400 bg-fx-neutral-700 p-5">
          <div class="grid gap-2">
            <h3 class="text-preset-3-bold">Tabs</h3>
            <p class="text-preset-5 text-fx-neutral-100">Selectable tabs with optional numeric badges and keyboard navigation.</p>
          </div>

          <div class="overflow-hidden bg-fx-neutral-900">
            <Tabs v-model="activeTab" :tabs="tabs" aria-label="Exchange views" />
          </div>
        </article>

        <div class="grid gap-4 lg:grid-cols-2">

          <article class="flex flex-col gap-5 border border-fx-neutral-400 bg-fx-neutral-700 p-5">
            <h3 class="text-preset-3-bold">Fields</h3>
            <label class="grid gap-2">
              <span class="text-preset-5-medium uppercase text-fx-neutral-100">Search</span>
              <Input placeholder="Search currencies...">
                <template #icon>
                  <img :src="searchIcon" alt="">
                </template>
              </Input>
            </label>
            <label class="grid gap-2">
              <span class="text-preset-5-medium uppercase text-fx-neutral-100">Currency Pair</span>
              <select class="text-preset-3-medium w-full border border-fx-neutral-300 bg-fx-neutral-900 px-4 py-3 text-fx-neutral-50 outline-none transition focus:border-fx-lime-500 focus:ring-2 focus:ring-fx-lime-500/35">
                <option>USD / SGD</option>
                <option>EUR / USD</option>
                <option>GBP / SGD</option>
              </select>
            </label>
          </article>

          <article class="flex flex-col gap-5 border border-fx-neutral-400 bg-fx-neutral-700 p-5">
            <h3 class="text-preset-3-bold">Rate Card</h3>
            <RateCard
              title="USD to SGD"
              rate="1.2847"
              change="+0.18%"
              spread="0.0041"
              fee="2.50 SGD"
            />
          </article>

          <article class="flex flex-col gap-5 border border-fx-neutral-400 bg-fx-neutral-700 p-5 lg:col-span-2">
            <h3 class="text-preset-3-bold">Rate Metric Cards</h3>
            <div class="grid gap-6 bg-fx-neutral-900 p-4 xl:grid-cols-[1fr_auto] xl:items-center">
              <div class="flex flex-wrap gap-4">
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
          </article>

          <article class="flex min-w-0 flex-col gap-5 border border-fx-neutral-400 bg-fx-neutral-700 p-5 lg:col-span-2">
            <h3 class="text-preset-3-bold">Rate Chart Card</h3>
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
          </article>

          <article class="flex min-w-0 flex-col gap-5 border border-fx-neutral-400 bg-fx-neutral-700 p-5 lg:col-span-2">
            <h3 class="text-preset-3-bold">Comparison Card</h3>
            <ComparisonCard :items="comparisonItems" />
          </article>

          <article class="flex flex-col gap-5 border border-fx-neutral-400 bg-fx-neutral-700 p-5">
            <h3 class="text-preset-3-bold">Currency Dropdown</h3>
            <div class="overflow-visible border border-fx-neutral-500 bg-fx-neutral-900 p-4">
              <CurrencyDropdown />
            </div>
          </article>

          <article class="flex flex-col gap-5 border border-fx-neutral-400 bg-fx-neutral-700 p-5">
            <h3 class="text-preset-3-bold">Live Rates</h3>
            <div class="grid gap-4 overflow-hidden border border-fx-neutral-500 bg-fx-neutral-900 p-4">
              <LiveRate pair="EUR/GBP" rate="0.8595" change="0.67%" direction="down" />
              <LiveRate pair="USD/JPY" rate="157.91" change="+0.04%" direction="up" />
            </div>
          </article>
        </div>

        <article class="flex min-w-0 flex-col gap-5 border border-fx-neutral-400 bg-fx-neutral-700 p-5">
          <h3 class="text-preset-3-bold">Live Markets</h3>
          <LiveMarkets :marquee="false" />
        </article>

        <article class="grid gap-5 border border-fx-neutral-400 bg-fx-neutral-900 p-5">
          <h3 class="text-preset-3-bold">Check Rate</h3>
          <CheckRate />
        </article>
      </section>
    </div>
  </main>
</template>
