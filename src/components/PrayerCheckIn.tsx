'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { markPrayerAction } from '@/app/dashboard/actions'
import type { PrayerStatus } from '@/types/database'

type PrayerRow = {
  key: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'
  label: 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha'
  arabic: string
  time: string
  status: PrayerStatus
}

type Props = {
  prayers: PrayerRow[]
}

const STATUS_BORDER: Record<PrayerStatus, string> = {
  prayed:
    'border-emerald-light/60 bg-gradient-to-r from-emerald-50 to-emerald-100/40 dark:from-emerald-950/40 dark:to-emerald-900/20',
  missed:
    'border-red-400/60 bg-gradient-to-r from-red-50 to-red-100/40 dark:from-red-950/40 dark:to-red-900/20',
  pending:
    'border-zinc-200 dark:border-emerald-light/10 bg-white/70 dark:bg-[#0F2A22]/60',
}

const STATUS_LABEL: Record<PrayerStatus, string> = {
  prayed: 'Prayed',
  missed: 'Missed',
  pending: '—',
}

export function PrayerCheckIn({ prayers }: Props) {
  const allPrayed = prayers.every((p) => p.status === 'prayed')
  const anyMissed = prayers.some((p) => p.status === 'missed')

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-2xl border border-emerald-brand/20 dark:border-emerald-light/10 bg-white/90 dark:bg-[#0F2A22]/85 backdrop-blur-xl p-6 shadow-lg shadow-emerald-deep/5"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-emerald-deep dark:text-emerald-300">
          Today&apos;s Check-In
        </h2>
        <p className="text-[10px] uppercase tracking-widest text-gold dark:text-gold-light/80 font-semibold">
          Tap to mark
        </p>
      </div>

      <AnimatePresence mode="wait">
        {allPrayed && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.92, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 250, damping: 22 }}
            className="relative mt-4 overflow-hidden rounded-xl border border-gold/50 bg-gradient-to-br from-gold-soft/60 via-gold-soft/40 to-emerald-50 dark:from-gold/20 dark:via-emerald-deep/40 dark:to-emerald-deep/60 px-5 py-4"
          >
            {/* Sparkles */}
            <span className="absolute top-2 right-3 text-base sparkle" aria-hidden>
              ✨
            </span>
            <span
              className="absolute bottom-2 left-3 text-sm sparkle"
              style={{ animationDelay: '0.4s' }}
              aria-hidden
            >
              ✨
            </span>
            <span
              className="absolute top-3 left-1/3 text-xs sparkle"
              style={{ animationDelay: '0.8s' }}
              aria-hidden
            >
              ⭐
            </span>
            <p className="text-center font-bold text-emerald-deep dark:text-gold-soft text-lg">
              🎉 Maashallah — Today complete!
            </p>
            <p className="text-center text-xs text-emerald-deep/80 dark:text-gold-soft/90 mt-1">
              Streak counted · See you tomorrow
            </p>
          </motion.div>
        )}

        {anyMissed && !allPrayed && (
          <motion.div
            key="missed"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-4 rounded-xl border border-red-400/40 bg-red-50 dark:bg-red-950/30 px-4 py-2 text-center"
          >
            <p className="text-xs text-red-700 dark:text-red-300">
              Streak broken — start fresh tomorrow.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <ul className="mt-5 space-y-2.5">
        {prayers.map((p, idx) => (
          <motion.li
            key={p.key}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + idx * 0.05, duration: 0.4 }}
            className={`group relative flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-all duration-300 ${STATUS_BORDER[p.status]}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex flex-col">
                <span className="font-semibold text-emerald-deep dark:text-emerald-200">
                  {p.label}
                </span>
                <span
                  className="text-xs text-gold/80 dark:text-gold-light/70"
                  style={{ fontFamily: 'var(--font-amiri)' }}
                >
                  {p.arabic}
                </span>
              </div>
              <span className="ml-3 font-mono text-sm text-emerald-deep/60 dark:text-emerald-300/60 tabular-nums">
                {p.time}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 hidden sm:inline">
                {STATUS_LABEL[p.status]}
              </span>
              <form action={markPrayerAction}>
                <input type="hidden" name="prayer" value={p.key} />
                <input
                  type="hidden"
                  name="status"
                  value={p.status === 'prayed' ? 'pending' : 'prayed'}
                />
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  whileHover={{ scale: 1.1 }}
                  type="submit"
                  aria-label={`Mark ${p.label} prayed`}
                  className={`relative w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                    p.status === 'prayed'
                      ? 'bg-emerald-brand text-white shadow-md shadow-emerald-brand/40'
                      : 'bg-white dark:bg-[#0A1F1A] border-2 border-emerald-light/50 text-emerald-brand dark:text-emerald-light hover:border-emerald-light'
                  }`}
                >
                  ✓
                </motion.button>
              </form>
              <form action={markPrayerAction}>
                <input type="hidden" name="prayer" value={p.key} />
                <input
                  type="hidden"
                  name="status"
                  value={p.status === 'missed' ? 'pending' : 'missed'}
                />
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  whileHover={{ scale: 1.1 }}
                  type="submit"
                  aria-label={`Mark ${p.label} missed`}
                  className={`relative w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                    p.status === 'missed'
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/40'
                      : 'bg-white dark:bg-[#0A1F1A] border-2 border-red-400/50 text-red-500 dark:text-red-400 hover:border-red-400'
                  }`}
                >
                  ✗
                </motion.button>
              </form>
            </div>
          </motion.li>
        ))}
      </ul>

      <p className="mt-5 text-center text-[11px] text-zinc-500 dark:text-zinc-400 italic">
        5/5 prayed = streak +1 · Any missed = streak resets
      </p>
    </motion.section>
  )
}
