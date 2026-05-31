'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

const PRAYER_COLUMNS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const
type PrayerCol = (typeof PRAYER_COLUMNS)[number]
type Status = 'prayed' | 'missed' | 'pending'

function todayIso(): string {
  // Local date (YYYY-MM-DD) — matches the user's wall-clock "today"
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function yesterdayIsoFrom(dateIso: string): string {
  const d = new Date(`${dateIso}T00:00:00`)
  d.setDate(d.getDate() - 1)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export async function markPrayerAction(formData: FormData) {
  const prayer = String(formData.get('prayer') ?? '') as PrayerCol
  const status = String(formData.get('status') ?? '') as Status

  if (!PRAYER_COLUMNS.includes(prayer)) return
  if (!['prayed', 'missed', 'pending'].includes(status)) return

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const date = todayIso()

    // Upsert today's row, setting just this prayer's status
    const { data: existing } = await supabase
      .from('daily_prayers')
      .select('id')
      .eq('user_id', user.id)
      .eq('prayer_date', date)
      .maybeSingle()

    if (existing) {
      await supabase
        .from('daily_prayers')
        .update({ [prayer]: status })
        .eq('id', existing.id)
    } else {
      await supabase
        .from('daily_prayers')
        .insert({ user_id: user.id, prayer_date: date, [prayer]: status })
    }

    // Recompute streak based on today's row + previous streak state
    const { data: today } = await supabase
      .from('daily_prayers')
      .select('fajr, dhuhr, asr, maghrib, isha')
      .eq('user_id', user.id)
      .eq('prayer_date', date)
      .single()

    if (!today) return

    const statuses = PRAYER_COLUMNS.map((c) => today[c] as Status)
    const allPrayed = statuses.every((s) => s === 'prayed')
    const anyMissed = statuses.some((s) => s === 'missed')

    const { data: streak } = await supabase
      .from('streaks')
      .select('current_streak, longest_streak, last_prayed_date')
      .eq('user_id', user.id)
      .single()

    let current = streak?.current_streak ?? 0
    let longest = streak?.longest_streak ?? 0
    let lastPrayed = streak?.last_prayed_date ?? null

    if (allPrayed) {
      if (lastPrayed === date) {
        // already counted today, no change
      } else if (lastPrayed === yesterdayIsoFrom(date)) {
        current = current + 1
      } else {
        current = 1
      }
      lastPrayed = date
      if (current > longest) longest = current
    } else if (anyMissed) {
      // If we already counted today as a full streak day, retract it
      if (lastPrayed === date) {
        current = Math.max(0, current - 1)
        lastPrayed = current > 0 ? yesterdayIsoFrom(date) : null
      } else {
        current = 0
      }
    }

    await supabase
      .from('streaks')
      .update({
        current_streak: current,
        longest_streak: longest,
        last_prayed_date: lastPrayed,
      })
      .eq('user_id', user.id)
  } catch (err) {
    // Network/Supabase errors: swallow so the form action returns a clean response.
    // The UI will reflect actual state on next render — user can retry.
    console.error('markPrayerAction failed:', err)
  }

  revalidatePath('/dashboard')
}
