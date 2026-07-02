<script setup lang="ts">
import exchangeIcon from '~/assets/images/exchange-icon.svg'
import starFilledIcon from '~/assets/images/star-filled.svg'

withDefaults(defineProps<{
  sendAmount?: string
  receiveAmount?: string
  sendCurrency?: string
  receiveCurrency?: string
  result?: string
}>(), {
  sendAmount: '1,000',
  receiveAmount: '853.02',
  sendCurrency: 'USD',
  receiveCurrency: 'EUR',
  result: '1 USD = 0.8530 EUR',
})

const isFavorited = ref(true)
</script>

<template>
  <section class="check-rate" aria-labelledby="check-rate-title">
    <h2 id="check-rate-title" class="check-rate__title">Check The Rate</h2>

    <div class="check-rate__card">
      <div class="check-rate__fields">
        <div class="check-rate__field">
          <span class="check-rate__label">Send</span>
          <div class="check-rate__value-row">
            <strong class="check-rate__amount">{{ sendAmount }}</strong>
            <CurrencyDropdown :initial-currency="sendCurrency" />
          </div>
        </div>

        <Button
          icon-only
          variant="exchange"
          class="check-rate__exchange"
          aria-label="Swap currencies"
        >
          <img :src="exchangeIcon" alt="">
        </Button>

        <div class="check-rate__field">
          <span class="check-rate__label">Receive</span>
          <div class="check-rate__value-row">
            <strong class="check-rate__amount check-rate__amount--receive">
              {{ receiveAmount }}
            </strong>
            <CurrencyDropdown :initial-currency="receiveCurrency" />
          </div>
        </div>
      </div>

      <div class="check-rate__footer">
        <p class="check-rate__result">{{ result }}</p>

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

.check-rate__exchange {
  @apply justify-self-center;
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
  .check-rate__amount {
    @apply text-preset-1-tablet;
  }
}
</style>
