'use client'

import { useEffect, useState, type ReactNode } from 'react'

type Mode = 'translation' | 'mushaf'
const STORAGE_KEY = 'salah:quran-mode-v1'

type Props = {
  children: ReactNode
}

/**
 * Wraps Quran reading content with a sticky toggle.
 * In "mushaf" mode, any descendant tagged with [data-urdu-block]
 * is hidden via the global CSS rule in globals.css.
 *
 * The mode preference is persisted to localStorage.
 */
export function ReadingMode({ children }: Props) {
  const [mode, setMode] = useState<Mode>('translation')
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw === 'mushaf' || raw === 'translation') setMode(raw)
    } catch {
      /* ignore */
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, mode)
    } catch {
      /* ignore */
    }
  }, [mode, hydrated])

  return (
    <div data-quran-mode={mode}>
      <div className="sticky top-2 z-20 flex justify-center">
        <div className="inline-flex rounded-full border border-gold/40 bg-white/90 dark:bg-[#0F2A22]/90 backdrop-blur-md p-1 shadow-lg shadow-emerald-deep/10">
          <ModeButton active={mode === 'translation'} onClick={() => setMode('translation')}>
            Translation
          </ModeButton>
          <ModeButton active={mode === 'mushaf'} onClick={() => setMode('mushaf')}>
            Mushaf
          </ModeButton>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  )
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest transition-colors ${
        active
          ? 'bg-emerald-brand text-cream shadow'
          : 'text-emerald-deep dark:text-emerald-200 hover:bg-emerald-brand/10'
      }`}
    >
      {children}
    </button>
  )
}
