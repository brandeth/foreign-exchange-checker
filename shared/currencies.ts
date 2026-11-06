import { getTimeZoneRegion } from './timeZoneRegions.ts'

export type Currency = { code: string; name: string; country: string; flag: string }

// One catalogue drives dropdowns, conversions, and history validation.
export const currencies: Currency[] = [
  { code: 'USD', name: 'US Dollar', country: 'United States USA America', flag: 'us' },
  { code: 'EUR', name: 'Euro', country: 'Eurozone European Union Austria Belgium Bulgaria Croatia Cyprus Estonia Finland France Germany Greece Ireland Italy Latvia Lithuania Luxembourg Malta Netherlands Portugal Slovakia Slovenia Spain', flag: 'eu' },
  { code: 'GBP', name: 'British Pound', country: 'United Kingdom UK Britain England Scotland Wales Northern Ireland', flag: 'gb' },
  { code: 'AED', name: 'UAE Dirham', country: 'United Arab Emirates', flag: 'ae' },
  { code: 'ARS', name: 'Argentine Peso', country: 'Argentina', flag: 'ar' },
  { code: 'AUD', name: 'Australian Dollar', country: 'Australia', flag: 'au' },
  { code: 'BDT', name: 'Bangladeshi Taka', country: 'Bangladesh', flag: 'bd' },
  { code: 'BHD', name: 'Bahraini Dinar', country: 'Bahrain', flag: 'bh' },
  { code: 'BRL', name: 'Brazilian Real', country: 'Brazil', flag: 'br' },
  { code: 'CAD', name: 'Canadian Dollar', country: 'Canada', flag: 'ca' },
  { code: 'CHF', name: 'Swiss Franc', country: 'Switzerland Liechtenstein', flag: 'ch' },
  { code: 'CLP', name: 'Chilean Peso', country: 'Chile', flag: 'cl' },
  { code: 'CNY', name: 'Chinese Yuan', country: 'China Renminbi RMB', flag: 'cn' },
  { code: 'COP', name: 'Colombian Peso', country: 'Colombia', flag: 'co' },
  { code: 'CZK', name: 'Czech Koruna', country: 'Czech Republic Czechia', flag: 'cz' },
  { code: 'DKK', name: 'Danish Krone', country: 'Denmark', flag: 'dk' },
  { code: 'EGP', name: 'Egyptian Pound', country: 'Egypt', flag: 'eg' },
  { code: 'HKD', name: 'Hong Kong Dollar', country: 'Hong Kong', flag: 'hk' },
  { code: 'HNL', name: 'Honduran Lempira', country: 'Honduras', flag: 'hn' },
  { code: 'HTG', name: 'Haitian Gourde', country: 'Haiti', flag: 'ht' },
  { code: 'HUF', name: 'Hungarian Forint', country: 'Hungary', flag: 'hu' },
  { code: 'IDR', name: 'Indonesian Rupiah', country: 'Indonesia', flag: 'id' },
  { code: 'INR', name: 'Indian Rupee', country: 'India', flag: 'in' },
  { code: 'ISK', name: 'Icelandic Krona', country: 'Iceland', flag: 'is' },
  { code: 'JOD', name: 'Jordanian Dinar', country: 'Jordan', flag: 'jo' },
  { code: 'JPY', name: 'Japanese Yen', country: 'Japan', flag: 'jp' },
  { code: 'KES', name: 'Kenyan Shilling', country: 'Kenya', flag: 'ke' },
  { code: 'KRW', name: 'South Korean Won', country: 'South Korea Republic of Korea', flag: 'kr' },
  { code: 'KWD', name: 'Kuwaiti Dinar', country: 'Kuwait', flag: 'kw' },
  { code: 'LBP', name: 'Lebanese Pound', country: 'Lebanon', flag: 'lb' },
  { code: 'LKR', name: 'Sri Lankan Rupee', country: 'Sri Lanka', flag: 'lk' },
  { code: 'MAD', name: 'Moroccan Dirham', country: 'Morocco', flag: 'ma' },
  { code: 'MXN', name: 'Mexican Peso', country: 'Mexico', flag: 'mx' },
  { code: 'MYR', name: 'Malaysian Ringgit', country: 'Malaysia', flag: 'my' },
  { code: 'NGN', name: 'Nigerian Naira', country: 'Nigeria', flag: 'ng' },
  { code: 'NOK', name: 'Norwegian Krone', country: 'Norway', flag: 'no' },
  { code: 'NPR', name: 'Nepalese Rupee', country: 'Nepal', flag: 'np' },
  { code: 'NZD', name: 'New Zealand Dollar', country: 'New Zealand', flag: 'nz' },
  { code: 'OMR', name: 'Omani Rial', country: 'Oman', flag: 'om' },
  { code: 'PEN', name: 'Peruvian Sol', country: 'Peru', flag: 'pe' },
  { code: 'PHP', name: 'Philippine Peso', country: 'Philippines Pilipinas', flag: 'ph' },
  { code: 'PKR', name: 'Pakistani Rupee', country: 'Pakistan', flag: 'pk' },
  { code: 'PLN', name: 'Polish Zloty', country: 'Poland', flag: 'pl' },
  { code: 'QAR', name: 'Qatari Riyal', country: 'Qatar', flag: 'qa' },
  { code: 'RON', name: 'Romanian Leu', country: 'Romania', flag: 'ro' },
  { code: 'RUB', name: 'Russian Ruble', country: 'Russia', flag: 'ru' },
  { code: 'SAR', name: 'Saudi Riyal', country: 'Saudi Arabia', flag: 'sa' },
  { code: 'SEK', name: 'Swedish Krona', country: 'Sweden', flag: 'se' },
  { code: 'SGD', name: 'Singapore Dollar', country: 'Singapore', flag: 'sg' },
  { code: 'THB', name: 'Thai Baht', country: 'Thailand', flag: 'th' },
  { code: 'TRY', name: 'Turkish Lira', country: 'Turkey Türkiye Turkiye', flag: 'tr' },
  { code: 'TWD', name: 'New Taiwan Dollar', country: 'Taiwan', flag: 'tw' },
  { code: 'UAH', name: 'Ukrainian Hryvnia', country: 'Ukraine', flag: 'ua' },
  { code: 'VND', name: 'Vietnamese Dong', country: 'Vietnam Viet Nam', flag: 'vn' },
  { code: 'XCD', name: 'East Caribbean Dollar', country: 'Saint Lucia St Lucia Antigua Barbuda Dominica Grenada Saint Kitts Nevis Saint Vincent Grenadines Anguilla Montserrat', flag: 'lc' },
  { code: 'ZAR', name: 'South African Rand', country: 'South Africa', flag: 'za' },
]

