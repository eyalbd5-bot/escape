/**
 * Events discovered by the "Escape Scout" agent (Grok Bot).
 * The raw data lives in `discovered.json` in the agent's exact ESCAPE_EVENTS schema,
 * so its output flows straight in (via `npm run add-events`, which validates + dedups).
 * Every item keeps its real source + dates (accuracy rule; enforced by integrity.test.ts).
 * Theatre items are merged into the musicals tab; other categories are wired per tab.
 */
import type { Musical } from './musicals'
import raw from './discovered.json'

export interface DiscoveredEvent {
  category: 'concert' | 'sports' | 'festival' | 'expo' | 'theatre'
  name: string
  he?: string
  venue: string
  /** YYYY-MM-DD */
  dateStart: string
  /** YYYY-MM-DD (omit for open-ended runs) */
  dateEnd?: string
  url: string
  source: string
  score?: number
}

interface RawEvent {
  category: DiscoveredEvent['category']
  city_iata: string
  name: string
  he?: string
  venue: string
  date_start: string
  date_end?: string | null
  url: string
  source: string
  score?: number
}

/** Group the flat agent-schema JSON into {IATA: events[]}. */
export const DISCOVERED: Record<string, DiscoveredEvent[]> = (raw as RawEvent[]).reduce(
  (acc, e) => {
    ;(acc[e.city_iata] ??= []).push({
      category: e.category,
      name: e.name,
      he: e.he,
      venue: e.venue,
      dateStart: e.date_start,
      dateEnd: e.date_end ?? undefined,
      url: e.url,
      source: e.source,
      score: e.score,
    })
    return acc
  },
  {} as Record<string, DiscoveredEvent[]>,
)

/** Discovered theatre shows for a city, mapped to the musicals-card shape. */
export function discoveredTheatre(iata: string): Musical[] {
  return (DISCOVERED[iata] ?? [])
    .filter((d) => d.category === 'theatre')
    .map((d) => ({
      name: d.name,
      he: d.he,
      venue: d.venue,
      url: d.url,
      source: d.source,
      opensOn: d.dateStart,
      bookingUntil: d.dateEnd ?? '2099-12-31',
    }))
}
