'use client'

import { motion } from 'framer-motion'
import { useCallback, useEffect, useState, useTransition } from 'react'
import { useLanguage } from './LanguageProvider'
import {
  sendReminderCheckAction,
  sendTestPushAction,
  subscribePushAction,
  unsubscribePushAction,
} from '@/app/dashboard/push-actions'
import { urlBase64ToUint8Array } from '@/lib/push/subscribe'

type Permission = NotificationPermission | 'unsupported'

export function NotificationSetup() {
  const { t } = useLanguage()
  const [permission, setPermission] = useState<Permission>('default')
  const [pushSubscribed, setPushSubscribed] = useState(false)
  const [pending, startTransition] = useTransition()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const runReminderCheck = useCallback(() => {
    if (typeof window === 'undefined') return
    const bucket = Math.floor(Date.now() / 600_000)
    const key = `salah:last-reminder-check:${bucket}`
    if (localStorage.getItem(key)) return
    localStorage.setItem(key, String(Date.now()))
    startTransition(async () => {
      const out = await sendReminderCheckAction()
      if (!out.ok && out.error) {
        setMessage(out.error)
      }
    })
  }, [startTransition])

  const saveSubscription = useCallback(async (sub: PushSubscription) => {
    const json = sub.toJSON()
    const p256dh = json.keys?.p256dh
    const auth = json.keys?.auth
    if (!p256dh || !auth) {
      setMessage('Subscription is missing keys.')
      return false
    }

    const out = await subscribePushAction({
      endpoint: sub.endpoint,
      p256dh,
      auth,
      userAgent: navigator.userAgent,
    })
    if (!out.ok) {
      setMessage(out.error ?? 'Failed to save subscription.')
      return false
    }
    return true
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      queueMicrotask(() => setPermission('unsupported'))
      return
    }

    queueMicrotask(() => setPermission(Notification.permission))
    void navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription()
      setPushSubscribed(!!sub)
      if (Notification.permission === 'granted' && sub) {
        startTransition(async () => {
          const saved = await saveSubscription(sub)
          if (saved) setMessage('Subscription synced with server.')
        })
      }
    })
  }, [saveSubscription])

  useEffect(() => {
    if (permission !== 'granted' || !pushSubscribed) return
    runReminderCheck()
    const timer = window.setInterval(runReminderCheck, 10 * 60 * 1000)
    return () => window.clearInterval(timer)
  }, [permission, pushSubscribed, runReminderCheck])

  const enable = async () => {
    setBusy(true)
    setMessage(null)
    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      if (result !== 'granted') {
        setMessage(t('notif.denied'))
        return
      }

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) {
        setMessage(
          'Push not configured yet (NEXT_PUBLIC_VAPID_PUBLIC_KEY missing).'
        )
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

      startTransition(async () => {
        const saved = await saveSubscription(sub)
        if (saved) {
          setPushSubscribed(true)
          setMessage(t('notif.enabled'))
        }
      })
    } catch (e) {
      setMessage('Error: ' + (e instanceof Error ? e.message : 'unknown'))
    } finally {
      setBusy(false)
    }
  }

  const disable = async () => {
    setBusy(true)
    setMessage(null)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await sub.unsubscribe()
        startTransition(async () => {
          await unsubscribePushAction(sub.endpoint)
        })
      }
      setPushSubscribed(false)
      setMessage('Reminders turned off.')
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
      const out = await sendTestPushAction()
      if (out.ok) {
        setMessage(
          `Server test sent to ${out.sent ?? 0}/${out.subscriptions ?? 0} subscription(s).`
        )
      } else {
        setMessage(out.error ?? 'Server push test failed.')
      }
    } catch (e) {
      setMessage(
        'Server push test failed. ' +
          (e instanceof Error ? `(${e.message})` : '')
      )
    } finally {
      setBusy(false)
    }
  }

  if (permission === 'unsupported') {
    return (
      <div className="rounded-2xl border border-zinc-300/40 bg-white/70 dark:bg-[#0F2A22]/60 p-4">
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          {t('notif.unsupported')}
        </p>
      </div>
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
          Bell
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-emerald-deep dark:text-emerald-200">
            {t('notif.title')}
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
            {pushSubscribed
              ? 'Subscribed - prayer + 10-minute ayah test reminders'
              : t('notif.hint')}
          </p>

          <div className="mt-2.5 flex flex-wrap gap-2">
            {permission === 'default' && (
              <button
                onClick={enable}
                disabled={busy || pending}
                className="rounded-full bg-emerald-brand text-cream px-4 py-1.5 text-xs font-semibold hover:scale-[1.03] active:scale-[0.97] transition-transform glow-emerald disabled:opacity-50"
              >
                {busy ? t('notif.asking') : t('notif.enable')}
              </button>
            )}
            {permission === 'granted' && !pushSubscribed && (
              <button
                onClick={enable}
                disabled={busy || pending}
                className="rounded-full bg-emerald-brand text-cream px-4 py-1.5 text-xs font-semibold hover:scale-[1.03] active:scale-[0.97] transition-transform glow-emerald disabled:opacity-50"
              >
                {busy ? 'Subscribing...' : 'Subscribe to reminders'}
              </button>
            )}
            {permission === 'granted' && (
              <>
                <button
                  onClick={sendTest}
                  disabled={busy || pending}
                  className="rounded-full border-2 border-gold/60 text-gold dark:text-gold-light px-4 py-1.5 text-xs font-semibold hover:bg-gold/10 transition-colors disabled:opacity-50"
                >
                  {busy ? t('notif.sending') : t('notif.send_test')}
                </button>
                {pushSubscribed && (
                  <button
                    onClick={disable}
                    disabled={busy || pending}
                    className="rounded-full border-2 border-red-400/40 text-red-600 dark:text-red-400 px-4 py-1.5 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50"
                  >
                    Turn off
                  </button>
                )}
              </>
            )}
            {permission === 'denied' && (
              <p className="text-xs text-red-600 dark:text-red-400 w-full">
                {t('notif.denied')}
              </p>
            )}
          </div>

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