export const converterCurrencies = currencies.map(currency => currency.code)
export const popularCurrencyCodes = ['USD', 'EUR', 'GBP']

const euroRegions = new Set('AD AT BE BG CY DE EE ES FI FR GR HR IE IT LT LU LV MC ME MT NL PT SI SK SM VA XK'.split(' '))
const eastCaribbeanRegions = new Set('AG AI DM GD KN LC MS VC'.split(' '))

export function getCurrencyForRegion(region: string): string | undefined {
  if (euroRegions.has(region)) return 'EUR'
  if (eastCaribbeanRegions.has(region)) return 'XCD'
  if (region === 'LI') return 'CHF'
  return currencies.find(currency => currency.flag === region.toLowerCase())?.code
}

export function getRegionalCurrency(locales: readonly string[], timeZone?: string): string | undefined {
  const timeZoneRegion = timeZone && getTimeZoneRegion(timeZone)
  if (timeZoneRegion) return getCurrencyForRegion(timeZoneRegion)

  for (const locale of locales) {
    let region: string | undefined
    try {
      region = new Intl.Locale(locale).region
    } catch {
      continue
    }
    if (!region) continue
    const currency = getCurrencyForRegion(region)
    if (currency) return currency
  }
}

function normalizeSearch(value: string) {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
}

export function filterCurrencies(query: string): Currency[] {
  const terms = normalizeSearch(query).split(/\s+/).filter(Boolean)
  return currencies.filter(currency => {
    const text = normalizeSearch(`${currency.code} ${currency.name} ${currency.country}`)
    return terms.every(term => text.includes(term))
  })
}
