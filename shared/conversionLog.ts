export type ConversionSnapshot = {
  fromCurrency: string
  toCurrency: string
  fromAmount: string
  toAmount: string
  exchangeRate: number
  rateDates: string
  stale: boolean
}

export type LoggedConversion = ConversionSnapshot & {
  id: string
  createdAt: string
}

const logDateFormatter = new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' })

export function groupConversionsByDate<T extends { createdAt?: string }>(entries: readonly T[]) {
  const groups = new Map<string | null, T[]>()

  for (const entry of entries) {
    const timestamp = Date.parse(entry.createdAt ?? '')
    const dateLabel = Number.isFinite(timestamp) ? logDateFormatter.format(timestamp) : null
    const group = groups.get(dateLabel)
    if (group) group.push(entry)
    else groups.set(dateLabel, [entry])
  }

  return Array.from(groups, ([dateLabel, items]) => ({ dateLabel, items }))
}
