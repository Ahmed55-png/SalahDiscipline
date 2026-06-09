import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getJuzWithTranslation } from '@/lib/api/quran'
import { BottomNav } from '@/components/BottomNav'
import { ReadingMode } from '@/components/quran/ReadingMode'
import { JUZ_LIST } from '@/lib/quran/juz'

export const revalidate = 604800

type Params = { number: string }

export default async function JuzPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { number } = await params
  const n = Number(number)
  if (!Number.isInteger(n) || n < 1 || n > 30) notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const pair = await getJuzWithTranslation(n)
  const meta = JUZ_LIST.find((j) => j.number === n)!

  // Group ayahs by surah so we can render a surah header between blocks.
  const groups: Array<{
    surah: { number: number; englishName: string; name: string }
    items: Array<{
      number: number
      numberInSurah: number
      arabic: string
      urdu: string
    }>
  }> = []

  if (pair) {
    for (let i = 0; i < pair.arabicAyahs.length; i++) {
      const ar = pair.arabicAyahs[i]
      const ur = pair.urduAyahs[i]
      const last = groups[groups.length - 1]
      if (!last || last.surah.number !== ar.surah.number) {
        groups.push({
          surah: ar.surah,
          items: [],
        })
      }
      groups[groups.length - 1].items.push({
        number: ar.number,
        numberInSurah: ar.numberInSurah,
        arabic: ar.text,
        urdu: ur?.text ?? '',
      })
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden pb-28">
      <div className="absolute inset-0 islamic-pattern opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cream/50 to-cream dark:via-[#0A1F1A]/50 dark:to-[#0A1F1A] pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto w-full px-4 py-5 space-y-5">
        <header className="flex items-center justify-between">
          <Link
            href="/quran"
            className="text-xs uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:text-emerald-deep dark:hover:text-emerald-300 transition-colors"
          >
            ← Quran
          </Link>
          <div className="flex items-center gap-2">
            {n > 1 && (
              <Link
                href={`/quran/juz/${n - 1}`}
                className="text-[10px] uppercase tracking-widest text-emerald-deep dark:text-emerald-200 border border-emerald-brand/30 rounded-full px-2.5 py-1 hover:bg-emerald-brand/10 transition-colors"
              >
                ← Prev
              </Link>
            )}
            {n < 30 && (
              <Link
                href={`/quran/juz/${n + 1}`}
                className="text-[10px] uppercase tracking-widest text-emerald-deep dark:text-emerald-200 border border-emerald-brand/30 rounded-full px-2.5 py-1 hover:bg-emerald-brand/10 transition-colors"
              >
                Next →
              </Link>
            )}
          </div>
        </header>

        <section className="text-center pt-1 pb-2 border-b border-gold/30">
          <p
            className="text-4xl sm:text-5xl text-emerald-deep dark:text-gold-soft leading-tight"
            style={{ fontFamily: 'var(--font-amiri)' }}
            dir="rtl"
          >
            {meta.arabic}
          </p>
          <p className="text-base font-semibold text-emerald-deep dark:text-emerald-200 mt-2">
            Para {meta.number} · {meta.translit}
          </p>
          <p className="text-[11px] uppercase tracking-widest text-gold dark:text-gold-light/80 mt-1">
            Starts: Surah {meta.startSurahName} · Ayah {meta.startAyah}
          </p>
        </section>

        {!pair ? (
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 italic py-10">
            Couldn&apos;t load this para right now. Try again shortly.
          </p>
        ) : (
          <>
          <ReadingMode>
          <div className="space-y-6">
            {groups.map((g) => (
              <section key={g.surah.number} className="space-y-3">
                <div className="flex items-baseline justify-between gap-3 px-1">
                  <Link
                    href={`/quran/surah/${g.surah.number}`}
                    className="text-sm font-semibold text-emerald-deep dark:text-emerald-200 hover:text-gold dark:hover:text-gold-light transition-colors"
                  >
                    {g.surah.number}. {g.surah.englishName}
                  </Link>
                  <span
                    className="text-xl text-gold dark:text-gold-light"
                    style={{ fontFamily: 'var(--font-amiri)' }}
                    dir="rtl"
                  >
                    {g.surah.name}
                  </span>
                </div>
                {g.items.map((aya) => (
                  <article
                    key={aya.number}
                    className="rounded-2xl border border-emerald-brand/20 bg-white/85 dark:bg-[#0F2A22]/70 backdrop-blur-md p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-deep to-emerald-brand text-cream text-[10px] font-bold tabular-nums">
                        {aya.numberInSurah}
                      </span>
                      <span className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                        Ayah #{aya.number}
                      </span>
                    </div>
                    <p
                      className="text-2xl sm:text-3xl text-zinc-900 dark:text-gold-soft leading-loose text-right"
                      style={{ fontFamily: 'var(--font-amiri)' }}
                      dir="rtl"
                    >
                      {aya.arabic}
                    </p>
                    {aya.urdu && (
                      <p
                        data-urdu-block
                        className="text-base text-zinc-700 dark:text-zinc-300 leading-loose text-right pt-1 border-t border-emerald-brand/10"
                        style={{ fontFamily: 'var(--font-nastaliq)' }}
                        dir="rtl"
                      >
                        {aya.urdu}
                      </p>
                    )}
                  </article>
                ))}
              </section>
            ))}
          </div>
          </ReadingMode>

          <nav className="flex items-center justify-between pt-2">
              {n > 1 ? (
                <Link
                  href={`/quran/juz/${n - 1}`}
                  className="text-xs uppercase tracking-widest text-emerald-deep dark:text-emerald-200 border border-emerald-brand/30 rounded-full px-3 py-1.5 hover:bg-emerald-brand/10 transition-colors"
                >
                  ← Previous para
                </Link>
              ) : (
                <span />
              )}
              {n < 30 && (
                <Link
                  href={`/quran/juz/${n + 1}`}
                  className="text-xs uppercase tracking-widest text-emerald-deep dark:text-emerald-200 border border-emerald-brand/30 rounded-full px-3 py-1.5 hover:bg-emerald-brand/10 transition-colors"
                >
                  Next para →
                </Link>
              )}
            </nav>
          </>
        )}
      </div>

      <BottomNav />
    </main>
  )
}
