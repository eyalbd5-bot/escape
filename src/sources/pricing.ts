/**
 * Price estimation (data layer). Curated baselines where available, otherwise a
 * distance-from-TLV estimate. Placeholder until a keyed price source is wired
 * (spec §8). Lives with the sources, not the UI — components only read results.
 */
import type { City } from '../types'

/** Tel Aviv (Ben Gurion) coordinates — origin for distance estimates. */
const TLV = { lat: 32.0114, lng: 34.8867 }

const toRad = (d: number) => (d * Math.PI) / 180

/** Great-circle distance (km) between two lat/lng points. */
function haversine(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const dLat = toRad(bLat - aLat)
  const dLng = toRad(bLng - aLng)
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(s))
}

/** Round-trip flight estimate base (₪): curated, else derived from distance. */
export function flightBase(city: City): number {
  if (typeof city.base === 'number') return city.base
  if (typeof city.lat === 'number' && typeof city.lng === 'number') {
    const km = haversine(TLV.lat, TLV.lng, city.lat, city.lng)
    return Math.max(500, Math.round((350 + km * 0.34) / 10) * 10)
  }
  return 1500
}

/** Per-night hotel estimate (₪): curated value or a default. */
export function nightlyRate(city: City): number {
  return typeof city.nightly === 'number' ? city.nightly : 450
}

/** True when the city has no curated flight baseline (range is estimated). */
export const isEstimated = (city: City): boolean => typeof city.base !== 'number'
