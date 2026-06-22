<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string
  rate: string
  change: string
  direction?: 'up' | 'down'
  spread: string
  fee: string
}>(), {
  direction: 'up',
})

const changeLabel = computed(() => `${props.title} ${props.rate}, ${props.direction === 'up' ? 'up' : 'down'} ${props.change}`)
</script>

<template>
  <article class="rate-card" :aria-label="changeLabel">
    <div class="rate-card__header">
      <div>
        <p class="rate-card__title">{{ title }}</p>
        <p class="rate-card__value">{{ rate }}</p>
      </div>

      <span class="rate-card__change" :class="`rate-card__change--${direction}`">
        {{ change }}
      </span>
    </div>

    <dl class="rate-card__details">
      <div>
        <dt class="rate-card__detail-label">Spread</dt>
        <dd class="rate-card__detail-value">{{ spread }}</dd>
      </div>

      <div>
        <dt class="rate-card__detail-label">Fee</dt>
        <dd class="rate-card__detail-value">{{ fee }}</dd>
      </div>
    </dl>
  </article>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.rate-card {
  @apply grid gap-4 border border-fx-lime-800 bg-fx-neutral-900 p-4;
}

.rate-card__header {
  @apply flex items-start justify-between gap-4;
}

.rate-card__title {
  @apply text-preset-5-medium uppercase text-fx-neutral-100;
}

.rate-card__value {
  @apply text-preset-1-tablet text-fx-neutral-50;
}

.rate-card__change {
  @apply text-preset-6 shrink-0 px-2 py-1 text-fx-neutral-900;
}

.rate-card__change--up {
  @apply bg-fx-green-500;
}

.rate-card__change--down {
  @apply bg-fx-red-500;
}

.rate-card__details {
  @apply grid grid-cols-2 gap-3 border-t border-fx-neutral-400 pt-4;
}

.rate-card__detail-label {
  @apply text-preset-6 uppercase text-fx-neutral-200;
}

.rate-card__detail-value {
  @apply text-preset-4 text-fx-neutral-50;
}
</style>
