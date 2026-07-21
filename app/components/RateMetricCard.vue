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

@media (max-width: 639px) {
  .rate-metric-card {
    @apply h-[108px] max-w-none rounded-[20px] px-6 py-5;
  }

  .rate-metric-card__label {
    @apply text-preset-3;
  }

  .rate-metric-card__value {
    @apply text-[24px] leading-none;
  }
}

@media (max-width: 389px) {
  .rate-metric-card {
    @apply px-4;
  }

  .rate-metric-card__value {
    @apply text-preset-2;
  }
}

@media (min-width: 640px) and (max-width: 1024px) {
  .rate-metric-card {
    @apply h-[108px] max-w-none rounded-[20px] px-6 py-5;
  }

  .rate-metric-card__label {
    @apply text-preset-3;
  }

  .rate-metric-card__value {
    @apply text-[24px] leading-none;
  }
}

@media (min-width: 640px) and (max-width: 860px) {
  .rate-metric-card {
    @apply px-4;
  }

  .rate-metric-card__value {
    @apply text-preset-2;
  }
}
</style>
