'use server'

import { createClient } from '@/lib/supabase/server'

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
