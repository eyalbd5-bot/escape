import { describe, it, expect, beforeEach } from 'vitest'
import { weatherSource } from './weather'
import { runSource } from '../core/contract'
import { clearHttpCache } from '../core/http'
import { QUERY, mockFetch, mockFetchDown } from '../test/helpers'

describe('weatherSource', () => {
  beforeEach(() => clearHttpCache())

  it('returns ok with a normalized forecast', async () => {
    mockFetch([
      { match: 'geocoding-api', json: { results: [{ latitude: 35.6, longitude: 139.7 }] } },
      {
        match: '/forecast',
        json: {
          daily: {
            time: ['2026-09-09', '2026-09-10'],
            temperature_2m_max: [28.4, 27.1],
            temperature_2m_min: [20.2, 19.8],
            weather_code: [0, 61],
          },
        },
      },
    ])
    const r = await weatherSource.getForDestination(QUERY)
    expect(r.status).toBe('ok')
    expect(r.data?.days).toHaveLength(2)
    expect(r.data?.days[0].max).toBe(28)
    expect(r.data?.mini).toContain('28°')
  })

  it('returns empty when geocoding finds nothing', async () => {
    mockFetch([{ match: 'geocoding-api', json: { results: [] } }])
    const r = await weatherSource.getForDestination(QUERY)
    expect(r.status).toBe('empty')
  })

  it('source down → error result via runSource', async () => {
    mockFetchDown()
    const r = await runSource(weatherSource, QUERY)
    expect(r.status).toBe('error')
  })
})
