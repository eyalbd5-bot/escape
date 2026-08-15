/**
 * Aggregator — the SINGLE entry point the UI (and a downstream platform) consumes.
 * Fans out to every source concurrently under the contract runner, then assembles
 * one partial-tolerant AggregatedResponse: a failing source becomes an `error`
 * result in its slot and never breaks the others. See HANDOFF.md.
 */
import { runSource } from './core/contract'
import type { AggregatedResponse, DestinationQuery } from './core/types'
import {
  currencySource,
  weatherSource,
  infoSource,
  mediaSource,
  sportsSource,
  concertsSource,
  flightsSource,
  hotelsSource,
  eventsSource,
  restaurantsSource,
  itinerarySource,
} from './sources'

/**
 * Given a destination + dates, fetch and assemble everything Escape shows.
 * Always resolves (never rejects); each section carries its own ok/empty/error.
 */
export async function getDestinationData(q: DestinationQuery): Promise<AggregatedResponse> {
  const [currency, weather, info, media, sports, concerts, flights, hotels, events, restaurants, itinerary] =
    await Promise.all([
      runSource(currencySource, q),
      runSource(weatherSource, q),
      runSource(infoSource, q),
      runSource(mediaSource, q),
      runSource(sportsSource, q),
      runSource(concertsSource, q),
      runSource(flightsSource, q),
      runSource(hotelsSource, q),
      runSource(eventsSource, q),
      runSource(restaurantsSource, q),
      runSource(itinerarySource, q),
    ])

  return {
    destination: {
      city: q.city,
      startDate: q.startDate,
      endDate: q.endDate,
      nights: q.nights,
    },
    generatedAt: new Date().toISOString(),
    currency,
    weather,
    info,
    media,
    sports,
    concerts,
    flights,
    hotels,
    events,
    restaurants,
    itinerary,
  }
}
