import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  getMonthGrid,
  isoMonthBounds,
  monthName,
  startOfDay,
  toIsoDate,
  type DayStatuses,
} from '@/lib/utils/calendar'
import { CalendarMonth, type MonthCell } from '@/components/CalendarMonth'

type SearchParams = Promise<{ month?: string }>

function parseMonthParam(raw: string | undefined): { year: number; month: number } {
  const now = new Date()
  if (!raw) return { year: now.getFullYear(), month: now.getMonth() + 1 }
  const m = /^(\d{4})-(\d{2})$/.exec(raw)
  if (!m) return { year: now.getFullYear(), month: now.getMonth() + 1 }
  const year = Number(m[1])
  const month = Number(m[2])
  if (year < 1900 || year > 2100 || month < 1 || month > 12) {
    return { year: now.getFullYear(), month: now.getMonth() + 1 }
  }
  return { year, month }
}

function shiftMonth(year: number, month: number, delta: number) {
  const d = new Date(year, month - 1 + delta, 1)
  return { year: d.getFullYear(), month: d.getMonth() + 1 }
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const { year, month } = parseMonthParam(params.month)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { start, endExclusive } = isoMonthBounds(year, month)

  const { data: prayers } = await supabase
    .from('daily_prayers')
    .select('prayer_date, fajr, dhuhr, asr, maghrib, isha')
    .eq('user_id', user.id)
    .gte('prayer_date', start)
    .lt('prayer_date', endExclusive)

  const byDate = new Map<string, DayStatuses>()
  for (const row of prayers ?? []) {
    byDate.set(row.prayer_date as string, {
      fajr: row.fajr,
      dhuhr: row.dhuhr,
      asr: row.asr,
      maghrib: row.maghrib,
      isha: row.isha,
    })
  }

  const today = startOfDay(new Date())
  const todayIso = toIsoDate(today)

  const cells: MonthCell[] = getMonthGrid(year, month).map((date) => {
    const iso = toIsoDate(date)
    const inMonth = date.getMonth() === month - 1
    const isFuture = date.getTime() > today.getTime()
    const isToday = iso === todayIso
    return {
      date,
      iso,
      inMonth,
      isToday,
      isFuture,
      statuses: byDate.get(iso) ?? null,
    }
  })

  const prev = shiftMonth(year, month, -1)
  const next = shiftMonth(year, month, +1)
  const prevHref = `/calendar?month=${prev.year}-${String(prev.month).padStart(2, '0')}`
  const nextHref = `/calendar?month=${next.year}-${String(next.month).padStart(2, '0')}`

  // Stats for this month
  const monthCells = cells.filter((c) => c.inMonth && !c.isFuture)
  const completeDays = monthCells.filter((c) => {
    if (!c.statuses) return false
    return (
      c.statuses.fajr === 'prayed' &&
      c.statuses.dhuhr === 'prayed' &&
      c.statuses.asr === 'prayed' &&
      c.statuses.maghrib === 'prayed' &&
      c.statuses.isha === 'prayed'
    )
  }).length
  const trackedDays = monthCells.filter((c) => c.statuses !== null).length

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 islamic-pattern opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cream/40 to-cream dark:via-[#0A1F1A]/40 dark:to-[#0A1F1A] pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pt-2">
          <Link
            href="/dashboard"
            className="text-xs uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:text-emerald-deep dark:hover:text-emerald-300 transition-colors"
          >
            ← Dashboard
          </Link>
          <p
            className="text-sm text-gold-light"
            style={{ fontFamily: 'var(--font-amiri)' }}
          >
            تَقْوِيم
          </p>
        </div>

        {/* Month nav */}
        <div className="rounded-2xl border border-gold/30 bg-white/85 dark:bg-[#0F2A22]/85 backdrop-blur-xl p-4 sm:p-5 shadow-lg shadow-emerald-deep/5">
          <div className="flex items-center justify-between">
            <Link
              href={prevHref}
              aria-label="Previous month"
              className="w-9 h-9 flex items-center justify-center rounded-full border border-emerald-brand/30 hover:bg-emerald-brand/10 transition-colors text-emerald-deep dark:text-emerald-200"
            >
              ‹
            </Link>
            <div className="text-center">
              <h1 className="text-xl font-bold text-emerald-deep dark:text-emerald-200">
                {monthName(month)}
              </h1>
              <p className="text-xs uppercase tracking-widest text-gold dark:text-gold-light/80 font-semibold mt-0.5">
                {year}
              </p>
            </div>
            <Link
              href={nextHref}
              aria-label="Next month"
              className="w-9 h-9 flex items-center justify-center rounded-full border border-emerald-brand/30 hover:bg-emerald-brand/10 transition-colors text-emerald-deep dark:text-emerald-200"
            >
              ›
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-light/30 px-3 py-2">
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">
                {completeDays}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-emerald-700/80 dark:text-emerald-300/80 font-semibold">
                Complete Days
              </p>
            </div>
            <div className="rounded-lg bg-gold-soft/30 dark:bg-gold/10 border border-gold/30 px-3 py-2">
              <p className="text-2xl font-bold text-gold tabular-nums">
                {trackedDays}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-gold/80 font-semibold">
                Tracked Days
              </p>
            </div>
          </div>
        </div>

        {/* Calendar grid */}
        <div className="rounded-2xl border border-emerald-brand/20 dark:border-emerald-light/10 bg-white/85 dark:bg-[#0F2A22]/85 backdrop-blur-xl p-4 sm:p-5 shadow-lg shadow-emerald-deep/5">
          <CalendarMonth year={year} month={month} cells={cells} />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 pb-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-brand" /> Complete
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-gold" /> Partial
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-500" /> Broken
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-zinc-400/60" /> No data
          </span>
        </div>
      </div>
    </main>
  )
}
