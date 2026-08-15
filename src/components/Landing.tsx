import { useMemo, useState } from 'react'
import type { City, Trip } from '../types'
import { nightsBetween, nextWeekRange } from '../lib/format'
import DestinationPicker from './DestinationPicker'

interface Props {
  onCreate: (trip: Trip) => void
}

/** Landing screen: title + destination picker + date range + create button. */
export default function Landing({ onCreate }: Props) {
  const [city, setCity] = useState<City | null>(null)
  // default to next week (Mon–Fri), computed live rather than a hard-coded date
  const nw = useMemo(nextWeekRange, [])
  const [d1, setD1] = useState(nw.d1)
  const [d2, setD2] = useState(nw.d2)

  const create = () => {
    if (!city) {
      alert('בחר יעד מהרשימה')
      return
    }
    if (!d1 || !d2) {
      alert('בחר תאריכים')
      return
    }
    if (new Date(d2) <= new Date(d1)) {
      alert('תאריך החזרה חייב להיות אחרי ההלוך')
      return
    }
    onCreate({ city, d1, d2, nights: nightsBetween(d1, d2) })
  }

  return (
    <div className="land">
      <div className="kick">Escape · מנוע גילוי</div>
      <h1>
        החופשה
        <br />
        <em>מתחילה כאן</em>
      </h1>
      <p>בחרו יעד — וקבלו דף בית עם הכול, ואפשרות להעמיק בכל נושא.</p>
      <div className="panel">
        <div className="lbl">לאן טסים?</div>
        <DestinationPicker selected={city} onSelect={setCity} />
        <div className="dates">
          <div>
            <div className="lbl">הלוך</div>
            <input type="date" value={d1} onChange={(e) => setD1(e.target.value)} />
          </div>
          <div>
            <div className="lbl">חזור</div>
            <input type="date" value={d2} onChange={(e) => setD2(e.target.value)} />
          </div>
        </div>
        <button className="go" onClick={create}>
          צור את המסע
        </button>
      </div>
    </div>
  )
}
