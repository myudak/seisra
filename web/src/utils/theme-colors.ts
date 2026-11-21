/** Read a canvas colour token defined in style.css for the active theme. */
export const themeColor = (
  name: '--wave-stroke' | '--wave-grid' | '--wave-label' | '--pick-p' | '--pick-s' | '--pick-generic',
  fallback: string
) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
