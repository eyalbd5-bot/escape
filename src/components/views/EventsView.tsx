import { useState } from 'react'
import type { Trip } from '../../types'
import type {
  Concert,
  Conference,
  ConcertsData,
  EventsData,
  MusicalPick,
  NormalizedResult,
  SportGroup,
  SportsData,
  SportsFixture,
} from '../../core/types'
import { heD } from '../../lib/format'
import { cityName } from '../../lib/city'
import { perplexity, chatgpt, claudeChat } from '../../lib/links'

interface Props {
  trip: Trip
  sports: NormalizedResult<SportsData>
  concerts: NormalizedResult<ConcertsData>
  events: NormalizedResult<EventsData>
}

type Tab = 'concert' | 'show' | 'football'

/** A date range that stays LTR ("29.9–30.9") inside the RTL layout — no bidi flip. */
const Range = ({ a, b }: { a: string; b: string }) => (
  <span dir="ltr" style={{ unicodeBidi: 'isolate' }}>
    {heD(a)}–{heD(b)}
  </span>
)

/** A small "verified official source" pill. */
const Src = ({ children }: { children: React.ReactNode }) => (
  <span className="src">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M20 6L9 17l-5-5" />
    </svg>
    {children}
  </span>
)

/** Fit of a dated event relative to the conference anchor window. */
function fitFor(date: string, anchor?: Conference): { cls: string; label: string } | null {
  if (!date) return null
  if (!anchor) return null
  if (date >= anchor.start && date <= anchor.end)
    return { cls: 'good', label: '✓ מתאים לערבי הכנס' }
  if (date < anchor.start) return { cls: 'soft', label: 'למגיעים מוקדם' }
  return { cls: 'soft', label: 'אחרי הכנס' }
}

/* ---------------- concerts ---------------- */
function ConcertCard({ g, anchor, reco }: { g: Concert; anchor?: Conference; reco?: boolean }) {
  const fit = fitFor(g.date, anchor)
  return (
    <div className={`card${reco ? ' reco' : ''}`}>
      {reco && <span className="ribbon">★ מומלץ</span>}
      <div className={`ev${reco ? ' recobody' : ''}`}>
        <div className="when">
          <div className="d">🎤</div>
          {g.date && <div className="m">{heD(g.date)}</div>}
        </div>
        <div className="evbody">
          <h3><bdi>{g.name}</bdi></h3>
          {g.venue && <div className="venue"><bdi>{g.venue}</bdi></div>}
          <div className="rowline">
            {fit && <span className={`fit ${fit.cls}`}>{fit.label}</span>}
            <Src>Ticketmaster</Src>
          </div>
        </div>
      </div>
      {g.url && (
        <a className={`go${reco ? ' coral' : ''}`} href={g.url} target="_blank" rel="noreferrer">
          כרטיסים ↗
        </a>
      )}
    </div>
  )
}

const CONCERT_CHIPS = ['מי מופיע בעיר?', 'הופעות רוק ופופ', 'הופעה בערב פנוי בטיול', 'כרטיסים זולים']

