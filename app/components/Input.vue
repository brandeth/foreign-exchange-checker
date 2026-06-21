<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  modelValue?: string | number
}>()

const attrs = useAttrs()

const inputValue = computed(() => props.modelValue ?? attrs.value)

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="fx-input">
    <span v-if="$slots.icon" class="fx-input__icon" aria-hidden="true">
      <slot name="icon" />
    </span>

    <input
      v-bind="$attrs"
      :value="inputValue"
      class="fx-input__control"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
  </div>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.fx-input {
  @apply flex h-[46px] w-full items-center gap-[10px] rounded-[6px] border border-fx-neutral-200 bg-transparent p-3 text-preset-5 text-fx-neutral-50 transition-colors duration-200 ease-in-out;
}

.fx-input:focus-within {
  @apply border-fx-lime-500;
}

.fx-input__icon {
  @apply flex size-5 shrink-0 items-center justify-center text-fx-neutral-50;
}

.fx-input__icon :deep(img),
.fx-input__icon :deep(svg) {
  @apply size-5 shrink-0;
}

.fx-input__icon :deep(svg) {
  @apply text-fx-neutral-50;
}

.fx-input__control {
  @apply min-w-0 flex-1 bg-transparent text-inherit outline-none placeholder:text-fx-neutral-200;
}
</style>
