'use client'

import { motion } from 'framer-motion'
import { AnimatedNumber } from './AnimatedNumber'

type Props = {
  current: number
  longest: number
}

export function StreakCard({ current, longest }: Props) {
  const hasStreak = current > 0
  return (
    <motion.section
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-2xl border border-gold/30 dark:border-gold/20 bg-gradient-to-br from-white via-white to-gold-soft/30 dark:from-[#0F2A22] dark:via-[#0F2A22] dark:to-emerald-deep/40 p-6 shadow-lg shadow-emerald-deep/5"
    >
      <div className="absolute inset-0 islamic-pattern-dense opacity-[0.06] pointer-events-none" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-emerald-deep dark:text-emerald-300/80">
            Current Streak
          </h2>
          {longest > 0 && (
            <div className="text-[10px] font-medium uppercase tracking-wider text-gold/80 dark:text-gold-light/70">
              Longest · <span className="font-bold text-gold">{longest}</span>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-baseline gap-3">
          {hasStreak && (
            <motion.span
              className="text-5xl flame-pulse"
              aria-hidden
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.15 }}
            >
              🔥
            </motion.span>
          )}
          <AnimatedNumber
            value={current}
            className="text-6xl font-extrabold bg-gradient-to-br from-emerald-600 via-emerald-400 to-emerald-700 dark:from-emerald-300 dark:via-emerald-200 dark:to-emerald-400 bg-clip-text text-transparent tabular-nums leading-none"
          />
          <span className="text-sm font-medium text-emerald-deep/70 dark:text-emerald-300/70">
            {current === 1 ? 'day' : 'days'}
          </span>
        </div>

        {!hasStreak && (
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            Aaj 5 ki 5 namazein parho — streak start karo.
          </p>
        )}
      </div>
    </motion.section>
  )
}
