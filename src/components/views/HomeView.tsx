import { useEffect, useState } from 'react'
import type { ViewKey } from '../../types'
import type { AggregatedResponse } from '../../core/types'
import { heD, fmt, daysUntil } from '../../lib/format'
import { flag, cityName } from '../../lib/city'

interface Props {
  data: AggregatedResponse
  onNavigate: (view: ViewKey) => void
}

const FALLBACK_DESC =
  'יעד מומלץ לחופשה. גללו לכרטיסים שמתחת — טיסות, מלונות, מסלול, אירועים, מסעדות, מטבע ומזג אוויר — או פתחו כל נושא להעמקה.'

/** Cinematic hero with rotating photos + countdown chip (crossfade + Ken Burns). */
function Hero({ pics, destination }: { pics: string[]; destination: AggregatedResponse['destination'] }) {
  const { city, startDate, endDate, nights } = destination
  const [idx, setIdx] = useState(0)

  useEffect(() => setIdx(0), [city.iata])
  useEffect(() => {
    if (pics.length < 2) return
    const t = setInterval(() => setIdx((i) => (i + 1) % pics.length), 6000)
    return () => clearInterval(t)
  }, [pics.length])

  return (
    <div className="dhero rise">
      {pics.map((src, i) => (
        <img key={src} src={src} alt="" className={i === idx ? 'kb' : ''} style={{ opacity: i === idx ? 1 : 0 }} />
      ))}
      <div className="veil" />
      <div className="cd">
        <b>{daysUntil(startDate)}</b>
        <span>ימים לטיסה</span>
      </div>
      <div className="cap">
        <div className="ct">המסע שלי</div>
        <h2>
          {flag(city)} {cityName(city)}
        </h2>
        <div className="sub">
          TLV → {city.iata} · {heD(startDate)}–{heD(endDate)} · {nights} ימים
        </div>
      </div>
    </div>
  )
}

const priceRange = (r?: { lo: number; hi: number } | null) =>
  r ? `${fmt(r.lo)}–${fmt(r.hi)}` : '—'

/** Destination blurb — tap to expand the full description. */
function About({ name, description }: { name: string; description: string }) {
  const [open, setOpen] = useState(false)
  const expandable = description.length > 120
  return (
    <div
      className="about rise"
      onClick={() => expandable && setOpen((v) => !v)}
      style={expandable ? { cursor: 'pointer' } : undefined}
    >
      <div className="cl">✦ על {name}</div>
      <p className={open ? 'open' : ''}>{description}</p>
      {expandable && <div className="more">{open ? 'הצג פחות ▲' : 'קרא עוד ▼'}</div>}
    </div>
  )
}

interface TileDef {
  view: ViewKey
  emoji: string
  title: string
  value: string
  tone: 'coral' | 'teal'
  mini?: boolean
}

/** Home dashboard (spec §6.2) — reads the aggregated response only. */
export default function HomeView({ data, onNavigate }: Props) {
  const { city, nights } = data.destination

  const media = data.media.data
  const pics = media?.images.length ? media.images : media?.hero ? [media.hero] : []
  const description = data.info.data?.description ?? FALLBACK_DESC
  const wxMini = data.weather.data?.mini ?? 'מזג אוויר'
  const sights = city.sights ?? []
  const sightsPreview = sights.length ? sights.slice(0, 3).join(' · ') : `${nights} ימים`
  const venuePreview = city.venue ? `${city.venue} · ועוד` : 'חפש ↗'

  const tiles: TileDef[] = [
    { view: 'flights', emoji: '✈️', title: 'טיסות', value: priceRange(data.flights.data?.range), tone: 'coral' },
    { view: 'hotels', emoji: '🏨', title: 'מלונות', value: priceRange(data.hotels.data?.range), tone: 'coral' },
    { view: 'itinerary', emoji: '🗺️', title: 'מסלול', value: sightsPreview, tone: 'teal', mini: true },
    { view: 'events', emoji: '🎟️', title: 'אירועים', value: venuePreview, tone: 'teal', mini: true },
    { view: 'restaurants', emoji: '🍽️', title: 'מסעדות', value: 'מישלן · יוקרה · קליל', tone: 'teal', mini: true },
    { view: 'currency', emoji: '💱', title: 'מטבע', value: `₪ ↔ ${city.cur}`, tone: 'teal' },
    { view: 'info', emoji: 'ℹ️', title: 'מידע', value: wxMini, tone: 'teal' },
    { view: 'emergency', emoji: '🆘', title: 'חירום', value: 'מספרים · שגרירות', tone: 'teal', mini: true },
  ]

  return (
    <div className="homewrap">
      <Hero pics={pics} destination={data.destination} />

      <About name={cityName(city)} description={description} />

      <div className="grid">
        {tiles.map((t) => (
          <div
            className="tile rise"
            key={t.view}
            role="button"
            tabIndex={0}
            aria-label={`${t.title}: ${t.value}`}
            onClick={() => onNavigate(t.view)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onNavigate(t.view)
              }
            }}
          >
            <div className="e" aria-hidden="true">
              {t.emoji}
            </div>
            <div className="txt">
              <div className="tt">{t.title}</div>
              <div className={`vv ${t.tone}${t.mini ? ' mini' : ''}`}>{t.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
