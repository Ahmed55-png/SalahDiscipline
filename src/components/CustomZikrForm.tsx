'use client'

import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import type { NewCustomZikr } from '@/lib/zikr/custom'

type Props = {
  onCreate: (zikr: NewCustomZikr) => void
  onCancel: () => void
}

const TARGET_PRESETS = [33, 50, 100, 200, 500, 1000]

export function CustomZikrForm({ onCreate, onCancel }: Props) {
  const [name, setName] = useState('')
  const [arabic, setArabic] = useState('')
  const [target, setTarget] = useState<number>(100)
  const [customTarget, setCustomTarget] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const finalTarget = customTarget
      ? Math.max(1, Math.min(9999, parseInt(customTarget, 10) || target))
      : target
    if (!name.trim()) return
    onCreate({ name: name.trim(), arabic: arabic.trim() || undefined, target: finalTarget })
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border-2 border-gold/50 bg-gradient-to-br from-gold-soft/40 via-white to-emerald-50/40 dark:from-gold/10 dark:via-emerald-deep/40 dark:to-emerald-deep/60 p-4 space-y-3 shadow-lg shadow-emerald-deep/10"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-emerald-deep dark:text-emerald-200">
          Add your zikr
        </h4>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel"
          className="w-7 h-7 flex items-center justify-center rounded-full border border-emerald-brand/30 hover:bg-emerald-brand/10 text-emerald-deep dark:text-emerald-200 text-xs transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] uppercase tracking-widest text-gold dark:text-gold-light/80 font-semibold">
          Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Ya Hayyu Ya Qayyum"
          maxLength={60}
          required
          className="w-full rounded-lg border border-emerald-brand/30 bg-white dark:bg-[#0A1F1A] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/30 transition-all"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] uppercase tracking-widest text-gold dark:text-gold-light/80 font-semibold">
          Arabic (optional)
        </label>
        <input
          type="text"
          value={arabic}
          onChange={(e) => setArabic(e.target.value)}
          placeholder="يَا حَيُّ يَا قَيُّوم"
          maxLength={100}
          dir="rtl"
          className="w-full rounded-lg border border-emerald-brand/30 bg-white dark:bg-[#0A1F1A] px-3 py-2 text-base text-zinc-900 dark:text-gold-soft placeholder:text-zinc-400 focus:outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/30 transition-all text-right"
          style={{ fontFamily: 'var(--font-amiri)' }}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] uppercase tracking-widest text-gold dark:text-gold-light/80 font-semibold">
          How many times?
        </label>
        <div className="flex flex-wrap gap-1.5">
          {TARGET_PRESETS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => {
                setTarget(n)
                setCustomTarget('')
              }}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                target === n && !customTarget
                  ? 'bg-emerald-brand text-cream shadow'
                  : 'border border-emerald-brand/30 text-emerald-deep dark:text-emerald-200 hover:bg-emerald-brand/10'
              }`}
            >
              {n}
            </button>
          ))}
          <input
            type="number"
            min={1}
            max={9999}
            value={customTarget}
            onChange={(e) => setCustomTarget(e.target.value)}
            placeholder="Custom"
            className="w-20 rounded-full border border-emerald-brand/30 bg-white dark:bg-[#0A1F1A] px-3 py-1 text-xs text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/30 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-emerald-brand/30 px-4 py-1.5 text-xs font-semibold text-emerald-deep dark:text-emerald-200 hover:bg-emerald-brand/10 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!name.trim()}
          className="rounded-full bg-emerald-brand text-cream px-4 py-1.5 text-xs font-bold shadow-md shadow-emerald-brand/30 hover:bg-emerald-deep transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Add zikr
        </button>
      </div>
    </motion.form>
  )
}
