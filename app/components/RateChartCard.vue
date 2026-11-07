<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'

type ChartPoint = {
  label: string
  value: number
  date?: string
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
const mobileFillId = `rate-chart-mobile-fill-${chartId}`
const mobileGlowId = `rate-chart-mobile-glow-${chartId}`
const instructionsId = `rate-chart-instructions-${chartId}`
const activeIndex = ref<number>()
const isKeyboardInspection = ref(false)
const chartPlot = ref<HTMLElement>()
const isComparing = ref(false)
const pinnedIndices = ref<number[]>([])
const observationDateFormat = new Intl.DateTimeFormat('en-GB', { dateStyle: 'long', timeZone: 'UTC' })
const comparisonDateFormat = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeZone: 'UTC' })
const observationRateFormat = new Intl.NumberFormat('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 8 })
const observationChangeFormat = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: 'exceptZero',
})

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

const mobileChart = {
  width: 360,
  height: 360,
  padding: {
    top: 10,
    right: 2,
    bottom: 34,
    left: 55,
  },
}

const plot = {
  x: chart.padding.left,
  y: chart.padding.top,
  width: chart.width - chart.padding.left - chart.padding.right,
  height: chart.height - chart.padding.top - chart.padding.bottom,
}

const mobilePlot = {
  x: mobileChart.padding.left,
  y: mobileChart.padding.top,
  width: mobileChart.width - mobileChart.padding.left - mobileChart.padding.right,
  height: mobileChart.height - mobileChart.padding.top - mobileChart.padding.bottom,
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
  const padding = max === min ? Math.max(Math.abs(max) * 0.01, 0.0001) : spread * 0.08

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
  if (lastIndex < 0) {
    return []
  }
  if (lastIndex === 0) return [{ label: props.points[0]!.label, index: 0 }]

  return [
    { label: props.points[0]?.label ?? '', index: 0 },
    { label: props.points[Math.round(lastIndex * 0.25)]?.label ?? '', index: Math.round(lastIndex * 0.25) },
    { label: props.points[Math.round(lastIndex * 0.5)]?.label ?? '', index: Math.round(lastIndex * 0.5) },
    { label: props.points[Math.round(lastIndex * 0.75)]?.label ?? '', index: Math.round(lastIndex * 0.75) },
    { label: props.points[lastIndex]?.label ?? '', index: lastIndex },
  ].filter((tick, index, ticks) => tick.label && ticks.findIndex(item => item.index === tick.index) === index)
})

const mobileXTicks = computed(() => {
  const ticks = xTicks.value

  if (ticks.length <= 3) {
    return ticks
  }

  return [
    ticks[0],
    ticks[Math.floor(ticks.length / 2)],
    ticks[ticks.length - 1],
  ].filter((tick): tick is ChartTick => Boolean(tick))
})

function pointFraction(index: number) {
  if (props.points.length === 1) return 0.5
  const first = Date.parse(props.points[0]?.date ?? '')
  const last = Date.parse(props.points.at(-1)?.date ?? '')
  const current = Date.parse(props.points[index]?.date ?? '')
  return Number.isFinite(first) && Number.isFinite(last) && Number.isFinite(current) && last > first
    ? (current - first) / (last - first)
    : index / Math.max(props.points.length - 1, 1)
}

const pointFractions = computed(() => props.points.map((_, index) => pointFraction(index)))

function formatTick(value: number) {
  return Math.abs(value) >= 10 ? new Intl.NumberFormat('en-US', { notation: 'compact', maximumSignificantDigits: 4 }).format(value) : value.toFixed(4)
}

