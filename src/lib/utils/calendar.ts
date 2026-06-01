import type { PrayerStatus } from '@/types/database'

export type DayStatuses = {
  fajr: PrayerStatus
  dhuhr: PrayerStatus
  asr: PrayerStatus
  maghrib: PrayerStatus
  isha: PrayerStatus
}

export type DayStatus = 'complete' | 'broken' | 'partial' | 'none' | 'future' | 'today'

const PRAYER_KEYS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const

export function prayedCount(statuses: DayStatuses | null | undefined): number {
  if (!statuses) return 0
  return PRAYER_KEYS.filter((k) => statuses[k] === 'prayed').length
}

export function classifyDay(
  statuses: DayStatuses | null | undefined,
  isFuture: boolean,
  isToday: boolean = false
): DayStatus {
  if (isFuture) return 'future'
  if (!statuses) return isToday ? 'today' : 'none'
  const vals = PRAYER_KEYS.map((k) => statuses[k])
  if (vals.every((v) => v === 'prayed')) return 'complete'
  if (vals.some((v) => v === 'missed')) return 'broken'
  if (vals.some((v) => v === 'prayed')) return 'partial'
  return isToday ? 'today' : 'none'
}

export function toIsoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function fromIsoDate(iso: string): Date {
  return new Date(`${iso}T00:00:00`)
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

export function startOfDay(d: Date): Date {
  const r = new Date(d)
  r.setHours(0, 0, 0, 0)
  return r
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/** Returns 7 dates: today-6, today-5, … today */
export function last7Days(today: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(today, i - 6))
}

const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function weekdayShort(d: Date): string {
  return WEEKDAYS_SHORT[d.getDay()]
}

/**
 * Returns the 6-week grid (42 cells) for a calendar month view.
 * Grid starts on Sunday of the week containing the 1st of the month.
 */
export function getMonthGrid(year: number, month1to12: number): Date[] {
  const firstDay = new Date(year, month1to12 - 1, 1)
  const firstWeekday = firstDay.getDay()
  const start = addDays(firstDay, -firstWeekday)
  return Array.from({ length: 42 }, (_, i) => addDays(start, i))
}

export function monthName(month1to12: number): string {
  return new Date(2000, month1to12 - 1, 1).toLocaleString('en-US', { month: 'long' })
}

export function isoMonthBounds(year: number, month1to12: number): {
  start: string
  endExclusive: string
} {
  const start = toIsoDate(new Date(year, month1to12 - 1, 1))
  const endExclusive = toIsoDate(new Date(year, month1to12, 1))
  return { start, endExclusive }
}
