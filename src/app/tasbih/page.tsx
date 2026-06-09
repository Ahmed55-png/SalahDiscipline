'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/components/LanguageProvider'

type Zikr = {
  id: string
  arabic: string
  translit: string
  urdu: string
  english: string
  target: number
}

const ZIKRS: Zikr[] = [
  {
    id: 'subhanallah',
    arabic: 'سُبْحَانَ ٱللَّٰهِ',
    translit: 'SubhanAllah',
    urdu: 'اللہ پاک ہے',
    english: 'Glory be to Allah',
    target: 33,
  },
  {
    id: 'alhamdulillah',
    arabic: 'ٱلْحَمْدُ لِلَّٰهِ',
    translit: 'Alhamdulillah',
    urdu: 'تمام تعریفیں اللہ کے لیے',
    english: 'All praise is for Allah',
    target: 33,
  },
  {
    id: 'allahuakbar',
    arabic: 'ٱللَّٰهُ أَكْبَرُ',
    translit: 'Allahu Akbar',
    urdu: 'اللہ سب سے بڑا ہے',
    english: 'Allah is the greatest',
    target: 34,
  },
  {
    id: 'lailaha',
    arabic: 'لَا إِلَٰهَ إِلَّا ٱللَّٰهُ',
    translit: 'La ilaha illa Allah',
    urdu: 'اللہ کے سوا کوئی معبود نہیں',
    english: 'There is no god but Allah',
    target: 100,
  },
  {
    id: 'astaghfirullah',
    arabic: 'أَسْتَغْفِرُ ٱللَّٰهَ',
    translit: 'Astaghfirullah',
    urdu: 'میں اللہ سے بخشش مانگتا ہوں',
    english: 'I seek forgiveness from Allah',
    target: 100,
  },
]

const STORAGE_KEY = 'salah:tasbih-v1'

type Saved = {
  zikrId: string
  count: number
  rounds: number
}

