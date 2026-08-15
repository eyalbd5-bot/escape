import type { ItineraryDay, ItineraryData, ItineraryPlace, Source } from '../core/types'
import { ok } from '../core/contract'
import { httpGetJson } from '../core/http'
import { CONFIG } from '../core/config'
import { heD } from '../lib/format'
import { cityName } from '../lib/city'
import { perplexity, chatgpt, claudeChat, mapsDir } from '../lib/links'

const KEY = 'itinerary'
const NOISE = /(קרב|מצור|טבח|מלחמ|הסכם|אמנ\b|פרשת|רצח|פיגוע|אסון|שיטפון|קומונה|מהפכ|מרד|הפיכה)/

interface GeoResult {
  query?: { geosearch?: { title: string; lat: number; lon: number }[] }
}
interface GeoPlace {
  title: string
  lat: number
  lng: number
}
interface EnrichResult {
  query?: {
    pages?: Record<
      string,
      {
        title: string
        missing?: string
        extract?: string
        thumbnail?: { source?: string }
        coordinates?: { lat: number; lon: number }[]
      }
    >
  }
}

const toRad = (d: number) => (d * Math.PI) / 180
/** Great-circle distance (km). */
function haversine(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const dLat = toRad(bLat - aLat)
  const dLng = toRad(bLng - aLng)
  const s =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(s))
}

/**
 * Order places into a nearest-neighbour route (starting from the first/iconic one)
 * so that consecutive places are geographically close. Chunking the result into
 * days then yields geographically coherent days. Places without coordinates go last.
 */
function orderByProximity(places: ItineraryPlace[]): ItineraryPlace[] {
  const located = places.filter((p) => typeof p.lat === 'number' && typeof p.lng === 'number')
  const rest = places.filter((p) => typeof p.lat !== 'number')
  if (located.length <= 2) return [...places]
  const ordered: ItineraryPlace[] = []
  const remaining = [...located]
  let cur = remaining.shift()!
  ordered.push(cur)
  while (remaining.length) {
    let best = 0
    let bestD = Infinity
    for (let i = 0; i < remaining.length; i++) {
      const d = haversine(cur.lat!, cur.lng!, remaining[i].lat!, remaining[i].lng!)
      if (d < bestD) {
        bestD = d
        best = i
      }
    }
    cur = remaining.splice(best, 1)[0]
    ordered.push(cur)
  }
  return [...ordered, ...rest]
}

const clip = (s: string, max = 160): string => {
  const t = s.replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  const cut = t.slice(0, max)
  const dot = cut.lastIndexOf('.')
  return (dot > 60 ? cut.slice(0, dot + 1) : cut.trim() + '…')
}

/** Notable Wikipedia places near the city (he) with coords, minus event noise. */
async function geoSearch(lat: number, lng: number): Promise<GeoPlace[]> {
  const url =
    `${CONFIG.wikiAction('he')}?action=query&list=geosearch` +
    `&gscoord=${lat}%7C${lng}&gsradius=10000&gslimit=60&format=json&origin=*`
  const j = await httpGetJson<GeoResult>(url, { cacheTtlMs: 24 * 60 * 60 * 1000 })
  return (j?.query?.geosearch ?? [])
    .filter((g) => !NOISE.test(g.title))
    .map((g) => ({ title: g.title, lat: g.lat, lng: g.lon }))
}

/** Enrich titles into places with photo + Hebrew description + coords + maps link. */
async function enrich(
  titles: string[],
  cityEn: string,
  coords: Map<string, { lat: number; lng: number }>,
): Promise<ItineraryPlace[]> {
  if (!titles.length) return []
  const url =
    `${CONFIG.wikiAction('he')}?action=query&prop=pageimages|extracts|coordinates` +
    `&exintro=1&explaintext=1&piprop=thumbnail&pithumbsize=640&redirects=1&format=json&origin=*` +
    `&titles=${encodeURIComponent(titles.slice(0, 20).join('|'))}`
  const j = await httpGetJson<EnrichResult>(url, { cacheTtlMs: 24 * 60 * 60 * 1000 })
  const pages = Object.values(j?.query?.pages ?? {})
  const places: ItineraryPlace[] = pages
    .filter((p) => !p.missing && p.extract && !NOISE.test(p.title))
    .map((p) => {
      const c = p.coordinates?.[0]
      // page coords, else fall back to the GeoSearch coords for that title
      const lat = c?.lat ?? coords.get(p.title)?.lat
      const lng = c?.lon ?? coords.get(p.title)?.lng
      return {
        name: p.title,
        description: clip(p.extract!),
        image: p.thumbnail?.source ?? null,
        lat,
        lng,
        mapsUrl:
          typeof lat === 'number' && typeof lng === 'number'
            ? mapsDir(`${lat},${lng}`)
            : mapsDir(`${p.title}, ${cityEn}`),
      }
    })
  // photos first — they read like a tour guide
  return [...places.filter((p) => p.image), ...places.filter((p) => !p.image)]
}

const TIPS = [
  'התחילו מוקדם כדי להקדים את התורים והחום.',
  'שלבו הליכה רגלית בין האתרים הקרובים — ככה מגלים את העיר.',
  'שריינו הפסקת קפה/אוכל מקומי באמצע היום.',
  'בדקו שעות פתיחה מראש; חלק מהאתרים סגורים ביום קבוע בשבוע.',
  'קנו כרטיסים אונליין מראש לאתרים הפופולריים.',
]

const dayTheme = (i: number, n: number): string =>
  i === 1 ? 'הגעה והתמקמות' : i === n ? 'בוקר אחרון ויציאה' : `יום ${i} — חקירה`

