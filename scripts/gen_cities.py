#!/usr/bin/env python3
"""
Generate the full destination dataset for the Escape picker.

Source: OurAirports (actively maintained) airports.csv — fresher and broader than
OpenFlights' 2014 routes data. We keep every airport that has a 3-letter IATA code,
a city (municipality), and either current scheduled passenger service OR is a
large/medium airport — i.e. every place an Israeli can realistically fly to.

Country (ISO-3166 alpha-2) comes straight from OurAirports; currency is mapped via
restcountries. The 24 curated featured cities are excluded (merged at runtime).

Output: src/data/citiesFull.json — [{ en, iata, cc, cur, lat, lng }]
"""
import csv
import io
import json
import os
import urllib.request

AIRPORTS = 'https://davidmegginson.github.io/ourairports-data/airports.csv'
OPENFLIGHTS = 'https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat'
OUT = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'citiesFull.json')

CURATED_KEYS = {
    ('london', 'GB'), ('paris', 'FR'), ('barcelona', 'ES'), ('madrid', 'ES'),
    ('rome', 'IT'), ('milan', 'IT'), ('amsterdam', 'NL'), ('berlin', 'DE'),
    ('munich', 'DE'), ('prague', 'CZ'), ('vienna', 'AT'), ('budapest', 'HU'),
    ('athens', 'GR'), ('lisbon', 'PT'), ('bucharest', 'RO'), ('sofia', 'BG'),
    ('varna', 'BG'), ('istanbul', 'TR'), ('new york', 'US'), ('new york city', 'US'),
    ('los angeles', 'US'), ('miami', 'US'), ('dubai', 'AE'), ('bangkok', 'TH'),
    ('tokyo', 'JP'),
}

TYPE_RANK = {'large_airport': 0, 'medium_airport': 1, 'small_airport': 2}


def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read().decode('utf-8')


def currency_map():
    out = {}
    # primary: restcountries
    try:
        data = json.loads(fetch('https://restcountries.com/v3.1/all?fields=cca2,currencies'))
        if isinstance(data, list):
            for c in data:
                if not isinstance(c, dict):
                    continue
                cca2 = c.get('cca2')
                cur = next(iter((c.get('currencies') or {}).keys()), None)
                if cca2 and cur:
                    out[cca2] = cur
    except Exception as e:
        print('  restcountries failed, using existing dataset for currencies:', e)
    # fallback / fill gaps: reuse cc->cur from the current generated dataset
    if len(out) < 50:
        try:
            existing = json.load(open(OUT, encoding='utf-8'))
            for c in existing:
                if c.get('cc') and c.get('cur'):
                    out.setdefault(c['cc'], c['cur'])
        except Exception:
            pass
    return out


def hebrew_names(en_names):
    """Map English city name -> Hebrew via en.wikipedia langlinks (batched, with retries)."""
    import time
    out = {}
    uniq = sorted({n for n in en_names if n})
    CHUNK = 50
    UA = 'EscapeTravelApp/1.0 (personal travel app; contact: user)'
    fails = 0
    for i in range(0, len(uniq), CHUNK):
        batch = uniq[i:i + CHUNK]
        url = ('https://en.wikipedia.org/w/api.php?action=query&prop=langlinks'
               '&lllang=he&lllimit=500&redirects=1&format=json&titles='
               + urllib.parse.quote('|'.join(batch)))
        j = None
        for attempt in range(4):
            try:
                with urllib.request.urlopen(
                    urllib.request.Request(url, headers={'User-Agent': UA}), timeout=30) as r:
                    j = json.load(r)
                break
            except Exception:
                time.sleep(1.5 * (attempt + 1))
        if j is None:
            fails += 1
            continue
        q = j.get('query', {})
        # resolve normalization + redirect chains: input -> final title
        alias = {}
        for n in q.get('normalized', []):
            alias[n['from']] = n['to']
        for n in q.get('redirects', []):
            alias[n['from']] = n['to']
        title_he = {}
        for p in q.get('pages', {}).values():
            ll = p.get('langlinks')
            if ll:
                title_he[p['title']] = ll[0]['*']
        for name in batch:
            t = name
            for _ in range(3):
                t = alias.get(t, t)
            if t in title_he:
                out[name] = title_he[t]
        if i % 1000 == 0:
            print(f'  …hebrew {i}/{len(uniq)} (mapped {len(out)})')
        time.sleep(0.4)
    if fails:
        print(f'  batches failed after retries: {fails}')
    return out


import urllib.parse  # noqa: E402


def main():
    print('Downloading OurAirports …')
    rows = list(csv.DictReader(io.StringIO(fetch(AIRPORTS))))
    print(f'  rows: {len(rows)}')

    print('Downloading restcountries …')
    cur_by_cc = currency_map()
    print(f'  countries: {len(cur_by_cc)}')

    # OpenFlights IATA -> served city (better destination names than the airport
    # municipality, e.g. KRK -> "Krakow" not "Balice").
    print('Downloading OpenFlights city names …')
    of_city = {}
    for row in csv.reader(io.StringIO(fetch(OPENFLIGHTS))):
        if len(row) > 4 and row[4] and row[4] != '\\N' and row[2] and row[2] != '\\N':
            of_city[row[4]] = row[2].strip()
    print(f'  OpenFlights iata cities: {len(of_city)}')

    best = {}
    for r in rows:
        iata = (r.get('iata_code') or '').strip()
        city = of_city.get(iata) or (r.get('municipality') or '').strip()
        cc = (r.get('iso_country') or '').strip()
        atype = r.get('type') or ''
        scheduled = r.get('scheduled_service') == 'yes'
        if len(iata) != 3 or not city or len(cc) != 2:
            continue
        if not scheduled and atype not in ('large_airport', 'medium_airport'):
            continue
        cur = cur_by_cc.get(cc)
        if not cur:
            continue
        key = (city.lower(), cc)
        if key in CURATED_KEYS:
            continue
        try:
            lat = round(float(r['latitude_deg']), 4)
            lng = round(float(r['longitude_deg']), 4)
        except (ValueError, KeyError):
            continue
        # search alias: the airport municipality, when it adds a distinct spelling
        muni = (r.get('municipality') or '').strip()
        alt = muni if muni and muni.lower() != city.lower() else None
        # rank: scheduled first, then airport size
        rank = (0 if scheduled else 1, TYPE_RANK.get(atype, 3))
        prev = best.get(key)
        if prev is None or rank < prev['_rank']:
            entry = {'en': city, 'iata': iata, 'cc': cc, 'cur': cur, 'lat': lat, 'lng': lng, '_rank': rank}
            if alt:
                entry['alt'] = alt
            best[key] = entry

    cities = sorted(best.values(), key=lambda c: (c['_rank'], c['en']))
    for c in cities:
        del c['_rank']

    print('Fetching Hebrew names (en.wikipedia langlinks) …')
    he_map = hebrew_names([c['en'] for c in cities])
    hits = 0
    for c in cities:
        he = he_map.get(c['en'])
        if he and he != c['en']:
            c['he'] = he
            hits += 1
    print(f'  Hebrew names added: {hits}/{len(cities)}')

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(cities, f, ensure_ascii=False, separators=(',', ':'))

    print(f'\nWrote {len(cities)} cities → {OUT} ({os.path.getsize(OUT)/1024:.0f} KB)')


if __name__ == '__main__':
    main()
