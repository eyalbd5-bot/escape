/**
 * The four tennis Grand Slams (2026), Grand Slams only, per featured city.
 * Annual and venue-fixed, so a curated calendar is reliable (spec §8.2). Shown only
 * when the trip window overlaps the tournament. (Melbourne isn't a featured city.)
 */
import type { TennisEvent } from '../core/types'

export const TENNIS: Record<string, TennisEvent[]> = {
  PAR: [{ name: 'רולאן גארוס', venue: 'Roland-Garros', start: '2026-05-24', end: '2026-06-07' }],
  LON: [{ name: 'וימבלדון', venue: 'All England Club', start: '2026-06-29', end: '2026-07-12' }],
  NYC: [{ name: 'US Open', venue: 'USTA Billie Jean King NTC', start: '2026-08-31', end: '2026-09-13' }],
}

/** Tournaments in the city whose dates overlap the trip window. */
export function tennisInWindow(iata: string, startDate: string, endDate: string): TennisEvent[] {
  return (TENNIS[iata] ?? []).filter((t) => t.start <= endDate && startDate <= t.end)
}
