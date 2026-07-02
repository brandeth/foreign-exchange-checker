<script setup lang="ts">
export interface TabItem {
  label: string
  value: string
  badge?: number | string
}

const props = withDefaults(defineProps<{
  tabs: TabItem[]
  ariaLabel?: string
}>(), {
  ariaLabel: 'Tabs',
})

const model = defineModel<string>()

const activeValue = computed(() => model.value ?? props.tabs[0]?.value)

function selectTab(index: number, event?: KeyboardEvent) {
  const tab = props.tabs[index]

  if (!tab) {
    return
  }

  model.value = tab.value

  if (event) {
    const buttons = (event.currentTarget as HTMLElement)
      .parentElement
      ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')

    buttons?.[index]?.focus()
  }
}

function handleKeydown(event: KeyboardEvent, index: number) {
  let nextIndex: number | undefined

  if (event.key === 'ArrowRight') {
    nextIndex = (index + 1) % props.tabs.length
  }
  else if (event.key === 'ArrowLeft') {
    nextIndex = (index - 1 + props.tabs.length) % props.tabs.length
  }
  else if (event.key === 'Home') {
    nextIndex = 0
  }
  else if (event.key === 'End') {
    nextIndex = props.tabs.length - 1
  }

  if (nextIndex !== undefined) {
    event.preventDefault()
    selectTab(nextIndex, event)
  }
}
</script>

<template>
  <div
    class="fx-tabs"
    role="tablist"
    :aria-label="ariaLabel"
  >
    <button
      v-for="(tab, index) in tabs"
      :key="tab.value"
      class="fx-tabs__tab"
      :class="{ 'fx-tabs__tab--active': tab.value === activeValue }"
      type="button"
      role="tab"
      :aria-selected="tab.value === activeValue"
      :tabindex="tab.value === activeValue ? 0 : -1"
      @click="selectTab(index)"
      @keydown="handleKeydown($event, index)"
    >
      <span>{{ tab.label }}</span>
      <span v-if="tab.badge !== undefined" class="fx-tabs__badge">
        {{ tab.badge }}
      </span>
    </button>
  </div>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.fx-tabs {
  @apply flex h-[42px] w-full gap-2 overflow-x-auto overflow-y-hidden border-b border-fx-neutral-600 p-0;
  scrollbar-width: none;
}

.fx-tabs::-webkit-scrollbar {
  display: none;
}

.fx-tabs__tab {
  @apply relative inline-flex h-full shrink-0 items-center justify-center gap-2 border-0 bg-transparent px-4 py-0 text-preset-3-bold uppercase text-fx-neutral-50 outline-none;
}

.fx-tabs__tab::after {
  @apply absolute inset-x-0 bottom-0 h-px bg-transparent content-[''];
}

.fx-tabs__tab--active::after {
  @apply bg-fx-lime-500;
}

.fx-tabs__tab:focus-visible {
  box-shadow: inset 0 0 0 1px var(--color-fx-lime-500);
}

.fx-tabs__badge {
  @apply inline-flex h-5 min-w-5 items-center justify-center rounded-[9999px] bg-fx-lime-800 px-1 text-preset-5-medium text-fx-lime-500;
}
</style>
