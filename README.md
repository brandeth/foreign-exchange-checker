# Foreign Exchange Checker

The converter fetches daily exchange rates from [Frankfurter v2](https://frankfurter.dev/). No API key is needed.

## Converter rates

- `GET /api/exchange-rates` requests USD-based rates for the currencies in the converter dropdowns. Amount edits and currency swaps calculate locally without extra requests.
- Successful responses are cached for one hour per server instance. Concurrent requests share one refresh. The in-memory cache resets on restart and is not shared across instances.
- If refreshing fails, the endpoint returns the previous successful rates marked as stale. Without cached rates, it returns HTTP 503. The converter offers a retry and retains previously fetched results.
- Rate dates describe the underlying observations; `fetchedAt` describes when this server retrieved them. Cross-currency conversions show both source dates, which can differ. Missing currencies remain unavailable instead of using sample values.
- This integration requires a Nuxt server deployment (`npm run build`); static-only hosting cannot serve the API route. The chart and market ticker still use their existing data.

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
