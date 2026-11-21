// Tiny hook point so app code can ask for a preview socket without statically
// importing the preview module (which keeps fixtures out of production bundles).
import type { Socket } from 'socket.io-client'

let socketFactory: (() => Socket) | null = null

export const setPreviewSocketFactory = (factory: () => Socket) => {
  socketFactory = factory
}

export const getPreviewSocketFactory = () => socketFactory
