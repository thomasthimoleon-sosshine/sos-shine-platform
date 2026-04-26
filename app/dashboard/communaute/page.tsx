'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'
import SubscriptionGate from '@/components/SubscriptionGate'
import ProfileDrawer from '@/components/community/ProfileDrawer'
import CommunityStatsBar from '@/components/community/CommunityStatsBar'

const MurTab = dynamic(() => import('@/app/dashboard/mur/page'), { ssr: false })
const MonEclatTab = dynamic(() => import('@/app/dashboard/mon-eclat/page'), { ssr: false })
const RayonsFeedTab = dynamic(() => import('@/components/community/RayonsFeedTab'), { ssr: false })
const MessagesTab = dynamic(() => import('@/components/community/MessagesTab'), { ssr: false })
const SavedPostsTab = dynamic(() => import('@/components/community/SavedPostsTab'), { ssr: false })

type TabId = 'mur' | 'rayons' | 'eclat' | 'messages' | 'saved'

const TABS: { id: TabId; label: string; mobileLabel: string; icon: React.ReactNode }[] = [
  {
    id: 'mur',
    label: 'Mur Communautaire',
    mobileLabel: 'Mur',
    icon: (
      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
      </svg>
    ),
  },
  {
    id: 'rayons',
    label: 'Mes Rayons',
    mobileLabel: 'Rayons',
    icon: (
      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
      </svg>
    ),
  },
  {
    id: 'eclat',
    label: 'Mon Éclat',
    mobileLabel: 'Éclat',
    icon: (
      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
  },
  {
    id: 'messages',
    label: 'Messages Privés',
    mobileLabel: 'Messages',
    icon: (
      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
  },
  {
    id: 'saved',
    label: 'Posts Enregistrés',
    mobileLabel: 'Enregistrés',
    icon: (
      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
      </svg>
    ),
  },
]

export default function CommunautePage() {
  const searchParams = useSearchParams()
  const initialTab = (searchParams.get('tab') as TabId) || 'mur'
  const [activeTab, setActiveTab] = useState<TabId>(TABS.find(t => t.id === initialTab) ? initialTab : 'mur')
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
    // Update URL without navigation
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
      {/* ── Community Stats Bar ── */}
      <CommunityStatsBar />

      {/* ── Top Tab Navigation ── */}
      <div className="mb-6 overflow-x-auto scrollbar-hide">
        <div className="flex gap-1 p-1 rounded-xl min-w-max" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all cursor-pointer whitespace-nowrap relative"
                style={{
                  background: isActive ? 'rgba(212,175,55,0.1)' : 'transparent',
                  color: isActive ? 'var(--brand)' : 'var(--text-muted)',
                }}
              >
                <span className={isActive ? 'opacity-100' : 'opacity-60'}>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.mobileLabel}</span>
                {/* Unread badge for messages */}
                {tab.id === 'messages' && unreadMessages > 0 && (
                  <span className="min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold animate-pulse"
                    style={{ background: '#EF4444', color: '#fff' }}>
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div>
        {activeTab === 'mur' && <MurTab />}
        {activeTab === 'rayons' && <RayonsFeedTab onProfileClick={openProfileDrawer} />}
        {activeTab === 'eclat' && <MonEclatTab />}
        {activeTab === 'messages' && <MessagesTab onProfileClick={openProfileDrawer} />}
        {activeTab === 'saved' && <SavedPostsTab onProfileClick={openProfileDrawer} />}
      </div>

      {/* ── Profile Drawer ── */}
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
