/** Formatting helpers ported from the prototype. */

/** "2026-09-09" -> "9.9" (Hebrew short day.month) */
export const heD = (s: string): string => {
  const [, m, d] = s.split('-')
  return `${+d}.${+m}`
}

/** number -> "₪1,234" with Hebrew thousands grouping */
export const fmt = (n: number): string => '₪' + Math.round(n).toLocaleString('he')

/** Whole days from today until the given YYYY-MM-DD (>= 0). */
export const daysUntil = (dateStr: string): number =>
  Math.max(0, Math.ceil((new Date(dateStr).getTime() - Date.now()) / 864e5))

/** Nights between two YYYY-MM-DD dates (>= 1). */
export const nightsBetween = (d1: string, d2: string): number =>
  Math.max(1, Math.round((new Date(d2).getTime() - new Date(d1).getTime()) / 864e5))

/** Local-time YYYY-MM-DD (not UTC — avoids an off-by-one day near midnight). */
const ymd = (dt: Date): string =>
  `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`

/** Default trip window: next week, Monday → Friday (4 nights). Computed live. */
export function nextWeekRange(): { d1: string; d2: string } {
  const now = new Date()
  const dow = now.getDay() // 0=Sun … 6=Sat
  const toThisMonday = dow === 0 ? -6 : 1 - dow
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + toThisMonday + 7)
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 4)
  return { d1: ymd(start), d2: ymd(end) }
}

/** Tel Aviv standard UTC offset (Israel Standard Time). */
const TLV_OFFSET = 2

/**
 * Format a curated "UTC±N" string as GMT + the hour difference from Tel Aviv.
 * Uses standard offsets (ignores DST), so the gap can be ±1h during DST windows.
 * e.g. "UTC+9" → "GMT+9 · +7 ש׳ מתל אביב"; "UTC+0" → "GMT+0 · -2 ש׳ מתל אביב".
 */
export const tzFromTLV = (tz: string): string => {
  const m = tz.match(/UTC\s*([+-]?\d+)(?::(\d+))?/i)
  if (!m) return tz
  const hours = parseInt(m[1], 10)
  const mins = (m[2] ? parseInt(m[2], 10) : 0) * (hours < 0 ? -1 : 1)
  const off = hours + mins / 60
  // m[1] already includes the sign for our "UTC±N" data; normalise a missing one.
  const signedHours = /^[+-]/.test(m[1]) ? m[1] : `+${m[1]}`
  const gmt = `GMT${signedHours}${m[2] ? ':' + m[2] : ''}`
  const diff = off - TLV_OFFSET
  const sign = diff > 0 ? '+' : '-'
  const abs = Math.abs(diff)
  const label = Number.isInteger(abs) ? `${abs}` : `${abs}`.replace('.5', '½')
  const rel = diff === 0 ? 'כמו תל אביב' : `${sign}${label} ש׳ מתל אביב`
  return `${gmt} · ${rel}`
}
