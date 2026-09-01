/**
 * Escape data-layer contract — the single source of truth for every source and
 * the aggregated response the UI consumes. Framework-agnostic on purpose: this
 * file (and everything under src/core + src/sources + aggregator) must survive a
 * full UI rebuild on a downstream platform. See HANDOFF.md.
 */
import type { City, CountryInfo } from '../types'

/** The one input every source receives. */
export interface DestinationQuery {
  city: City
  /** departure, YYYY-MM-DD */
  startDate: string
  /** return, YYYY-MM-DD */
  endDate: string
  nights: number
}

export type SourceTier = 'official' | 'unofficial'
export type ResultStatus = 'ok' | 'empty' | 'error'

/** The envelope every source returns (carries provenance per architecture §11). */
export interface NormalizedResult<T> {
  source: string
  tier: SourceTier
  status: ResultStatus
  /** ISO timestamp of when the result was produced */
  fetchedAt: string
  data: T | null
  error?: string
  /** normalized key for cross-source de-duplication (events) */
  dedupKey?: string
}

/** The Source Contract — implemented identically by every module. */
export interface Source<T> {
  key: string
  tier: SourceTier
  getForDestination(q: DestinationQuery): Promise<NormalizedResult<T>>
}

/* ---------------- per-source data payloads ---------------- */

export interface CurrencyData {
  base: 'ILS'
  quote: string
  rate: number
}

export interface WeatherDay {
  label: string
  icon: string
  max: number
  min: number
}
export interface WeatherData {
  days: WeatherDay[]
  /** short summary for compact display, e.g. "☀️ 24°" */
  mini: string
}

export interface InfoData {
  /** Hebrew destination description (may be null if unavailable) */
  description: string | null
  /** curated country facts (visa/plug/tz/tips/emergency), null if uncurated */
  country: CountryInfo | null
}

export interface MediaData {
  /** evocative destination photos (rotating hero), best-first */
  images: string[]
  /** single best image for the page background */
  hero: string | null
}

export interface SportsFixture {
  id: string
  title: string
  /** YYYY-MM-DD */
  date: string
  time: string
  venue: string
  league: string
  /** true when the curated team plays at home (i.e. in the destination) */
  home: boolean
}
export interface SportGroup {
  /** mapped club names for this sport */
  teams: string[]
  /** home matches within the trip window, or the soonest upcoming home games */
  fixtures: SportsFixture[]
  /** true when `fixtures` fall inside the trip window */
  inWindow: boolean
  /** when nothing falls in-window: the soonest upcoming home game (the "move your trip" fallback) */
  nearest?: SportsFixture
}
export interface TennisEvent {
  name: string
  venue: string
  start: string
  end: string
}
export interface SportsData {
  /** football (league + European home games) */
  football: SportGroup
  /** basketball (NBA / EuroLeague home games) */
  basketball: SportGroup
  /** tennis tournaments in the city overlapping the trip window */
  tennis: TennisEvent[]
  /** World Cup 2026 fixtures in this host city within the trip window */
  worldCup: SportsFixture[]
  /** true if the destination is a WC 2026 host and dates overlap the tournament */
  worldCupHost: boolean
}

export interface LinkItem {
  label: string
  sub?: string
  href: string
  tier?: SourceTier
  emoji?: string
}

export interface PriceRange {
  /** estimate low/high in ₪ */
  lo: number
  hi: number
  /** true when derived from distance rather than a curated baseline */
  estimated: boolean
}

/** One real flight option (from a live-price API — never fabricated). */
export interface FlightOffer {
  airline: string
  /** price in the given currency (₪ by default) */
  price: number
  currency?: string
  /** departure date "YYYY-MM-DD" (shown because the flexible list spans dates) */
  date?: string
  /** local depart/arrive "HH:MM" when available */
  depart?: string
  arrive?: string
  /** total trip minutes when available */
  durationMin?: number
  /** number of stops (0 = direct) */
  stops: number
  /** booking / Google-Flights deep link for this option */
  href: string
}
export interface FlightsData {
  range: PriceRange
  links: LinkItem[]
  /** AI flight-search assistants (key-free deep links, pre-filled with route+dates) */
  bots: LinkItem[]
  /** prefix that gives the chatbot the route + dates context for a free-text question */
  askContext: string
  /** real priced flight options — empty until a live-price source is connected
   *  (Travelpayouts/Kiwi via a Cloudflare Function / base44; see AGENTS.md rule 3). */
  offers: FlightOffer[]
  /** ISO date the cached prices were last refreshed, shown for transparency */
  pricesUpdatedAt?: string
  /** true when the offers are one-way outbound prices (round-trip cache was thin) */
  offersOneWay?: boolean
}
export interface HotelsData {
  range: PriceRange
  nights: number
  links: LinkItem[]
}
/** A conference / expo / trade show — the "anchor" a trip can be built around. */
export interface Conference {
  name: string
  /** Hebrew name/label when curated */
  he?: string
  venue: string
  /** YYYY-MM-DD */
  start: string
  /** YYYY-MM-DD */
  end: string
  url: string
  /** short context, e.g. "אשכול Food Service — 7 תערוכות" */
  cluster?: string
  /** authoritative source label shown on the badge, e.g. "excel.london" */
  source: string
}

