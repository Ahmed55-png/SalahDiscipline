import { createClient } from '@/lib/supabase/server'
import { getTimingsByCity } from '@/lib/api/aladhan'
import { redirect } from 'next/navigation'
import { logoutAction } from './actions'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, city, country, calculation_method')
    .eq('id', user.id)
    .single()

  const { data: streak } = await supabase
    .from('streaks')
    .select('current_streak, longest_streak')
    .eq('user_id', user.id)
    .single()

  const city = profile?.city ?? 'Karachi'
  const country = profile?.country ?? 'Pakistan'
  const method = profile?.calculation_method ?? 1

  let prayerData: Awaited<ReturnType<typeof getTimingsByCity>> | null = null
  try {
    prayerData = await getTimingsByCity(city, country, method)
  } catch {
    // ignore, show fallback
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Assalamu alaikum, {profile?.username ?? 'friend'}
            </h1>
            <p className="text-sm text-zinc-500">
              {city}, {country}
            </p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              Logout
            </button>
          </form>
        </header>

        <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
          <h2 className="text-sm font-medium text-zinc-500 mb-1">Current Streak</h2>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
              {streak?.current_streak ?? 0}
            </span>
            <span className="text-sm text-zinc-500">days</span>
            {streak?.longest_streak ? (
              <span className="text-xs text-zinc-400 ml-auto">
                Longest: {streak.longest_streak}
              </span>
            ) : null}
          </div>
        </section>

        {prayerData && (
          <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
            <div>
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
                Today&apos;s Prayer Times
              </h2>
              <p className="text-xs text-zinc-500">
                {prayerData.data.date.readable} ·{' '}
                {prayerData.data.date.hijri.date}{' '}
                {prayerData.data.date.hijri.month.en}{' '}
                {prayerData.data.date.hijri.year}
              </p>
            </div>
            <ul className="grid grid-cols-2 gap-2 text-sm">
              {(['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const).map((p) => (
                <li
                  key={p}
                  className="flex justify-between rounded-md bg-zinc-100 dark:bg-zinc-800 px-3 py-2"
                >
                  <span>{p}</span>
                  <span className="font-mono">{prayerData!.data.timings[p]}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="text-center text-xs text-zinc-400">
          Phase 3 complete — check-in feature coming next
        </p>
      </div>
    </main>
  )
}
