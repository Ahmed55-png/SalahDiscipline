'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { signupAction, type SignupState } from './actions'
import { AuthShell, AuthInput, AuthSubmit } from '@/components/AuthShell'
import { RotatingGreeting } from '@/components/RotatingGreeting'
import { OAuthButtons } from '@/components/OAuthButtons'

const initialState: SignupState = { error: null }

const SIGNUP_GREETINGS = [
  'Get started',
  'Hello there',
  'Begin journey',
] as const

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signupAction, initialState)

  return (
    <AuthShell
      title={<RotatingGreeting phrases={SIGNUP_GREETINGS} />}
      subtitle="Build your prayer discipline"
    >
      <form action={formAction} className="space-y-4">
        <AuthInput
          id="username"
          name="username"
          label="Username"
          type="text"
          required
          minLength={3}
          maxLength={20}
          autoComplete="username"
          placeholder="ahmed55"
        />
        <AuthInput
          id="email"
          name="email"
          label="Email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
        />
        <AuthInput
          id="password"
          name="password"
          label="Password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
        />

        {state.error && (
          <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-md px-3 py-2">
            {state.error}
          </p>
        )}

        <AuthSubmit
          pending={pending}
          pendingLabel="Creating account..."
          label="Create Account"
        />
      </form>

      <OAuthButtons />

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-gold dark:text-gold-light font-semibold hover:underline transition-colors"
        >
          Login
        </Link>
      </p>
    </AuthShell>
  )
}
