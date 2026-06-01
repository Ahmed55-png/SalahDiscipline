'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import {
  getMonthGrid,
  isoMonthBounds,
  monthName,
  startOfDay,
  toIsoDate,
  type DayStatuses,
} from '@/lib/utils/calendar'
import { CalendarMonth, type MonthCell } from './CalendarMonth'

type Props = {
  open: boolean
  onClose: () => void
}

export function CalendarDrawer({ open, onClose }: Props) {
  const now = startOfDay(new Date())
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [byDate, setByDate] = useState<Map<string, DayStatuses>>(new Map())
  const [loading, setLoading] = useState(false)

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // ESC to close
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Fetch month data whenever month changes (or drawer opens)
  useEffect(() => {
    if (!open) return
    let cancelled = false
    const fetchMonth = async () => {
      setLoading(true)
      const supabase = createClient()
      const { start, endExclusive } = isoMonthBounds(year, month)
      const { data: rows } = await supabase
        .from('daily_prayers')
        .select('prayer_date, fajr, dhuhr, asr, maghrib, isha')
        .gte('prayer_date', start)
        .lt('prayer_date', endExclusive)
      if (cancelled) return
      const map = new Map<string, DayStatuses>()
      for (const row of rows ?? []) {
        map.set(row.prayer_date as string, {
          fajr: row.fajr,
          dhuhr: row.dhuhr,
          asr: row.asr,
          maghrib: row.maghrib,
          isha: row.isha,
        })
      }
      setByDate(map)
      setLoading(false)
    }
    fetchMonth()
    return () => {
      cancelled = true
    }
  }, [open, year, month])

  const today = startOfDay(new Date())
  const todayIso = toIsoDate(today)

  const cells: MonthCell[] = getMonthGrid(year, month).map((date) => {
    const iso = toIsoDate(date)
    return {
      date,
      iso,
      inMonth: date.getMonth() === month - 1,
      isToday: iso === todayIso,
      isFuture: date.getTime() > today.getTime(),
      statuses: byDate.get(iso) ?? null,
    }
  })

  const monthCells = cells.filter((c) => c.inMonth && !c.isFuture)
  const completeDays = monthCells.filter((c) => {
    const s = c.statuses
    if (!s) return false
    return (
      s.fajr === 'prayed' &&
      s.dhuhr === 'prayed' &&
      s.asr === 'prayed' &&
      s.maghrib === 'prayed' &&
      s.isha === 'prayed'
    )
  }).length
  const trackedDays = monthCells.filter((c) => c.statuses !== null).length

  const shiftMonth = (delta: number) => {
    const d = new Date(year, month - 1 + delta, 1)
    setYear(d.getFullYear())
    setMonth(d.getMonth() + 1)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-emerald-deep/40 backdrop-blur-sm z-40"
            aria-hidden
          />

          {/* Drawer */}
          <motion.aside
            key="drawer"
            role="dialog"
            aria-label="Calendar"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 36 }}
            className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-md bg-cream dark:bg-[#0A1F1A] border-l border-gold/30 shadow-2xl shadow-emerald-deep/40 overflow-y-auto"
          >
            {/* Subtle pattern backdrop */}
            <div className="absolute inset-0 islamic-pattern opacity-30 pointer-events-none" />

            <div className="relative p-4 sm:p-5 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-emerald-deep dark:text-emerald-200">
                    Calendar
                  </h2>
                  <p
                    className="text-xs text-gold-light"
                    style={{ fontFamily: 'var(--font-amiri)' }}
                  >
                    تَقْوِيم
                  </p>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close calendar"
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-emerald-brand/30 hover:bg-emerald-brand/10 text-emerald-deep dark:text-emerald-200 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Month navigation */}
              <div className="rounded-xl border border-gold/30 bg-white/85 dark:bg-[#0F2A22]/85 backdrop-blur-xl p-3">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => shiftMonth(-1)}
                    aria-label="Previous month"
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-emerald-brand/30 hover:bg-emerald-brand/10 text-emerald-deep dark:text-emerald-200 transition-colors"
                  >
                    ‹
                  </button>
                  <div className="text-center">
                    <p className="text-base font-bold text-emerald-deep dark:text-emerald-200">
                      {monthName(month)}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-gold dark:text-gold-light/80 font-semibold">
                      {year}
                    </p>
                  </div>
                  <button
                    onClick={() => shiftMonth(+1)}
                    aria-label="Next month"
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-emerald-brand/30 hover:bg-emerald-brand/10 text-emerald-deep dark:text-emerald-200 transition-colors"
                  >
                    ›
                  </button>
                </div>

                {/* Stats */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-light/30 px-2 py-1.5 text-center">
                    <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300 tabular-nums leading-none">
                      {completeDays}
                    </p>
                    <p className="text-[9px] uppercase tracking-wider text-emerald-700/80 dark:text-emerald-300/80 font-semibold mt-0.5">
                      Complete
                    </p>
                  </div>
                  <div className="rounded-lg bg-gold-soft/30 dark:bg-gold/10 border border-gold/30 px-2 py-1.5 text-center">
                    <p className="text-xl font-bold text-gold tabular-nums leading-none">
                      {trackedDays}
                    </p>
                    <p className="text-[9px] uppercase tracking-wider text-gold/80 font-semibold mt-0.5">
                      Tracked
                    </p>
                  </div>
                </div>
              </div>

              {/* Calendar */}
              <div className="rounded-xl border border-emerald-brand/20 dark:border-emerald-light/10 bg-white/85 dark:bg-[#0F2A22]/85 backdrop-blur-xl p-3">
                {loading && (
                  <p className="text-center text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                    Loading…
                  </p>
                )}
                <CalendarMonth year={year} month={month} cells={cells} />
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center justify-center gap-2 text-[9px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 pb-2">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-sm bg-emerald-brand" />
                  Complete
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-sm bg-gold" />
                  Partial
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-sm bg-red-500" />
                  Broken
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-sm bg-zinc-400/60" />
                  No data
                </span>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