/** Key-free live-concerts assistant: opens a chatbot pre-loaded with the city + dates. */
function ConcertBot({ name, d1, d2 }: { name: string; d1: string; d2: string }) {
  const [q, setQ] = useState('')
  const build = (extra: string) =>
    `מצא לי הופעות ואירועי מוזיקה חיים ב${name} בין ${heD(d1)} ל-${heD(d2)}. ${extra} ` +
    `פרטו אמן, אולם, תאריך וקישור לכרטיסים. ענו בעברית, ואם חסר מידע (סגנון, תקציב) — שאלו אותי.`
  const ask = (question: string) => {
    const text = question.trim()
    if (text) window.open(perplexity(build(text)), '_blank', 'noopener')
  }
  const base = build('')
  const bots = [
    { label: 'Perplexity', sub: 'חיפוש חי ↗', href: perplexity(base) },
    { label: 'ChatGPT', sub: 'שיחה ↗', href: chatgpt(base) },
    { label: 'Claude', sub: 'שיחה ↗', href: claudeChat(base) },
  ]
  return (
    <div className="card wide">
      <div className="cl">🤖 בוט ההופעות</div>
      <div className="note" style={{ marginTop: 6 }}>
        שאלו על הופעות ב{name} — הבוט כבר יודע את היעד והתאריכים שבחרתם, ומחזיר תוצאות חיות.
      </div>
      <div className="ask">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && ask(q)}
          placeholder="מה תרצו לשמוע?"
        />
        <button onClick={() => ask(q)} aria-label="שאל">
          שאל ↗
        </button>
      </div>
      <div className="chips">
        {CONCERT_CHIPS.map((s) => (
          <button className="chip" key={s} onClick={() => ask(s)}>
            {s}
          </button>
        ))}
      </div>
      <div className="btns" style={{ marginTop: 10 }}>
        {bots.map((b) => (
          <a href={b.href} target="_blank" rel="noreferrer" key={b.label}>
            <div className="n">{b.label}</div>
            <div className="a">{b.sub}</div>
          </a>
        ))}
      </div>
    </div>
  )
}

function ConcertsPanel({
  gigs,
  anchor,
  official,
  unofficial,
  name,
  d1,
  d2,
}: {
  gigs: Concert[]
  anchor?: Conference
  official: EventsData['official']
  unofficial: EventsData['unofficial']
  name: string
  d1: string
  d2: string
}) {
  // recommend the first concert that lands inside the anchor window
  const recoIdx = anchor ? gigs.findIndex((g) => g.date >= anchor.start && g.date <= anchor.end) : -1
  return (
    <div className="panel fade">
      {/* real concerts first (when a live source is connected) */}
      {gigs.map((g, i) => (
        <ConcertCard key={g.id} g={g} anchor={anchor} reco={i === recoIdx} />
      ))}

      {/* the always-on, key-free way to get live concerts */}
      <ConcertBot name={name} d1={d1} d2={d2} />

      {/* ticket-site search links always sit at the bottom, as supplementary sources */}
      <div className="cl moretitle">עוד מקורות לחיפוש הופעות</div>
      {official.map((l) => (
        <div className="btns" key={l.label}>
          <a href={l.href} target="_blank" rel="noreferrer">
            <div className="n">{l.label}</div>
            <div className="a">{l.sub}</div>
          </a>
        </div>
      ))}
      <div className="catgrid">
        {unofficial.map((l) => (
          <a className="cat" href={l.href} target="_blank" rel="noreferrer" key={l.label}>
            <div className="cn">{l.label}</div>
            <div className="cs">{l.sub}</div>
          </a>
        ))}
      </div>
    </div>
  )
}

/* ---------------- musicals ---------------- */
function ShowCard({ m, reco }: { m: MusicalPick; reco?: boolean }) {
  return (
    <div className={`card${reco ? ' reco' : ''}${m.hasDark ? ' warncard' : ''}`}>
      {reco && <span className="ribbon">★ מומלץ</span>}
      <div className={`ev${reco ? ' recobody' : ''}`}>
        <div className={`when${m.hasDark ? ' warnwhen' : ''}`}>
          <div className="d">🎭</div>
          <div className="m">{m.hasDark ? 'חלקי' : 'זמין'}</div>
        </div>
        <div className="evbody">
          <h3>
            <bdi>{m.name}</bdi>
            {m.he && <span className="he"> · {m.he}</span>}
          </h3>
          <div className="venue"><bdi>{m.venue}</bdi></div>
          <div className="rowline">
            {m.hasDark ? (
              <span className="fit warn">⚠ {m.darkLabel}</span>
            ) : (
              <span className="fit good">✓ זמין בחלון</span>
            )}
            <Src>{m.source}</Src>
          </div>
          {m.hasDark && (
            <p className="note" style={{ marginTop: 7 }}>
              זמין בחלון:{' '}
              {m.datesInWindow.length > 1 ? (
                <Range a={m.datesInWindow[0]} b={m.datesInWindow[m.datesInWindow.length - 1]} />
              ) : (
                heD(m.datesInWindow[0])
              )}{' '}
              · לא בכל ערב.
            </p>
          )}
        </div>
      </div>
      <a className={`go${reco ? ' coral' : ''}`} href={m.url} target="_blank" rel="noreferrer">
        כרטיסים ↗
      </a>
    </div>
  )
}

