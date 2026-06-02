'use client'

import { motion } from 'framer-motion'
import { useState, useTransition } from 'react'
import { saveLocationAction } from '@/app/dashboard/actions'
import { useLanguage } from './LanguageProvider'

type Props = {
  currentLabel: string | null
  hasCoords: boolean
  latitude?: number | null
  longitude?: number | null
}

export function LocationSetup({
  currentLabel,
  hasCoords,
  latitude,
  longitude,
}: Props) {
  const { isUrdu } = useLanguage()
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
        const accuracy = pos.coords.accuracy // metres
        startTransition(async () => {
          const result = await saveLocationAction({ latitude: lat, longitude: lon })
          if (result.ok) {
            setMessage(
              result.label
                ? `Saved: ${result.label} (±${Math.round(accuracy)}m)`
                : `Saved (±${Math.round(accuracy)}m)`
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
      // Always fetch fresh, allow up to 20s for a GPS fix
      { enableHighAccuracy: true, timeout: 20_000, maximumAge: 0 }
    )
  }

  const clearLocation = () => {
    setMessage(null)
    setError(null)
    startTransition(async () => {
      const result = await saveLocationAction({ latitude: null, longitude: null })
      if (result.ok) {
        setMessage('Location cleared. Using city defaults.')
      } else {
        setError(result.error ?? 'Failed to clear.')
      }
    })
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

          {hasCoords ? (
            <>
              <p
                className="text-xs text-zinc-700 dark:text-zinc-300 mt-0.5 break-words"
                style={urduStyle}
              >
                {currentLabel}
              </p>
              {latitude != null && longitude != null && (
                <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 mt-0.5 tabular-nums">
                  {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </p>
              )}
            </>
          ) : (
            <p
              className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5"
              style={urduStyle}
            >
              {isUrdu
                ? 'دقیق نماز اوقات کے لیے اپنا مقام شیئر کریں۔'
                : 'Share your location for accurate prayer times.'}
            </p>
          )}

          <p
            className="text-[10px] text-amber-700 dark:text-amber-300/80 mt-1.5 italic leading-snug"
            style={urduStyle}
          >
            {isUrdu
              ? '💡 ڈیسک ٹاپ پر مقام ISP کے مطابق ہوتا ہے۔ موبائل سے GPS لینے پر زیادہ درست آتا ہے۔'
              : '💡 Desktop uses IP/WiFi (often off by miles). Open the app on your phone for GPS-accurate location.'}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={requestLocation}
              disabled={pending}
              className="rounded-full bg-emerald-brand text-cream px-4 py-1.5 text-xs font-semibold hover:scale-[1.03] active:scale-[0.97] transition-transform glow-emerald disabled:opacity-50"
            >
              {pending
                ? isUrdu
                  ? 'محفوظ ہو رہا ہے…'
                  : 'Saving…'
                : hasCoords
                  ? isUrdu
                    ? 'دوبارہ حاصل کریں'
                    : 'Re-detect'
                  : isUrdu
                    ? 'مقام فعال کریں'
                    : 'Enable Location'}
            </button>
            {hasCoords && (
              <button
                type="button"
                onClick={clearLocation}
                disabled={pending}
                className="rounded-full border-2 border-red-400/40 text-red-600 dark:text-red-400 px-4 py-1.5 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50"
              >
                {isUrdu ? 'مقام صاف کریں' : 'Clear'}
              </button>
            )}
          </div>

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
