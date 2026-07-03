'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'salah:theme'

type Ctx = {
  theme: Theme
  resolved: 'light' | 'dark'
  setTheme: (t: Theme) => void
  cycle: () => void
}

const ThemeContext = createContext<Ctx | null>(null)

function readSystemPref(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  const resolved = theme === 'system' ? readSystemPref() : theme
  root.classList.remove('light', 'dark')
  root.classList.add(resolved)
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [resolved, setResolved] = useState<'light' | 'dark'>('dark')

  // Initial load: read stored choice + apply
  useEffect(() => {
    let initial: Theme = 'system'
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        initial = saved
      }
    } catch {
      /* ignore */
    }
    applyTheme(initial)
    queueMicrotask(() => {
      setThemeState(initial)
      setResolved(initial === 'system' ? readSystemPref() : initial)
    })
  }, [])

  // Listen to system pref changes when in system mode
  useEffect(() => {
    if (theme !== 'system' || typeof window === 'undefined') return
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      applyTheme('system')
      setResolved(readSystemPref())
    }
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [theme])

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
    applyTheme(t)
    setResolved(t === 'system' ? readSystemPref() : t)
    try {
      localStorage.setItem(STORAGE_KEY, t)
    } catch {
      /* ignore */
    }
  }, [])

  const cycle = useCallback(() => {
    const next: Theme =
      theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
    setTheme(next)
  }, [theme, setTheme])

  const value = useMemo<Ctx>(
    () => ({ theme, resolved, setTheme, cycle }),
    [theme, resolved, setTheme, cycle]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): Ctx {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
