'use client'

import { useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

/**
 * Opens a drawer when the page is loaded with `?open=<value>` in the
 * URL, then strips that param so a refresh doesn't keep reopening it.
 *
 * Used by BottomNav so the same nav item works whether the user is
 * already on the host page or is navigating in from elsewhere.
 */
export function useOpenOnParam(
  value: string,
  setOpen: (b: boolean) => void
): void {
  const params = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (params.get('open') === value) {
      setOpen(true)
      const next = new URLSearchParams(params.toString())
      next.delete('open')
      const qs = next.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    }
  }, [params, value, pathname, router, setOpen])
}
