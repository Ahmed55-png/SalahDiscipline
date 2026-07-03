'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

type NavItem = {
  label: string
  href: string
  icon: React.ReactNode
  disabled?: boolean
}

const HomeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

// Hadith: open scroll
const HadithIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M19 5a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11z" />
    <path d="M6 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2" />
    <line x1="10" y1="9" x2="17" y2="9" />
    <line x1="10" y1="13" x2="17" y2="13" />
    <line x1="10" y1="17" x2="14" y2="17" />
  </svg>
)

// Adhkar: open book
const BookIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
)

// Quran: uses /public/book.png
const QuranIcon = () => (
  <Image
    src="/book.png"
    alt=""
    width={26}
    height={26}
    aria-hidden
    className="object-contain"
  />
)

// Tasbih: uses /public/tasbih.png
const TasbihIcon = () => (
  <Image
    src="/tasbih.png"
    alt=""
    width={44}
    height={44}
    aria-hidden
    className="object-contain"
  />
)

const items: NavItem[] = [
  { label: 'Home', href: '/dashboard', icon: <HomeIcon /> },
  { label: 'Hadith', href: '#', icon: <HadithIcon />, disabled: true },
  // Tasbih centered + elevated, rendered separately
  { label: 'Adhkar', href: '/tasbih?open=adhkar', icon: <BookIcon /> },
  { label: 'Quran', href: '/quran', icon: <QuranIcon /> },
]

export function BottomNav() {
  const pathname = usePathname()
  const isTasbihActive = pathname?.startsWith('/tasbih')

  const isActive = (href: string) => {
    if (href === '#') return false
    if (href === '/dashboard') return pathname === '/dashboard'
    // Strip query string before matching path prefix
    const path = href.split('?')[0]
    return pathname?.startsWith(path) ?? false
  }

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 28, delay: 0.2 }}
      className="fixed inset-x-0 bottom-0 z-30 pointer-events-none"
      aria-label="Primary navigation"
    >
      <div className="pointer-events-auto relative mx-auto max-w-2xl px-3 pb-3 pt-2">
        <div className="relative flex items-end justify-between rounded-2xl border border-gold/40 bg-cream/95 dark:bg-[#0A1F1A]/95 backdrop-blur-xl shadow-2xl shadow-emerald-deep/30 px-3 py-2">
          {/* Left two items */}
          <div className="flex flex-1 justify-around">
            {items.slice(0, 2).map((item) => (
              <NavLink
                key={item.label}
                item={item}
                active={isActive(item.href)}
              />
            ))}
          </div>

          {/* Center elevated Tasbih */}
          <div className="flex-shrink-0 -mt-7 px-2">
            <Link
              href="/tasbih"
              aria-label="Tasbih counter"
              className="group relative block"
            >
              <div className="absolute inset-0 rounded-full bg-gold/40 blur-xl group-hover:bg-gold/60 transition-colors" />
              <motion.div
                whileTap={{ scale: 0.92 }}
                className={`relative w-16 h-16 rounded-full flex items-center justify-center shadow-xl shadow-gold/40 ring-4 ring-cream dark:ring-[#0A1F1A] transition-colors ${
                  isTasbihActive
                    ? 'bg-gradient-to-br from-emerald-deep via-emerald-brand to-emerald-deep'
                    : 'bg-gradient-to-br from-gold via-gold-light to-gold'
                }`}
              >
                <TasbihIcon />
              </motion.div>
              <span
                className={`mt-1 block text-center text-[10px] uppercase tracking-widest font-bold ${
                  isTasbihActive
                    ? 'text-emerald-deep dark:text-emerald-300'
                    : 'text-gold'
                }`}
              >
                Tasbih
              </span>
            </Link>
          </div>

          {/* Right two items */}
          <div className="flex flex-1 justify-around">
            {items.slice(2).map((item) => (
              <NavLink
                key={item.label}
                item={item}
                active={isActive(item.href)}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.nav>
  )
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  // Disabled items render as a non-interactive div with a "Soon" badge,
  // so the visual slot stays but tapping does nothing.
  if (item.disabled) {
    return (
      <div
        aria-label={`${item.label} (coming soon)`}
        aria-disabled
        className="flex flex-col items-center justify-end gap-0.5 py-1 px-2 opacity-40 cursor-not-allowed select-none"
      >
        <span className="text-zinc-500 dark:text-zinc-400 relative">
          {item.icon}
          <span className="absolute -top-1 -right-2 text-[7px] font-bold uppercase tracking-widest bg-zinc-500 text-cream rounded-full px-1 py-0.5 leading-none">
            soon
          </span>
        </span>
        <span className="text-[9px] uppercase tracking-widest font-semibold text-zinc-500 dark:text-zinc-400">
          {item.label}
        </span>
      </div>
    )
  }

  return (
    <Link
      href={item.href}
      aria-label={item.label}
      className="flex flex-col items-center justify-end gap-0.5 py-1 px-2 group"
    >
      <span
        className={`transition-colors ${
          active
            ? 'text-emerald-brand dark:text-emerald-light'
            : 'text-zinc-500 dark:text-zinc-400 group-hover:text-emerald-brand dark:group-hover:text-emerald-light'
        }`}
      >
        {item.icon}
      </span>
      <span
        className={`text-[9px] uppercase tracking-widest font-semibold transition-colors ${
          active
            ? 'text-emerald-brand dark:text-emerald-light'
            : 'text-zinc-500 dark:text-zinc-400 group-hover:text-emerald-brand dark:group-hover:text-emerald-light'
        }`}
      >
        {item.label}
      </span>
    </Link>
  )
}
