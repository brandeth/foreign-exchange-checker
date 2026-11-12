<script setup lang="ts">
import exchangeIcon from '~/assets/images/exchange-icon.svg'
import starIcon from '~/assets/images/star.svg'
import starFilledIcon from '~/assets/images/star-filled.svg'
import verticalExchangeIcon from '~/assets/images/vertical-exchange-icon.svg'
import type { ExchangeRatesResponse } from '../../shared/exchangeRates'
import type { ConversionSnapshot } from '#shared/conversionLog'
import { converterCurrencies, getCurrencyForRegion, getRegionalCurrency } from '#shared/currencies'

const props = withDefaults(defineProps<{
  sendAmount?: string
  sendCurrency?: string
  receiveCurrency?: string
  favorited?: boolean
}>(), {
  sendAmount: '1',
  sendCurrency: 'USD',
})

const { data: rates, loading, error: rateError, stale, refresh } = useExchangeRates(
  () => $fetch<ExchangeRatesResponse>('/api/exchange-rates'),
)
const {
  sendAmount, sendCurrency, receiveCurrency, amountError,
  formattedReceiveAmount, result, rateDates, swapCurrencies, conversionSnapshot,
} = useConverter(props.sendAmount, props.sendCurrency, props.receiveCurrency, rates)
const emit = defineEmits<{
  'pair-change': [pair: { base: string; quote: string }]
  'rates-change': [rates: ExchangeRatesResponse | null]
  'send-change': [send: { amount: number | null; currency: string }]
  'toggle-favorite': []
  'log-conversion': [conversion: ConversionSnapshot]
}>()
const receiveCurrencyKey = 'foreign-exchange-checker:receive-currency'
const locating = ref(false)
const locationMessage = ref('')
let receiveRevision = 0

watch(receiveCurrency, () => { receiveRevision++ }, { flush: 'sync' })
onBeforeUnmount(() => { receiveRevision++ })

function readReceivePreference() {
  try {
    const saved = localStorage.getItem(receiveCurrencyKey)
    if (saved && converterCurrencies.includes(saved)) return saved
  } catch {
    // Use the regional default if storage is unavailable.
  }
}

function selectReceiveCurrency(currency: string | undefined) {
  if (!currency) return
  receiveCurrency.value = currency
  locationMessage.value = ''
  try {
    localStorage.setItem(receiveCurrencyKey, currency)
  } catch {
    // The selection still applies for the current visit.
  }
}

async function useCurrentLocation() {
  if (locating.value) return
  const geolocation = navigator.geolocation
  if (!geolocation) {
    locationMessage.value = 'Location is unavailable. Choose a receive currency from the list.'
    return
  }

  const revision = receiveRevision
  locating.value = true
  locationMessage.value = ''
  try {
    const { coords } = await new Promise<GeolocationPosition>((resolve, reject) => {
      geolocation.getCurrentPosition(resolve, reject, { timeout: 10_000 })
    })
    if (revision !== receiveRevision) return

    const { countryCode } = await $fetch<{ countryCode?: unknown }>(
      'https://api.bigdatacloud.net/data/reverse-geocode-client',
      {
        query: { latitude: coords.latitude, longitude: coords.longitude },
        retry: 0,
        timeout: 8_000,
        cache: 'no-store',
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
      },
    )
    if (revision !== receiveRevision) return

    const currency = typeof countryCode === 'string' ? getCurrencyForRegion(countryCode) : undefined
    if (!currency) {
      locationMessage.value = 'No supported currency was found for your location. Choose one from the list.'
      return
    }
    selectReceiveCurrency(currency)
    locationMessage.value = `Receive currency set to ${currency}.`
  } catch {
    if (revision === receiveRevision) {
      locationMessage.value = 'Could not use your location. Choose a receive currency from the list.'
    }
  } finally {
    locating.value = false
  }
}

onMounted(() => {
  if (!props.receiveCurrency) {
    const { timeZone } = Intl.DateTimeFormat().resolvedOptions()
    receiveCurrency.value = readReceivePreference()
      ?? getRegionalCurrency(navigator.languages, timeZone)
      ?? receiveCurrency.value
  }
  void refresh()
})
watch(rates, value => emit('rates-change', value))
watch([sendAmount, amountError, sendCurrency], ([amount, error, currency]) => {
  emit('send-change', { amount: amount.trim() && !error ? Number(amount) : null, currency })
}, { immediate: true })
watch([sendCurrency, receiveCurrency], ([base, quote]) => {
  emit('pair-change', { base, quote })
}, { immediate: true })
// Amounts use a monospace font, so the character count tells CSS how small
// the text must be to show every digit instead of cutting it off with "…".
function amountFitStyle(value: string, extraChars = 0) {
  return { '--amount-chars': Math.max(value.length + extraChars, 4) }
}
const converterId = useId()
const logMessage = ref('')
const canLog = computed(() => !loading.value && conversionSnapshot.value !== null)
function logConversion() {
  if (!canLog.value || !conversionSnapshot.value) return
  emit('log-conversion', { ...conversionSnapshot.value, stale: stale.value })
  logMessage.value = 'Conversion added to the Log tab.'
}
watch([sendAmount, sendCurrency, receiveCurrency], () => { logMessage.value = '' })
</script>

