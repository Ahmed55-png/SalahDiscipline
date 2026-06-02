'use client'

import { motion } from 'framer-motion'
import { useTheme } from './ThemeProvider'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, cycle } = useTheme()

  const label =
    theme === 'light'
      ? 'Light mode (click for dark)'
      : theme === 'dark'
        ? 'Dark mode (click for system)'
        : 'System theme (click for light)'

  const icon = theme === 'light' ? '☀' : theme === 'dark' ? '🌙' : '🖥'

  return (
    <motion.button
      type="button"
      onClick={cycle}
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.05 }}
      aria-label={label}
      title={label}
      className={`relative flex items-center justify-center w-9 h-9 rounded-full border border-gold/40 bg-white/70 dark:bg-[#0F2A22]/70 backdrop-blur-md text-base hover:border-gold transition-colors ${className}`}
    >
      <span aria-hidden>{icon}</span>
    </motion.button>
  )
}
