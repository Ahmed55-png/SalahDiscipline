'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { JUZ_LIST } from '@/lib/quran/juz'

export function JuzList() {
  return (
    <ul className="space-y-2">
      {JUZ_LIST.map((j, idx) => (
        <motion.li
          key={j.number}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(idx, 20) * 0.02 }}
        >
          <Link
            href={`/quran/juz/${j.number}`}
            className="flex items-center gap-3 rounded-xl border border-emerald-brand/20 bg-white/85 dark:bg-[#0F2A22]/70 backdrop-blur-md px-3 py-2.5 hover:border-gold/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition-colors"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-deep via-emerald-brand to-emerald-deep text-cream text-xs font-bold tabular-nums shrink-0">
              {j.number}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-semibold text-emerald-deep dark:text-emerald-200 truncate">
                  Para {j.number} · {j.translit}
                </span>
                <span
                  className="text-base text-gold dark:text-gold-light shrink-0"
                  style={{ fontFamily: 'var(--font-amiri)' }}
                  dir="rtl"
                >
                  {j.arabic}
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mt-0.5">
                Starts: Surah {j.startSurahName} · Ayah {j.startAyah}
              </p>
            </div>
          </Link>
        </motion.li>
      ))}
    </ul>
  )
}
