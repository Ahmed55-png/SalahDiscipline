'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export function TasbihLauncher() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href="/tasbih"
        className="group relative block overflow-hidden rounded-2xl border border-gold/40 bg-gradient-to-r from-gold-soft/30 via-white to-emerald-50/40 dark:from-emerald-deep/60 dark:via-[#0F2A22] dark:to-emerald-deep/40 p-5 shadow-lg shadow-emerald-deep/5 hover:shadow-emerald-deep/15 transition-shadow"
      >
        <div className="absolute inset-0 islamic-pattern-dense opacity-[0.08] pointer-events-none" />
        <div className="relative flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p
              className="text-base text-gold dark:text-gold-light leading-tight"
              style={{ fontFamily: 'var(--font-amiri)' }}
            >
              تَسْبِيح
            </p>
            <h3 className="mt-1 text-sm font-bold text-emerald-deep dark:text-emerald-200">
              Tasbih Counter
            </h3>
            <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
              Tap the bead to count your dhikr. SubhanAllah, Alhamdulillah, and more.
            </p>
          </div>

          {/* Mini bead visual */}
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-full bg-gold/30 blur-xl group-hover:bg-gold/50 transition-colors" />
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-gold via-gold-light to-gold flex items-center justify-center shadow-md shadow-gold/30 ring-2 ring-emerald-deep/20 group-hover:scale-105 transition-transform">
              <div className="absolute inset-1.5 rounded-full bg-gradient-to-br from-emerald-deep via-emerald-brand to-emerald-deep flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 100 100" aria-hidden>
                  <path
                    d="M50 12 L58 26 L74 26 L74 42 L88 50 L74 58 L74 74 L58 74 L50 88 L42 74 L26 74 L26 58 L12 50 L26 42 L26 26 L42 26 Z"
                    fill="none"
                    stroke="#F4D03F"
                    strokeWidth="2"
                    opacity="0.7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <p className="relative mt-3 text-[10px] uppercase tracking-widest text-gold dark:text-gold-light/80 font-semibold flex items-center gap-1">
          Open
          <span aria-hidden>→</span>
        </p>
      </Link>
    </motion.div>
  )
}
