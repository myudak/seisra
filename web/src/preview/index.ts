import api from '@src/utils/api'
import axios from 'axios'
import Cookies from 'js-cookie'
import type { Socket } from 'socket.io-client'

import { patchWebSocket, PreviewSocketIO } from './fake-sockets'
import { previewAdapter } from './mock-adapter'
import { setPreviewSocketFactory } from './registry'

export const installPreview = () => {
  // Every HTTP request (shared `api` instance and bare `axios` calls) is answered locally.
  axios.defaults.adapter = previewAdapter
  api.defaults.adapter = previewAdapter

  patchWebSocket()
  setPreviewSocketFactory(() => new PreviewSocketIO() as unknown as Socket)

  // Signed in automatically once per tab; "Logout" then shows the real login page,
  // and any username/password signs back in.
  if (!sessionStorage.getItem('preview-booted')) {
    sessionStorage.setItem('preview-booted', '1')
    Cookies.set('access_token', 'preview-token', { expires: 1 })
  }

  console.info(
    '%cUI preview mode%c fixture data only — no requests reach the backend.',
    'background:#2563eb;color:#fff;padding:2px 6px;border-radius:4px',
    ''
  )
}
