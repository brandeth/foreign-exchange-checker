import { createHistoryService, validateHistoryQuery } from '../utils/rateHistory'

const getHistory = createHistoryService(url => $fetch(url, { timeout: 15000, retry: 0 }))

export default defineEventHandler(async (event) => {
  let query
  try {
    query = validateHistoryQuery(getQuery(event))
  }
  catch {
    throw createError({ statusCode: 400, statusMessage: 'Choose supported currencies and a valid time range.' })
  }
  setHeader(event, 'Cache-Control', 'no-store')
  try {
    return await getHistory(query)
  }
  catch {
    throw createError({ statusCode: 503, statusMessage: 'Rate history is unavailable. Please try again.' })
  }
})
