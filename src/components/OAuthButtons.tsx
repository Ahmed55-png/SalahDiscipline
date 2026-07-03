'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

type Provider = 'google' | 'facebook'

export function OAuthButtons() {
  const [pendingProvider, setPendingProvider] = useState<Provider | null>(null)
  const [error, setError] = useState<string | null>(null)

  const signInWith = async (provider: Provider) => {
    setError(null)
    setPendingProvider(provider)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        // After provider redirects back, our /auth/callback handler exchanges
        // the OAuth code for a Supabase session and then sends the user to
        // /dashboard.
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    })
    if (error) {
      setError(error.message)
      setPendingProvider(null)
    }
    // On success the browser navigates away to the provider's consent screen,
    // so we don't reset the pending state.
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-zinc-300/40 dark:bg-zinc-700/40" />
        <span className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          or continue with
        </span>
        <div className="h-px flex-1 bg-zinc-300/40 dark:bg-zinc-700/40" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <motion.button
          type="button"
          onClick={() => signInWith('google')}
          disabled={!!pendingProvider}
          whileTap={{ scale: 0.96 }}
          className="flex items-center justify-center gap-2 rounded-lg border border-zinc-300/60 dark:border-zinc-700/60 bg-white dark:bg-[#0A1F1A] px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:border-gold/60 transition-colors disabled:opacity-50"
        >
          <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden>
            <path
              fill="#4285F4"
              d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
            />
            <path
              fill="#34A853"
              d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A9 9 0 0 0 9 18z"
            />
            <path
              fill="#FBBC05"
              d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A9 9 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
            />
            <path
              fill="#EA4335"
              d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A9 9 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
            />
          </svg>
          {pendingProvider === 'google' ? 'Opening…' : 'Google'}
        </motion.button>

        <motion.button
          type="button"
          onClick={() => signInWith('facebook')}
          disabled={!!pendingProvider}
          whileTap={{ scale: 0.96 }}
          className="flex items-center justify-center gap-2 rounded-lg border border-zinc-300/60 dark:border-zinc-700/60 bg-white dark:bg-[#0A1F1A] px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:border-gold/60 transition-colors disabled:opacity-50"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
            <path
              fill="#1877F2"
              d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.491 0-1.956.926-1.956 1.875v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"
            />
          </svg>
          {pendingProvider === 'facebook' ? 'Opening…' : 'Facebook'}
        </motion.button>
      </div>

      {error && (
        <p className="text-[11px] text-red-600 dark:text-red-400 text-center">
          {error}
        </p>
      )}
    </div>
  )
}
