/**
 * Nearby-city events — "your trip is anchored in city X, but a marquee event is one train away".
 * The classic case: a conference in Frankfurt (7–10 Dec) while Borussia Dortmund host Inter in
 * the Champions League on the 9th, ~2h by ICE. We surface it as a "worth the hop" recommendation.
 *
 * Two channels, mirroring the rest of the app:
 *  - NEARBY_EVENTS: curated + VERIFIED marquee events keyed by ANCHOR city IATA (accuracy rule —
 *    every item has a real source + date; enforced by integrity.test.ts). Always available.
 *  - NEARBY: the reachable-cities map (anchor IATA → nearby cities + travel note) that lets the
 *    live agent feed (/api/discovered) be pulled for those cities too and labelled with the hop.
 */
import type { NearbyEvent } from '../core/types'

export interface NearbyCity {
  /** IATA of the nearby city (used to query the live discovered feed) */
  iata: string
  name: string
  he: string
  /** travel note shown on the card, e.g. "≈2 ש׳ ברכבת" */
  travel: string
}

/** Reachable cities per anchor (curated; train-based day/evening trips). */
export const NEARBY: Record<string, NearbyCity[]> = {
  FRA: [
    { iata: 'DTM', name: 'Dortmund', he: 'דורטמונד', travel: '≈2 ש׳ ברכבת' },
    { iata: 'CGN', name: 'Cologne', he: 'קלן', travel: '≈1 ש׳ ברכבת' },
    { iata: 'STR', name: 'Stuttgart', he: 'שטוטגרט', travel: '≈1.5 ש׳ ברכבת' },
  ],
}

/**
 * Curated, verified marquee events in a reachable city, keyed by the ANCHOR city's IATA.
 * Verify each against its source before adding (rule 1). Dates are LOCAL to the event.
 */
export const NEARBY_EVENTS: Record<string, NearbyEvent[]> = {
  FRA: [
    {
      category: 'sports',
      name: 'Borussia Dortmund vs Inter Milan — UEFA Champions League',
      he: 'בורוסיה דורטמונד נגד אינטר מילאנו — ליגת האלופות',
      city: 'Dortmund',
      cityHe: 'דורטמונד',
      venue: 'Signal Iduna Park',
      date: '2026-12-09', // matchday 6, 21:00 CET — verified UEFA.com + Bundesliga.com
      url: 'https://www.uefa.com/uefachampionsleague/',
      source: 'UEFA / Bundesliga',
      travel: '≈2 ש׳ ברכבת מפרנקפורט',
    },
  ],
}

/** Curated verified nearby events for an anchor city, in-window. */
export function nearbyEventsInWindow(iata: string, d1: string, d2: string): NearbyEvent[] {
  return (NEARBY_EVENTS[iata] ?? []).filter((e) => e.date >= d1 && e.date <= d2)
}
