import { createExchangeRateService, FRANKFURTER_URL } from '../utils/exchangeRates'

const getRates = createExchangeRateService(() => $fetch(FRANKFURTER_URL, { timeout: 10000, retry: 0 }))

export default defineEventHandler(async (event) => {
  // Let the service manage freshness, including stale fallback responses.
  setHeader(event, 'Cache-Control', 'no-store')
  try {
    return await getRates()
  }
  catch {
    throw createError({ statusCode: 503, statusMessage: 'Exchange rates are unavailable. Please try again.' })
  }
})
