import { type KeyboardEvent } from 'react'
import type { Trip } from '../types'
import { heD } from '../lib/format'
import { flag, cityName } from '../lib/city'

interface Props {
  trip: Trip
  onBack: () => void
  onHome: () => void
  onOpenMenu: () => void
}

/**
 * Sticky top bar (spec §5.3): back arrow (points right for RTL), destination
 * label + dates (tap → home), hamburger (opens menu).
 */
export default function TopBar({ trip, onBack, onHome, onOpenMenu }: Props) {
  const { city, d1, d2 } = trip
  const onKey = (fn: () => void) => (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      fn()
    }
  }
  return (
    <div className="bar">
      <div className="back" role="button" tabIndex={0} aria-label="חזרה" onClick={onBack} onKeyDown={onKey(onBack)}>
        →
      </div>
      <div className="home" role="button" tabIndex={0} aria-label="חזרה לדף הבית" onClick={onHome} onKeyDown={onKey(onHome)}>
        <span className="fl" aria-hidden="true">{flag(city)}</span>
        <div>
          <b>{cityName(city)}</b>
          <span>
            {heD(d1)}–{heD(d2)} · TLV→{city.iata}
          </span>
        </div>
      </div>
      <div className="burger" role="button" tabIndex={0} aria-label="תפריט" aria-haspopup="menu" onClick={onOpenMenu} onKeyDown={onKey(onOpenMenu)}>
        <span />
      </div>
    </div>
  )
}
