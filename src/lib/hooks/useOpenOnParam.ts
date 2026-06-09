'use client'

import { useEffect } from 'react'

/**
 * Opens a drawer when the page is loaded with `?open=<value>` in the
 * URL, then strips that param so a refresh doesn't keep reopening it.
 *
 * Uses native browser APIs (window.location + history.replaceState)
 * instead of next/navigation's useSearchParams so the page doesn't
 * need to be wrapped in a Suspense boundary at build time.
 */
export function useOpenOnParam(
  value: string,
  setOpen: (b: boolean) => void
): void {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (params.get('open') !== value) return

    setOpen(true)
    params.delete('open')
    const qs = params.toString()
    const url = qs
      ? `${window.location.pathname}?${qs}`
      : window.location.pathname
    window.history.replaceState(null, '', url)
  }, [value, setOpen])
}
