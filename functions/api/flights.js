/**
 * Cloudflare Pages Function — /api/flights
 * Server-side proxy for Travelpayouts (Aviasales) cached flight prices.
 * The API token is server-only (no CORS + must stay secret), so the browser calls
 * THIS same-origin endpoint and we call Travelpayouts here with the secret token.
 *
 * Set in Cloudflare Pages → Settings → Environment variables (Production + Preview):
 *   TRAVELPAYOUTS_TOKEN   (required, secret)   — your Data API token
 *   TRAVELPAYOUTS_MARKER  (optional, public)   — affiliate marker (not used for links here)
 *
 * Returns: { offers: [{airline, price, currency, departure_at, duration, transfers}],
 *            pricesUpdatedAt: "YYYY-MM-DD" }.  Never fabricates — empty on any failure.
 */
const TP = 'https://api.travelpayouts.com/aviasales/v3/prices_for_dates'

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=1800' },
  })

async function query(token, { origin, destination, departure_at, return_at, currency }) {
  const p = new URLSearchParams({
    origin,
    destination,
    departure_at,
    currency,
    sorting: 'price',
    limit: '8',
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
    // 1) exact round-trip dates; 2) fall back to the departure month, one-way
    let data =
      (await query(token, { origin, destination, departure_at, return_at, currency })) || []
    if (data.length === 0 && departure_at.length >= 7)
      data = (await query(token, { origin, destination, departure_at: departure_at.slice(0, 7), currency })) || []

    const offers = data
      .filter((o) => o && typeof o.price === 'number' && o.price > 0)
      .sort((a, b) => a.price - b.price)
      .slice(0, 5)
      .map((o) => ({
        airline: o.airline || '',
        price: Math.round(o.price),
        currency: currency.toUpperCase(),
        departure_at: o.departure_at || '',
        duration: typeof o.duration === 'number' ? o.duration : undefined,
        transfers: typeof o.transfers === 'number' ? o.transfers : 0,
      }))

    const pricesUpdatedAt = new Date().toISOString().slice(0, 10)
    return json({ offers, pricesUpdatedAt })
  } catch (e) {
    return json({ offers: [], error: String(e) })
  }
}
