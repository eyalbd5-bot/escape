# Escape — Handoff to the downstream platform

This repo's durable asset is the **data + integration + aggregation layer**, not the
UI. The React UI under `src/components` is a *working reference* — regenerate it on
the target platform (Lovable / Bolt / v0). Everything the UI needs comes from **one
function**. Rebuild your UI on top of that function and you're done.

---

## The single entry point

```ts
import { getDestinationData } from './src/aggregator'
import type { AggregatedResponse, DestinationQuery } from './src/core/types'

const response: AggregatedResponse = await getDestinationData(query)
```

- **Pure async function.** No backend, no server, no React. Call it from anywhere.
- **Never rejects.** It always resolves to a full `AggregatedResponse`; a failing
  source becomes an `error`/`empty` result in its own slot and never affects others.
- **Fans out concurrently** to all sources with a per-source timeout.

To expose it as an HTTP endpoint instead (no-code platforms), wrap it in a
serverless function: `(req) => getDestinationData(req.body)` returning JSON. The
shapes below are already serializable.

### Input — `DestinationQuery`

```ts
interface DestinationQuery {
  city: City          // from src/data/cities.ts (en, iata, cc, cur, he?, lat?, lng?, base?, nightly?, sights?, venue?)
  startDate: string   // 'YYYY-MM-DD'
  endDate: string     // 'YYYY-MM-DD'
  nights: number
}
```

The destination picker dataset lives in `src/data/cities.ts` (`FEATURED` = 24 curated,
`ALL_CITIES` = ~3,100 from OpenFlights). Pick a `City`, add dates → that's the query.

### Output — `AggregatedResponse`

```ts
interface AggregatedResponse {
  destination: { city, startDate, endDate, nights }
  generatedAt: string                       // ISO
  currency:    NormalizedResult<CurrencyData>
  weather:     NormalizedResult<WeatherData>
  info:        NormalizedResult<InfoData>
  media:       NormalizedResult<MediaData>
  sports:      NormalizedResult<SportsData>
  flights:     NormalizedResult<FlightsData>
  hotels:      NormalizedResult<HotelsData>
  events:      NormalizedResult<EventsData>
  restaurants: NormalizedResult<RestaurantsData>
  itinerary:   NormalizedResult<ItineraryData>
}
```

Every section is a `NormalizedResult<T>` — render it by reading `.status` then `.data`:

```ts
interface NormalizedResult<T> {
  source: string                     // which source produced it
  tier: 'official' | 'unofficial'    // provenance (architecture §11)
  status: 'ok' | 'empty' | 'error'   // <- drive your per-section UI on this
  fetchedAt: string
  data: T | null                     // present when status === 'ok'
  error?: string
  dedupKey?: string
}
```

**UI rule:** `status === 'ok'` → render `data`; `'empty'` → show a "nothing here"
state; `'error'` → show a fallback message. A missing section never blocks the page.

All payload types (`CurrencyData`, `WeatherData`, `SportsData`, …) are defined and
documented in **`src/core/types.ts`** — that file is the contract. Read it first.

---

## What each section gives the UI

| Section | `data` shape (when `ok`) |
|---|---|
| `currency` | `{ base:'ILS', quote, rate }` — convert in the UI: `amount * rate` |
| `weather` | `{ days: [{label, icon, max, min}], mini }` (5-day) |
| `info` | `{ description (he), country: {plug,tip,tz,visa,sim,emergency} }` |
| `media` | `{ images: string[] (rotate), hero: string }` |
| `sports` | `{ teams: string[], club: Fixture[] (home games), clubInWindow, worldCup: Fixture[], worldCupHost }` |
| `concerts` | `{ concerts: [{name,date,venue,url}], available }` — needs `VITE_TICKETMASTER_API_KEY` (free); else `available:false` and the events screen uses deep links |
| `flights` | `{ range: {lo,hi,estimated}, links: [{label,sub,href}] }` |
| `hotels` | `{ range, nights, links }` |
| `events` | `{ official: LinkItem[], unofficial: LinkItem[] }` (each link tagged with `tier`) |
| `restaurants` | `{ categories: [{emoji,label,sub,href}] }` |
| `itinerary` | `{ days: [{n, theme, places: [{name, description, image}], tip}], planner, planners, askContext }` |

