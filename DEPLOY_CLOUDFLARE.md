# פריסת Escape ל-Cloudflare Pages — הנחיות ל-cowork

מסמך הנחיה לפריסת אפליקציית **Escape** לאוויר בחשבון ה-Cloudflare החינמי הקיים
(אותו חשבון שבו מתארחת אפליקציית המוזיקה), כך שהאתר **יתעדכן באופן שוטף** בכל שינוי קוד.

---

## מה זה האתר (עובדות טכניות)

| | |
|---|---|
| טכנולוגיה | Vite 5 + React 18 + TypeScript — **SPA סטטי** (אין שרת, אין ניתוב-צד-שרת) |
| מיקום מקומי | `/Users/eyalbendavid/Downloads/files 2/escape` |
| פקודת build | `npm run build` (מריץ `tsc -b && vite build`) |
| תיקיית פלט | **`dist/`** |
| Node | 20 או 22 (Vite 5 דורש 18+) |
| מפתחות סודיים | **אין חובה** — האפליקציה רצה מלא ללא מפתחות. כל מקורות הנתונים חינמיים |
| ניתוב | אין client-side routing → לא צריך SPA-fallback. אופציונלי בלבד |

> חשוב: משתני `VITE_*` נצרבים ב-**build time** (Vite מטמיע אותם בקוד). לכן אם מוסיפים
> מפתח (למשל `VITE_TICKETMASTER_API_KEY`) — יש להגדיר אותו ב-Environment Variables של
> ה-build ב-Cloudflare, ולהריץ build מחדש. הגדרה ב-runtime לא תשפיע.

---

## מסלול מומלץ — GitHub → Cloudflare Pages (עדכון שוטף אוטומטי)

זה המסלול ש"מתעדכן באופן שוטף": כל `git push` → Cloudflare בונה ופורס אוטומטית.

### שלב 1 — להעלות את הקוד ל-GitHub
הפרויקט **עדיין לא ריפו git**. יש בו כבר `.gitignore` תקין (מתעלם מ-`node_modules`, `dist`, `.env`).

```bash
cd "/Users/eyalbendavid/Downloads/files 2/escape"
git init
git add -A
git commit -m "Escape — initial commit"
gh repo create escape --private --source=. --push   # דורש gh מחובר לחשבון ה-GitHub של המשתמש
```
(אם אין `gh`: ליצור ריפו ריק ב-github.com ואז `git remote add origin <URL> && git push -u origin main`.)

### שלב 2 — לחבר ל-Cloudflare Pages
1. dash.cloudflare.com → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. לבחור את ריפו `escape`.
3. הגדרות build:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Environment variables:** `NODE_VERSION` = `22` (ואם רוצים הופעות חיות: `VITE_TICKETMASTER_API_KEY` = המפתח החינמי מ-developer.ticketmaster.com)
4. **Save and Deploy**. תוך ~1–2 דקות מתקבל URL: `https://escape-XXX.pages.dev`.

### שלב 3 — עדכון שוטף
מרגע זה, **כל push לענף main בונה ופורס אוטומטית**. זרימת העבודה:
עורכים קוד → `git commit` → `git push` → Cloudflare בונה → האתר מתעדכן. אפס פעולה ידנית.

---

## מחירי טיסות חיים (Travelpayouts) — Cloudflare Function
הפרויקט כולל `functions/api/flights.js` — **פונקציית-שרת ש-Cloudflare Pages פורסת אוטומטית**
(אין build נפרד). היא מושכת מחירים אמיתיים מ-Travelpayouts, והאתר קורא ל-`/api/flights`
מאותו origin (בלי CORS, הטוקן נשאר בשרת). כדי להדליק:
1. Cloudflare Pages → הפרויקט → **Settings → Environment variables** (Production + Preview).
2. הוסף **`TRAVELPAYOUTS_TOKEN`** = הטוקן שלך (סוד — לא נכנס לקוד/גיט). אופציונלי: `TRAVELPAYOUTS_MARKER`.
3. **Redeploy**. מאותו רגע מסך הטיסות מציג עד 5 טיסות מתומחרות; לחיצה פותחת Google Flights.

ללא טוקן — הפונקציה מחזירה רשימה ריקה והמסך פשוט לא מציג שורות מחיר (אפס המצאה).

---

## מסלול חלופי — העלאה ישירה עם Wrangler (בלי GitHub)

מהיר לפריסה ראשונה, אבל "עדכון" דורש הרצה חוזרת (לא אוטומטי כמו Git):

```bash
cd "/Users/eyalbendavid/Downloads/files 2/escape"
npm install
npm run build
npx wrangler pages deploy dist --project-name escape   # דורש wrangler מחובר (wrangler login)
```
לעדכן בעתיד = להריץ שוב את שתי השורות האחרונות (`npm run build` + `wrangler pages deploy dist`).
אפשר לעטוף בסקריפט `npm run deploy` אם רוצים.

---

## אופציונלי

- **דומיין מותאם:** ב-Pages → Custom domains → להוסיף תת-דומיין (למשל `escape.<domain>`), Cloudflare מטפל ב-DNS+SSL אוטומטית.
- **`public/_redirects`** (רק אם בעתיד יתווסף ניתוב-צד-לקוח): שורה אחת `/* /index.html 200`.
- **בדיקה לפני פריסה:** `npm run test` (25 בדיקות) + `npm run build` חייבים לעבור.

---

## הנחיה מוכנה-להדבקה ל-cowork

> פרוס את אפליקציית Escape (Vite+React SPA + Cloudflare Pages Functions בתיקיית `functions/`)
> מ-`/Users/eyalbendavid/Downloads/files 2/escape` ל-Cloudflare Pages בחשבון החינמי הקיים של
> המשתמש (אותו חשבון של אפליקציית המוזיקה), עם עדכון אוטומטי.
> מסלול GitHub: אתחל git (יש `.gitignore` תקין), העלה לריפו פרטי בשם `escape`, וחבר ל-Cloudflare
> Pages עם build command `npm run build`, output directory `dist`, ו-`NODE_VERSION=22`.
> תיקיית `functions/` נפרסת אוטומטית (מפעילה את `/api/flights` למחירי טיסות) — אין קונפיג נוסף.
> ודא שהבנייה עוברת ומסור למשתמש את כתובת ה-`*.pages.dev`.
> אל תגדיר את הטוקן `TRAVELPAYOUTS_TOKEN` בעצמך — זה סוד של המשתמש; ציין לו שיוסיף אותו ב-
> Settings → Environment variables אחרי הפריסה. פרטים מלאים ב-`DEPLOY_CLOUDFLARE.md`.
