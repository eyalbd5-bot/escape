import type { FlightOffer, FlightsData, NormalizedResult } from '../../core/types'
import { fmt, heD } from '../../lib/format'

interface Props {
  flights: NormalizedResult<FlightsData>
}

const stopsLabel = (n: number) => (n === 0 ? 'ישיר' : n === 1 ? 'עצירה אחת' : `${n} עצירות`)

/** One real, priced flight option — clicking opens the booking / Google-Flights link. */
function OfferRow({ o, best }: { o: FlightOffer; best?: boolean }) {
  return (
    <a className={`offer${best ? ' best' : ''}`} href={o.href} target="_blank" rel="noreferrer">
      <div className="oleft">
        <div className="oair">
          <bdi>{o.airline}</bdi>
          {best && <span className="obadge">הזול</span>}
        </div>
        <div className="ometa">
          {o.depart && (
            <>
              יציאה <bdi>{o.depart}</bdi> ·{' '}
            </>
          )}
          {stopsLabel(o.stops)}
        </div>
      </div>
      <div className="oright">
        <div className="oprice">{fmt(o.price)}</div>
        <div className="ogo">בחר ↗</div>
      </div>
    </a>
  )
}

/** The 4–5 priced options (only when a live-price source is connected). */
function OffersList({ offers, updatedAt }: { offers: FlightOffer[]; updatedAt?: string }) {
  return (
    <div className="card">
      <div className="cl">✈️ טיסות מובילות{updatedAt ? ` · מחירים עודכנו ${heD(updatedAt)}` : ''}</div>
      <div className="offers">
        {offers.map((o, i) => (
          <OfferRow key={`${o.airline}-${o.price}-${i}`} o={o} best={i === 0} />
        ))}
      </div>
      <div className="note" style={{ marginTop: 10 }}>
        מחירים אמיתיים משוערים (נכון לחיפוש האחרון), ממוינים מהזול. לחיצה פותחת את ההזמנה ומאשרת את
        המחיר החי.
      </div>
    </div>
  )
}

/** Flights: real priced options (when connected) → Google Flights hero → more engines. */
export default function FlightsView({ flights }: Props) {
  const d = flights.data
  const range = d?.range
  const links = d?.links ?? []
  const offers = d?.offers ?? []
  const gf = links.find((l) => l.label === 'Google Flights')
  const others = links.filter((l) => l.label !== 'Google Flights')

  return (
    <div className="rise">
      <div className="vh">✈️ טיסות</div>

      {/* real priced options — appears once a live-price source is wired */}
      {offers.length > 0 && <OffersList offers={offers} updatedAt={d?.pricesUpdatedAt} />}

      {/* HERO — direct, live Google Flights for the exact route + dates */}
      {gf && (
        <a className="gfhero" href={gf.href} target="_blank" rel="noreferrer">
          <div className="gflabel">✈️ Google Flights</div>
          <div className="gfsub">
            {offers.length > 0
              ? 'כל התוצאות והמחירים החיים ל-TLV → היעד בתאריכים שבחרתם.'
              : 'חיפוש חי — מחירים ותוצאות אמיתיים מ-TLV ליעד ולתאריכים שבחרתם, נפתח מוכן.'}
          </div>
          <span className="gfcta">פתחו חיפוש חי ↗</span>
        </a>
      )}

      {/* secondary engines */}
      <div className="card">
        <div className="cl">🔎 עוד מנועי חיפוש (חיים)</div>
        <div className="btns" style={{ marginTop: 10 }}>
          {others.map((l) => (
            <a href={l.href} target="_blank" rel="noreferrer" key={l.label}>
              <div className="n">{l.label}</div>
              <div className="a">{l.sub}</div>
            </a>
          ))}
        </div>
        {offers.length === 0 && (
          <div className="note" style={{ marginTop: 11 }}>
            אין מחירים בזמן־אמת בתוך האפליקציה (הכול חינם) — הכפתורים פותחים תוצאות חיות ומדויקות.
            {range && (
              <>
                {' '}
                לכיוון גס בלבד, לא מחיר בפועל: כ־{fmt(range.lo)}–{fmt(range.hi)} לפי מרחק.
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
