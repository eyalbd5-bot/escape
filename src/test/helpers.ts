import { vi } from 'vitest'
import type { City } from '../types'
import type { DestinationQuery } from '../core/types'

/** A curated sample destination (featured, with sports team, no WC host). */
export const TOKYO: City = {
  he: 'טוקיו',
  en: 'Tokyo',
  iata: 'TYO',
  cur: 'JPY',
  fl: '🇯🇵',
  base: 3600,
  nightly: 620,
  cc: 'JP',
  lat: 35.6762,
  lng: 139.6503,
  sights: ['שיבויה', 'מקדש סנסוג׳י', 'מגדל טוקיו'],
  venue: 'Tokyo Dome',
  featured: true,
}

export const QUERY: DestinationQuery = {
  city: TOKYO,
  startDate: '2026-09-09',
  endDate: '2026-09-14',
  nights: 5,
}

interface Route {
  match: string
  json: unknown
  ok?: boolean
}

/** Stub global fetch: first route whose substring matches the URL wins. */
export function mockFetch(routes: Route[]): void {
  globalThis.fetch = vi.fn(async (input: unknown) => {
    const url = String(input)
    const r = routes.find((x) => url.includes(x.match))
    const ok = r ? (r.ok ?? true) : false
    return {
      ok,
      status: ok ? 200 : 404,
      json: async () => (r ? r.json : {}),
    } as Response
  }) as unknown as typeof fetch
}

/** Stub global fetch to always fail (the source-is-down case). */
export function mockFetchDown(): void {
  globalThis.fetch = vi.fn(async () => {
    throw new Error('network down')
  }) as unknown as typeof fetch
}
