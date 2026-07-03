'use client'

import { motion } from 'framer-motion'
import { useLanguage } from './LanguageProvider'
import { LanguageToggle } from './LanguageToggle'
import { ProfileButton } from './ProfileButton'
import { ThemeToggle } from './ThemeToggle'

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

const GREETING_KEYS = [
  'greeting.welcome_back',
  'greeting.good_to_see',
  'greeting.hello_again',
] as const

export function DashboardHeader(props: Props) {
  const { t, lang } = useLanguage()
  // Pick a stable-by-mount greeting key without hydration mismatch:
  // server + first paint shows index 0, then we let the language
  // update naturally on toggle.
  const greetingKey = GREETING_KEYS[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-start justify-between pt-2 gap-3"
    >
      <div className="space-y-0.5 min-w-0">
        <p
          className="text-sm text-gold-light"
          style={{ fontFamily: 'var(--font-amiri)' }}
        >
          ٱلسَّلَامُ عَلَيْكُمْ
        </p>
        <h1 className="text-2xl font-bold text-emerald-deep dark:text-emerald-200 tracking-tight truncate">
          {props.displayName || props.username}
        </h1>
        <p
          className="text-xs text-emerald-deep/70 dark:text-emerald-300/70 font-medium"
          style={lang === 'ur' ? { fontFamily: 'var(--font-nastaliq)' } : undefined}
          dir={lang === 'ur' ? 'rtl' : 'ltr'}
        >
          {t(greetingKey)}
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 pt-0.5 truncate">
          <span className="inline-block w-1 h-1 rounded-full bg-gold shrink-0" />
          <span className="truncate">
            {props.hasCoords && props.locationLabel
              ? props.locationLabel
              : `${props.city}, ${props.country}`}
          </span>
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <LanguageToggle />
        <ThemeToggle />
        <ProfileButton {...props} />
      </div>
    </motion.div>
  )
}
