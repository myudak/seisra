import { useMediaQuery } from '@vueuse/core'
import { computed, ref, watchEffect } from 'vue'

export type ThemePreference = 'light' | 'dark' | 'system'

export const THEME_STORAGE_KEY = 'seisra-theme'
const THEMES = { light: 'seisra', dark: 'seisra-dark' } as const

const readPreference = (): ThemePreference => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  } catch {
    // storage unavailable: fall back to system
  }
  return 'system'
}

// Module-level state: one preference shared by every component.
const preference = ref<ThemePreference>(readPreference())
const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')

const resolved = computed<'light' | 'dark'>(() =>
  preference.value === 'system' ? (prefersDark.value ? 'dark' : 'light') : preference.value
)

watchEffect(() => {
  document.documentElement.dataset.theme = THEMES[resolved.value]
  document.documentElement.style.colorScheme = resolved.value
})

const ORDER: ThemePreference[] = ['light', 'dark', 'system']

export const useTheme = () => {
  const setPreference = (value: ThemePreference) => {
    preference.value = value
    try {
      localStorage.setItem(THEME_STORAGE_KEY, value)
    } catch {
      // ignore
    }
  }

  const cycle = () => setPreference(ORDER[(ORDER.indexOf(preference.value) + 1) % ORDER.length])

  return { preference, resolved, setPreference, cycle }
}
