<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import LiveRate from '~/components/LiveRate.vue'

type LiveMarketRate = {
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

const props = withDefaults(defineProps<{
  rates?: LiveMarketRate[]
  marquee?: boolean
}>(), {
  marquee: true,
})

const displayRates = computed(() => props.rates ?? defaultRates)
const rateGroups = computed(() => props.marquee ? [displayRates.value, displayRates.value] : [displayRates.value])
const marketBar = ref<HTMLElement | null>(null)
const track = ref<HTMLElement | null>(null)
const marqueeOffset = ref(0)

let animationFrame = 0
let lastFrameTime = 0
let baseSpeed = 0
let currentSpeedMultiplier = 1
let targetSpeedMultiplier = 1
let reduceMotion = false
let resizeObserver: ResizeObserver | undefined

const trackStyle = computed(() => props.marquee
  ? { transform: `translateX(${-marqueeOffset.value}px)` }
  : undefined,
)

function measureMarquee() {
  const marqueeWidth = (track.value?.scrollWidth ?? 0) / 2

  baseSpeed = marqueeWidth / 34000

  if (marqueeWidth > 0 && marqueeOffset.value >= marqueeWidth)
    marqueeOffset.value %= marqueeWidth
}

function updateMarquee(time: number) {
  if (!lastFrameTime)
    lastFrameTime = time

  const elapsed = time - lastFrameTime
  lastFrameTime = time
  targetSpeedMultiplier = marketBar.value?.matches(':hover') ? 0 : 1
  currentSpeedMultiplier += (targetSpeedMultiplier - currentSpeedMultiplier) * Math.min(elapsed / 500, 1)

  if (Math.abs(targetSpeedMultiplier - currentSpeedMultiplier) < 0.001)
    currentSpeedMultiplier = targetSpeedMultiplier

  const marqueeWidth = (track.value?.scrollWidth ?? 0) / 2

  if (marqueeWidth > 0 && baseSpeed > 0) {
    marqueeOffset.value = (marqueeOffset.value + baseSpeed * currentSpeedMultiplier * elapsed) % marqueeWidth
  }

  animationFrame = requestAnimationFrame(updateMarquee)
}

function startMarqueeLoop() {
  cancelAnimationFrame(animationFrame)
  lastFrameTime = 0
  measureMarquee()

  if (props.marquee && !reduceMotion)
    animationFrame = requestAnimationFrame(updateMarquee)
}

function setMarqueeTargetSpeed(speed: number) {
  targetSpeedMultiplier = speed
}

onMounted(() => {
  reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  resizeObserver = new ResizeObserver(measureMarquee)

  if (track.value) {
    resizeObserver.observe(track.value)
  }

  nextTick(startMarqueeLoop)
})

watch(() => props.marquee, startMarqueeLoop)

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrame)
  resizeObserver?.disconnect()
})
</script>

<template>
  <section
    ref="marketBar"
    class="live-markets"
    aria-label="Live markets"
    @mouseenter="setMarqueeTargetSpeed(0)"
    @mouseleave="setMarqueeTargetSpeed(1)"
  >
    <div class="live-markets__label">
      <span class="live-markets__dot" aria-hidden="true" />
      <span>Live Markets</span>
    </div>

    <div class="live-markets__viewport">
      <div ref="track" class="live-markets__track" :style="trackStyle">
        <div
          v-for="(group, groupIndex) in rateGroups"
          :key="groupIndex"
          class="live-markets__group"
          :aria-hidden="groupIndex > 0 ? 'true' : undefined"
        >
          <LiveRate
            v-for="rate in group"
            :key="`${groupIndex}-${rate.pair}`"
            :pair="rate.pair"
            :rate="rate.rate"
            :change="rate.change"
            :direction="rate.direction"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.live-markets {
  @apply flex h-10 w-full min-w-0 overflow-hidden bg-fx-neutral-700;
}

.live-markets__label {
  @apply text-preset-5-medium box-border flex h-10 shrink-0 items-center gap-[10px] bg-fx-lime-500 px-5 py-3 uppercase text-fx-neutral-900;
}

.live-markets__dot {
  @apply size-1.5 rounded-full bg-fx-neutral-900;
}

.live-markets__viewport {
  @apply min-w-0 flex-1 overflow-hidden;
}

.live-markets__track {
  @apply flex h-full w-max;
}

.live-markets__group {
  @apply flex h-full shrink-0;
}

</style>
