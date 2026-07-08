<script setup lang="ts">
import starFilledIcon from '~/assets/images/star-filled.svg'
import starIcon from '~/assets/images/star.svg'

export type ComparisonItem = {
  code: string
  name: string
  flagSrc: string
  value: string
  rate: string
  favorited?: boolean
}

withDefaults(defineProps<{
  eyebrow?: string
  amountLabel?: string
  pairCountLabel?: string
  items: ComparisonItem[]
}>(), {
  eyebrow: 'Multi-currency',
  amountLabel: '1,000 from USD',
  pairCountLabel: '8 pairs',
})
</script>

<template>
  <article class="comparison-card">
    <header class="comparison-card__header">
      <h3 class="comparison-card__title">
        <span>{{ eyebrow }}</span>
        <strong>{{ amountLabel }}</strong>
      </h3>
      <p class="comparison-card__count">{{ pairCountLabel }}</p>
    </header>

    <ul class="comparison-card__list" aria-label="Currency comparison list">
      <li
        v-for="item in items"
        :key="item.code"
        class="comparison-card__item"
      >
        <div class="comparison-card__currency">
          <img class="comparison-card__flag" :src="item.flagSrc" :alt="`${item.name} flag`">
          <div class="comparison-card__currency-text">
            <p class="comparison-card__primary">{{ item.code }}</p>
            <p class="comparison-card__secondary">{{ item.name }}</p>
          </div>
        </div>

        <div class="comparison-card__rate">
          <p class="comparison-card__value">{{ item.value }}</p>
          <p class="comparison-card__unit">@ {{ item.rate }}</p>
        </div>

        <Button
          icon-only
          variant="favorite"
          :pressed="item.favorited"
          :aria-label="`${item.favorited ? 'Remove' : 'Add'} ${item.code} from favorites`"
          class="comparison-card__favorite"
        >
          <img :src="item.favorited ? starFilledIcon : starIcon" alt="">
        </Button>
      </li>
    </ul>
  </article>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.comparison-card {
  @apply box-border flex h-[651px] w-full min-w-0 flex-col gap-5 overflow-hidden rounded-2xl border border-fx-neutral-600 bg-fx-neutral-700 p-5 text-fx-neutral-50;
}

.comparison-card__header {
  @apply flex items-start justify-between gap-5;
}

.comparison-card__title {
  @apply m-0 flex min-w-0 flex-wrap items-baseline gap-2 text-preset-4 uppercase text-fx-neutral-200;
}

.comparison-card__title strong {
  @apply text-preset-3-medium text-fx-neutral-50;
}

.comparison-card__count {
  @apply m-0 shrink-0 text-preset-5 uppercase text-fx-neutral-50/70;
}

.comparison-card__list {
  @apply m-0 flex min-h-0 list-none flex-col gap-[10px] overflow-y-auto p-0;
}

.comparison-card__item {
  @apply box-border grid h-[61px] shrink-0 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-5 rounded-[10px] border border-fx-neutral-500 bg-fx-neutral-600 px-4 py-3;
}

.comparison-card__currency {
  @apply flex min-w-0 items-center gap-5;
}

.comparison-card__flag {
  @apply size-6 shrink-0 rounded-full object-cover;
}

.comparison-card__currency-text {
  @apply min-w-0;
}

.comparison-card__primary,
.comparison-card__value,
.comparison-card__secondary,
.comparison-card__unit {
  @apply m-0;
}

.comparison-card__primary {
  @apply text-preset-4 text-fx-neutral-50;
}

.comparison-card__secondary {
  @apply truncate text-preset-5 text-fx-neutral-200;
}

.comparison-card__rate {
  @apply grid justify-items-end gap-1;
}

.comparison-card__value {
  @apply text-preset-3-medium text-fx-neutral-50;
}

.comparison-card__unit {
  @apply text-preset-5 text-fx-neutral-200;
}

.comparison-card__favorite {
  @apply shrink-0;
}

@media (max-width: 640px) {
  .comparison-card {
    @apply h-auto min-h-[651px];
  }

  .comparison-card__item {
    @apply h-auto min-h-[61px] grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-2;
  }

  .comparison-card__rate {
    @apply col-start-1 row-start-2 justify-items-start pl-11;
  }

  .comparison-card__favorite {
    @apply col-start-2 row-span-2 row-start-1;
  }
}
</style>
