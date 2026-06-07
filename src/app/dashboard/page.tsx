import { createClient } from '@/lib/supabase/server'
import { getTimingsByCity } from '@/lib/api/aladhan'
import { getAyahWithTranslation, randomAyahNumber } from '@/lib/api/quran'
import { redirect } from 'next/navigation'
import { PrayerCheckIn } from '@/components/PrayerCheckIn'
import { FadeIn } from '@/components/FadeIn'
import { InstallPrompt } from '@/components/InstallPrompt'
import { DailyAyah } from '@/components/DailyAyah'
import { PrayerTimeWatcher } from '@/components/PrayerTimeWatcher'
import { SubscribeBanner } from '@/components/SubscribeBanner'
import { getTimingsByCoordinates } from '@/lib/api/aladhan'
import { LastWeekStrip, type WeekDay } from '@/components/LastWeekStrip'
import { DashboardHeader } from '@/components/DashboardHeader'
import { NotificationHeartbeat } from '@/components/NotificationHeartbeat'
import {
  last7Days,
  toIsoDate,
  startOfDay,
  weekdayShort,
  type DayStatuses,
} from '@/lib/utils/calendar'
import { to12Hour } from '@/lib/utils/time'

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

function previousIsoFrom(dateIso: string): string {
  const d = new Date(`${dateIso}T00:00:00`)
  d.setDate(d.getDate() - 1)
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

  const ayahNumber = randomAyahNumber()
  const todayDate = startOfDay(new Date())
  const week = last7Days(todayDate)
  const weekStartIso = toIsoDate(week[0])
  const weekEndIso = toIsoDate(week[6])

  const [
    { data: profile },
    { data: streak },
    { data: today },
    { data: weekRows },
    ayah,
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select(
        'username, city, country, calculation_method, latitude, longitude, location_label'
      )
      .eq('id', user.id)
      .single(),
    supabase
      .from('streaks')
      .select('current_streak, longest_streak, last_prayed_date')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('daily_prayers')
      .select('fajr, dhuhr, asr, maghrib, isha')
      .eq('user_id', user.id)
      .eq('prayer_date', todayIso())
      .maybeSingle(),
    supabase
      .from('daily_prayers')
      .select('prayer_date, fajr, dhuhr, asr, maghrib, isha')
      .eq('user_id', user.id)
      .gte('prayer_date', weekStartIso)
      .lte('prayer_date', weekEndIso),
    getAyahWithTranslation(ayahNumber),
  ])

  const weekByDate = new Map<string, DayStatuses>()
  for (const row of weekRows ?? []) {
    weekByDate.set(row.prayer_date as string, {
      fajr: row.fajr,
      dhuhr: row.dhuhr,
      asr: row.asr,
      maghrib: row.maghrib,
      isha: row.isha,
    })
  }
  const todayIsoStr = toIsoDate(todayDate)
  const weekDays: WeekDay[] = week.map((d) => {
    const iso = toIsoDate(d)
    return {
      iso,
      weekday: weekdayShort(d),
      dayNumber: d.getDate(),
      isToday: iso === todayIsoStr,
      statuses: weekByDate.get(iso) ?? null,
    }
  })

  const city = profile?.city ?? 'Karachi'
  const country = profile?.country ?? 'Pakistan'
  const method = profile?.calculation_method ?? 1
  const lat = (profile as { latitude?: number | null } | null)?.latitude ?? null
  const lon =
    (profile as { longitude?: number | null } | null)?.longitude ?? null
  const locationLabel =
    (profile as { location_label?: string | null } | null)?.location_label ??
    null
  const hasCoords = lat != null && lon != null

  let prayerData: Awaited<ReturnType<typeof getTimingsByCity>> | null = null
  try {
    if (hasCoords) {
      prayerData = await getTimingsByCoordinates(lat!, lon!, method)
    } else {
      prayerData = await getTimingsByCity(city, country, method)
    }
  } catch {
    // ignore
  }

  const prayerRows = PRAYERS.map((p) => {
    const rawTime = prayerData?.data.timings[p.api]
    return {
      key: p.key,
      label: p.label,
      arabic: p.arabic,
      time: rawTime ? to12Hour(rawTime) : '--:--',
      status: ((today?.[p.key] as PrayerStatus | undefined) ?? 'pending') as PrayerStatus,
    }
  })
  const todayStatuses = prayerRows.map((p) => p.status)
  const todayHasMissed = todayStatuses.some((s) => s === 'missed')
  const streakLastDate = streak?.last_prayed_date as string | null | undefined
  const isStreakDateActive =
    streakLastDate === todayIsoStr ||
    streakLastDate === previousIsoFrom(todayIsoStr)
  const currentStreak =
    todayHasMissed || !isStreakDateActive ? 0 : (streak?.current_streak ?? 0)
  const longestStreak = streak?.longest_streak ?? 0

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 islamic-pattern opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cream/40 to-cream dark:via-[#0A1F1A]/40 dark:to-[#0A1F1A] pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
        <DashboardHeader
          username={profile?.username ?? 'friend'}
          email={user.email ?? null}
          city={city}
          country={country}
          currentStreak={currentStreak}
          longestStreak={longestStreak}
          locationLabel={locationLabel}
          hasCoords={hasCoords}
          latitude={lat}
          longitude={lon}
        />

        <NotificationHeartbeat />

        <PrayerTimeWatcher
          prayers={prayerRows.map((p) => ({
            key: p.key,
            label: p.label,
            time: p.time,
          }))}
        />

        <SubscribeBanner />

        {ayah && <DailyAyah ayah={ayah} />}

        <LastWeekStrip days={weekDays} />

        <PrayerCheckIn
          prayers={prayerRows}
          currentStreak={currentStreak}
          longestStreak={longestStreak}
        />

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
