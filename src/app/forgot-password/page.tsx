'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { forgotPasswordAction, type ForgotState } from './actions'
import { AuthShell, AuthInput, AuthSubmit } from '@/components/AuthShell'

const initialState: ForgotState = { error: null, sent: false }

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(
    forgotPasswordAction,
    initialState
  )

  return (
    <AuthShell title="Reset Password" subtitle="We'll email you a reset link">
      {state.sent ? (
        <div className="space-y-4">
          <p className="text-sm text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-light/30 rounded-md px-3 py-3 text-center">
            ✓ Reset link sent. Check your inbox (and spam folder).
          </p>
          <Link
            href="/login"
            className="block text-center text-sm text-gold dark:text-gold-light font-semibold hover:underline"
          >
            ← Back to login
          </Link>
        </div>
      ) : (
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

          {state.error && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-md px-3 py-2">
              {state.error}
            </p>
          )}

          <AuthSubmit
            pending={pending}
            pendingLabel="Sending…"
            label="Send reset link"
          />

          <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
            Remembered it?{' '}
            <Link
              href="/login"
              className="text-gold dark:text-gold-light font-semibold hover:underline"
            >
              Back to login
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  )
}
