#!/usr/bin/env node
/**
 * Ingest an "Escape Scout" (Grok Bot) ESCAPE_EVENTS JSON file into the site.
 * Usage:  node scripts/add-events.mjs <file.json>
 *
 * Validates every item (accuracy rule — never accept unsourced/malformed data),
 * drops duplicates already present, appends the rest to src/data/discovered.json.
 * Prints exactly what was added / skipped / rejected. Then: commit + push → live.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const STORE = join(process.cwd(), 'src/data/discovered.json')
const CATS = ['concert', 'sports', 'festival', 'expo', 'theatre']
const IATA = /^[A-Z]{3}$/
const YMD = /^\d{4}-\d{2}-\d{2}$/
const isDate = (s) => YMD.test(s) && !Number.isNaN(Date.parse(s + 'T00:00:00'))
const isUrl = (s) => typeof s === 'string' && /^https?:\/\/.+\..+/.test(s)
const ne = (s) => typeof s === 'string' && s.trim().length > 0

const infile = process.argv[2]
if (!infile) {
  console.error('usage: node scripts/add-events.mjs <file.json>')
  process.exit(1)
}

let incoming
try {
  incoming = JSON.parse(readFileSync(infile, 'utf8'))
  if (!Array.isArray(incoming)) throw new Error('top-level JSON must be an array')
} catch (e) {
  console.error('✗ could not read/parse input:', String(e))
  process.exit(1)
}

const store = JSON.parse(readFileSync(STORE, 'utf8'))
const seen = new Set(store.map((e) => `${e.city_iata}|${e.name}`.toLowerCase()))

const reject = (e, why) => ({ e, why })
const added = []
const dupes = []
const rejected = []

for (const e of incoming) {
  const problems = []
  if (!CATS.includes(e?.category)) problems.push(`category must be one of ${CATS.join('/')}`)
  if (!IATA.test(e?.city_iata || '')) problems.push('city_iata must be 3 uppercase letters')
  if (!ne(e?.name)) problems.push('name required')
  if (!ne(e?.venue)) problems.push('venue required')
  if (!ne(e?.source)) problems.push('source required (no unsourced items)')
  if (!isUrl(e?.url)) problems.push('url must be http(s)')
  if (!isDate(e?.date_start)) problems.push('date_start must be YYYY-MM-DD')
  if (e?.date_end != null && !isDate(e.date_end)) problems.push('date_end must be YYYY-MM-DD')
  if (e?.date_end != null && isDate(e?.date_start) && e.date_start > e.date_end)
    problems.push('date_start after date_end')
  if (problems.length) {
    rejected.push(reject(e, problems.join('; ')))
    continue
  }
  const key = `${e.city_iata}|${e.name}`.toLowerCase()
  if (seen.has(key)) {
    dupes.push(e)
    continue
  }
  seen.add(key)
  const clean = {
    category: e.category,
    city_iata: e.city_iata,
    name: e.name.trim(),
    venue: e.venue.trim(),
    date_start: e.date_start,
    date_end: e.date_end ?? null,
    url: e.url,
    source: e.source,
    score: typeof e.score === 'number' ? e.score : undefined,
  }
  if (e.he) clean.he = e.he
  store.push(clean)
  added.push(clean)
}

if (added.length) writeFileSync(STORE, JSON.stringify(store, null, 2) + '\n')

console.log(`\n✓ added ${added.length} · ⤳ skipped ${dupes.length} duplicates · ✗ rejected ${rejected.length}`)
for (const a of added) console.log(`   + [${a.category}] ${a.city_iata} · ${a.name} (${a.source})`)
for (const d of dupes) console.log(`   = already had: ${d.city_iata} · ${d.name}`)
for (const r of rejected) console.log(`   ✗ ${r.e?.name || '(no name)'} — ${r.why}`)
console.log('')
