# AGENTS.md — Escape operating manual

Read this first. It is the harness: the conventions, iron rules, and verification an
agent needs to change Escape reliably. When something fails, **check the harness (this
file, the env, the tests) before blaming the model.**

## What Escape is
A personal, Hebrew **RTL**, mobile-first **travel-discovery** SPA. Pick a city + dates →
one page with flights, hotels, itinerary, **events**, restaurants, currency, info.
Stack: **Vite 5 + React 18 + TypeScript + Vitest**. Destined for **base44** (keep logic
portable). Origin airport is always **TLV**.

Location: `/Users/eyalbendavid/Downloads/files 2/escape` · Node ≥18 (local uses
`~/.local/node/bin`; Cloudflare Pages uses `NODE_VERSION=22`). Not yet a git repo.

## Architecture (do not break)
Source Contract → aggregator → **pure UI**. Logic never lives in components.
- `src/sources/*` — each implements `Source<T>`, returns a `NormalizedResult<T>`
  envelope (`source/tier/status/fetchedAt/data/error/dedupKey`).
- `src/aggregator.ts` — the **single** entry point `getDestinationData(query)`; fans out
  concurrently, partial-tolerant (one source failing never breaks others).
- `src/components/views/*` — pure; read the `AggregatedResponse`, render, never fetch.
- `src/core/*` — types, config (all endpoints via `VITE_*` env with key-free defaults).
- `src/data/*` — curated catalogs keyed by **city IATA** (`conferences.ts`, `musicals.ts`,
  `sportsTeams.ts`, `tennis.ts`, `worldCup.ts`, `cities.ts` + `citiesFull.json`).

Cities with curated events (10): `LON NYC BER PAR MAD VIE BCN MUC AMS ROM`.

## Iron rules
1. **Never fabricate data.** No invented fixture, price, show, venue, or date. Every
   curated item carries a real `source`. Research via the web, cite official sources,
   **flag uncertainty, seed only what is confirmed.** Accuracy is the user's #1 value.
   Enforced by **`npm run verify`**: `src/data/integrity.test.ts` (every curated item has a
   source + valid dates) **and** `scripts/check-no-fabrication.mjs` (no placeholder/mock
   content, no `Math.random` in the data layer). Do NOT import unverified third-party/AI
   content as fact — treat it as a research lead and confirm each item against a real source.
2. **Everything stays FREE.** No paid tiers. Key-free by default; free keys (Ticketmaster)
   are env-gated and live on base44/Cloudflare, never committed.
3. **CORS reality.** Browser-callable (no proxy): TheSportsDB, Frankfurter, Open-Meteo,
   Wikipedia (`origin=*`), SeatGeek, Skiddle. **Server-only** (needs a Cloudflare Pages
   Function / base44 proxy — no CORS + key would leak): **football-data.org, Ticketmaster
   Discovery, JamBase, PredictHQ**. Don't wire a server-only API straight into the SPA.
4. **RTL / bidi.** Date ranges flip in RTL — render them via the `<Range>` helper
   (`dir="ltr"; unicode-bidi:isolate`). Wrap Latin/foreign names in `<bdi>`. **Format
   dates in LOCAL time, never `toISOString()` (UTC)** — UTC shifted dates a day back in
   Israel's offset and caused a real bug (`localYmd` in `musicals.ts`; `ymd` in
   `format.ts`).
5. **Shows have run windows.** `musicals.ts` items use optional `opensOn` + `bookingUntil`;
   `musicalsInWindow` clamps performing dates to run∩window (hide a show before it opens).
6a. **Flight prices.** Real priced options come from `functions/api/flights.js` (a Cloudflare
   Pages Function proxying Travelpayouts; token = server-side env `TRAVELPAYOUTS_TOKEN`, never
   a `VITE_` var). The SPA fetches same-origin `/api/flights`; empty in local dev → the flights
   view shows deep-links only. Each priced row clicks through to **Google Flights**.
6b. **Agent-discovered events (LIVE, direct pipe).** The "Escape Scout" Grok Bot POSTs its
   ESCAPE_EVENTS JSON each morning straight to **`functions/api/discovered.js`** (Cloudflare
   Pages Function → **KV** `DISCOVERED_KV`, guarded by header `X-Admin-Token` = env
   `DISCOVERED_TOKEN`). The Function validates every item (category/IATA/name/venue/source/url/
   dates) and dedups — unsourced/malformed are rejected server-side. The SPA reads it LIVE:
   `eventsSource` fetches same-origin `/api/discovered?city=&d1=&d2=` and merges theatre items
   into the musicals tab (empty in local dev → curated only, like `/api/flights`).
   `src/data/discovered.json` is now the **seed** (pushed once via `node scripts/seed-discovered.mjs`)
   and the integrity fixture; `npm run add-events <file>` still appends to it for offline curation.
   Server validation can't verify a well-formed claim against its source — spot-audit periodically
   (rule 1: AI output is a lead, not fact).
