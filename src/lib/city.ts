import type { City } from '../types'

/**
 * Presentation helpers for the destination model (flag + display name).
 * Pure formatting — safe to use in the UI. Price estimation lives in the data
 * layer (src/sources/pricing.ts), not here.
 */

/** ISO-3166 alpha-2 → flag emoji (regional indicator letters). */
export const ccToFlag = (cc: string): string => {
  if (!/^[A-Za-z]{2}$/.test(cc)) return '🌍'
  return cc
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
}

/** Flag for a city: explicit override (curated) or derived from country code. */
export const flag = (city: City): string => city.fl || ccToFlag(city.cc)

/** Display name: Hebrew where curated, otherwise the English city name. */
export const cityName = (city: City): string => city.he || city.en
