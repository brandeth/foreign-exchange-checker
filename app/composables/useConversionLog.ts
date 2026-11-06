import { ref, type Ref } from 'vue'
import type { ConversionSnapshot, LoggedConversion } from '#shared/conversionLog.ts'

const storageKey = 'foreign-exchange-checker:conversion-log'
type LogStorage = Pick<Storage, 'getItem' | 'setItem'>

function isLoggedConversion(value: unknown): value is LoggedConversion {
  if (typeof value !== 'object' || value === null) return false
  const entry = value as Partial<LoggedConversion>
  return typeof entry.id === 'string'
    && typeof entry.createdAt === 'string' && Number.isFinite(Date.parse(entry.createdAt))
    && typeof entry.fromCurrency === 'string' && typeof entry.toCurrency === 'string'
    && typeof entry.fromAmount === 'string' && typeof entry.toAmount === 'string'
    && typeof entry.exchangeRate === 'number' && Number.isFinite(entry.exchangeRate)
    && typeof entry.rateDates === 'string' && typeof entry.stale === 'boolean'
}

export function useConversionLog(
  entries: Ref<LoggedConversion[]> = ref([]),
  now = () => new Date(),
  makeId = () => crypto.randomUUID(),
) {
  let storage: LogStorage | undefined

  function restore(getStorage = (): LogStorage => window.localStorage) {
    try {
      storage = getStorage()
      const saved: unknown = JSON.parse(storage.getItem(storageKey) ?? 'null')
      if (Array.isArray(saved)) entries.value = saved.filter(isLoggedConversion)
    } catch {
      // Keep the in-memory log if storage is unavailable or unreadable.
    }
  }

  function update(nextEntries: LoggedConversion[]) {
    entries.value = nextEntries
    try {
      storage?.setItem(storageKey, JSON.stringify(nextEntries))
    } catch {
      // Keep the in-memory log if storage rejects the write.
    }
  }

  function add(snapshot: ConversionSnapshot) {
    const entry = { ...snapshot, id: makeId(), createdAt: now().toISOString() }
    update([entry, ...entries.value])
  }
  function remove(id: string) {
    update(entries.value.filter(entry => entry.id !== id))
  }
  function clear() {
    update([])
  }
  return { entries, restore, add, remove, clear }
}
