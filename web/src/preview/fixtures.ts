// Fixture data for UI preview mode. Values are illustrative, not operational data.
import type { Arrival } from '@src/types/arrival'
import type { EarthQuakeEvent } from '@src/types/event'
import type { Station } from '@src/types/station'
import type { User } from '@src/types/user'

const STATION_SEED: Array<[code: string, name: string, lat: number, lon: number, elev: number, channels: string[]]> = [
  ['BBJI', 'Bandung Jawa Barat', -7.4617, 107.6539, 1150, ['BHE', 'BHN', 'BHZ']],
  ['BKB', 'Balikpapan Kalimantan Timur', -1.1073, 116.9048, 90, ['BHE', 'BHN', 'BHZ']],
  ['CISI', 'Cisompet Garut', -7.5557, 107.8153, 470, ['BHE', 'BHN', 'BHZ']],
  ['GSI', 'Gunung Sitoli Nias', 1.3039, 97.5755, 107, ['BHE', 'BHN', 'BHZ']],
  ['JAGI', 'Jajag Banyuwangi', -8.4702, 114.1521, 171, ['BHE', 'BHN', 'BHZ']],
  ['LHMI', 'Lhokseumawe Aceh', 5.2288, 96.9472, 35, ['HHE', 'HHN', 'HHZ']],
  ['MNAI', 'Manna Bengkulu', -4.3605, 102.9557, 37, ['BHE', 'BHN', 'BHZ']],
  ['PLAI', 'Plampang Sumbawa', -8.8275, 117.7765, 66, ['BHE', 'BHN', 'BHZ']],
  ['SANI', 'Sanana Maluku Utara', -2.0496, 125.9881, 16, ['BHE', 'BHN', 'BHZ']],
  ['SMRI', 'Semarang Jawa Tengah', -7.0491, 110.4407, 203, ['HHE', 'HHN', 'HHZ']],
  ['SOEI', 'Soe Nusa Tenggara Timur', -9.7553, 124.2672, 916, ['SHE', 'SHN', 'SHZ']],
  ['TNTI', 'Ternate Maluku Utara', 0.7718, 127.3667, 43, ['BHE', 'BHN', 'BHZ']],
  ['UGM', 'Wanagama Yogyakarta', -7.9125, 110.5231, 350, ['HHE', 'HHN', 'HHZ']],
  ['PMBI', 'Palembang Sumatera Selatan', -2.9024, 104.6993, 41, ['BHE', 'BHN', 'BHZ']]
]

export const stations: Station[] = STATION_SEED.map(([code, name, latitude, longitude, elevation, channel], i) => ({
  _id: `preview-station-${code.toLowerCase()}`,
  name,
  code,
  network: 'IA',
  location: '',
  channel,
  latitude,
  longitude,
  elevation,
  server_seedlink: 'seedlink.preview.local:18000',
  server_fdsn: 'fdsn.preview.local:8080',
  status: i === 10 ? 'disabled' : 'enabled'
}))

export const profile: User = {
  _id: 'preview-user-admin',
  username: 'preview-admin',
  role: 'superadmin',
  region: 'Pusat',
  stations: stations.map((s) => s._id),
  disable_stations: []
}

export const users: User[] = [
  profile,
  {
    _id: 'preview-user-jabar',
    username: 'operator-jabar',
    role: 'user',
    region: 'Jawa Barat',
    stations: stations.slice(0, 3).map((s) => s._id),
    disable_stations: [stations[2]._id]
  },
  {
    _id: 'preview-user-sulut',
    username: 'operator-maluku',
    role: 'user',
    region: 'Maluku',
    stations: [stations[8]._id, stations[11]._id],
    disable_stations: []
  },
  {
    _id: 'preview-user-ntt',
    username: 'operator-ntt',
    role: 'user',
    region: 'Nusa Tenggara',
    stations: [stations[7]._id, stations[10]._id],
    disable_stations: []
  }
]

const EVENT_SEED: Array<
  [
    region: string,
    subRegion: string,
    lat: number,
    lon: number,
    depth: number,
    mag: number,
    minutesAgo: number,
    stationIdx: number[]
  ]
> = [
  ['Jawa Barat', 'Garut', -7.83, 107.62, 18, 4.6, 42, [0, 2, 9, 12]],
  ['Maluku Utara', 'Ternate', 1.12, 126.9, 35, 5.2, 190, [8, 11]],
  ['Nusa Tenggara Timur', 'Kupang', -10.05, 123.71, 64, 3.9, 410, [7, 10]],
  ['Aceh', 'Simeulue', 2.65, 95.95, 26, 5.8, 1310, [3, 5]],
  ['Bengkulu', 'Enggano', -5.31, 102.21, 22, 4.1, 2045, [6, 13]],
  ['Jawa Timur', 'Banyuwangi', -9.1, 114.3, 81, 3.6, 3020, [4, 9, 12]],
  ['Sulawesi Tengah', 'Poso', -1.4, 120.75, 12, 4.3, 4380, [1, 8]],
  ['Laut Banda', 'Banda', -6.2, 129.8, 140, 5.0, 6110, [8, 10, 11]],
  ['Sumatera Barat', 'Mentawai', -2.1, 99.6, 30, 4.8, 8800, [3, 6, 13]]
]

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000)
const iso = (d: Date) => d.toISOString()
const addSeconds = (d: Date, s: number) => new Date(d.getTime() + s * 1000)