<template>
  <section class="check-rate" :aria-labelledby="`${converterId}-title`">
    <h2 :id="`${converterId}-title`" class="check-rate__title">Check The Rate</h2>

    <div class="check-rate__card">
      <div class="check-rate__fields">
        <div class="check-rate__field">
          <label :for="`${converterId}-amount`" class="check-rate__label">Send</label>
          <div class="check-rate__value-row">
            <div class="check-rate__amount-box">
              <input
                :id="`${converterId}-amount`"
                v-model="sendAmount"
                type="text"
                inputmode="decimal"
                autocomplete="off"
                spellcheck="false"
                class="check-rate__amount check-rate__amount-input"
                :style="amountFitStyle(sendAmount, 1)"
                :aria-invalid="!!amountError"
                :aria-describedby="`${converterId}-feedback`"
              >
            </div>
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
            <div class="check-rate__amount-box">
              <output
                class="check-rate__amount check-rate__amount--receive"
                :style="amountFitStyle(formattedReceiveAmount)"
                aria-label="Receive amount"
                aria-live="polite"
              ><template v-for="(group, index) in formattedReceiveAmount.split(',')" :key="index">{{ index ? ',' : '' }}<wbr v-if="index">{{ group }}</template></output>
            </div>
            <CurrencyDropdown
              :model-value="receiveCurrency"
              aria-label="Receive currency"
              @update:model-value="selectReceiveCurrency"
            />
          </div>
        </div>
      </div>

      <div class="check-rate__footer">
        <div class="check-rate__summary">
          <p class="check-rate__result">
            {{ loading && !rates && sendCurrency !== receiveCurrency ? 'Loading exchange rates…' : result }}
          </p>
          <div class="check-rate__actions">
            <Button
              variant="favorite"
              :pressed="favorited"
              :aria-label="`${favorited ? 'Remove' : 'Add'} ${sendCurrency} to ${receiveCurrency} ${favorited ? 'from' : 'to'} favorites`"
              @click="emit('toggle-favorite')"
            >
              <img :src="favorited ? starFilledIcon : starIcon" alt="">
              <span class="check-rate__action-label">{{ favorited ? 'Favorited' : 'Favorite' }}</span>
            </Button>
            <Button :disabled="!canLog" @click="logConversion">
              <span class="check-rate__action-label">Log Conversion</span>
            </Button>
          </div>
        </div>

        <p :id="`${converterId}-feedback`" aria-live="polite" :class="{ 'pb-3 text-fx-red-500': amountError }">{{ amountError }}</p>
        <p :class="{ 'pb-3 text-fx-neutral-200': logMessage }" role="status">{{ logMessage }}</p>

        <div class="check-rate__details">
          <div class="min-w-0">
            <h3 class="check-rate__detail-title">Rate details</h3>
            <dl v-if="rates || rateDates" class="mt-2 grid gap-1">
              <div v-if="rates" class="check-rate__detail-row">
                <dt>Source</dt>
                <dd><a href="https://frankfurter.dev/" target="_blank" rel="noopener noreferrer" class="underline underline-offset-2">Frankfurter</a></dd>
              </div>
              <div v-if="rateDates && sendCurrency !== receiveCurrency" class="check-rate__detail-row">
                <dt>Rate dates</dt>
                <dd>{{ rateDates }}</dd>
              </div>
              <div v-if="rates" class="check-rate__detail-row">
                <dt>Last fetched</dt>
                <dd><time :datetime="rates.fetchedAt">{{ rates.fetchedAt.replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC') }}</time></dd>
              </div>
            </dl>
            <p v-if="rateDates && sendCurrency === receiveCurrency" class="mt-2">{{ rateDates }}</p>
            <div role="status" aria-live="polite">
              <p v-if="rateError || stale" class="mt-2 text-fx-red-500">{{ rateError || 'Could not refresh rates. Showing cached rates.' }}</p>
              <p v-if="loading" class="mt-2">{{ rates ? 'Refreshing rates…' : 'Waiting for rates…' }}</p>
            </div>
            <Button v-if="rateError || stale" class="mt-2" :disabled="loading" @click="refresh">{{ loading ? 'Retrying…' : 'Retry' }}</Button>
          </div>
          <div class="min-w-0">
            <h3 class="check-rate__detail-title">Local currency</h3>
            <p :id="`${converterId}-location-info`" class="mt-2">
              With your permission, sends your coordinates to BigDataCloud to identify your local currency.
            </p>
            <Button
              variant="clear"
              class="check-rate__location-button mt-3"
              :disabled="locating"
              :aria-describedby="`${converterId}-location-info`"
              @click="useCurrentLocation"
            >
              {{ locating ? 'Finding your currency…' : 'Use my location' }}
            </Button>
            <p role="status" :class="{ 'mt-2': locationMessage }">{{ locationMessage }}</p>
          </div>
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
  --check-rate-gutter: 1.25rem;
  @apply overflow-hidden rounded-[20px] bg-fx-neutral-700;
}

.check-rate__fields {
  @apply grid items-center gap-5 py-5 lg:grid-cols-[minmax(0,1fr)_48px_minmax(0,1fr)];
  padding-inline: var(--check-rate-gutter);
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

.check-rate__amount-box {
  @apply min-w-0 flex-1;
  container-type: inline-size;
}

/*
 * Shrink long amounts to fit the box. JetBrains Mono glyphs are 0.6em wide,
 * so 100cqi / (chars × 0.6) is the largest size that fits on one line. Below
 * the minimum size, the value wraps rather than hiding digits: the receive
 * amount only breaks after a thousands separator, so each group stays whole.
 */
.check-rate__amount {
  --amount-max-size: 40px;
  @apply block w-full text-preset-1 text-fx-neutral-50;
  font-size: clamp(16px, calc(100cqi / (var(--amount-chars, 4) * 0.6)), var(--amount-max-size));
}

.check-rate__amount--receive {
  @apply text-fx-lime-500;
  line-height: 1.15;
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
  @apply border-t border-dashed border-fx-neutral-500 text-preset-5;
  padding-inline: var(--check-rate-gutter);
}

.check-rate__summary {
  @apply flex flex-col items-center gap-3 py-4 text-center sm:flex-row sm:flex-wrap sm:text-left;
}

.check-rate__result {
  @apply min-w-0 break-words text-preset-5 text-fx-neutral-50;
}

.check-rate__actions {
  @apply flex max-w-full flex-wrap items-center justify-center gap-3 sm:ml-auto sm:justify-end;
}

.check-rate__action-label {
  @apply leading-4;
}

.check-rate__details {
  @apply grid gap-4 border-t border-fx-neutral-500 py-4 text-fx-neutral-200 sm:grid-cols-2 sm:gap-6;
}

.check-rate__detail-title {
  @apply text-preset-5-medium text-fx-neutral-50;
}

.check-rate__detail-row {
  @apply grid grid-cols-[6.5rem_minmax(0,1fr)] gap-2;
}

.check-rate__detail-row dd {
  @apply text-fx-neutral-100;
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
    --check-rate-gutter: 1.5rem;
    @apply rounded-[24px];
  }

  .check-rate__fields {
    @apply gap-6 py-6;
  }

  .check-rate__field {
    @apply h-auto justify-start gap-5 p-4;
  }

  .check-rate__amount {
    --amount-max-size: 32px;
  }

  .check-rate__value-row {
    @apply items-center gap-2.5;
  }

  .check-rate__actions {
    @apply gap-2;
  }

  .check-rate__actions :deep(.fx-button) {
    @apply h-8 py-0 text-preset-5-medium whitespace-nowrap uppercase;
  }

  .check-rate__actions :deep(.fx-button img) {
    @apply size-4;
  }

  .check-rate__location-button {
    @apply w-full;
  }
}

@media (max-width: 389px) {
  .check-rate__card {
    --check-rate-gutter: 1.25rem;
  }

  .check-rate__fields {
    @apply py-5;
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
    --check-rate-gutter: 1.5rem;
    @apply rounded-[24px];
  }

  .check-rate__fields {
    @apply grid-cols-[minmax(0,1fr)_64px_minmax(0,1fr)] gap-7 py-6;
  }

  .check-rate__field {
    @apply h-[156px] rounded-[20px] p-6;
  }

  .check-rate__label {
    @apply text-preset-3;
  }

  .check-rate__actions {
    @apply gap-4;
  }
}

@media (min-width: 640px) and (max-width: 860px) {
  .check-rate__card {
    --check-rate-gutter: 1.25rem;
  }

  .check-rate__fields {
    @apply grid-cols-[minmax(0,1fr)_48px_minmax(0,1fr)] gap-4 py-5;
  }

  .check-rate__field {
    @apply px-5;
  }

  .check-rate__amount {
    --amount-max-size: 32px;
  }
}
</style>
