'use server'

import { createClient } from '@/lib/supabase/server'
import webpush from 'web-push'
import {
  getTimingsByCity,
  getTimingsByCoordinates,
  type AladhanResponse,
} from '@/lib/api/aladhan'
import { getAyahWithTranslation, randomAyahNumber } from '@/lib/api/quran'

type PushSubscriptionRow = {
  endpoint: string
  p256dh: string
  auth: string
}

type ProfileRow = {
  username: string | null
  city: string | null
  country: string | null
  calculation_method: number | null
  latitude: number | null
  longitude: number | null
}

const PRAYER_WINDOW_MIN = 3

function configureVapid(): string | null {
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const priv = process.env.VAPID_PRIVATE_KEY
  const email = process.env.VAPID_EMAIL ?? 'mailto:salah@example.com'
  if (!pub || !priv) return 'VAPID keys missing on server.'
  webpush.setVapidDetails(email, pub, priv)
  return null
}

function parseHHMM(time: string | undefined): { h: number; m: number } | null {
  if (!time) return null
  const m = /^(\d{1,2}):(\d{2})/.exec(time)
  if (!m) return null
  return { h: Number(m[1]), m: Number(m[2]) }
}

function minutesBetween(a: { h: number; m: number }, b: { h: number; m: number }) {
  const diff = Math.abs(a.h * 60 + a.m - (b.h * 60 + b.m))
  return Math.min(diff, 24 * 60 - diff)
}

function localPartsForTimeZone(now: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now)
  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? ''
  return {
    h: Number(get('hour')),
    m: Number(get('minute')),
    date: `${get('year')}-${get('month')}-${get('day')}`,
  }
}

async function sendPush(sub: PushSubscriptionRow, payload: object) {
  try {
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      },
      JSON.stringify(payload),
      { TTL: 60 * 30 }
    )
    return { ok: true as const }
  } catch (e: unknown) {
    const status =
      typeof e === 'object' && e !== null && 'statusCode' in e
        ? (e as { statusCode: number }).statusCode
        : 0
    return { ok: false as const, gone: status === 404 || status === 410 }
  }
}

async function getPrayerMatch(profile: ProfileRow, now: Date) {
  const method = profile.calculation_method ?? 1
  let timings: AladhanResponse | null = null
  try {
    if (profile.latitude != null && profile.longitude != null) {
      timings = await getTimingsByCoordinates(
        profile.latitude,
        profile.longitude,
        method
      )
    } else if (profile.city && profile.country) {
      timings = await getTimingsByCity(profile.city, profile.country, method)
    }
  } catch {
    timings = null
  }
  if (!timings) return null

  const localNow = localPartsForTimeZone(
    now,
    timings.data.meta.timezone || 'UTC'
  )
  const prayers: Array<[string, string]> = [
    ['Fajr', timings.data.timings.Fajr],
    ['Dhuhr', timings.data.timings.Dhuhr],
    ['Asr', timings.data.timings.Asr],
    ['Maghrib', timings.data.timings.Maghrib],
    ['Isha', timings.data.timings.Isha],
  ]
  for (const [label, time] of prayers) {
    const hm = parseHHMM(time)
    if (hm && minutesBetween(localNow, hm) <= PRAYER_WINDOW_MIN) {
      return { label, time, date: localNow.date }
    }
  }
  return null
}

