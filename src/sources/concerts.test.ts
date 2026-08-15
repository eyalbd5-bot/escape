import { describe, it, expect } from 'vitest'
import { concertsSource, mapTmEvents } from './concerts'
import { QUERY } from '../test/helpers'

describe('concertsSource', () => {
  it('without a key configured → available:false, no network', async () => {
    // default test env has no VITE_TICKETMASTER_API_KEY
    const r = await concertsSource.getForDestination(QUERY)
    expect(r.status).toBe('ok')
    expect(r.data?.available).toBe(false)
    expect(r.data?.concerts).toHaveLength(0)
  })

  it('maps Ticketmaster events → concerts (pure)', () => {
    const concerts = mapTmEvents({
      _embedded: {
        events: [
          {
            id: 'G1',
            name: 'Coldplay',
            url: 'https://tm/coldplay',
            dates: { start: { localDate: '2026-09-10' } },
            _embedded: { venues: [{ name: 'Tokyo Dome' }] },
          },
          { id: '', name: 'broken' } as never, // filtered out (no id)
        ],
      },
    })
    expect(concerts).toHaveLength(1)
    expect(concerts[0]).toMatchObject({ name: 'Coldplay', venue: 'Tokyo Dome', date: '2026-09-10', url: 'https://tm/coldplay' })
  })
})
