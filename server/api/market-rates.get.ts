import { createMarketRateService } from '../utils/marketRates'

const getMarketRates = createMarketRateService(url => $fetch(url, { timeout: 10000, retry: 0 }))

export default defineEventHandler(async (event) => {
  // Let the service manage freshness, including stale fallback responses.
  setHeader(event, 'Cache-Control', 'no-store')
  try {
    return await getMarketRates()
  }
  catch {
    throw createError({ statusCode: 503, statusMessage: 'Market rates are unavailable. Please try again.' })
  }
})
