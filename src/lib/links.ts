/** Deep-link builders (spec §7). All key-free, link-out only. */

import { ORIGIN } from '../data/cities'

/** "2026-09-09" -> "260909" (Skyscanner path format) */
const yymmdd = (s: string) => s.slice(2).replace(/-/g, '')

export const skyscanner = (toIata: string, d1: string, d2: string) =>
  `https://www.skyscanner.co.il/transport/flights/${ORIGIN.toLowerCase()}/${toIata.toLowerCase()}/${yymmdd(d1)}/${yymmdd(d2)}/`

/* Google Flights deep-link.
 * The natural-language ?q= form does NOT auto-run the search (it only pre-fills the
 * origin, leaving destination + dates blank). The reliable way to land straight on a
 * results page is the `tfs=` param — a base64 protobuf describing the exact itinerary.
 * We build that protobuf by hand (no dependency). Schema (from the public reverse-eng.
 * of Google Flights): Info{ data[3]=FlightData, passengers[8], seat[9], trip[19] },
 * FlightData{ date[2], from[13]=Airport, to[14]=Airport }, Airport{ code[2] }. */
const pbVarint = (n: number): number[] => {
  const out: number[] = []
  while (n > 0x7f) {
    out.push((n & 0x7f) | 0x80)
    n >>>= 7
  }
  out.push(n)
  return out
}
const pbTag = (field: number, wire: number) => pbVarint((field << 3) | wire)
const pbStr = (field: number, s: string): number[] => {
  const b = Array.from(new TextEncoder().encode(s))
  return [...pbTag(field, 2), ...pbVarint(b.length), ...b]
}
const pbMsg = (field: number, body: number[]): number[] => [
  ...pbTag(field, 2),
  ...pbVarint(body.length),
  ...body,
]
const pbInt = (field: number, v: number): number[] => [...pbTag(field, 0), ...pbVarint(v)]
const gfAirport = (code: string) => pbStr(2, code.toUpperCase())
const gfLeg = (date: string, from: string, to: string): number[] => [
  ...pbStr(2, date),
  ...pbMsg(13, gfAirport(from)),
  ...pbMsg(14, gfAirport(to)),
]
const gfB64 = (bytes: number[]): string => {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin)
}

/** Google Flights results deep-link (tfs protobuf) — TLV↔dest round trip, auto-runs. */
export const googleFlights = (toIata: string, d1: string, d2: string) => {
  const info: number[] = [
    ...pbMsg(3, gfLeg(d1, ORIGIN, toIata)),
    ...pbMsg(3, gfLeg(d2, toIata, ORIGIN)),
    ...pbInt(8, 1), // passengers: one adult
    ...pbInt(9, 1), // seat: economy
    ...pbInt(19, 1), // trip: round trip
  ]
  return `https://www.google.com/travel/flights?tfs=${encodeURIComponent(gfB64(info))}&hl=he&curr=ILS`
}

/** Kayak round-trip search TLV → destination (auto-runs on load).
 * Note: kayak.co.il is a parked domain — the real booking site is kayak.com. */
export const kayak = (toIata: string, d1: string, d2: string) =>
  `https://www.kayak.com/flights/${ORIGIN}-${toIata.toUpperCase()}/${d1}/${d2}?sort=bestflight_a`

export const booking = (cityEn: string, d1: string, d2: string) =>
  `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(cityEn)}&checkin=${d1}&checkout=${d2}&group_adults=2`

export const ticketmaster = (cityEn: string) =>
  `https://www.ticketmaster.com/search?q=${encodeURIComponent(cityEn)}`

export const webEvents = (cityEn: string) =>
  `https://www.google.com/search?q=${encodeURIComponent('events concerts ' + cityEn + ' 2026')}`

/** Concert listings — unofficial / supplementary sources (key-free deep links). */
export const songkick = (cityEn: string) =>
  `https://www.songkick.com/search?query=${encodeURIComponent(cityEn)}`

export const eventim = (cityEn: string) =>
  `https://www.eventim.de/en/search/?searchterm=${encodeURIComponent(cityEn)}`

export const bandsintown = (cityEn: string) =>
  `https://www.bandsintown.com/?searchFilter=${encodeURIComponent(cityEn)}`

export const gmaps = (query: string) =>
  `https://www.google.com/maps/search/${encodeURIComponent(query)}`

/** Google Maps directions to a destination (place name or "lat,lng"). */
export const mapsDir = (destination: string) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`

export const airalo = (slug: string) => `https://www.airalo.com/${slug}-esim`

/** MICHELIN Guide search for a city. */
export const michelin = (cityEn: string) =>
  `https://guide.michelin.com/en/search?q=${encodeURIComponent(cityEn)}`

/** Israeli MFA travel-warning page. */
export const TRAVEL_WARNING =
  'https://www.gov.il/he/departments/topics/travel_warning_overseas'

/* ---------- AI chatbots with a pre-filled prompt (key-free, link-out) ---------- */

export const perplexity = (prompt: string) =>
  `https://www.perplexity.ai/search?q=${encodeURIComponent(prompt)}`

export const chatgpt = (prompt: string) =>
  `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`

export const claudeChat = (prompt: string) =>
  `https://claude.ai/new?q=${encodeURIComponent(prompt)}`
