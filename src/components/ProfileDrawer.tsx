'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { logoutAction } from '@/app/dashboard/actions'
import { useLanguage } from './LanguageProvider'
import { NotificationSetup } from './NotificationSetup'
import { LocationSetup } from './LocationSetup'
import { AzanPlayer } from './AzanPlayer'
import { ProfileEditForm } from './ProfileEditForm'

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
  latitude: number | null
  longitude: number | null
  displayName: string | null
  bio: string | null
  age: number | null
  gender: 'male' | 'female' | 'prefer_not_to_say' | null
}

type Panel = 'menu' | 'edit' | 'location' | 'notifications' | 'azan'

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
  latitude,
  longitude,
  displayName,
  bio,
  age,
  gender,
}: Props) {
  const { t, isUrdu } = useLanguage()
  const [panel, setPanel] = useState<Panel>('menu')
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

  useEffect(() => {
    if (!open) queueMicrotask(() => setPanel('menu'))
  }, [open])

  const panelTitle =
    panel === 'edit'
      ? 'Edit Profile'
      : panel === 'location'
        ? 'Location'
        : panel === 'notifications'
          ? 'Namaz Reminders'
          : panel === 'azan'
            ? 'Azan'
            : t('profile.title')

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
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  {panel !== 'menu' && (
                    <button
                      type="button"
                      onClick={() => setPanel('menu')}
                      aria-label="Back to profile options"
                      className="w-9 h-9 flex items-center justify-center rounded-full border border-emerald-brand/30 hover:bg-emerald-brand/10 text-emerald-deep dark:text-emerald-200 transition-colors"
                    >
                      {'<'}
                    </button>
                  )}
                  <h2 className="text-lg font-bold text-emerald-deep dark:text-emerald-200 truncate">
                    {panelTitle}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close profile"
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-emerald-brand/30 hover:bg-emerald-brand/10 text-emerald-deep dark:text-emerald-200 transition-colors"
                >
                  x
                </button>
              </div>

              {panel === 'menu' ? (
                <>
                  <div className="flex flex-col items-center gap-3 pt-2">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-brand via-emerald-deep to-emerald-brand flex items-center justify-center text-cream text-4xl font-bold shadow-lg shadow-emerald-deep/30 ring-4 ring-gold/40">
                        {initial}
                      </div>
                      <button
                        type="button"
                        onClick={() => setPanel('edit')}
                        aria-label="Edit profile"
                        className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gold text-emerald-deep shadow-md shadow-gold/30 ring-2 ring-cream dark:ring-[#0A1F1A] flex items-center justify-center hover:bg-gold-light transition-colors"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden
                        >
                          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                        </svg>
                      </button>
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-emerald-deep dark:text-emerald-200">
                        {displayName || username}
                      </h3>
                      {displayName && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          @{username}
                        </p>
                      )}
                      {email && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 break-all">
                          {email}
                        </p>
                      )}
                      {bio && (
                        <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-2 px-4 italic">
                          “{bio}”
                        </p>
                      )}
                      {(age != null || gender) && (
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1.5 flex items-center justify-center gap-2">
                          {age != null && <span>{age} years</span>}
                          {age != null && gender && <span aria-hidden>·</span>}
                          {gender && (
                            <span className="capitalize">
                              {gender.replace(/_/g, ' ')}
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>

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

                  <div className="grid grid-cols-3 gap-3">
                    <ProfileOption
                      icon="LOC"
                      label="Location"
                      sublabel={hasCoords ? 'Saved' : 'Set up'}
                      onClick={() => setPanel('location')}
                    />
                    <ProfileOption
                      icon="REM"
                      label="Reminders"
                      sublabel="Push"
                      onClick={() => setPanel('notifications')}
                    />
                    <ProfileOption
                      icon="AZN"
                      label="Azan"
                      sublabel="Audio"
                      onClick={() => setPanel('azan')}
                    />
                  </div>

                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="w-full rounded-xl border-2 border-red-400/50 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 py-3 text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors"
                    >
                      {t('profile.logout')}
                    </button>
                  </form>
                </>
              ) : panel === 'edit' ? (
                <ProfileEditForm
                  initial={{
                    username,
                    displayName,
                    bio,
                    age,
                    gender,
                  }}
                  onDone={() => setPanel('menu')}
                  onCancel={() => setPanel('menu')}
                />
              ) : panel === 'location' ? (
                <LocationSetup
                  currentLabel={locationLabel ?? `${city}, ${country}`}
                  hasCoords={hasCoords}
                  latitude={latitude}
                  longitude={longitude}
                />
              ) : panel === 'notifications' ? (
                <NotificationSetup />
              ) : (
                <div className="rounded-2xl border border-gold/30 bg-white/85 dark:bg-[#0F2A22]/85 backdrop-blur-xl p-4">
                  <div className="mb-3">
                    <h3 className="text-sm font-bold text-emerald-deep dark:text-emerald-200">
                      Azan
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                      Plays as an alarm at each prayer time when the app is open.
                    </p>
                  </div>
                  <AzanPlayer />
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

function ProfileOption({
  icon,
  label,
  sublabel,
  onClick,
}: {
  icon: string
  label: string
  sublabel: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-28 rounded-2xl border border-gold/30 bg-white/85 dark:bg-[#0F2A22]/85 backdrop-blur-xl px-2 py-3 text-center shadow-lg shadow-emerald-deep/5 hover:border-emerald-brand/40 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/30 transition-colors"
    >
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-brand text-cream text-[11px] font-bold tracking-wide ring-2 ring-gold/35">
        {icon}
      </span>
      <span className="mt-2 block text-xs font-bold text-emerald-deep dark:text-emerald-200">
        {label}
      </span>
      <span className="mt-0.5 block text-[10px] text-zinc-500 dark:text-zinc-400">
        {sublabel}
      </span>
    </button>
  )
}