const coordinatePoints = computed(() => {
  const range = Math.max(bounds.value.max - bounds.value.min, 0.0001)

  return props.points.map((point, index) => {
    const x = plot.x + pointFractions.value[index]! * plot.width
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
  return plot.x + pointFraction(index) * plot.width
}


const mobileCoordinatePoints = computed(() => {
  const range = Math.max(bounds.value.max - bounds.value.min, 0.0001)

  return props.points.map((point, index) => ({
    x: mobilePlot.x + pointFractions.value[index]! * mobilePlot.width,
    y: mobilePlot.y + ((bounds.value.max - point.value) / range) * mobilePlot.height,
  }))
})

const mobileLinePath = computed(() => mobileCoordinatePoints.value
  .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
  .join(' '))

const mobileAreaPath = computed(() => {
  const points = mobileCoordinatePoints.value
  const first = points[0]
  const last = points[points.length - 1]

  if (!first || !last) {
    return ''
  }

  const baseline = mobilePlot.y + mobilePlot.height

  return `${mobileLinePath.value} L ${last.x.toFixed(2)} ${baseline} L ${first.x.toFixed(2)} ${baseline} Z`
})

function mobileYTickPosition(tick: number) {
  const range = Math.max(bounds.value.max - bounds.value.min, 0.0001)

  return mobilePlot.y + ((bounds.value.max - tick) / range) * mobilePlot.height
}

function mobileXTickPosition(index: number) {
  return mobilePlot.x + pointFraction(index) * mobilePlot.width
}

function formatObservationDate(point: ChartPoint, formatter: Intl.DateTimeFormat) {
  const date = Date.parse(point.date ?? '')
  return Number.isFinite(date) ? formatter.format(date) : point.label
}

function formatObservationRate(value: number) {
  const rate = observationRateFormat.format(value)
  const [base, quote] = props.pair.split('/')
  return quote ? `1 ${base} = ${rate} ${quote}` : `${props.pair} · ${rate}`
}

function formatRateChange(from: number, to: number) {
  const change = (to - from) / from
  if (from > 0 && Number.isFinite(change)) return observationChangeFormat.format(change)
}

const activeObservation = computed(() => {
  if (activeIndex.value === undefined) return
  const point = props.points[activeIndex.value]
  if (!point) return

  const previous = props.points[activeIndex.value - 1]
  const change = previous && formatRateChange(previous.value, point.value)
  return {
    date: formatObservationDate(point, observationDateFormat),
    rate: formatObservationRate(point.value),
    comparison: previous && change ? {
      change,
      label: formatObservationDate(previous, comparisonDateFormat) || 'previous observation',
    } : undefined,
  }
})

const inspectionAnnouncement = computed(() => {
  const observation = activeObservation.value
  if (!isKeyboardInspection.value || !observation) return ''
  const details = `${observation.date}. ${observation.rate}.`
  const comparison = observation.comparison
  return comparison ? `${details} ${comparison.change} compared with ${comparison.label}.` : details
})

const activeDesktopPoint = computed(() => activeIndex.value === undefined ? undefined : coordinatePoints.value[activeIndex.value])
const activeMobilePoint = computed(() => activeIndex.value === undefined ? undefined : mobileCoordinatePoints.value[activeIndex.value])

type PlotPosition = { x: number, y: number }

function markerPosition(desktop: PlotPosition, mobile: PlotPosition) {
  return {
    '--desktop-x': `${desktop.x / chart.width * 100}%`,
    '--desktop-y': `${desktop.y / chart.height * 100}%`,
    '--mobile-x': `${mobile.x / mobileChart.width * 100}%`,
    '--mobile-y': `${mobile.y / mobileChart.height * 100}%`,
  }
}

const inspectionPosition = computed(() => {
  const desktop = activeDesktopPoint.value
  const mobile = activeMobilePoint.value
  if (!desktop || !mobile) return

  return {
    ...markerPosition(desktop, mobile),
    '--desktop-tooltip-offset': desktop.y / chart.height < 0.3 ? '10px' : 'calc(-100% - 10px)',
    '--mobile-tooltip-offset': mobile.y / mobileChart.height < 0.3 ? '10px' : 'calc(-100% - 10px)',
  }
})

const pinnedObservations = computed(() => pinnedIndices.value.flatMap((index) => {
  const point = props.points[index]
  const desktop = coordinatePoints.value[index]
  const mobile = mobileCoordinatePoints.value[index]
  if (!point || !desktop || !mobile) return []

  return [{
    index,
    date: formatObservationDate(point, comparisonDateFormat),
    rate: formatObservationRate(point.value),
    value: point.value,
    position: markerPosition(desktop, mobile),
  }]
}))

const pinnedChange = computed(() => {
  const [earlier, later] = pinnedObservations.value
  if (earlier && later) return formatRateChange(earlier.value, later.value)
})

function clearInspection() {
  activeIndex.value = undefined
  isKeyboardInspection.value = false
}

function clearPins(event?: MouseEvent) {
  pinnedIndices.value = []
  if (event?.detail === 0) chartPlot.value?.focus({ preventScroll: true })
}

watch([() => props.points, () => props.pair], () => {
  clearInspection()
  clearPins()
  isComparing.value = false
})

function toggleComparison(event: MouseEvent) {
  isComparing.value = !isComparing.value
  if (!isComparing.value) clearPins()
  else if (event.detail === 0) chartPlot.value?.focus({ preventScroll: true })
}

function pinObservation() {
  const index = activeIndex.value
  if (!isComparing.value || index === undefined || pinnedIndices.value.length === 2 || pinnedIndices.value.includes(index)) return
  pinnedIndices.value = [...pinnedIndices.value, index].sort((left, right) => left - right)
}

function inspectPointer(event: MouseEvent, pin = false) {
  const hitArea = event.currentTarget as SVGRectElement
  const { left, width } = hitArea.getBoundingClientRect()
  if (!width || !pointFractions.value.length) return

  const fraction = (event.clientX - left) / width
  activeIndex.value = pointFractions.value.reduce((nearest, point, index, fractions) =>
    Math.abs(point - fraction) < Math.abs(fractions[nearest]! - fraction) ? index : nearest, 0)
  isKeyboardInspection.value = false
  if (pin) pinObservation()
}

function inspectHover(event: PointerEvent) {
  if (event.pointerType !== 'touch') inspectPointer(event)
}

function leavePlot(event: PointerEvent) {
  if (event.pointerType !== 'touch' && !isKeyboardInspection.value) clearInspection()
}

function inspectWithKeyboard(step: number) {
  const lastIndex = props.points.length - 1
  if (lastIndex < 0) return
  activeIndex.value = Math.min(lastIndex, Math.max(0, (activeIndex.value ?? lastIndex) + step))
  isKeyboardInspection.value = true
}

function pinWithKeyboard(event: KeyboardEvent) {
  if (!isComparing.value) return
  event.preventDefault()
  inspectWithKeyboard(0)
  pinObservation()
}

function focusChart(event: FocusEvent) {
  if ((event.currentTarget as HTMLElement).matches(':focus-visible')) inspectWithKeyboard(0)
}
</script>

<template>
  <article class="rate-chart-card" :aria-label="summary">
    <header class="rate-chart-card__header">
      <h3 class="rate-chart-card__pair">{{ pair }}</h3>
      <p class="rate-chart-card__meta">{{ value }} &middot; {{ timestamp }}</p>
    </header>

    <div
      ref="chartPlot"
      class="rate-chart-card__plot"
      role="group"
      :aria-label="`${pair} rate chart`"
      :aria-describedby="points.length ? instructionsId : undefined"
      :tabindex="points.length ? 0 : undefined"
      :style="inspectionPosition"
      @focus="focusChart"
      @blur="clearInspection"
      @keydown.left.prevent="inspectWithKeyboard(-1)"
      @keydown.right.prevent="inspectWithKeyboard(1)"
      @keydown.enter="pinWithKeyboard"
      @keydown.space="pinWithKeyboard"
      @keydown.esc="clearInspection"
    >
      <svg
        class="rate-chart-card__chart rate-chart-card__chart--desktop"
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
            {{ formatTick(tick) }}
          </text>
        </g>

        <path v-if="areaPath" class="rate-chart-card__area" :d="areaPath" :fill="`url(#${fillId})`" />
        <path v-if="linePath" class="rate-chart-card__line" :d="linePath" :filter="`url(#${glowId})`" />
        <circle v-if="!activeDesktopPoint && points.length === 1 && coordinatePoints[0]" :cx="coordinatePoints[0].x" :cy="coordinatePoints[0].y" r="4" fill="var(--color-fx-lime-500)" />

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
        <line v-if="activeDesktopPoint" class="rate-chart-card__guide" :x1="activeDesktopPoint.x" :x2="activeDesktopPoint.x" :y1="plot.y" :y2="plot.y + plot.height" />
        <rect
          v-if="points.length"
          class="rate-chart-card__hit-area"
          :x="plot.x" :y="plot.y" :width="plot.width" :height="plot.height"
          @pointermove="inspectHover" @pointerleave="leavePlot" @click="inspectPointer($event, true)"
        />
      </svg>

      <svg
        class="rate-chart-card__chart rate-chart-card__chart--mobile"
        :viewBox="`0 0 ${mobileChart.width} ${mobileChart.height}`"
        role="img"
        :aria-label="summary"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient :id="mobileFillId" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="var(--color-fx-lime-500)" stop-opacity="0.76" />
            <stop offset="0.55" stop-color="var(--color-fx-lime-500)" stop-opacity="0.2" />
            <stop offset="1" stop-color="var(--color-fx-lime-500)" stop-opacity="0" />
          </linearGradient>
          <filter :id="mobileGlowId" x="-8%" y="-18%" width="116%" height="136%">
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
            :key="`mobile-grid-${tick}`"
            :x1="mobilePlot.x"
            :x2="mobilePlot.x + mobilePlot.width"
            :y1="mobileYTickPosition(tick)"
            :y2="mobileYTickPosition(tick)"
          />
        </g>

        <g class="rate-chart-card__y-axis">
          <text
            v-for="tick in yTicks"
            :key="`mobile-label-${tick}`"
            :x="0"
            :y="mobileYTickPosition(tick) + 4"
          >
            {{ formatTick(tick) }}
          </text>
        </g>

        <path
          v-if="mobileAreaPath"
          class="rate-chart-card__area"
          :d="mobileAreaPath"
          :fill="`url(#${mobileFillId})`"
        />
        <path
          v-if="mobileLinePath"
          class="rate-chart-card__line"
          :d="mobileLinePath"
          :filter="`url(#${mobileGlowId})`"
        />
        <circle v-if="!activeMobilePoint && points.length === 1 && mobileCoordinatePoints[0]" :cx="mobileCoordinatePoints[0].x" :cy="mobileCoordinatePoints[0].y" r="4" fill="var(--color-fx-lime-500)" />

        <g class="rate-chart-card__x-axis">
          <text
            v-for="tick in mobileXTicks"
            :key="`mobile-${tick.label}-${tick.index}`"
            :x="mobileXTickPosition(tick.index)"
            :y="mobileChart.height - 7"
            :text-anchor="tick.index === 0 ? 'start' : tick.index === points.length - 1 ? 'end' : 'middle'"
          >
            {{ tick.label }}
          </text>
        </g>
        <line v-if="activeMobilePoint" class="rate-chart-card__guide" :x1="activeMobilePoint.x" :x2="activeMobilePoint.x" :y1="mobilePlot.y" :y2="mobilePlot.y + mobilePlot.height" />
        <rect
          v-if="points.length"
          class="rate-chart-card__hit-area"
          :x="mobilePlot.x" :y="mobilePlot.y" :width="mobilePlot.width" :height="mobilePlot.height"
          @pointermove="inspectHover" @pointerleave="leavePlot" @click="inspectPointer($event, true)"
        />
      </svg>

      <span
        v-for="observation in pinnedObservations"
        :key="observation.index"
        class="rate-chart-card__marker rate-chart-card__marker--pinned"
        :style="observation.position"
        aria-hidden="true"
      />
      <template v-if="activeObservation">
        <span class="rate-chart-card__marker" aria-hidden="true" />
        <div class="rate-chart-card__tooltip" aria-hidden="true">
          <p class="rate-chart-card__observation-date">{{ activeObservation.date }}</p>
          <p class="rate-chart-card__observation-rate">{{ activeObservation.rate }}</p>
          <p v-if="activeObservation.comparison" class="rate-chart-card__observation-change">
            {{ activeObservation.comparison.change }} vs. {{ activeObservation.comparison.label }}
          </p>
        </div>
      </template>
      <p :id="instructionsId" class="sr-only">
        Use the arrow keys to inspect rates. Press Escape to dismiss the details.
        <template v-if="isComparing">Press Enter or Space to pin a point for comparison.</template>
      </p>
      <p class="sr-only" aria-live="polite">{{ inspectionAnnouncement }}</p>
    </div>

    <footer v-if="points.length > 1" class="rate-chart-card__comparison">
      <div class="rate-chart-card__comparison-controls">
        <Button variant="favorite" :pressed="isComparing" @click="toggleComparison">Compare points</Button>
        <Button v-if="isComparing" variant="clear" :disabled="!pinnedIndices.length" @click="clearPins">Clear pins</Button>
      </div>
      <div :class="{ 'mt-2': isComparing }" aria-live="polite" aria-atomic="true">
        <template v-if="isComparing">
          <ul v-if="pinnedObservations.length" class="rate-chart-card__pinned-list" aria-label="Pinned observations">
            <li v-for="observation in pinnedObservations" :key="observation.index">
              {{ observation.date }} · {{ observation.rate }}
            </li>
          </ul>
          <p v-if="pinnedObservations.length === 0">Click or tap two points, or use the arrow keys and Enter.</p>
          <p v-else-if="pinnedObservations.length === 1">Pin a second point to compare.</p>
          <p v-else class="rate-chart-card__comparison-change">{{ pinnedChange === undefined ? 'Percentage change unavailable' : `${pinnedChange} change` }}</p>
        </template>
      </div>
    </footer>
  </article>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.rate-chart-card {
  --plot-height: 296px;
  @apply grid w-full min-w-0 grid-rows-[auto_var(--plot-height)] gap-5 overflow-hidden rounded-2xl border border-fx-neutral-600 bg-fx-neutral-700 p-5 text-fx-neutral-50;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.04);
}

.rate-chart-card__header {
  @apply flex items-baseline justify-between gap-4;
}

.rate-chart-card__pair {
  @apply text-preset-3-bold m-0 text-fx-neutral-50;
}

.rate-chart-card__meta {
  @apply text-preset-5 m-0 whitespace-nowrap text-fx-neutral-100 uppercase;
}

.rate-chart-card__plot,
.rate-chart-card__marker--pinned {
  --point-x: var(--desktop-x);
  --point-y: var(--desktop-y);
}

.rate-chart-card__plot {
  --tooltip-offset: var(--desktop-tooltip-offset);
  @apply relative min-h-0 min-w-0 rounded-sm focus-visible:outline-2 focus-visible:outline-fx-lime-500;
}

.rate-chart-card__chart {
  @apply block h-full min-h-0 w-full;
}

.rate-chart-card__chart--mobile {
  @apply hidden;
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

.rate-chart-card__guide {
  @apply pointer-events-none stroke-fx-neutral-200;
  stroke-dasharray: 4 4;
  vector-effect: non-scaling-stroke;
}

.rate-chart-card__hit-area {
  fill: transparent;
  cursor: crosshair;
}

.rate-chart-card__marker {
  @apply pointer-events-none absolute size-3 rounded-full border-2 border-fx-neutral-700 bg-fx-lime-500;
  top: var(--point-y);
  left: var(--point-x);
  transform: translate(-50%, -50%);
}

.rate-chart-card__marker--pinned {
  @apply size-4 border-fx-lime-500 bg-fx-neutral-900;
}

.rate-chart-card__tooltip {
  --tooltip-width: min(13rem, 100%);
  @apply pointer-events-none absolute z-10 grid gap-1 rounded-lg border border-fx-neutral-400 bg-fx-neutral-900 px-3 py-2;
  top: var(--point-y);
  left: clamp(0px, calc(var(--point-x) - var(--tooltip-width) / 2), calc(100% - var(--tooltip-width)));
  width: var(--tooltip-width);
  transform: translateY(var(--tooltip-offset));
}

.rate-chart-card__observation-date,
.rate-chart-card__observation-change {
  @apply m-0 text-preset-5 text-fx-neutral-100;
}

.rate-chart-card__observation-rate {
  @apply m-0 break-words text-preset-5-medium tabular-nums text-fx-neutral-50;
}

.rate-chart-card__comparison {
  @apply text-preset-5 text-fx-neutral-100;
}

.rate-chart-card__comparison-controls {
  @apply flex flex-wrap items-center gap-2;
}

.rate-chart-card__pinned-list {
  @apply m-0 grid list-none gap-1 p-0;
}

.rate-chart-card__comparison-change {
  @apply mt-1 text-preset-5-medium text-fx-neutral-50;
}

@media (max-width: 640px) {
  .rate-chart-card {
    --plot-height: 345px;
    @apply gap-5 rounded-[20px] p-4;
  }

  .rate-chart-card__header {
    @apply flex-row items-baseline justify-between gap-3;
  }

  .rate-chart-card__meta {
    @apply whitespace-nowrap text-[12px] tracking-[0.5px];
  }

  .rate-chart-card__plot,
  .rate-chart-card__marker--pinned {
    --point-x: var(--mobile-x);
    --point-y: var(--mobile-y);
  }

  .rate-chart-card__plot {
    --tooltip-offset: var(--mobile-tooltip-offset);
  }

  .rate-chart-card__chart--desktop {
    @apply hidden;
  }

  .rate-chart-card__chart--mobile {
    @apply block;
  }

  .rate-chart-card__y-axis text,
  .rate-chart-card__x-axis text {
    font-size: 14px;
  }
}

@media (max-width: 389px) {
  .rate-chart-card__meta {
    @apply text-[10px];
  }
}

@media (min-width: 640px) and (max-width: 1024px) {
  .rate-chart-card {
    --plot-height: 410px;
    @apply gap-6 rounded-[24px] p-6;
  }

  .rate-chart-card__pair {
    @apply text-[20px] leading-none;
  }

  .rate-chart-card__meta {
    @apply text-preset-4;
  }

  .rate-chart-card__y-axis text,
  .rate-chart-card__x-axis text {
    @apply text-[12px];
  }
}
</style>
