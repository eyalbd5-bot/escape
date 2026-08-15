import type { City } from '../types'
import fullData from './citiesFull.json'

/**
 * 24 hand-curated featured cities with rich data: Hebrew name, price baselines,
 * ~6 iconic sights, an events venue, and coordinates. Shown first in the picker.
 * `base` / `nightly` are placeholders until a real price source is connected (spec §8).
 * Sights lead the itinerary (the rest is filled from Wikipedia GeoSearch).
 */
const CURATED: City[] = [
  { he: 'לונדון', en: 'London', iata: 'LON', cur: 'GBP', fl: '🇬🇧', base: 1600, nightly: 650, cc: 'GB', lat: 51.5074, lng: -0.1278, venue: 'The O2', sights: ['ביג בן', 'עין לונדון', 'מגדל לונדון', 'המוזיאון הבריטי', 'ארמון בקינגהאם', 'גשר המגדל'] },
  { he: 'פריז', en: 'Paris', iata: 'PAR', cur: 'EUR', fl: '🇫🇷', base: 1400, nightly: 600, cc: 'FR', lat: 48.8566, lng: 2.3522, venue: 'Accor Arena', sights: ['מגדל אייפל', 'מוזיאון הלובר', 'מונמארטר', 'קתדרלת נוטר-דאם', 'שער ניצחון', 'ורסאי'] },
  { he: 'ברצלונה', en: 'Barcelona', iata: 'BCN', cur: 'EUR', fl: '🇪🇸', base: 1300, nightly: 500, cc: 'ES', lat: 41.3851, lng: 2.1734, venue: 'Palau Sant Jordi', sights: ['סגרדה פמיליה', 'פארק גואל', 'לה רמבלה', 'קאסה בטיו', 'הרובע הגותי', 'מונז׳ואיק'] },
  { he: 'מדריד', en: 'Madrid', iata: 'MAD', cur: 'EUR', fl: '🇪🇸', base: 1350, nightly: 480, cc: 'ES', lat: 40.4168, lng: -3.7038, venue: 'WiZink Center', sights: ['מוזיאון פראדו', 'פלאסה מאיור', 'פארק רטירו', 'הארמון המלכותי של מדריד', 'פוארטה דל סול', 'מוזיאון ריינה סופיה'] },
  { he: 'רומא', en: 'Rome', iata: 'ROM', cur: 'EUR', fl: '🇮🇹', base: 1300, nightly: 520, cc: 'IT', lat: 41.9028, lng: 12.4964, venue: 'Stadio Olimpico', sights: ['הקולוסיאום', 'מזרקת טרווי', 'קריית הוותיקן', 'הפנתיאון', 'הפורום הרומי', 'מדרגות ספרד'] },
  { he: 'מילאנו', en: 'Milan', iata: 'MIL', cur: 'EUR', fl: '🇮🇹', base: 1250, nightly: 550, cc: 'IT', lat: 45.4642, lng: 9.19, venue: 'San Siro', sights: ['קתדרלת מילאנו', 'לה סקאלה', 'קסטלו ספורצסקו', 'גלריה ויטוריו אמנואלה השני', 'הסעודה האחרונה', 'נאבילי'] },
  { he: 'אמסטרדם', en: 'Amsterdam', iata: 'AMS', cur: 'EUR', fl: '🇳🇱', base: 1450, nightly: 680, cc: 'NL', lat: 52.3676, lng: 4.9041, venue: 'Ziggo Dome', sights: ['בית אנה פרנק', 'רייקסמוזיאום', 'מוזיאון ואן גוך', 'ואונדלפארק', 'כיכר דאם', 'יורדאן'] },
  { he: 'ברלין', en: 'Berlin', iata: 'BER', cur: 'EUR', fl: '🇩🇪', base: 1400, nightly: 480, cc: 'DE', lat: 52.52, lng: 13.405, venue: 'Mercedes-Benz Arena', sights: ['שער ברנדנבורג', 'הרייכסטאג', 'חומת ברלין', 'אי המוזיאונים', 'מגדל הטלוויזיה של ברלין', 'צ׳קפוינט צ׳רלי'] },
  { he: 'מינכן', en: 'Munich', iata: 'MUC', cur: 'EUR', fl: '🇩🇪', base: 1450, nightly: 560, cc: 'DE', lat: 48.1351, lng: 11.582, venue: 'Olympiahalle', sights: ['מריאנפלאץ', 'אולימפיהפארק', 'ארמון נימפנבורג', 'הגן האנגלי', 'בית ב.מ.וו', 'פראואנקירכה'] },
  { he: 'פראג', en: 'Prague', iata: 'PRG', cur: 'CZK', fl: '🇨🇿', base: 1200, nightly: 380, cc: 'CZ', lat: 50.0755, lng: 14.4378, venue: 'O2 Arena', sights: ['גשר קארל', 'טירת פראג', 'השעון האסטרונומי של פראג', 'כיכר העיר העתיקה', 'הרובע היהודי של פראג', 'גבעת פטרשין'] },
  { he: 'וינה', en: 'Vienna', iata: 'VIE', cur: 'EUR', fl: '🇦🇹', base: 1300, nightly: 520, cc: 'AT', lat: 48.2082, lng: 16.3738, venue: 'Wiener Stadthalle', sights: ['ארמון שנברון', 'שטפנסדום', 'ארמון בלוודר', 'הופבורג', 'פראטר', 'אופרת וינה'] },
  { he: 'בודפשט', en: 'Budapest', iata: 'BUD', cur: 'HUF', fl: '🇭🇺', base: 1250, nightly: 360, cc: 'HU', lat: 47.4979, lng: 19.0402, venue: 'Papp László Aréna', sights: ['בניין הפרלמנט ההונגרי', 'גשר השרשראות', 'מבצר הדייגים', 'טירת בודה', 'מרחצאות סצ׳ני', 'שדרות אנדרשי'] },
  { he: 'אתונה', en: 'Athens', iata: 'ATH', cur: 'EUR', fl: '🇬🇷', base: 900, nightly: 450, cc: 'GR', lat: 37.9838, lng: 23.7275, venue: 'OAKA', sights: ['האקרופוליס של אתונה', 'הפרתנון', 'פלאקה', 'מקדש זאוס האולימפי', 'האגורה של אתונה', 'הר ליקאבטוס'] },
  { he: 'ליסבון', en: 'Lisbon', iata: 'LIS', cur: 'EUR', fl: '🇵🇹', base: 1550, nightly: 480, cc: 'PT', lat: 38.7223, lng: -9.1393, venue: 'Altice Arena', sights: ['מגדל בלם', 'אלפמה', 'מנזר ז׳רונימוש', 'טירת סן ז׳ורז׳', 'כיכר רוסיו', 'אלוואדור'] },
  { he: 'בוקרשט', en: 'Bucharest', iata: 'OTP', cur: 'RON', fl: '🇷🇴', base: 1100, nightly: 320, cc: 'RO', lat: 44.4268, lng: 26.1025, venue: 'Arena Națională', sights: ['ארמון הפרלמנט', 'העיר העתיקה של בוקרשט', 'האתנאאום הרומני', 'פארק הראסטראו', 'שדרת ויקטוריה', 'פארק צ׳ישמיג׳ו'] },
  { he: 'סופיה', en: 'Sofia', iata: 'SOF', cur: 'BGN', fl: '🇧🇬', base: 1050, nightly: 300, cc: 'BG', lat: 42.6977, lng: 23.3219, venue: 'Arena Sofia', sights: ['קתדרלת אלכסנדר נבסקי', 'הר ויטושה', 'כנסיית בויאנה', 'רוטונדת סווטי גאורגי', 'שדרת ויטושה', 'התיאטרון הלאומי איוואן וזוב'] },
  { he: 'וארנה', en: 'Varna', iata: 'VAR', cur: 'BGN', fl: '🇧🇬', base: 1200, nightly: 330, cc: 'BG', lat: 43.2141, lng: 27.9147, venue: 'Palace of Culture', sights: ['הגנים הימיים של ורנה', 'קתדרלת ורנה', 'המוזיאון הארכאולוגי של ורנה', 'המרחצאות הרומיים של ורנה', 'חוף ורנה'] },
  { he: 'איסטנבול', en: 'Istanbul', iata: 'IST', cur: 'TRY', fl: '🇹🇷', base: 900, nightly: 380, cc: 'TR', lat: 41.0082, lng: 28.9784, venue: 'Volkswagen Arena', sights: ['איה סופיה', 'המסגד הכחול', 'הבזאר הגדול', 'ארמון טופקאפי', 'הבוספורוס', 'מסגד סולימאן'] },
  { he: 'ניו יורק', en: 'New York City', iata: 'NYC', cur: 'USD', fl: '🇺🇸', base: 3200, nightly: 900, cc: 'US', lat: 40.7128, lng: -74.006, venue: 'Madison Square Garden', sights: ['טיימס סקוור', 'סנטרל פארק', 'פסל החירות', 'אמפייר סטייט בילדינג', 'גשר ברוקלין', 'מוזיאון המטרופוליטן לאמנות'] },
  { he: 'לוס אנג׳לס', en: 'Los Angeles', iata: 'LAX', cur: 'USD', fl: '🇺🇸', base: 3800, nightly: 780, cc: 'US', lat: 34.0522, lng: -118.2437, venue: 'Crypto.com Arena', sights: ['הוליווד', 'סנטה מוניקה', 'מרכז גטי', 'שדרת הכוכבים של הוליווד', 'מצפה הכוכבים גריפית׳', 'ונייס ביץ׳'] },
  { he: 'מיאמי', en: 'Miami', iata: 'MIA', cur: 'USD', fl: '🇺🇸', base: 3500, nightly: 820, cc: 'US', lat: 25.7617, lng: -80.1918, venue: 'Kaseya Center', sights: ['סאות׳ ביץ׳', 'ארט דקו', 'ויזקאיה', 'ליטל הוואנה', 'ויינווד', 'מפרץ ביסקיין'] },
  { he: 'דובאי', en: 'Dubai', iata: 'DXB', cur: 'AED', fl: '🇦🇪', base: 1400, nightly: 600, cc: 'AE', lat: 25.2048, lng: 55.2708, venue: 'Coca-Cola Arena', sights: ['בורג׳ ח׳ליפה', 'דובאי מול', 'מזרקת דובאי', 'פאלם ג׳ומיירה', 'בורג׳ אל ערב', 'מרינה דובאי'] },
  { he: 'בנגקוק', en: 'Bangkok', iata: 'BKK', cur: 'THB', fl: '🇹🇭', base: 2400, nightly: 280, cc: 'TH', lat: 13.7563, lng: 100.5018, venue: 'Impact Arena', sights: ['הארמון הגדול', 'וואט פו', 'וואט ארון', 'שוק צ׳טוצ׳ק', 'ח׳או סאן', 'נהר הצ׳או פראיה'] },
  { he: 'טוקיו', en: 'Tokyo', iata: 'TYO', cur: 'JPY', fl: '🇯🇵', base: 3600, nightly: 620, cc: 'JP', lat: 35.6762, lng: 139.6503, venue: 'Tokyo Dome', sights: ['שיבויה', 'מקדש סנסוג׳י', 'מגדל טוקיו', 'הארמון הקיסרי בטוקיו', 'מקדש מייג׳י', 'שינג׳וקו'] },
]

/** Featured cities (curated), shown when the picker opens with no query. */
export const FEATURED: City[] = CURATED.map((c) => ({ ...c, featured: true }))

/**
 * Full OurAirports-derived dataset (~5,100 cities with scheduled service),
 * generated by scripts/gen_cities.py. Curated cities are excluded there to
 * avoid duplicates, so the complete list is FEATURED followed by the rest.
 */
const FULL = fullData as City[]

/** Every selectable destination: curated featured first, then the full dataset. */
export const ALL_CITIES: City[] = [...FEATURED, ...FULL]

export const ORIGIN = 'TLV'
