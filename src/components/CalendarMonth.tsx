'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import {
  classifyDay,
  prayedCount,
  type DayStatus,
  type DayStatuses,
} from '@/lib/utils/calendar'

export type MonthCell = {
  date: Date
  iso: string
  inMonth: boolean
  isToday: boolean
  isFuture: boolean
  statuses: DayStatuses | null
}

type Props = {
  year: number
  month: number
  cells: MonthCell[]
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const PRAYER_LABELS: Array<[keyof DayStatuses, string, string]> = [
  ['fajr', 'Fajr', 'الفجر'],
  ['dhuhr', 'Dhuhr', 'الظهر'],
  ['asr', 'Asr', 'العصر'],
  ['maghrib', 'Maghrib', 'المغرب'],
  ['isha', 'Isha', 'العشاء'],
]

const STATUS_CELL: Record<DayStatus, string> = {
  complete:
    'bg-gradient-to-br from-emerald-brand to-emerald-deep text-cream border-emerald-light/60',
  broken:
    'bg-gradient-to-br from-red-500 to-red-700 text-white border-red-400/60',
  partial:
    'bg-gradient-to-br from-gold/80 to-gold/60 text-emerald-deep border-gold',
  today:
    'bg-white dark:bg-[#0F2A22] text-emerald-deep dark:text-emerald-200 border-gold ring-2 ring-gold/50',
  none:
    'bg-white/60 dark:bg-zinc-800/30 text-zinc-500 dark:text-zinc-500 border-zinc-300/30 dark:border-zinc-700/40',
  future:
    'bg-transparent text-zinc-400 dark:text-zinc-600 border-dashed border-zinc-300/40',
}

const STATUS_PILL: Record<'prayed' | 'missed' | 'pending', string> = {
  prayed:
    'bg-emerald-brand/15 text-emerald-700 dark:text-emerald-300 border border-emerald-light/40',
  missed: 'bg-red-500/15 text-red-700 dark:text-red-300 border border-red-400/40',
  pending: 'bg-zinc-200/40 dark:bg-zinc-800/40 text-zinc-500 border border-zinc-300/30',
}

export function CalendarMonth({ cells }: Props) {
  const [selectedIso, setSelectedIso] = useState<string | null>(null)
  const selected = cells.find((c) => c.iso === selectedIso) ?? null

  return (
    <section className="space-y-4">
      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="text-center text-[10px] uppercase tracking-widest font-semibold text-gold/80 dark:text-gold-light/70"
          >
            {w}
          </div>
        ))}
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {cells.map((c, idx) => {
          const status = classifyDay(c.statuses, c.isFuture, c.isToday)
          const count = prayedCount(c.statuses)
          const isSelected = selected?.iso === c.iso
          return (
            <motion.button
              key={c.iso}
              type="button"
              onClick={() => setSelectedIso(c.iso === selectedIso ? null : c.iso)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: c.inMonth ? 1 : 0.45, scale: 1 }}
              transition={{ delay: Math.min(idx, 28) * 0.015, duration: 0.3 }}
              whileTap={{ scale: 0.92 }}
              className={`aspect-square flex flex-col items-center justify-center rounded-md border transition-all ${STATUS_CELL[status]} ${isSelected ? 'ring-2 ring-gold scale-105 z-10' : ''}`}
              aria-label={`${c.iso}, ${
                status === 'complete'
                  ? 'all 5 prayed'
                  : status === 'broken'
                    ? 'streak broken'
                    : status === 'partial'
                      ? `${count} of 5 prayed`
                      : status === 'future'
                        ? 'future'
                        : 'no data'
              }`}
            >
              <span className="text-[11px] sm:text-xs font-bold leading-none">
                {c.date.getDate()}
              </span>
              {!c.isFuture && (status === 'complete' || status === 'broken' || status === 'partial') && (
                <span className="text-[8px] font-mono mt-0.5 tabular-nums opacity-90">
                  {count}/5
                </span>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Selected day detail */}
      <AnimatePresence mode="wait">
        {selected && (
          <motion.div
            key={selected.iso}
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-gold/40 bg-white/85 dark:bg-[#0F2A22]/85 backdrop-blur-xl p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-emerald-deep dark:text-emerald-200">
                  {selected.date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </h3>
                {selected.isToday && (
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-gold">
                    Today
                  </span>
                )}
              </div>

              {selected.isFuture ? (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 italic">
                  Future date — no data yet.
                </p>
              ) : !selected.statuses ? (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 italic">
                  No prayers recorded for this day.
                </p>
              ) : (
                <ul className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {PRAYER_LABELS.map(([key, label, arabic]) => {
                    const s = selected.statuses![key]
                    return (
                      <li
                        key={key}
                        className={`flex flex-col items-center rounded-lg px-2 py-2 ${STATUS_PILL[s]}`}
                      >
                        <span className="text-xs font-semibold">{label}</span>
                        <span
                          className="text-[10px]"
                          style={{ fontFamily: 'var(--font-amiri)' }}
                        >
                          {arabic}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider mt-1 opacity-80">
                          {s}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
