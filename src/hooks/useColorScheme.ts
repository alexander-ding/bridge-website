import { signal } from '@preact/signals'
import { useCallback } from 'preact/hooks'

export enum ColorScheme {
  Light = 'light',
  Dark = 'dark',
}

const colorSchemeStorageName = 'ading-color-scheme'

const prefersDark =
  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
const settings = localStorage.getItem(colorSchemeStorageName) || 'auto'
const initialScheme =
  settings === ColorScheme.Dark ||
  (prefersDark && settings !== ColorScheme.Light)
    ? ColorScheme.Dark
    : ColorScheme.Light
const scheme = signal(initialScheme)

// not really a hook lol
function useColorScheme(): [ColorScheme, (c: ColorScheme) => void] {
  const updateScheme = useCallback(
    (newScheme: ColorScheme) => {
      scheme.value = newScheme
      localStorage.setItem(colorSchemeStorageName, newScheme)
      document.documentElement.classList.toggle(
        'dark',
        newScheme === ColorScheme.Dark ? true : false,
      )
    },
    [scheme],
  )
  return [scheme.value, updateScheme]
}

export default useColorScheme
