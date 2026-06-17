<template>
  <button class="fx-button" type="button">
    <slot />
  </button>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.fx-button {
  @apply inline-flex h-8 items-center justify-center rounded-lg border border-fx-lime-500 bg-transparent px-3 py-2 text-fx-neutral-50 text-preset-5-medium transition-colors duration-200 ease-in-out hover:bg-fx-lime-800 active:bg-fx-lime-500 active:text-fx-neutral-900 focus-visible:bg-fx-neutral-700 focus-visible:outline-none disabled:border-fx-neutral-300 disabled:bg-transparent disabled:text-fx-neutral-200 disabled:hover:bg-transparent disabled:active:bg-transparent disabled:active:text-fx-neutral-200;
}

.fx-button:focus-visible {
  box-shadow:
    0 0 0 3px var(--color-fx-neutral-700),
    0 0 0 4px var(--color-fx-lime-500);
}
</style>
