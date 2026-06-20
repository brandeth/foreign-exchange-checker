<script setup lang="ts">
import exchangeIcon from '~/assets/images/exchange-icon.svg'
import starFilledIcon from '~/assets/images/star-filled.svg'
import starIcon from '~/assets/images/star.svg'

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
          <p class="text-preset-4 text-fx-neutral-100">Reusable visual patterns for actions, inputs, and rate cards.</p>
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

        <div class="grid gap-4 lg:grid-cols-2">

          <article class="flex flex-col gap-5 border border-fx-neutral-400 bg-fx-neutral-700 p-5">
            <h3 class="text-preset-3-bold">Fields</h3>
            <label class="grid gap-2">
              <span class="text-preset-5-medium uppercase text-fx-neutral-100">Amount</span>
              <input
                value="1000.00"
                class="text-preset-3-medium w-full border border-fx-neutral-300 bg-fx-neutral-900 px-4 py-3 text-fx-neutral-50 outline-none transition focus:border-fx-lime-500 focus:ring-2 focus:ring-fx-lime-500/35"
              >
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
            <div class="grid gap-4 border border-fx-lime-800 bg-fx-neutral-900 p-4">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-preset-5-medium uppercase text-fx-neutral-100">USD to SGD</p>
                  <p class="text-preset-1-tablet text-fx-neutral-50">1.2847</p>
                </div>
                <span class="text-preset-6 bg-fx-green-500 px-2 py-1 text-fx-neutral-900">+0.18%</span>
              </div>
              <div class="grid grid-cols-2 gap-3 border-t border-fx-neutral-400 pt-4">
                <div>
                  <p class="text-preset-6 uppercase text-fx-neutral-200">Spread</p>
                  <p class="text-preset-4 text-fx-neutral-50">0.0041</p>
                </div>
                <div>
                  <p class="text-preset-6 uppercase text-fx-neutral-200">Fee</p>
                  <p class="text-preset-4 text-fx-neutral-50">2.50 SGD</p>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  </main>
</template>
