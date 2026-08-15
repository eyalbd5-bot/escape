import { useEffect, useRef, useState } from 'react'
import type { City } from '../types'
import { FEATURED, ALL_CITIES } from '../data/cities'
import { COUNTRY_SEARCH } from '../data/countryNames'
import { flag, cityName } from '../lib/city'

interface Props {
  selected: City | null
  onSelect: (city: City) => void
}

const MAX_RESULTS = 50
const display = (c: City) => `${flag(c)} ${cityName(c)}`
const sub = (c: City) => (c.he ? `${c.en} · ${c.iata}` : `${c.iata} · ${c.cc}`)

/** Lowercase + strip diacritics so "dusseldorf" matches "Düsseldorf". */
const fold = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/**
 * Destination picker (spec §6.1 / §11.1):
 *  - focus/tap opens the featured list immediately (like a wheel)
 *  - typing filters the full OpenFlights dataset (Hebrew / English / IATA), capped
 *  - a prior selection is cleared on focus so the list returns
 *  - clicking outside closes the list
 */
export default function DestinationPicker({ selected, onSelect }: Props) {
  const [value, setValue] = useState(selected ? display(selected) : '')
  const [open, setOpen] = useState(false)
  const acRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selected) setValue(display(selected))
  }, [selected])

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (acRef.current && !acRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  const v = fold(value.trim())
  const isSelectionShown = selected != null && value === display(selected)
  const results: City[] =
    v && !isSelectionShown
      ? ALL_CITIES.filter(
          (c) =>
            (c.he && fold(c.he).includes(v)) ||
            fold(c.en).includes(v) ||
            (c.alt != null && fold(c.alt).includes(v)) ||
            c.iata.toLowerCase().includes(v) ||
            (COUNTRY_SEARCH[c.cc] != null && fold(COUNTRY_SEARCH[c.cc]).includes(v)),
        ).slice(0, MAX_RESULTS)
      : FEATURED

  const handleFocus = () => {
    if (isSelectionShown) setValue('')
    setOpen(true)
  }

  const pick = (c: City) => {
    onSelect(c)
    setValue(display(c))
    setOpen(false)
  }

  return (
    <div className="ac" ref={acRef}>
      <input
        id="q"
        placeholder="הקלידו או בחרו יעד…"
        autoComplete="off"
        value={value}
        onFocus={handleFocus}
        onClick={() => setOpen(true)}
        onChange={(e) => {
          setValue(e.target.value)
          setOpen(true)
        }}
      />
      {open && results.length > 0 && (
        <div className="list">
          {results.map((c) => (
            <div key={`${c.iata}-${c.cc}-${c.en}`} onClick={() => pick(c)}>
              {flag(c)} {cityName(c)} <small>{sub(c)}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
