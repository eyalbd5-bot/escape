import type { MediaData, Source } from '../core/types'
import { ok, empty } from '../core/contract'
import { httpGetJson } from '../core/http'
import { CONFIG } from '../core/config'

const KEY = 'wikimedia-commons'

interface CommonsResponse {
  query?: {
    pages?: Record<
      string,
      { title?: string; imageinfo?: { thumburl?: string; width?: number; height?: number }[] }
    >
  }
}
interface WikiSummary {
  originalimage?: { source?: string }
  thumbnail?: { source?: string }
}

/** Evocative landscape photos of the city (Commons "{city} skyline"). */
async function commonsImages(cityEn: string): Promise<string[]> {
  const q = encodeURIComponent(cityEn + ' skyline')
  const url =
    `${CONFIG.commonsApi}?action=query&generator=search&gsrsearch=${q}` +
    `&gsrlimit=20&gsrnamespace=6&prop=imageinfo&iiprop=url|size&iiurlwidth=1280&format=json&origin=*`
  const json = await httpGetJson<CommonsResponse>(url, { cacheTtlMs: 24 * 60 * 60 * 1000 })
  const pages = Object.values(json?.query?.pages || {})
  const key = cityEn.toLowerCase().replace(/\s+/g, '')
  return pages
    .filter((p) => (p.title || '').toLowerCase().replace(/\s+/g, '').includes(key))
    .map((p) => (p.imageinfo || [])[0])
    .filter((i) => i?.thumburl && (i.width ?? 0) >= (i.height ?? 0) * 1.1)
    .map((i) => i!.thumburl as string)
    .slice(0, 6)
}

/** Wikipedia lead image as a single-photo fallback. */
async function wikiLeadImage(cityEn: string): Promise<string | null> {
  const json = await httpGetJson<WikiSummary>(
    `${CONFIG.wikiSummary('en')}/page/summary/${encodeURIComponent(cityEn)}`,
    { cacheTtlMs: 24 * 60 * 60 * 1000 },
  )
  return json?.originalimage?.source || json?.thumbnail?.source || null
}

/** Destination imagery: rotating Commons photos + a single best hero/background. */
export const mediaSource: Source<MediaData> = {
  key: KEY,
  tier: 'official',
  async getForDestination(q) {
    let images: string[] = []
    try {
      images = await commonsImages(q.city.en)
    } catch {
      images = []
    }

    let hero: string | null = images[0] ?? null
    if (!images.length) {
      try {
        hero = await wikiLeadImage(q.city.en)
      } catch {
        hero = null
      }
    }

    if (!images.length && !hero) return empty<MediaData>(KEY, 'official')
    return ok<MediaData>(KEY, 'official', { images, hero })
  },
}
