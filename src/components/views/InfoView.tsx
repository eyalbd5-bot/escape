import type { City } from '../../types'
import type { InfoData, NormalizedResult, WeatherData } from '../../core/types'
import { tzFromTLV } from '../../lib/format'
import { gmaps, airalo } from '../../lib/links'

interface Props {
  city: City
  weather: NormalizedResult<WeatherData>
  info: NormalizedResult<InfoData>
}

/** Info screen (spec §6.8): live weather + quick links + curated "essential" rows. */
export default function InfoView({ city, weather, info }: Props) {
  const days = weather.data?.days ?? []
  const cd = info.data?.country ?? null

  return (
    <div className="rise">
      <div className="vh">ℹ️ מידע נוסף</div>

      <div className="card">
        <div className="cl">מזג אוויר</div>
        <div className="wx" style={{ marginTop: 8 }}>
          {days.length === 0 ? (
            <div className="note">תחזית לא זמינה — בייצור ממוצעים עונתיים.</div>
          ) : (
            days.map((d, i) => (
              <div className="wd" key={i}>
                <div className="dd">{d.label}</div>
                <div className="ic">{d.icon}</div>
                <div className="tt">
                  {d.max}°<small>/{d.min}°</small>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="note">Open-Meteo (חי). לתאריכים רחוקים — ממוצעים עונתיים בייצור.</div>
      </div>

      <div className="tiles">
        <a href={gmaps('public transport ' + city.en)} target="_blank" rel="noreferrer">
          <div className="e">🚇</div>
          <div className="n">תחבורה</div>
        </a>
        <a href={gmaps('top attractions ' + city.en)} target="_blank" rel="noreferrer">
          <div className="e">📸</div>
          <div className="n">אטרקציות</div>
        </a>
        <a
          href={airalo(cd?.sim || '')}
          target="_blank"
          rel="noreferrer"
          style={cd?.sim ? undefined : { pointerEvents: 'none', opacity: 0.5 }}
        >
          <div className="e">📶</div>
          <div className="n">eSIM</div>
        </a>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="cl">חיוני לדעת · אצור</div>
        <div className="row">
          <span className="ri">🛂</span>
          <span className="rk">ויזה (🇮🇱)</span>
          <span className="rv">{cd?.visa || 'בדקו'}</span>
        </div>
        <div className="row">
          <span className="ri">🔌</span>
          <span className="rk">תקע / מתח</span>
          <span className="rv">{cd?.plug || '—'}</span>
        </div>
        <div className="row">
          <span className="ri">🕐</span>
          <span className="rk">אזור זמן</span>
          <span className="rv">{cd ? tzFromTLV(cd.tz) : '—'}</span>
        </div>
        <div className="row">
          <span className="ri">💵</span>
          <span className="rk">טיפים</span>
          <span className="rv">{cd?.tip || '—'}</span>
        </div>
      </div>
    </div>
  )
}
