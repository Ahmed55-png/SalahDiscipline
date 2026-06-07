import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * OAuth + password-reset callback.
 *
 * Supabase redirects the browser here with `?code=...` after the user
 * finishes Google/Facebook/etc. We swap the code for a Supabase session
 * (cookies are written by our SSR client) and then forward the user to
 * the `next` query param (default /dashboard) or, for password recovery,
 * to /auth/reset-password where they can choose a new password.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const type = url.searchParams.get('type')
  const next =
    type === 'recovery'
      ? '/auth/reset-password'
      : (url.searchParams.get('next') ?? '/dashboard')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      const redirectUrl = new URL('/login', url.origin)
      redirectUrl.searchParams.set('error', error.message)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return NextResponse.redirect(new URL(next, url.origin))
}
