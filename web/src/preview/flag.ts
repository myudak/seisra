/**
 * UI preview mode: run the frontend with fixture data and no backend.
 *
 * On only when Vite runs in `--mode preview` (dev server `npm run dev:preview`, or the
 * bundled `npm run build:preview` used for sharing over a tunnel) with VITE_UI_PREVIEW=true.
 * The normal production build (`vite build`, mode "production") always evaluates this to
 * `false`, so the preview code is dropped from that bundle.
 */
export const IS_PREVIEW: boolean = import.meta.env.MODE === 'preview' && import.meta.env.VITE_UI_PREVIEW === 'true'
