import { NextResponse, type NextRequest } from 'next/server'
import webpush from 'web-push'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import {
  getTimingsByCity,
  getTimingsByCoordinates,
  type AladhanResponse,
} from '@/lib/api/aladhan'
import {
  getAyahWithTranslation,
  randomAyahNumber,
} from '@/lib/api/quran'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// How close to a prayer time counts as "now". GH Actions runs every
// 5 min, but the actual fire can drift ±2 min, so ±3 min covers it
// while staying tight enough that adjacent cron runs don't both fire.
const PRAYER_WINDOW_MIN = 3
const AYAH_INTERVAL_MIN = 10

type Profile = {
  id: string
  username: string | null
  city: string | null
  country: string | null
  calculation_method: number | null
  latitude: number | null
  longitude: number | null
}

type Subscription = {
  user_id: string
  endpoint: string
  p256dh: string
  auth: string
}

function configureVapid() {
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const priv = process.env.VAPID_PRIVATE_KEY
  const email = process.env.VAPID_EMAIL ?? 'mailto:salah@example.com'
  if (!pub || !priv) return false
  webpush.setVapidDetails(email, pub, priv)
  return true
}

function parseHHMM(time: string | undefined): { h: number; m: number } | null {
  if (!time) return null
  const m = /^(\d{1,2}):(\d{2})/.exec(time)
  if (!m) return null
  return { h: Number(m[1]), m: Number(m[2]) }
}

function minutesBetween(a: { h: number; m: number }, b: { h: number; m: number }): number {
  const diff = Math.abs(a.h * 60 + a.m - (b.h * 60 + b.m))
  return Math.min(diff, 24 * 60 - diff)
}

function todayDateString(now: Date): string {
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
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

async function sendPush(sub: Subscription, payload: object) {
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

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers.get('authorization')
  if (
    cronSecret &&
    authHeader !== `Bearer ${cronSecret}` &&
    req.headers.get('x-vercel-cron') !== '1'
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!configureVapid()) {
    return NextResponse.json({ error: 'VAPID not configured' }, { status: 500 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: 'Supabase service key missing' },
      { status: 500 }
    )
  }
  const admin = createSupabaseClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const now = new Date()
  const curHM = { h: now.getHours(), m: now.getMinutes() }
  const dateStr = todayDateString(now)
  const ayahBucket = Math.floor(now.getMinutes() / AYAH_INTERVAL_MIN)

  // Build ayah payload on every cron run. GitHub Actions controls the
  // 10-minute cadence; the tag buckets retries so duplicate runs replace.
  let ayahPayload: {
    title: string
    body: string
    url: string
    tag: string
  } | null = null
  const ayahNum = randomAyahNumber()
  const ayah = await getAyahWithTranslation(ayahNum)
  if (ayah) {
    ayahPayload = {
      title: `Surah ${ayah.arabic.surah.englishName} · ${ayah.arabic.surah.number}:${ayah.arabic.numberInSurah}`,
      body: ayah.urdu.text,
      url: '/dashboard',
      tag: `ayah-${dateStr}-${curHM.h}-${ayahBucket}`,
    }
  }

  // Fetch all subscriptions
  const { data: subs, error: subsErr } = await admin
    .from('push_subscriptions')
    .select('user_id, endpoint, p256dh, auth')
  if (subsErr) {
    return NextResponse.json({ error: subsErr.message }, { status: 500 })
  }
  if (!subs || subs.length === 0) {
    return NextResponse.json({ sent: 0, reason: 'no subscribers' })
  }

  const subsByUser = new Map<string, Subscription[]>()
  for (const s of subs as Subscription[]) {
    const arr = subsByUser.get(s.user_id) ?? []
    arr.push(s)
    subsByUser.set(s.user_id, arr)
  }

  const userIds = Array.from(subsByUser.keys())
  const { data: profiles } = await admin
    .from('profiles')
    .select(
      'id, username, city, country, calculation_method, latitude, longitude'
    )
    .in('id', userIds)
  const profileById = new Map<string, Profile>()
  for (const p of (profiles as Profile[]) ?? []) {
    profileById.set(p.id, p)
  }

  let prayerSends = 0
  let ayahSends = 0
  let totalGone = 0
  const goneEndpoints: string[] = []
  const debug: Array<Record<string, unknown>> = []

  for (const [userId, userSubs] of subsByUser.entries()) {
    const profile = profileById.get(userId)

    // Detect which prayer (if any) is within the window
    let prayerMatch: { label: string; time: string } | null = null
    if (profile) {
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
      if (timings) {
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
            prayerMatch = { label, time }
            break
          }
        }
      }
    }

    // Build payloads. Ayah is intentionally sent every scheduled cron run
    // during this test period; prayer can be sent additionally when matched.
    const payloads: Array<{
      title: string
      body: string
      url: string
      tag: string
      prayer?: string
    }> = []

    if (prayerMatch) {
      payloads.push({
        title: `Adhan - ${prayerMatch.label} time`,
        body: `Namaz ka waqt ho gaya. Tap to open the app and play adhan.`,
        prayer: prayerMatch.label.toLowerCase(),
        url: `/dashboard?adhan=${prayerMatch.label.toLowerCase()}`,
        // Same tag for one prayer per day, so duplicate cron runs replace
        tag: `prayer-${prayerMatch.label.toLowerCase()}-${dateStr}`,
      })
    }
    if (ayahPayload) {
      payloads.push(ayahPayload)
    }

    if (payloads.length === 0) continue

    for (const s of userSubs) {
      for (const payload of payloads) {
        const r = await sendPush(s, payload)
        if (r.ok) {
          if (payload.prayer) prayerSends++
          else ayahSends++
        } else if (r.gone) {
          totalGone++
          goneEndpoints.push(s.endpoint)
        }
      }
    }

    debug.push({
      user: profile?.username ?? userId,
      prayer: prayerMatch?.label ?? null,
    })
  }

  if (goneEndpoints.length > 0) {
    await admin
      .from('push_subscriptions')
      .delete()
      .in('endpoint', goneEndpoints)
  }

  return NextResponse.json({
    sent_prayer: prayerSends,
    sent_ayah: ayahSends,
    gone: totalGone,
    users: subsByUser.size,
    window_min: PRAYER_WINDOW_MIN,
    ayah_interval_min: AYAH_INTERVAL_MIN,
    ayah_bucket: ayahBucket,
    now: `${String(curHM.h).padStart(2, '0')}:${String(curHM.m).padStart(2, '0')}`,
    debug,
  })
}
