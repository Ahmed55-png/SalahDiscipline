'use client'

import { motion } from 'framer-motion'
import { useLanguage } from './LanguageProvider'

type Props = {
  className?: string
}

export function LanguageToggle({ className = '' }: Props) {
  const { lang, toggle, isUrdu } = useLanguage()

  return (
    <motion.button
      type="button"
      onClick={toggle}
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.05 }}
      aria-label={`Switch language (current: ${lang.toUpperCase()})`}
      title={isUrdu ? 'انگریزی پر بدلیں' : 'Switch to Urdu'}
      className={`relative flex items-center gap-1.5 rounded-full border border-gold/40 bg-white/70 dark:bg-[#0F2A22]/70 backdrop-blur-md px-2.5 py-1.5 text-emerald-deep dark:text-emerald-200 hover:border-gold transition-colors ${className}`}
    >
      {/* Globe icon */}
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
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" />
        <path d="M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z" />
      </svg>
      <span className="text-[10px] font-bold uppercase tracking-widest">
        {isUrdu ? 'UR' : 'EN'}
      </span>
    </motion.button>
  )
}
