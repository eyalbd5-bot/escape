#!/usr/bin/env node
/**
 * "Never fabricate data" — the code-level lint (AGENTS.md rule 1).
 * `src/data/integrity.test.ts` validates the curated DATA (every item has a real source +
 * valid dates); this scans the CODE for fabrication tells that test can't see:
 *   1. placeholder / mock / lorem content shipped in production code
 *   2. `Math.random` in the data layer — real listings are sourced, never randomized
 * Distance-based ESTIMATES (flights/hotels) are fine: deterministic + flagged `estimated`.
 * Runs first in `npm run verify`; exits non-zero on any violation.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const SRC = join(process.cwd(), 'src')

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) return walk(p)
    return /\.(ts|tsx)$/.test(name) && !/\.test\.ts$/.test(name) ? [p] : []
  })

const files = walk(SRC)
const rel = (f) => f.slice(SRC.length + 1)

// two-word markers so real JSX `placeholder="…"` attributes never false-match
const PLACEHOLDER =
  /\b(lorem ipsum|dummy data|placeholder data|sample data|mock data|fakedata|foobar)\b|example\.com/i

const violations = []
for (const f of files) {
  const txt = readFileSync(f, 'utf8')
  const m = txt.match(PLACEHOLDER)
  if (m) violations.push(`${rel(f)}: fabrication marker "${m[0]}"`)
  if (/[/\\](sources|data)[/\\]/.test(f) && txt.includes('Math.random'))
    violations.push(`${rel(f)}: Math.random in the data layer — listings must be real, not randomized`)
}

if (violations.length) {
  console.error('✗ no-fabrication lint failed:')
  for (const v of violations) console.error('   - ' + v)
  process.exit(1)
}
console.log(`✓ no-fabrication: ${files.length} production files clean`)
