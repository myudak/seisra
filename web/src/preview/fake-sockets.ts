// Stand-ins for the waveform Socket.IO connection and the event/picking WebSockets.
import { buildPackets } from './waveform'

type Listener = (...args: any[]) => void

const WINDOW_MS = 30 * 60_000
const PUSH_INTERVAL_MS = 2_000

/** Minimal subset of the socket.io-client `Socket` API that the app uses. */
export class PreviewSocketIO {
  connected = false
  private listeners = new Map<string, Set<Listener>>()
  private streams = new Map<string, number>()

  constructor() {
    setTimeout(() => {
      this.connected = true
      this.fire('connect')
    }, 250)
  }

  on(event: string, fn: Listener) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set())
    this.listeners.get(event)!.add(fn)
    return this
  }

  off(event: string, fn?: Listener) {
    if (fn) this.listeners.get(event)?.delete(fn)
    else this.listeners.delete(event)
    return this
  }

  emit(event: string, ...args: any[]) {
    if (event === 'waveform' && typeof args[0] === 'string') this.stream(args[0])
    return this
  }

  connect() {
    return this
  }

  disconnect() {
    this.streams.forEach((id) => clearInterval(id))
    this.streams.clear()
    this.connected = false
    this.fire('disconnect', 'io client disconnect')
    return this
  }

  close() {
    return this.disconnect()
  }

  private fire(event: string, ...args: any[]) {
    this.listeners.get(event)?.forEach((fn) => fn(...args))
  }

  private stream(channelName: string) {
    if (this.streams.has(channelName)) return
    const push = () => {
      const end = Date.now()
      this.fire(`data-${channelName}`, buildPackets(channelName, end - WINDOW_MS, end))
    }
    setTimeout(push, 50)
    this.streams.set(channelName, window.setInterval(push, PUSH_INTERVAL_MS))
  }
}

const STREAM_URL = /\/ws(event|picking|arrivalpick)(\?|$)/

/** Opens immediately and never sends messages; used for the alert/picking streams. */
class PreviewWebSocket extends EventTarget {
  static readonly CONNECTING = 0
  static readonly OPEN = 1
  static readonly CLOSING = 2
  static readonly CLOSED = 3

  readyState = 0
  binaryType: BinaryType = 'blob'
  bufferedAmount = 0
  extensions = ''
  protocol = ''
  onopen: ((ev: Event) => void) | null = null
  onmessage: ((ev: MessageEvent) => void) | null = null
  onclose: ((ev: CloseEvent) => void) | null = null
  onerror: ((ev: Event) => void) | null = null

  constructor(readonly url: string) {
    super()
    setTimeout(() => {
      if (this.readyState !== 0) return
      this.readyState = 1
      const ev = new Event('open')
      this.dispatchEvent(ev)
      this.onopen?.(ev)
    }, 200)
  }

  send() {}

  close() {
    if (this.readyState === 3) return
    this.readyState = 3
    const ev = new CloseEvent('close', { code: 1000, wasClean: true })
    this.dispatchEvent(ev)
    this.onclose?.(ev)
  }
}

/** Route only the app's backend stream URLs to the fake; Vite HMR keeps the real WebSocket. */
export const patchWebSocket = () => {
  const RealWebSocket = window.WebSocket
  const Patched = function (this: unknown, url: string | URL, protocols?: string | string[]) {
    if (STREAM_URL.test(String(url))) return new PreviewWebSocket(String(url))
    return new RealWebSocket(url, protocols)
  } as unknown as typeof WebSocket
  Object.assign(Patched, { CONNECTING: 0, OPEN: 1, CLOSING: 2, CLOSED: 3 })
  Patched.prototype = RealWebSocket.prototype
  window.WebSocket = Patched
}
