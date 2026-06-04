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

// ---------- One-time cache nuke (v3) ----------
// Users who installed the PWA before the env-var fix have an old precache
// cache that doesn't include the VAPID public key. Bumping CACHE_VERSION
// forces this SW, on activate, to delete EVERY cache that isn't already
// tagged with the current version. Next page load then refetches from the
// network with the new build's chunks.
const CACHE_VERSION = 'v4-2026-06-04'

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys
          .filter((k) => !k.includes(CACHE_VERSION))
          .map((k) => caches.delete(k))
      )
      // Take control of all open tabs/PWA windows so they start using this SW
      await self.clients.claim()
      // Tell each client to reload so the new chunks are fetched
      const clients = await self.clients.matchAll({ type: 'window' })
      for (const client of clients) {
        try {
          await client.navigate(client.url)
        } catch {
          /* ignore — some clients (cross-origin etc.) refuse navigate */
        }
      }
    })()
  )
})

// ---------- Push notifications ----------

type PushPayload = {
  title?: string
  body?: string
  prayer?: string
  tag?: string
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
      tag: payload.tag ?? payload.prayer ?? 'salah-notification',
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
