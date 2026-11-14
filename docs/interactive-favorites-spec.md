# Interactive Favorites spec

Status: Implemented · 2026-11-14

Clicking a pinned pair loads it into the converter and history chart, and each favorite shows its daily change.

## Scope

The Favorites tab becomes a quick way to switch pairs. Today it is a static list where the only action is removing a pair.

**In scope**

- Clicking a pinned pair sets the converter's Send and Receive currencies and switches to the History tab for that pair.
- Each pinned pair shows its daily change (▲/▼ and a signed %). It uses the same method as the Live Markets ticker: the latest observation compared with the previous one.
- One new API route that returns recent daily observations for every converter currency, so any pinned pair can be derived without one request per favorite.
- Unit tests for the shared change calculation and the new server service.

**Out of scope**

- Reordering favorites or using them to drive the ticker.
- Intraday prices. Frankfurter publishes daily reference rates only.
- Syncing favorites across devices. They stay in `localStorage`.

## Current state

Most of the UI exists already. What's missing is the wiring between parts and a data source for any pair's daily change.

| Piece | File | Today | Gap |
| --- | --- | --- | --- |
| Favorites list | `app/components/FavoritesCard.vue` | Renders pairs and rates. Emits `remove` only. Already has `priceChange` / `increase` props with ▲/▼ styling. | No `select` event, and rows aren't clickable |
| Favorite items | `app/pages/index.vue` (`favoriteItems`) | Rate comes from the converter's `latestRates` via `getPairRate` | Never sets `priceChange` or `increase` |
| Converter | `app/components/CheckRate.vue` | Owns Send and Receive currency state inside `useConverter`. Props only seed initial values. Emits `pair-change` upward. | The parent can't set the pair |
| Ticker data | `server/utils/marketRates.ts`, `shared/marketRates.ts` | Fetches 14 days of USD-based rates for the 7 ticker currencies. `buildMarketRates` takes the two most recent dates where both legs exist. `formatMarketRate` gives the signed %. | Fixed to `marketPairs`, so it can't cover arbitrary favorites |
| Storage | `index.vue` | Favorites persist under `foreign-exchange-checker:favorite-pairs` and are validated against `converterCurrencies` | None |

## Design

There are two independent changes. Selecting a pair is a client-only flow. Daily change needs a new cached server route.

### Selecting a pinned pair

1. `FavoritesCard` makes the pair label area a `<button>` that emits `select` with the item. The remove star stays a separate button, so keyboard users get two clear focus targets.
2. `CheckRate` exposes `selectPair({ base, quote })` via `defineExpose`. It sets `sendCurrency` and `receiveCurrency` and keeps the current amount. The Receive choice is saved through the existing `selectReceiveCurrency`, the same as a manual pick.
3. `CheckRate`'s currency watcher already emits `pair-change`, so `selectedPair`, the history chart and the favorite star update with no extra code.
4. `index.vue` holds a template ref to `CheckRate`. On `select` it calls `selectPair` and sets `activeMarketTab` to `history`.

Using `defineExpose` avoids turning `CheckRate`'s internal state into two `v-model`s. That refactor would touch every converter test.

### Daily change for any pair

1. **New route `GET /api/daily-observations`.** It makes one USD-based Frankfurter request for all `converterCurrencies` over the last 14 days. It returns `{ observations: { [date]: { [code]: rate } }, fetchedAt, stale }`. This is about 55 currencies × 10 business days, around 550 numbers.
2. **Server service.** Reuse the `createMarketRateService` pattern: 1-hour cache per instance, shared in-flight refresh, stale fallback, 503 with no cache. Generalize `marketRatesUrl` and `parseMarketObservations` to take the quote list instead of hard-coding `marketQuoteCodes`.
3. **Shared helper.** Extract the per-pair loop from `buildMarketRates` into `buildPairRate(observations, base, quote): MarketRate | null`. `buildMarketRates` then maps `marketPairs` through it, so ticker behavior stays the same.
4. **Client.** A `useDailyObservations` composable fetches once on mount. `favoriteItems` runs each pair through `buildPairRate` and then `formatMarketRate`, which fills `exchangeRate`, `priceChange` and `increase`.

Rate and change both come from the observations, so the number and its % always describe the same two dates. If observations fail to load, the rate falls back to the converter's `latestRates` and the change is hidden.

