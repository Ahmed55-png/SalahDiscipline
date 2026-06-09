'use client'

import { useState, type ReactNode } from 'react'

type Tab = 'surahs' | 'paras'

type Props = {
  surahs: ReactNode
  paras: ReactNode
}

export function BrowserTabs({ surahs, paras }: Props) {
  const [tab, setTab] = useState<Tab>('surahs')

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-full border border-gold/40 bg-white/70 dark:bg-[#0F2A22]/60 p-1">
        <TabButton active={tab === 'surahs'} onClick={() => setTab('surahs')}>
          Surahs
        </TabButton>
        <TabButton active={tab === 'paras'} onClick={() => setTab('paras')}>
          Paras (Juz)
        </TabButton>
      </div>

      <div>{tab === 'surahs' ? surahs : paras}</div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors ${
        active
          ? 'bg-emerald-brand text-cream shadow'
          : 'text-emerald-deep dark:text-emerald-200 hover:bg-emerald-brand/10'
      }`}
    >
      {children}
    </button>
  )
}
