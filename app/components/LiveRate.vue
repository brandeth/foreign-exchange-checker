<script setup lang="ts">
const props = withDefaults(defineProps<{
  pair: string
  rate: string
  change: string
  direction?: 'up' | 'down'
}>(), {
  direction: 'up',
})

const changeLabel = computed(() => `${props.pair} ${props.rate}, ${props.direction === 'up' ? 'up' : 'down'} ${props.change}`)
</script>

<template>
  <div class="live-rate" :class="`live-rate--${direction}`" :aria-label="changeLabel">
    <span class="live-rate__pair">{{ pair }}</span>
    <span class="live-rate__value">{{ rate }}</span>
    <span class="live-rate__change">
      <span class="live-rate__icon" aria-hidden="true" />
      <span>{{ change }}</span>
    </span>
  </div>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.live-rate {
  @apply box-border flex h-full shrink-0 items-center gap-[10px] border-r border-fx-neutral-500 px-5 py-3;
}

.live-rate__pair {
  @apply text-preset-5 uppercase text-fx-neutral-200;
}

.live-rate__value {
  @apply text-preset-5-medium text-fx-neutral-50;
}

.live-rate__change {
  @apply text-preset-5-medium flex items-center gap-[6px];
}

.live-rate--up .live-rate__change {
  @apply text-fx-green-500;
}

.live-rate--down .live-rate__change {
  @apply text-fx-red-500;
}

.live-rate__icon {
  display: inline-block;
  width: 12px;
  height: 12px;
  background-color: currentColor;
  mask: url("~/assets/images/chevron-down.svg") center / contain no-repeat;
}

.live-rate--up .live-rate__icon {
  transform: rotate(180deg);
}
</style>
