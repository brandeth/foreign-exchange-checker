<script setup lang="ts">
import chevronDownIcon from '~/assets/images/chevron-down.svg'
import checkIcon from '~/assets/images/check.svg'
import searchIcon from '~/assets/images/search.svg'
import aeFlag from '~/assets/images/flags/ae.webp'
import arFlag from '~/assets/images/flags/ar.webp'
import auFlag from '~/assets/images/flags/au.webp'
import bdFlag from '~/assets/images/flags/bd.webp'
import euFlag from '~/assets/images/flags/eu.webp'
import gbFlag from '~/assets/images/flags/gb.webp'
import usFlag from '~/assets/images/flags/us.webp'

type Currency = {
  code: string
  name: string
  flag: string
}

const props = withDefaults(defineProps<{
  initialCurrency?: string
}>(), {
  initialCurrency: 'USD',
})

const popularCurrencies: Currency[] = [
  { code: 'USD', name: 'US Dollar', flag: usFlag },
  { code: 'EUR', name: 'Euro', flag: euFlag },
  { code: 'GBP', name: 'British Pound', flag: gbFlag },
]

const otherCurrencies: Currency[] = [
  { code: 'AED', name: 'UAE Dirham', flag: aeFlag },
  { code: 'ARS', name: 'Argentine Peso', flag: arFlag },
  { code: 'AUD', name: 'Australian Dollar', flag: auFlag },
  { code: 'BDT', name: 'Bangladeshi Taka', flag: bdFlag },
]

const currencies = [...popularCurrencies, ...otherCurrencies]
const isOpen = ref(false)
const searchQuery = ref('')
const selectedCurrency = ref(
  currencies.find(currency => currency.code === props.initialCurrency) ?? popularCurrencies[0],
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
  selectedCurrency.value = currency
  isOpen.value = false
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
      aria-haspopup="listbox"
      @click="toggleDropdown"
    >
      <img
        :src="selectedCurrency.flag"
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
      <Input v-model="searchQuery" placeholder="Search currencies...">
        <template #icon>
          <img :src="searchIcon" alt="">
        </template>
      </Input>

      <section class="currency-dropdown__section" aria-labelledby="popular-currencies">
        <div class="currency-dropdown__section-heading">
          <h4 id="popular-currencies">Popular</h4>
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
              <img :src="currency.flag" :alt="`${currency.code} flag`" class="currency-dropdown__option-flag">
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

      <section class="currency-dropdown__section" aria-labelledby="other-currencies">
        <div class="currency-dropdown__section-heading">
          <h4 id="other-currencies">Other Currencies</h4>
          <span>52</span>
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
              <img :src="currency.flag" :alt="`${currency.code} flag`" class="currency-dropdown__option-flag">
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
</style>
