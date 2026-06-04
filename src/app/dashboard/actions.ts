'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// =====================================================================
// Reverse geocoding helpers
// =====================================================================

type GeocodeResult = {
  label: string | null
  city: string | null
  country: string | null
}

async function geocodeMapbox(
  lat: number,
  lon: number,
  token: string
): Promise<GeocodeResult | null> {
  try {
    const url =
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json` +
      `?access_token=${token}&types=address,neighborhood,locality,place&language=en&limit=1`
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    const data = (await res.json()) as {
      features?: Array<{
        place_name?: string
        text?: string
        context?: Array<{ id?: string; text?: string }>
      }>
    }
    const f = data.features?.[0]
    if (!f) return null
    const findCtx = (prefix: string) =>
      f.context?.find((c) => c.id?.startsWith(prefix))?.text ?? null
    return {
      label: f.place_name ?? null,
      city: findCtx('place') ?? findCtx('locality') ?? null,
      country: findCtx('country') ?? null,
    }
  } catch {
    return null
  }
}

async function geocodeNominatim(
  lat: number,
  lon: number
): Promise<GeocodeResult | null> {
  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse` +
      `?lat=${lat}&lon=${lon}&format=json&accept-language=en` +
      `&zoom=18&addressdetails=1`
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'SalahDiscipline/1.0 (https://salah-discipline.vercel.app)',
      },
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    const data = (await res.json()) as {
      address?: Record<string, string | undefined>
      display_name?: string
    }
    const a = data.address ?? {}
    const street =
      a.house_number && a.road
        ? `${a.house_number} ${a.road}`
        : (a.road ?? null)
    const area =
      a.neighbourhood ?? a.quarter ?? a.suburb ?? a.residential ?? null
    const district = a.city_district ?? a.county ?? null
    const city = a.city ?? a.town ?? a.village ?? a.municipality ?? null
    const country = a.country ?? null
    const parts = [street, area, district, city, country].filter(
      (v, i, arr) => v && arr.indexOf(v) === i
    ) as string[]
    return {
      label: parts.length ? parts.join(', ') : (data.display_name ?? null),
      city,
      country,
    }
  } catch {
    return null
  }
}

async function reverseGeocode(lat: number, lon: number): Promise<GeocodeResult> {
  const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN
  if (mapboxToken) {
    const r = await geocodeMapbox(lat, lon, mapboxToken)
    if (r && r.label) return r
  }
  const r = await geocodeNominatim(lat, lon)
  if (r) return r
  return { label: null, city: null, country: null }
}

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
    } else if (lastPrayed === date) {
      current = Math.max(0, current - 1)
      lastPrayed = current > 0 ? yesterdayIsoFrom(date) : null
    } else if (anyMissed) {
      current = 0
      lastPrayed = null
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
  latitude: number | null
  longitude: number | null
}): Promise<{ ok: boolean; label?: string; error?: string }> {
  const { latitude, longitude } = input

  // Clear path: pass null/null to remove the saved location
  if (latitude === null && longitude === null) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: 'Not authenticated' }
    const { error } = await supabase
      .from('profiles')
      .update({ latitude: null, longitude: null, location_label: null })
      .eq('id', user.id)
    if (error) return { ok: false, error: error.message }
    revalidatePath('/dashboard')
    return { ok: true }
  }

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

    // Reverse geocode: prefer Mapbox (street-accurate, like WhatsApp/Snapchat)
    // when MAPBOX_ACCESS_TOKEN env var is configured, otherwise fall back to
    // Nominatim (OpenStreetMap, free, less detail in Pakistan).
    const { label, city, country } = await reverseGeocode(latitude, longitude)

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
