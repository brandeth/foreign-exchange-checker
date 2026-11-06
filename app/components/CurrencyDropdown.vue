<script setup lang="ts">
import chevronDownIcon from '~/assets/images/chevron-down.svg'
import checkIcon from '~/assets/images/check.svg'
import searchIcon from '~/assets/images/search.svg'
import { currencies, filterCurrencies, popularCurrencyCodes, type Currency } from '#shared/currencies'

const flagAssets = import.meta.glob<string>('../assets/images/flags/*.webp', { eager: true, query: '?url', import: 'default' })
const flagSrc = (currency: Currency) => flagAssets[`../assets/images/flags/${currency.flag}.webp`]

const props = withDefaults(defineProps<{
  initialCurrency?: string
  ariaLabel?: string
}>(), {
  initialCurrency: 'USD',
  ariaLabel: 'Currency',
})
const model = defineModel<string>()
const dropdownId = useId()

const isOpen = ref(false)
const searchQuery = ref('')
const matchingCurrencies = computed(() => filterCurrencies(searchQuery.value))
const popularCurrencies = computed(() => matchingCurrencies.value.filter(currency => popularCurrencyCodes.includes(currency.code)))
const otherCurrencies = computed(() => matchingCurrencies.value.filter(currency => !popularCurrencyCodes.includes(currency.code)))
const selectedCurrency = computed(() =>
  currencies.find(currency => currency.code === (model.value ?? props.initialCurrency)) ?? currencies[0]!,
)
const triggerRef = ref<HTMLButtonElement | null>(null)
const menuRef = ref<HTMLDivElement | null>(null)
const menuPosition = ref({
  left: '0px',
  top: '0px',
  maxHeight: 'none',
  visibility: 'hidden',
})

const updateMenuPosition = () => {
  if (!triggerRef.value || !menuRef.value || !import.meta.client) {
    return
  }

  const gap = 10
  const viewportPadding = 8
  const triggerRect = triggerRef.value.getBoundingClientRect()
  const menuRect = menuRef.value.getBoundingClientRect()
  const menuHeight = menuRef.value.scrollHeight
  const spaceBelow = window.innerHeight - triggerRect.bottom - gap - viewportPadding
  const spaceAbove = triggerRect.top - gap - viewportPadding
  const openBelow = spaceBelow >= menuHeight || spaceBelow >= spaceAbove
  const availableHeight = openBelow ? spaceBelow : spaceAbove
  const menuVisibleHeight = Math.min(menuHeight, availableHeight)
  const left = Math.max(
    viewportPadding,
    Math.min(
      Math.max(triggerRect.left, viewportPadding),
      window.innerWidth - menuRect.width - viewportPadding,
    ),
  )
  const top = openBelow
    ? triggerRect.bottom + gap
    : triggerRect.top - gap - menuVisibleHeight

  menuPosition.value = {
    left: `${left}px`,
    top: `${top}px`,
    maxHeight: `${availableHeight}px`,
    visibility: 'visible',
  }
}

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const selectCurrency = (currency: Currency) => {
  model.value = currency.code
  isOpen.value = false
  triggerRef.value?.focus()
}

const closeDropdown = () => {
  isOpen.value = false
}

const handleDocumentPointerDown = (event: PointerEvent) => {
  if (!isOpen.value) {
    return
  }

  const target = event.target as Node | null

  if (
    target
    && (triggerRef.value?.contains(target) || menuRef.value?.contains(target))
  ) {
    return
  }

  closeDropdown()
}

const handleDocumentKeyDown = (event: KeyboardEvent) => {
  if (!isOpen.value || event.key !== 'Escape') {
    return
  }

  closeDropdown()
  triggerRef.value?.focus()
}

watch(isOpen, async (open) => {
  if (!open) {
    searchQuery.value = ''
    menuPosition.value = {
      left: '0px',
      top: '0px',
      maxHeight: 'none',
      visibility: 'hidden',
    }
    return
  }

  await nextTick()
  updateMenuPosition()
  menuRef.value?.querySelector<HTMLInputElement>('input')?.focus()
})

watch(searchQuery, async () => {
  await nextTick()
  if (isOpen.value) updateMenuPosition()
})

onMounted(() => {
  document.addEventListener('pointerdown', handleDocumentPointerDown, true)
  document.addEventListener('keydown', handleDocumentKeyDown)
  window.addEventListener('resize', updateMenuPosition)
  window.addEventListener('scroll', updateMenuPosition, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleDocumentPointerDown, true)
  document.removeEventListener('keydown', handleDocumentKeyDown)
  window.removeEventListener('resize', updateMenuPosition)
  window.removeEventListener('scroll', updateMenuPosition, true)
})
</script>

