// Deterministic synthetic seismograms for UI preview mode.
import type { StationWaveForm } from '@src/types/waveform'

import { events } from './fixtures'

export const SAMPLE_RATE = 20
const DELTA = 1 / SAMPLE_RATE

const hashString = (value: string) => {
  let h = 2166136261
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// Cheap deterministic pseudo-noise in [-1, 1] for (seed, sampleIndex).
const noise = (seed: number, n: number) => {
  let x = (seed ^ Math.imul(n, 2654435761)) >>> 0
  x ^= x >>> 15
  x = Math.imul(x, 2246822519) >>> 0
  x ^= x >>> 13
  return (x / 0xffffffff) * 2 - 1
}

/** Arrival times (ms) that should show as a burst on this station code. */
const burstsByStation = new Map<string, Array<{ at: number; amp: number }>>()
for (const event of events) {
  const mag = event.magnitudes[0]?.value ?? 4
  for (const arrival of event.arrivals) {
    const code = arrival.station_details.code
    const list = burstsByStation.get(code) ?? []
    list.push({ at: new Date(arrival.timestamp).getTime(), amp: 900 * Math.pow(2, mag - 4) })
    burstsByStation.set(code, list)
  }
}

/** Recurring "live" bursts so the realtime trace view has activity. */
const liveBurstPeriodMs = 7 * 60_000

const sampleAt = (channelName: string, tMs: number) => {
  const [, code = '', , channel = ''] = channelName.split('.')
  const seed = hashString(channelName)
  const n = Math.floor(tMs / (DELTA * 1000))
  const t = tMs / 1000
  const isVertical = channel.endsWith('Z')

  let value =
    35 * Math.sin(2 * Math.PI * 0.18 * t + (seed % 7)) + // microseism
    18 * Math.sin(2 * Math.PI * 0.05 * t + (seed % 11)) +
    40 * noise(seed, n)

  const decaying = (dt: number, amp: number, freq: number, tau: number) =>
    dt >= 0 && dt < tau * 6
      ? amp * Math.exp(-dt / tau) * Math.sin(2 * Math.PI * freq * dt) * (0.6 + 0.4 * noise(seed + 1, n))
      : 0

  for (const burst of burstsByStation.get(code) ?? []) {
    const dt = (tMs - burst.at) / 1000
    value += decaying(dt, isVertical ? burst.amp : burst.amp * 0.7, 3.2, 6)
  }

  const offset = seed % liveBurstPeriodMs
  const sinceLive = (((tMs - offset) % liveBurstPeriodMs) + liveBurstPeriodMs) % liveBurstPeriodMs
  value += decaying(sinceLive / 1000, 1600, 2.4, 5)

  return Math.round(value)
}

export const buildSamples = (channelName: string, startMs: number, endMs: number) => {
  const start = Math.ceil(startMs / (DELTA * 1000)) * DELTA * 1000
  const samples: number[] = []
  for (let t = start; t <= endMs; t += DELTA * 1000) samples.push(sampleAt(channelName, t))
  return { start, samples }
}

const PACKET_SECONDS = 30
const MAX_CACHED_PACKETS = 4000
// Complete packets never change, so only the newest (partial) packet is recomputed per push.
const packetCache = new Map<string, StationWaveForm>()

/** Packets covering [startMs, endMs], shaped like the waveform Socket.IO payload. */
export const buildPackets = (channelName: string, startMs: number, endMs: number): StationWaveForm[] => {
  const [network = 'IA', station = '', location = '', channel = ''] = channelName.split('.')
  const packetMs = PACKET_SECONDS * 1000
  const packets: StationWaveForm[] = []
  for (let p = Math.floor(startMs / packetMs) * packetMs; p < endMs; p += packetMs) {
    const isComplete = p + packetMs <= endMs
    const key = `${channelName}|${p}`
    const cached = isComplete ? packetCache.get(key) : undefined
    if (cached) {
      packets.push(cached)
      continue
    }
    const pEnd = Math.min(p + packetMs - DELTA * 1000, endMs)
    const { start, samples } = buildSamples(channelName, p, pEnd)
    const packet: StationWaveForm = {
      date: new Date(start).toISOString().slice(0, 10),
      starttime: new Date(start).toISOString(),
      endtime: new Date(start + (samples.length - 1) * DELTA * 1000).toISOString(),
      sampling_rate: SAMPLE_RATE,
      delta: DELTA,
      location,
      npts: samples.length,
      station,
      network,
      channel,
      expiration_timestamp: Date.now() + 60_000,
      waveform: samples
    }
    if (isComplete) {
      if (packetCache.size >= MAX_CACHED_PACKETS) packetCache.delete(packetCache.keys().next().value!)
      packetCache.set(key, packet)
    }
    packets.push(packet)
  }
  return packets
}

export const buildRecordStream = (params: {
  network: string
  station: string
  location?: string
  channel: string
  starttime: unknown
  endtime: unknown
}) => {
  const toMs = (v: unknown) => (v instanceof Date ? v.getTime() : new Date(v as string).getTime())
  const startMs = toMs(params.starttime)
  const endMs = toMs(params.endtime)
  const channelName = `${params.network}.${params.station}.${params.location ?? ''}.${params.channel}`
  const { start, samples } = buildSamples(channelName, startMs, endMs)
  return {
    date: new Date(start).toISOString().slice(0, 10),
    time_start: new Date(start).toISOString(),
    time_end: new Date(start + (samples.length - 1) * DELTA * 1000).toISOString(),
    sampling_rate: SAMPLE_RATE,
    delta: DELTA,
    location: params.location ?? '',
    npts: samples.length,
    station: params.station,
    network: params.network,
    channel: params.channel,
    expiration_timestamp: Date.now() + 60_000,
    waveform: samples
  }
}
