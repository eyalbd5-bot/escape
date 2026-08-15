/**
 * Curated marquee musicals / big shows per featured city (keyed by IATA).
 * West End long-runners are stable and reliably bookable, but no free API models
 * their nightly schedule, so they are curated with a verified booking window and
 * an OPTIONAL dark-day rule. We only assert a dark-day pattern we actually verified
 * (ABBA Voyage is dark Tue+Wed); for every other show we claim only what is true —
 * that its run covers the window — and never invent a per-night schedule.
 */
import type { MusicalPick } from '../core/types'

interface Musical {
  name: string
  he?: string
  venue: string
  url: string
  source: string
  /** first performance date (YYYY-MM-DD). Omit for an already-open long-runner. */
  opensOn?: string
  /** last verified performance date (YYYY-MM-DD); the run must cover the window */
  bookingUntil: string
  /** days of week the show is DARK (0=Sun … 6=Sat). Only set when verified. */
  darkDays?: number[]
  /** human caveat shown when a dark day lands inside the window */
  darkLabel?: string
}

/** Marquee first — the order the events screen shows them. */
const LONDON: Musical[] = [
  { name: 'The Lion King', he: 'מלך האריות', venue: 'Lyceum Theatre', bookingUntil: '2027-05-16', url: 'https://www.thelionking.co.uk/', source: 'LW Theatres' },
  { name: 'Mamma Mia!', venue: 'Novello Theatre', bookingUntil: '2027-03-13', url: 'https://www.delfontmackintosh.co.uk/whats-on/mamma-mia', source: 'Delfont Mackintosh' },
  { name: 'Wicked', venue: 'Apollo Victoria', bookingUntil: '2027-05-30', url: 'https://www.atgtickets.com/shows/wicked/apollo-victoria-theatre/', source: 'ATG Tickets' },
  { name: 'ABBA Voyage', venue: 'ABBA Arena', bookingUntil: '2027-01-31', url: 'https://abbavoyage.com/', source: 'abbavoyage.com', darkDays: [2, 3], darkLabel: 'חשוך ג׳–ד׳' },
  { name: 'Les Misérables', he: 'עלובי החיים', venue: 'Sondheim Theatre', bookingUntil: '2027-03-13', url: 'https://www.sondheimtheatre.co.uk/whats-on/les-miserables', source: 'Delfont Mackintosh' },
  { name: 'The Phantom of the Opera', he: 'פנטום האופרה', venue: "His Majesty's Theatre", bookingUntil: '2027-03-13', url: 'https://lwtheatres.co.uk/whats-on/the-phantom-of-the-opera/', source: 'LW Theatres' },
  { name: 'Hamilton', venue: 'Victoria Palace Theatre', bookingUntil: '2027-03-13', url: 'https://www.delfontmackintosh.co.uk/whats-on/hamilton', source: 'Delfont Mackintosh' },
  { name: 'Matilda the Musical', he: 'מטילדה', venue: 'Cambridge Theatre', bookingUntil: '2027-01-31', url: 'https://uk.matildathemusical.com/', source: 'LW Theatres' },
  { name: 'Hadestown', venue: 'Lyric Theatre', bookingUntil: '2027-06-30', url: 'https://uk.hadestown.com/', source: 'Nimax' },
]

/** Broadway long-runners (Broadway Direct on-sale windows verified 2026-08). */
const NEW_YORK: Musical[] = [
  { name: 'The Lion King', he: 'מלך האריות', venue: 'Minskoff Theatre', bookingUntil: '2027-01-03', url: 'https://broadwaydirect.com/show/the-lion-king/', source: 'Broadway Direct' },
  { name: 'Hamilton', venue: 'Richard Rodgers Theatre', bookingUntil: '2027-01-03', url: 'https://broadwaydirect.com/show/hamilton/', source: 'Broadway Direct' },
  { name: 'Aladdin', he: 'אלאדין', venue: 'New Amsterdam Theatre', bookingUntil: '2027-01-03', url: 'https://broadwaydirect.com/show/aladdin/', source: 'Broadway Direct' },
  { name: 'Wicked', venue: 'Gershwin Theatre', bookingUntil: '2026-11-22', url: 'https://broadwaydirect.com/show/wicked/', source: 'Broadway Direct' },
]

/** Berlin's marquee long-run: the Friedrichstadt-Palast Grand Show. */
const BERLIN: Musical[] = [
  { name: 'BLINDED by DELIGHT', he: 'מופע הראווה של פרידריכשטדט-פלאסט', venue: 'Friedrichstadt-Palast', bookingUntil: '2027-06-26', url: 'https://www.palast.berlin/en/shows-tickets/', source: 'palast.berlin' },
]

