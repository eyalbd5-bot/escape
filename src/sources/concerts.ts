import type { Concert, ConcertsData, Source } from '../core/types'
import { ok } from '../core/contract'
import { httpGetJson } from '../core/http'
import { CONFIG } from '../core/config'

const KEY = 'ticketmaster'

interface TmEvent {
  id: string
  name: string
  url?: string
  dates?: { start?: { localDate?: string } }
  _embedded?: { venues?: { name?: string }[] }
}
interface TmResponse {
  _embedded?: { events?: TmEvent[] }
}

/** Map a Ticketmaster Discovery response into our Concert list (pure, testable). */
export function mapTmEvents(j: TmResponse | null | undefined): Concert[] {
  const events = j?._embedded?.events ?? []
  return events
    .filter((e) => e?.id && e?.name)
    .map((e) => ({
      id: e.id,
      name: e.name,
      date: e.dates?.start?.localDate ?? '',
      venue: e._embedded?.venues?.[0]?.name ?? '',
      url: e.url ?? '',
    }))
}

/**
 * Concerts of famous artists in the city within the trip window
 * (Ticketmaster Discovery — free key, gated by VITE_TICKETMASTER_API_KEY).
 * Without a key it returns `available:false` and the events screen falls back to
 * the deep-link search. On base44 / with a free key, real listings appear.
 */
export const concertsSource: Source<ConcertsData> = {
  key: KEY,
  tier: 'official',
  async getForDestination(q) {
    if (!CONFIG.ticketmasterKey) {
      return ok<ConcertsData>(KEY, 'official', { concerts: [], available: false })
    }
    const url =
      `${CONFIG.ticketmasterBase}/events.json?classificationName=music` +
      `&city=${encodeURIComponent(q.city.en)}` +
      `&startDateTime=${q.startDate}T00:00:00Z&endDateTime=${q.endDate}T23:59:59Z` +
      `&size=20&sort=date,asc&apikey=${CONFIG.ticketmasterKey}`
    const j = await httpGetJson<TmResponse>(url, { cacheTtlMs: 30 * 60 * 1000 })
    return ok<ConcertsData>(KEY, 'official', { concerts: mapTmEvents(j), available: true })
  },
}
