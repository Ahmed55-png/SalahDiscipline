'use client'

import { motion } from 'framer-motion'
import type { AyahPair } from '@/lib/api/quran'

type Props = {
  ayah: AyahPair
}

export function DailyAyah({ ayah }: Props) {
  const { arabic, english } = ayah

  return (
    <motion.section
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-2xl border border-gold/40 bg-gradient-to-br from-gold-soft/30 via-white to-emerald-50/40 dark:from-emerald-deep/60 dark:via-[#0F2A22] dark:to-[#0A1F1A] p-6 sm:p-7 shadow-xl shadow-emerald-deep/10"
    >
      {/* Decorative geometric pattern */}
      <div className="absolute inset-0 islamic-pattern-dense opacity-[0.07] pointer-events-none" />

      {/* Top decorative divider */}
      <div className="relative flex items-center justify-center gap-3 mb-5">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/60 to-gold/80" />
        <svg
          width="20"
          height="20"
          viewBox="0 0 100 100"
          className="opacity-80"
          aria-hidden
        >
          <path
            d="M50 8 L60 22 L78 22 L78 40 L92 50 L78 60 L78 78 L60 78 L50 92 L40 78 L22 78 L22 60 L8 50 L22 40 L22 22 L40 22 Z"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="3"
          />
        </svg>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent via-gold/60 to-gold/80" />
      </div>

      {/* Arabic verse */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.6 }}
        dir="rtl"
        lang="ar"
        className="relative text-2xl sm:text-3xl text-emerald-deep dark:text-gold-soft leading-loose text-center"
        style={{ fontFamily: 'var(--font-amiri)' }}
      >
        {arabic.text}
      </motion.p>

      {/* English translation */}
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="relative mt-5 text-sm sm:text-base text-zinc-700 dark:text-zinc-200 leading-relaxed text-center italic"
      >
        &ldquo;{english.text}&rdquo;
      </motion.p>

      {/* Attribution */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.75, duration: 0.5 }}
        className="relative mt-4 text-center text-[11px] uppercase tracking-widest text-gold dark:text-gold-light font-semibold"
      >
        Surah {english.surah.englishName} · {english.surah.number}:
        {english.numberInSurah}
      </motion.p>

      {/* Bottom decorative divider */}
      <div className="relative flex items-center justify-center mt-5">
        <span className="h-px w-20 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
      </div>
    </motion.section>
  )
}
