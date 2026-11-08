import { currencies, type Currency } from './currencies.ts'
import { getPairRate, type ExchangeRatesResponse } from './exchangeRates.ts'

// The Compare tab lists these targets; the send currency is swapped for USD so the list keeps eight pairs.
export const comparisonCurrencyCodes = ['GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'INR', 'CNY', 'BDT']
const replacementCode = 'USD'

export type ComparisonRow = Pick<Currency, 'code' | 'name' | 'flag'> & {
  value: string
  rate: string
}

export type Comparison = {
  amountLabel: string
  rows: ComparisonRow[]
}

export function getComparisonCodes(from: string): string[] {
  return comparisonCurrencyCodes.map(code => code === from ? replacementCode : code)
}

const amountFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 20 })
const valueFormat = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function buildComparison(
  amount: number | null,
  from: string,
  rates?: ExchangeRatesResponse['rates'],
): Comparison | null {
  if (amount === null || !Number.isFinite(amount) || amount < 0 || !rates) return null

  const rows = getComparisonCodes(from).flatMap((code) => {
    const currency = currencies.find(item => item.code === code)
    if (!currency) return []
    const rate = getPairRate(from, code, rates)
    return [{
      code,
      name: currency.name,
      flag: currency.flag,
      value: rate === null ? '—' : valueFormat.format(amount * rate),
      rate: rate === null ? '—' : rate.toFixed(4),
    }]
  })

  return { amountLabel: `${amountFormat.format(amount)} from ${from}`, rows }
}
