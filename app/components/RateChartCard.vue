<script setup lang="ts">
import { computed, useId } from 'vue'

type ChartPoint = {
  label: string
  value: number
}

type ChartTick = {
  label: string
  index: number
}

const props = withDefaults(defineProps<{
  pair: string
  value: string
  timestamp: string
  points: ChartPoint[]
  yTicks?: number[]
  xTicks?: ChartTick[]
  minValue?: number
  maxValue?: number
}>(), {
  yTicks: undefined,
  xTicks: undefined,
  minValue: undefined,
  maxValue: undefined,
})

const chartId = useId().replace(/[^a-zA-Z0-9_-]/g, '')
const fillId = `rate-chart-fill-${chartId}`
const glowId = `rate-chart-glow-${chartId}`

const chart = {
  width: 1040,
  height: 320,
  padding: {
    top: 18,
    right: 20,
    bottom: 34,
    left: 52,
  },
}

const plot = {
  x: chart.padding.left,
  y: chart.padding.top,
  width: chart.width - chart.padding.left - chart.padding.right,
  height: chart.height - chart.padding.top - chart.padding.bottom,
}

const values = computed(() => props.points.map(point => point.value))

const bounds = computed(() => {
  if (!values.value.length) {
    return {
      min: props.minValue ?? 0,
      max: props.maxValue ?? 1,
    }
  }

  const min = props.minValue ?? Math.min(...values.value)
  const max = props.maxValue ?? Math.max(...values.value)
  const spread = Math.max(max - min, 0.0001)
  const padding = spread * 0.08

  return {
    min: props.minValue ?? min - padding,
    max: props.maxValue ?? max + padding,
  }
})

const yTicks = computed(() => {
  if (props.yTicks?.length) {
    return props.yTicks
  }

  const { min, max } = bounds.value
  const step = (max - min) / 2

  return [max, max - step, min]
})

const xTicks = computed(() => {
  if (props.xTicks?.length) {
    return props.xTicks
  }

  const lastIndex = props.points.length - 1
  if (lastIndex <= 0) {
    return []
  }

  return [
    { label: props.points[0]?.label ?? '', index: 0 },
    { label: props.points[Math.round(lastIndex * 0.25)]?.label ?? '', index: Math.round(lastIndex * 0.25) },
    { label: props.points[Math.round(lastIndex * 0.5)]?.label ?? '', index: Math.round(lastIndex * 0.5) },
    { label: props.points[Math.round(lastIndex * 0.75)]?.label ?? '', index: Math.round(lastIndex * 0.75) },
    { label: props.points[lastIndex]?.label ?? '', index: lastIndex },
  ].filter(tick => tick.label)
})

const coordinatePoints = computed(() => {
  const lastIndex = Math.max(props.points.length - 1, 1)
  const range = Math.max(bounds.value.max - bounds.value.min, 0.0001)

  return props.points.map((point, index) => {
    const x = plot.x + (index / lastIndex) * plot.width
    const y = plot.y + ((bounds.value.max - point.value) / range) * plot.height

    return {
      x,
      y,
      label: point.label,
      value: point.value,
    }
  })
})

const linePath = computed(() => coordinatePoints.value
  .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
  .join(' '))

const areaPath = computed(() => {
  const points = coordinatePoints.value
  const first = points[0]
  const last = points[points.length - 1]

  if (!first || !last) {
    return ''
  }

  const baseline = plot.y + plot.height

  return `${linePath.value} L ${last.x.toFixed(2)} ${baseline} L ${first.x.toFixed(2)} ${baseline} Z`
})

const summary = computed(() => {
  const first = props.points[0]
  const last = props.points[props.points.length - 1]

  if (!first || !last) {
    return `${props.pair} chart`
  }

  return `${props.pair} moved from ${first.value.toFixed(4)} on ${first.label} to ${last.value.toFixed(4)} on ${last.label}.`
})

