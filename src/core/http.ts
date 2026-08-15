/**
 * Shared HTTP layer: timeout + retry + in-memory TTL cache. Every source fetches
 * through here so none reinvents resilience. No framework coupling.
 */
import { CONFIG } from './config'

interface GetOptions {
  timeoutMs?: number
  retries?: number
  /** cache TTL in ms (0 disables caching) */
  cacheTtlMs?: number
}

interface CacheEntry {
  at: number
  data: unknown
}

const cache = new Map<string, CacheEntry>()

/** Clear the HTTP cache (used by tests). */
export function clearHttpCache(): void {
  cache.clear()
}

function withTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer))
}

/** GET JSON with timeout, retry and optional TTL cache. Throws on final failure. */
export async function httpGetJson<T = unknown>(url: string, opts: GetOptions = {}): Promise<T> {
  const { timeoutMs = CONFIG.timeoutMs, retries = 1, cacheTtlMs = 0 } = opts

  if (cacheTtlMs > 0) {
    const hit = cache.get(url)
    if (hit && Date.now() - hit.at < cacheTtlMs) return hit.data as T
  }

  let lastError: unknown
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await withTimeout(url, timeoutMs)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as T
      if (cacheTtlMs > 0) cache.set(url, { at: Date.now(), data })
      return data
    } catch (e) {
      lastError = e
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError))
}
