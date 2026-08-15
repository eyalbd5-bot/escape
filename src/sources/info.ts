import type { InfoData, Source } from '../core/types'
import { ok, empty } from '../core/contract'
import { httpGetJson } from '../core/http'
import { CONFIG } from '../core/config'
import { COUNTRIES } from '../data/countries'

const KEY = 'wikipedia+curated'

/**
 * Destination info: Hebrew description (he.wikipedia summary, key-free) + curated
 * country facts. The description fetch is isolated so a Wikipedia outage still
 * yields the curated country block (graceful partial within the source).
 */
export const infoSource: Source<InfoData> = {
  key: KEY,
  tier: 'official',
  async getForDestination(q) {
    const country = COUNTRIES[q.city.cc] ?? null

    let description: string | null = null
    try {
      const title = q.city.he ?? q.city.en
      const json = await httpGetJson<{ extract?: string }>(
        `${CONFIG.wikiSummary('he')}/page/summary/${encodeURIComponent(title)}`,
        { cacheTtlMs: 24 * 60 * 60 * 1000 },
      )
      const ex = json?.extract
      description = typeof ex === 'string' && ex.trim().length ? ex.trim() : null
    } catch {
      description = null
    }

    if (!description && !country) return empty<InfoData>(KEY, 'official')
    return ok<InfoData>(KEY, 'official', { description, country })
  },
}
