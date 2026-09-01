/**
 * Cloudflare Pages Function — /api/discovered
 * The live channel for agent-discovered events (Escape Scout / Grok Bot).
 *
 *   GET  /api/discovered?city=LON&d1=YYYY-MM-DD&d2=YYYY-MM-DD
 *        → events for that city overlapping the window (public; the SPA reads this).
 *   POST /api/discovered   (header  X-Admin-Token: <DISCOVERED_TOKEN>)
 *        body = the agent's ESCAPE_EVENTS JSON array. Validates every item
 *        (category, IATA, name, venue, source, url, valid dates — NO unsourced/malformed
 *        items), drops duplicates, stores in KV. This is the "direct, automatic" path:
 *        Grok POSTs its morning scan → it's live on the site instantly.
 *
 * Cloudflare Pages bindings (set once, see the cowork handoff):
 *   KV namespace binding  DISCOVERED_KV   (stores the events array under key "events")
 *   Secret env var        DISCOVERED_TOKEN (the write token; the site GET needs no token)
 *
 * Accuracy note: server validation rejects unsourced/malformed items, but cannot verify a
 * well-formed claim against its source — periodic human audit still recommended.
 */
const CATS = ['concert', 'sports', 'festival', 'expo', 'theatre']
const IATA = /^[A-Z]{3}$/
const YMD = /^\d{4}-\d{2}-\d{2}$/
const isDate = (s) => YMD.test(s) && !Number.isNaN(Date.parse(s + 'T00:00:00'))
const isUrl = (s) => typeof s === 'string' && /^https?:\/\/.+\..+/.test(s)
const ne = (s) => typeof s === 'string' && s.trim().length > 0
const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': 'content-type,x-admin-token',
}
const json = (body, status = 200, extra = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...CORS, ...extra },
  })

export async function onRequest(context) {
  const { request, env } = context
  const kv = env.DISCOVERED_KV
  const url = new URL(request.url)

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS })
  if (!kv) return json({ events: [], error: 'DISCOVERED_KV not bound' })

  // ---- read (public) ----
  if (request.method === 'GET') {
    const city = (url.searchParams.get('city') || '').toUpperCase()
    const d1 = url.searchParams.get('d1') || ''
    const d2 = url.searchParams.get('d2') || ''
    let events = JSON.parse((await kv.get('events')) || '[]')
    if (city) events = events.filter((e) => e.city_iata === city)
    if (d1 && d2)
      events = events.filter((e) => {
        const s = e.date_start
        const end = e.date_end || e.date_start
        return s <= d2 && end >= d1 // run overlaps the trip window
      })
    return json({ events }, 200, { 'cache-control': 'public, max-age=300' })
  }

  // ---- write (agent only, token-guarded) ----
  if (request.method === 'POST') {
    if ((request.headers.get('x-admin-token') || '') !== env.DISCOVERED_TOKEN)
      return json({ error: 'unauthorized' }, 401)
    let body
    try {
      body = await request.json()
    } catch {
      return json({ error: 'invalid JSON' }, 400)
    }
    const items = Array.isArray(body) ? body : Array.isArray(body?.events) ? body.events : []
    const store = JSON.parse((await kv.get('events')) || '[]')
    const seen = new Set(store.map((e) => `${e.city_iata}|${e.name}`.toLowerCase()))
    let added = 0
    const rejected = []
    for (const e of items) {
      const okItem =
        CATS.includes(e?.category) &&
        IATA.test(e?.city_iata || '') &&
        ne(e?.name) &&
        ne(e?.venue) &&
        ne(e?.source) &&
        isUrl(e?.url) &&
        isDate(e?.date_start) &&
        (e?.date_end == null || isDate(e.date_end)) &&
        (e?.date_end == null || e.date_start <= e.date_end)
      if (!okItem) {
        rejected.push(e?.name || '(unnamed)')
        continue
      }
      const key = `${e.city_iata}|${e.name}`.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      store.push({
        category: e.category,
        city_iata: e.city_iata,
        name: e.name,
        he: e.he,
        venue: e.venue,
        date_start: e.date_start,
        date_end: e.date_end ?? null,
        url: e.url,
        source: e.source,
        score: typeof e.score === 'number' ? e.score : undefined,
      })
      added++
    }
    await kv.put('events', JSON.stringify(store))
    return json({ ok: true, added, rejected: rejected.length, rejectedNames: rejected, total: store.length })
  }

  return json({ error: 'method not allowed' }, 405)
}
