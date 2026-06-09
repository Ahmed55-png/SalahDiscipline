'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ZIKR_LIST, CATEGORY_LABEL, type Zikr } from '@/lib/zikr/list'

type Props = {
  open: boolean
  onClose: () => void
  activeId: string
  onSelect: (zikr: Zikr) => void
}

export function AdhkarDrawer({ open, onClose, activeId, onSelect }: Props) {
  // Lock body scroll while open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // ESC closes
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Group by category
  const grouped = ZIKR_LIST.reduce<Record<string, Zikr[]>>((acc, z) => {
    if (!acc[z.category]) acc[z.category] = []
    acc[z.category].push(z)
    return acc
  }, {})

  const categoryOrder: Array<Zikr['category']> = [
    'post-salah',
    'daily',
    'durood',
    'morning-evening',
  ]

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-emerald-deep/40 backdrop-blur-sm z-40"
            aria-hidden
          />

          <motion.aside
            key="drawer"
            role="dialog"
            aria-label="Adhkar"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 36 }}
            className="fixed inset-y-0 right-0 z-50 w-[85%] sm:w-full sm:max-w-md bg-cream dark:bg-[#0A1F1A] border-l border-gold/30 shadow-2xl shadow-emerald-deep/40 overflow-y-auto"
          >
            <div className="absolute inset-0 islamic-pattern opacity-30 pointer-events-none" />

            <div className="relative p-4 sm:p-5 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-emerald-deep dark:text-emerald-200">
                    All Adhkar
                  </h2>
                  <p
                    className="text-xs text-gold-light"
                    style={{ fontFamily: 'var(--font-amiri)' }}
                  >
                    أَذْكَار
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close adhkar list"
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-emerald-brand/30 hover:bg-emerald-brand/10 text-emerald-deep dark:text-emerald-200 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Categories */}
              {categoryOrder.map((cat) => {
                const items = grouped[cat]
                if (!items || items.length === 0) return null
                return (
                  <section key={cat} className="space-y-2">
                    <h3 className="text-[10px] uppercase tracking-widest text-gold dark:text-gold-light/80 font-semibold px-1">
                      {CATEGORY_LABEL[cat]}
                    </h3>
                    <ul className="space-y-2">
                      {items.map((z) => {
                        const isActive = z.id === activeId
                        return (
                          <li key={z.id}>
                            <button
                              type="button"
                              onClick={() => {
                                onSelect(z)
                                onClose()
                              }}
                              className={`w-full text-left rounded-xl border-2 px-4 py-3 transition-all ${
                                isActive
                                  ? 'border-gold bg-gradient-to-r from-gold-soft/40 to-emerald-50/40 dark:from-gold/15 dark:to-emerald-deep/40'
                                  : 'border-emerald-brand/20 bg-white/85 dark:bg-[#0F2A22]/70 hover:border-gold/50'
                              }`}
                            >
                              <p
                                dir="rtl"
                                className="text-base text-emerald-deep dark:text-gold-soft leading-relaxed"
                                style={{ fontFamily: 'var(--font-amiri)' }}
                              >
                                {z.arabic}
                              </p>
                              <div className="mt-1 flex items-center justify-between gap-3">
                                <span className="text-xs font-semibold text-emerald-deep dark:text-emerald-200">
                                  {z.translit}
                                </span>
                                <span className="text-[10px] uppercase tracking-widest text-gold dark:text-gold-light/80 font-semibold shrink-0">
                                  × {z.target}
                                </span>
                              </div>
                              <p className="mt-0.5 text-[11px] text-zinc-600 dark:text-zinc-400 italic line-clamp-2">
                                {z.english}
                              </p>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  </section>
                )
              })}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
