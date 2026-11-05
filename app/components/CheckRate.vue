<script setup lang="ts">
import exchangeIcon from '~/assets/images/exchange-icon.svg'
import starFilledIcon from '~/assets/images/star-filled.svg'
import verticalExchangeIcon from '~/assets/images/vertical-exchange-icon.svg'
import type { ExchangeRatesResponse } from '../../shared/exchangeRates'

const props = withDefaults(defineProps<{
  sendAmount?: string
  sendCurrency?: string
  receiveCurrency?: string
}>(), {
  sendAmount: '1000',
  sendCurrency: 'USD',
  receiveCurrency: 'EUR',
})

const { data: rates, loading, error: rateError, stale, refresh } = useExchangeRates(
  () => $fetch<ExchangeRatesResponse>('/api/exchange-rates'),
)
onMounted(() => { void refresh() })

const {
  sendAmount, sendCurrency, receiveCurrency, amountError,
  formattedReceiveAmount, result, rateDates, swapCurrencies,
} = useConverter(props.sendAmount, props.sendCurrency, props.receiveCurrency, rates)
const emit = defineEmits<{
  'pair-change': [pair: { base: string; quote: string }]
}>()
watch([sendCurrency, receiveCurrency], ([base, quote]) => {
  emit('pair-change', { base, quote })
}, { immediate: true })
const converterId = useId()
const isFavorited = ref(true)
</script>

