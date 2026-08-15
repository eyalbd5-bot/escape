import type { RestaurantsData, Source } from '../core/types'
import { ok } from '../core/contract'
import { gmaps, michelin } from '../lib/links'

const KEY = 'restaurants-deeplinks'

/** Restaurant categories → real filtered results (MICHELIN / Maps, key-free). */
export const restaurantsSource: Source<RestaurantsData> = {
  key: KEY,
  tier: 'official',
  async getForDestination(q) {
    const c = q.city.en
    return ok<RestaurantsData>(KEY, 'official', {
      categories: [
        { emoji: '⭐', label: 'כוכבי מישלן', sub: 'מדריך MICHELIN', href: michelin(c) },
        { emoji: '🥂', label: 'יוקרה · חוויה', sub: 'fine dining', href: gmaps('fine dining restaurants ' + c) },
        { emoji: '🍽️', label: 'מומלצות', sub: 'best restaurants', href: gmaps('best restaurants ' + c) },
        { emoji: '🥗', label: 'ארוחה קלה', sub: 'casual · lunch', href: gmaps('casual lunch restaurants cafe ' + c) },
        { emoji: '🍜', label: 'אוכל מקומי', sub: 'local · street food', href: gmaps('local traditional street food ' + c) },
        { emoji: '🌱', label: 'צמחוני · טבעוני', sub: 'vegan · vegetarian', href: gmaps('vegan vegetarian restaurants ' + c) },
        { emoji: '☕', label: 'בתי קפה', sub: 'cafés · brunch', href: gmaps('cafes brunch ' + c) },
        { emoji: '🌆', label: 'נוף · גג', sub: 'rooftop · view', href: gmaps('rooftop restaurant with a view ' + c) },
      ],
    })
  },
}
