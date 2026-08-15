import { describe, it, expect } from 'vitest'
import { flightsSource } from './flights'
import { hotelsSource } from './hotels'
import { restaurantsSource } from './restaurants'
import { eventsSource } from './events'
import { QUERY } from '../test/helpers'

/** Link sources synthesize URLs with no network — always ok, even offline. */
describe('link sources', () => {
  it('flights: estimate range + Skyscanner/Google links', async () => {
    const r = await flightsSource.getForDestination(QUERY)
    expect(r.status).toBe('ok')
    expect(r.data!.range.lo).toBeLessThan(r.data!.range.hi)
    expect(r.data!.range.estimated).toBe(false) // Tokyo has a curated baseline
    expect(r.data!.links.map((l) => l.label)).toEqual(['Kayak', 'Skyscanner', 'Google Flights'])
    expect(r.data!.links[0].href).toContain('kayak.com')
    expect(r.data!.links[0].href).toContain('TLV-TYO')
    expect(r.data!.links[1].href).toContain('skyscanner.co.il')
    // Google Flights tfs link lands straight on results; decoded protobuf holds the route
    const tfs = new URL(r.data!.links[2].href).searchParams.get('tfs')!
    const proto = atob(tfs)
    expect(proto).toContain('TYO')
    expect(proto).toContain('TLV')
    expect(proto).toContain('2026-09-09')
    // flight bot: pre-filled AI assistants + context for free-text questions
    expect(r.data!.bots.map((b) => b.label)).toEqual(['Perplexity', 'ChatGPT', 'Claude'])
    expect(r.data!.askContext).toContain('TLV')
  })

  it('hotels: nights-scaled range + Booking link with dates', async () => {
    const r = await hotelsSource.getForDestination(QUERY)
    expect(r.status).toBe('ok')
    expect(r.data!.nights).toBe(5)
    expect(r.data!.links[0].href).toContain('checkin=2026-09-09')
  })

  it('restaurants: 8 categories incl. a MICHELIN link', async () => {
    const r = await restaurantsSource.getForDestination(QUERY)
    expect(r.data!.categories).toHaveLength(8)
    expect(r.data!.categories[0].href).toContain('guide.michelin.com')
  })

  it('events: official vs unofficial zones', async () => {
    const r = await eventsSource.getForDestination(QUERY)
    expect(r.data!.official[0].label).toBe('Ticketmaster')
    expect(r.data!.unofficial.every((l) => l.tier === 'unofficial')).toBe(true)
  })
})
