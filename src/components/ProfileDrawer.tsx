'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { logoutAction } from '@/app/dashboard/actions'
import { useLanguage } from './LanguageProvider'
import { NotificationSetup } from './NotificationSetup'
import { LocationSetup } from './LocationSetup'

type Props = {
  open: boolean
  onClose: () => void
  username: string
  email: string | null
  city: string
  country: string
  currentStreak: number
  longestStreak: number
  locationLabel: string | null
  hasCoords: boolean
}

export function ProfileDrawer({
  open,
  onClose,
  username,
  email,
  city,
  country,
  currentStreak,
  longestStreak,
  locationLabel,
  hasCoords,
}: Props) {
  const { t, isUrdu } = useLanguage()
  const initial = (username[0] ?? '?').toUpperCase()

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-emerald-deep/40 backdrop-blur-sm z-40"
            aria-hidden
          />

          <motion.aside
            key="drawer"
            role="dialog"
            aria-label={t('profile.title')}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 36 }}
            className="fixed inset-y-0 right-0 z-50 w-[85%] sm:w-full sm:max-w-md bg-cream dark:bg-[#0A1F1A] border-l border-gold/30 shadow-2xl shadow-emerald-deep/40 overflow-y-auto"
          >
            <div className="absolute inset-0 islamic-pattern opacity-30 pointer-events-none" />

            <div className="relative p-4 sm:p-5 space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-emerald-deep dark:text-emerald-200">
                  {t('profile.title')}
                </h2>
                <button
                  onClick={onClose}
                  aria-label="Close profile"
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-emerald-brand/30 hover:bg-emerald-brand/10 text-emerald-deep dark:text-emerald-200 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Avatar + username */}
              <div className="flex flex-col items-center gap-3 pt-2">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-brand via-emerald-deep to-emerald-brand flex items-center justify-center text-cream text-4xl font-bold shadow-lg shadow-emerald-deep/30 ring-4 ring-gold/40">
                    {initial}
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-emerald-deep dark:text-emerald-200">
                    {username}
                  </h3>
                  {email && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 break-all">
                      {email}
                    </p>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-emerald-light/30 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-3 text-center">
                  <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 tabular-nums leading-none">
                    {currentStreak}
                  </p>
                  <p
                    className={`text-[10px] uppercase tracking-wider text-emerald-700/80 dark:text-emerald-300/80 font-semibold mt-1 ${isUrdu ? 'tracking-normal' : ''}`}
                  >
                    {t('profile.current_streak')}
                  </p>
                </div>
                <div className="rounded-xl border border-gold/30 bg-gold-soft/30 dark:bg-gold/10 px-3 py-3 text-center">
                  <p className="text-2xl font-bold text-gold tabular-nums leading-none">
                    {longestStreak}
                  </p>
                  <p
                    className={`text-[10px] uppercase tracking-wider text-gold/80 font-semibold mt-1 ${isUrdu ? 'tracking-normal' : ''}`}
                  >
                    {t('profile.longest_streak')}
                  </p>
                </div>
              </div>

              {/* Location (GPS) */}
              <LocationSetup
                currentLabel={locationLabel ?? `${city}, ${country}`}
                hasCoords={hasCoords}
              />

              {/* Notifications */}
              <NotificationSetup />

              {/* Logout */}
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="w-full rounded-xl border-2 border-red-400/50 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 py-3 text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors"
                >
                  {t('profile.logout')}
                </button>
              </form>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
