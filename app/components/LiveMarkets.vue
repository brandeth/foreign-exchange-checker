<script setup lang="ts">
import { computed } from 'vue'
import LiveRate from '~/components/LiveRate.vue'
import type { LiveMarketRate } from '~/composables/useLiveMarketRates'

const props = withDefaults(defineProps<{
  rates?: LiveMarketRate[]
  marquee?: boolean
}>(), {
  marquee: true,
})

const { displayRates } = useLiveMarketRates(computed(() => props.rates))
const rateGroups = computed(() => props.marquee ? [displayRates.value, displayRates.value] : [displayRates.value])
const {
  container: marketBar,
  track,
  trackStyle,
  setTargetSpeed: setMarqueeTargetSpeed,
} = useMarquee({
  enabled: computed(() => props.marquee),
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
