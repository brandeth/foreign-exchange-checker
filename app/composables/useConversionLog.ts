import { ref, type Ref } from 'vue'
import type { ConversionSnapshot, LoggedConversion } from '#shared/conversionLog.ts'

export function useConversionLog(
  entries: Ref<LoggedConversion[]> = ref([]),
  now = () => new Date(),
  makeId = () => crypto.randomUUID(),
) {
  function add(snapshot: ConversionSnapshot) {
    const entry = { ...snapshot, id: makeId(), createdAt: now().toISOString() }
    entries.value = [entry, ...entries.value]
  }
  function remove(id: string) {
    entries.value = entries.value.filter(entry => entry.id !== id)
  }
  function clear() {
    entries.value = []
  }
  return { entries, add, remove, clear }
}
