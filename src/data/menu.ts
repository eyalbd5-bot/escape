import type { ViewKey } from '../types'

export interface MenuEntry {
  key: ViewKey
  label: string
  emoji: string
}

/** Navigation menu — order and labels match the prototype (spec §4). */
export const MENU: MenuEntry[] = [
  { key: 'home', label: 'דף הבית', emoji: '🏠' },
  { key: 'itinerary', label: 'מסלול יומי', emoji: '🗺️' },
  { key: 'flights', label: 'טיסות', emoji: '✈️' },
  { key: 'hotels', label: 'מלונות', emoji: '🏨' },
  { key: 'events', label: 'אירועים', emoji: '🎟️' },
  { key: 'restaurants', label: 'מסעדות', emoji: '🍽️' },
  { key: 'currency', label: 'המרת מטבע', emoji: '💱' },
  { key: 'info', label: 'מידע נוסף', emoji: 'ℹ️' },
  { key: 'emergency', label: 'חירום', emoji: '🆘' },
]