export default function TasbihPage() {
  const { isUrdu } = useLanguage()
  const [zikrIndex, setZikrIndex] = useState(0)
  const [count, setCount] = useState(0)
  const [rounds, setRounds] = useState(0)
  const [hydrated, setHydrated] = useState(false)
  const [justCompleted, setJustCompleted] = useState(false)
  const beadRef = useRef<HTMLButtonElement | null>(null)

  const zikr = ZIKRS[zikrIndex]
  const target = zikr.target

  // Load persisted state
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const saved = JSON.parse(raw) as Saved
        const idx = ZIKRS.findIndex((z) => z.id === saved.zikrId)
        if (idx >= 0) setZikrIndex(idx)
        if (typeof saved.count === 'number') setCount(saved.count)
        if (typeof saved.rounds === 'number') setRounds(saved.rounds)
      }
    } catch {
      /* ignore */
    }
    setHydrated(true)
  }, [])

  // Persist
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ zikrId: zikr.id, count, rounds })
      )
    } catch {
      /* ignore */
    }
  }, [hydrated, zikr.id, count, rounds])

  const handleTap = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(15)
    }
    setCount((c) => {
      const next = c + 1
      if (next >= target) {
        setRounds((r) => r + 1)
        setJustCompleted(true)
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([60, 40, 60, 40, 100])
        }
        // Auto-reset to 0 to start next round
        setTimeout(() => setJustCompleted(false), 1400)
        return 0
      }
      return next
    })
  }, [target])

  const selectZikr = (i: number) => {
    if (i === zikrIndex) return
    setZikrIndex(i)
    setCount(0)
  }

  const resetAll = () => {
    setCount(0)
    setRounds(0)
  }

  // Spacebar / Enter to count (keyboard accessibility)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === ' ' || e.key === 'Enter') && document.activeElement === beadRef.current) {
        e.preventDefault()
        handleTap()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleTap])

  return (
    <main className="relative min-h-screen overflow-hidden flex flex-col">
      <div className="absolute inset-0 islamic-pattern opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cream/50 to-cream dark:via-[#0A1F1A]/50 dark:to-[#0A1F1A] pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto w-full px-4 py-5 flex flex-col flex-1 gap-5">
        {/* Header */}
        <header className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-xs uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:text-emerald-deep dark:hover:text-emerald-300 transition-colors"
          >
            ← Dashboard
          </Link>
          <div className="text-right">
            <p
              className="text-base text-gold-light"
              style={{ fontFamily: 'var(--font-amiri)' }}
            >
              تَسْبِيح
            </p>
            <p className="text-[10px] uppercase tracking-widest text-gold dark:text-gold-light/80 font-semibold">
              Tasbih
            </p>
          </div>
        </header>

        {/* Zikr selector */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x">
          {ZIKRS.map((z, i) => (
            <button
              key={z.id}
              type="button"
              onClick={() => selectZikr(i)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-colors snap-start ${
                i === zikrIndex
                  ? 'bg-emerald-brand text-cream shadow-md shadow-emerald-brand/30'
                  : 'border border-emerald-brand/30 text-emerald-deep dark:text-emerald-200 hover:bg-emerald-brand/10'
              }`}
            >
              {z.translit}
            </button>
          ))}
        </div>

        {/* Counter display */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-gold/40 bg-gradient-to-br from-gold-soft/30 via-white to-emerald-50/40 dark:from-emerald-deep/60 dark:via-[#0F2A22] dark:to-[#0A1F1A] p-5 shadow-lg shadow-emerald-deep/10"
        >
          <div className="absolute inset-0 islamic-pattern-dense opacity-[0.07] pointer-events-none" />
          <div className="relative flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gold dark:text-gold-light/80 font-semibold">
                Count
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-5xl font-extrabold text-emerald-deep dark:text-emerald-200 tabular-nums leading-none">
                  {count}
                </span>
                <span className="text-sm text-emerald-deep/60 dark:text-emerald-300/60">
                  / {target}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-gold dark:text-gold-light/80 font-semibold">
                Rounds
              </p>
              <p className="text-3xl font-bold text-gold tabular-nums leading-none mt-1">
                {rounds}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative mt-4 h-1.5 rounded-full bg-zinc-200/60 dark:bg-zinc-800/60 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-brand to-gold rounded-full"
              animate={{ width: `${Math.min(100, (count / target) * 100)}%` }}
              transition={{ type: 'spring', stiffness: 240, damping: 28 }}
            />
          </div>
        </motion.div>

        {/* Zikr arabic + translation */}
        <div className="text-center space-y-2">
          <motion.p
            key={zikr.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            dir="rtl"
            lang="ar"
            className="text-3xl sm:text-4xl text-emerald-deep dark:text-gold-soft leading-loose"
            style={{ fontFamily: 'var(--font-amiri)' }}
          >
            {zikr.arabic}
          </motion.p>
          {isUrdu ? (
            <p
              dir="rtl"
              lang="ur"
              className="text-sm text-zinc-700 dark:text-zinc-300"
              style={{ fontFamily: 'var(--font-nastaliq)', lineHeight: 2 }}
            >
              {zikr.urdu}
            </p>
          ) : (
            <p className="text-sm text-zinc-700 dark:text-zinc-300 italic">
              &ldquo;{zikr.english}&rdquo;
            </p>
          )}
        </div>

        {/* The bead — main tap target */}
        <div className="flex-1 flex items-center justify-center min-h-[180px]">
          <motion.button
            ref={beadRef}
            type="button"
            onClick={handleTap}
            whileTap={{ scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="relative group focus:outline-none"
            aria-label="Tap to count"
          >
            {/* Outer glow ring */}
            <div className="absolute inset-0 rounded-full bg-gold/30 blur-2xl group-active:bg-gold/50 transition-colors" />
            {/* Bead body */}
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-gradient-to-br from-gold via-gold-light to-gold flex items-center justify-center shadow-2xl shadow-gold/40 ring-4 ring-emerald-deep/20 group-active:ring-emerald-deep/40 transition-shadow">
              {/* Inner darker circle */}
              <div className="absolute inset-3 rounded-full bg-gradient-to-br from-emerald-deep via-emerald-brand to-emerald-deep flex items-center justify-center">
                {/* Star pattern in center */}
                <svg width="80" height="80" viewBox="0 0 100 100" aria-hidden>
                  <path
                    d="M50 12 L58 26 L74 26 L74 42 L88 50 L74 58 L74 74 L58 74 L50 88 L42 74 L26 74 L26 58 L12 50 L26 42 L26 26 L42 26 Z"
                    fill="none"
                    stroke="#F4D03F"
                    strokeWidth="1.5"
                    opacity="0.6"
                  />
                </svg>
              </div>
            </div>
          </motion.button>
        </div>

        {/* Bottom actions */}
        <div className="flex items-center justify-between gap-3 pb-2">
          <button
            type="button"
            onClick={resetAll}
            className="rounded-full border-2 border-red-400/40 text-red-600 dark:text-red-400 px-4 py-2 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            Reset
          </button>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 text-center">
            Tap the bead to count
          </p>
          <div className="text-[10px] uppercase tracking-widest text-gold dark:text-gold-light/80 font-semibold">
            {count}/{target}
          </div>
        </div>
      </div>

      {/* Round complete celebration */}
      <AnimatePresence>
        {justCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="fixed inset-x-4 bottom-24 sm:left-1/2 sm:right-auto sm:bottom-32 sm:-translate-x-1/2 sm:max-w-sm z-50"
          >
            <div className="rounded-2xl border-2 border-gold/60 bg-gradient-to-br from-gold-soft/80 via-white to-emerald-50 dark:from-gold/20 dark:via-emerald-deep/40 dark:to-emerald-deep/60 p-4 shadow-2xl shadow-emerald-deep/30 text-center">
              <span className="text-2xl flame-pulse inline-block" aria-hidden>
                ✨
              </span>
              <p className="font-bold text-emerald-deep dark:text-gold-soft mt-1">
                MashaAllah — Round complete
              </p>
              <p className="text-xs text-emerald-deep/80 dark:text-gold-soft/90 mt-0.5">
                Total rounds: {rounds}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
