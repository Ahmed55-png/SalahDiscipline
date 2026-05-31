'use client'

import { motion } from 'framer-motion'

type Props = {
  className?: string
  size?: number
}

/**
 * Decorative Islamic crest — concentric eight-pointed star with crescent.
 * Pure SVG, animated entrance via framer-motion.
 */
export function BismillahCrest({ className = '', size = 64 }: Props) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      initial={{ opacity: 0, scale: 0.6, rotate: -15 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <defs>
        <linearGradient id="crestGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F4D03F" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#8B6914" />
        </linearGradient>
        <radialGradient id="crestGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FCE7A8" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FCE7A8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#crestGlow)" />
      {/* Eight-pointed star */}
      <motion.path
        d="M50 8 L60 22 L78 22 L78 40 L92 50 L78 60 L78 78 L60 78 L50 92 L40 78 L22 78 L22 60 L8 50 L22 40 L22 22 L40 22 Z"
        fill="none"
        stroke="url(#crestGold)"
        strokeWidth="1.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, delay: 0.2, ease: 'easeInOut' }}
      />
      {/* Inner rotated star */}
      <motion.path
        d="M50 18 L57 28 L69 28 L69 40 L79 50 L69 60 L69 72 L57 72 L50 82 L43 72 L31 72 L31 60 L21 50 L31 40 L31 28 L43 28 Z"
        fill="none"
        stroke="url(#crestGold)"
        strokeWidth="1"
        opacity="0.7"
        initial={{ rotate: 0 }}
        animate={{ rotate: 22.5 }}
        style={{ transformOrigin: 'center' }}
        transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
      />
      {/* Crescent */}
      <motion.path
        d="M44 38 A14 14 0 1 0 44 62 A11 11 0 1 1 44 38 Z"
        fill="url(#crestGold)"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.9 }}
      />
      {/* Star next to crescent */}
      <motion.circle
        cx="60"
        cy="44"
        r="2.5"
        fill="url(#crestGold)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.1 }}
      />
    </motion.svg>
  )
}