/** Distribute real places across the days (template planner, key-free). */
function templateDays(nights: number, places: ItineraryPlace[]): ItineraryDay[] {
  const days: ItineraryDay[] = []
  const perDay = Math.min(3, Math.max(1, Math.ceil(places.length / nights) || 1))
  let idx = 0
  for (let i = 1; i <= nights; i++) {
    const slice = places.slice(idx, idx + perDay)
    idx += slice.length
    days.push({ n: i, theme: dayTheme(i, nights), places: slice, tip: TIPS[(i - 1) % TIPS.length] })
  }
  return days
}

/**
 * Optional AI planner (Gemini) — organizes the real places into a narrative.
 * Gated behind VITE_GEMINI_API_KEY; returns null when unavailable so we fall back
 * to the key-free template. On base44 / Lovable, swap this for the platform's AI.
 */
async function aiDays(
  cityLabel: string,
  nights: number,
  places: ItineraryPlace[],
): Promise<ItineraryDay[] | null> {
  if (!CONFIG.geminiKey || places.length === 0) return null
  try {
    const names = places.map((p) => p.name).join(', ')
    const prompt =
      `אתה מדריך טיולים מקצועי. תכנן מסלול ${nights} ימים ב${cityLabel} בעברית. ` +
      `השתמש אך ורק במקומות מהרשימה הבאה (בדיוק בשמות האלה): ${names}. ` +
      `החזר JSON בלבד: מערך של ימים, כל יום { "n": number, "theme": string, "places": string[], "tip": string }. ` +
      `קבץ מקומות קרובים גיאוגרפית, 2-3 מקומות ליום, וטיפ מעשי קצר לכל יום.`
    const url = `${CONFIG.geminiBase}/models/${CONFIG.geminiModel}:generateContent?key=${CONFIG.geminiKey}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    })
    if (!res.ok) return null
    const j = (await res.json()) as any
    const text = j?.candidates?.[0]?.content?.parts?.[0]?.text
    const parsed = JSON.parse(text) as { n: number; theme: string; places: string[]; tip: string }[]
    const byName = new Map(places.map((p) => [p.name, p]))
    return parsed.map((d) => ({
      n: d.n,
      theme: d.theme,
      tip: d.tip,
      places: (d.places || []).map((name) => byName.get(name)).filter(Boolean) as ItineraryPlace[],
    }))
  } catch {
    return null
  }
}

/** Itinerary (spec §6.3): a virtual tour guide — real attractions with photos,
 *  organized into themed days; AI planner when configured, else key-free. */
export const itinerarySource: Source<ItineraryData> = {
  key: KEY,
  tier: 'official',
  async getForDestination(q) {
    const label = q.city.he ? `${cityName(q.city)} (${q.city.en})` : cityName(q.city)

    // gather candidate places: curated sights first, then nearby notable spots
    const titles = [...(q.city.sights ?? [])]
    const geoCoords = new Map<string, { lat: number; lng: number }>()
    if (typeof q.city.lat === 'number' && typeof q.city.lng === 'number') {
      try {
        for (const g of await geoSearch(q.city.lat, q.city.lng)) {
          if (!titles.includes(g.title)) titles.push(g.title)
          geoCoords.set(g.title, { lat: g.lat, lng: g.lng })
        }
      } catch {
        /* geosearch optional */
      }
    }

    let places: ItineraryPlace[] = []
    try {
      places = await enrich(titles, q.city.en, geoCoords)
    } catch {
      places = []
    }
    // iconic curated sights lead, then photos first; keep a few per day
    const sights = q.city.sights ?? []
    const isCurated = (n: string) => sights.some((s) => n.includes(s) || s.includes(n))
    places.sort(
      (a, b) =>
        Number(isCurated(b.name)) - Number(isCurated(a.name)) ||
        Number(!!b.image) - Number(!!a.image),
    )
    places = places.slice(0, q.nights * 3)
    // route by proximity so each day's places are close together
    places = orderByProximity(places)

    const prompt = planPrompt(label, q.nights, q.startDate, q.endDate)
    const planners = [
      { label: 'Perplexity', sub: 'מסלול מלא ↗', href: perplexity(prompt) },
      { label: 'ChatGPT', sub: 'מסלול מלא ↗', href: chatgpt(prompt) },
      { label: 'Claude', sub: 'מסלול מלא ↗', href: claudeChat(prompt) },
    ]
    const askContext = `שאלה של מטייל לקראת ${q.nights} ימים ב${label} (${heD(q.startDate)}–${heD(q.endDate)}):`

    if (places.length === 0) {
      // no attractions found — still return a skeleton so the screen is useful
      const days = templateDays(q.nights, [])
      return ok<ItineraryData>(KEY, 'official', { days, planner: 'skeleton', planners, askContext })
    }

    const ai = await aiDays(label, q.nights, places)
    const days = ai ?? templateDays(q.nights, places)
    const planner: ItineraryData['planner'] = ai
      ? 'ai'
      : q.city.sights?.length
        ? 'curated'
        : 'wikipedia'
    return ok<ItineraryData>(KEY, 'official', { days, planner, planners, askContext })
  },
}

function planPrompt(label: string, nights: number, d1: string, d2: string): string {
  return (
    `תכנן לי מסלול טיול מפורט ל-${nights} ימים ב${label}, בין ${heD(d1)} ל-${heD(d2)}. ` +
    `חלק יום-אחר-יום עם אטרקציות מרכזיות, שכונות, מסעדות מומלצות וטיפ מקומי לכל יום.`
  )
}
