'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  qiblaBearing,
  qiblaDistanceKm,
  shortestRotation,
} from '@/lib/qibla/bearing'

type Coords = { lat: number; lon: number }
type LocationStatus =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'ok'; coords: Coords }
  | { kind: 'error'; message: string }

type CompassStatus =
  | { kind: 'idle' } // haven't asked yet
  | { kind: 'unsupported' }
  | { kind: 'needs-permission' } // iOS
  | { kind: 'denied' }
  | { kind: 'active' }

// Types used to speak to iOS' Safari-only permission API without pulling
// in a global augmentation.
type DeviceOrientationEventStatic = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>
}

type OrientationEventWithCompass = DeviceOrientationEvent & {
  webkitCompassHeading?: number
}

export function QiblaCompass() {
  const [location, setLocation] = useState<LocationStatus>({ kind: 'idle' })
  const [compass, setCompass] = useState<CompassStatus>({ kind: 'idle' })
  const [heading, setHeading] = useState<number | null>(null)

  // Accumulated dial rotation. We can't just use `-heading` because framer
  // will take the long way around when heading crosses 359° -> 1°. So we
  // track deltas and add them up — the dial can rotate past 360° freely.
  const [dialRotation, setDialRotation] = useState(0)
  const [arrowRotation, setArrowRotation] = useState(0)
  const prevHeadingRef = useRef<number | null>(null)
  const prevBearingRef = useRef<number | null>(null)
  // Was a compass event received? If not after activation we surface a
  // "no compass detected" hint (desktop, PWA on hardware without a sensor).
  const [gotOrientationEvent, setGotOrientationEvent] = useState(false)

  const bearing =
    location.kind === 'ok'
      ? qiblaBearing(location.coords.lat, location.coords.lon)
      : null
  const distance =
    location.kind === 'ok'
      ? qiblaDistanceKm(location.coords.lat, location.coords.lon)
      : null

  const requestLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocation({
        kind: 'error',
        message: 'Geolocation is not available in this browser.',
      })
      return
    }
    setLocation({ kind: 'loading' })
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          kind: 'ok',
          coords: { lat: pos.coords.latitude, lon: pos.coords.longitude },
        })
      },
      (err) => {
        setLocation({
          kind: 'error',
          message:
            err.code === err.PERMISSION_DENIED
              ? 'Location permission was denied. Enable it in your browser settings.'
              : 'Could not read your location. Try again.',
        })
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 }
    )
  }, [])

  useEffect(() => {
    requestLocation()
  }, [requestLocation])

  // Detect iOS-style permission gate up front.
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (typeof DeviceOrientationEvent === 'undefined') {
      setCompass({ kind: 'unsupported' })
      return
    }
    const Ctor = DeviceOrientationEvent as DeviceOrientationEventStatic
    if (typeof Ctor.requestPermission === 'function') {
      setCompass({ kind: 'needs-permission' })
    }
  }, [])

  // Attach the orientation listener once compass is active.
  useEffect(() => {
    if (compass.kind !== 'active') return

    const onOrient = (e: DeviceOrientationEvent) => {
      const ev = e as OrientationEventWithCompass
      // iOS Safari exposes an absolute heading directly.
      if (typeof ev.webkitCompassHeading === 'number') {
        setHeading(ev.webkitCompassHeading)
        setGotOrientationEvent(true)
        return
      }
      // Chromium: `alpha` is 0 when device Y-axis points to magnetic north
      // (counter-clockwise). Convert to clockwise-from-north heading.
      if (typeof ev.alpha === 'number') {
        setHeading((360 - ev.alpha) % 360)
        setGotOrientationEvent(true)
      }
    }

    const abs = 'ondeviceorientationabsolute' in window
    const evName = abs ? 'deviceorientationabsolute' : 'deviceorientation'
    window.addEventListener(evName, onOrient as EventListener)
    return () => window.removeEventListener(evName, onOrient as EventListener)
  }, [compass.kind])

  // Accumulate dial rotation using shortest-path deltas, so a spin from
  // 359° to 1° goes +2° clockwise (not -358°).
  useEffect(() => {
    if (heading === null) return
    const prev = prevHeadingRef.current
    if (prev === null) {
      prevHeadingRef.current = heading
      setDialRotation(-heading)
      return
    }
    let delta = heading - prev
    if (delta > 180) delta -= 360
    if (delta < -180) delta += 360
    prevHeadingRef.current = heading
    // The dial rotates opposite to the phone so N stays fixed.
    setDialRotation((r) => r - delta)
  }, [heading])

  // Same accumulator for the centre arrow (the shortest rotation from your
  // heading to the Qibla bearing). If the target flips across ±180 we still
  // want a smooth turn.
  useEffect(() => {
    if (heading === null || location.kind !== 'ok') return
    const target = shortestRotation(
      heading,
      qiblaBearing(location.coords.lat, location.coords.lon)
    )
    const prev = prevBearingRef.current
    if (prev === null) {
      prevBearingRef.current = target
      setArrowRotation(target)
      return
    }
    let delta = target - prev
    if (delta > 180) delta -= 360
    if (delta < -180) delta += 360
    prevBearingRef.current = target
    setArrowRotation((r) => r + delta)
  }, [heading, location])

  // After the compass goes active, wait a short beat. If we never received
  // an orientation event, we're on hardware without a magnetometer.
  useEffect(() => {
    if (compass.kind !== 'active') return
    if (gotOrientationEvent) return
    const t = window.setTimeout(() => {
      if (!gotOrientationEvent) setCompass({ kind: 'unsupported' })
    }, 2500)
    return () => window.clearTimeout(t)
  }, [compass.kind, gotOrientationEvent])

  const enableCompass = useCallback(async () => {
    if (typeof DeviceOrientationEvent === 'undefined') {
      setCompass({ kind: 'unsupported' })
      return
    }
    const Ctor = DeviceOrientationEvent as DeviceOrientationEventStatic
    if (typeof Ctor.requestPermission === 'function') {
      try {
        const result = await Ctor.requestPermission()
        setCompass(result === 'granted' ? { kind: 'active' } : { kind: 'denied' })
      } catch {
        setCompass({ kind: 'denied' })
      }
      return
    }
    setCompass({ kind: 'active' })
  }, [])

  // Auto-activate on non-iOS browsers.
  useEffect(() => {
    if (compass.kind === 'idle') {
      const Ctor =
        typeof DeviceOrientationEvent !== 'undefined'
          ? (DeviceOrientationEvent as DeviceOrientationEventStatic)
          : null
      if (Ctor && typeof Ctor.requestPermission !== 'function') {
        setCompass({ kind: 'active' })
      }
    }
  }, [compass.kind])

  const rotation =
    bearing !== null && heading !== null
      ? shortestRotation(heading, bearing)
      : null
  const aligned = rotation !== null && Math.abs(rotation) <= 5

  return (
    <div className="space-y-5">
      {/* Location card */}
      {location.kind === 'error' && (
        <div className="rounded-2xl border border-red-400/40 bg-red-50/70 dark:bg-red-950/30 p-3 text-center">
          <p className="text-xs text-red-700 dark:text-red-300">
            {location.message}
          </p>
          <button
            type="button"
            onClick={requestLocation}
            className="mt-2 rounded-full bg-red-500 text-white px-4 py-1.5 text-xs font-bold shadow"
          >
            Try again
          </button>
        </div>
      )}

      {/* Compass permission gate (iOS) */}
      {compass.kind === 'needs-permission' && (
        <div className="rounded-2xl border border-gold/40 bg-gradient-to-br from-gold-soft/40 via-white to-emerald-50/40 dark:from-gold/10 dark:via-emerald-deep/40 dark:to-emerald-deep/60 p-4 text-center space-y-2">
          <p className="text-sm font-semibold text-emerald-deep dark:text-emerald-200">
            Enable your device compass
          </p>
          <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
            iOS needs your permission before it will share the compass heading.
          </p>
          <button
            type="button"
            onClick={enableCompass}
            className="rounded-full bg-emerald-brand text-cream px-4 py-2 text-xs font-bold shadow-md shadow-emerald-brand/30 hover:bg-emerald-deep transition-colors"
          >
            Enable compass
          </button>
        </div>
      )}
      {compass.kind === 'denied' && (
        <p className="text-center text-[11px] text-zinc-500 dark:text-zinc-400 italic">
          Compass permission denied. You can still see the Qibla bearing below.
        </p>
      )}
      {compass.kind === 'unsupported' && (
        <div className="rounded-2xl border border-emerald-brand/20 bg-white/70 dark:bg-[#0F2A22]/60 backdrop-blur-md p-3 text-center space-y-1">
          <p className="text-xs font-semibold text-emerald-deep dark:text-emerald-200">
            No compass detected on this device
          </p>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
            Phone pe kholo (real magnetometer chahiye), ya neeche bearing use
            karke physical compass se face karo.
          </p>
        </div>
      )}
      {compass.kind === 'active' && !gotOrientationEvent && (
        <p className="text-center text-[11px] text-zinc-500 dark:text-zinc-400 italic">
          Detecting compass… move your phone in a figure-8 to calibrate.
        </p>
      )}

      {/* The compass dial */}
      <div className="relative mx-auto aspect-square w-full max-w-xs">
        {/* Outer glow */}
        <div className="absolute inset-0 rounded-full bg-gold/25 blur-3xl" />

        {/* Rotating card (rotates opposite to the heading so N always points
             to true north). */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-gold/60 bg-gradient-to-br from-cream via-white to-gold-soft/40 dark:from-[#0F2A22] dark:via-[#0A1F1A] dark:to-emerald-deep/40 shadow-2xl shadow-emerald-deep/30"
          animate={{ rotate: dialRotation }}
          transition={{ type: 'spring', stiffness: 120, damping: 20, mass: 0.6 }}
        >
          {/* Islamic pattern in the dial */}
          <div className="absolute inset-4 rounded-full islamic-pattern-dense opacity-30 pointer-events-none" />

          {/* Cardinal markers */}
          {(
            [
              { label: 'N', angle: 0, accent: true },
              { label: 'E', angle: 90, accent: false },
              { label: 'S', angle: 180, accent: false },
              { label: 'W', angle: 270, accent: false },
            ] as const
          ).map((c) => (
            <div
              key={c.label}
              className="absolute inset-0 flex items-start justify-center"
              style={{ transform: `rotate(${c.angle}deg)` }}
            >
              <span
                className={`mt-2 text-xs font-bold tracking-widest ${
                  c.accent
                    ? 'text-red-500 dark:text-red-400'
                    : 'text-emerald-deep dark:text-emerald-200'
                }`}
                style={{ transform: `rotate(${-c.angle}deg)` }}
              >
                {c.label}
              </span>
            </div>
          ))}

          {/* Tick marks every 30° */}
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute inset-0 flex items-start justify-center"
              style={{ transform: `rotate(${i * 30}deg)` }}
            >
              <span className="mt-1 block h-2 w-0.5 bg-emerald-deep/50 dark:bg-emerald-200/50" />
            </div>
          ))}

          {/* Kaaba marker at the Qibla bearing */}
          {bearing !== null && (
            <div
              className="absolute inset-0 flex items-start justify-center"
              style={{ transform: `rotate(${bearing}deg)` }}
            >
              <div
                className="mt-4 flex flex-col items-center gap-1"
                style={{ transform: `rotate(${-bearing}deg)` }}
              >
                <span className="text-2xl" aria-hidden>
                  🕋
                </span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Fixed pointer (top center) — shows where the phone is aiming */}
        <div className="absolute inset-x-0 top-0 flex justify-center -translate-y-1 pointer-events-none">
          <svg width="18" height="24" viewBox="0 0 18 24" aria-hidden>
            <path
              d="M9 0 L18 22 L9 17 L0 22 Z"
              fill={aligned ? '#10B981' : '#D4AF37'}
              stroke={aligned ? '#064E3B' : '#0F5132'}
              strokeWidth="1"
            />
          </svg>
        </div>

        {/* Center Qibla arrow (always points to Kaaba relative to phone) */}
        {rotation !== null && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            animate={{ rotate: arrowRotation }}
            transition={{ type: 'spring', stiffness: 120, damping: 20, mass: 0.6 }}
          >
            <svg width="60" height="140" viewBox="0 0 60 140" aria-hidden>
              <defs>
                <linearGradient id="arrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={aligned ? '#10B981' : '#D4AF37'}
                  />
                  <stop
                    offset="100%"
                    stopColor={aligned ? '#064E3B' : '#F4D03F'}
                  />
                </linearGradient>
              </defs>
              <path
                d="M30 10 L46 40 L34 40 L34 105 L26 105 L26 40 L14 40 Z"
                fill="url(#arrGrad)"
                stroke={aligned ? '#064E3B' : '#0F5132'}
                strokeWidth="1"
              />
              <circle
                cx="30"
                cy="120"
                r="7"
                fill={aligned ? '#064E3B' : '#0F5132'}
              />
            </svg>
          </motion.div>
        )}

        {/* Aligned banner */}
        <AnimatePresence>
          {aligned && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-x-0 -bottom-3 flex justify-center"
            >
              <span className="rounded-full bg-emerald-brand text-cream text-[10px] font-bold uppercase tracking-widest px-3 py-1 shadow-lg shadow-emerald-brand/40">
                ✓ Facing the Qibla
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Readouts */}
      {location.kind === 'ok' && bearing !== null && distance !== null && (
        <div className="grid grid-cols-3 gap-2">
          <ReadoutCard label="Qibla bearing" value={`${bearing.toFixed(1)}°`} />
          <ReadoutCard
            label="Distance to Kaaba"
            value={`${Math.round(distance).toLocaleString()} km`}
          />
          <ReadoutCard
            label="Your heading"
            value={heading !== null ? `${heading.toFixed(0)}°` : '—'}
          />
        </div>
      )}

      {/* Turn hint */}
      {rotation !== null && !aligned && (
        <p className="text-center text-xs text-zinc-600 dark:text-zinc-400">
          Turn{' '}
          <span className="font-bold text-emerald-deep dark:text-emerald-200">
            {rotation > 0 ? 'right' : 'left'} by{' '}
            {Math.abs(rotation).toFixed(0)}°
          </span>{' '}
          to face the Kaaba.
        </p>
      )}
      {rotation === null && bearing !== null && (
        <p className="text-center text-xs text-zinc-600 dark:text-zinc-400 italic">
          Enable the compass above for a live pointer, or use a physical
          compass and turn to {bearing.toFixed(0)}° from true north.
        </p>
      )}

      {/* Coordinates + refresh */}
      {location.kind === 'ok' && (
        <div className="flex items-center justify-between rounded-full border border-emerald-brand/20 bg-white/70 dark:bg-[#0F2A22]/60 backdrop-blur-md px-4 py-2">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            {location.coords.lat.toFixed(4)}°, {location.coords.lon.toFixed(4)}°
          </span>
          <button
            type="button"
            onClick={requestLocation}
            className="text-[10px] uppercase tracking-widest font-bold text-emerald-deep dark:text-emerald-200 hover:text-gold dark:hover:text-gold-light transition-colors"
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  )
}

function ReadoutCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-emerald-brand/20 bg-white/85 dark:bg-[#0F2A22]/70 backdrop-blur-md px-3 py-2 text-center">
      <p className="text-[9px] uppercase tracking-widest text-gold dark:text-gold-light/80 font-semibold">
        {label}
      </p>
      <p className="text-sm font-bold text-emerald-deep dark:text-emerald-200 tabular-nums mt-0.5">
        {value}
      </p>
    </div>
  )
}
