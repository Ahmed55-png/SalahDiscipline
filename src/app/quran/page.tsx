import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAllSurahs } from '@/lib/api/quran'
import { BottomNav } from '@/components/BottomNav'
import { BrowserTabs } from '@/components/quran/BrowserTabs'
import { SurahList } from '@/components/quran/SurahList'
import { JuzList } from '@/components/quran/JuzList'

export const revalidate = 604800 // 7 days — surah index is static

export default async function QuranPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const surahs = await getAllSurahs()

  return (
    <main className="relative min-h-screen overflow-hidden pb-28">
      <div className="absolute inset-0 islamic-pattern opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cream/50 to-cream dark:via-[#0A1F1A]/50 dark:to-[#0A1F1A] pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto w-full px-4 py-5 space-y-5">
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

        <section className="text-center pt-1">
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

        {surahs ? (
          <BrowserTabs
            surahs={<SurahList surahs={surahs} />}
            paras={<JuzList />}
          />
        ) : (
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 italic py-6">
            Couldn&apos;t load the Quran index right now. Please try again
            shortly.
          </p>
        )}
      </div>

      <BottomNav />
    </main>
  )
}
