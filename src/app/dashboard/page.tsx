import { createClient } from '@/lib/supabase/server'
import { getTimingsByCity } from '@/lib/api/aladhan'
import { redirect } from 'next/navigation'
import { logoutAction } from './actions'
import { PrayerCheckIn } from '@/components/PrayerCheckIn'
import { StreakCard } from '@/components/StreakCard'
import { FadeIn } from '@/components/FadeIn'
import { InstallPrompt } from '@/components/InstallPrompt'
import { NotificationSetup } from '@/components/NotificationSetup'
import type { PrayerStatus } from '@/types/database'

const PRAYERS = [
  { key: 'fajr', label: 'Fajr', api: 'Fajr', arabic: 'الفجر' },
  { key: 'dhuhr', label: 'Dhuhr', api: 'Dhuhr', arabic: 'الظهر' },
  { key: 'asr', label: 'Asr', api: 'Asr', arabic: 'العصر' },
  { key: 'maghrib', label: 'Maghrib', api: 'Maghrib', arabic: 'المغرب' },
  { key: 'isha', label: 'Isha', api: 'Isha', arabic: 'العشاء' },
] as const

function todayIso(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: profile }, { data: streak }, { data: today }] =
    await Promise.all([
      supabase
        .from('profiles')
        .select('username, city, country, calculation_method')
        .eq('id', user.id)
        .single(),
      supabase
        .from('streaks')
        .select('current_streak, longest_streak')
        .eq('user_id', user.id)
        .single(),
      supabase
        .from('daily_prayers')
        .select('fajr, dhuhr, asr, maghrib, isha')
        .eq('user_id', user.id)
        .eq('prayer_date', todayIso())
        .maybeSingle(),
    ])

  const city = profile?.city ?? 'Karachi'
  const country = profile?.country ?? 'Pakistan'
  const method = profile?.calculation_method ?? 1

  let prayerData: Awaited<ReturnType<typeof getTimingsByCity>> | null = null
  try {
    prayerData = await getTimingsByCity(city, country, method)
  } catch {
    // ignore
  }

  const prayerRows = PRAYERS.map((p) => ({
    key: p.key,
    label: p.label,
    arabic: p.arabic,
    time: prayerData?.data.timings[p.api] ?? '--:--',
    status: ((today?.[p.key] as PrayerStatus | undefined) ?? 'pending') as PrayerStatus,
  }))

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 islamic-pattern opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cream/40 to-cream dark:via-[#0A1F1A]/40 dark:to-[#0A1F1A] pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
        <FadeIn delay={0} className="flex items-start justify-between pt-2">
          <div className="space-y-0.5">
            <p
              className="text-sm text-gold-light"
              style={{ fontFamily: 'var(--font-amiri)' }}
            >
              ٱلسَّلَامُ عَلَيْكُمْ
            </p>
            <h1 className="text-2xl font-bold text-emerald-deep dark:text-emerald-200 tracking-tight">
              {profile?.username ?? 'friend'}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
              <span className="inline-block w-1 h-1 rounded-full bg-gold" />
              {city}, {country}
            </p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors px-2 py-1"
            >
              Logout
            </button>
          </form>
        </FadeIn>

        <StreakCard
          current={streak?.current_streak ?? 0}
          longest={streak?.longest_streak ?? 0}
        />

        <NotificationSetup />

        <PrayerCheckIn prayers={prayerRows} />

        <InstallPrompt />

        {prayerData && (
          <FadeIn delay={0.4}>
            <div className="text-center space-y-1 pb-4">
              <p className="text-xs text-emerald-deep/70 dark:text-emerald-300/70 font-medium">
                {prayerData.data.date.readable}
              </p>
              <p
                className="text-sm text-gold dark:text-gold-light"
                style={{ fontFamily: 'var(--font-amiri)' }}
              >
                {prayerData.data.date.hijri.date}{' '}
                {prayerData.data.date.hijri.month.en}{' '}
                {prayerData.data.date.hijri.year} هـ
              </p>
            </div>
          </FadeIn>
        )}
      </div>
    </main>
  )
}
