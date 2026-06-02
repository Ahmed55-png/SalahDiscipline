'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { AzanPlayer } from './AzanPlayer'

type PrayerTime = {
  key: string
  label: string
  /** "HH:MM AM/PM" or "HH:MM" — we parse either */
  time: string
}

type Props = {
  prayers: PrayerTime[]
}

function parsePrayerTime(time: string): { hour: number; minute: number } | null {
  // Accepts "HH:MM", "HH:MM AM/PM", "HH:MM:SS"
  const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm|AM|PM)?/.exec(time)
  if (!m) return null
  let h = Number(m[1])
  const min = Number(m[2])
  const period = m[4]?.toLowerCase()
  if (period === 'am' && h === 12) h = 0
  else if (period === 'pm' && h !== 12) h += 12
  if (h < 0 || h > 23 || min < 0 || min > 59) return null
  return { hour: h, minute: min }
}

function nowKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

export function PrayerTimeWatcher({ prayers }: Props) {
  const [active, setActive] = useState<PrayerTime | null>(null)
  // Track which prayers we've already alerted for today to avoid re-firing
  const firedRef = useRef<Set<string>>(new Set())
  const dayRef = useRef<string>(nowKey())

  useEffect(() => {
    const checkInterval = setInterval(() => {
      const now = new Date()
      const curHour = now.getHours()
      const curMin = now.getMinutes()

      // Reset on new day
      const day = nowKey()
      if (day !== dayRef.current) {
        firedRef.current.clear()
        dayRef.current = day
      }

      for (const p of prayers) {
        const parsed = parsePrayerTime(p.time)
        if (!parsed) continue
        if (parsed.hour === curHour && parsed.minute === curMin) {
          const fireKey = `${day}:${p.key}`
          if (!firedRef.current.has(fireKey)) {
            firedRef.current.add(fireKey)
            setActive(p)
          }
          break
        }
      }
    }, 30_000) // Check every 30s — captures the 1-minute window

    return () => clearInterval(checkInterval)
  }, [prayers])

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="fixed top-4 inset-x-4 sm:inset-x-auto sm:right-4 sm:max-w-sm z-50"
        >
          <div className="relative overflow-hidden rounded-2xl border-2 border-gold/60 bg-gradient-to-br from-emerald-50 via-gold-soft/40 to-emerald-50 dark:from-emerald-deep dark:via-[#0F2A22] dark:to-emerald-deep p-4 shadow-2xl shadow-emerald-deep/40 backdrop-blur-xl">
            <div className="absolute inset-0 islamic-pattern-dense opacity-10 pointer-events-none" />
            <div className="relative flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-gold font-bold">
                  🕌 Adhan Time
                </p>
                <h3 className="text-lg font-bold text-emerald-deep dark:text-emerald-200">
                  {active.label}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActive(null)}
                aria-label="Dismiss"
                className="w-8 h-8 flex items-center justify-center rounded-full border border-emerald-brand/30 hover:bg-emerald-brand/10 text-emerald-deep dark:text-emerald-200 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="relative mt-3">
              <AzanPlayer
                prayerLabel={active.label}
                autoTriggerOnMount
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
