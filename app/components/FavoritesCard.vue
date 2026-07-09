<script setup lang="ts">
import arrowRightIcon from '~/assets/images/arrow-right.svg'
import starFilledIcon from '~/assets/images/star-filled.svg'

export type FavoritePair = {
  id?: string
  fromCurrency: string
  toCurrency: string
  exchangeRate: string
  priceChange: string
  increase?: boolean
}

const props = withDefaults(defineProps<{
  title?: string
  countLabel?: string
  items: FavoritePair[]
}>(), {
  title: 'Pinned pairs',
  countLabel: undefined,
})

const visibleCountLabel = computed(() => props.countLabel ?? `${props.items.length} favorites`)
</script>

<template>
  <article class="favorites-card" aria-labelledby="favorites-card-title">
    <header class="favorites-card__header">
      <h3 id="favorites-card-title" class="favorites-card__title">{{ title }}</h3>
      <p class="favorites-card__count">{{ visibleCountLabel }}</p>
    </header>

    <ul class="favorites-card__list" aria-label="Pinned currency pairs">
      <li
        v-for="item in items"
        :key="item.id ?? `${item.fromCurrency}-${item.toCurrency}`"
        class="favorites-card__item"
      >
        <div class="favorites-card__pair">
          <span class="favorites-card__currency">{{ item.fromCurrency }}</span>
          <img class="favorites-card__arrow" :src="arrowRightIcon" alt="">
          <span class="favorites-card__currency">{{ item.toCurrency }}</span>
        </div>

        <div class="favorites-card__meta">
          <div class="favorites-card__rate">
            <p class="favorites-card__value">{{ item.exchangeRate }}</p>
            <p
              class="favorites-card__change"
              :class="item.increase ? 'favorites-card__change--increase' : 'favorites-card__change--decrease'"
            >
              <span aria-hidden="true">{{ item.increase ? '▲' : '▼' }}</span>
              {{ item.priceChange }}
            </p>
          </div>

          <Button
            icon-only
            variant="favorite"
            pressed
            :aria-label="`Remove ${item.fromCurrency} to ${item.toCurrency} from favorites`"
            class="favorites-card__favorite"
          >
            <img :src="starFilledIcon" alt="">
          </Button>
        </div>
      </li>
    </ul>
  </article>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.favorites-card {
  @apply box-border flex h-auto w-full min-w-0 flex-col gap-5 rounded-2xl border border-fx-neutral-600 bg-fx-neutral-700 p-5 text-fx-neutral-50;
}

.favorites-card__header {
  @apply flex items-start justify-between gap-5;
}

.favorites-card__title {
  @apply m-0 text-preset-3 uppercase text-fx-neutral-50;
}

.favorites-card__count {
  @apply m-0 shrink-0 text-preset-6 uppercase text-fx-neutral-200;
}

.favorites-card__list {
  @apply m-0 flex list-none flex-col gap-[14px] p-0;
}

.favorites-card__item {
  @apply box-border grid h-[59px] shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-5 rounded-[10px] border border-fx-neutral-500 bg-fx-neutral-600 px-4 py-3;
}

.favorites-card__pair,
.favorites-card__meta {
  @apply flex min-w-0 items-center gap-5;
}

.favorites-card__currency {
  @apply min-w-0 text-preset-4 uppercase text-fx-neutral-50;
}

.favorites-card__arrow {
  @apply size-[11px] shrink-0;
}

.favorites-card__meta {
  @apply justify-end;
}

.favorites-card__rate {
  @apply grid min-w-[92px] justify-items-end gap-1;
}

.favorites-card__value,
.favorites-card__change {
  @apply m-0;
}

.favorites-card__value {
  @apply text-preset-3 text-fx-neutral-50;
}

.favorites-card__change {
  @apply text-preset-6 text-fx-neutral-200;
}

.favorites-card__change--increase {
  @apply text-fx-green-500;
}

.favorites-card__change--decrease {
  @apply text-fx-red-500;
}

.favorites-card__favorite {
  @apply shrink-0;
}

@media (max-width: 640px) {
  .favorites-card__item {
    @apply h-auto min-h-[59px] grid-cols-1 items-start gap-3;
  }

  .favorites-card__meta {
    @apply w-full justify-between;
  }
}
</style>
