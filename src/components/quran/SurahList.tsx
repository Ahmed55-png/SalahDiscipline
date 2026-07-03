'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import type { SurahMeta } from '@/lib/api/quran'

type Props = {
  surahs: SurahMeta[]
}

export function SurahList({ surahs }: Props) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return surahs
    return surahs.filter((s) => {
      if (String(s.number) === q) return true
      if (s.englishName.toLowerCase().includes(q)) return true
      if (s.englishNameTranslation.toLowerCase().includes(q)) return true
      if (s.name.includes(query.trim())) return true
      return false
    })
  }, [surahs, query])

  return (
    <div className="space-y-3">
      <div className="relative">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search surah by name or number…"
          className="w-full rounded-full border border-emerald-brand/20 dark:border-emerald-light/20 bg-white dark:bg-[#0A1F1A] pl-10 pr-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/30 transition-all duration-200"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 italic py-6">
          No surah matches &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((s, idx) => (
            <motion.li
              key={s.number}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx, 25) * 0.015 }}
            >
              <Link
                href={`/quran/surah/${s.number}`}
                className="flex items-center gap-3 rounded-xl border border-emerald-brand/20 bg-white/85 dark:bg-[#0F2A22]/70 backdrop-blur-md px-3 py-2.5 hover:border-gold/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition-colors"
              >
                <span className="relative flex h-9 w-9 items-center justify-center shrink-0">
                  <svg width="36" height="36" viewBox="0 0 100 100" aria-hidden>
                    <path
                      d="M50 8 L60 22 L78 22 L78 40 L92 50 L78 60 L78 78 L60 78 L50 92 L40 78 L22 78 L22 60 L8 50 L22 40 L22 22 L40 22 Z"
                      fill="none"
                      stroke="#D4AF37"
                      strokeWidth="3"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold tabular-nums text-emerald-deep dark:text-emerald-200">
                    {s.number}
                  </span>
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-semibold text-emerald-deep dark:text-emerald-200 truncate">
                      {s.englishName}
                    </span>
                    <span
                      className="text-base text-gold dark:text-gold-light shrink-0"
                      style={{ fontFamily: 'var(--font-amiri)' }}
                      dir="rtl"
                    >
                      {s.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mt-0.5">
                    <span>{s.englishNameTranslation}</span>
                    <span aria-hidden>·</span>
                    <span>{s.numberOfAyahs} ayahs</span>
                    <span aria-hidden>·</span>
                    <span>{s.revelationType}</span>
                  </div>
                </div>
              </Link>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  )
}