The `itinerary` source is a virtual tour guide: it pulls real attractions (curated
sights + Wikipedia GeoSearch) with photos + Hebrew descriptions and groups them into
themed days. `planner` is `'ai' | 'curated' | 'wikipedia' | 'skeleton'`. Day planning
is swappable: set `VITE_GEMINI_API_KEY` to let Gemini organize the (real, photo-bearing)
places into a narrative, otherwise a key-free template is used. On base44 / Lovable,
replace the `aiDays()` call in `src/sources/itinerary.ts` with the platform's AI.

Prices are ₪ numbers (format in the UI). `links`/`href` are ready-to-open deep links.

---

## Environment variables (all optional)

The app runs with **zero config** (key-free defaults). Every endpoint is overridable
so the same logic runs unchanged elsewhere. Defined in `src/core/config.ts`:

```
VITE_ORIGIN_IATA          # trip origin (default TLV)
VITE_FRANKFURTER_BASE      # currency (default https://api.frankfurter.dev/v1)
VITE_OPENMETEO_GEOCODE     # weather geocoding
VITE_OPENMETEO_FORECAST    # weather forecast
VITE_COMMONS_API           # destination images
VITE_SPORTSDB_BASE         # sports fixtures + World Cup
VITE_WIKI_REST             # destination description (use {lang} placeholder)
VITE_HTTP_TIMEOUT_MS       # per-request timeout (default 8000)
VITE_SOURCE_TIMEOUT_MS     # per-source timeout (default 9000)
```

No secrets today (all sources are key-free). When a keyed source is added later, its
key goes here too — **never inlined in code**. See `.env.example`.

---

## Architecture map (what survives the UI rebuild)

```
src/
  core/
    types.ts      ← THE CONTRACT: DestinationQuery, NormalizedResult, AggregatedResponse, payloads
    contract.ts   ← runSource() runner (timeout, never-throws, ok/empty/fail factories)
    http.ts       ← shared fetch: timeout + retry + TTL cache
    config.ts     ← endpoints/tunables from env (with defaults)
  sources/        ← one file per source, each implements Source<T>; pure data layer
    currency, weather, info, media, sports, flights, hotels, events, restaurants, itinerary
    pricing.ts    ← price estimation (distance-from-TLV); index.ts ← registry
  aggregator.ts   ← getDestinationData(): the single entry point  ★
  data/           ← static datasets (cities, countries, sportsTeams, worldCup)
  lib/            ← pure helpers: links (URL builders), format, city (flag/name)
  components/     ← REFERENCE UI ONLY — replaceable; contains no fetch/transform logic
```

The top half (`core` + `sources` + `aggregator` + `data` + `lib`) is framework-agnostic
and is what you keep. `components/` is the part the downstream platform regenerates.

---

## Adding a new source (e.g. a keyed events API)

1. Create `src/sources/<name>.ts` exporting a `Source<T>`:
   ```ts
   export const xSource: Source<XData> = {
     key: 'x', tier: 'official',
     async getForDestination(q) {
       const json = await httpGetJson(`${CONFIG.xBase}/...`)
       return json ? ok('x','official', normalize(json)) : empty('x','official')
     },
   }
   ```
   Fetch only through `httpGetJson`; return `ok` / `empty`; let errors throw (the
   runner converts them to an `error` result).
2. Add its payload type + slot to `AggregatedResponse` in `core/types.ts`.
3. Register it in `sources/index.ts` and add a `runSource(xSource, q)` line to the
   aggregator's `Promise.all`.
4. Add a `src/sources/<name>.test.ts` (success + source-down).

The contract stays the single source of truth — change it once, centrally.

---

## Quality gates (current state)

- `npm run build` → types compile, production bundle builds.
- `npm run test` → 15 tests pass: every source's success path, the **source-is-down**
  case, and the aggregator's **partial-tolerance** (all-sources-down still returns a
  full response with link sections `ok` and curated `info` intact).
- UI carries no business logic — it only reads `AggregatedResponse`.
- Zero secrets, zero monthly cost; standard Vite + React + TS stack.
