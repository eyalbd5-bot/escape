import type { Source, WeatherData, WeatherDay } from '../core/types'
import { ok, empty } from '../core/contract'
import { httpGetJson } from '../core/http'
import { CONFIG } from '../core/config'

const KEY = 'open-meteo'
const HE_DAYS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳']

/** WMO weather code → emoji. */
export const wmoIcon = (code: number): string =>
  code === 0
    ? '☀️'
    : code < 4
      ? '🌤️'
      : code < 49
        ? '🌫️'
        : code < 68
          ? '🌧️'
          : code < 78
            ? '❄️'
            : code < 83
              ? '🌦️'
              : '⛈️'

interface Geo {
  results?: { latitude: number; longitude: number }[]
}
interface Forecast {
  daily?: {
    time: string[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    weather_code: number[]
  }
}

/** 5-day forecast (Open-Meteo geocoding → forecast, key-free, spec §6.8). */
export const weatherSource: Source<WeatherData> = {
  key: KEY,
  tier: 'official',
  async getForDestination(q) {
    const geo = await httpGetJson<Geo>(
      `${CONFIG.openMeteoGeocode}/search?name=${encodeURIComponent(q.city.en)}&count=1&language=en`,
      { cacheTtlMs: 60 * 60 * 1000 },
    )
    const place = geo?.results?.[0]
    if (!place) return empty<WeatherData>(KEY, 'official')

    const f = await httpGetJson<Forecast>(
      `${CONFIG.openMeteoForecast}/forecast?latitude=${place.latitude}&longitude=${place.longitude}` +
        `&daily=temperature_2m_max,temperature_2m_min,weather_code&forecast_days=5&timezone=auto`,
      { cacheTtlMs: 30 * 60 * 1000 },
    )
    const d = f?.daily
    if (!d?.time?.length) return empty<WeatherData>(KEY, 'official')

    const days: WeatherDay[] = d.time.map((t, i) => {
      const dt = new Date(t)
      return {
        label: `${HE_DAYS[dt.getDay()]} ${dt.getDate()}.${dt.getMonth() + 1}`,
        icon: wmoIcon(d.weather_code[i]),
        max: Math.round(d.temperature_2m_max[i]),
        min: Math.round(d.temperature_2m_min[i]),
      }
    })
    return ok<WeatherData>(KEY, 'official', { days, mini: `${days[0].icon} ${days[0].max}°` })
  },
}
