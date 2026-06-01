'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  classifyDay,
  prayedCount,
  type DayStatus,
  type DayStatuses,
} from '@/lib/utils/calendar'

export type WeekDay = {
  iso: string
  weekday: string
  dayNumber: number
  isToday: boolean
  statuses: DayStatuses | null
}

type Props = {
  days: WeekDay[]
}

const STATUS_CELL: Record<DayStatus, string> = {
  complete:
    'bg-gradient-to-br from-emerald-brand to-emerald-deep text-cream border-emerald-light/60 shadow-md shadow-emerald-brand/30',
  broken:
    'bg-gradient-to-br from-red-500 to-red-700 text-white border-red-400/60 shadow-md shadow-red-500/30',
  partial:
    'bg-gradient-to-br from-gold/80 to-gold/60 text-emerald-deep border-gold shadow-md shadow-gold/20',
  today:
    'bg-white dark:bg-[#0F2A22] text-emerald-deep dark:text-emerald-200 border-gold ring-2 ring-gold/50',
  none:
    'bg-white/60 dark:bg-zinc-800/30 text-zinc-500 dark:text-zinc-500 border-zinc-300/40 dark:border-zinc-700/40',
  future:
    'bg-transparent text-zinc-400 dark:text-zinc-600 border-dashed border-zinc-300/40',
}

export function LastWeekStrip({ days }: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-2xl border border-emerald-brand/20 dark:border-emerald-light/10 bg-white/85 dark:bg-[#0F2A22]/85 backdrop-blur-xl p-5 shadow-lg shadow-emerald-deep/5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-emerald-deep dark:text-emerald-200">
            Last 7 Days
          </h2>
          <p className="text-[10px] uppercase tracking-widest text-gold/80 dark:text-gold-light/70 font-semibold">
            Your discipline at a glance
          </p>
        </div>
        <Link
          href="/calendar"
          className="text-[11px] uppercase tracking-widest text-gold dark:text-gold-light font-semibold hover:underline transition-colors"
        >
          Full calendar →
        </Link>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map((d, i) => {
          const status = classifyDay(d.statuses, false, d.isToday)
          const count = prayedCount(d.statuses)
          return (
            <motion.div
              key={d.iso}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.35 }}
              className={`flex flex-col items-center rounded-xl border-2 py-2 px-1 ${STATUS_CELL[status]}`}
            >
              <span className="text-[9px] uppercase tracking-wider opacity-80">
                {d.weekday}
              </span>
              <span className="text-base sm:text-lg font-bold leading-none mt-1">
                {d.dayNumber}
              </span>
              <span className="text-[10px] font-mono mt-1 tabular-nums opacity-90">
                {status === 'future' || status === 'none' ? '—' : `${count}/5`}
              </span>
            </motion.div>
          )
        })}
      </div>

      <div className="mt-3 flex items-center justify-center gap-3 text-[9px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-brand" /> Complete
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-gold" /> Partial
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500" /> Broken
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-zinc-400/60" /> No data
        </span>
      </div>
    </motion.section>
  )
}
