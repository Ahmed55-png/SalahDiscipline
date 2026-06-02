'use client'

import { motion } from 'framer-motion'
import { useState, useTransition } from 'react'
import { saveLocationAction } from '@/app/dashboard/actions'
import { useLanguage } from './LanguageProvider'

type Props = {
  currentLabel: string | null
  hasCoords: boolean
}

export function LocationSetup({ currentLabel, hasCoords }: Props) {
  const { t, isUrdu } = useLanguage()
  const urduStyle = isUrdu ? { fontFamily: 'var(--font-nastaliq)' } : undefined
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [unsupported] = useState(
    typeof window !== 'undefined' && !('geolocation' in navigator)
  )

  const requestLocation = () => {
    setMessage(null)
    setError(null)
    if (!('geolocation' in navigator)) {
      setError('Geolocation not supported by this browser.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lon = pos.coords.longitude
        startTransition(async () => {
          const result = await saveLocationAction({ latitude: lat, longitude: lon })
          if (result.ok) {
            setMessage(
              result.label ? `Location set: ${result.label}` : 'Location saved.'
            )
          } else {
            setError(result.error ?? 'Failed to save location.')
          }
        })
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setError('Permission denied. Allow location from browser settings.')
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setError('Location unavailable right now. Try again.')
        } else if (err.code === err.TIMEOUT) {
          setError('Location request timed out.')
        } else {
          setError('Could not get location.')
        }
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 }
    )
  }

  if (unsupported) {
    return (
      <div className="rounded-2xl border border-zinc-300/40 bg-white/70 dark:bg-[#0F2A22]/60 p-4">
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          📍 Location is not supported in this browser.
        </p>
      </div>
    )
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl border border-gold/30 dark:border-gold/20 bg-white/85 dark:bg-[#0F2A22]/85 backdrop-blur-xl p-4 shadow-lg shadow-emerald-deep/5"
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl" aria-hidden>
          📍
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className="text-sm font-bold text-emerald-deep dark:text-emerald-200"
            style={urduStyle}
          >
            {isUrdu ? 'مقام' : 'Location'}
          </h3>
          {hasCoords && currentLabel ? (
            <p
              className="text-xs text-zinc-700 dark:text-zinc-300 mt-0.5 break-words"
              style={urduStyle}
            >
              {currentLabel}
            </p>
          ) : (
            <p
              className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5"
              style={urduStyle}
            >
              {isUrdu
                ? 'دقیق نماز اوقات کے لیے اپنا مقام شیئر کریں۔'
                : 'Share your location for street-accurate prayer times.'}
            </p>
          )}

          <button
            type="button"
            onClick={requestLocation}
            disabled={pending}
            className="mt-2.5 rounded-full bg-emerald-brand text-cream px-4 py-1.5 text-xs font-semibold hover:scale-[1.03] active:scale-[0.97] transition-transform glow-emerald disabled:opacity-50"
          >
            {pending
              ? isUrdu
                ? 'محفوظ ہو رہا ہے…'
                : 'Saving…'
              : hasCoords
                ? isUrdu
                  ? 'مقام اپ ڈیٹ کریں'
                  : 'Update Location'
                : isUrdu
                  ? 'مقام فعال کریں'
                  : 'Enable Location'}
          </button>

          {message && (
            <p className="mt-2 text-[11px] text-emerald-700 dark:text-emerald-300">
              {message}
            </p>
          )}
          {error && (
            <p className="mt-2 text-[11px] text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
        </div>
      </div>
    </motion.section>
  )
}
