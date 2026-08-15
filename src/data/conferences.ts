/**
 * Curated conferences / expos / trade shows per featured city (keyed by IATA).
 * The "anchor" concept: a business traveller comes for the conference, then adds
 * an event around it. No free API supplies these reliably, so they are curated
 * from the venue's own calendar — every entry carries its authoritative source.
 * Keep dates and URLs exact; a wrong date here misleads a paying traveller.
 */
import type { Conference } from '../core/types'

export const CONFERENCES: Record<string, Conference[]> = {
  LON: [
    {
      name: 'Restaurant & Takeaway Innovation Expo',
      he: 'תערוכת חדשנות מסעדנות וטייק-אווی',
      venue: 'ExCeL London',
      start: '2026-09-29',
      end: '2026-09-30',
      url: 'https://www.excel.london/whats-on/restaurant-and-takeaway-innovation-expo-2026',
      cluster: 'אשכול Food Service — 7 תערוכות מסעדנות ואירוח באותם ימים',
      source: 'excel.london',
    },
  ],
  NYC: [
    { name: 'COTERIE New York', he: 'COTERIE — יריד אופנה', venue: 'Javits Center', start: '2026-09-09', end: '2026-09-11', url: 'https://www.coteriefashionevents.com/en/events/coterie-new-york/about.html', source: 'coteriefashionevents.com' },
    { name: 'The Armory Show', he: 'יריד האמנות ארמורי', venue: 'Javits Center', start: '2026-09-24', end: '2026-09-27', url: 'https://www.thearmoryshow.com', source: 'thearmoryshow.com' },
    { name: 'New York Comic Con', he: 'ניו יורק קומיק קון', venue: 'Javits Center', start: '2026-10-08', end: '2026-10-11', url: 'https://www.newyorkcomiccon.com/', source: 'newyorkcomiccon.com' },
    { name: 'JA New York Fall', he: 'יריד תכשיטים JA', venue: 'Javits Center', start: '2026-10-25', end: '2026-10-27', url: 'https://ja-newyork.com/show/show-dates-times/', source: 'ja-newyork.com' },
    { name: 'ISC East', he: 'ISC East — אבטחה וטכנולוגיה', venue: 'Javits Center', start: '2026-11-03', end: '2026-11-05', url: 'https://www.discoverisc.com/east/en-us.html', source: 'discoverisc.com' },
  ],
  BER: [
    { name: 'IFA 2026', he: 'IFA — אלקטרוניקה לצרכן', venue: 'Messe Berlin', start: '2026-09-04', end: '2026-09-08', url: 'https://www.ifa-berlin.com/', cluster: 'תערוכת האלקטרוניקה הגדולה באירופה', source: 'ifa-berlin.com' },
    { name: 'InnoTrans 2026', he: 'InnoTrans — תחבורה ומסילות', venue: 'Messe Berlin', start: '2026-09-22', end: '2026-09-25', url: 'https://www.innotrans.de/en/', cluster: 'יריד טכנולוגיית המסילות הגדול בעולם', source: 'innotrans.de' },
    { name: 'Bazaar Berlin 2026', he: 'באזאר ברלין', venue: 'Messe Berlin', start: '2026-11-04', end: '2026-11-08', url: 'https://www.berlin.de/en/trade-fairs/2102505-7918797-bazaar-berlin.en.html', source: 'berlin.de' },
    { name: 'Boot & Fun Berlin 2026', he: 'ספורט ימי ואוטדור', venue: 'Messe Berlin', start: '2026-11-26', end: '2026-11-29', url: 'https://www.messe-berlin.de/en/events/event-calendar', source: 'messe-berlin.de' },
  ],
  PAR: [
    { name: 'Maison&Objet', he: 'מזון ואוביקט — עיצוב', venue: 'Paris Nord Villepinte', start: '2026-09-10', end: '2026-09-14', url: 'https://www.maison-objet.com/en/paris', source: 'maison-objet.com' },
    { name: 'SIAL Paris 2026', he: 'SIAL — יריד המזון הגדול בעולם', venue: 'Paris Nord Villepinte', start: '2026-10-17', end: '2026-10-21', url: 'https://www.sialparis.com/', cluster: 'יריד המזון הבינלאומי הגדול בעולם', source: 'sialparis.com' },
    { name: 'Paris Games Week 2026', he: 'שבוע המשחקים של פריז', venue: 'Paris Expo Porte de Versailles', start: '2026-10-22', end: '2026-10-25', url: 'https://www.parisgamesweek.com/', source: 'parisgamesweek.com' },
    { name: 'Salon du Chocolat 2026', he: 'סלון השוקולד', venue: 'Paris Expo Porte de Versailles', start: '2026-10-28', end: '2026-11-01', url: 'https://www.salon-du-chocolat.com/en/paris/', source: 'salon-du-chocolat.com' },
  ],
  MAD: [
    { name: 'Mercedes-Benz Fashion Week Madrid', he: 'שבוע האופנה של מדריד', venue: 'IFEMA Madrid', start: '2026-09-14', end: '2026-09-19', url: 'https://www.ifema.es/en/calendar', source: 'ifema.es' },
    { name: 'Fruit Attraction 2026', he: 'יריד המזון והחקלאות', venue: 'IFEMA Madrid', start: '2026-10-06', end: '2026-10-08', url: 'https://www.ifema.es/en/fruit-attraction', source: 'ifema.es' },
    { name: 'ESMO Congress 2026', he: 'קונגרס אונקולוגיה ESMO', venue: 'IFEMA Madrid', start: '2026-10-23', end: '2026-10-27', url: 'https://www.esmadrid.com/en/whats-on/esmo-madrid-congress-ifema-madrid', source: 'esmadrid.com' },
    { name: 'SIMO Educación 2026', he: 'SIMO — טכנולוגיה בחינוך', venue: 'IFEMA Madrid', start: '2026-11-11', end: '2026-11-13', url: 'https://www.ifema.es/en/calendar', source: 'ifema.es' },
    { name: 'Salón Look 2026', he: 'סלון LOOK — יופי ואסתטיקה', venue: 'IFEMA Madrid', start: '2026-11-13', end: '2026-11-15', url: 'https://www.ifema.es/en/calendar', source: 'ifema.es' },
  ],
  VIE: [
    { name: 'viennacontemporary', he: 'יריד האמנות העכשווית', venue: 'Messe Wien', start: '2026-09-18', end: '2026-09-20', url: 'https://www.viennacontemporary.at/en/', source: 'viennacontemporary.at' },
    { name: 'Buch Wien 2026', he: 'יריד הספרים של וינה', venue: 'Messe Wien', start: '2026-11-25', end: '2026-11-29', url: 'https://www.buchwien.at/', source: 'buchwien.at' },
  ],
  BCN: [
    { name: 'Liber 2026', he: 'יריד הספרים הבינלאומי', venue: 'Fira de Barcelona (Gran Via)', start: '2026-09-29', end: '2026-10-01', url: 'https://www.firabarcelona.com/en/exhibitions-calendar/', source: 'firabarcelona.com' },
    { name: 'Alimentaria FoodTech', he: 'טכנולוגיית מזון', venue: 'Fira de Barcelona (Gran Via)', start: '2026-10-06', end: '2026-10-08', url: 'https://www.firabarcelona.com/en/exhibitions-calendar/', source: 'firabarcelona.com' },
    { name: 'Saló Nàutic de Barcelona', he: 'תערוכת הסירות', venue: 'Port Vell', start: '2026-10-14', end: '2026-10-18', url: 'https://www.firabarcelona.com/en/exhibitions-calendar/', source: 'firabarcelona.com' },
    { name: 'Smart City Expo World Congress', he: 'קונגרס הערים החכמות', venue: 'Fira de Barcelona (Gran Via)', start: '2026-11-03', end: '2026-11-05', url: 'https://www.smartcityexpo.com/', source: 'smartcityexpo.com' },
    { name: 'Manga Barcelona', he: 'מנגה ברצלונה', venue: 'Fira de Barcelona (Gran Via)', start: '2026-12-05', end: '2026-12-08', url: 'https://www.firabarcelona.com/en/exhibitions-calendar/', source: 'firabarcelona.com' },
  ],
  MUC: [
    { name: 'Oktoberfest 2026', he: 'אוקטוברפסט — פסטיבל הבירה', venue: 'Theresienwiese', start: '2026-09-19', end: '2026-10-04', url: 'https://www.muenchen.de/en/events/oktoberfest', cluster: 'פסטיבל הבירה הגדול בעולם — 191 שנה', source: 'muenchen.de' },
    { name: 'EXPO REAL 2026', he: 'יריד הנדל"ן הגדול באירופה', venue: 'Messe München', start: '2026-10-05', end: '2026-10-07', url: 'https://exporeal.net/en/', source: 'exporeal.net' },
    { name: 'electronica 2026', he: 'יריד האלקטרוניקה המוביל', venue: 'Messe München', start: '2026-11-10', end: '2026-11-13', url: 'https://electronica.de/en/', source: 'messe-muenchen.de' },
  ],
  AMS: [
    { name: 'IBC 2026', he: 'IBC — כנס השידור הבינלאומי', venue: 'RAI Amsterdam', start: '2026-09-11', end: '2026-09-14', url: 'https://show.ibc.org/', cluster: 'כנס השידור והמדיה הגדול באירופה', source: 'ibc.org' },
    { name: 'MRO Europe 2026', he: 'תחזוקת מטוסים', venue: 'RAI Amsterdam', start: '2026-10-27', end: '2026-10-29', url: 'https://mroeurope.aviationweek.com/', source: 'aviationweek.com' },
    { name: 'METSTRADE 2026', he: 'ציוד ימי — הגדולה בעולם', venue: 'RAI Amsterdam', start: '2026-11-17', end: '2026-11-19', url: 'https://www.metstrade.com/', source: 'metstrade.com' },
  ],
  ROM: [
    { name: 'Romics', he: 'רומיקס — קומיקס ואנימציה', venue: 'Fiera Roma', start: '2026-10-01', end: '2026-10-04', url: 'https://www.fieraroma.it/en/events-and-competitions/events-calendar/', source: 'fieraroma.it' },
    { name: 'Maker Faire Rome', he: 'מייקר פייר רומא', venue: 'Fiera Roma', start: '2026-10-16', end: '2026-10-18', url: 'https://www.fieraroma.it/en/events-and-competitions/events-calendar/', source: 'fieraroma.it' },
    { name: 'Blue Planet Economy Expoforum', he: 'כלכלה כחולה', venue: 'Fiera Roma', start: '2026-10-21', end: '2026-10-24', url: 'https://www.fieraroma.it/en/events-and-competitions/events-calendar/', source: 'fieraroma.it' },
    { name: 'New Space Economy Expoforum', he: 'כלכלת החלל', venue: 'Fiera Roma', start: '2026-11-25', end: '2026-11-27', url: 'https://www.fieraroma.it/en/events-and-competitions/events-calendar/', source: 'fieraroma.it' },
    { name: 'Ro.Me Museum Exhibition', he: 'תערוכת המוזיאונים', venue: 'Fiera Roma', start: '2026-12-02', end: '2026-12-04', url: 'https://www.fieraroma.it/en/events-and-competitions/events-calendar/', source: 'fieraroma.it' },
  ],
}

/** Conferences whose dates overlap the trip window [d1,d2] (inclusive). */
export function conferencesInWindow(iata: string, d1: string, d2: string): Conference[] {
  return (CONFERENCES[iata] ?? [])
    .filter((c) => c.start <= d2 && c.end >= d1)
    .sort((a, b) => a.start.localeCompare(b.start))
}
