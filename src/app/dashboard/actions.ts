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

/**
 * Mark a single prayer's status for today.
 * Argument-based (not FormData) so the client can call it from a
 * useOptimistic transition for instant UI feedback.
 *
 * Round-trips:
 *   1) auth.getUser
 *   2) upsert daily_prayers + return all 5 columns (single round-trip
 *      thanks to PostgREST upsert+select)
 *   3) select streak row
 *   4) update streak row
 *
 * The previous implementation needed 6 round-trips.
 */
export async function markPrayerAction(prayer: PrayerCol, status: Status) {
  if (!PRAYER_COLUMNS.includes(prayer)) return
  if (!['prayed', 'missed', 'pending'].includes(status)) return

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const date = todayIso()

    // Upsert + return updated row in one shot. PostgREST merges columns on conflict,
    // so other prayers in the row keep their existing values.
    const { data: today, error: upsertErr } = await supabase
      .from('daily_prayers')
      .upsert(
        { user_id: user.id, prayer_date: date, [prayer]: status },
        { onConflict: 'user_id,prayer_date' }
      )
      .select('fajr, dhuhr, asr, maghrib, isha')
      .single()

    if (upsertErr || !today) return

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
        // already counted, no change
      } else if (lastPrayed === yesterdayIsoFrom(date)) {
        current = current + 1
      } else {
        current = 1
      }
      lastPrayed = date
      if (current > longest) longest = current
    } else if (anyMissed) {
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
    console.error('markPrayerAction failed:', err)
  }

  revalidatePath('/dashboard')
}

/**
 * Save the user's geolocation (lat/lon + a human-readable label).
 * Called by LocationSetup after the browser grants permission.
 * Reverse-geocoding hits Nominatim from the server so the user's
 * coordinates are never sent through a third-party from the browser.
 */
export async function saveLocationAction(input: {
  latitude: number
  longitude: number
}): Promise<{ ok: boolean; label?: string; error?: string }> {
  const { latitude, longitude } = input
  if (
    typeof latitude !== 'number' ||
    typeof longitude !== 'number' ||
    !isFinite(latitude) ||
    !isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return { ok: false, error: 'Invalid coordinates' }
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: 'Not authenticated' }

    // Reverse geocode (best effort)
    let label: string | null = null
    let city: string | null = null
    let country: string | null = null
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en&zoom=14`,
        {
          headers: {
            'User-Agent': 'SalahDiscipline/1.0 (https://salah-discipline.vercel.app)',
          },
          // Cache identical coords for an hour
          next: { revalidate: 3600 },
        }
      )
      if (res.ok) {
        const data = (await res.json()) as {
          address?: {
            suburb?: string
            neighbourhood?: string
            city?: string
            town?: string
            village?: string
            state?: string
            country?: string
          }
          display_name?: string
        }
        const a = data.address ?? {}
        city = a.city ?? a.town ?? a.village ?? null
        country = a.country ?? null
        const street = a.suburb ?? a.neighbourhood ?? null
        const parts = [street, city, country].filter(Boolean) as string[]
        label = parts.length > 0 ? parts.join(', ') : (data.display_name ?? null)
      }
    } catch {
      // Geocoding is best-effort; we still save coordinates.
    }

    const update: {
      latitude: number
      longitude: number
      location_label: string | null
      city?: string
      country?: string
    } = {
      latitude,
      longitude,
      location_label: label,
    }
    if (city) update.city = city
    if (country) update.country = country

    const { error } = await supabase
      .from('profiles')
      .update(update)
      .eq('id', user.id)

    if (error) return { ok: false, error: error.message }

    revalidatePath('/dashboard')
    return { ok: true, label: label ?? undefined }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}
