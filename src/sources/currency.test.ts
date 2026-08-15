import { describe, it, expect, beforeEach } from 'vitest'
import { currencySource } from './currency'
import { runSource } from '../core/contract'
import { clearHttpCache } from '../core/http'
import { QUERY, mockFetch, mockFetchDown } from '../test/helpers'

describe('currencySource', () => {
  beforeEach(() => clearHttpCache())

  it('returns ok with the rate', async () => {
    mockFetch([{ match: 'frankfurter', json: { rates: { JPY: 56.2 } } }])
    const r = await currencySource.getForDestination(QUERY)
    expect(r.status).toBe('ok')
    expect(r.tier).toBe('official')
    expect(r.data?.rate).toBe(56.2)
    expect(r.data?.quote).toBe('JPY')
  })

  it('returns empty when the currency is unsupported', async () => {
    mockFetch([{ match: 'frankfurter', json: { rates: {} } }])
    const r = await currencySource.getForDestination(QUERY)
    expect(r.status).toBe('empty')
    expect(r.data).toBeNull()
  })

  it('source down → runSource yields an error result, never throws', async () => {
    mockFetchDown()
    const r = await runSource(currencySource, QUERY)
    expect(r.status).toBe('error')
    expect(r.data).toBeNull()
    expect(r.error).toBeTruthy()
  })
})