export async function subscribePushAction(input: {
  endpoint: string
  p256dh: string
  auth: string
  userAgent?: string
}): Promise<{ ok: boolean; error?: string }> {
  const { endpoint, p256dh, auth, userAgent } = input
  if (!endpoint || !p256dh || !auth) {
    return { ok: false, error: 'Invalid subscription' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated' }

  const { error: deleteError } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', user.id)
    .eq('endpoint', endpoint)
  if (deleteError) return { ok: false, error: deleteError.message }

  const { error } = await supabase.from('push_subscriptions').insert(
    {
      user_id: user.id,
      endpoint,
      p256dh,
      auth,
      user_agent: userAgent ?? null,
    }
  )
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function unsubscribePushAction(
  endpoint: string
): Promise<{ ok: boolean; error?: string }> {
  if (!endpoint) return { ok: false, error: 'No endpoint' }
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', user.id)
    .eq('endpoint', endpoint)
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function sendTestPushAction(): Promise<{
  ok: boolean
  sent?: number
  subscriptions?: number
  error?: string
}> {
  const vapidError = configureVapid()
  if (vapidError) return { ok: false, error: vapidError }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('user_id', user.id)

  if (error) return { ok: false, error: error.message }

  const subs = (data ?? []) as PushSubscriptionRow[]
  if (subs.length === 0) {
    return {
      ok: false,
      subscriptions: 0,
      error: 'No saved push subscription found. Tap Subscribe again.',
    }
  }

  let sent = 0
  const goneEndpoints: string[] = []
  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify({
          title: 'Salah Discipline',
          body: 'Server push test is working. Ayah reminders can reach this device.',
          url: '/dashboard',
          tag: `server-test-${Date.now()}`,
        }),
        { TTL: 60 * 10 }
      )
      sent++
    } catch (e: unknown) {
      const status =
        typeof e === 'object' && e !== null && 'statusCode' in e
          ? (e as { statusCode: number }).statusCode
          : 0
      if (status === 404 || status === 410) goneEndpoints.push(sub.endpoint)
    }
  }

  if (goneEndpoints.length > 0) {
    await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', user.id)
      .in('endpoint', goneEndpoints)
  }

  return {
    ok: sent > 0,
    sent,
    subscriptions: subs.length,
    error: sent > 0 ? undefined : 'Saved subscriptions could not receive push.',
  }
}

export async function sendReminderCheckAction(): Promise<{
  ok: boolean
  sentPrayer?: number
  sentAyah?: number
  subscriptions?: number
  error?: string
}> {
  const vapidError = configureVapid()
  if (vapidError) return { ok: false, error: vapidError }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated' }

  const [{ data: subsData, error: subsError }, { data: profileData }] =
    await Promise.all([
      supabase
        .from('push_subscriptions')
        .select('endpoint, p256dh, auth')
        .eq('user_id', user.id),
      supabase
        .from('profiles')
        .select(
          'username, city, country, calculation_method, latitude, longitude'
        )
        .eq('id', user.id)
        .single(),
    ])

  if (subsError) return { ok: false, error: subsError.message }
  const subs = (subsData ?? []) as PushSubscriptionRow[]
  if (subs.length === 0) {
    return {
      ok: false,
      subscriptions: 0,
      error: 'No saved push subscription found.',
    }
  }

  const now = new Date()
  const ayah = await getAyahWithTranslation(randomAyahNumber())
  const payloads: Array<{
    title: string
    body: string
    url: string
    tag: string
    prayer?: string
  }> = []

  const profile = profileData as ProfileRow | null
  if (profile) {
    const prayer = await getPrayerMatch(profile, now)
    if (prayer) {
      payloads.push({
        title: `${prayer.label} time`,
        body: `It's time for ${prayer.label}. Open the app to mark your prayer.`,
        prayer: prayer.label.toLowerCase(),
        url: '/dashboard',
        tag: `prayer-${prayer.label.toLowerCase()}-${prayer.date}`,
      })
    }
  }

  if (ayah) {
    const bucket = Math.floor(now.getTime() / 600_000)
    payloads.push({
      title: `Surah ${ayah.arabic.surah.englishName} - ${ayah.arabic.surah.number}:${ayah.arabic.numberInSurah}`,
      body: ayah.urdu.text,
      url: '/dashboard',
      tag: `ayah-heartbeat-${bucket}`,
    })
  }

  if (payloads.length === 0) {
    return { ok: false, subscriptions: subs.length, error: 'No payload built.' }
  }

  let sentPrayer = 0
  let sentAyah = 0
  const goneEndpoints: string[] = []
  for (const sub of subs) {
    for (const payload of payloads) {
      const result = await sendPush(sub, payload)
      if (result.ok) {
        if (payload.prayer) sentPrayer++
        else sentAyah++
      } else if (result.gone) {
        goneEndpoints.push(sub.endpoint)
      }
    }
  }

  if (goneEndpoints.length > 0) {
    await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', user.id)
      .in('endpoint', goneEndpoints)
  }

  return {
    ok: sentPrayer + sentAyah > 0,
    sentPrayer,
    sentAyah,
    subscriptions: subs.length,
    error:
      sentPrayer + sentAyah > 0
        ? undefined
        : 'Saved subscriptions could not receive push.',
  }
}