const buildArrivals = (eventId: string, origin: Date, stationIdx: number[]): Arrival[] =>
  stationIdx.flatMap((idx, n) => {
    const station = stations[idx]
    const pTime = addSeconds(origin, 6 + n * 4.5)
    const sTime = addSeconds(pTime, 5 + n * 3)
    return (['P', 'S'] as const).map((phase) => {
      const ts = phase === 'P' ? pTime : sTime
      const pick = {
        _id: `${eventId}-pick-${station.code}-${phase}`,
        station_id: station._id,
        timestamp: iso(ts),
        created_at: iso(ts)
      }
      return {
        _id: `${eventId}-arr-${station.code}-${phase}`,
        pick_source_id: pick,
        pick_details: pick,
        station_id: station,
        station_details: station,
        timestamp: iso(ts),
        phase_type: phase,
        created_at: iso(ts)
      }
    })
  })

export const events: EarthQuakeEvent[] = EVENT_SEED.map(
  ([region, subRegion, latitude, longitude, depth, mag, ago, idx], i) => {
    const id = `preview-event-${String(i + 1).padStart(3, '0')}`
    const origin = minutesAgo(ago)
    const arrivals = buildArrivals(id, origin, idx)
    return {
      _id: id,
      name: `GEOM${origin.toISOString().slice(0, 10).replace(/-/g, '')}${String(i + 1).padStart(3, '0')}`,
      cluster_detail: [{ origin_time: iso(origin) }],
      arrival_ids: arrivals.map((a) => a._id),
      arrivals,
      latitude,
      longitude,
      depth,
      region,
      sub_region: subRegion,
      terrain: i % 3 === 0 ? 'land' : 'sea',
      country: 'Indonesia',
      magnitudes: [
        { _id: `${id}-mag-ml`, type: 'ML', value: mag },
        { _id: `${id}-mag-mw`, type: 'Mw', value: Math.round((mag - 0.2) * 10) / 10 }
      ],
      created_at: iso(addSeconds(origin, 90))
    }
  }
)

export const pipelineCatalog = [
  {
    id: 'sta_lta',
    name: 'STA/LTA P-Pick',
    description: 'Short-Term Average / Long-Term Average — klasik, real-time CPU picking',
    stage: 'p_pick',
    tier: 'CPU',
    supported_channels: ['BHZ', 'HHZ', 'SHZ'],
    min_sample_rate: 20,
    status: 'active',
    tags: ['classic', 'cpu', 'real-time']
  },
  {
    id: 'phasenet',
    name: 'PhaseNet P-Pick',
    description: 'Deep-learning picker (CNN-based), GPU-accelerated, high recall',
    stage: 'p_pick',
    tier: 'GPU_BASIC',
    supported_channels: ['BHZ', 'HHZ'],
    min_sample_rate: 40,
    status: 'active',
    tags: ['deep-learning', 'gpu', 'cnn']
  },
  {
    id: 'dbscan',
    name: 'DBSCAN Associator',
    description: 'Density-based clustering of picks into candidate events',
    stage: 'association',
    tier: 'CPU',
    status: 'active',
    tags: ['clustering', 'cpu']
  },
  {
    id: 'gamma',
    name: 'GaMMA Associator',
    description: 'Gaussian mixture model phase association',
    stage: 'association',
    tier: 'GPU_BASIC',
    status: 'beta',
    tags: ['probabilistic', 'gpu']
  },
  {
    id: 'geiger',
    name: 'Geiger Locator + ML',
    description: 'Iterative least-squares hypocenter with local magnitude',
    stage: 'locmag',
    tier: 'CPU',
    status: 'active',
    tags: ['classic', 'cpu']
  }
]

export const pipelineConfig = {
  name: 'Default BMKG Operational Pipeline',
  description: 'Standard operational earthquake detection pipeline',
  p_pick: { provider: 'sta_lta', tier: 'CPU' },
  association: { provider: 'dbscan', tier: 'CPU' },
  locmag: { provider: 'geiger', tier: 'CPU' },
  is_active: true,
  compiled_sha256: 'preview0000000000000000000000000000000000000000000000000000000000',
  updated_at: new Date().toISOString()
}
