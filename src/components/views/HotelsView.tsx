import type { HotelsData, NormalizedResult } from '../../core/types'
import { fmt } from '../../lib/format'

interface Props {
  hotels: NormalizedResult<HotelsData>
}

/** Hotels (spec §6.5): estimated range for N nights + Booking deep link, read-only. */
export default function HotelsView({ hotels }: Props) {
  const d = hotels.data
  const range = d?.range
  const links = d?.links ?? []

  return (
    <div className="rise">
      <div className="vh">
        🏨 מלונות <span className="tag">הערכה</span>
      </div>
      <div className="card">
        <div className="cl">{d?.nights ?? 0} לילות · זוג</div>
        <div className="price">{range ? `${fmt(range.lo)}–${fmt(range.hi)}` : '—'}</div>
        <div className="note">
          טווח הערכה. הכפתור פותח מחירים אמיתיים ב-Booking לתאריכים ולמספר האורחים שלכם.
        </div>
      </div>
      <div className="btns">
        {links.map((l) => (
          <a href={l.href} target="_blank" rel="noreferrer" key={l.label}>
            <div className="n">{l.label}</div>
            <div className="a">{l.sub}</div>
          </a>
        ))}
      </div>
    </div>
  )
}
