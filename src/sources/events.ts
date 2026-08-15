import type { EventsData, Source } from '../core/types'
import { ok } from '../core/contract'
import { cityName } from '../lib/city'
import { ticketmaster, songkick, eventim, bandsintown, webEvents } from '../lib/links'
import { conferencesInWindow } from '../data/conferences'
import { musicalsInWindow } from '../data/musicals'

const KEY = 'events-deeplinks'

/**
 * The structured, key-free layer of the events screen (spec §10):
 * - curated CONFERENCES overlapping the window (the trip anchor)
 * - curated marquee MUSICALS bookable in the window, schedule-resolved
 * - official vs unofficial deep-link zones (concerts/live listings need a key,
 *   so these pre-filtered search links are the always-on fallback)
 * Concerts (Ticketmaster) and football (TheSportsDB) come from their own sources.
 */
export const eventsSource: Source<EventsData> = {
  key: KEY,
  tier: 'official',
  async getForDestination(q) {
    const name = cityName(q.city)
    return ok<EventsData>(KEY, 'official', {
      conferences: conferencesInWindow(q.city.iata, q.startDate, q.endDate),
      musicals: musicalsInWindow(q.city.iata, q.startDate, q.endDate),
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
