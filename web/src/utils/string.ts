import { EarthQuakeEvent } from '@src/types/event'
import { Magnitude } from '@src/types/magnitude'
// import { format } from 'date-fns'

export const formatDate = (date: string | Date) => {
  // const strFormat = 'd/M/yyyy pp'
  if (typeof date === 'string') {
    // return format(newISODate(date), strFormat)
    return newISODate(date).toISOString()
  }
  // return format(date, strFormat)
  return date.toISOString()
}

export const newISODate = (date: string) => {
  return new Date(date.includes('T') && !date.includes('Z') ? `${date}Z` : date)
}

export const getDefaultMagnitude = (magnitudes: Magnitude[]) =>
  magnitudes.find((magnitude) => magnitude.type.toLowerCase() === 'mw')

/** Mw when present, otherwise the first magnitude the event has. */
export const getDisplayMagnitude = (magnitudes: Magnitude[] = []) =>
  getDefaultMagnitude(magnitudes) ?? magnitudes[0]

const toDate = (date: string | Date) => (typeof date === 'string' ? newISODate(date) : date)
const pad = (n: number, width = 2) => String(n).padStart(width, '0')
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

/** "11 Nov 2026" (UTC). */
export const formatDateUTC = (date: string | Date) => {
  const d = toDate(date)
  if (Number.isNaN(d.getTime())) return '-'
  return `${pad(d.getUTCDate())} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

/** "05:21:36" or "05:21:36.120" (UTC). */
export const formatTimeUTC = (date: string | Date, withMs = false) => {
  const d = toDate(date)
  if (Number.isNaN(d.getTime())) return '-'
  const base = `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`
  return withMs ? `${base}.${pad(d.getUTCMilliseconds(), 3)}` : base
}

/** "11 Nov 2026 05:21:36 UTC": origin times are always shown in UTC. */
export const formatDateTimeUTC = (date?: string | Date | null) =>
  date ? `${formatDateUTC(date)} ${formatTimeUTC(date)} UTC` : '-'

export const getOriginTimeFromEvent = (event: EarthQuakeEvent) => event.cluster_detail?.[0]?.origin_time

export const formatMagnitude = (magnitude: number) => magnitude?.toFixed(1)
export const formatDepth = (depth: number) => depth?.toFixed(1)
export const formatLatLon = (coordinate: number) => coordinate?.toFixed(3)

/** Pass `now` from a ticking ref (e.g. useNow) to keep the label fresh. */
export const timeAgo = (date: Date, now: Date = new Date()) => {
  const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (secondsAgo < 60) {
    return secondsAgo === 1 ? 'baru saja' : `${secondsAgo} detik lalu`
  }

  const minutesAgo = Math.floor(secondsAgo / 60)
  if (minutesAgo < 60) {
    return `${minutesAgo} menit lalu`
  }

  const hoursAgo = Math.floor(minutesAgo / 60)
  if (hoursAgo < 24) {
    return `${hoursAgo} jam lalu`
  }

  const daysAgo = Math.floor(hoursAgo / 24)
  return `${daysAgo} hari lalu`
}