/** Paris's permanent iconic shows (cabaret/revue, not book-musicals). */
const PARIS: Musical[] = [
  { name: 'Moulin Rouge — Féerie', he: "מולן רוז' — Féerie", venue: 'Moulin Rouge', bookingUntil: '2027-06-30', url: 'https://www.moulinrouge.fr/en/feerie-show/', source: 'moulinrouge.fr' },
  { name: 'Crazy Horse — Totally Crazy', he: 'קרייזי הורס', venue: 'Le Crazy Horse', bookingUntil: '2027-06-30', url: 'https://www.lecrazyhorseparis.com/', source: 'lecrazyhorseparis.com' },
]

/** Madrid's Gran Vía — Spain's "Broadway" (run windows from IFEMA / theatres). */
const MADRID: Musical[] = [
  { name: 'El Rey León', he: 'מלך האריות', venue: 'Teatro Lope de Vega', bookingUntil: '2026-11-01', url: 'https://www.stage.es/musicals/the-lion-king-madrid/tickets', source: 'stage.es' },
  { name: 'Los Miserables', he: 'עלובי החיים', venue: 'Teatro Nuevo Apolo', opensOn: '2026-09-11', bookingUntil: '2026-11-01', url: 'https://tickets.miserableselmusical.es/', source: 'miserableselmusical.es' },
  { name: 'SIX', venue: 'Teatro Gran Vía', opensOn: '2026-09-12', bookingUntil: '2026-11-08', url: 'https://www.ifema.es/visita-madrid/eventos/mejores-musicales-madrid', source: 'ifema.es' },
  { name: 'La Familia Addams', he: 'משפחת אדמס', venue: 'Teatro Calderón', opensOn: '2026-09-18', bookingUntil: '2026-11-29', url: 'https://www.ifema.es/visita-madrid/eventos/mejores-musicales-madrid', source: 'ifema.es' },
  { name: 'We Will Rock You', venue: 'Gran Teatro CaixaBank Príncipe Pío', opensOn: '2026-10-16', bookingUntil: '2026-12-13', url: 'https://www.ifema.es/visita-madrid/eventos/mejores-musicales-madrid', source: 'ifema.es' },
  { name: 'Wicked', venue: 'Nuevo Teatro Alcalá', bookingUntil: '2026-11-15', url: 'https://www.carteleramusicales.es/madrid/wicked', source: 'carteleramusicales.es' },
  { name: 'El Zorro', he: 'זורו', venue: 'Teatro La Latina', opensOn: '2026-11-25', bookingUntil: '2027-02-07', url: 'https://www.ifema.es/visita-madrid/eventos/mejores-musicales-madrid', source: 'ifema.es' },
]

/** Vienna — VBW musicals at the Ronacher & Raimund Theater. */
const VIENNA: Musical[] = [
  { name: 'Maria Theresia — The Musical', he: 'מריה תרזה — המחזמר', venue: 'Ronacher', bookingUntil: '2027-06-26', url: 'https://www.musicalvienna.at/en/schedule', source: 'musicalvienna.at' },
  { name: 'Beauty and the Beast', he: 'היפה והחיה', venue: 'Raimund Theater', opensOn: '2026-09-25', bookingUntil: '2027-06-27', url: 'https://www.musicalvienna.at/en/schedule', source: 'musicalvienna.at' },
]

/** Barcelona — Gran Via / Liceu (one book-musical + magic + opera). */
const BARCELONA: Musical[] = [
  { name: 'Mamma Mia! El Musical', he: 'מאמא מיה', venue: 'Teatre Tívoli', opensOn: '2026-09-26', bookingUntil: '2026-12-20', url: 'https://mammamiaelmusical.es/barcelona/', source: 'mammamiaelmusical.es' },
  { name: 'El Mago Pop', he: 'אל מאגו פופ (מופע קסמים)', venue: 'Teatre Victòria', opensOn: '2026-10-14', bookingUntil: '2027-01-31', url: 'https://www.teatrevictoria.com/', source: 'teatrevictoria.com' },
  { name: 'Aida', he: 'אאידה (אופרה)', venue: 'Gran Teatre del Liceu', opensOn: '2026-09-23', bookingUntil: '2026-10-15', url: 'https://www.liceubarcelona.cat/en', source: 'liceubarcelona.cat' },
]

