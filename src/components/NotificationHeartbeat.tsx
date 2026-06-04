'use client'

import { useEffect, useTransition } from 'react'
import {
  sendReminderCheckAction,
  subscribePushAction,
} from '@/app/dashboard/push-actions'

async function syncSubscription(sub: PushSubscription) {
  const json = sub.toJSON()
  const p256dh = json.keys?.p256dh
  const auth = json.keys?.auth
  if (!p256dh || !auth) return false
  const out = await subscribePushAction({
    endpoint: sub.endpoint,
    p256dh,
    auth,
    userAgent: navigator.userAgent,
  })
  return out.ok
}

function shouldRunThisBucket() {
  const bucket = Math.floor(Date.now() / 600_000)
  const key = `salah:last-reminder-check:${bucket}`
  if (localStorage.getItem(key)) return false
  localStorage.setItem(key, String(Date.now()))
  return true
}

export function NotificationHeartbeat() {
  const [, startTransition] = useTransition()

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return
    if (Notification.permission !== 'granted') return

    let cancelled = false
    const run = async () => {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (!sub || cancelled || !shouldRunThisBucket()) return
      startTransition(async () => {
        const synced = await syncSubscription(sub)
        if (synced) await sendReminderCheckAction()
      })
    }

    void run()
    const timer = window.setInterval(() => void run(), 10 * 60 * 1000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [startTransition])

  return null
}
