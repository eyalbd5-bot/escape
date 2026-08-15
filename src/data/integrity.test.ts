import { describe, it, expect } from 'vitest'
import { CONFERENCES } from './conferences'
import { MUSICALS } from './musicals'
import { SPORTS_TEAMS } from './sportsTeams'

/**
 * Data-integrity gate — enforces the project's #1 rule: NEVER fabricate data.
 * Every curated event must be well-formed and carry a real source + valid dates.
 * This is the machine version of "accuracy is paramount" (see AGENTS.md).
 */
const IATA = /^[A-Z]{3}$/
const YMD = /^\d{4}-\d{2}-\d{2}$/
const isDate = (s: string) => YMD.test(s) && !Number.isNaN(Date.parse(s + 'T00:00:00'))
const isUrl = (s: string) => /^https?:\/\/.+\..+/.test(s)
const nonEmpty = (s: unknown) => typeof s === 'string' && s.trim().length > 0

describe('data integrity — conferences', () => {
  for (const [iata, list] of Object.entries(CONFERENCES)) {
    it(`${iata}: valid IATA key with entries`, () => {
      expect(iata).toMatch(IATA)
      expect(list.length).toBeGreaterThan(0)
    })
    list.forEach((c) => {
      it(`${iata} · ${c.name}: name/venue/source/url + valid start<=end`, () => {
        expect(nonEmpty(c.name)).toBe(true)
        expect(nonEmpty(c.venue)).toBe(true)
        expect(nonEmpty(c.source)).toBe(true) // no source = fabricated → fail
        expect(isUrl(c.url)).toBe(true)
        expect(isDate(c.start)).toBe(true)
        expect(isDate(c.end)).toBe(true)
        expect(c.start <= c.end).toBe(true)
      })
    })
  }
})

describe('data integrity — musicals', () => {
  for (const [iata, list] of Object.entries(MUSICALS)) {
    it(`${iata}: valid IATA key with entries`, () => {
      expect(iata).toMatch(IATA)
      expect(list.length).toBeGreaterThan(0)
    })
    list.forEach((m) => {
      it(`${iata} · ${m.name}: name/venue/source/url + valid run window`, () => {
        expect(nonEmpty(m.name)).toBe(true)
        expect(nonEmpty(m.venue)).toBe(true)
        expect(nonEmpty(m.source)).toBe(true)
        expect(isUrl(m.url)).toBe(true)
        expect(isDate(m.bookingUntil)).toBe(true)
        if (m.opensOn !== undefined) {
          expect(isDate(m.opensOn)).toBe(true)
          expect(m.opensOn <= m.bookingUntil).toBe(true) // opens before it closes
        }
        if (m.darkDays !== undefined) {
          m.darkDays.forEach((d) => expect(d >= 0 && d <= 6).toBe(true))
        }
      })
    })
  }
})

describe('data integrity — sports teams', () => {
  for (const [iata, list] of Object.entries(SPORTS_TEAMS)) {
    it(`${iata}: valid IATA key with entries`, () => {
      expect(iata).toMatch(IATA)
      expect(list.length).toBeGreaterThan(0)
    })
    list.forEach((t) => {
      it(`${iata} · ${t.name}: numeric id, name, league, known sport`, () => {
        expect(/^\d+$/.test(t.id)).toBe(true) // real TheSportsDB id, not a placeholder
        expect(nonEmpty(t.name)).toBe(true)
        expect(nonEmpty(t.league)).toBe(true)
        expect(['soccer', 'basketball']).toContain(t.sport)
      })
    })
  }
})
