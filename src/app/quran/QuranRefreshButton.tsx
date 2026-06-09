'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export function QuranRefreshButton() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.02 }}
      disabled={pending}
      onClick={() => startTransition(() => router.refresh())}
      className="inline-flex items-center gap-2 rounded-full bg-emerald-brand text-cream px-5 py-2.5 text-sm font-semibold shadow-md shadow-emerald-brand/30 hover:bg-emerald-deep transition-colors disabled:opacity-60"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={pending ? 'animate-spin' : ''}
        aria-hidden
      >
        <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
        <path d="M3 21v-5h5" />
      </svg>
      {pending ? 'Loading…' : 'Get another ayah'}
    </motion.button>
  )
}
