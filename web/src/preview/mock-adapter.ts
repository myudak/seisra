// Axios adapter that answers every request from in-memory fixtures.
// Nothing leaves the browser: writes only change the in-memory copy.
import { AxiosAdapter, AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import Cookies from 'js-cookie'

import * as fixtures from './fixtures'
import { buildRecordStream } from './waveform'

const db = {
  stations: structuredClone(fixtures.stations),
  users: structuredClone(fixtures.users),
  events: structuredClone(fixtures.events),
  pipelineConfig: structuredClone(fixtures.pipelineConfig)
}

type Params = Record<string, unknown>
type Handler = (ctx: { params: Params; body: any; match: RegExpMatchArray }) => [status: number, data: unknown]

const ok = (data: unknown, extra: Record<string, unknown> = {}): [number, unknown] => [
  200,
  { status: true, message: 'ok (preview)', data, ...extra }
]

// Dates arrive as epoch numbers (getbybetweendate) or ISO strings (getall).
const toTime = (value: unknown, fallback: number) => {
  if (value === undefined || value === null || value === '') return fallback
  const n = Number(value)
  if (Number.isFinite(n)) return n
  const t = new Date(String(value)).getTime()
  return Number.isFinite(t) ? t : fallback
}

const currentUser = () => db.users.find((u) => u._id === fixtures.profile._id)!

const routes: Array<[method: string, pattern: RegExp, handler: Handler]> = [
  // auth
  [
    'post',
    /^\/user\/login$/,
    ({ body }) => {
      const username = (body?.username as string) || fixtures.profile.username
      return ok({ id: fixtures.profile._id, username, region: fixtures.profile.region, access_token: 'preview-token' })
    }
  ],
  [
    'get',
    /^\/user\/me$/,
    () =>
      Cookies.get('access_token') ? ok(currentUser()) : [401, { status: false, message: 'Unauthorized', data: null }]
  ],

  // users
  [
    'get',
    /^\/user\/getall$/,
    ({ params }) => {
      const q = String(params.q ?? '').toLowerCase()
      const page = Number(params.page ?? 1)
      const limit = Number(params.limit ?? 10)
      const filtered = db.users.filter((u) => !q || u.username.toLowerCase().includes(q))
      return ok({ users: filtered.slice((page - 1) * limit, page * limit), total: filtered.length })
    }
  ],
  [
    'post',
    /^\/user$/,
    ({ body }) => {
      const user = { _id: `preview-user-${Date.now()}`, role: 'user', stations: [], disable_stations: [], ...body }
      delete (user as any).password
      db.users.push(user)
      return ok(user)
    }
  ],
  [
    'put',
    /^\/user\/([^/]+)$/,
    ({ match, body }) => {
      const user = db.users.find((u) => u._id === match[1])
      if (!user) return [404, { status: false, message: 'Not found', data: null }]
      Object.assign(user, body)
      return ok(user)
    }
  ],
  [
    'delete',
    /^\/user\/([^/]+)$/,
    ({ match }) => {
      db.users = db.users.filter((u) => u._id !== match[1])
      return ok(null)
    }
  ],

  // stations
  ['get', /^\/station\/getall$/, () => ok({ stations: db.stations, total: db.stations.length })],
  [
    'get',
    /^\/station\/getwaveformstatus$/,
    ({ params }) => {
      const station = db.stations.find((s) => s._id === params.station_id) ?? db.stations[0]
      const seed = station.code.length
      return ok({
        ...station,
        delay_second: 1.2 + seed * 0.3,
        spike_amplitude: 1800 + seed * 120,
        displacement: 0.0021,
        velocity: 0.034,
        acceleration: 0.41,
        rms: 52.4,
        spikes_count: seed,
        spikes_interval: 30,
        timing_quality: 100 - seed
      })
    }
  ],
  [
    'put',
    /^\/station\/updatestatus$/,
    ({ body }) => {
      const user = currentUser()
      const disabled = new Set(user.disable_stations)
      // Mirrors the backend: only 'enable' removes; anything else disables.
      if (body?.status !== 'enable') disabled.add(body.station_id)
      else disabled.delete(body?.station_id)
      user.disable_stations = [...disabled]
      return ok(user)
    }
  ],
  [
    'post',
    /^\/station$/,
    ({ body }) => {
      const station = { _id: `preview-station-${Date.now()}`, location: '', status: 'enabled', ...body }
      db.stations.push(station)
      return ok(station)
    }
  ],
  [
    'put',
    /^\/station\/([^/]+)$/,
    ({ match, body }) => {
      const station = db.stations.find((s) => s._id === match[1])
      if (!station) return [404, { status: false, message: 'Not found', data: null }]
      Object.assign(station, body)
      return ok(station)
    }
  ],
  [
    'delete',
    /^\/station\/([^/]+)$/,
    ({ match }) => {
      db.stations = db.stations.filter((s) => s._id !== match[1])
      return ok(null)
    }
  ],
  ['get', /^\/station\/([^/]+)\/pick$/, () => [200, []]],
  ['get', /^\/arrival\/getbystation$/, () => [200, []]],

  // events
  [
    'get',
    /^\/event\/getall$/,
    ({ params }) => {
      const page = Number(params.page ?? 1)
      const perPage = Number(params.total_per_page ?? 10)
      const start = toTime(params.start_date, 0)
      const end = toTime(params.end_date, Infinity)
      const inRange = db.events.filter((e) => {
        const t = new Date(e.cluster_detail[0].origin_time).getTime()
        return t >= start && t <= end
      })
      return ok(inRange.slice((page - 1) * perPage, page * perPage), { total: inRange.length })
    }
  ],
  [
    'get',
    /^\/event\/getbybetweendate$/,
    ({ params }) => {
      const start = toTime(params.start_date, 0)
      const end = toTime(params.end_date, Infinity)
      return ok(
        db.events.filter((e) => {
          const t = new Date(e.cluster_detail[0].origin_time).getTime()
          return t >= start && t <= end
        })
      )
    }
  ],
  [
    'get',
    /^\/event\/getdetail$/,
    ({ params }) => {
      const event = db.events.find((e) => e._id === params.event_id)
      return event ? ok(event) : [404, { status: false, message: 'Not found', data: null }]
    }
  ],
  ['put', /^\/event\/commit$/, ({ body }) => ok({ _id: body?.event_id ?? 'preview-event' })],

  // record stream (waveform archive)
  ['get', /^\/recordstream\/get$/, ({ params }) => ok(buildRecordStream(params as any))],

  // pipeline config
  ['get', /^\/pipeline\/catalog$/, () => ok(fixtures.pipelineCatalog)],
  ['get', /^\/pipeline\/config$/, () => ok(db.pipelineConfig)],
  [
    'post',
    /^\/pipeline\/config$/,
    ({ body }) => {
      db.pipelineConfig = { ...body, updated_at: new Date().toISOString() }
      return ok(db.pipelineConfig)
    }
  ],
  [
    'post',
    /^\/pipeline\/compile$/,
    () => [200, { status: true, sha256: 'preview' + Date.now().toString(16).padStart(58, '0') }]
  ]
]

const BASE_PREFIXES = ['/record-api/api/v1', '/api/v1']

const normalizePath = (config: InternalAxiosRequestConfig) => {
  const raw = config.url ?? ''
  const url = new URL(raw, new URL(config.baseURL ?? '/', location.origin))
  let path = url.pathname
  for (const prefix of BASE_PREFIXES) {
    if (path.startsWith(prefix)) {
      path = path.slice(prefix.length)
      break
    }
  }
  const params: Params = { ...Object.fromEntries(url.searchParams), ...(config.params ?? {}) }
  return { path: path.replace(/\/+$/, '') || '/', params }
}

const parseBody = (data: unknown) => {
  if (typeof data !== 'string') return data
  try {
    return JSON.parse(data)
  } catch {
    return data
  }
}

export const previewAdapter: AxiosAdapter = async (config) => {
  const method = (config.method ?? 'get').toLowerCase()
  const { path, params } = normalizePath(config)
  const body = parseBody(config.data)

  // Small delay so loading states are visible while redesigning.
  await new Promise((r) => setTimeout(r, 150 + Math.random() * 200))

  let status = 404
  let data: unknown = { status: false, message: `No preview fixture for ${method.toUpperCase()} ${path}`, data: null }

  for (const [m, pattern, handler] of routes) {
    const match = path.match(pattern)
    if (m === method && match) {
      ;[status, data] = handler({ params, body, match })
      break
    }
  }

  if (status === 404) console.warn('[preview]', method.toUpperCase(), path, '→ no fixture')
  else console.debug('[preview]', method.toUpperCase(), path, '→', status)

  const response: AxiosResponse = { data, status, statusText: String(status), headers: {}, config, request: {} }
  const validate = config.validateStatus ?? ((s: number) => s >= 200 && s < 300)
  if (!validate(status)) {
    throw new AxiosError(`Request failed with status code ${status}`, String(status), config, {}, response)
  }
  return response
}
