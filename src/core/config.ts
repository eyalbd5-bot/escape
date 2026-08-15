/**
 * Endpoints and tunables — all overridable via Vite env vars so the same logic
 * runs unchanged in another environment (orchestrator: config via env, never
 * inlined). Sensible key-free defaults mean zero config is required.
 */
const env = (import.meta as unknown as { env: Record<string, string | undefined> }).env || {}

const pick = (key: string, fallback: string) => env[key] ?? fallback

export const CONFIG = {
  /** trip origin airport (spec assumes TLV) */
  origin: pick('VITE_ORIGIN_IATA', 'TLV'),

  /** live flight-price proxy (Cloudflare Pages Function). Same-origin by default;
   *  returns {} in local dev (no Function) → the flights view falls back gracefully. */
  flightsApi: pick('VITE_FLIGHTS_API', '/api/flights'),

  frankfurterBase: pick('VITE_FRANKFURTER_BASE', 'https://api.frankfurter.dev/v1'),
  openMeteoGeocode: pick('VITE_OPENMETEO_GEOCODE', 'https://geocoding-api.open-meteo.com/v1'),
  openMeteoForecast: pick('VITE_OPENMETEO_FORECAST', 'https://api.open-meteo.com/v1'),
  commonsApi: pick('VITE_COMMONS_API', 'https://commons.wikimedia.org/w/api.php'),
  sportsDbBase: pick('VITE_SPORTSDB_BASE', 'https://www.thesportsdb.com/api/v1/json/3'),

  /** Wikipedia REST summary base for a given language code */
  wikiSummary: (lang: string) =>
    pick('VITE_WIKI_REST', 'https://{lang}.wikipedia.org/api/rest_v1').replace('{lang}', lang),

  /** Wikipedia Action API per language (GeoSearch + page enrichment) */
  wikiAction: (lang: string) =>
    pick('VITE_WIKI_ACTION', 'https://{lang}.wikipedia.org/w/api.php').replace('{lang}', lang),

  /** Optional Ticketmaster Discovery (concerts). Empty → deep-link search only. */
  ticketmasterKey: pick('VITE_TICKETMASTER_API_KEY', ''),
  ticketmasterBase: pick('VITE_TICKETMASTER_BASE', 'https://app.ticketmaster.com/discovery/v2'),

  /** Optional AI itinerary planner (Google Gemini). Empty → key-free Wikipedia plan. */
  geminiKey: pick('VITE_GEMINI_API_KEY', ''),
  geminiModel: pick('VITE_GEMINI_MODEL', 'gemini-1.5-flash'),
  geminiBase: pick('VITE_GEMINI_BASE', 'https://generativelanguage.googleapis.com/v1beta'),

  /** default per-request network timeout */
  timeoutMs: Number(pick('VITE_HTTP_TIMEOUT_MS', '8000')),
  /** default per-source timeout enforced by the runner */
  sourceTimeoutMs: Number(pick('VITE_SOURCE_TIMEOUT_MS', '9000')),
} as const
