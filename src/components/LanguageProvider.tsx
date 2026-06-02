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
import { STRINGS, isLang, type Lang } from '@/lib/i18n/strings'

const STORAGE_KEY = 'salah:lang'

type Ctx = {
  lang: Lang
  setLang: (l: Lang) => void
  toggle: () => void
  t: (key: string) => string
  isUrdu: boolean
}

const LanguageContext = createContext<Ctx | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  // Load saved choice on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (isLang(saved)) setLangState(saved)
    } catch {
      // ignore (private mode etc.)
    }
  }, [])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try {
      localStorage.setItem(STORAGE_KEY, l)
    } catch {
      // ignore
    }
  }, [])

  const toggle = useCallback(() => {
    setLang(lang === 'en' ? 'ur' : 'en')
  }, [lang, setLang])

  const t = useCallback(
    (key: string) => STRINGS[lang][key] ?? STRINGS.en[key] ?? key,
    [lang]
  )

  const value = useMemo<Ctx>(
    () => ({ lang, setLang, toggle, t, isUrdu: lang === 'ur' }),
    [lang, setLang, toggle, t]
  )

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  )
}

export function useLanguage(): Ctx {
  const ctx = useContext(LanguageContext)
  if (!ctx)
    throw new Error('useLanguage must be used inside <LanguageProvider>')
  return ctx
}
