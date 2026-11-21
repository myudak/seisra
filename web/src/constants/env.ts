// Backend URLs. Empty or unset values fall back to the page's own origin, which is
// how the production image works: nginx (web/nginx.conf) and the Vite dev proxy
// (vite.config.ts) forward /api, /record-api, /socket.io and /ws* to the backend.
const USE_MOCK = window.localStorage.getItem('use-mock') === 'true'

const env = import.meta.env
const origin = window.location.origin
const wsOrigin = origin.replace(/^http/, 'ws')
const pick = (value: string | undefined, fallback: string) => (value && value.trim() ? value : fallback)

export const API_BASE_URL: string = pick(env.VITE_API_BASE_URL, '/api/v1')
export const API_BASE_URL_MOCK: string = USE_MOCK ? env.VITE_API_BASE_URL_MOCK : API_BASE_URL
export const API_BFF_URL: string = pick(env.VITE_API_BFF_URL, API_BASE_URL)
export const API_STREAM_URL: string = pick(env.VITE_API_STREAM_URL, '/record-api/api/v1')
export const SOCKET_BASE_URL: string = pick(env.VITE_SOCKET_BASE_URL, wsOrigin)
export const SOCKET_ALTERNATIVE_BASE_URL: string = pick(env.VITE_SOCKET_ALTERNATIVE_BASE_URL, SOCKET_BASE_URL)
export const SOCKET_IO_BASE_URL: string = USE_MOCK
  ? env.VITE_SOCKET_IO_BASE_URL_MOCK
  : pick(env.VITE_SOCKET_IO_BASE_URL, origin)
export const MAP_HOST: string = pick(env.VITE_MAP_HOST, 'https://tews-maps-alternative.mnovalbs.com')
