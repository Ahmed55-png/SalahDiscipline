import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
            Salah Discipline
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            5 namaz ki discipline — apni streak banao, doston ke saath share karo
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/signup"
            className="rounded-md bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 text-sm font-medium transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-6 py-2.5 text-sm font-medium transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    </main>
  )
}