## Implementation steps

The steps follow dependency order. Steps 1–3 are server and shared code that can be tested before any UI changes.

- [x] **`shared/marketRates.ts`**: extract `buildPairRate(observations, base, quote)` and make `buildMarketRates` call it. Export a `DailyObservationsResponse` type.
- [x] **`server/utils/marketRates.ts`**: make `marketRatesUrl(now, quotes)` and `parseMarketObservations(payload, quotes)` take the quote list. Add `createDailyObservationService` using the existing cache, shared refresh and stale pattern.
- [x] **`server/api/daily-observations.get.ts`**: new route with `Cache-Control: no-store`, returning 503 on failure, the same as `market-rates.get.ts`.
- [x] **`app/composables/useDailyObservations.ts`**: fetch on mount and expose `observations`, `stale` and `error`.
- [x] **`app/components/CheckRate.vue`**: add `defineExpose({ selectPair })`.
- [x] **`app/components/FavoritesCard.vue`**: add a `select` emit, wrap the pair and rate in a button, and add hover and focus-visible styles plus an aria-label such as "Show USD to EUR in converter".
- [x] **`app/pages/index.vue`**: add the `CheckRate` ref, a `selectFavorite` handler that switches to History, and `favoriteItems` built from observations with a fallback to `latestRates`.
- [x] **`README.md`**: add a Favorites section covering the click behavior, how daily change is computed, and caching.

## Edge cases

| Case | Behavior |
| --- | --- |
| Observations still loading | Show the converter rate and no change line. Don't use a skeleton, so the list doesn't jump. |
| Observations request fails, nothing cached | Fall back to the converter rate and hide the change. Show no error banner, since the rate is still correct. |
| Server returns stale observations | Show the change, plus one "Cached rates, may be out of date" note above the list, matching the Compare tab. |
| A leg has only one observation in 14 days | `previousRate` is null, so the change shows "—", the same as the ticker. |
| A leg is missing on some days | Skip those dates. Never fill them (same rule as `buildMarketRates`). |
| Both legs missing entirely | The rate shows "—" and there is no change. The row is still selectable. |
| Same-currency pair (e.g. USD→USD) | Can be pinned when Send and Receive match. The rate is 1.0000 and the change is 0.00%, and the History tab shows its constant-rate message. |
| Selecting the pair already in the converter | Only switch to the History tab. No refetch. |
| Amount field invalid or empty | Selecting still sets the currencies and keeps whatever the user typed. |

## Testing

Automated tests use the existing `node --test` setup (`npm test`, Node 22.18+). The UI wiring is checked by hand.

**Unit tests** (extend `tests/market-rates.test.mjs`, add `tests/daily-observations.test.mjs`)

- `buildPairRate` returns latest and previous rates for a direct pair (USD/EUR), an inverse pair (EUR/USD) and a cross pair (GBP/JPY).
- `buildPairRate` skips dates missing a leg and returns `previousRate: null` when only one date has both legs.
- `buildMarketRates` output is unchanged after the refactor (existing assertions still pass).
- The URL builder requests every converter currency except USD over a 14-day window.
- The parser rejects rows whose quote isn't in the requested list.
- The daily observation service caches for 1 hour, shares one in-flight refresh, returns stale data after a failed refresh, and throws when nothing is cached.

**Manual checks** (`npm run dev`)

- Pin USD→EUR and GBP→JPY, open Favorites, and confirm both show a rate and a signed % change.
- Click GBP→JPY. The converter shows GBP and JPY, the amount is unchanged, the History tab is active and the chart title reads GBP/JPY.
- Tab to a favorite and press Enter. Same result as clicking. Then tab to its star, press Enter, and the pair is removed.
- Block `/api/daily-observations` in devtools and reload. Rates still show, with no change line.
- `npm run build` succeeds.

## Open questions

- [ ] Should selecting a favorite also scroll the converter into view on mobile, where it sits above the tabs?
- [ ] Should selecting a favorite save its Receive currency as the user's preference? The spec assumes yes, matching a manual pick.
- [ ] Should the ticker move to `/api/daily-observations` later, so there's one Frankfurter request instead of two? That would leave a single cache.
- [ ] Should the History tab stay as the destination, or should the user stay on Favorites and only the converter change?
