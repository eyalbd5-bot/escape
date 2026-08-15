import type { CurrencyData, Source } from '../core/types'
import { ok, empty } from '../core/contract'
import { httpGetJson } from '../core/http'
import { CONFIG } from '../core/config'

const KEY = 'frankfurter'

/** ILS → destination-currency rate (Frankfurter / ECB, key-free, spec §6.7). */
export const currencySource: Source<CurrencyData> = {
  key: KEY,
  tier: 'official',
  async getForDestination(q) {
    const cur = q.city.cur
    const url = `${CONFIG.frankfurterBase}/latest?base=ILS&symbols=${encodeURIComponent(cur)}`
    const json = await httpGetJson<{ rates?: Record<string, number> }>(url, {
      cacheTtlMs: 5 * 60 * 1000,
    })
    const rate = json?.rates?.[cur]
    if (typeof rate !== 'number') return empty<CurrencyData>(KEY, 'official')
    return ok<CurrencyData>(KEY, 'official', { base: 'ILS', quote: cur, rate })
  },
}
