<script setup lang="ts">
export interface TimeRangeOption {
  label: string
  value: string
}

const props = withDefaults(defineProps<{
  options: TimeRangeOption[]
  ariaLabel?: string
}>(), {
  ariaLabel: 'Time range',
})

const model = defineModel<string>()

const selectedValue = computed(() => model.value ?? props.options[0]?.value)

function selectOption(index: number, event?: KeyboardEvent) {
  const option = props.options[index]

  if (!option) {
    return
  }

  model.value = option.value

  if (event) {
    const buttons = (event.currentTarget as HTMLElement)
      .parentElement
      ?.querySelectorAll<HTMLButtonElement>('[role="radio"]')

    buttons?.[index]?.focus()
  }
}

function handleKeydown(event: KeyboardEvent, index: number) {
  let nextIndex: number | undefined

  if (event.key === 'ArrowRight') {
    nextIndex = (index + 1) % props.options.length
  }
  else if (event.key === 'ArrowLeft') {
    nextIndex = (index - 1 + props.options.length) % props.options.length
  }
  else if (event.key === 'Home') {
    nextIndex = 0
  }
  else if (event.key === 'End') {
    nextIndex = props.options.length - 1
  }

  if (nextIndex !== undefined) {
    event.preventDefault()
    selectOption(nextIndex, event)
  }
}
</script>

<template>
  <div
    class="time-range-selector"
    role="radiogroup"
    :aria-label="ariaLabel"
  >
    <button
      v-for="(option, index) in options"
      :key="option.value"
      class="time-range-selector__option"
      :class="{ 'time-range-selector__option--selected': option.value === selectedValue }"
      type="button"
      role="radio"
      :aria-checked="option.value === selectedValue"
      :tabindex="option.value === selectedValue ? 0 : -1"
      @click="selectOption(index)"
      @keydown="handleKeydown($event, index)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.time-range-selector {
  @apply inline-flex h-[42px] w-full max-w-[286px] items-center justify-between overflow-hidden rounded-lg bg-fx-neutral-700 text-preset-5 text-fx-neutral-200;
}

.time-range-selector__option {
  @apply inline-flex h-full min-w-0 flex-1 items-center justify-center rounded-lg border-0 bg-transparent px-4 py-3 text-inherit outline-none transition-colors;
}

.time-range-selector__option--selected {
  @apply bg-fx-neutral-500 text-fx-neutral-50;
}

.time-range-selector__option:focus-visible {
  box-shadow: inset 0 0 0 1px var(--color-fx-lime-500);
}
</style>
