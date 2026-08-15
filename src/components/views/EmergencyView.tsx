import type { City } from '../../types'
import type { InfoData, NormalizedResult } from '../../core/types'
import { gmaps, TRAVEL_WARNING } from '../../lib/links'

interface Props {
  city: City
  info: NormalizedResult<InfoData>
}

/** Emergency (spec §6.9): local number, embassy, travel warning, insurance. */
export default function EmergencyView({ city, info }: Props) {
  const cd = info.data?.country ?? null

  return (
    <div className="rise">
      <div className="vh">🆘 חירום</div>
      <div className="card">
        <div className="row">
          <span className="ri">🚨</span>
          <span className="rk">חירום מקומי</span>
          <span className="rv">{cd?.emer || '112'}</span>
        </div>
        <div className="row">
          <span className="ri">🏛️</span>
          <span className="rk">שגרירות ישראל</span>
          <a className="rv" href={gmaps('Israel embassy ' + city.en)} target="_blank" rel="noreferrer">
            מצא ↗
          </a>
        </div>
        <div className="row">
          <span className="ri">⚠️</span>
          <span className="rk">אזהרת מסע</span>
          <a className="rv" href={TRAVEL_WARNING} target="_blank" rel="noreferrer">
            מל״ל ↗
          </a>
        </div>
        <div className="row">
          <span className="ri">🏥</span>
          <span className="rk">ביטוח נסיעות</span>
          <span className="rv">הוסף בייצור</span>
        </div>
      </div>
    </div>
  )
}
