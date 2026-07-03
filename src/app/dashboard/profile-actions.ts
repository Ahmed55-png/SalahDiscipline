'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ProfileUpdateInput = {
  username: string
  displayName: string | null
  bio: string | null
  age: number | null
  gender: 'male' | 'female' | 'prefer_not_to_say' | null
}

export type ProfileUpdateResult =
  | { ok: true }
  | { ok: false; error: string }

const GENDERS = new Set(['male', 'female', 'prefer_not_to_say'])

export async function updateProfileAction(
  input: ProfileUpdateInput
): Promise<ProfileUpdateResult> {
  const username = String(input.username ?? '').trim()
  if (!username) return { ok: false, error: 'Username is required.' }
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    return {
      ok: false,
      error: 'Username: 3-20 chars, letters / numbers / underscore only.',
    }
  }

  const displayName = input.displayName?.trim() || null
  if (displayName && displayName.length > 60) {
    return { ok: false, error: 'Display name must be 60 characters or less.' }
  }

  const bio = input.bio?.trim() || null
  if (bio && bio.length > 200) {
    return { ok: false, error: 'Bio must be 200 characters or less.' }
  }

  let age: number | null = null
  if (input.age != null && input.age !== ('' as unknown as number)) {
    const parsed = Number(input.age)
    if (!Number.isFinite(parsed) || parsed < 1 || parsed > 150) {
      return { ok: false, error: 'Age must be between 1 and 150.' }
    }
    age = Math.round(parsed)
  }

  const gender =
    input.gender && GENDERS.has(input.gender) ? input.gender : null

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated.' }

  // Username uniqueness (case-insensitive) — skip if user is keeping theirs.
  const { data: clash } = await supabase
    .from('profiles')
    .select('id')
    .ilike('username', username)
    .neq('id', user.id)
    .maybeSingle()
  if (clash) {
    return { ok: false, error: 'That username is taken. Please choose another.' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      username,
      display_name: displayName,
      bio,
      age,
      gender,
      onboarding_completed: true,
    })
    .eq('id', user.id)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/dashboard')
  return { ok: true }
}
