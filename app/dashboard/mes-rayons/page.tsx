'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n/useTranslation'
import type { ShineConnection } from '@/types/database'

type ProfileMap = Record<string, {
  id: string
  prenom: string
  pseudo: string | null
  avatar_url: string | null
  role: string
  bio: string | null
}>

type Tab = 'connections' | 'pending' | 'sent'

export default function MesRayonsPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [connections, setConnections] = useState<ShineConnection[]>([])
  const [pendingReceived, setPendingReceived] = useState<ShineConnection[]>([])
  const [pendingSent, setPendingSent] = useState<ShineConnection[]>([])
  const [profiles, setProfiles] = useState<ProfileMap>({})
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('connections')
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const loadData = useCallback(async () => {
    const res = await fetch('/api/rayons')
    if (!res.ok) return
    const data = await res.json()
    setConnections(data.connections)
    setPendingReceived(data.pendingReceived)
    setPendingSent(data.pendingSent)
    setProfiles(data.profiles)
    setLoading(false)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      setCurrentUserId(user.id)
    })
    loadData()
  }, [loadData, router])

  async function handleAction(connectionId: string, action: 'accept' | 'decline' | 'cancel' | 'remove') {
    setActionLoading(connectionId)
    const res = await fetch('/api/rayons', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ connection_id: connectionId, action }),
    })
    if (res.ok) {
      const msgKey = action === 'accept' ? 'rayons.connection_accepted'
        : action === 'decline' ? 'rayons.connection_declined'
        : action === 'cancel' ? 'rayons.connection_cancelled'
        : 'rayons.connection_removed'
      showToast(t(msgKey))
      await loadData()
    }
    setActionLoading(null)
  }

  function getPartnerProfile(connection: ShineConnection) {
    const partnerId = connection.sender_id === currentUserId ? connection.receiver_id : connection.sender_id
    return profiles[partnerId]
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  function filterBySearch<T extends ShineConnection>(items: T[]) {
    if (!search.trim()) return items
    const q = search.toLowerCase()
    return items.filter(c => {
      const p = getPartnerProfile(c)
      if (!p) return false
      return (p.prenom?.toLowerCase().includes(q) || p.pseudo?.toLowerCase().includes(q))
    })
  }

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'connections', label: t('rayons.tab_connections'), count: connections.length },
    { key: 'pending', label: t('rayons.tab_pending'), count: pendingReceived.length },
    { key: 'sent', label: t('rayons.tab_sent'), count: pendingSent.length },
  ]

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium animate-slide-in"
          style={{ background: 'var(--gold)', color: 'var(--dark)' }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          <span style={{ color: 'var(--gold)' }}>&#9728;</span> {t('rayons.title')}
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {t('rayons.subtitle')}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex-1 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all cursor-pointer"
            style={{
              background: activeTab === tab.key ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
              color: activeTab === tab.key ? 'var(--gold)' : 'var(--text-muted)',
            }}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[10px] font-bold"
                style={{
                  background: tab.key === 'pending' && activeTab !== 'pending' ? '#EF4444' : 'rgba(212,175,55,0.15)',
                  color: tab.key === 'pending' && activeTab !== 'pending' ? '#fff' : 'var(--gold)',
                }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      {(activeTab === 'connections' && connections.length > 3) && (
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('rayons.search')}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
          />
        </div>
      )}

      {/* Content */}
      {activeTab === 'connections' && (
        <ConnectionsList
          connections={filterBySearch(connections)}
          getPartnerProfile={getPartnerProfile}
          formatDate={formatDate}
          onAction={handleAction}
          actionLoading={actionLoading}
          t={t}
        />
      )}

      {activeTab === 'pending' && (
        <PendingList
          connections={pendingReceived}
          profiles={profiles}
          onAction={handleAction}
          actionLoading={actionLoading}
          formatDate={formatDate}
          t={t}
        />
      )}

      {activeTab === 'sent' && (
        <SentList
          connections={pendingSent}
          profiles={profiles}
          onAction={handleAction}
          actionLoading={actionLoading}
          formatDate={formatDate}
          t={t}
        />
      )}
    </div>
  )
}

// ── Composants internes ──

