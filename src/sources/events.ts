import type { EventsData, NearbyEvent, Source } from '../core/types'
import { ok } from '../core/contract'
import { CONFIG } from '../core/config'
import { cityName } from '../lib/city'
import { ticketmaster, songkick, eventim, bandsintown, webEvents } from '../lib/links'
import { conferencesInWindow } from '../data/conferences'
import { musicalsInWindow, resolveMusicals, type Musical } from '../data/musicals'
import { NEARBY, nearbyEventsInWindow } from '../data/nearby'

const KEY = 'events-deeplinks'

/** Shape returned by /api/discovered (the KV-backed agent feed; raw ESCAPE_EVENTS schema). */
interface DiscoveredRow {
  category: string
  city_iata: string
  name: string
  he?: string
  venue: string
  date_start: string
  date_end?: string | null
  url: string
  source: string
}

/**
 * Live agent-discovered theatre shows for a city, schedule-resolved against the window.
 * Reads the same-origin Cloudflare Function `/api/discovered` (KV store the Escape Scout
 * Grok Bot POSTs to each morning). Empty/unavailable in local dev → curated shows only,
 * exactly like `/api/flights`. Non-theatre categories are ignored here (wired per-tab).
 */
async function discoveredMusicals(iata: string, d1: string, d2: string): Promise<Musical[]> {
  try {
    const url = `${CONFIG.discoveredApi}?city=${encodeURIComponent(iata)}&d1=${d1}&d2=${d2}`
    const r = await fetch(url)
    if (!r.ok) return []
    if (!(r.headers.get('content-type') || '').includes('json')) return [] // dev SPA HTML fallback
    const rows: DiscoveredRow[] = (await r.json())?.events ?? []
    const shows: Musical[] = rows
      .filter((e) => e.category === 'theatre')
      .map((e) => ({
        name: e.name,
        he: e.he,
        venue: e.venue,
        url: e.url,
        source: e.source,
        opensOn: e.date_start,
        bookingUntil: e.date_end ?? '2099-12-31',
      }))
    return shows
  } catch {
    return []
  }
}

/** Fetch a city's discovered rows from the live feed (empty on any failure / in dev). */
async function discoveredRows(iata: string, d1: string, d2: string): Promise<DiscoveredRow[]> {
  try {
    const r = await fetch(`${CONFIG.discoveredApi}?city=${encodeURIComponent(iata)}&d1=${d1}&d2=${d2}`)
    if (!r.ok || !(r.headers.get('content-type') || '').includes('json')) return []
    return (await r.json())?.events ?? []
  } catch {
    return []
  }
}

/**
 * Marquee events one short hop from the anchor: curated + verified (always on), plus any live
 * agent-discovered sports/concerts in the reachable cities, each labelled with the travel note.
 */
async function nearbyEvents(
  iata: string,
  d1: string,
  d2: string,
  anchorHe: string,
): Promise<NearbyEvent[]> {
  const curated = nearbyEventsInWindow(iata, d1, d2)
  const seen = new Set(curated.map((e) => e.name.toLowerCase()))
  const live: NearbyEvent[] = []
  for (const nc of NEARBY[iata] ?? []) {
    const rows = await discoveredRows(nc.iata, d1, d2)
    for (const e of rows) {
      if (e.category !== 'sports' && e.category !== 'concert') continue // only "worth the hop" kinds
      if (seen.has(e.name.toLowerCase())) continue
      seen.add(e.name.toLowerCase())
      live.push({
        category: e.category,
        name: e.name,
        he: e.he,
        city: nc.name,
        cityHe: nc.he,
        venue: e.venue,
        date: e.date_start,
        url: e.url,
        source: e.source,
        travel: `${nc.travel} מ${anchorHe}`,
      })
    }
  }
  return [...curated, ...live].sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * The structured, key-free layer of the events screen (spec §10):
 * - curated CONFERENCES overlapping the window (the trip anchor)
 * - curated marquee MUSICALS + LIVE agent-discovered theatre, schedule-resolved (dedup by name)
 * - official vs unofficial deep-link zones (concerts/live listings need a key,
 *   so these pre-filtered search links are the always-on fallback)
 * Concerts (Ticketmaster) and football (TheSportsDB) come from their own sources.
 */
export const eventsSource: Source<EventsData> = {
  key: KEY,
  tier: 'official',
  async getForDestination(q) {
    const name = cityName(q.city)
    const curated = musicalsInWindow(q.city.iata, q.startDate, q.endDate)
    const seen = new Set(curated.map((m) => m.name))
    const discovered = resolveMusicals(
      await discoveredMusicals(q.city.iata, q.startDate, q.endDate),
      q.startDate,
      q.endDate,
    ).filter((m) => !seen.has(m.name))
    return ok<EventsData>(KEY, 'official', {
      conferences: conferencesInWindow(q.city.iata, q.startDate, q.endDate),
      musicals: [...curated, ...discovered],
      nearby: await nearbyEvents(q.city.iata, q.startDate, q.endDate, name),
      official: [
        { label: 'Ticketmaster', sub: 'כרטיסים רשמיים ↗', href: ticketmaster(q.city.en), tier: 'official' },
      ],
      unofficial: [
        { label: 'Songkick', sub: 'הופעות ↗', href: songkick(name), tier: 'unofficial' },
        { label: 'Eventim', sub: 'אירופה ↗', href: eventim(name), tier: 'unofficial' },
        { label: 'Bandsintown', sub: 'אמנים ↗', href: bandsintown(name), tier: 'unofficial' },
        { label: 'חיפוש רשת', sub: 'Google ↗', href: webEvents(q.city.en), tier: 'unofficial' },
      ],
    })
  },
}
