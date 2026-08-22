'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'
import SubscriptionGate from '@/components/SubscriptionGate'
import ProfileDrawer from '@/components/community/ProfileDrawer'
import ProfileHeader from '@/components/community/ProfileHeader'

const MurTab = dynamic(() => import('@/app/dashboard/mur/page'), { ssr: false })
const MonEclatTab = dynamic(() => import('@/app/dashboard/mon-eclat/page'), { ssr: false })
const RayonsFeedTab = dynamic(() => import('@/components/community/RayonsFeedTab'), { ssr: false })
const MessagesTab = dynamic(() => import('@/components/community/MessagesTab'), { ssr: false })
const SavedPostsTab = dynamic(() => import('@/components/community/SavedPostsTab'), { ssr: false })

type TabId = 'fil' | 'discussions' | 'moi'
type MoiView = 'messages' | 'proches' | 'enregistres'

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  {
    id: 'fil',
    label: 'Le fil',
    icon: (
      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
      </svg>
    ),
  },
  {
    id: 'discussions',
    label: 'Discussions',
    icon: (
      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
  },
  {
    id: 'moi',
    label: 'Moi',
    icon: (
      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
]

const MOI_VIEWS: { id: MoiView; label: string }[] = [
  { id: 'messages', label: 'Mes messages' },
  { id: 'proches', label: 'Mes proches' },
  { id: 'enregistres', label: 'Enregistrés' },
]

// Rétrocompatibilité avec les anciens liens ?tab=mur|rayons|eclat|messages|saved
function resolveInitial(tab: string | null): { tab: TabId; moi: MoiView } {
  switch (tab) {
    case 'mur': return { tab: 'fil', moi: 'messages' }
    case 'messages': return { tab: 'discussions', moi: 'messages' }
    case 'eclat': return { tab: 'moi', moi: 'messages' }
    case 'rayons': return { tab: 'moi', moi: 'proches' }
    case 'saved': return { tab: 'moi', moi: 'enregistres' }
    case 'fil': case 'discussions': case 'moi': return { tab: tab as TabId, moi: 'messages' }
    default: return { tab: 'fil', moi: 'messages' }
  }
}

export default function CommunautePage() {
  const searchParams = useSearchParams()
  const initial = resolveInitial(searchParams.get('tab'))
  const [activeTab, setActiveTab] = useState<TabId>(initial.tab)
  const [moiView, setMoiView] = useState<MoiView>(initial.moi)
  const [profileDrawerUserId, setProfileDrawerUserId] = useState<string | null>(null)
  const [unreadMessages, setUnreadMessages] = useState(0)

  useEffect(() => {
    async function loadUnread() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { count } = await supabase
        .from('private_messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('is_read', false)
      setUnreadMessages(count || 0)
    }
    loadUnread()
    const interval = setInterval(loadUnread, 30000)
    return () => clearInterval(interval)
  }, [])

  function handleTabChange(tabId: TabId) {
    setActiveTab(tabId)
    const url = new URL(window.location.href)
    url.searchParams.set('tab', tabId)
    window.history.replaceState({}, '', url.toString())
  }

  function openProfileDrawer(userId: string) {
    setProfileDrawerUserId(userId)
  }

  return (
    <SubscriptionGate allowFree>
    <div className="max-w-4xl mx-auto">
      {/* ── 3 onglets ── */}
      <div className="mb-6">
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all cursor-pointer whitespace-nowrap relative"
                style={{
                  background: isActive ? 'rgba(201,169,97,0.1)' : 'transparent',
                  color: isActive ? 'var(--brand)' : 'var(--text-muted)',
                }}
              >
                <span className={isActive ? 'opacity-100' : 'opacity-60'}>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.id === 'discussions' && unreadMessages > 0 && (
                  <span className="min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold animate-pulse bg-[var(--danger)] text-white">
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Onglet "Moi" : on arrive sur son profil ── */}
      {activeTab === 'moi' && <ProfileHeader />}

      {/* ── Sous-menu de l'onglet "Moi" ── */}
      {activeTab === 'moi' && (
        <div className="mb-5 flex gap-2 flex-wrap">
          {MOI_VIEWS.map(v => {
            const isActive = moiView === v.id
            return (
              <button
                key={v.id}
                onClick={() => setMoiView(v.id)}
                className="px-3.5 py-1.5 rounded-full text-[12.5px] font-medium transition-all cursor-pointer"
                style={{
                  background: isActive ? 'var(--brand)' : 'rgba(255,255,255,0.03)',
                  color: isActive ? 'var(--text-inverse)' : 'var(--text-muted)',
                  border: '1px solid ' + (isActive ? 'transparent' : 'var(--border)'),
                }}
              >
                {v.label}
              </button>
            )
          })}
        </div>
      )}

      {/* ── Contenu ── */}
      <div>
        {activeTab === 'fil' && <MurTab />}
        {activeTab === 'discussions' && <MessagesTab onProfileClick={openProfileDrawer} />}
        {activeTab === 'moi' && moiView === 'messages' && <MonEclatTab />}
        {activeTab === 'moi' && moiView === 'proches' && <RayonsFeedTab onProfileClick={openProfileDrawer} />}
        {activeTab === 'moi' && moiView === 'enregistres' && <SavedPostsTab onProfileClick={openProfileDrawer} />}
      </div>

      {profileDrawerUserId && (
        <ProfileDrawer
          userId={profileDrawerUserId}
          onClose={() => setProfileDrawerUserId(null)}
        />
      )}
    </div>
    </SubscriptionGate>
  )
}
