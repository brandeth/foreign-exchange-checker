<script setup lang="ts">
import arrowRightIcon from '~/assets/images/arrow-right.svg'
import starFilledIcon from '~/assets/images/star-filled.svg'

export type FavoritePair = {
  id?: string
  fromCurrency: string
  toCurrency: string
  exchangeRate: string
  priceChange?: string
  direction?: 'up' | 'down' | 'flat'
}

const directionIcons = { up: '▲', down: '▼', flat: '' }

const props = withDefaults(defineProps<{
  title?: string
  countLabel?: string
  items: FavoritePair[]
}>(), {
  title: 'Pinned pairs',
  countLabel: undefined,
})

const visibleCountLabel = computed(() => props.countLabel ?? `${props.items.length} favorites`)
const emit = defineEmits<{ remove: [item: FavoritePair]; select: [item: FavoritePair] }>()
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
        <button
          type="button"
          class="favorites-card__select"
          :aria-label="`Show ${item.fromCurrency} to ${item.toCurrency} in converter, rate ${item.exchangeRate}${item.priceChange ? `, ${item.priceChange} since previous day` : ''}`"
          @click="emit('select', item)"
        >
          <span class="favorites-card__pair">
            <span class="favorites-card__currency">{{ item.fromCurrency }}</span>
            <img class="favorites-card__arrow" :src="arrowRightIcon" alt="">
            <span class="favorites-card__currency">{{ item.toCurrency }}</span>
          </span>

          <span class="favorites-card__rate">
            <span class="favorites-card__value">{{ item.exchangeRate }}</span>
            <span
              v-if="item.priceChange"
              class="favorites-card__change"
              :class="item.direction && `favorites-card__change--${item.direction}`"
            >
              <span v-if="item.direction && directionIcons[item.direction]" aria-hidden="true">{{ directionIcons[item.direction] }}</span>
              {{ item.priceChange }}
            </span>
          </span>
        </button>

        <div class="favorites-card__meta">
          <Button
            icon-only
            variant="favorite"
            pressed
            :aria-label="`Remove ${item.fromCurrency} to ${item.toCurrency} from favorites`"
            class="favorites-card__favorite"
            @click="emit('remove', item)"
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
  @apply box-border grid h-[59px] shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-5 rounded-[10px] border border-fx-neutral-500 bg-fx-neutral-600 px-4 py-3 transition-colors duration-200 ease-in-out;
}

.favorites-card__item:has(.favorites-card__select:hover) {
  @apply border-fx-neutral-300 bg-fx-neutral-500;
}

.favorites-card__select {
  @apply flex h-full min-w-0 cursor-pointer items-center justify-between gap-5 rounded-sm border-0 bg-transparent p-0 text-left text-fx-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fx-lime-500;
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

.favorites-card__change--up {
  @apply text-fx-green-500;
}

.favorites-card__change--down {
  @apply text-fx-red-500;
}

.favorites-card__favorite {
  @apply shrink-0;
}

@media (max-width: 640px) {
  .favorites-card__item {
    @apply h-auto min-h-[59px];
  }

  .favorites-card__select {
    @apply grid justify-items-start gap-2;
  }

  .favorites-card__rate {
    @apply min-w-0 justify-items-start;
  }
}
</style>
