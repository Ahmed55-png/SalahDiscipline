'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type ResetState = { error: string | null }

export async function resetPasswordAction(
  _prev: ResetState,
  formData: FormData
): Promise<ResetState> {
  const password = String(formData.get('password') ?? '')
  const confirm = String(formData.get('confirm') ?? '')
  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters' }
  }
  if (password !== confirm) {
    return { error: 'Passwords do not match' }
  }

  const supabase = await createClient()
  // The /auth/callback handler swapped the recovery code for a session
  // before redirecting here, so we can update the password directly.
  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: error.message }

  redirect('/dashboard')
}
