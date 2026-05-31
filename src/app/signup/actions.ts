'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type SignupState = { error: string | null }

export async function signupAction(
  _prev: SignupState,
  formData: FormData
): Promise<SignupState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const username = String(formData.get('username') ?? '').trim()

  if (!email || !password || !username) {
    return { error: 'Sab fields zaroori hain' }
  }
  if (password.length < 6) {
    return { error: 'Password kam se kam 6 characters ka ho' }
  }
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    return { error: 'Username 3-20 chars, sirf letters/numbers/underscore' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/dashboard')
}
