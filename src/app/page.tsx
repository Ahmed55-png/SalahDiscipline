import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BismillahCrest } from '@/components/BismillahCrest'
import { FadeIn } from '@/components/FadeIn'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 islamic-pattern opacity-60 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-cream/80 dark:to-[#0A1F1A]/80 pointer-events-none" />

      {/* Floating decorative crescents */}
      <div className="absolute top-12 right-12 opacity-30 float-soft hidden sm:block">
        <svg width="40" height="40" viewBox="0 0 40 40">
          <path
            d="M18 6 A14 14 0 1 0 18 34 A11 11 0 1 1 18 6 Z"
            fill="#D4AF37"
          />
        </svg>
      </div>
      <div
        className="absolute bottom-16 left-10 opacity-25 float-soft hidden sm:block"
        style={{ animationDelay: '1.2s' }}
      >
        <svg width="28" height="28" viewBox="0 0 40 40">
          <path
            d="M18 6 A14 14 0 1 0 18 34 A11 11 0 1 1 18 6 Z"
            fill="#10B981"
          />
        </svg>
      </div>

      <div className="relative z-10 max-w-md w-full text-center px-6 space-y-10">
        <FadeIn delay={0} className="flex justify-center">
          <BismillahCrest size={96} />
        </FadeIn>

        <FadeIn delay={0.15} className="space-y-3">
          <p
            className="text-2xl text-gold-light"
            style={{ fontFamily: 'var(--font-amiri)' }}
          >
            بِسْمِ ٱللَّٰهِ
          </p>
          <h1 className="text-5xl font-bold tracking-tight text-emerald-deep dark:text-emerald-300">
            Salah Discipline
          </h1>
          <p className="text-zinc-700 dark:text-zinc-300 text-lg leading-relaxed">
            5 namazon ki discipline — apni{' '}
            <span className="shimmer-gold font-semibold">streak</span> banao,
            doston ke saath share karo.
          </p>
        </FadeIn>

        <FadeIn delay={0.35} className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/signup"
            className="group relative inline-flex items-center justify-center rounded-full bg-emerald-brand text-cream px-8 py-3 text-sm font-semibold tracking-wide overflow-hidden transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98] glow-emerald"
          >
            <span className="relative z-10">Get Started</span>
            <span className="absolute inset-0 bg-gradient-to-r from-emerald-brand via-emerald-light to-emerald-brand opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full border-2 border-gold/60 text-emerald-deep dark:text-gold-soft px-8 py-3 text-sm font-semibold tracking-wide hover:bg-gold/10 hover:border-gold transition-all duration-300"
          >
            Login
          </Link>
        </FadeIn>

        <FadeIn delay={0.55}>
          <p className="text-xs text-zinc-500 italic">
            &ldquo;Indeed, prayer prohibits immorality and wrongdoing.&rdquo;
            <br />
            <span className="text-[10px] not-italic opacity-70">— Surah Al-Ankabut 29:45</span>
          </p>
        </FadeIn>
      </div>
    </main>
  )
}
