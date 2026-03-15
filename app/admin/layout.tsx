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

          <nav className="hidden md:flex items-center gap-1 ml-6">
            {adminNav.map((item) => {
              const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
              return (
                <Link key={item.href} href={item.href}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all"
                  style={{
                    background: isActive ? 'rgba(116,192,252,0.1)' : 'transparent',
                    color: isActive ? '#74C0FC' : 'var(--text-secondary)',
                  }}>
                  <span className="text-xs">{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </nav>
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

      {/* Mobile nav */}
      <div className="md:hidden flex overflow-x-auto gap-1 px-4 py-2" style={{ borderBottom: '1px solid var(--dark-border)' }}>
        {adminNav.map((item) => {
          const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs whitespace-nowrap"
              style={{
                background: isActive ? 'rgba(116,192,252,0.1)' : 'transparent',
                color: isActive ? '#74C0FC' : 'var(--text-secondary)',
              }}>
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </div>

      <main className="p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  )
}
