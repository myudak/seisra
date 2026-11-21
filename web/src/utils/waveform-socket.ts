import { SOCKET_IO_BASE_URL } from '@src/constants/env'
import { IS_PREVIEW } from '@src/preview/flag'
import { getPreviewSocketFactory } from '@src/preview/registry'
import { io, ManagerOptions, SocketOptions } from 'socket.io-client'

/** Waveform Socket.IO connection; a simulated stream in UI preview mode. */
export const createWaveformSocket = (options: Partial<ManagerOptions & SocketOptions>) => {
  const previewFactory = IS_PREVIEW ? getPreviewSocketFactory() : null
  return previewFactory ? previewFactory() : io(SOCKET_IO_BASE_URL, options)
}
