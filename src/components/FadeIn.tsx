'use client'

import { motion, type Variants } from 'framer-motion'
import { type ReactNode } from 'react'

type Props = {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
}

const variants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (custom: { delay: number; y: number }) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom.delay,
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
}

export function FadeIn({ children, delay = 0, y = 16, className }: Props) {
  return (
    <motion.div
      className={className}
      variants={variants}
      custom={{ delay, y }}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  )
}
