import { useEffect, useState } from 'react'
import type { Trip, ViewKey } from './types'
import type { AggregatedResponse } from './core/types'
import { getDestinationData } from './aggregator'
import Background from './components/Background'
import Landing from './components/Landing'
import TopBar from './components/TopBar'
import Menu from './components/Menu'
import HomeView from './components/views/HomeView'
import ItineraryView from './components/views/ItineraryView'
import FlightsView from './components/views/FlightsView'
import HotelsView from './components/views/HotelsView'
import EventsView from './components/views/EventsView'
import RestaurantsView from './components/views/RestaurantsView'
import CurrencyView from './components/views/CurrencyView'
import InfoView from './components/views/InfoView'
import EmergencyView from './components/views/EmergencyView'

const scrollTop = (smooth = true) =>
  window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' })

/**
 * App shell: owns navigation and a SINGLE call to the aggregator per trip.
 * All views are pure — they read from the AggregatedResponse and render; no view
 * fetches or transforms anything (orchestrator: logic stays out of the UI).
 */
export default function App() {
  const [trip, setTrip] = useState<Trip | null>(null)
  const [data, setData] = useState<AggregatedResponse | null>(null)
  const [view, setView] = useState<ViewKey>('home')
  const [stack, setStack] = useState<ViewKey[]>([])
  const [menuOpen, setMenuOpen] = useState(false)

  // One aggregator call per destination — the only data fetch in the app.
  useEffect(() => {
    if (!trip) {
      setData(null)
      return
    }
    let live = true
    setData(null)
    getDestinationData({
      city: trip.city,
      startDate: trip.d1,
      endDate: trip.d2,
      nights: trip.nights,
    }).then((res) => {
      if (live) setData(res)
    })
    return () => {
      live = false
    }
  }, [trip])

  const createTrip = (t: Trip) => {
    setTrip(t)
    setStack([])
    setView('home')
    setMenuOpen(false)
    scrollTop(false)
  }

  const navigate = (next: ViewKey, push = true) => {
    if (push && view !== next) setStack((s) => [...s, view])
    setView(next)
    setMenuOpen(false)
    scrollTop()
  }

  const back = () => {
    if (stack.length) {
      const prev = stack[stack.length - 1]
      setStack((s) => s.slice(0, -1))
      setView(prev)
      setMenuOpen(false)
      scrollTop()
    } else {
      setTrip(null)
      setStack([])
      setView('home')
      setMenuOpen(false)
      scrollTop(false)
    }
  }

  const renderView = (d: AggregatedResponse) => {
    switch (view) {
      case 'home':
        return <HomeView data={d} onNavigate={navigate} />
      case 'itinerary':
        return <ItineraryView city={d.destination.city} itinerary={d.itinerary} />
      case 'flights':
        return <FlightsView flights={d.flights} />
      case 'hotels':
        return <HotelsView hotels={d.hotels} />
      case 'events':
        return <EventsView trip={trip!} sports={d.sports} concerts={d.concerts} events={d.events} />
      case 'restaurants':
        return <RestaurantsView city={d.destination.city} restaurants={d.restaurants} />
      case 'currency':
        return <CurrencyView city={d.destination.city} currency={d.currency} />
      case 'info':
        return <InfoView city={d.destination.city} weather={d.weather} info={d.info} />
      case 'emergency':
        return <EmergencyView city={d.destination.city} info={d.info} />
    }
  }

  return (
    <>
      <Background imageUrl={data?.media.data?.hero ?? null} />
      <div className="wrap">
        {!trip ? (
          <Landing onCreate={createTrip} />
        ) : (
          <>
            <TopBar
              trip={trip}
              onBack={back}
              onHome={() => navigate('home')}
              onOpenMenu={() => setMenuOpen(true)}
            />
            {data ? (
              <div className={view === 'home' ? 'screen' : 'screen narrow'}>{renderView(data)}</div>
            ) : (
              <div className="loading">
                <div className="spin" />
                בונה את המסע ל{trip.city.he || trip.city.en}…
              </div>
            )}
          </>
        )}
      </div>
      {trip && (
        <Menu
          open={menuOpen}
          current={view}
          onClose={() => setMenuOpen(false)}
          onNavigate={navigate}
        />
      )}
    </>
  )
}
