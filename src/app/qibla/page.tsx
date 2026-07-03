import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BottomNav } from '@/components/BottomNav'
import { QiblaCompass } from '@/components/QiblaCompass'

export default async function QiblaPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

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
              ٱلْقِبْلَة
            </p>
            <p className="text-[10px] uppercase tracking-widest text-gold dark:text-gold-light/80 font-semibold mt-1">
              Qibla Connect
            </p>
          </div>
        </header>

        <section className="text-center pt-1">
          <p className="text-xs text-zinc-600 dark:text-zinc-400 italic px-4">
            &ldquo;Turn then your face towards Al-Masjid Al-Haram; and wherever
            you are, turn your faces towards it.&rdquo;
          </p>
          <p className="text-[10px] uppercase tracking-widest text-gold dark:text-gold-light/80 font-semibold mt-1">
            Al-Baqarah 2:144
          </p>
        </section>

        <QiblaCompass />
      </div>

      <BottomNav />
    </main>
  )
}
