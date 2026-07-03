'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Zikr } from './list'

export type CustomZikr = Zikr & { isCustom: true; createdAt: number }

const STORAGE_KEY = 'salah:custom-adhkar-v1'

function safeLoad(): CustomZikr[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (z): z is CustomZikr =>
        z &&
        typeof z.id === 'string' &&
        typeof z.translit === 'string' &&
        typeof z.target === 'number' &&
        z.isCustom === true
    )
  } catch {
    return []
  }
}

function safeSave(list: CustomZikr[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    /* ignore */
  }
}

export type NewCustomZikr = {
  name: string
  arabic?: string
  target: number
}

export function useCustomAdhkar() {
  const [list, setList] = useState<CustomZikr[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setList(safeLoad())
    setHydrated(true)
  }, [])

  const add = useCallback((input: NewCustomZikr): CustomZikr => {
    const cleanName = input.name.trim() || 'My Zikr'
    const cleanArabic = (input.arabic ?? '').trim()
    const target = Math.max(1, Math.min(9999, Math.floor(input.target) || 33))
    const created: CustomZikr = {
      id: `custom-${Date.now().toString(36)}-${Math.random()
        .toString(36)
        .slice(2, 7)}`,
      translit: cleanName,
      arabic: cleanArabic,
      urdu: '',
      english: cleanName,
      target,
      category: 'daily',
      isCustom: true,
      createdAt: Date.now(),
    }
    setList((prev) => {
      const next = [created, ...prev]
      safeSave(next)
      return next
    })
    return created
  }, [])

  const remove = useCallback((id: string) => {
    setList((prev) => {
      const next = prev.filter((z) => z.id !== id)
      safeSave(next)
      return next
    })
  }, [])

  return { list, add, remove, hydrated }
}

/**
 * One-shot lookup helper for non-React code paths (e.g. tasbih page
 * hydrating from a saved zikr id that may be a custom one).
 */
export function loadCustomAdhkar(): CustomZikr[] {
  return safeLoad()
}

export function customZikrById(id: string): CustomZikr | undefined {
  return safeLoad().find((z) => z.id === id)
}
