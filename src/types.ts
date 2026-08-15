export interface City {
  /** English city name (always present) */
  en: string
  /** IATA code (always present) */
  iata: string
  /** ISO-3166 alpha-2 country code (always present) */
  cc: string
  /** ISO currency code (always present) */
  cur: string
  /** Hebrew name — only for curated featured cities */
  he?: string
  /** alternate spelling for search (e.g. airport municipality) */
  alt?: string
  /** flag emoji override — otherwise derived from `cc` */
  fl?: string
  lat?: number
  lng?: number
  /** curated round-trip flight estimate base (₪); otherwise derived from distance */
  base?: number
  /** curated per-night hotel estimate (₪); otherwise a default */
  nightly?: number
  /** 2–3 curated central landmarks (preview for the itinerary tile) */
  sights?: string[]
  /** main events arena/venue (preview for the events tile) */
  venue?: string
  /** true for the hand-curated cities shown first in the picker */
  featured?: boolean
}

export interface CountryInfo {
  plug: string
  tip: string
  tz: string
  visa: string
  sim: string
  emer: string
}

export interface Trip {
  city: City
  /** departure date, YYYY-MM-DD */
  d1: string
  /** return date, YYYY-MM-DD */
  d2: string
  /** number of nights */
  nights: number
}

export type ViewKey =
  | 'home'
  | 'itinerary'
  | 'flights'
  | 'hotels'
  | 'events'
  | 'restaurants'
  | 'currency'
  | 'info'
  | 'emergency'
