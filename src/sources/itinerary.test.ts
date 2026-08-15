import { describe, it, expect, beforeEach } from 'vitest'
import { itinerarySource } from './itinerary'
import { clearHttpCache } from '../core/http'
import { QUERY, mockFetch, mockFetchDown } from '../test/helpers'

describe('itinerarySource', () => {
  beforeEach(() => clearHttpCache())

  it('builds themed days from real places with photos', async () => {
    mockFetch([
      {
        match: 'list=geosearch',
        json: { query: { geosearch: [{ title: 'מקדש מאיג׳י' }, { title: 'קרב על טוקיו' }] } },
      },
      {
        match: 'prop=pageimages',
        json: {
          query: {
            pages: {
              '1': { title: 'שיבויה', extract: 'צומת מפורסם בטוקיו.', thumbnail: { source: 'http://img/shibuya.jpg' } },
              '2': { title: 'מקדש מאיג׳י', extract: 'מקדש שינטו ירוק.', thumbnail: { source: 'http://img/meiji.jpg' } },
            },
          },
        },
      },
    ])
    const r = await itinerarySource.getForDestination(QUERY)
    expect(r.status).toBe('ok')
    expect(r.data?.planner).toBe('curated') // Tokyo has curated sights, no AI key
    expect(r.data?.days).toHaveLength(5) // nights
    const places = r.data!.days.flatMap((d) => d.places)
    expect(places.length).toBeGreaterThan(0)
    expect(places[0].image).toBeTruthy()
    // historical-noise titles are filtered out
    expect(places.find((p) => p.name.includes('קרב'))).toBeUndefined()
    expect(r.data?.planners.map((p) => p.label)).toEqual(['Perplexity', 'ChatGPT', 'Claude'])
  })

  it('degrades to a usable skeleton when Wikipedia is down', async () => {
    mockFetchDown()
    const r = await itinerarySource.getForDestination(QUERY)
    expect(r.status).toBe('ok')
    expect(r.data?.planner).toBe('skeleton')
    expect(r.data?.days).toHaveLength(5)
  })
})
