import { describe, it, expect } from 'vitest'
import { conferencesInWindow } from './conferences'
import { musicalsInWindow } from './musicals'

/** Curated conference + marquee-musical resolution — pure, no network. */
describe('conferences', () => {
  it('London ExCeL restaurant expo overlaps a late-Sept window', () => {
    const c = conferencesInWindow('LON', '2026-09-27', '2026-10-01')
    expect(c.length).toBeGreaterThan(0)
    expect(c[0].venue).toContain('ExCeL')
    expect(c[0].source).toBe('excel.london')
  })
  it('is empty when the window misses the conference dates', () => {
    expect(conferencesInWindow('LON', '2026-11-01', '2026-11-05')).toHaveLength(0)
  })
  it('is empty for a city with no curated conferences', () => {
    expect(conferencesInWindow('TYO', '2026-09-27', '2026-10-01')).toHaveLength(0)
  })

  it('seeds NYC / Berlin / Paris anchors on their real 2026 dates', () => {
    expect(conferencesInWindow('NYC', '2026-10-08', '2026-10-11').some((c) => c.name.includes('Comic Con'))).toBe(true)
    expect(conferencesInWindow('BER', '2026-09-04', '2026-09-08').some((c) => c.name.includes('IFA'))).toBe(true)
    expect(conferencesInWindow('PAR', '2026-10-17', '2026-10-21').some((c) => c.name.includes('SIAL'))).toBe(true)
  })
})

describe('musicals', () => {
  const picks = musicalsInWindow('LON', '2026-09-27', '2026-10-01') // Sun→Thu (incl. Tue+Wed)

  it('surfaces marquee London shows bookable in the window', () => {
    expect(picks.length).toBeGreaterThan(3)
    expect(picks.some((p) => p.name === 'The Lion King')).toBe(true)
  })

  it('flags ABBA Voyage dark on Tue+Wed inside the window', () => {
    const abba = picks.find((p) => p.name === 'ABBA Voyage')!
    expect(abba).toBeTruthy()
    expect(abba.hasDark).toBe(true)
    expect(abba.darkLabel).toContain('חשוך')
    // Tue 29 + Wed 30 Sep are excluded from its performing dates
    expect(abba.datesInWindow).not.toContain('2026-09-29')
    expect(abba.datesInWindow).not.toContain('2026-09-30')
    expect(abba.datesInWindow).toContain('2026-09-28') // Monday performs
  })

  it('marks a no-dark-day show as available every night of the window', () => {
    const lk = picks.find((p) => p.name === 'The Lion King')!
    expect(lk.everyNight).toBe(true)
    expect(lk.hasDark).toBe(false)
  })

  it('drops a window with no performing evenings / no curated city', () => {
    expect(musicalsInWindow('TYO', '2026-09-27', '2026-10-01')).toHaveLength(0)
  })

  it('seeds marquee shows for NYC / Berlin / Paris', () => {
    expect(musicalsInWindow('NYC', '2026-10-08', '2026-10-11').some((m) => m.name === 'The Lion King')).toBe(true)
    expect(musicalsInWindow('BER', '2026-09-22', '2026-09-25').some((m) => m.name.includes('DELIGHT'))).toBe(true)
    expect(musicalsInWindow('PAR', '2026-10-17', '2026-10-21').some((m) => m.name.includes('Moulin Rouge'))).toBe(true)
  })

  it('respects a run window: a show is hidden before it opens, shown once open', () => {
    // Beauty and the Beast (Vienna) opens 2026-09-25
    const before = musicalsInWindow('VIE', '2026-09-10', '2026-09-20')
    const during = musicalsInWindow('VIE', '2026-09-26', '2026-09-30')
    expect(before.some((m) => m.name === 'Beauty and the Beast')).toBe(false)
    expect(during.some((m) => m.name === 'Beauty and the Beast')).toBe(true)
    // Maria Theresia (no opensOn — already running) shows in both
    expect(before.some((m) => m.name.includes('Maria Theresia'))).toBe(true)
  })

  it('seeds the second-wave cities (MAD / MUC / ROM / BCN / AMS)', () => {
    expect(conferencesInWindow('MUC', '2026-09-19', '2026-10-04').some((c) => c.name.includes('Oktoberfest'))).toBe(true)
    expect(conferencesInWindow('MAD', '2026-10-06', '2026-10-08').some((c) => c.name.includes('Fruit Attraction'))).toBe(true)
    expect(musicalsInWindow('MAD', '2026-10-16', '2026-10-20').some((m) => m.name === 'El Rey León')).toBe(true)
    expect(musicalsInWindow('ROM', '2026-10-11', '2026-10-20').some((m) => m.name === 'Falstaff')).toBe(true)
  })
})
