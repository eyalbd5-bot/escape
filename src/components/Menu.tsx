import type { ViewKey } from '../types'
import { MENU } from '../data/menu'

interface Props {
  open: boolean
  current: ViewKey
  onClose: () => void
  onNavigate: (view: ViewKey) => void
}

/** Slide-in hamburger menu (spec §5.3). Rendered only while open so the
 *  slide animation replays each time it's opened. */
export default function Menu({ open, current, onClose, onNavigate }: Props) {
  if (!open) return null
  return (
    <div className="menu open">
      <div className="ov" onClick={onClose} aria-hidden="true" />
      <div className="sheet" role="menu" aria-label="ניווט">
        <h3>הניווט שלי</h3>
        <div>
          {MENU.map((mi) => (
            <div
              key={mi.key}
              role="menuitem"
              tabIndex={0}
              aria-current={mi.key === current ? 'page' : undefined}
              className={'mi' + (mi.key === current ? ' on' : '')}
              onClick={() => onNavigate(mi.key)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onNavigate(mi.key)
                } else if (e.key === 'Escape') {
                  onClose()
                }
              }}
            >
              <span className="e" aria-hidden="true">{mi.emoji}</span>
              {mi.label}
            </div>
          ))}
        </div>
        <div className="mfoot">MADE FOR MY TRIPS ✈️</div>
      </div>
    </div>
  )
}
