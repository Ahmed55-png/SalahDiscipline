import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  getAyahWithTranslation,
  randomAyahNumber,
} from '@/lib/api/quran'
import { DailyAyah } from '@/components/DailyAyah'
import { BottomNav } from '@/components/BottomNav'
import { QuranRefreshButton } from './QuranRefreshButton'

export const dynamic = 'force-dynamic'

export default async function QuranPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Server-side random ayah; router.refresh() on the client gives a new one.
  const ayah = await getAyahWithTranslation(randomAyahNumber())

  return (
    <main className="relative min-h-screen overflow-hidden pb-28">
      <div className="absolute inset-0 islamic-pattern opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cream/50 to-cream dark:via-[#0A1F1A]/50 dark:to-[#0A1F1A] pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto w-full px-4 py-5 space-y-5">
        {/* Header */}
        <header className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-xs uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:text-emerald-deep dark:hover:text-emerald-300 transition-colors"
          >
            ← Dashboard
          </Link>
          <div className="text-right">
            <p
              className="text-base text-gold-light leading-none"
              style={{ fontFamily: 'var(--font-amiri)' }}
            >
              ٱلْقُرْآنُ ٱلْكَرِيم
            </p>
            <p className="text-[10px] uppercase tracking-widest text-gold dark:text-gold-light/80 font-semibold mt-1">
              The Noble Quran
            </p>
          </div>
        </header>

        {/* Hero */}
        <section className="text-center pt-2">
          <p
            className="text-3xl sm:text-4xl text-emerald-deep dark:text-gold-soft leading-relaxed"
            style={{ fontFamily: 'var(--font-amiri)' }}
            dir="rtl"
          >
            بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 italic mt-2">
            &ldquo;In the name of Allah, the Most Gracious, the Most Merciful.&rdquo;
          </p>
        </section>

        {/* Featured ayah */}
        {ayah ? (
          <DailyAyah ayah={ayah} />
        ) : (
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 italic">
            Ayah couldn&apos;t be loaded right now. Try refreshing.
          </p>
        )}

        {/* Refresh */}
        <div className="flex justify-center">
          <QuranRefreshButton />
        </div>

        {/* Roadmap card */}
        <section className="relative overflow-hidden rounded-2xl border border-gold/30 bg-white/70 dark:bg-[#0F2A22]/70 backdrop-blur-md p-4">
          <div className="absolute inset-0 islamic-pattern-dense opacity-[0.06] pointer-events-none" />
          <div className="relative flex items-start gap-3">
            <div className="text-2xl" aria-hidden>
              📖
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-deep dark:text-emerald-200">
                Surah browser coming soon
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                A full 114-surah index with Arabic, Urdu translation, and
                bookmarks. For now, refresh above to get a fresh ayah.
              </p>
            </div>
          </div>
        </section>
      </div>

      <BottomNav />
    </main>
  )
}
