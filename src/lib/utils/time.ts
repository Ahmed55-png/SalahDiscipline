/**
 * Convert a 24-hour HH:MM string to 12-hour with AM/PM.
 * "04:15" -> "04:15 AM"
 * "12:00" -> "12:00 PM"
 * "15:52" -> "03:52 PM"
 * Invalid input is returned unchanged.
 */
export function to12Hour(hhmm: string): string {
  const m = /^(\d{1,2}):(\d{2})/.exec(hhmm)
  if (!m) return hhmm
  const h = Number(m[1])
  const min = m[2]
  if (h < 0 || h > 23) return hhmm
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${String(h12).padStart(2, '0')}:${min} ${period}`
}
