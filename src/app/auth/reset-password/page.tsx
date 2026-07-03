'use client'

import { useActionState } from 'react'
import { resetPasswordAction, type ResetState } from './actions'
import { AuthShell, AuthInput, AuthSubmit } from '@/components/AuthShell'

const initialState: ResetState = { error: null }

export default function ResetPasswordPage() {
  const [state, formAction, pending] = useActionState(
    resetPasswordAction,
    initialState
  )

  return (
    <AuthShell title="Set New Password" subtitle="Choose a strong password">
      <form action={formAction} className="space-y-4">
        <AuthInput
          id="password"
          name="password"
          label="New Password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
        />
        <AuthInput
          id="confirm"
          name="confirm"
          label="Confirm Password"
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
          pendingLabel="Saving…"
          label="Save password"
        />
      </form>
    </AuthShell>
  )
}
