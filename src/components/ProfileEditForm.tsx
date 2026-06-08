'use client'

import { useState, useTransition } from 'react'
import {
  updateProfileAction,
  type ProfileUpdateInput,
} from '@/app/dashboard/profile-actions'

type Gender = 'male' | 'female' | 'prefer_not_to_say' | ''

export type ProfileEditInitial = {
  username: string
  displayName: string | null
  bio: string | null
  age: number | null
  gender: 'male' | 'female' | 'prefer_not_to_say' | null
}

type Props = {
  initial: ProfileEditInitial
  onDone: () => void
  onCancel: () => void
}

export function ProfileEditForm({ initial, onDone, onCancel }: Props) {
  const [username, setUsername] = useState(initial.username)
  const [displayName, setDisplayName] = useState(initial.displayName ?? '')
  const [bio, setBio] = useState(initial.bio ?? '')
  const [age, setAge] = useState(initial.age != null ? String(initial.age) : '')
  const [gender, setGender] = useState<Gender>(initial.gender ?? '')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const input: ProfileUpdateInput = {
        username,
        displayName: displayName || null,
        bio: bio || null,
        age: age ? Number(age) : null,
        gender: gender || null,
      }
      const result = await updateProfileAction(input)
      if (result.ok) {
        onDone()
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Username *" hint="3-20 chars · letters, numbers, underscore">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          minLength={3}
          maxLength={20}
          required
          autoComplete="username"
          placeholder="ahmed55"
          className={inputClass}
        />
      </Field>

      <Field label="Display name" hint="Shown instead of username on your profile">
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={60}
          placeholder="Ahmed Hussain"
          className={inputClass}
        />
      </Field>

      <Field label="Bio" hint={`${bio.length} / 200`}>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={200}
          rows={3}
          placeholder="A short line about yourself…"
          className={`${inputClass} resize-none leading-relaxed`}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Age">
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            min={1}
            max={150}
            placeholder="—"
            className={inputClass}
          />
        </Field>

        <Field label="Gender">
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as Gender)}
            className={inputClass}
          >
            <option value="">— optional —</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </Field>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className="flex-1 rounded-full border-2 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 py-2 text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-full bg-emerald-brand text-cream py-2 text-sm font-semibold hover:scale-[1.02] active:scale-[0.98] transition-transform glow-emerald disabled:opacity-50"
        >
          {pending ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}

const inputClass =
  'w-full rounded-lg border border-emerald-brand/20 dark:border-emerald-light/20 bg-white dark:bg-[#0A1F1A] px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/30 transition-all duration-200'

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label className="block text-xs font-medium text-emerald-deep dark:text-emerald-300 uppercase tracking-wider">
          {label}
        </label>
        {hint && (
          <span className="text-[10px] text-zinc-500 dark:text-zinc-500">
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}
