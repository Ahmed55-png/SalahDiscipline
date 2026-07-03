'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { loginAction, type LoginState } from './actions'
import { AuthShell, AuthInput, AuthSubmit } from '@/components/AuthShell'
import { RotatingGreeting } from '@/components/RotatingGreeting'
import { OAuthButtons } from '@/components/OAuthButtons'

const initialState: LoginState = { error: null }

const LOGIN_GREETINGS = [
  'Welcome back',
  'Good to see you',
  'Hello again',
] as const

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState)

  return (
    <AuthShell
      title={<RotatingGreeting phrases={LOGIN_GREETINGS} />}
      subtitle="Continue your prayer streak"
    >
      <form action={formAction} className="space-y-4">
        <AuthInput
          id="email"
          name="email"
          label="Email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
        />
        <div className="space-y-1">
          <AuthInput
            id="password"
            name="password"
            label="Password"
            type="password"
            required
            autoComplete="current-password"
          />
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-[11px] text-gold dark:text-gold-light hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {state.error && (
          <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-md px-3 py-2">
            {state.error}
          </p>
        )}

        <AuthSubmit
          pending={pending}
          pendingLabel="Logging in..."
          label="Login"
        />
      </form>

      <OAuthButtons />

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        Don&apos;t have an account?{' '}
        <Link
          href="/signup"
          className="text-gold dark:text-gold-light font-semibold hover:underline transition-colors"
        >
          Sign up
        </Link>
      </p>
    </AuthShell>
  )
}
