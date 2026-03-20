'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'

const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/dashboard-edit', label: 'Espace Membre', icon: '🎨' },
  { href: '/admin/landing', label: 'Landing Page', icon: '🏠' },
  { href: '/admin/prelaunch', label: 'Pre-lancement', icon: '🚀' },
  { href: '/admin/douleurs', label: 'Challenges', icon: '📘' },
  { href: '/admin/shine-tv', label: 'Shine TV', icon: '🎬' },
  { href: '/admin/shine-audible', label: 'Shine Audible', icon: '🎧' },
  { href: '/admin/shine-librairie', label: 'Shine Librairie', icon: '📚' },
  { href: '/admin/shine-shorts', label: 'Shine Shorts', icon: '📱' },
  { href: '/admin/evenements', label: 'Événements', icon: '📅' },
  { href: '/admin/publications', label: 'Publications', icon: '📢' },
  { href: '/admin/membres', label: 'Membres', icon: '👥' },
  { href: '/admin/abonnements', label: 'Abonnements', icon: '💳' },
  { href: '/admin/bots', label: 'Bots', icon: '🤖' },
  { href: '/admin/crm', label: 'CRM', icon: '📧' },
  { href: '/admin/defis', label: 'Défis', icon: '🏆' },
  { href: '/admin/courrier', label: 'Courrier', icon: '✉️' },
  { href: '/admin/candidatures', label: 'Candidatures', icon: '📋' },
  { href: '/admin/retraits', label: 'Retraits', icon: '💸' },
  { href: '/admin/objectifs-mensuels', label: 'Objectifs', icon: '🎯' },
  { href: '/admin/ressource-edition', label: 'Ressource Édition', icon: '📖' },
  { href: '/admin/fondateur', label: 'Fondateur', icon: '👑' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    async function checkAdmin() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      const p = data as Profile | null

      if (!p || (p.role !== 'founder' && p.role !== 'admin_content' && p.role !== 'admin_support')) {
        router.push('/dashboard')
        return
      }
      setProfile(p)
      setLoading(false)
    }
    checkAdmin()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--dark)' }}>
        <div className="w-8 h-8 border-2 border-[#74C0FC] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--dark)' }}>
      {/* Admin top bar */}
      <header className="flex items-center justify-between px-6 py-4 sticky top-0 z-50"
        style={{ background: 'var(--dark-card)', borderBottom: '1px solid var(--dark-border)' }}>
        <div className="flex items-center gap-4">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold"
              style={{ background: 'linear-gradient(135deg, #74C0FC, #4DA3E8)', color: '#fff' }}>A</div>
            <span className="font-display text-lg font-semibold" style={{ color: '#74C0FC' }}>Back-office</span>
          </Link>

          <div className="ml-4 sm:ml-6 flex-1 max-w-xs">
            <select
              value={adminNav.find((item) => item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href))?.href || '/admin'}
              onChange={(e) => router.push(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none cursor-pointer appearance-none"
              style={{
                background: 'rgba(116,192,252,0.08)',
                border: '1px solid rgba(116,192,252,0.2)',
                color: '#74C0FC',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2374C0FC' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 10px center',
              }}>
              {adminNav.map((item) => (
                <option key={item.href} value={item.href} style={{ background: '#0a0a0a', color: '#e0e0e0' }}>
                  {item.icon} {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)', border: '1px solid var(--dark-border)' }}>
            Retour au site
          </Link>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
            style={{ background: 'rgba(116,192,252,0.15)', color: '#74C0FC' }}>
            {profile?.prenom?.charAt(0).toUpperCase() || 'A'}
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  )
}
