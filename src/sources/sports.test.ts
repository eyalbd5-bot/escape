import { describe, it, expect, beforeEach } from 'vitest'
import { sportsSource } from './sports'
import { clearHttpCache } from '../core/http'
import { QUERY, mockFetch, mockFetchDown } from '../test/helpers'

describe('sportsSource', () => {
  beforeEach(() => clearHttpCache())

  it('returns the club fixtures within the trip window', async () => {
    mockFetch([
      {
        match: 'eventsnext',
        json: {
          events: [
            {
              idEvent: '1',
              strEvent: 'FC Tokyo vs Kashima',
              dateEvent: '2026-09-10',
              strTime: '18:00:00',
              strVenue: 'Ajinomoto Stadium',
              strLeague: 'J1 League',
              strHomeTeam: 'FC Tokyo',
            },
          ],
        },
      },
    ])
    const r = await sportsSource.getForDestination(QUERY)
    expect(r.status).toBe('ok')
    expect(r.data?.football.teams).toContain('FC Tokyo')
    expect(r.data?.football.inWindow).toBe(true)
    expect(r.data?.football.fixtures[0].home).toBe(true)
    expect(r.data?.worldCupHost).toBe(false)
  })

  it('degrades gracefully when the API is down (team mapping still present)', async () => {
    mockFetchDown()
    const r = await sportsSource.getForDestination(QUERY)
    // fetch failures are swallowed inside the source → still ok, just no fixtures
    expect(r.status).toBe('ok')
    expect(r.data?.football.fixtures).toHaveLength(0)
    expect(r.data?.football.teams).toContain('FC Tokyo')
  })
})
