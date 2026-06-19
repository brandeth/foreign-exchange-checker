<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'default' | 'clear'
}>(), {
  variant: 'default',
})
</script>

<template>
  <button class="fx-button" :class="`fx-button--${variant}`" type="button">
    <slot />
  </button>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.fx-button {
  @apply inline-flex h-8 items-center justify-center rounded-lg border px-3 py-2 text-preset-5-medium transition-colors duration-200 ease-in-out focus-visible:bg-fx-neutral-700 focus-visible:outline-none disabled:border-fx-neutral-300 disabled:bg-transparent disabled:text-fx-neutral-200 disabled:hover:bg-transparent disabled:active:bg-transparent disabled:active:text-fx-neutral-200;
}

.fx-button--default {
  @apply border-fx-lime-500 bg-transparent text-fx-neutral-50 hover:bg-fx-lime-800 active:bg-fx-lime-500 active:text-fx-neutral-900;
}

.fx-button--clear {
  @apply border-fx-neutral-400 bg-fx-neutral-600 text-fx-neutral-200 hover:bg-fx-neutral-500 active:bg-fx-neutral-400 active:text-fx-neutral-50;
}

.fx-button:focus-visible {
  box-shadow:
    0 0 0 3px var(--color-fx-neutral-700),
    0 0 0 4px var(--color-fx-lime-500);
}
</style>
