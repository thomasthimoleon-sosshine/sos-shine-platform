'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'
import ThemeToggle from '@/components/ThemeToggle'
import NotificationBell from '@/components/NotificationBell'

import { useTranslation } from '@/lib/i18n/useTranslation'

const navItemDefs = [
  {
    href: '/dashboard',
    labelKey: 'nav.home',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    href: '/dashboard/encyclopedie',
    labelKey: 'nav.encyclopedia',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    href: '/dashboard/favoris',
    labelKey: 'nav.favorites',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/shine-tv',
    labelKey: 'nav.shine_tv',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-2.625 0V5.625m0 12.75v-12.75A1.125 1.125 0 014.5 4.5h15a1.125 1.125 0 011.125 1.125v12.75M3.375 19.5h17.25m0 0a1.125 1.125 0 001.125-1.125m-1.125 1.125h-1.5c-.621 0-1.125-.504-1.125-1.125m2.625 0V5.625m0 12.75h-2.625m2.625-12.75h-17.25m17.25 0v12.75M6 18.375v-1.5m0 1.5h12m-12 0V5.625m12 12.75V5.625m0 12.75h-1.5m1.5-12.75h-12m0 0v12.75M9 9l3 2.25L9 13.5V9z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/shine-shorts',
    labelKey: 'nav.shine_shorts',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/shine-audible',
    labelKey: 'nav.shine_audible',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/shine-librairie',
    labelKey: 'nav.shine_librairie',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    href: '/dashboard/communaute',
    labelKey: 'nav.community',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    hasBadge: true,
  },
  {
    href: '/dashboard/evenements',
    labelKey: 'nav.events',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
  {
    href: '/dashboard/courrier-anonyme',
    labelKey: 'nav.courrier',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
  },
  {
    href: '/dashboard/affiliation',
    labelKey: 'nav.affiliation',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/profil',
    labelKey: 'nav.profile',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useTranslation()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)


  useEffect(() => {
    const supabase = createClient()
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setCurrentUserId(user.id)

      // Charger le logo
      const { data: logoData } = await supabase.from('site_settings').select('value').eq('key', 'logo_url').maybeSingle()
      if (logoData?.value) setLogoUrl(logoData.value)

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()

      if (profileData) {
        const p = profileData as Profile
        setProfile(p)
        setIsAdmin(p.role === 'founder' || p.role === 'admin_content' || p.role === 'admin_support')
      } else {
        setProfile({
          id: user.id,
          prenom: user.user_metadata?.prenom || user.email?.split('@')[0] || 'Membre',
          email: user.email || '',
          role: 'member',
          avatar_url: null,
          plan: null,
          created_at: user.created_at,
          pseudo: null,
          bio: null,
          video_url: null,
          is_bot: false,
        })
      }

      // Compter les messages privés non lus
      const { count } = await supabase
        .from('private_messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('is_read', false)
      setUnreadMessages(count || 0)

      setLoading(false)
    }
    loadUser()

    // Rafraîchir le compteur toutes les 30 secondes
    const interval = setInterval(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { count } = await supabase
        .from('private_messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('is_read', false)
      setUnreadMessages(count || 0)
    }, 30000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--dark)' }}>
        <div className="text-center space-y-4">
          <div className="w-10 h-10 rounded-2xl mx-auto flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-deep))' }}>
            <div className="w-5 h-5 border-2 border-[var(--dark)] border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--dark)' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[17rem] flex flex-col transition-transform duration-300 ease-out lg:translate-x-0 glass-dense ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          borderRight: '1px solid var(--dark-border)',
        }}
      >
        {/* Logo */}
        <div className="px-5 py-5 flex items-center gap-3" style={{ borderBottom: '1px solid var(--dark-border)' }}>
          <Link href="/dashboard" className="flex items-center gap-3 group" onClick={() => setSidebarOpen(false)}>
            {logoUrl ? (
              <img src={logoUrl} alt="SOS Shine" className="w-9 h-9 rounded-xl object-cover ring-1 ring-white/10" />
            ) : (
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center font-display text-base font-semibold"
                style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-deep))', color: '#09090b' }}
              >
                S
              </div>
            )}
            <div>
              <h1 className="font-display text-base font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                SOS Shine
              </h1>
              <p className="text-[11px] leading-none" style={{ color: 'var(--text-muted)' }}>{t('nav.your_space')}</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItemDefs.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className="nav-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium relative group"
                style={{
                  background: isActive ? 'rgba(212, 175, 55, 0.08)' : 'transparent',
                  color: isActive ? 'var(--gold)' : 'var(--text-secondary)',
                }}
              >
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full"
                    style={{ background: 'var(--gold)' }}
                  />
                )}
                <span className="opacity-70 group-hover:opacity-100 transition-opacity">{item.icon}</span>
                {t(item.labelKey)}
                {'hasBadge' in item && item.hasBadge && unreadMessages > 0 && (
                  <span
                    className="ml-auto min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold animate-pulse"
                    style={{ background: '#EF4444', color: '#fff' }}
                  >
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </span>
                )}
              </Link>
            )
          })}

          {/* Admin link */}
          {isAdmin && (
            <>
              <div className="pt-5 pb-1.5 px-3">
                <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  {t('nav.administration')}
                </span>
              </div>
              <Link
                href="/admin"
                onClick={() => setSidebarOpen(false)}
                className="nav-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium group"
                style={{ color: '#74C0FC' }}
              >
                <span className="opacity-70 group-hover:opacity-100 transition-opacity">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
                {t('nav.admin')}
              </Link>
            </>
          )}
        </nav>

        {/* ── User section ── */}
        <div className="px-3 py-4" style={{ borderTop: '1px solid var(--dark-border)' }}>
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl mb-2" style={{ background: 'var(--dark-card)' }}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ring-1 ring-white/10"
              style={{ background: 'rgba(212, 175, 55, 0.12)', color: 'var(--gold)' }}
            >
              {profile?.prenom?.charAt(0).toUpperCase() || 'M'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                {profile?.prenom || 'Membre'}
              </p>
              <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
                {profile?.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 mb-1">
            <NotificationBell />
            <ThemeToggle />
          </div>
          <button
            onClick={handleSignOut}
            className="nav-item w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            {t('nav.signout')}
          </button>
        </div>
      </aside>

      {/* ── Main content area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <header
          className="lg:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-30 glass-dense"
          style={{
            borderBottom: '1px solid var(--dark-border)',
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl cursor-pointer transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          {logoUrl ? (
            <img src={logoUrl} alt="SOS Shine" className="h-7 rounded-lg object-cover ring-1 ring-white/10" />
          ) : (
            <span className="font-display text-base font-semibold tracking-tight" style={{ color: 'var(--gold)' }}>
              SOS Shine
            </span>
          )}
          <div className="flex items-center gap-2">
            <NotificationBell />

            <ThemeToggle />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">{children}</main>

      </div>
    </div>
  )
}