/** A marquee musical/show resolved against a trip window (schedule-aware). */
export interface MusicalPick {
  name: string
  he?: string
  venue: string
  url: string
  source: string
  /** true when it performs every evening of the window (no dark days) */
  everyNight: boolean
  /** dates within the window on which it actually performs (YYYY-MM-DD) */
  datesInWindow: string[]
  /** human label for the dark-day caveat, e.g. "חשוך ג׳–ד׳" (empty when everyNight) */
  darkLabel?: string
  /** true when it does NOT perform on one or more window evenings (a caveat to surface) */
  hasDark: boolean
}

export interface EventsData {
  /** curated conferences/expos overlapping the window (anchor = [0]) */
  conferences: Conference[]
  /** curated marquee musicals bookable in the window, schedule-resolved */
  musicals: MusicalPick[]
  /** marquee events in a REACHABLE nearby city, in-window (e.g. a UCL match one train away) */
  nearby: NearbyEvent[]
  official: LinkItem[]
  unofficial: LinkItem[]
}

/** A high-value event in a city near the trip anchor, within reach for a day/evening trip. */
export interface NearbyEvent {
  category: 'sports' | 'concert' | 'theatre' | 'festival' | 'expo'
  /** exact event name (Latin) */
  name: string
  /** Hebrew name, if well-known */
  he?: string
  /** the nearby city, Latin (e.g. "Dortmund") */
  city: string
  /** the nearby city, Hebrew (e.g. "דורטמונד") */
  cityHe: string
  venue: string
  /** YYYY-MM-DD */
  date: string
  url: string
  source: string
  /** travel note from the anchor, e.g. "≈2 ש׳ ברכבת מפרנקפורט" */
  travel: string
}

export interface Concert {
  id: string
  name: string
  /** YYYY-MM-DD */
  date: string
  venue: string
  url: string
}
export interface ConcertsData {
  concerts: Concert[]
  /** true when a Ticketmaster key is configured (else only deep links apply) */
  available: boolean
}
export interface RestaurantsData {
  categories: LinkItem[]
}
/** A real attraction with a photo, a description, and a directions link. */
export interface ItineraryPlace {
  name: string
  description: string
  image: string | null
  /** Google Maps directions link to this place */
  mapsUrl: string
  lat?: number
  lng?: number
}
/** One planned day: a theme, a few places, and a practical tip. */
export interface ItineraryDay {
  n: number
  theme: string
  places: ItineraryPlace[]
  tip: string
}
export interface ItineraryData {
  days: ItineraryDay[]
  /** how the day plan was produced */
  planner: 'ai' | 'curated' | 'wikipedia' | 'skeleton'
  /** optional "deepen with AI" chat links (prefilled prompt) */
  planners: LinkItem[]
  /** Hebrew context prefix for the "ask the guide" Q&A box */
  askContext: string
}

/* ---------------- the aggregated response (single UI contract) ---------------- */

export interface AggregatedResponse {
  destination: {
    city: City
    startDate: string
    endDate: string
    nights: number
  }
  generatedAt: string
  currency: NormalizedResult<CurrencyData>
  weather: NormalizedResult<WeatherData>
  info: NormalizedResult<InfoData>
  media: NormalizedResult<MediaData>
  sports: NormalizedResult<SportsData>
  concerts: NormalizedResult<ConcertsData>
  flights: NormalizedResult<FlightsData>
  hotels: NormalizedResult<HotelsData>
  events: NormalizedResult<EventsData>
  restaurants: NormalizedResult<RestaurantsData>
  itinerary: NormalizedResult<ItineraryData>
}
