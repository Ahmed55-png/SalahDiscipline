'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

type Permission = NotificationPermission | 'unsupported'

export function NotificationSetup() {
  const [permission, setPermission] = useState<Permission>('default')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setPermission('unsupported')
      return
    }
    setPermission(Notification.permission)
  }, [])

  const enable = async () => {
    setBusy(true)
    setMessage(null)
    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      if (result === 'granted') {
        setMessage('✓ Notifications enabled')
      } else if (result === 'denied') {
        setMessage('Permission denied. Enable from browser settings.')
      }
    } catch (e) {
      setMessage('Error: ' + (e instanceof Error ? e.message : 'unknown'))
    } finally {
      setBusy(false)
    }
  }

  const sendTest = async () => {
    setBusy(true)
    setMessage(null)
    try {
      const reg = await navigator.serviceWorker.ready
      await reg.showNotification('Salah Discipline', {
        body: 'Test notification — everything is working! 🌙',
        icon: '/icon',
        badge: '/icon',
        tag: 'test',
        data: { url: '/dashboard' },
      })
      setMessage('Test sent — notification should appear shortly.')
    } catch (e) {
      setMessage(
        'Service worker not ready. Try on the production build (Vercel). ' +
          (e instanceof Error ? `(${e.message})` : '')
      )
    } finally {
      setBusy(false)
    }
  }

  if (permission === 'unsupported') {
    return (
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white/80 dark:bg-[#0F2A22]/70 backdrop-blur-xl p-4"
      >
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          🔕 Notifications are not supported in this browser.
        </p>
      </motion.section>
    )
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-2xl border border-gold/30 dark:border-gold/20 bg-white/85 dark:bg-[#0F2A22]/85 backdrop-blur-xl p-4 shadow-lg shadow-emerald-deep/5"
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl float-soft" aria-hidden>
          🔔
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-emerald-deep dark:text-emerald-200">
            Namaz Reminders
          </h3>

          {permission === 'default' && (
            <>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                Get a reminder on your phone/laptop before each prayer.
              </p>
              <button
                onClick={enable}
                disabled={busy}
                className="mt-2.5 rounded-full bg-emerald-brand text-cream px-4 py-1.5 text-xs font-semibold hover:scale-[1.03] active:scale-[0.97] transition-transform glow-emerald disabled:opacity-50"
              >
                {busy ? 'Asking…' : 'Enable Notifications'}
              </button>
            </>
          )}

          {permission === 'granted' && (
            <>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5 font-medium">
                ✓ Enabled — you&apos;ll be notified
              </p>
              <button
                onClick={sendTest}
                disabled={busy}
                className="mt-2.5 rounded-full border-2 border-gold/60 text-gold dark:text-gold-light px-4 py-1.5 text-xs font-semibold hover:bg-gold/10 transition-colors disabled:opacity-50"
              >
                {busy ? 'Sending…' : 'Send Test Notification'}
              </button>
            </>
          )}

          {permission === 'denied' && (
            <>
              <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                Permission denied. Enable from browser settings (🔒 icon in
                the URL bar).
              </p>
            </>
          )}

          {message && (
            <p className="mt-2 text-[11px] text-zinc-600 dark:text-zinc-400">
              {message}
            </p>
          )}
        </div>
      </div>
    </motion.section>
  )
}