<template>
  <section class="check-rate" :aria-labelledby="`${converterId}-title`">
    <h2 :id="`${converterId}-title`" class="check-rate__title">Check The Rate</h2>

    <div class="check-rate__card">
      <div class="check-rate__fields">
        <div class="check-rate__field">
          <label :for="`${converterId}-amount`" class="check-rate__label">Send</label>
          <div class="check-rate__value-row">
            <input
              :id="`${converterId}-amount`"
              v-model="sendAmount"
              type="text"
              inputmode="decimal"
              autocomplete="off"
              spellcheck="false"
              class="check-rate__amount check-rate__amount-input"
              :aria-invalid="!!amountError"
              :aria-describedby="`${converterId}-feedback`"
            >
            <CurrencyDropdown v-model="sendCurrency" aria-label="Send currency" />
          </div>
        </div>

        <Button
          icon-only
          variant="exchange"
          class="check-rate__exchange"
          aria-label="Swap currencies"
          @click="swapCurrencies"
        >
          <img :src="exchangeIcon" alt="" class="check-rate__exchange-icon check-rate__exchange-icon--desktop">
          <img :src="verticalExchangeIcon" alt="" class="check-rate__exchange-icon check-rate__exchange-icon--mobile">
        </Button>

        <div class="check-rate__field">
          <span class="check-rate__label">Receive</span>
          <div class="check-rate__value-row">
            <output class="check-rate__amount check-rate__amount--receive" aria-label="Receive amount" aria-live="polite">
              {{ formattedReceiveAmount }}
            </output>
            <CurrencyDropdown v-model="receiveCurrency" aria-label="Receive currency" />
          </div>
        </div>
      </div>

      <div class="check-rate__footer">
        <div class="check-rate__result">
          <p>{{ loading && !rates && sendCurrency !== receiveCurrency ? 'Loading exchange rates…' : result }}</p>
          <p v-if="rates" class="mt-2 text-fx-neutral-200">
            Daily rates from <a href="https://frankfurter.dev/" target="_blank" rel="noopener noreferrer" class="underline">Frankfurter</a>
          </p>
          <p v-if="rateDates" class="mt-2 text-fx-neutral-200">{{ sendCurrency !== receiveCurrency ? 'Rate dates · ' : '' }}{{ rateDates }}</p>
          <p v-if="rates" class="mt-2 text-fx-neutral-200">Last fetched: {{ rates.fetchedAt.replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC') }}</p>
          <div role="status" aria-live="polite" class="mt-2">
            <p v-if="rateError || stale" class="text-fx-red-500">{{ rateError || 'Could not refresh rates. Showing cached rates.' }}</p>
            <p v-if="loading && rates" class="text-fx-neutral-200">Refreshing rates…</p>
          </div>
          <Button v-if="rateError || stale" class="mt-2" :disabled="loading" @click="refresh">{{ loading ? 'Retrying…' : 'Retry' }}</Button>
          <p :id="`${converterId}-feedback`" aria-live="polite" :class="{ 'mt-2 text-fx-red-500': amountError }">{{ amountError }}</p>
        </div>

        <div class="check-rate__actions">
          <Button
            variant="favorite"
            :pressed="isFavorited"
            :aria-label="isFavorited ? 'Remove conversion from favorites' : 'Add conversion to favorites'"
            @click="isFavorited = !isFavorited"
          >
            <img :src="starFilledIcon" alt="">
            {{ isFavorited ? 'Favorited' : 'Favorite' }}
          </Button>
          <Button>Log Conversion</Button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.check-rate {
  @apply grid gap-4;
}

.check-rate__title {
  @apply text-preset-2 uppercase text-fx-neutral-50;
}

.check-rate__card {
  @apply overflow-hidden rounded-[20px] bg-fx-neutral-700;
}

.check-rate__fields {
  @apply grid items-center gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_48px_minmax(0,1fr)];
}

.check-rate__field {
  @apply flex h-[118px] min-w-0 flex-col justify-between rounded-2xl border border-fx-neutral-500 bg-fx-neutral-600 p-5;
}

.check-rate__label {
  @apply text-preset-4 uppercase text-fx-neutral-100;
}

.check-rate__value-row {
  @apply flex min-w-0 items-end justify-between gap-4;
}

.check-rate__amount {
  @apply min-w-0 truncate text-preset-1 text-fx-neutral-50;
}

.check-rate__amount--receive {
  @apply text-fx-lime-500;
}

.check-rate__amount-input {
  @apply w-full flex-1 rounded-sm bg-transparent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fx-lime-500;
}

.check-rate__exchange {
  @apply justify-self-center;
}

.check-rate__exchange-icon--mobile {
  @apply hidden;
}

.check-rate__footer {
  @apply flex flex-col gap-4 border-t border-dashed border-fx-neutral-500 px-5 py-4 md:flex-row md:items-center md:justify-between;
}

.check-rate__result {
  @apply text-preset-5 text-fx-neutral-50;
}

.check-rate__actions {
  @apply flex flex-wrap items-center gap-3;
}

@media (max-width: 639px) {
  .check-rate__exchange-icon--desktop {
    @apply hidden;
  }

  .check-rate__exchange-icon--mobile {
    @apply block;
  }

  .check-rate {
    @apply gap-6;
  }

  .check-rate__title {
    @apply text-[24px] leading-none;
  }

  .check-rate__card {
    @apply rounded-[24px];
  }

  .check-rate__fields {
    @apply gap-6 p-6;
  }

  .check-rate__field {
    @apply h-[162px] rounded-[20px] p-6;
  }

  .check-rate__label {
    @apply text-preset-3;
  }

  .check-rate__amount {
    @apply text-preset-1;
  }

  .check-rate__value-row {
    @apply gap-2;
  }

  .check-rate__footer {
    @apply items-center gap-4 px-6 py-5 text-center;
  }

  .check-rate__result {
    @apply text-preset-5;
  }

  .check-rate__actions {
    @apply w-full flex-nowrap justify-center;
  }

  .check-rate__actions :deep(.fx-button) {
    @apply min-w-0 flex-1;
  }
}

@media (max-width: 389px) {
  .check-rate__fields {
    @apply p-5;
  }

  .check-rate__field {
    @apply px-5;
  }

  .check-rate__amount {
    @apply text-preset-1-tablet;
  }

  .check-rate__footer {
    @apply px-5;
  }
}

@media (min-width: 640px) and (max-width: 1024px) {
  .check-rate {
    @apply gap-6;
  }

  .check-rate__title {
    @apply text-[24px] leading-none;
  }

  .check-rate__card {
    @apply rounded-[24px];
  }

  .check-rate__fields {
    @apply grid-cols-[minmax(0,1fr)_64px_minmax(0,1fr)] gap-7 p-6;
  }

  .check-rate__field {
    @apply h-[156px] rounded-[20px] p-6;
  }

  .check-rate__label {
    @apply text-preset-3;
  }

  .check-rate__footer {
    @apply min-h-[88px] flex-row items-center justify-between gap-5 px-6 py-5;
  }

  .check-rate__result {
    @apply text-preset-4;
  }

  .check-rate__actions {
    @apply flex-nowrap gap-4;
  }
}

@media (min-width: 640px) and (max-width: 860px) {
  .check-rate__fields {
    @apply grid-cols-[minmax(0,1fr)_48px_minmax(0,1fr)] gap-4 p-5;
  }

  .check-rate__field {
    @apply px-5;
  }

  .check-rate__amount {
    @apply text-preset-1-tablet;
  }
}
</style>
