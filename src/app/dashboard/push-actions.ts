'use server'

import { createClient } from '@/lib/supabase/server'
import webpush from 'web-push'

type PushSubscriptionRow = {
  endpoint: string
  p256dh: string
  auth: string
}

function configureVapid(): string | null {
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const priv = process.env.VAPID_PRIVATE_KEY
  const email = process.env.VAPID_EMAIL ?? 'mailto:salah@example.com'
  if (!pub || !priv) return 'VAPID keys missing on server.'
  webpush.setVapidDetails(email, pub, priv)
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

  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: user.id,
      endpoint,
      p256dh,
      auth,
      user_agent: userAgent ?? null,
    },
    { onConflict: 'user_id,endpoint' }
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
