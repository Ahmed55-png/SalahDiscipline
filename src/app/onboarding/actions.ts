'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type OnboardingState = { error: string | null }

const GENDERS = new Set(['male', 'female', 'prefer_not_to_say'])

export async function onboardingAction(
  _prev: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const username = String(formData.get('username') ?? '').trim()
  const genderRaw = String(formData.get('gender') ?? '').trim()
  const ageRaw = String(formData.get('age') ?? '').trim()

  if (!username) return { error: 'Username is required' }
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    return { error: 'Username: 3-20 chars, letters / numbers / underscore only' }
  }

  const gender = genderRaw && GENDERS.has(genderRaw) ? genderRaw : null

  let age: number | null = null
  if (ageRaw) {
    const parsed = Number(ageRaw)
    if (!Number.isFinite(parsed) || parsed < 1 || parsed > 150) {
      return { error: 'Age must be between 1 and 150' }
    }
    age = Math.round(parsed)
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check the chosen username isn't already taken by someone else
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .ilike('username', username)
    .neq('id', user.id)
    .maybeSingle()

  if (existing) {
    return { error: 'That username is taken. Please choose another.' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      username,
      gender,
      age,
      onboarding_completed: true,
    })
    .eq('id', user.id)

  if (error) return { error: error.message }

  redirect('/dashboard')
}
