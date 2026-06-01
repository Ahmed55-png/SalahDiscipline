'use client'

import { useEffect, useState } from 'react'

type Props = {
  phrases: readonly string[]
  className?: string
}

/**
 * Renders a phrase that's deterministic on first paint (matches SSR) and
 * shuffles to a random one after mount. Prevents hydration mismatch.
 */
export function RotatingGreeting({ phrases, className }: Props) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex(Math.floor(Math.random() * phrases.length))
  }, [phrases])

  return <span className={className}>{phrases[index]}</span>
}
