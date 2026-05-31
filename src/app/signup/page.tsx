'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { signupAction, type SignupState } from './actions'

const initialState: SignupState = { error: null }

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signupAction, initialState)

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 space-y-6">
        <header className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Sign Up
          </h1>
          <p className="text-sm text-zinc-500">Salah Discipline mein khush amdeed</p>
        </header>

        <form action={formAction} className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              minLength={3}
              maxLength={20}
              autoComplete="username"
              className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="ahmed55"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {state.error && (
            <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 text-sm font-medium transition-colors"
          >
            {pending ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500">
          Pehle se account hai?{' '}
          <Link
            href="/login"
            className="text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </main>
  )
}
