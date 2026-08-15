/**
 * Cloudflare Pages Function — /api/flights
 * Server-side proxy for Travelpayouts (Aviasales) cached flight prices.
 * The API token is server-only (no CORS + must stay secret), so the browser calls
 * THIS same-origin endpoint and we call Travelpayouts here with the secret token.
 *
 * Set in Cloudflare Pages → Settings → Environment variables (Production + Preview):
 *   TRAVELPAYOUTS_TOKEN   (required, secret)   — your Data API token
 *
 * Quality rules (accuracy is paramount — never surface junk):
 *   - round-trip prices for the EXACT requested dates only (no month fallback that
 *     would show a different date's price).
 *   - max ONE stop — drops the stitched 2–4 stop "self-transfer" itineraries and
 *     non-operating-carrier nonsense (e.g. Wizz Air to New York).
 * If nothing high-quality is cached → return empty (the UI shows the live Google
 * Flights link instead). Never fabricate.
 */
const TP = 'https://api.travelpayouts.com/aviasales/v3/prices_for_dates'
const MAX_STOPS = 1

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=1800' },
  })

async function query(token, { origin, destination, departure_at, return_at, currency }) {
  const p = new URLSearchParams({
    origin,
    destination,
    departure_at, // YYYY-MM-DD → same-day departures only
    currency,
    sorting: 'price',
    limit: '30',
    one_way: return_at ? 'false' : 'true',
    token,
  })
  if (return_at) p.set('return_at', return_at)
  const r = await fetch(`${TP}?${p.toString()}`, { headers: { 'x-access-token': token } })
  if (!r.ok) return null
  const j = await r.json().catch(() => null)
  return j && Array.isArray(j.data) ? j.data : null
}

export async function onRequest(context) {
  const { request, env } = context
  const token = env.TRAVELPAYOUTS_TOKEN
  const url = new URL(request.url)
  const origin = (url.searchParams.get('origin') || 'TLV').toUpperCase()
  const destination = (url.searchParams.get('destination') || '').toUpperCase()
  const departure_at = url.searchParams.get('departure_at') || '' // YYYY-MM-DD
  const return_at = url.searchParams.get('return_at') || ''
  const currency = (url.searchParams.get('currency') || 'ils').toLowerCase()

  if (!token) return json({ offers: [], error: 'TRAVELPAYOUTS_TOKEN not set' })
  if (!destination || !/^[A-Z]{3}$/.test(destination)) return json({ offers: [] })

  try {
    const wanted = departure_at.slice(0, 10) // exact requested departure day
    const clean = (data) =>
      (data || [])
        .filter((o) => o && typeof o.price === 'number' && o.price > 0)
        .filter((o) => (typeof o.transfers === 'number' ? o.transfers : 9) <= MAX_STOPS)
        .filter((o) => !wanted || (o.departure_at || '').slice(0, 10) === wanted)
        .sort((a, b) => a.price - b.price)

    // round-trip total price first (most useful); if that exact date has no quality
    // cache, fall back to one-way outbound (denser) so we still show real prices, labeled.
    let oneWay = false
    let picked = clean(await query(token, { origin, destination, departure_at, return_at, currency }))
    if (picked.length === 0 && return_at) {
      oneWay = true
      picked = clean(await query(token, { origin, destination, departure_at, currency }))
    }

    const offers = picked.slice(0, 5).map((o) => ({
      airline: o.airline || '',
      price: Math.round(o.price),
      currency: currency.toUpperCase(),
      departure_at: o.departure_at || '',
      transfers: typeof o.transfers === 'number' ? o.transfers : 0,
    }))

    return json({ offers, oneWay, pricesUpdatedAt: new Date().toISOString().slice(0, 10) })
  } catch (e) {
    return json({ offers: [], error: String(e) })
  }
}