function ConnectionsList({ connections, getPartnerProfile, formatDate, onAction, actionLoading, t }: {
  connections: ShineConnection[]
  getPartnerProfile: (c: ShineConnection) => ProfileMap[string] | undefined
  formatDate: (d: string) => string
  onAction: (id: string, action: 'remove') => void
  actionLoading: string | null
  t: (key: string, params?: Record<string, string | number>) => string
}) {
  if (connections.length === 0) {
    return (
      <EmptyState
        icon="&#9728;"
        title={t('rayons.empty_connections')}
        desc={t('rayons.empty_connections_desc')}
      />
    )
  }

  return (
    <div className="space-y-3">
      {connections.map(c => {
        const p = getPartnerProfile(c)
        if (!p) return null
        const displayName = p.pseudo || p.prenom
        return (
          <div key={c.id} className="rounded-xl p-4 flex items-center gap-4 group transition-all"
            style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
            <Link href={`/dashboard/membre/${p.id}`} className="shrink-0">
              {p.avatar_url ? (
                <img src={p.avatar_url} alt={displayName} className="w-12 h-12 rounded-full object-cover ring-2 ring-[var(--gold)]/20" />
              ) : (
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-display font-semibold"
                  style={{ background: 'rgba(212,175,55,0.12)', color: 'var(--gold)' }}>
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </Link>
            <div className="flex-1 min-w-0">
              <Link href={`/dashboard/membre/${p.id}`} className="font-semibold text-[15px] hover:underline" style={{ color: 'var(--text-primary)' }}>
                {displayName}
              </Link>
              {p.bio && (
                <p className="text-[12px] truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>{p.bio}</p>
              )}
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {t('rayons.connected_since', { date: formatDate(c.updated_at) })}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link href={`/dashboard/messages/${p.id}`}
                className="p-2 rounded-lg transition-colors"
                style={{ color: 'var(--text-muted)' }}
                title="Message">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </Link>
              <button
                onClick={() => { if (confirm(t('rayons.remove_confirm'))) onAction(c.id, 'remove') }}
                disabled={actionLoading === c.id}
                className="p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                style={{ color: '#EF4444' }}
                title={t('rayons.remove')}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function PendingList({ connections, profiles, onAction, actionLoading, formatDate, t }: {
  connections: ShineConnection[]
  profiles: ProfileMap
  onAction: (id: string, action: 'accept' | 'decline') => void
  actionLoading: string | null
  formatDate: (d: string) => string
  t: (key: string) => string
}) {
  if (connections.length === 0) {
    return <EmptyState icon="&#128300;" title={t('rayons.empty_pending')} desc={t('rayons.empty_pending_desc')} />
  }

  return (
    <div className="space-y-3">
      {connections.map(c => {
        const p = profiles[c.sender_id]
        if (!p) return null
        const displayName = p.pseudo || p.prenom
        return (
          <div key={c.id} className="rounded-xl p-4 flex items-center gap-4"
            style={{ background: 'var(--dark-card)', border: '1px solid rgba(212,175,55,0.15)' }}>
            <Link href={`/dashboard/membre/${p.id}`} className="shrink-0">
              {p.avatar_url ? (
                <img src={p.avatar_url} alt={displayName} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-display font-semibold"
                  style={{ background: 'rgba(212,175,55,0.12)', color: 'var(--gold)' }}>
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </Link>
            <div className="flex-1 min-w-0">
              <Link href={`/dashboard/membre/${p.id}`} className="font-semibold text-[15px] hover:underline" style={{ color: 'var(--text-primary)' }}>
                {displayName}
              </Link>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {formatDate(c.created_at)}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onAction(c.id, 'accept')}
                disabled={actionLoading === c.id}
                className="px-4 py-2 rounded-xl text-[13px] font-semibold transition-all cursor-pointer"
                style={{ background: 'var(--gold)', color: 'var(--dark)' }}
              >
                {actionLoading === c.id ? '...' : t('rayons.accept')}
              </button>
              <button
                onClick={() => onAction(c.id, 'decline')}
                disabled={actionLoading === c.id}
                className="px-4 py-2 rounded-xl text-[13px] font-medium transition-all cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid var(--dark-border)' }}
              >
                {t('rayons.decline')}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function SentList({ connections, profiles, onAction, actionLoading, formatDate, t }: {
  connections: ShineConnection[]
  profiles: ProfileMap
  onAction: (id: string, action: 'cancel') => void
  actionLoading: string | null
  formatDate: (d: string) => string
  t: (key: string) => string
}) {
  if (connections.length === 0) {
    return <EmptyState icon="&#128640;" title={t('rayons.empty_sent')} desc={t('rayons.empty_sent_desc')} />
  }

  return (
    <div className="space-y-3">
      {connections.map(c => {
        const p = profiles[c.receiver_id]
        if (!p) return null
        const displayName = p.pseudo || p.prenom
        return (
          <div key={c.id} className="rounded-xl p-4 flex items-center gap-4"
            style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
            <Link href={`/dashboard/membre/${p.id}`} className="shrink-0">
              {p.avatar_url ? (
                <img src={p.avatar_url} alt={displayName} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-display font-semibold"
                  style={{ background: 'rgba(212,175,55,0.12)', color: 'var(--gold)' }}>
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </Link>
            <div className="flex-1 min-w-0">
              <Link href={`/dashboard/membre/${p.id}`} className="font-semibold text-[15px] hover:underline" style={{ color: 'var(--text-primary)' }}>
                {displayName}
              </Link>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {t('rayons.sent')} &middot; {formatDate(c.created_at)}
              </p>
            </div>
            <button
              onClick={() => onAction(c.id, 'cancel')}
              disabled={actionLoading === c.id}
              className="px-4 py-2 rounded-xl text-[13px] font-medium transition-all cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid var(--dark-border)' }}
            >
              {actionLoading === c.id ? '...' : t('rayons.cancel_request')}
            </button>
          </div>
        )
      })}
    </div>
  )
}

function EmptyState({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="text-center py-16 rounded-2xl" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
      <div className="text-4xl mb-4" dangerouslySetInnerHTML={{ __html: icon }} />
      <h3 className="font-semibold text-[15px] mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      <p className="text-sm max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>{desc}</p>
    </div>
  )
}
