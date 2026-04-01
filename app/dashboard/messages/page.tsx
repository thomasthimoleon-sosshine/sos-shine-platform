'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Profile, PrivateMessage } from '@/types/database'
import { useTranslation } from '@/lib/i18n/useTranslation'

type Conversation = {
  partner: Profile
  lastMessage: PrivateMessage
  unreadCount: number
}

export default function MessagesPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data: messages } = await supabase
        .from('private_messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (!messages || messages.length === 0) { setLoading(false); return }

      const partnerMap = new Map<string, { messages: PrivateMessage[]; unread: number }>()

      for (const msg of messages as PrivateMessage[]) {
        const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
        if (!partnerMap.has(partnerId)) {
          partnerMap.set(partnerId, { messages: [], unread: 0 })
        }
        const entry = partnerMap.get(partnerId)!
        entry.messages.push(msg)
        if (!msg.is_read && msg.receiver_id === user.id) {
          entry.unread++
        }
      }

      const partnerIds = Array.from(partnerMap.keys())
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', partnerIds)

      if (!profiles) { setLoading(false); return }

      const profileMap = new Map<string, Profile>()
      for (const p of profiles as Profile[]) {
        profileMap.set(p.id, p)
      }

      const convos: Conversation[] = []
      for (const [partnerId, entry] of partnerMap) {
        const partner = profileMap.get(partnerId)
        if (partner) {
          convos.push({
            partner,
            lastMessage: entry.messages[0],
            unreadCount: entry.unread,
          })
        }
      }

      convos.sort((a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime())
      setConversations(convos)
      setLoading(false)
    }
    load()
  }, [router])

  function formatTime(d: string) {
    const date = new Date(d)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    if (days === 1) return t('dashboard.yesterday')
    if (days < 7) return date.toLocaleDateString('fr-FR', { weekday: 'short' })
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          {t('dashboard.messages_title')}
        </h1>
        <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
          {t('dashboard.messages_subtitle')}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl" style={{ background: 'rgba(212,175,55,0.08)' }}>
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" style={{ color: 'var(--gold)' }} />
            </svg>
          </div>
          <h3 className="font-display text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            {t('dashboard.no_conversations')}
          </h3>
          <p className="text-sm max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
            {t('dashboard.no_conversations_desc')}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
          {conversations.map((convo, i) => {
            const name = convo.partner?.pseudo || convo.partner?.prenom || 'Utilisateur'
            const isOwnMessage = convo.lastMessage.sender_id === userId
            const msgText = convo.lastMessage.message_type === 'audio' ? `🎤 ${t('dashboard.voice_message')}` : (convo.lastMessage.content || '')
            const preview = isOwnMessage ? `${t('dashboard.you')} : ${msgText}` : msgText
            return (
              <Link key={convo.partner.id} href={`/dashboard/messages/${convo.partner.id}`}
                className="flex items-center gap-4 px-5 py-4 transition-all"
                style={{
                  borderBottom: i < conversations.length - 1 ? '1px solid var(--dark-border)' : 'none',
                  background: convo.unreadCount > 0 ? 'rgba(212,175,55,0.04)' : 'transparent',
                }}>
                {/* Avatar */}
                {convo.partner.avatar_url ? (
                  <img src={convo.partner.avatar_url} alt={name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-lg font-semibold"
                    style={{ background: 'rgba(212,175,55,0.12)', color: 'var(--gold)' }}>
                    {name.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-semibold truncate" style={{
                      color: convo.partner.role === 'founder' ? 'var(--gold)' : 'var(--text-primary)',
                    }}>
                      {name}
                    </span>
                    <span className="text-xs flex-shrink-0 ml-2" style={{ color: 'var(--text-muted)' }}>
                      {formatTime(convo.lastMessage.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs truncate" style={{
                      color: convo.unreadCount > 0 ? 'var(--text-primary)' : 'var(--text-muted)',
                      fontWeight: convo.unreadCount > 0 ? 500 : 400,
                    }}>
                      {preview.length > 80 ? preview.slice(0, 80) + '...' : preview}
                    </p>
                    {convo.unreadCount > 0 && (
                      <span className="flex-shrink-0 ml-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold"
                        style={{ background: 'var(--gold)', color: 'var(--dark)' }}>
                        {convo.unreadCount > 9 ? '9+' : convo.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
