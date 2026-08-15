import type { SportGroup, Source, SportsData, SportsFixture } from '../core/types'
import type { TeamRef } from '../data/sportsTeams'
import { ok, empty } from '../core/contract'
import { httpGetJson } from '../core/http'
import { CONFIG } from '../core/config'
import { SPORTS_TEAMS } from '../data/sportsTeams'
import { WORLD_CUP, worldCupVenue } from '../data/worldCup'
import { tennisInWindow } from '../data/tennis'

const KEY = 'thesportsdb'

interface SdbEvent {
  idEvent: string
  strEvent: string
  dateEvent: string
  strTime?: string
  strVenue?: string
  strCity?: string
  strLeague?: string
  strHomeTeam?: string
}

/** Inclusive YYYY-MM-DD list between two dates (capped). */
function dateRange(from: string, to: string): string[] {
  if (from > to) return []
  const out: string[] = []
  const d = new Date(from + 'T00:00:00')
  const end = new Date(to + 'T00:00:00')
  while (d <= end && out.length < 45) {
    out.push(d.toISOString().slice(0, 10))
    d.setDate(d.getDate() + 1)
  }
  return out
}

const toFixture = (e: SdbEvent, homeTeam: string): SportsFixture => ({
  id: String(e.idEvent),
  title: e.strEvent,
  date: e.dateEvent,
  time: (e.strTime || '').slice(0, 5),
  venue: e.strVenue || '',
  league: e.strLeague || '',
  home: (e.strHomeTeam || '').toLowerCase().includes(homeTeam.toLowerCase()),
})

/** A team's upcoming fixtures (eventsnext). */
async function fetchClub(teamId: string, teamName: string): Promise<SportsFixture[]> {
  try {
    const j = await httpGetJson<{ events?: SdbEvent[] }>(
      `${CONFIG.sportsDbBase}/eventsnext.php?id=${teamId}`,
      { cacheTtlMs: 15 * 60 * 1000 },
    )
    const events = j?.events
    if (!Array.isArray(events)) return []
    return events.filter((e) => e?.dateEvent && e?.strEvent).map((e) => toFixture(e, teamName))
  } catch {
    return []
  }
}

/** World Cup 2026 matches at a host venue within the given dates (per-day query). */
async function fetchWorldCup(venueKeyword: string, dates: string[]): Promise<SportsFixture[]> {
  const kw = venueKeyword.toLowerCase()
  try {
    const perDay = await Promise.all(
      dates.map(async (d) => {
        try {
          const j = await httpGetJson<{ events?: SdbEvent[] }>(
            `${CONFIG.sportsDbBase}/eventsday.php?d=${d}&l=${WORLD_CUP.leagueId}`,
            { cacheTtlMs: 60 * 60 * 1000 },
          )
          return Array.isArray(j?.events) ? j!.events! : []
        } catch {
          return []
        }
      }),
    )
    const seen = new Set<string>()
    const out: SportsFixture[] = []
    for (const e of perDay.flat()) {
      const place = `${e?.strVenue || ''} ${e?.strCity || ''}`.toLowerCase()
      if (!place.includes(kw)) continue
      if (seen.has(e.idEvent)) continue
      seen.add(e.idEvent)
      out.push({ ...toFixture(e, ''), league: e.strLeague || 'FIFA World Cup' })
    }
    return out.sort((a, b) => a.date.localeCompare(b.date))
  } catch {
    return []
  }
}

/** Sports fixtures: the city's clubs' home games + World Cup 2026 host (spec §6.6). */
export const sportsSource: Source<SportsData> = {
  key: KEY,
  tier: 'official',
  async getForDestination(q) {
    const teams = SPORTS_TEAMS[q.city.iata] ?? []
    const wcVenue = worldCupVenue(q.city.en)
    const wcDates = wcVenue
      ? dateRange(
          q.startDate > WORLD_CUP.start ? q.startDate : WORLD_CUP.start,
          q.endDate < WORLD_CUP.end ? q.endDate : WORLD_CUP.end,
        )
      : []
    const worldCupHost = !!wcVenue && wcDates.length > 0

    // build a sport group: home games of its teams, in-window or soonest upcoming
    const groupFor = async (sport: TeamRef['sport']): Promise<SportGroup> => {
      const ts = teams.filter((t) => t.sport === sport)
      if (ts.length === 0) return { teams: [], fixtures: [], inWindow: false }
      const perTeam = await Promise.all(ts.map((t) => fetchClub(t.id, t.name)))
      const seen = new Set<string>()
      const home = perTeam
        .flat()
        .filter((f) => f.home)
        .filter((f) => (seen.has(f.id) ? false : (seen.add(f.id), true)))
        .sort((a, b) => a.date.localeCompare(b.date))
      // only games actually played at home in the city, within the trip window
      const inW = home.filter((f) => f.date >= q.startDate && f.date <= q.endDate)
      // when nothing lands in-window, the soonest home game AFTER it — the "shift your trip" pick
      const nearest = inW.length === 0 ? home.find((f) => f.date > q.endDate) : undefined
      return {
        teams: ts.map((t) => t.name),
        fixtures: inW,
        inWindow: inW.length > 0,
        nearest,
      }
    }

    const [football, basketball, worldCup] = await Promise.all([
      groupFor('soccer'),
      groupFor('basketball'),
      worldCupHost ? fetchWorldCup(wcVenue!, wcDates) : Promise.resolve<SportsFixture[]>([]),
    ])

    const tennis = tennisInWindow(q.city.iata, q.startDate, q.endDate)

    if (teams.length === 0 && tennis.length === 0 && !worldCupHost && worldCup.length === 0) {
      return empty<SportsData>(KEY, 'official')
    }
    return ok<SportsData>(KEY, 'official', { football, basketball, tennis, worldCup, worldCupHost })
  },
}
