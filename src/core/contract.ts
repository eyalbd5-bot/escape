/**
 * The Source Contract runtime: result factories + the runner that enforces the
 * contract's guarantees (timeout, never-throws, typed error/empty returns).
 * Sources build their result with the factories; the aggregator invokes them
 * through `runSource` so a misbehaving source can never break the page.
 */
import { CONFIG } from './config'
import type { DestinationQuery, NormalizedResult, Source, SourceTier } from './types'

const nowIso = () => new Date().toISOString()

/** Successful result with data. */
export function ok<T>(
  source: string,
  tier: SourceTier,
  data: T,
  dedupKey?: string,
): NormalizedResult<T> {
  return { source, tier, status: 'ok', fetchedAt: nowIso(), data, dedupKey }
}

/** Reached the source, but there is nothing to show. */
export function empty<T>(source: string, tier: SourceTier): NormalizedResult<T> {
  return { source, tier, status: 'empty', fetchedAt: nowIso(), data: null }
}

/** The source failed (down, timeout, bad data). */
export function fail<T>(source: string, tier: SourceTier, error: string): NormalizedResult<T> {
  return { source, tier, status: 'error', fetchedAt: nowIso(), data: null, error }
}

function timeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('source timeout')), ms)
    p.then(
      (v) => {
        clearTimeout(t)
        resolve(v)
      },
      (e) => {
        clearTimeout(t)
        reject(e)
      },
    )
  })
}

/**
 * Invoke a source under the contract's guarantees. Always resolves to a
 * NormalizedResult — never throws — applying a hard timeout and converting any
 * thrown error into the source's `error` result.
 */
export async function runSource<T>(
  source: Source<T>,
  q: DestinationQuery,
  timeoutMs: number = CONFIG.sourceTimeoutMs,
): Promise<NormalizedResult<T>> {
  try {
    return await timeout(source.getForDestination(q), timeoutMs)
  } catch (e) {
    return fail<T>(source.key, source.tier, e instanceof Error ? e.message : String(e))
  }
}