6c. **Nearby-city events ("worth the hop").** A trip anchored in city X should surface marquee
   events one short train/hop away (the motivating case: a Frankfurt trip 7–10 Dec while Dortmund
   host Inter in the UCL on the 9th, ~2h by ICE). `src/data/nearby.ts`: `NEARBY` (anchor IATA →
   reachable cities + Hebrew travel note) and `NEARBY_EVENTS` (curated + VERIFIED marquee events
   keyed by anchor IATA — real source + date, integrity-tested). `eventsSource` fills
   `EventsData.nearby` from the curated set PLUS live `/api/discovered` for each reachable city
   (sports/concert only), rendered as teal "🚆 שווה קפיצה" cards above the tabs. Add a curated
   nearby event only after verifying the fixture against an official source (rule 1).
6. **Concerts.** Real listings need a server proxy (rule 3). The current key-free default
   is the **ConcertBot** (AI deep-link, like the flight bot) in `EventsView`. Ticket-site
   search links always sit **at the bottom** ("עוד מקורות"); real concerts, when a source
   is connected, render **above** the bot.
7. **Default trip dates = next week** (`nextWeekRange()` in `format.ts`), computed live.

## Design system — "Nocturne" (the CSS owns the look)
`src/styles/global.css` owns all styling; **class names are stable**, so re-skin via CSS,
don't churn components. Dark cinematic-luxe: canvas `#080b11`, real glass cards, aurora
teal `--teal #2ee6c6`/`--teal2 #12b6d0`, gold `--gold #c9a24a` (conference anchor), coral
CTAs `--coral #ff5a5f`/`--coral2 #ff2e6a`. Fonts: Rubik (display) + Assistant (body).
Events layout: centred `.evview` (520px mobile → 860px desktop) with anchor + selector
full-width and event cards in a 2-column `.panel` grid at ≥860px.

## Verification — Definition of Done
A change is done only when **all** of these hold:
- `npm run verify` passes (no-fabrication lint + `vitest run` incl. data-integrity +
  `tsc -b` + `vite build`).
- Verified in-browser at **both** mobile (375) and desktop (≥1040) — no overflow, no
  broken layout; RTL/bidi visually correct (dates read left-to-right, names not reversed).
- No fabricated data; any new curated item has a real `source` + valid dates.
- Nothing introduced that needs a paid tier or a browser call to a server-only API.

### Definition-of-Done template (fill per feature before building)
```
GOAL:        <one sentence, user-facing>
DATA SOURCE: <which free API/catalog; browser-callable or server-only?>
ACCURACY:    <how each datum is sourced/verified; what's flagged uncertain>
UI:          <mobile + desktop behavior; RTL/bidi points>
DONE WHEN:   npm run verify green + browser-verified mobile&desktop + sources cited
```

## Commands
```bash
export PATH="$HOME/.local/node/bin:$PATH"
npm install
npm run dev        # local dev server (port 5173)
npm run verify     # tests (+ data integrity) + typecheck + build — the gate
npm run build      # tsc -b && vite build → dist/
```
Deploy: **Cloudflare Pages** (see `DEPLOY_CLOUDFLARE.md`) — Git integration auto-builds on
push. Local review: serve `dist/` with `python -m http.server` + `npx cloudflared` (quick
tunnels are flaky — prefer the Pages deploy for a stable link).

## When you hit a failure (the diagnostic loop)
Execute → observe → attribute to a harness layer → fix that layer → re-run. Map it:
requirement unclear? → get a Definition of Done. Convention unknown? → it belongs here.
Env broken? → fix setup/deploy. Can't tell if it worked? → add a verify check. Lost
context across sessions? → write it into this file or a data-file comment (and the
maintainer's memory). Real examples: the bidi date-flip = convention gap (now rule 4);
concerts missing = CORS/env (rule 3); tunnel drops = env (use Pages).

See also: `README.md`, `HANDOFF.md` (data layer), `BASE44.md` (migration),
`DEPLOY_CLOUDFLARE.md` (deploy).
