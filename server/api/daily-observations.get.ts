import { createDailyObservationService } from '../utils/marketRates'

const getDailyObservations = createDailyObservationService(url => $fetch(url, { timeout: 10000, retry: 0 }))

export default defineEventHandler(async (event) => {
  // Let the service manage freshness, including stale fallback responses.
  setHeader(event, 'Cache-Control', 'no-store')
  try {
    return await getDailyObservations()
  }
  catch {
    throw createError({ statusCode: 503, statusMessage: 'Daily observations are unavailable. Please try again.' })
  }
})
