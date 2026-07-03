<script setup lang="ts">
withDefaults(defineProps<{
  label: string
  value: string
  increase?: boolean
  showIndicator?: boolean
}>(), {
  increase: false,
  showIndicator: false,
})
</script>

<template>
  <dl class="rate-metric-card">
    <dt class="rate-metric-card__label">{{ label }}</dt>
    <dd
      class="rate-metric-card__value"
      :class="{ 'rate-metric-card__value--increase': increase }"
    >
      <span v-if="showIndicator" aria-hidden="true">▲</span>
      <span>{{ value }}</span>
    </dd>
  </dl>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.rate-metric-card {
  @apply box-border flex h-[81px] w-full max-w-[140px] flex-col justify-between rounded-2xl border border-fx-neutral-600 bg-fx-neutral-700 px-5 py-3;
}

.rate-metric-card__label {
  @apply text-preset-4 uppercase text-fx-neutral-50/70;
}

.rate-metric-card__value {
  @apply flex items-center gap-2 text-preset-2 text-fx-neutral-50;
}

.rate-metric-card__value--increase {
  @apply text-fx-green-500;
}
</style>
