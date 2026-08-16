import type { FlightOffer, FlightsData, Source } from '../core/types'
import { ok } from '../core/contract'
import { skyscanner, googleFlights, kayak, perplexity, chatgpt, claudeChat } from '../lib/links'
import { flightBase, isEstimated } from './pricing'
import { cityName } from '../lib/city'
import { heD } from '../lib/format'
import { CONFIG } from '../core/config'
import { airlineName } from '../data/airlines'

const KEY = 'flights-deeplinks'

const hhmm = (iso?: string) => (iso && /T\d\d:\d\d/.test(iso) ? iso.slice(11, 16) : undefined)

interface ProxyOffer {
  airline?: string
  price?: number
  currency?: string
  departure_at?: string
  duration?: number
  transfers?: number
}

/**
 * Real priced options from the live-price proxy (Cloudflare Function → Travelpayouts).
 * Empty in local dev (no Function) or on any failure — NEVER fabricated. Each row's
 * click opens Google Flights for the exact route + dates (what the user asked for).
 */
async function fetchOffers(
  iata: string,
  d1: string,
  d2: string,
): Promise<{ offers: FlightOffer[]; updatedAt?: string; oneWay?: boolean }> {
  try {
    const u =
      `${CONFIG.flightsApi}?origin=${CONFIG.origin}&destination=${iata}` +
      `&departure_at=${d1}&return_at=${d2}&currency=ils`
    const res = await fetch(u)
    // guard against the dev SPA-fallback (HTML) — only accept real JSON from the Function
    if (!res.ok || !(res.headers.get('content-type') || '').includes('json')) return { offers: [] }
    const j = (await res.json()) as { offers?: ProxyOffer[]; pricesUpdatedAt?: string; oneWay?: boolean }
    const gf = googleFlights(iata, d1, d2)
    const offers: FlightOffer[] = (j.offers ?? [])
      .filter((o) => typeof o.price === 'number' && o.price > 0)
      .slice(0, 5)
      .map((o) => ({
        airline: airlineName(o.airline || ''),
        price: Math.round(o.price as number),
        currency: o.currency || 'ILS',
        date: (o.departure_at || '').slice(0, 10) || undefined,
        depart: hhmm(o.departure_at),
        durationMin: typeof o.duration === 'number' ? o.duration : undefined,
        stops: typeof o.transfers === 'number' ? o.transfers : 0,
        href: gf, // click → Google Flights for the route + dates
      }))
    return { offers, updatedAt: j.pricesUpdatedAt, oneWay: j.oneWay }
  } catch {
    return { offers: [] }
  }
}

/** Flight price estimate + deep links + real priced options (TLV origin, spec §6.4). */
export const flightsSource: Source<FlightsData> = {
  key: KEY,
  tier: 'official',
  async getForDestination(q) {
    const base = flightBase(q.city)
    const label = q.city.he ? `${cityName(q.city)} (${q.city.en})` : cityName(q.city)
    const window = `${heD(q.startDate)}–${heD(q.endDate)}`
    const botPrompt =
      `מצא לי טיסות מ-תל אביב (TLV) ל${label} בין ${heD(q.startDate)} ל-${heD(q.endDate)}. ` +
      `פרט חברות תעופה, טווחי מחירים נוכחיים בשקלים, אפשרויות ישיר מול עם עצירה, ומתי כדאי להזמין. ` +
      `ענה בעברית, ואם חסר לך מידע (תקציב, כמות נוסעים, גמישות בתאריכים) — שאל אותי.`

    const { offers, updatedAt, oneWay } = await fetchOffers(q.city.iata, q.startDate, q.endDate)

    return ok<FlightsData>(KEY, 'official', {
      range: { lo: Math.round(base * 0.85), hi: Math.round(base * 1.2), estimated: isEstimated(q.city) },
      links: [
        { label: 'Kayak', sub: 'חפש ↗', href: kayak(q.city.iata, q.startDate, q.endDate) },
        { label: 'Skyscanner', sub: 'חפש ↗', href: skyscanner(q.city.iata, q.startDate, q.endDate) },
        { label: 'Google Flights', sub: 'חפש ↗', href: googleFlights(q.city.iata, q.startDate, q.endDate) },
      ],
      bots: [
        { label: 'Perplexity', sub: 'חיפוש חי ↗', href: perplexity(botPrompt) },
        { label: 'ChatGPT', sub: 'שיחה ↗', href: chatgpt(botPrompt) },
        { label: 'Claude', sub: 'שיחה ↗', href: claudeChat(botPrompt) },
      ],
      askContext: `שאלה על טיסה מ-TLV ל${label} (${window}):`,
      offers,
      pricesUpdatedAt: updatedAt,
      offersOneWay: oneWay,
    })
  },
}