function ShowsPanel({ musicals, name }: { musicals: MusicalPick[]; name: string }) {
  if (musicals.length === 0) {
    return (
      <div className="panel fade">
        <div className="card">
          <div className="cl">🎭 מחזות זמר</div>
          <div className="note" style={{ marginTop: 8 }}>
            אין מחזות זמר מובנים ל{name} עדיין. נוספים בהדרגה לפי יעד.
          </div>
        </div>
      </div>
    )
  }
  const recoIdx = musicals.findIndex((m) => m.everyNight)
  return (
    <div className="panel fade">
      {musicals.map((m, i) => (
        <ShowCard key={m.name} m={m} reco={i === recoIdx} />
      ))}
    </div>
  )
}

/* ---------------- football / sport ---------------- */
function FixtureRow({ f }: { f: SportsFixture }) {
  return (
    <div className="day" key={f.id}>
      <div className="dn">{heD(f.date)}</div>
      <div className="dc">
        <b>{f.title}</b>
        <p>
          {f.time ? f.time + ' · ' : ''}
          {f.venue || f.league}
          {f.league && f.venue ? ' · ' + f.league : ''}
        </p>
      </div>
    </div>
  )
}

function FootballPanel({ s, name }: { s?: SportsData | null; name: string }) {
  const fb: SportGroup | undefined = s?.football
  const hasClubs = !!fb && fb.teams.length > 0
  return (
    <div className="panel fade">
      {hasClubs && fb!.fixtures.length > 0 && (
        <div className="card">
          <div className="cl">⚽ כדורגל · TheSportsDB</div>
          <div className="note" style={{ marginTop: 2, marginBottom: 2 }}>
            משחקי בית ב{name} בחלון התאריכים שלכם:
          </div>
          <div className="tl">{fb!.fixtures.map((f) => <FixtureRow f={f} key={f.id} />)}</div>
        </div>
      )}

      {hasClubs && fb!.fixtures.length === 0 && (
        <>
          <div className="card empty">
            <div className="big">⚽️</div>
            <h3>אין משחקי בית בטווח</h3>
            <p className="note nn">
              לא פורסמו משחקי בית של מועדוני {name} ({fb!.teams.join(' · ')}) בתאריכים שבחרתם.
              לוחות הליגה והגביע נסגרים סופית קרוב יותר למועד — בדקו שוב.
            </p>
          </div>
          {fb!.nearest && (
            <div className="card nearest">
              <div className="cl tealcl">✓ הכי קרוב — משחק בית אמיתי</div>
              <h3>{fb!.nearest.title}</h3>
              <p className="note" style={{ marginTop: 4 }}>
                {heD(fb!.nearest.date)}
                {fb!.nearest.venue ? ` · ${fb!.nearest.venue}` : ''} · שקלו להזיז את התאריכים.
              </p>
              <div className="rowline"><Src>TheSportsDB</Src></div>
            </div>
          )}
        </>
      )}

      {!hasClubs && (
        <div className="card">
          <div className="cl">⚽ כדורגל</div>
          <div className="note" style={{ marginTop: 8 }}>
            אין מועדוני כדורגל מובנים ל{name} עדיין.
          </div>
        </div>
      )}

      {/* other in-window sport, retained so nothing is lost */}
      {s && s.worldCup.length > 0 && (
        <div className="card">
          <div className="cl">🏆 מונדיאל 2026 · TheSportsDB</div>
          <div className="tl">{s.worldCup.map((f) => <FixtureRow f={f} key={f.id} />)}</div>
        </div>
      )}
      {s && s.basketball.fixtures.length > 0 && (
        <div className="card">
          <div className="cl">🏀 כדורסל · {s.basketball.teams.join(' · ')}</div>
          <div className="tl">{s.basketball.fixtures.map((f) => <FixtureRow f={f} key={f.id} />)}</div>
        </div>
      )}
      {s && s.tennis.length > 0 && (
        <div className="card">
          <div className="cl">🎾 טניס</div>
          <div className="tl">
            {s.tennis.map((t) => (
              <div className="day" key={t.name}>
                <div className="dn">🎾</div>
                <div className="dc">
                  <b>{t.name}</b>
                  <p><Range a={t.start} b={t.end} /> · {t.venue}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------------- screen ---------------- */
export default function EventsView({ trip, sports, concerts, events }: Props) {
  const s = sports.data
  const gigs = concerts.data?.concerts ?? []
  const conferences = events.data?.conferences ?? []
  const musicals = events.data?.musicals ?? []
  const official = events.data?.official ?? []
  const unofficial = events.data?.unofficial ?? []
  const anchor = conferences[0]
  const name = cityName(trip.city)

  const fbCount = s?.football.fixtures.length ?? 0
  const fbNearest = !!s?.football.nearest
  const [tab, setTab] = useState<Tab>('concert')

  const TABS: { key: Tab; ic: string; label: string; cnt: string }[] = [
    { key: 'concert', ic: '🎤', label: 'הופעות', cnt: gigs.length ? `${gigs.length} בחלון` : 'חיפוש' },
    { key: 'show', ic: '🎭', label: 'מחזות זמר', cnt: musicals.length ? `${musicals.length} פעילים` : '—' },
    {
      key: 'football',
      ic: '⚽',
      label: 'כדורגל',
      cnt: fbCount ? `${fbCount} בחלון` : fbNearest ? 'הכי קרוב' : 'אין בחלון',
    },
  ]

  return (
    <div className="rise evview">
      <div className="vh">🎟️ אירועים ב{name}</div>
      <span className="trust">
        <svg viewBox="0 0 24 24" fill="none" stroke="#0a7d4f" strokeWidth="3">
          <path d="M20 6L9 17l-5-5" />
        </svg>
        כל אירוע מאומת מול מקור רשמי
      </span>

      {anchor && (
        <div className="card anchor">
          <span className="pin">📍 עוגן הנסיעה · כנס</span>
          <h2><bdi>{anchor.name}</bdi></h2>
          <div className="ameta">
            <span>🏛️ <bdi>{anchor.venue}</bdi></span>
            <span className="dot" />
            <Range a={anchor.start} b={anchor.end} />
            <span className="dot" />
            <Src>{anchor.source}</Src>
          </div>
          {anchor.cluster && <p className="note" style={{ marginTop: 8 }}>{anchor.cluster}</p>}
        </div>
      )}

      <div className="seg-lbl">בחרו אירוע לשלב לנסיעה</div>
      <div className="seg" role="tablist" aria-label="בחירת סוג אירוע">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
          >
            <span className="ic">{t.ic}</span>
            {t.label}
            <span className="cnt">{t.cnt}</span>
          </button>
        ))}
      </div>

      {tab === 'concert' && (
        <ConcertsPanel
          gigs={gigs}
          anchor={anchor}
          official={official}
          unofficial={unofficial}
          name={name}
          d1={trip.d1}
          d2={trip.d2}
        />
      )}
      {tab === 'show' && <ShowsPanel musicals={musicals} name={name} />}
      {tab === 'football' && <FootballPanel s={s} name={name} />}

      <div className="evfoot">מונע ע״י מקורות חינמיים · TheSportsDB · Ticketmaster · לוחות אולמות רשמיים</div>
    </div>
  )
}
