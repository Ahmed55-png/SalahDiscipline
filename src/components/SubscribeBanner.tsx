'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useTransition } from 'react'
import { subscribePushAction } from '@/app/dashboard/push-actions'
import { urlBase64ToUint8Array } from '@/lib/push/subscribe'

const DISMISS_KEY = 'salah:notif-banner-dismissed-at'
const DISMISS_HOURS = 24

/**
 * Dashboard-level nudge for users who haven't enabled push yet.
 * Auto-hides if:
 *  - Browser doesn't support notifications, OR
 *  - User already granted permission AND has a push subscription, OR
 *  - User dismissed the banner in the last 24h.
 */
export function SubscribeBanner() {
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return

    const dismissed = localStorage.getItem(DISMISS_KEY)
    if (dismissed) {
      const ageHours = (Date.now() - Number(dismissed)) / 3_600_000
      if (ageHours < DISMISS_HOURS) return
    }

    void (async () => {
      // Already granted + subscribed? Don't show.
      if (Notification.permission === 'granted') {
        try {
          const reg = await navigator.serviceWorker.ready
          const sub = await reg.pushManager.getSubscription()
          if (sub) return
        } catch {
          /* fall through, still show */
        }
      }
      // Denied? Don't show (user has to fix in browser settings).
      if (Notification.permission === 'denied') return

      setShow(true)
    })()
  }, [])

  const enable = async () => {
    setBusy(true)
    setError(null)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setError('Permission denied. Enable in browser settings.')
        setBusy(false)
        return
      }

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) {
        setError('Push not configured (VAPID key missing).')
        setBusy(false)
        return
      }

      const reg = await navigator.serviceWorker.ready
      const existing = await reg.pushManager.getSubscription()
      const sub =
        existing ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
        }))

      const json = sub.toJSON()
      const p256dh = json.keys?.p256dh
      const auth = json.keys?.auth
      if (!p256dh || !auth) {
        setError('Subscription missing keys.')
        setBusy(false)
        return
      }

      startTransition(async () => {
        const out = await subscribePushAction({
          endpoint: sub.endpoint,
          p256dh,
          auth,
          userAgent: navigator.userAgent,
        })
        if (out.ok) {
          setShow(false)
        } else {
          setError(out.error ?? 'Failed to save subscription.')
        }
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setBusy(false)
    }
  }

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()))
    } catch {
      /* ignore */
    }
    setShow(false)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.section
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-2xl border-2 border-gold/50 bg-gradient-to-br from-gold-soft/40 via-white to-emerald-50 dark:from-gold/15 dark:via-[#0F2A22] dark:to-emerald-deep/60 p-4 shadow-lg shadow-emerald-deep/10"
        >
          <div className="absolute inset-0 islamic-pattern-dense opacity-[0.08] pointer-events-none" />
          <div className="relative flex items-start gap-3">
            <div className="text-2xl flame-pulse" aria-hidden>
              🔔
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-emerald-deep dark:text-emerald-200">
                Enable prayer reminders
              </h3>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-0.5">
                Get a push notification at each prayer time on your phone or
                laptop — even when the app is closed.
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={enable}
                  disabled={busy || pending}
                  className="rounded-full bg-emerald-brand text-cream px-4 py-1.5 text-xs font-semibold hover:scale-[1.03] active:scale-[0.97] transition-transform glow-emerald disabled:opacity-50"
                >
                  {busy || pending ? 'Enabling…' : 'Enable Notifications'}
                </button>
                <button
                  type="button"
                  onClick={dismiss}
                  disabled={busy || pending}
                  className="rounded-full px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors disabled:opacity-50"
                >
                  Not now
                </button>
              </div>
              {error && (
                <p className="mt-2 text-[11px] text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
            </div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  )
}
