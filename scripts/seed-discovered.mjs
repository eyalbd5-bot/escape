#!/usr/bin/env node
/**
 * Seed the live /api/discovered KV store with the curated seed set (src/data/discovered.json).
 * Run ONCE after the Cloudflare KV namespace + DISCOVERED_TOKEN are set up.
 *
 *   DISCOVERED_TOKEN=<token> node scripts/seed-discovered.mjs [https://escape-694.pages.dev]
 *
 * The endpoint validates + dedups every item, so re-running is safe (already-present items
 * are skipped). Prints the server's {added, rejected, total} summary.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const base = (process.argv[2] || 'https://escape-694.pages.dev').replace(/\/$/, '')
const token = process.env.DISCOVERED_TOKEN
if (!token) {
  console.error('Set DISCOVERED_TOKEN in the environment (the Cloudflare secret value).')
  process.exit(1)
}

const events = JSON.parse(readFileSync(join(here, '..', 'src', 'data', 'discovered.json'), 'utf8'))
const res = await fetch(`${base}/api/discovered`, {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'x-admin-token': token },
  body: JSON.stringify(events),
})
const text = await res.text()
console.log(`HTTP ${res.status}`)
console.log(text)
if (!res.ok) process.exit(1)
