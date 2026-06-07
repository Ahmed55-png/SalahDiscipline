'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export type ForgotState = {
  error: string | null
  sent: boolean
}

export async function forgotPasswordAction(
  _prev: ForgotState,
  formData: FormData
): Promise<ForgotState> {
  const email = String(formData.get('email') ?? '').trim()
  if (!email) return { error: 'Email is required', sent: false }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'That email looks invalid', sent: false }
  }

  const supabase = await createClient()
  // Build the redirect URL Supabase will email — this must be allow-listed
  // in Supabase → Authentication → URL Configuration → Redirect URLs.
  const reqHeaders = await headers()
  const host = reqHeaders.get('host') ?? 'salah-discipline-vvii.vercel.app'
  const proto = reqHeaders.get('x-forwarded-proto') ?? 'https'
  const redirectTo = `${proto}://${host}/auth/callback?type=recovery`

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  })

  if (error) return { error: error.message, sent: false }
  return { error: null, sent: true }
}