/** Munich — touring musicals at the Deutsches Theater / Gärtnerplatztheater. */
const MUNICH: Musical[] = [
  { name: 'Der Glöckner von Notre Dame', he: 'הגיבן מנוטרדאם (דיסני)', venue: 'Deutsches Theater München', opensOn: '2026-10-07', bookingUntil: '2026-11-08', url: 'https://www.deutsches-theater.de/en/disney-der-gloeckner-von-notre-dame/', source: 'deutsches-theater.de' },
  { name: 'Les Misérables', he: 'עלובי החיים', venue: 'Staatstheater am Gärtnerplatz', opensOn: '2026-09-25', bookingUntil: '2027-06-30', url: 'https://www.gaertnerplatztheater.de/', source: 'gaertnerplatztheater.de' },
]

/** Amsterdam — seasonal runs at Carré / DeLaMar (Dutch-language). */
const AMSTERDAM: Musical[] = [
  { name: 'Cats', he: 'חתולים', venue: 'Koninklijk Theater Carré', opensOn: '2026-10-19', bookingUntil: '2026-10-25', url: 'https://musicalcats.nl/waar-wanneer/', source: 'musicalcats.nl' },
  { name: 'Cabaret', he: 'קברט', venue: 'DeLaMar Theater', opensOn: '2026-10-17', bookingUntil: '2027-01-31', url: 'https://www.theater.nl/amsterdam/delamar-theater/musical-cabaret-2026-2027', source: 'theater.nl' },
]

/** Rome — the marquee stage product is opera at Teatro Costanzi. */
const ROME: Musical[] = [
  { name: 'Le Nozze di Figaro', he: 'נישואי פיגארו (אופרה)', venue: 'Teatro Costanzi', opensOn: '2026-09-15', bookingUntil: '2026-09-23', url: 'https://www.operaroma.it/en/season/', source: 'operaroma.it' },
  { name: 'Falstaff', he: 'פלסטף (אופרה)', venue: 'Teatro Costanzi', opensOn: '2026-10-11', bookingUntil: '2026-10-20', url: 'https://www.operaroma.it/en/season/', source: 'operaroma.it' },
  { name: "The Rake's Progress", he: 'דרכו של ההולל (אופרה)', venue: 'Teatro Costanzi', opensOn: '2026-11-27', bookingUntil: '2026-12-05', url: 'https://www.operaroma.it/en/season/', source: 'operaroma.it' },
]

export const MUSICALS: Record<string, Musical[]> = {
  LON: LONDON,
  NYC: NEW_YORK,
  BER: BERLIN,
  PAR: PARIS,
  MAD: MADRID,
  VIE: VIENNA,
  BCN: BARCELONA,
  MUC: MUNICH,
  AMS: AMSTERDAM,
  ROM: ROME,
}

const pad = (n: number) => String(n).padStart(2, '0')
/** Local-time YYYY-MM-DD — never via toISOString(), which shifts the day in +offset zones. */
const localYmd = (dt: Date): string => `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`

/** Inclusive YYYY-MM-DD list between two dates (capped for safety). */
function dateRange(from: string, to: string): string[] {
  if (from > to) return []
  const out: string[] = []
  const d = new Date(from + 'T00:00:00')
  const end = new Date(to + 'T00:00:00')
  while (d <= end && out.length < 60) {
    out.push(localYmd(d))
    d.setDate(d.getDate() + 1)
  }
  return out
}

const dow = (date: string): number => new Date(date + 'T00:00:00').getDay()

/**
 * Marquee shows bookable during [d1,d2], each resolved against the window:
 * which evenings it actually performs, and whether a verified dark day bites.
 */
export function musicalsInWindow(iata: string, d1: string, d2: string): MusicalPick[] {
  const all = MUSICALS[iata] ?? []
  const windowDates = dateRange(d1, d2)
  if (windowDates.length === 0) return []
  const picks: MusicalPick[] = []
  for (const m of all) {
    const opens = m.opensOn ?? d1 // no start date = already open before the trip
    if (m.bookingUntil < d1 || opens > d2) continue // the run doesn't overlap the window
    const dark = m.darkDays ?? []
    // evenings within the window AND within the run AND not a dark day
    const datesInWindow = windowDates.filter(
      (day) => day >= opens && day <= m.bookingUntil && !dark.includes(dow(day)),
    )
    if (datesInWindow.length === 0) continue
    const everyNight = datesInWindow.length === windowDates.length
    picks.push({
      name: m.name,
      he: m.he,
      venue: m.venue,
      url: m.url,
      source: m.source,
      datesInWindow,
      everyNight,
      hasDark: !everyNight,
      // dark-day caveat if that's the cause, else a "runs on selected dates" note
      darkLabel: !everyNight ? (m.darkLabel ?? 'תאריכים נבחרים') : undefined,
    })
  }
  return picks
}
