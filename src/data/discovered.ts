/**
 * Seed data for the "Escape Scout" agent feed (Grok Bot), in the exact ESCAPE_EVENTS schema.
 * At RUNTIME the site reads discovered events LIVE from the `/api/discovered` KV store the
 * agent POSTs to each morning (see `src/sources/events.ts`) — this file is the SEED that
 * pre-populates that store and the fixture the integrity test validates. `npm run add-events`
 * appends to it (validates source+dates+category, dedups) so a JSON dump can still be curated
 * offline before it's pushed to KV. Every item keeps its real source + dates (accuracy rule;
 * enforced by integrity.test.ts).
 */
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