function yTickPosition(tick: number) {
  const range = Math.max(bounds.value.max - bounds.value.min, 0.0001)

  return plot.y + ((bounds.value.max - tick) / range) * plot.height
}

function xTickPosition(index: number) {
  const lastIndex = Math.max(props.points.length - 1, 1)

  return plot.x + (index / lastIndex) * plot.width
}
</script>

<template>
  <article class="rate-chart-card" :aria-label="summary">
    <header class="rate-chart-card__header">
      <h3 class="rate-chart-card__pair">{{ pair }}</h3>
      <p class="rate-chart-card__meta">{{ value }} &middot; {{ timestamp }}</p>
    </header>

    <svg
      class="rate-chart-card__chart"
      :viewBox="`0 0 ${chart.width} ${chart.height}`"
      role="img"
      :aria-label="summary"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient :id="fillId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="var(--color-fx-lime-500)" stop-opacity="0.76" />
          <stop offset="0.55" stop-color="var(--color-fx-lime-500)" stop-opacity="0.2" />
          <stop offset="1" stop-color="var(--color-fx-lime-500)" stop-opacity="0" />
        </linearGradient>
        <filter :id="glowId" x="-8%" y="-18%" width="116%" height="136%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g class="rate-chart-card__grid">
        <line
          v-for="tick in yTicks"
          :key="tick"
          :x1="plot.x"
          :x2="plot.x + plot.width"
          :y1="yTickPosition(tick)"
          :y2="yTickPosition(tick)"
        />
      </g>

      <g class="rate-chart-card__y-axis">
        <text
          v-for="tick in yTicks"
          :key="`label-${tick}`"
          :x="12"
          :y="yTickPosition(tick) + 4"
        >
          {{ tick.toFixed(4) }}
        </text>
      </g>

      <path v-if="areaPath" class="rate-chart-card__area" :d="areaPath" :fill="`url(#${fillId})`" />
      <path v-if="linePath" class="rate-chart-card__line" :d="linePath" :filter="`url(#${glowId})`" />

      <g class="rate-chart-card__x-axis">
        <text
          v-for="tick in xTicks"
          :key="`${tick.label}-${tick.index}`"
          :x="xTickPosition(tick.index)"
          :y="chart.height - 8"
          :text-anchor="tick.index === 0 ? 'start' : tick.index === points.length - 1 ? 'end' : 'middle'"
        >
          {{ tick.label }}
        </text>
      </g>
    </svg>
  </article>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.rate-chart-card {
  @apply w-full min-w-0 overflow-hidden rounded-[14px] border border-fx-neutral-600 bg-fx-neutral-700 text-fx-neutral-50;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.04);
}

.rate-chart-card__header {
  @apply flex items-baseline justify-between gap-4 px-5 pt-5;
}

.rate-chart-card__pair {
  @apply text-preset-3-bold m-0 text-fx-neutral-50;
}

.rate-chart-card__meta {
  @apply text-preset-5 m-0 whitespace-nowrap text-fx-neutral-100 uppercase;
}

.rate-chart-card__chart {
  @apply block h-[316px] w-full;
}

.rate-chart-card__grid line {
  stroke: rgb(255 255 255 / 0.11);
  stroke-dasharray: 1 7;
  stroke-linecap: round;
}

.rate-chart-card__y-axis text,
.rate-chart-card__x-axis text {
  @apply fill-fx-neutral-200 text-preset-6;
}

.rate-chart-card__area {
  opacity: 0.96;
}

.rate-chart-card__line {
  fill: none;
  stroke: var(--color-fx-lime-500);
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2.25;
}

@media (max-width: 640px) {
  .rate-chart-card {
    @apply rounded-lg;
  }

  .rate-chart-card__header {
    @apply flex-col items-start gap-2 px-4 pt-4;
  }

  .rate-chart-card__meta {
    @apply whitespace-normal;
  }

  .rate-chart-card__chart {
    @apply h-[230px];
  }
}
</style>
