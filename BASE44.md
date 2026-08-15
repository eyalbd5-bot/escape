# Escape — base44 build prompt

base44 builds an app from a description (it generates its own React frontend +
backend). You don't upload this repo — you paste the prompt below to generate the
app, then refine. Two ways to bring our work in:

1. **Prompt route (recommended for base44):** paste the prompt below. It contains
   every screen + the exact key-free endpoints + the logic, so base44 recreates a
   faithful version and wires the live data itself.
2. **Reuse our engine (advanced):** our data layer is framework-agnostic TS —
   `src/core/*`, `src/sources/*`, `src/aggregator.ts`, `src/data/*`. If base44's
   code editor lets you add files, paste these in and have the generated screens
   call `getDestinationData({city,startDate,endDate,nights})` (see HANDOFF.md).

---

## ⬇️ Paste this into base44

בנה אפליקציית ווב אישית לגילוי ותכנון נסיעות בשם **Escape**. עברית מלאה, RTL, mobile-first
(רוחב מקסימלי ~480px). משתמש בודד, בלי התחברות. עיצוב פרימיום: רקע תמונת-יעד קולנועי עם
שכבת כהות, כרטיסי זכוכית (glassmorphism) עם צללים רכים, כותרות בפונט Rubik וגוף ב-Assistant,
פלטה: ink ‎#08323a, coral ‎#ff6f52, teal ‎#069aa1, gold ‎#ffb43d.

**זרימה:** מסך נחיתה (בורר יעד + תאריכי הלוך/חזור + כפתור "צור את המסע") → דף בית → מדורים.
בר עליון קבוע: חזרה, שם יעד+דגל+תאריכים, תפריט המבורגר. מחסנית ניווט (back); back מדף הבית
חוזר לבורר.

**בורר יעד:** רשימת ~5,000 ערים עם טיסות סדירות (אפשר להזין דאטה-סט; כל ערך: שם אנגלי, IATA,
קוד-מדינה ISO2, מטבע, lat/lng). הקלדה מסננת (גם עם התעלמות מניקוד). 24 ערים "מובילות" מוצגות
ראשונות עם שם עברי + 6 אתרים איקוניים + אולם אירועים.

**מקורות נתונים — חינמיים, ללא מפתח (חובה לעטוף כל קריאה ב-try/catch עם fallback):**
- מטבע: `GET https://api.frankfurter.dev/v1/latest?base=ILS&symbols={CUR}` → ‎`rates[CUR]`.
- מזג אוויר: `https://geocoding-api.open-meteo.com/v1/search?name={cityEn}&count=1` ואז
  `https://api.open-meteo.com/v1/forecast?latitude=..&longitude=..&daily=temperature_2m_max,temperature_2m_min,weather_code&forecast_days=5&timezone=auto`.
- תיאור יעד (עברית): `https://he.wikipedia.org/api/rest_v1/page/summary/{שם עברי}` → `extract`.
- תמונות יעד: `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch={cityEn} skyline&gsrlimit=20&gsrnamespace=6&prop=imageinfo&iiprop=url|size&iiurlwidth=1280&format=json&origin=*` — סנן לכותרות שמכילות את שם העיר ולתמונות לרוחב; הצג כ-hero מתחלף.
- ספורט: `https://www.thesportsdb.com/api/v1/json/3/eventsnext.php?id={teamId}` (משחקי הקבוצה המקומית).
- **מונדיאל 2026** (חשוב!): ליגה 4429 ב-TheSportsDB. לכל יום בטווח הנסיעה שחופף ל-11.6–19.7.2026
  קרא `eventsday.php?d={YYYY-MM-DD}&l=4429` וסנן משחקים לפי אצטדיון המארח בעיר (Miami=Hard Rock,
  New York=MetLife, Los Angeles=SoFi, וכו׳). הצג בראש מדור האירועים.
- אטרקציות למסלול: `https://he.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord={lat}%7C{lng}&gsradius=10000&gslimit=60&format=json&origin=*` ואז העשרה ב-`prop=pageimages|extracts&exintro=1&explaintext=1&piprop=thumbnail` (עד 20 כותרות בקריאה!). הצג עם תמונה ותיאור.

