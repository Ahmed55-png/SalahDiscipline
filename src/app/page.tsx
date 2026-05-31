import { createClient } from '@/lib/supabase/server'
import { getTimingsByCity } from '@/lib/api/aladhan'

export default async function Home() {
  let supabaseStatus = 'Not tested'
  let supabaseError = ''
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.getSession()
    supabaseStatus = error ? 'Error' : 'Connected ✓'
    if (error) supabaseError = error.message
  } catch (e) {
    supabaseStatus = 'Failed'
    supabaseError = e instanceof Error ? e.message : 'Unknown error'
  }

  let prayerData: Awaited<ReturnType<typeof getTimingsByCity>> | null = null
  let aladhanStatus = 'Not tested'
  let aladhanError = ''
  try {
    prayerData = await getTimingsByCity('Karachi', 'Pakistan', 1)
    aladhanStatus = 'Connected ✓'
  } catch (e) {
    aladhanStatus = 'Failed'
    aladhanError = e instanceof Error ? e.message : 'Unknown error'
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Salah Discipline
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Phase 1 Setup — Connection Test
          </p>
        </header>

        <section className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-3">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
            Supabase Connection
          </h2>
          <p className="text-sm">
            Status:{' '}
            <span
              className={
                supabaseStatus.includes('✓')
                  ? 'text-green-600 dark:text-green-400 font-medium'
                  : 'text-red-600 dark:text-red-400 font-medium'
              }
            >
              {supabaseStatus}
            </span>
          </p>
          {supabaseError && (
            <p className="text-xs text-red-600 dark:text-red-400 font-mono">
              {supabaseError}
            </p>
          )}
        </section>

        <section className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-3">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
            Aladhan API (Karachi, Pakistan)
          </h2>
          <p className="text-sm">
            Status:{' '}
            <span
              className={
                aladhanStatus.includes('✓')
                  ? 'text-green-600 dark:text-green-400 font-medium'
                  : 'text-red-600 dark:text-red-400 font-medium'
              }
            >
              {aladhanStatus}
            </span>
          </p>
          {aladhanError && (
            <p className="text-xs text-red-600 dark:text-red-400 font-mono">
              {aladhanError}
            </p>
          )}
          {prayerData && (
            <div className="pt-2 space-y-2">
              <p className="text-xs text-zinc-500">
                {prayerData.data.date.readable} ({prayerData.data.date.hijri.date}{' '}
                {prayerData.data.date.hijri.month.en}{' '}
                {prayerData.data.date.hijri.year})
              </p>
              <ul className="grid grid-cols-2 gap-2 text-sm">
                <li className="flex justify-between rounded bg-zinc-100 dark:bg-zinc-800 px-3 py-2">
                  <span>Fajr</span>
                  <span className="font-mono">{prayerData.data.timings.Fajr}</span>
                </li>
                <li className="flex justify-between rounded bg-zinc-100 dark:bg-zinc-800 px-3 py-2">
                  <span>Dhuhr</span>
                  <span className="font-mono">{prayerData.data.timings.Dhuhr}</span>
                </li>
                <li className="flex justify-between rounded bg-zinc-100 dark:bg-zinc-800 px-3 py-2">
                  <span>Asr</span>
                  <span className="font-mono">{prayerData.data.timings.Asr}</span>
                </li>
                <li className="flex justify-between rounded bg-zinc-100 dark:bg-zinc-800 px-3 py-2">
                  <span>Maghrib</span>
                  <span className="font-mono">{prayerData.data.timings.Maghrib}</span>
                </li>
                <li className="flex justify-between rounded bg-zinc-100 dark:bg-zinc-800 px-3 py-2 col-span-2">
                  <span>Isha</span>
                  <span className="font-mono">{prayerData.data.timings.Isha}</span>
                </li>
              </ul>
            </div>
          )}
        </section>

        <p className="text-center text-xs text-zinc-500">
          If both show ✓ — Phase 1 is complete!
        </p>
      </div>
    </main>
  )
}
