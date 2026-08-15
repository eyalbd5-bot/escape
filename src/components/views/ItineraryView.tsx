import { useState } from 'react'
import type { City } from '../../types'
import type { ItineraryData, NormalizedResult } from '../../core/types'
import { cityName } from '../../lib/city'
import { perplexity } from '../../lib/links'

interface Props {
  city: City
  itinerary: NormalizedResult<ItineraryData>
}

const PLANNER_LABEL: Record<ItineraryData['planner'], string> = {
  ai: 'AI',
  curated: 'מדריך',
  wikipedia: 'מדריך',
  skeleton: 'שלד',
}

const SUGGESTIONS = [
  'איפה הכי כדאי לישון?',
  'מה האוכל המקומי שחובה לטעום?',
  'איך מתניידים בעיר?',
  'מה כדאי לעשות עם ילדים?',
  'טיפים לחיסכון',
]

/** "Ask the guide" — key-free Q&A: opens a chatbot answer with the trip context. */
function AskGuide({ name, askContext }: { name: string; askContext: string }) {
  const [q, setQ] = useState('')
  const ask = (question: string) => {
    const text = question.trim()
    if (text) window.open(perplexity(`${askContext} ${text}`), '_blank', 'noopener')
  }
  return (
    <div className="card">
      <div className="cl">💬 שאלו את המדריך</div>
      <div className="note" style={{ marginTop: 6 }}>
        שאלו כל דבר על {name} — נפתח מענה חכם עם ההקשר של הטיול שלכם.
      </div>
      <div className="ask">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && ask(q)}
          placeholder="מה תרצו לדעת?"
        />
        <button onClick={() => ask(q)} aria-label="שאל">
          שאל ↗
        </button>
      </div>
      <div className="chips">
        {SUGGESTIONS.map((s) => (
          <button className="chip" key={s} onClick={() => ask(s)}>
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

/** Itinerary (spec §6.3): a virtual tour guide — themed days with real
 *  attractions, photos and tips, plus an "ask the guide" Q&A. Read-only data. */
export default function ItineraryView({ city, itinerary }: Props) {
  const name = cityName(city)
  const d = itinerary.data
  const days = d?.days ?? []
  const planners = d?.planners ?? []

  return (
    <div className="rise">
      <div className="vh">
        🗺️ מסלול ל{name} <span className="tag">{d ? PLANNER_LABEL[d.planner] : 'מדריך'}</span>
      </div>

      {d && <AskGuide name={name} askContext={d.askContext} />}

      <div className="itin">
        {days.map((day) => (
          <div className="iday" key={day.n}>
            <div className="ihead">
              <span className="idn">{day.n}</span>
              <b>{day.theme}</b>
            </div>
            {day.places.map((p, i) => (
              <div className="iplace" key={i}>
                {p.image ? <img src={p.image} alt={p.name} loading="lazy" /> : <div className="iph" aria-hidden="true">📍</div>}
                <div className="itx">
                  <b>{p.name}</b>
                  <p>{p.description}</p>
                  <a className="igo" href={p.mapsUrl} target="_blank" rel="noreferrer">
                    🧭 הגעה
                  </a>
                </div>
              </div>
            ))}
            <div className="itip">💡 {day.tip}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="cl">✨ מסלול מלא מותאם אישית</div>
        <div className="note" style={{ marginTop: 6 }}>
          רוצים תוכנית יום-אחר-יום מפורטת? פתחו אותה במודל לבחירתכם.
        </div>
        <div className="btns" style={{ marginTop: 12 }}>
          {planners.map((p) => (
            <a key={p.label} href={p.href} target="_blank" rel="noreferrer">
              <div className="n">{p.label}</div>
              <div className="a">{p.sub}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