**Deep links (קישור החוצה):** טיסות → Skyscanner (`/transport/flights/tlv/{iata}/{yymmdd}/{yymmdd}/`)
ו-Google Flights; מלונות → Booking (עיר+תאריכים+group_adults=2); אירועים רשמי → Ticketmaster,
לא-רשמי → Songkick/Eventim/Bandsintown/חיפוש Google (עם תווית אזהרה); מסעדות → מדריך MICHELIN
+ Google Maps לפי קטגוריה; eSIM → Airalo; חירום → מספר מקומי + שגרירות (Maps) + אזהרת מסע מל"ל.

**מסכים:**
1. דף בית: hero מתחלף + ספירה לאחור לטיסה, תיאור עברי קצר, ורשת 8 כרטיסים אופקיים קומפקטיים
   (טיסות/מלונות עם טווח מחיר מוערך, מסלול/אירועים/מסעדות/מטבע/מידע/חירום).
2. טיסות / מלונות: טווח מחיר מוערך (טיסות לפי מרחק מ-TLV; מלונות לפי לילה) + כפתורי deep link.
   ציין שזו הערכה ושהמחיר האמיתי בקישור.
3. אירועים: אזור "רשמי" (משחקי מונדיאל מובנים + Ticketmaster) ואזור "לא-רשמי" (קישורי חיפוש,
   עם משפט אזהרה: "מידע ממקורות לא רשמיים — ייתכן חלקי; אמתו מול הקישור").
4. מסעדות: כרטיסי קטגוריה (מישלן / יוקרה / ארוחה קלה / אוכל מקומי / צמחוני / בתי קפה / נוף-גג)
   שכל אחד פותח תוצאות אמיתיות ב-Maps/מישלן.
5. מטבע: ממיר חי דו-כיווני ₪↔מטבע היעד + הצגת השער.
6. מידע: תחזית 5 ימים + קישורי תחבורה/אטרקציות/eSIM + "חיוני לדעת" אצור (ויזה לדרכון ישראלי,
   תקע/מתח, אזור-זמן ב-GMT + הפרש מתל אביב, טיפים).
7. חירום: מספר חירום מקומי, שגרירות ישראל (Maps), אזהרת מסע (מל"ל), ביטוח (placeholder).
8. **מסלול — מדריך טיולים וירטואלי:** ימים עם נושא, לכל יום 2-3 אטרקציות אמיתיות (תמונה + תיאור
   עברי) + טיפ. בראש המסך תיבת **"שאלו את המדריך"**: המשתמש מקליד שאלה והיא נפתחת ב-Perplexity
   (`https://www.perplexity.ai/search?q=...`) עם הקשר היעד והתאריכים. (אופציונלי: אם יש מפתח/AI
   מובנה ב-base44 — תן לו לתכנן את הימים ולענות על השאלות בתוך האפליקציה במקום קישור החוצה.)

**עקרונות:** כל הנתונים נשלפים בזמן אמת בבחירת יעד; כשל מקור מציג הודעה ולא שובר מסך; אפס עלות;
RTL ועברית תקינים; נראה מצוין במובייל.

---

## On base44 — connect the two keyed features

Everything else is key-free and works out of the box. Two features are built but
*gated* until you connect them on base44:

1. **🎵 Concerts (Ticketmaster).** Add a free Ticketmaster Discovery API key as the
   secret `VITE_TICKETMASTER_API_KEY` (developer.ticketmaster.com, ~3 min, 5000/day).
   The concerts card then lists real shows (artist · venue · date · link) like the
   sports cards. Without it, the events screen uses the deep-link search.
   Endpoint already wired: `events.json?classificationName=music&city=&startDateTime=&endDateTime=&apikey=`.

2. **🗺️ AI itinerary (use base44's built-in AI).** The itinerary already shows real
   attractions with photos per day (key-free, Wikipedia). To have AI *build/narrate*
   the plan and answer the "ask the guide" questions, use base44's built-in AI on the
   itinerary screen — feed it the gathered places list and have it return the
   day plan (replaces `aiDays()` / the Perplexity link). No external key needed there.

## After base44 generates it

Iterate in base44's chat: "make the hero taller", "add a dark mode", etc.
