'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'

type Props = {
  /** Optional prayer label currently being announced (e.g. "Fajr") */
  prayerLabel?: string
  /** Visible only when triggered programmatically by prayer-time match */
  autoTriggerOnMount?: boolean
}

export function AzanPlayer({ prayerLabel, autoTriggerOnMount }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const play = useCallback(async () => {
    setError(null)
    const el = audioRef.current
    if (!el) return
    try {
      el.currentTime = 0
      await el.play()
      setPlaying(true)
    } catch {
      setError(
        'Browser blocked autoplay. Tap the button to play, then it will work for the rest of this session.'
      )
    }
  }, [])

  useEffect(() => {
    if (autoTriggerOnMount) {
      queueMicrotask(() => void play())
    }
  }, [autoTriggerOnMount, play])

  const stop = () => {
    const el = audioRef.current
    if (!el) return
    el.pause()
    el.currentTime = 0
    setPlaying(false)
  }

  return (
    <div className="space-y-2">
      <audio
        ref={audioRef}
        src="/audio/azan.mp3"
        preload="none"
        onEnded={() => setPlaying(false)}
        onError={() => setError('Azan audio file missing. Add public/audio/azan.mp3')}
      />

      <AnimatePresence mode="wait">
        {playing ? (
          <motion.button
            key="stop"
            type="button"
            onClick={stop}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            className="w-full rounded-full bg-red-600 text-white px-4 py-2 text-sm font-semibold shadow-md shadow-red-600/30 flex items-center justify-center gap-2"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-white/70 animate-ping" />
              <span className="relative rounded-full h-2 w-2 bg-white" />
            </span>
            Stop Azan{prayerLabel ? ` · ${prayerLabel}` : ''}
          </motion.button>
        ) : (
          <motion.button
            key="play"
            type="button"
            onClick={play}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            className="w-full rounded-full border-2 border-gold/60 text-gold dark:text-gold-light px-4 py-2 text-sm font-semibold hover:bg-gold/10 transition-colors"
          >
            🔊 {prayerLabel ? `Play ${prayerLabel} Azan` : 'Test Azan'}
          </motion.button>
        )}
      </AnimatePresence>

      {error && (
        <p className="text-[11px] text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}