<template>
  <div class="currency-dropdown">
    <button
      ref="triggerRef"
      class="currency-dropdown__trigger"
      type="button"
      :aria-expanded="isOpen"
      :aria-label="`${props.ariaLabel}: ${selectedCurrency.code}`"
      aria-haspopup="listbox"
      @click="toggleDropdown"
    >
      <img
        :src="flagSrc(selectedCurrency)"
        :alt="`${selectedCurrency.code} flag`"
        class="currency-dropdown__trigger-flag"
      >
      <span>{{ selectedCurrency.code }}</span>
      <img
        :src="chevronDownIcon"
        alt=""
        class="currency-dropdown__chevron"
        aria-hidden="true"
      >
    </button>

    <div
      v-if="isOpen"
      ref="menuRef"
      class="currency-dropdown__menu"
      :style="menuPosition"
    >
      <Input v-model="searchQuery" placeholder="Search currencies..." aria-label="Search by country, currency, or code">
        <template #icon>
          <img :src="searchIcon" alt="">
        </template>
      </Input>

      <p v-if="!matchingCurrencies.length" role="status" class="p-3 text-preset-5 text-fx-neutral-200">No currencies found. Try a country, currency name, or code.</p>

      <section v-if="popularCurrencies.length" class="currency-dropdown__section" :aria-labelledby="`${dropdownId}-popular`">
        <div class="currency-dropdown__section-heading">
          <h4 :id="`${dropdownId}-popular`">Popular</h4>
          <span>{{ popularCurrencies.length }}</span>
        </div>

        <ul class="currency-dropdown__list" role="listbox" aria-label="Popular currencies">
          <li v-for="currency in popularCurrencies" :key="currency.code">
            <button
              class="currency-dropdown__option"
              type="button"
              role="option"
              :aria-selected="selectedCurrency.code === currency.code"
              @click="selectCurrency(currency)"
            >
              <img :src="flagSrc(currency)" :alt="`${currency.code} flag`" class="currency-dropdown__option-flag">
              <span class="currency-dropdown__option-code">{{ currency.code }}</span>
              <span class="currency-dropdown__option-name">{{ currency.name }}</span>
              <img
                v-if="selectedCurrency.code === currency.code"
                :src="checkIcon"
                alt=""
                class="currency-dropdown__check"
                aria-hidden="true"
              >
            </button>
          </li>
        </ul>
      </section>

      <section v-if="otherCurrencies.length" class="currency-dropdown__section" :aria-labelledby="`${dropdownId}-other`">
        <div class="currency-dropdown__section-heading">
          <h4 :id="`${dropdownId}-other`">Other Currencies</h4>
          <span>{{ otherCurrencies.length }}</span>
        </div>

        <ul class="currency-dropdown__list" role="listbox" aria-label="Other currencies">
          <li v-for="currency in otherCurrencies" :key="currency.code">
            <button
              class="currency-dropdown__option"
              type="button"
              role="option"
              :aria-selected="selectedCurrency.code === currency.code"
              @click="selectCurrency(currency)"
            >
              <img :src="flagSrc(currency)" :alt="`${currency.code} flag`" class="currency-dropdown__option-flag">
              <span class="currency-dropdown__option-code">{{ currency.code }}</span>
              <span class="currency-dropdown__option-name">{{ currency.name }}</span>
              <img
                v-if="selectedCurrency.code === currency.code"
                :src="checkIcon"
                alt=""
                class="currency-dropdown__check"
                aria-hidden="true"
              >
            </button>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.currency-dropdown {
  @apply relative inline-block w-fit;
}

.currency-dropdown__trigger {
  @apply inline-flex h-[40px] w-fit items-center gap-2 rounded-lg border border-fx-neutral-400 bg-fx-neutral-500 p-[10px] text-preset-4 text-fx-neutral-50 transition-colors duration-200 ease-in-out focus-visible:outline-none;
}

.currency-dropdown__trigger:focus-visible {
  box-shadow:
    0 0 0 3px var(--color-fx-neutral-700),
    0 0 0 4px var(--color-fx-lime-500);
}

.currency-dropdown__trigger-flag {
  @apply size-5 shrink-0 rounded-full object-cover;
}

.currency-dropdown__chevron {
  @apply size-3 shrink-0;
}

.currency-dropdown__menu {
  @apply fixed z-20 grid w-[min(100vw-40px,376px)] gap-[10px] overflow-y-auto rounded-lg border border-fx-neutral-400 bg-fx-neutral-600 p-2;
  box-shadow: 0 20px 60px 0 rgb(10 10 10 / 50%);
}

.currency-dropdown__section {
  @apply grid gap-[10px];
}

.currency-dropdown__section-heading {
  @apply flex items-center justify-between border-b border-fx-neutral-400 px-2 py-[10px] text-preset-4 uppercase text-fx-neutral-200;
}

.currency-dropdown__list {
  @apply grid gap-[10px];
}

.currency-dropdown__option {
  @apply grid min-h-10 w-full grid-cols-[28px_48px_minmax(0,1fr)_20px] items-center gap-3 rounded-md px-2 py-[10px] text-left transition-colors duration-200 ease-in-out hover:bg-fx-neutral-500 focus-visible:bg-fx-neutral-500 focus-visible:outline-none;
}

.currency-dropdown__option-flag {
  @apply size-5 rounded-full object-cover;
}

.currency-dropdown__option-code {
  @apply text-preset-4 text-fx-neutral-50;
}

.currency-dropdown__option-name {
  @apply min-w-0 truncate text-preset-4 text-fx-neutral-200;
}

.currency-dropdown__check {
  @apply size-4 justify-self-center;
}

@media (min-width: 640px) and (max-width: 1024px) {
  .currency-dropdown__trigger {
    @apply h-[54px] gap-3 rounded-[10px] p-3 text-preset-3;
  }

  .currency-dropdown__trigger-flag {
    @apply size-6;
  }
}

@media (min-width: 640px) and (max-width: 860px) {
  .currency-dropdown__trigger {
    @apply h-12 gap-2 p-2 text-preset-4;
  }

  .currency-dropdown__trigger-flag {
    @apply size-5;
  }
}
</style>
