/// <reference lib="webworker" />

import { defaultCache } from '@serwist/next/worker'
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist'
import { Serwist } from 'serwist'

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
})

serwist.addEventListeners()

// ---------- Push notifications ----------

type PushPayload = {
  title?: string
  body?: string
  prayer?: string
  url?: string
}

self.addEventListener('push', (event) => {
  let payload: PushPayload = {}
  try {
    payload = event.data?.json() ?? {}
  } catch {
    payload = { body: event.data?.text() }
  }

  const title = payload.title ?? 'Salah Discipline'
  const body = payload.body ?? 'Namaz ka waqt ho gaya'

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/icon',
      badge: '/icon',
      tag: payload.prayer ?? 'salah-notification',
      data: { url: payload.url ?? '/dashboard' },
      requireInteraction: false,
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url =
    (event.notification.data as { url?: string } | undefined)?.url ?? '/dashboard'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // If app is already open, focus it
      for (const client of clients) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus()
        }
      }
      // Else open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(url)
      }
    })
  )
})
