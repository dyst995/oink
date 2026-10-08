export type ThemePreference = 'system' | 'light' | 'dark'

const STORAGE_KEY = 'unfret-theme'

export function getTheme(): ThemePreference {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    if (value === 'light' || value === 'dark' || value === 'system') return value
  } catch {
    /* ignore */
  }
  return 'system'
}

export function setTheme(theme: ThemePreference) {
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    /* ignore */
  }
  applyTheme(theme)
  window.dispatchEvent(new CustomEvent('unfret-theme'))
}

export function applyTheme(theme: ThemePreference = getTheme()) {
  const root = document.documentElement
  if (theme === 'system') {
    root.removeAttribute('data-theme')
  } else {
    root.setAttribute('data-theme', theme)
  }
}

export function subscribeTheme(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener()
  }
  window.addEventListener('unfret-theme', listener)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener('unfret-theme', listener)
    window.removeEventListener('storage', onStorage)
  }
}
