'use client'

import { animate, useMotionValue, useTransform, motion } from 'framer-motion'
import { useEffect } from 'react'

type Props = {
  value: number
  duration?: number
  className?: string
}

export function AnimatedNumber({ value, duration = 0.9, className }: Props) {
  const mv = useMotionValue(0)
  const rounded = useTransform(mv, (v) => Math.round(v).toString())

  useEffect(() => {
    const controls = animate(mv, value, { duration, ease: [0.16, 1, 0.3, 1] })
    return controls.stop
  }, [value, duration, mv])

  return <motion.span className={className}>{rounded}</motion.span>
}
