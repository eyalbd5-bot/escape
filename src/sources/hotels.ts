import type { HotelsData, Source } from '../core/types'
import { ok } from '../core/contract'
import { booking } from '../lib/links'
import { nightlyRate } from './pricing'

const KEY = 'hotels-deeplinks'

/** Hotel price estimate for N nights + Booking deep link (key-free, spec §6.5). */
export const hotelsSource: Source<HotelsData> = {
  key: KEY,
  tier: 'official',
  async getForDestination(q) {
    const nightly = nightlyRate(q.city)
    return ok<HotelsData>(KEY, 'official', {
      nights: q.nights,
      range: {
        lo: Math.round(nightly * q.nights),
        hi: Math.round(nightly * q.nights * 1.6),
        estimated: typeof q.city.nightly !== 'number',
      },
      links: [{ label: 'Booking.com', sub: 'הזמן ↗', href: booking(q.city.en, q.startDate, q.endDate) }],
    })
  },
}
