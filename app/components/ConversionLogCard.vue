<script setup lang="ts">
import arrowRightIcon from '~/assets/images/arrow-right.svg'
import deleteFilledIcon from '~/assets/images/delete-filled.svg'
import deleteIcon from '~/assets/images/delete.svg'

export type ConversionLogItem = {
  id: string
  timestampLabel: string
  fromCurrency: string
  toCurrency: string
  fromAmount: string
  toAmount: string
}

const props = withDefaults(defineProps<{
  title?: string
  countLabel?: string
  items: ConversionLogItem[]
}>(), {
  title: 'Conversion log',
  countLabel: undefined,
})

const emit = defineEmits<{
  remove: [id: string]
  clear: []
}>()

const visibleCountLabel = computed(() => props.countLabel ?? `${props.items.length} logged`)
</script>

<template>
  <article class="conversion-log-card" aria-labelledby="conversion-log-card-title">
    <header class="conversion-log-card__header">
      <h3 id="conversion-log-card-title" class="conversion-log-card__title">{{ title }}</h3>

      <div class="conversion-log-card__summary">
        <p class="conversion-log-card__count" aria-live="polite">{{ visibleCountLabel }}</p>
        <Button
          variant="clear"
          :disabled="items.length === 0"
          aria-label="Clear all conversion logs"
          @click="emit('clear')"
        >
          Clear All
        </Button>
      </div>
    </header>

    <ul v-if="items.length" class="conversion-log-card__list" aria-label="Conversion log entries">
      <li
        v-for="item in items"
        :key="item.id"
        class="conversion-log-card__item"
      >
        <time class="conversion-log-card__time">{{ item.timestampLabel }}</time>

        <div class="conversion-log-card__pair">
          <span>{{ item.fromCurrency }}</span>
          <img class="conversion-log-card__arrow" :src="arrowRightIcon" alt="">
          <span>{{ item.toCurrency }}</span>
        </div>

        <p class="conversion-log-card__amount conversion-log-card__amount--source">
          <span class="sr-only">{{ item.fromCurrency }} amount:</span>
          {{ item.fromAmount }}
        </p>

        <p class="conversion-log-card__amount conversion-log-card__amount--converted">
          <span class="sr-only">{{ item.toCurrency }} amount:</span>
          {{ item.toAmount }}
        </p>

        <Button
          icon-only
          variant="delete"
          :aria-label="`Delete ${item.fromCurrency} to ${item.toCurrency} conversion from log`"
          class="conversion-log-card__delete"
          @click="emit('remove', item.id)"
        >
          <span class="fx-button__icon-stack" aria-hidden="true">
            <img :src="deleteIcon" alt="" class="fx-button__icon-default">
            <img :src="deleteFilledIcon" alt="" class="fx-button__icon-hover">
          </span>
        </Button>
      </li>
    </ul>

    <p v-else class="conversion-log-card__empty" aria-live="polite">
      No conversions logged yet.
    </p>
  </article>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.conversion-log-card {
  @apply box-border flex h-auto w-full min-w-0 flex-col gap-5 rounded-2xl border border-fx-neutral-600 bg-fx-neutral-700 p-5 text-fx-neutral-50;
}

.conversion-log-card__header {
  @apply flex items-center justify-between gap-5;
}

.conversion-log-card__title {
  @apply m-0 text-preset-3 uppercase text-fx-neutral-50;
}

.conversion-log-card__summary {
  @apply flex shrink-0 items-center gap-4;
}

.conversion-log-card__count {
  @apply m-0 text-preset-6 uppercase text-fx-neutral-200;
}

.conversion-log-card__list {
  @apply m-0 flex list-none flex-col gap-[14px] p-0;
}

.conversion-log-card__item {
  @apply box-border grid min-h-[59px] grid-cols-[54px_minmax(140px,1fr)_auto_auto_auto] items-center gap-4 rounded-[10px] border border-fx-neutral-500 bg-fx-neutral-600 px-4 py-3;
}

.conversion-log-card__time {
  @apply text-preset-4 text-fx-neutral-200;
}

.conversion-log-card__pair {
  @apply flex min-w-0 items-center gap-3 text-preset-4 uppercase text-fx-neutral-50;
}

.conversion-log-card__arrow {
  @apply size-[11px] shrink-0;
}

.conversion-log-card__amount {
  @apply m-0 min-w-[86px] text-right text-preset-4;
}

.conversion-log-card__amount--source {
  @apply text-fx-neutral-100;
}

.conversion-log-card__amount--converted {
  @apply text-fx-lime-500;
}

.conversion-log-card__delete {
  @apply shrink-0;
}

.conversion-log-card__empty {
  @apply m-0 rounded-[10px] border border-fx-neutral-500 bg-fx-neutral-600 px-4 py-8 text-center text-preset-4 text-fx-neutral-200;
}

@media (max-width: 768px) {
  .conversion-log-card__item {
    @apply grid-cols-[auto_minmax(0,1fr)_auto];
  }

  .conversion-log-card__pair {
    @apply col-span-2;
  }

  .conversion-log-card__time {
    @apply col-start-1 row-start-2;
  }

  .conversion-log-card__amount--source {
    @apply col-start-2 row-start-2 justify-self-end;
  }

  .conversion-log-card__amount--converted {
    @apply col-start-2 row-start-3 justify-self-end;
  }

  .conversion-log-card__delete {
    @apply col-start-3 row-span-3 row-start-1;
  }
}

@media (max-width: 480px) {
  .conversion-log-card__header {
    @apply items-start;
  }

  .conversion-log-card__summary {
    @apply flex-col items-end gap-2;
  }

  .conversion-log-card__item {
    @apply gap-x-3;
  }

  .conversion-log-card__amount {
    @apply min-w-0;
  }
}
</style>
