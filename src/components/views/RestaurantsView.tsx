import type { City } from '../../types'
import type { NormalizedResult, RestaurantsData } from '../../core/types'
import { cityName } from '../../lib/city'

interface Props {
  city: City
  restaurants: NormalizedResult<RestaurantsData>
}

/** Restaurants (spec §6.8): pick a vibe → real filtered results, read-only. */
export default function RestaurantsView({ city, restaurants }: Props) {
  const categories = restaurants.data?.categories ?? []

  return (
    <div className="rise">
      <div className="vh">🍽️ מסעדות</div>
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="cl">בחרו סוג חוויה</div>
        <div className="note" style={{ marginTop: 6 }}>
          כל קטגוריה נפתחת עם תוצאות אמיתיות ל{cityName(city)} ב-Google Maps או במדריך MICHELIN —
          מסעדות יוקרה, ארוחה קלה, אוכל מקומי ועוד.
        </div>
      </div>
      <div className="catgrid">
        {categories.map((c) => (
          <a key={c.label} className="cat" href={c.href} target="_blank" rel="noreferrer">
            <div className="e">{c.emoji}</div>
            <div className="cn">{c.label}</div>
            <div className="cs">{c.sub} ↗</div>
          </a>
        ))}
      </div>
    </div>
  )
}
