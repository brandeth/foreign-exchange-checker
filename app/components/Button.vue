<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'default' | 'clear' | 'favorite' | 'exchange' | 'delete'
  iconOnly?: boolean
  pressed?: boolean
}>(), {
  variant: 'default',
  iconOnly: false,
  pressed: undefined,
})
</script>

<template>
  <button
    class="fx-button"
    :class="[
      `fx-button--${variant}`,
      {
        'fx-button--icon-only': iconOnly,
        'fx-button--pressed': pressed,
      },
    ]"
    :aria-pressed="pressed === undefined ? undefined : String(pressed)"
    type="button"
  >
    <slot />
  </button>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.fx-button {
  @apply inline-flex h-8 w-fit items-center justify-center gap-2 rounded-lg border px-3 py-2 text-preset-5-medium transition-colors duration-200 ease-in-out focus-visible:bg-fx-neutral-700 focus-visible:outline-none disabled:border-fx-neutral-300 disabled:bg-transparent disabled:text-fx-neutral-200 disabled:hover:bg-transparent disabled:active:bg-transparent disabled:active:text-fx-neutral-200;
}

.fx-button--icon-only {
  @apply size-8 gap-0 p-0;
}

.fx-button :deep(img),
.fx-button :deep(svg) {
  @apply size-5 shrink-0;
}

.fx-button--default {
  @apply border-fx-lime-500 bg-transparent text-fx-neutral-50 hover:bg-fx-lime-800 active:bg-fx-lime-500 active:text-fx-neutral-900;
}

.fx-button--clear {
  @apply border-fx-neutral-400 bg-fx-neutral-600 text-fx-neutral-200 hover:bg-fx-neutral-500 active:bg-fx-neutral-400 active:text-fx-neutral-50;
}

.fx-button--favorite {
  @apply border-fx-lime-500 bg-transparent text-fx-neutral-50 hover:bg-fx-lime-800 active:bg-fx-lime-500 active:text-fx-neutral-900;
}

.fx-button--exchange {
  @apply h-12 border-fx-neutral-500 bg-fx-neutral-600 text-fx-neutral-50 hover:bg-fx-neutral-500 active:bg-fx-neutral-400 active:text-fx-neutral-50;
}

.fx-button--delete {
  @apply border-fx-neutral-500 bg-fx-neutral-600 text-fx-neutral-50 hover:bg-fx-neutral-500 active:bg-fx-neutral-400 active:text-fx-neutral-50;
}

.fx-button--exchange.fx-button--icon-only {
  @apply size-12;
}

.fx-button--delete.fx-button--icon-only {
  @apply h-auto w-fit p-2;
}

.fx-button--delete :deep(img),
.fx-button--delete :deep(svg) {
  @apply size-4;
}

.fx-button--favorite.fx-button--pressed {
  @apply bg-fx-lime-500 text-fx-neutral-900 hover:bg-fx-lime-500 active:bg-fx-lime-500 active:text-fx-neutral-900;
}

.fx-button--favorite.fx-button--pressed :deep(img) {
  filter: brightness(0) saturate(100%);
}

.fx-button--favorite.fx-button--icon-only.fx-button--pressed {
  @apply bg-fx-neutral-600 text-fx-lime-500 hover:bg-fx-neutral-500 active:bg-fx-neutral-600 active:text-fx-lime-500;
}

.fx-button--favorite.fx-button--icon-only.fx-button--pressed :deep(img) {
  filter: none;
}

.fx-button:focus-visible {
  box-shadow:
    0 0 0 3px var(--color-fx-neutral-700),
    0 0 0 4px var(--color-fx-lime-500);
}

.fx-button--icon-only:not(.fx-button--pressed):focus-visible {
  @apply bg-fx-neutral-600;
}

.fx-button--favorite.fx-button--icon-only.fx-button--pressed:focus-visible {
  @apply border-fx-neutral-500 bg-fx-neutral-500;
}
</style>
