'use client'

import { useActionState } from 'react'
import { onboardingAction, type OnboardingState } from './actions'
import { AuthShell, AuthInput, AuthSubmit } from '@/components/AuthShell'

const initialState: OnboardingState = { error: null }

export default function OnboardingPage() {
  const [state, formAction, pending] = useActionState(
    onboardingAction,
    initialState
  )

  return (
    <AuthShell
      title="One more step"
      subtitle="Pick a username and tell us a little about yourself."
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

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label
              htmlFor="gender"
              className="block text-xs font-medium text-emerald-deep dark:text-emerald-300 uppercase tracking-wider"
            >
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              defaultValue=""
              className="w-full rounded-lg border border-emerald-brand/20 dark:border-emerald-light/20 bg-white dark:bg-[#0A1F1A] px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/30 transition-all duration-200"
            >
              <option value="">— optional —</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>

          <AuthInput
            id="age"
            name="age"
            label="Age"
            type="number"
            placeholder="optional"
          />
        </div>

        {state.error && (
          <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-md px-3 py-2">
            {state.error}
          </p>
        )}

        <AuthSubmit
          pending={pending}
          pendingLabel="Saving…"
          label="Continue"
        />
      </form>
    </AuthShell>
  )
}
