'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

type NavItem = {
  label: string
  href: string
  icon: React.ReactNode
}

const HomeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

const CalendarIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
)

const BookIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
)

const UserIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const TasbihIcon = ({ active }: { active?: boolean }) => (
  <svg width="32" height="32" viewBox="0 0 100 100" aria-hidden>
    <path
      d="M50 14 L58 26 L72 26 L72 40 L86 50 L72 60 L72 74 L58 74 L50 86 L42 74 L28 74 L28 60 L14 50 L28 40 L28 26 L42 26 Z"
      fill={active ? '#F4D03F' : 'none'}
      stroke={active ? '#0F5132' : '#F4D03F'}
      strokeWidth="3"
    />
    <circle
      cx="50"
      cy="50"
      r="10"
      fill={active ? '#0F5132' : '#F4D03F'}
    />
  </svg>
)

const items: NavItem[] = [
  { label: 'Home', href: '/dashboard', icon: <HomeIcon /> },
  { label: 'Calendar', href: '/dashboard?open=calendar', icon: <CalendarIcon /> },
  // tasbih is centered + elevated separately
  { label: 'Adhkar', href: '/tasbih?open=adhkar', icon: <BookIcon /> },
  { label: 'Profile', href: '/dashboard?open=profile', icon: <UserIcon /> },
]

export function BottomNav() {
  const pathname = usePathname()
  const isTasbihActive = pathname?.startsWith('/tasbih')

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname?.startsWith(href) ?? false
  }

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 28, delay: 0.2 }}
      className="fixed inset-x-0 bottom-0 z-30 pointer-events-none"
      aria-label="Primary navigation"
    >
      {/* Backdrop bar */}
      <div className="pointer-events-auto relative mx-auto max-w-2xl px-3 pb-3 pt-2">
        <div className="relative flex items-end justify-between rounded-2xl border border-gold/40 bg-cream/95 dark:bg-[#0A1F1A]/95 backdrop-blur-xl shadow-2xl shadow-emerald-deep/30 px-3 py-2">
          {/* Left two items */}
          <div className="flex flex-1 justify-around">
            {items.slice(0, 2).map((item) => (
              <NavLink
                key={item.href}
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
                <TasbihIcon active={isTasbihActive} />
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
                key={item.href}
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
