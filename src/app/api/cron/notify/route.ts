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
    // 404/410 => subscription is gone, caller should delete it
    const status =
      typeof e === 'object' && e !== null && 'statusCode' in e
        ? (e as { statusCode: number }).statusCode
        : 0
    return { ok: false as const, gone: status === 404 || status === 410 }
  }
}

export async function GET(req: NextRequest) {
  // Verify Vercel cron signature OR our own CRON_SECRET
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
    return NextResponse.json(
      { error: 'VAPID not configured' },
      { status: 500 }
    )
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: 'Supabase service key missing' },
      { status: 500 }
    )
  }
  // Service-role client bypasses RLS so the cron can read all profiles + subs
  const admin = createSupabaseClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const now = new Date()
  const curHour = now.getHours()

  // 1) Hourly ayah: send to everyone, every run
  const ayahNum = randomAyahNumber()
  const ayah = await getAyahWithTranslation(ayahNum)
  const ayahPayload = ayah
    ? {
        title: `Surah ${ayah.arabic.surah.englishName} · ${ayah.arabic.surah.number}:${ayah.arabic.numberInSurah}`,
        body: ayah.urdu.text,
        url: '/dashboard',
      }
    : null

  // 2) Prayer reminders: only for prayers whose hour matches the current hour
  // (Hobby Vercel cron can only run hourly, so this is the best granularity)
  const { data: subs, error: subsErr } = await admin
    .from('push_subscriptions')
    .select('user_id, endpoint, p256dh, auth')
  if (subsErr) {
    return NextResponse.json({ error: subsErr.message }, { status: 500 })
  }
  if (!subs || subs.length === 0) {
    return NextResponse.json({ sent: 0, reason: 'no subscribers' })
  }

  // Group subscriptions by user
  const subsByUser = new Map<string, Subscription[]>()
  for (const s of subs as Subscription[]) {
    const arr = subsByUser.get(s.user_id) ?? []
    arr.push(s)
    subsByUser.set(s.user_id, arr)
  }

  // Fetch profiles for all subscribed users
  const userIds = Array.from(subsByUser.keys())
  const { data: profiles } = await admin
    .from('profiles')
    .select('id, username, city, country, calculation_method, latitude, longitude')
    .in('id', userIds)

  const profileById = new Map<string, Profile>()
  for (const p of (profiles as Profile[]) ?? []) {
    profileById.set(p.id, p)
  }

  let totalSent = 0
  let totalGone = 0
  const goneEndpoints: string[] = []

  for (const [userId, userSubs] of subsByUser.entries()) {
    const profile = profileById.get(userId)

    // Determine if any prayer falls in this hour for this user
    let prayerLabel: string | null = null
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
        const map: Array<[string, string]> = [
          ['Fajr', timings.data.timings.Fajr],
          ['Dhuhr', timings.data.timings.Dhuhr],
          ['Asr', timings.data.timings.Asr],
          ['Maghrib', timings.data.timings.Maghrib],
          ['Isha', timings.data.timings.Isha],
        ]
        for (const [label, time] of map) {
          const hm = parseHHMM(time)
          if (hm && hm.h === curHour) {
            prayerLabel = label
            break
          }
        }
      }
    }

    // Build payload — prayer reminder preferred, else ayah
    const payload = prayerLabel
      ? {
          title: `🕌 ${prayerLabel} time`,
          body: `It's time for ${prayerLabel}. Open the app to mark your prayer.`,
          prayer: prayerLabel.toLowerCase(),
          url: '/dashboard',
        }
      : ayahPayload ?? {
          title: 'Salah Discipline',
          body: 'A reminder to stay close to Allah.',
          url: '/dashboard',
        }

    for (const s of userSubs) {
      const r = await sendPush(s, payload)
      if (r.ok) {
        totalSent++
      } else if (r.gone) {
        totalGone++
        goneEndpoints.push(s.endpoint)
      }
    }
  }

  // Cleanup dead subscriptions
  if (goneEndpoints.length > 0) {
    await admin
      .from('push_subscriptions')
      .delete()
      .in('endpoint', goneEndpoints)
  }

  return NextResponse.json({
    sent: totalSent,
    gone: totalGone,
    users: subsByUser.size,
    ayah: !!ayahPayload,
    hour: curHour,
  })
}
