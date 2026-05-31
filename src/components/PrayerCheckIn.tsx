import { markPrayerAction } from '@/app/dashboard/actions'
import type { PrayerStatus } from '@/types/database'

type PrayerRow = {
  key: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'
  label: 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha'
  time: string
  status: PrayerStatus
}

type Props = {
  prayers: PrayerRow[]
}

const STATUS_STYLES: Record<PrayerStatus, string> = {
  prayed:
    'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300',
  missed:
    'border-red-400 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300',
  pending:
    'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400',
}

const STATUS_LABEL: Record<PrayerStatus, string> = {
  prayed: 'Prayed',
  missed: 'Missed',
  pending: 'Pending',
}

export function PrayerCheckIn({ prayers }: Props) {
  const allPrayed = prayers.every((p) => p.status === 'prayed')
  const anyMissed = prayers.some((p) => p.status === 'missed')

  return (
    <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
          Today&apos;s Check-In
        </h2>
        <p className="text-xs text-zinc-500">Tap to mark</p>
      </div>

      {allPrayed && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3 text-center">
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            🎉 Maashallah — Today complete!
          </p>
          <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80 mt-0.5">
            Streak counted. Kal ki tayari karein.
          </p>
        </div>
      )}

      {anyMissed && !allPrayed && (
        <div className="rounded-lg border border-red-400/30 bg-red-50 dark:bg-red-950/30 px-4 py-2 text-center">
          <p className="text-xs text-red-700 dark:text-red-300">
            Streak break — kal se naye sirey se shuru kar sakte hain.
          </p>
        </div>
      )}

      <ul className="space-y-2">
        {prayers.map((p) => (
          <li
            key={p.key}
            className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 ${STATUS_STYLES[p.status]}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-medium w-16">{p.label}</span>
              <span className="font-mono text-xs opacity-70">{p.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs opacity-70 hidden sm:inline">
                {STATUS_LABEL[p.status]}
              </span>
              <form action={markPrayerAction}>
                <input type="hidden" name="prayer" value={p.key} />
                <input
                  type="hidden"
                  name="status"
                  value={p.status === 'prayed' ? 'pending' : 'prayed'}
                />
                <button
                  type="submit"
                  aria-label={`Mark ${p.label} prayed`}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    p.status === 'prayed'
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-white dark:bg-zinc-800 border border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                  }`}
                >
                  ✓
                </button>
              </form>
              <form action={markPrayerAction}>
                <input type="hidden" name="prayer" value={p.key} />
                <input
                  type="hidden"
                  name="status"
                  value={p.status === 'missed' ? 'pending' : 'missed'}
                />
                <button
                  type="submit"
                  aria-label={`Mark ${p.label} missed`}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    p.status === 'missed'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-white dark:bg-zinc-800 border border-red-400 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50'
                  }`}
                >
                  ✗
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>

      <p className="text-xs text-zinc-500 text-center pt-1">
        5 ki 5 prayed = streak +1 · Koi missed = streak reset
      </p>
    </section>
  )
}
