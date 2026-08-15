/**
 * FIFA World Cup 2026 (USA / Canada / Mexico) — key-free via TheSportsDB
 * (league 4429). Matches are fetched per-day for the trip window and filtered to
 * the destination's host stadium, so a host-city trip surfaces real WC fixtures.
 */
export const WORLD_CUP = {
  leagueId: '4429',
  name: 'מונדיאל 2026',
  /** tournament window (inclusive) */
  start: '2026-06-11',
  end: '2026-07-19',
  /**
   * Host cities → keyword that appears in the match venue/city string.
   * `match` identifies the destination (matched against the city's English name).
   */
  hosts: [
    { match: ['Miami'], venue: 'Hard Rock' },
    { match: ['New York', 'Newark'], venue: 'MetLife' },
    { match: ['Los Angeles'], venue: 'SoFi' },
    { match: ['Atlanta'], venue: 'Mercedes-Benz' },
    { match: ['Boston'], venue: 'Gillette' },
    { match: ['Dallas'], venue: 'AT&T Stadium' },
    { match: ['Houston'], venue: 'NRG' },
    { match: ['Kansas City'], venue: 'Arrowhead' },
    { match: ['Philadelphia'], venue: 'Lincoln Financial' },
    { match: ['San Francisco', 'San Jose', 'Santa Clara'], venue: "Levi's" },
    { match: ['Seattle'], venue: 'Lumen' },
    { match: ['Toronto'], venue: 'BMO' },
    { match: ['Vancouver'], venue: 'BC Place' },
    { match: ['Mexico City', 'Ciudad de Mexico'], venue: 'Azteca' },
    { match: ['Guadalajara'], venue: 'Akron' },
    { match: ['Monterrey'], venue: 'BBVA' },
  ],
} as const

/** Return the host venue keyword if the city is a WC 2026 host, else null. */
export function worldCupVenue(cityEn: string): string | null {
  const en = cityEn.toLowerCase()
  for (const h of WORLD_CUP.hosts) {
    if (h.match.some((m) => en.includes(m.toLowerCase()))) return h.venue
  }
  return null
}
