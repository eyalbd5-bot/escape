import { describe, it, expect, beforeEach } from 'vitest'
import { getDestinationData } from './aggregator'
import { clearHttpCache } from './core/http'
import { QUERY, mockFetch, mockFetchDown } from './test/helpers'

describe('aggregator — partial tolerance', () => {
  beforeEach(() => clearHttpCache())

  it('resolves with every section present, even when all network sources fail', async () => {
    mockFetchDown()
    const res = await getDestinationData(QUERY)

    // never throws; always has a generation timestamp + destination echo
    expect(res.generatedAt).toBeTruthy()
    expect(res.destination.city.iata).toBe('TYO')

    // link sources need no network → ok
    for (const k of ['flights', 'hotels', 'events', 'restaurants', 'itinerary'] as const) {
      expect(res[k].status).toBe('ok')
    }

    // network-only sources degrade to error without breaking the response
    expect(res.currency.status).toBe('error')
    expect(res.weather.status).toBe('error')

    // graceful partial: info still returns curated country facts despite the outage
    expect(res.info.status).toBe('ok')
    expect(res.info.data?.country).not.toBeNull()
    expect(res.info.data?.description).toBeNull()
  })

  it('assembles real data per section when sources succeed', async () => {
    mockFetch([
      { match: 'frankfurter', json: { rates: { JPY: 56 } } },
      { match: 'geocoding-api', json: { results: [{ latitude: 35.6, longitude: 139.7 }] } },
      {
        match: '/forecast',
        json: {
          daily: {
            time: ['2026-09-09'],
            temperature_2m_max: [28],
            temperature_2m_min: [20],
            weather_code: [0],
          },
        },
      },
      { match: 'he.wikipedia', json: { extract: 'טוקיו היא בירת יפן.' } },
      { match: 'commons', json: { query: { pages: {} } } },
      { match: 'en.wikipedia', json: {} },
      { match: 'eventsnext', json: { events: [] } },
    ])
    const res = await getDestinationData(QUERY)
    expect(res.currency.data?.rate).toBe(56)
    expect(res.weather.data?.days).toHaveLength(1)
    expect(res.info.data?.description).toContain('טוקיו')
    expect(res.flights.status).toBe('ok')
  })
})
