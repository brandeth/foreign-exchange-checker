export const historyRanges = ['1d', '1w', '1m', '3m', '1y', '5y'] as const
export type HistoryRange = typeof historyRanges[number]
export type HistoryQuery = { base: string; quote: string; range: HistoryRange }
export type HistoryPoint = { date: string; value: number }
export type RateHistoryResponse = HistoryQuery & {
  points: HistoryPoint[]
  fetchedAt: string
  stale: boolean
}

export function historyWindow(range: HistoryRange, now = new Date()) {
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const start = new Date(end)
  if (range === '1w') start.setUTCDate(start.getUTCDate() - 7)
  else if (range !== '1d') {
    const months = { '1m': 1, '3m': 3, '1y': 12, '5y': 60 }[range]
    const day = start.getUTCDate()
    start.setUTCDate(1)
    start.setUTCMonth(start.getUTCMonth() - months)
    const lastDay = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0)).getUTCDate()
    start.setUTCDate(Math.min(day, lastDay))
  }
  return { from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10) }
}
