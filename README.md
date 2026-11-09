# Foreign Exchange Checker

The converter fetches daily exchange rates from [Frankfurter v2](https://frankfurter.dev/). No API key is needed.

## Converter rates

- The shared catalogue in `shared/currencies.ts` contains 56 currencies, including PHP. It drives the dropdowns and both API allowlists. Search accepts country names, currency names, and codes; unmatched searches show an empty state. USD, EUR, and GBP remain in the Popular group.
- `GET /api/exchange-rates` requests USD-based rates for the currencies in the converter dropdowns. Amount edits and currency swaps calculate locally without extra requests.
- Successful responses are cached for one hour per server instance. Concurrent requests share one refresh. The in-memory cache resets on restart and is not shared across instances.
- If refreshing fails, the endpoint returns the previous successful rates marked as stale. Without cached rates, it returns HTTP 503. The converter offers a retry and retains previously fetched results.
- Rate dates describe the underlying observations; `fetchedAt` describes when this server retrieved them. Cross-currency conversions show both source dates, which can differ. Missing currencies remain unavailable instead of using sample values.
- This integration requires a Nuxt server deployment (`npm run build`); static-only hosting cannot serve the API routes.
## Live Markets ticker

- The ticker shows EUR/USD, USD/JPY, GBP/USD, USD/CHF, EUR/GBP, AUD/USD, and USD/CAD from `GET /api/market-rates`.
- The endpoint makes one USD-based Frankfurter request covering the last 14 days, then derives each pair (including cross pairs such as EUR/GBP) from the two most recent dates on which both currencies were observed. Days missing a currency are skipped rather than filled.
- The change is the percentage move from the previous observation to the latest one. These are daily reference rates, not intraday quotes; hovering the ticker shows the observation date.
- Responses are cached for one hour per server instance, and concurrent requests share one refresh. A failed refresh returns the previous rates marked as stale; without cached rates the endpoint returns HTTP 503 and the ticker shows "Market rates are unavailable." instead of sample values.

## Rate history

- The chart follows the converter's selected pair and the selected period through `GET /api/rate-history?base=USD&quote=EUR&range=1m`.
- Supported periods are 1D, 1W, 1M, 3M, 1Y, and 5Y. 1D shows the latest daily observation, not intraday prices. Other periods use UTC calendar dates, with month-end clamping.
- First, Last, Change, and % Change come from the first and last observations actually returned for the period. Missing dates are not filled with invented rates; the horizontal axis uses observation dates.
- The server caches histories for one hour per pair, range, and UTC day, with up to 128 entries per instance. A failed refresh can return that query's cached history with a warning. Switching selections clears the old chart immediately, and late responses cannot replace the current selection.
- Same-currency pairs show a constant rate of 1 without requesting history from the provider.

## Compare tab

- Compare converts the converter's Send amount from the Send currency into eight currencies (GBP, JPY, CHF, CAD, AUD, INR, CNY, BDT), using the rates already fetched by the converter. No extra requests are made.
- When the Send currency is one of those eight, USD takes its place so the list still shows eight pairs.
- An empty or invalid amount shows the empty state. Missing rates show a dash instead of an invented value, and cached fallback rates are flagged above the list.
- Starring a row pins the pair as Send currency → that row's currency.

## Conversion log

- Log Conversion saves the currently displayed amounts, currencies, exchange rate, rate dates, and save timestamp, then opens the Log tab. Entries appear newest first; editing the converter does not change saved entries.
- Logging is disabled while rates are loading or no valid conversion is available. Conversions saved using cached fallback rates are marked in the log.
- Entries are saved in this browser's local storage, so they remain after a refresh or close. If storage is unavailable, they are kept in memory for the current visit. No conversion log is sent to a server.
- The log starts empty. Individual entries can be deleted, or Clear All can remove every entry.

Run the tests with Node.js 22.18+ or 24+:

```bash
npm test
```

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
