'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'salah:install-dismissed-at'
const DISMISS_DAYS = 7

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Already installed / running as PWA
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    setIsStandalone(standalone)
    if (standalone) return

    // User dismissed recently?
    const dismissedAt = localStorage.getItem(DISMISS_KEY)
    if (dismissedAt) {
      const ageDays = (Date.now() - Number(dismissedAt)) / 86_400_000
      if (ageDays < DISMISS_DAYS) return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (isStandalone || !deferredPrompt) return null

  const handleInstall = async () => {
    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    if (choice.outcome === 'dismissed') {
      localStorage.setItem(DISMISS_KEY, String(Date.now()))
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setDeferredPrompt(null)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ type: 'spring', stiffness: 240, damping: 22 }}
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-40"
      >
        <div className="relative overflow-hidden rounded-2xl border border-gold/40 bg-gradient-to-br from-white via-white to-gold-soft/30 dark:from-[#0F2A22] dark:via-[#0F2A22] dark:to-emerald-deep/40 p-4 shadow-2xl shadow-emerald-deep/20 backdrop-blur-xl">
          <div className="absolute inset-0 islamic-pattern-dense opacity-[0.06] pointer-events-none" />
          <div className="relative flex items-start gap-3">
            <div className="text-3xl float-soft" aria-hidden>
              📲
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-emerald-deep dark:text-emerald-200 text-sm">
                Install as an app
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                Home screen icon, full screen, notifications support.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleInstall}
                  className="rounded-full bg-emerald-brand text-cream px-4 py-1.5 text-xs font-semibold hover:scale-[1.03] active:scale-[0.97] transition-transform glow-emerald"
                >
                  Install
                </button>
                <button
                  onClick={handleDismiss}
                  className="rounded-full px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
