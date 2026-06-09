'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ProfileDrawer } from './ProfileDrawer'
import { useOpenOnParam } from '@/lib/hooks/useOpenOnParam'

type Props = {
  username: string
  email: string | null
  city: string
  country: string
  currentStreak: number
  longestStreak: number
  locationLabel: string | null
  hasCoords: boolean
  latitude: number | null
  longitude: number | null
  displayName: string | null
  bio: string | null
  age: number | null
  gender: 'male' | 'female' | 'prefer_not_to_say' | null
}

export function ProfileButton(props: Props) {
  const [open, setOpen] = useState(false)
  useOpenOnParam('profile', setOpen)
  const initial = (props.username[0] ?? '?').toUpperCase()

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.05 }}
        aria-label="Open profile"
        className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-brand via-emerald-deep to-emerald-brand flex items-center justify-center text-cream text-sm font-bold shadow-md shadow-emerald-deep/30 ring-2 ring-gold/40 hover:ring-gold transition-all"
      >
        {initial}
      </motion.button>

      <ProfileDrawer open={open} onClose={() => setOpen(false)} {...props} />
    </>
  )
}
