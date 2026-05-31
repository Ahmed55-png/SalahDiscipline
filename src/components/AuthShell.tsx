'use client'

import { motion } from 'framer-motion'
import { BismillahCrest } from './BismillahCrest'
import { type ReactNode } from 'react'

type Props = {
  title: string
  subtitle: string
  children: ReactNode
}

export function AuthShell({ title, subtitle, children }: Props) {
  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 islamic-pattern opacity-50 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-cream/50 via-transparent to-cream dark:from-[#0A1F1A]/50 dark:to-[#0A1F1A] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="relative bg-white/85 dark:bg-[#0F2A22]/80 backdrop-blur-xl border border-gold/30 dark:border-gold/20 rounded-2xl p-8 space-y-6 shadow-2xl shadow-emerald-deep/10">
          <div className="flex justify-center -mt-16 mb-2">
            <div className="bg-cream dark:bg-[#0F2A22] rounded-full p-2 border-2 border-gold/40">
              <BismillahCrest size={64} />
            </div>
          </div>
          <header className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-emerald-deep dark:text-emerald-300 tracking-tight">
              {title}
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{subtitle}</p>
          </header>
          {children}
        </div>
      </motion.div>
    </main>
  )
}

type InputProps = {
  id: string
  name: string
  label: string
  type?: string
  required?: boolean
  minLength?: number
  maxLength?: number
  autoComplete?: string
  placeholder?: string
}

export function AuthInput(props: InputProps) {
  const { id, label, type = 'text', ...rest } = props
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-xs font-medium text-emerald-deep dark:text-emerald-300 uppercase tracking-wider"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        {...rest}
        className="w-full rounded-lg border border-emerald-brand/20 dark:border-emerald-light/20 bg-white dark:bg-[#0A1F1A] px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/30 transition-all duration-200"
      />
    </div>
  )
}

type ButtonProps = {
  pending: boolean
  pendingLabel: string
  label: string
}

export function AuthSubmit({ pending, pendingLabel, label }: ButtonProps) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="group relative w-full rounded-lg bg-emerald-brand text-cream py-2.5 text-sm font-semibold tracking-wide overflow-hidden transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed glow-emerald"
    >
      <span className="relative z-10">
        {pending ? pendingLabel : label}
      </span>
      <span className="absolute inset-0 bg-gradient-to-r from-emerald-brand via-emerald-light to-emerald-brand opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </button>
  )
}
