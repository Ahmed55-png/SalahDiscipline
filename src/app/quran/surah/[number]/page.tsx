import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSurahWithTranslation } from '@/lib/api/quran'
import { BottomNav } from '@/components/BottomNav'
import { ReadingMode } from '@/components/quran/ReadingMode'
import { toArabicDigits, stripBismillah } from '@/lib/quran/format'

export const revalidate = 604800

type Params = { number: string }

export default async function SurahPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { number } = await params
  const n = Number(number)
  if (!Number.isInteger(n) || n < 1 || n > 114) notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const pair = await getSurahWithTranslation(n)

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
                href={`/quran/surah/${n - 1}`}
                className="text-[10px] uppercase tracking-widest text-emerald-deep dark:text-emerald-200 border border-emerald-brand/30 rounded-full px-2.5 py-1 hover:bg-emerald-brand/10 transition-colors"
              >
                ← Prev
              </Link>
            )}
            {n < 114 && (
              <Link
                href={`/quran/surah/${n + 1}`}
                className="text-[10px] uppercase tracking-widest text-emerald-deep dark:text-emerald-200 border border-emerald-brand/30 rounded-full px-2.5 py-1 hover:bg-emerald-brand/10 transition-colors"
              >
                Next →
              </Link>
            )}
          </div>
        </header>

        {!pair ? (
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 italic py-10">
            Couldn&apos;t load this surah right now. Try again shortly.
          </p>
        ) : (
          <>
            <section className="text-center pt-1 pb-2 border-b border-gold/30">
              <p
                className="text-4xl sm:text-5xl text-emerald-deep dark:text-gold-soft leading-tight"
                style={{ fontFamily: 'var(--font-amiri)' }}
                dir="rtl"
              >
                {pair.meta.name}
              </p>
              <p className="text-base font-semibold text-emerald-deep dark:text-emerald-200 mt-2">
                {pair.meta.englishName}
              </p>
              <p className="text-[11px] uppercase tracking-widest text-gold dark:text-gold-light/80 mt-1">
                {pair.meta.englishNameTranslation} · {pair.meta.numberOfAyahs}{' '}
                ayahs · {pair.meta.revelationType}
              </p>
              {n !== 1 && n !== 9 && (
                <p
                  className="text-2xl text-emerald-deep dark:text-gold-soft mt-4"
                  style={{ fontFamily: 'var(--font-amiri)' }}
                  dir="rtl"
                >
                  بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                </p>
              )}
            </section>

            <ReadingMode>
              {/* Translation view — per-ayah cards */}
              <section data-translation-view className="space-y-4">
                {pair.arabic.ayahs.map((aya, i) => {
                  const ur = pair.urdu.ayahs[i]
                  const arabicText =
                    i === 0 && n !== 1 && n !== 9
                      ? stripBismillah(aya.text)
                      : aya.text
                  return (
                    <article
                      key={aya.number}
                      className="rounded-2xl border border-emerald-brand/20 bg-white/85 dark:bg-[#0F2A22]/70 backdrop-blur-md p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-deep to-emerald-brand text-cream text-[10px] font-bold tabular-nums">
                          {aya.numberInSurah}
                        </span>
                        <span className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                          Juz {aya.juz}
                        </span>
                      </div>
                      <p
                        className="text-2xl sm:text-3xl text-zinc-900 dark:text-gold-soft leading-loose text-right"
                        style={{ fontFamily: 'var(--font-amiri)' }}
                        dir="rtl"
                      >
                        {arabicText}
                      </p>
                      {ur && (
                        <p
                          className="text-base text-zinc-700 dark:text-zinc-300 leading-loose text-right pt-1 border-t border-emerald-brand/10"
                          style={{ fontFamily: 'var(--font-nastaliq)' }}
                          dir="rtl"
                        >
                          {ur.text}
                        </p>
                      )}
                    </article>
                  )
                })}
              </section>

              {/* Mushaf view — continuous flowing Arabic, no translation */}
              <section
                data-mushaf-view
                className="rounded-2xl border border-gold/30 bg-gradient-to-br from-cream via-white to-gold-soft/30 dark:from-[#0F2A22] dark:via-[#0A1F1A] dark:to-emerald-deep/30 p-5 sm:p-7 shadow-lg shadow-emerald-deep/10"
              >
                <p
                  className="text-2xl sm:text-3xl text-zinc-900 dark:text-gold-soft text-justify"
                  style={{
                    fontFamily: 'var(--font-amiri)',
                    lineHeight: 2.4,
                    wordSpacing: '0.15em',
                  }}
                  dir="rtl"
                  lang="ar"
                >
                  {pair.arabic.ayahs.map((aya, i) => {
                    const arabicText =
                      i === 0 && n !== 1 && n !== 9
                        ? stripBismillah(aya.text)
                        : aya.text
                    return (
                      <span key={aya.number}>
                        {arabicText}{' '}
                        <span
                          className="inline-flex items-center justify-center align-middle mx-1 text-gold dark:text-gold-light text-base sm:text-lg"
                          aria-label={`Ayah ${aya.numberInSurah}`}
                        >
                          ﴿{toArabicDigits(aya.numberInSurah)}﴾
                        </span>{' '}
                      </span>
                    )
                  })}
                </p>
              </section>
            </ReadingMode>

            <nav className="flex items-center justify-between pt-2">
              {n > 1 ? (
                <Link
                  href={`/quran/surah/${n - 1}`}
                  className="text-xs uppercase tracking-widest text-emerald-deep dark:text-emerald-200 border border-emerald-brand/30 rounded-full px-3 py-1.5 hover:bg-emerald-brand/10 transition-colors"
                >
                  ← Previous surah
                </Link>
              ) : (
                <span />
              )}
              {n < 114 && (
                <Link
                  href={`/quran/surah/${n + 1}`}
                  className="text-xs uppercase tracking-widest text-emerald-deep dark:text-emerald-200 border border-emerald-brand/30 rounded-full px-3 py-1.5 hover:bg-emerald-brand/10 transition-colors"
                >
                  Next surah →
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
