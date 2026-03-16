'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, PrivateMessage } from '@/types/database'
import AudioPlayer from '@/components/AudioPlayer'
import VoiceRecorder from '@/components/VoiceRecorder'

type Conversation = {
  partner: Profile
  lastMessage: PrivateMessage
  unreadCount: number
  isRayon: boolean
}

type SubTab = 'inbox' | 'requests'

export default function MessagesTab() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('inbox')

  // Conversation view state
  const [activePartnerId, setActivePartnerId] = useState<string | null>(null)
  const [activePartner, setActivePartner] = useState<Profile | null>(null)
  const [messages, setMessages] = useState<PrivateMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Accepted message contacts (stored in Supabase)
  const [acceptedContacts, setAcceptedContacts] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadConversations()
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [])

  async function loadConversations() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)

    // Load messages
    const { data: allMessages } = await supabase
      .from('private_messages')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (!allMessages || allMessages.length === 0) { setLoading(false); return }

    // Get confirmed Rayon connections
    const { data: connections } = await supabase
      .from('shine_connections')
      .select('sender_id, receiver_id')
      .eq('status', 'accepted')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)

    const rayonIds = new Set(
      (connections || []).map(c => c.sender_id === user.id ? c.receiver_id : c.sender_id)
    )

    // Load accepted message contacts
    const { data: acceptances } = await supabase
      .from('message_acceptances' as string)
      .select('contact_id')
      .eq('user_id', user.id) as { data: { contact_id: string }[] | null }

    const acceptedSet = new Set((acceptances || []).map(a => a.contact_id))
    setAcceptedContacts(acceptedSet)

    // Group by partner
    const partnerMap = new Map<string, { messages: PrivateMessage[]; unread: number }>()
    for (const msg of allMessages as PrivateMessage[]) {
      const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
      if (!partnerMap.has(partnerId)) partnerMap.set(partnerId, { messages: [], unread: 0 })
      const entry = partnerMap.get(partnerId)!
      entry.messages.push(msg)
      if (!msg.is_read && msg.receiver_id === user.id) entry.unread++
    }

    // Load profiles
    const partnerIds = Array.from(partnerMap.keys())
    const { data: profiles } = await supabase.from('profiles').select('*').in('id', partnerIds)
    if (!profiles) { setLoading(false); return }

    const profileMap = new Map((profiles as Profile[]).map(p => [p.id, p]))

    const convos: Conversation[] = []
    for (const [partnerId, entry] of partnerMap) {
      const partner = profileMap.get(partnerId)
      if (partner) {
        convos.push({
          partner,
          lastMessage: entry.messages[0],
          unreadCount: entry.unread,
          isRayon: rayonIds.has(partnerId) || acceptedSet.has(partnerId),
        })
      }
    }

    convos.sort((a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime())
    setConversations(convos)
    setLoading(false)
  }

  // Open a conversation
  async function openConversation(partnerId: string) {
    if (!userId) return
    setActivePartnerId(partnerId)
    setLoadingMessages(true)

    const convo = conversations.find(c => c.partner.id === partnerId)
    if (convo) setActivePartner(convo.partner)

    await loadMessagesFor(userId, partnerId)

    // Start polling
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(() => loadMessagesFor(userId, partnerId), 5000)
  }

  async function loadMessagesFor(uid: string, partnerId: string) {
    const supabase = createClient()
    const { data } = await supabase
      .from('private_messages')
      .select('*')
      .or(`and(sender_id.eq.${uid},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${uid})`)
      .order('created_at', { ascending: true })
      .limit(200)

    if (data) {
      setMessages(data as PrivateMessage[])
      // Mark as read
      const unread = (data as PrivateMessage[]).filter(m => m.receiver_id === uid && !m.is_read)
      if (unread.length > 0) {
        await supabase
          .from('private_messages')
          .update({ is_read: true })
          .eq('receiver_id', uid)
          .eq('sender_id', partnerId)
          .eq('is_read', false)
      }
    }
    setLoadingMessages(false)
  }

  useEffect(() => {
    if (messages.length > 0) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessageHandler(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || !userId || !activePartnerId || sending) return
    setSending(true)
    const supabase = createClient()
    await supabase.from('private_messages').insert({
      sender_id: userId,
      receiver_id: activePartnerId,
      content: newMessage.trim(),
      message_type: 'text',
      is_read: false,
    })
    setNewMessage('')
    await loadMessagesFor(userId, activePartnerId)
    setSending(false)
  }

  const sendVoice = useCallback(async (audioUrl: string) => {
    if (!userId || !activePartnerId) return
    const supabase = createClient()
    await supabase.from('private_messages').insert({
      sender_id: userId,
      receiver_id: activePartnerId,
      content: null,
      audio_url: audioUrl,
      message_type: 'audio',
      is_read: false,
    })
    await loadMessagesFor(userId, activePartnerId)
  }, [userId, activePartnerId])

  async function acceptRequest(partnerId: string) {
    if (!userId) return
    const supabase = createClient()
    await (supabase.from('message_acceptances' as string) as ReturnType<typeof supabase.from>).insert({ user_id: userId, contact_id: partnerId } as Record<string, unknown>)
    setAcceptedContacts(prev => new Set([...prev, partnerId]))
    setConversations(prev => prev.map(c =>
      c.partner.id === partnerId ? { ...c, isRayon: true } : c
    ))
  }

  async function ignoreRequest(partnerId: string) {
    if (!userId) return
    // Delete all messages from this person and close
    setConversations(prev => prev.filter(c => c.partner.id !== partnerId))
  }

  function goBack() {
    setActivePartnerId(null)
    setActivePartner(null)
    setMessages([])
    if (pollRef.current) clearInterval(pollRef.current)
    loadConversations()
  }

  function formatTime(d: string) {
    const date = new Date(d)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    if (days === 1) return 'Hier'
    if (days < 7) return date.toLocaleDateString('fr-FR', { weekday: 'short' })
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  function formatDateSeparator(d: string) {
    const date = new Date(d)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (date.toDateString() === today.toDateString()) return "Aujourd'hui"
    if (date.toDateString() === yesterday.toDateString()) return 'Hier'
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  // ── Conversation view ──
  if (activePartnerId && activePartner) {
    const partnerName = activePartner.pseudo || activePartner.prenom
    const isRequest = !conversations.find(c => c.partner.id === activePartnerId)?.isRayon

    return (
      <div className="flex flex-col" style={{ height: 'calc(100vh - 16rem)' }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <button onClick={goBack} className="p-2 rounded-lg cursor-pointer" style={{ color: 'var(--text-muted)' }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          {activePartner.avatar_url ? (
            <img src={activePartner.avatar_url} alt={partnerName} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
              style={{ background: 'rgba(212,175,55,0.12)', color: 'var(--gold)' }}>
              {partnerName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate" style={{ color: activePartner.role === 'founder' ? 'var(--gold)' : 'var(--text-primary)' }}>
              {partnerName}
            </h3>
            {isRequest && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--gold)' }}>
                Demande de message
              </span>
            )}
          </div>
        </div>

        {/* Request action bar */}
        {isRequest && (
          <div className="flex items-center gap-2 mb-3 p-3 rounded-xl" style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)' }}>
            <p className="flex-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
              Ce membre n&apos;est pas dans vos Rayons. Accepter pour déplacer vers votre boîte principale.
            </p>
            <button
              onClick={() => acceptRequest(activePartnerId)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
              style={{ background: 'var(--gold)', color: 'var(--dark)' }}
            >
              Accepter
            </button>
            <button
              onClick={() => { ignoreRequest(activePartnerId); goBack() }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
              style={{ color: 'var(--text-muted)', border: '1px solid var(--dark-border)' }}
            >
              Ignorer
            </button>
          </div>
        )}

        {/* Messages area */}
        <div className="flex-1 rounded-2xl overflow-hidden flex flex-col min-h-0"
          style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {loadingMessages ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(212,175,55,0.1)' }}>
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} style={{ color: 'var(--gold)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75" />
                  </svg>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Envoyez un premier message à {partnerName}.
                </p>
              </div>
            ) : (
              messages.map((msg, i) => {
                const isMine = msg.sender_id === userId
                const prevMsg = messages[i - 1]
                const showDate = !prevMsg || new Date(prevMsg.created_at).toDateString() !== new Date(msg.created_at).toDateString()
                return (
                  <div key={msg.id}>
                    {showDate && (
                      <div className="flex items-center justify-center my-4">
                        <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)' }}>
                          {formatDateSeparator(msg.created_at)}
                        </span>
                      </div>
                    )}
                    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-1`}>
                      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${isMine ? 'rounded-br-md' : 'rounded-bl-md'}`}
                        style={{
                          background: isMine ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.04)',
                          border: isMine ? 'none' : '1px solid var(--dark-border)',
                        }}>
                        {msg.message_type === 'audio' && msg.audio_url ? (
                          <AudioPlayer src={msg.audio_url} accentColor={isMine ? 'var(--gold)' : 'var(--text-secondary)'} />
                        ) : (
                          <p className="text-sm leading-relaxed break-words" style={{ color: 'var(--text-primary)' }}>
                            {msg.content}
                          </p>
                        )}
                        <div className={`flex items-center gap-1.5 mt-1 ${isMine ? 'justify-end' : ''}`}>
                          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                            {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMine && (
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                              style={{ color: msg.is_read ? 'var(--gold)' : 'var(--text-muted)' }}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4" style={{ borderTop: '1px solid var(--dark-border)' }}>
            <form onSubmit={sendMessageHandler} className="flex items-center gap-2 rounded-xl px-4 py-2"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)' }}>
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder={`Écrire à ${partnerName}...`}
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: 'var(--text-primary)' }}
                maxLength={2000}
              />
              {newMessage.trim() ? (
                <button type="submit" disabled={sending}
                  className="p-2 rounded-lg transition-all cursor-pointer disabled:opacity-30" style={{ color: 'var(--gold)' }}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </button>
              ) : userId ? (
                <VoiceRecorder userId={userId} onSend={sendVoice} disabled={sending} />
              ) : null}
            </form>
          </div>
        </div>
      </div>
    )
  }

  // ── List view ──
  const inbox = conversations.filter(c => c.isRayon)
  const requests = conversations.filter(c => !c.isRayon)
  const requestCount = requests.reduce((sum, c) => sum + c.unreadCount, 0)
  const currentList = activeSubTab === 'inbox' ? inbox : requests

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)' }}>
        <button
          onClick={() => setActiveSubTab('inbox')}
          className="flex-1 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all cursor-pointer"
          style={{
            background: activeSubTab === 'inbox' ? 'rgba(212,175,55,0.1)' : 'transparent',
            color: activeSubTab === 'inbox' ? 'var(--gold)' : 'var(--text-muted)',
          }}
        >
          Boîte de réception
          {inbox.length > 0 && (
            <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(212,175,55,0.15)', color: 'var(--gold)' }}>
              {inbox.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveSubTab('requests')}
          className="flex-1 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all cursor-pointer"
          style={{
            background: activeSubTab === 'requests' ? 'rgba(212,175,55,0.1)' : 'transparent',
            color: activeSubTab === 'requests' ? 'var(--gold)' : 'var(--text-muted)',
          }}
        >
          Demandes
          {requests.length > 0 && (
            <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse"
              style={{ background: '#EF4444', color: '#fff' }}>
              {requests.length}
            </span>
          )}
        </button>
      </div>

      {/* Conversation list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : currentList.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(212,175,55,0.08)' }}>
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} style={{ color: 'var(--gold)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75" />
            </svg>
          </div>
          <h3 className="font-semibold text-[15px] mb-2" style={{ color: 'var(--text-primary)' }}>
            {activeSubTab === 'inbox' ? 'Aucune conversation' : 'Aucune demande de message'}
          </h3>
          <p className="text-sm max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>
            {activeSubTab === 'inbox'
              ? 'Vos conversations avec vos Rayons apparaîtront ici.'
              : 'Les messages de personnes hors de vos Rayons apparaîtront ici.'}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
          {currentList.map((convo, i) => {
            const name = convo.partner.pseudo || convo.partner.prenom
            const isOwn = convo.lastMessage.sender_id === userId
            const msgText = convo.lastMessage.message_type === 'audio' ? '🎤 Message vocal' : (convo.lastMessage.content || '')
            const preview = isOwn ? `Vous : ${msgText}` : msgText
            return (
              <button
                key={convo.partner.id}
                onClick={() => openConversation(convo.partner.id)}
                className="w-full flex items-center gap-4 px-5 py-4 transition-all text-left cursor-pointer"
                style={{
                  borderBottom: i < currentList.length - 1 ? '1px solid var(--dark-border)' : 'none',
                  background: convo.unreadCount > 0 ? 'rgba(212,175,55,0.04)' : 'transparent',
                }}
              >
                {convo.partner.avatar_url ? (
                  <img src={convo.partner.avatar_url} alt={name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-lg font-semibold"
                    style={{ background: 'rgba(212,175,55,0.12)', color: 'var(--gold)' }}>
                    {name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-semibold truncate" style={{ color: convo.partner.role === 'founder' ? 'var(--gold)' : 'var(--text-primary)' }}>
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
                      {preview.length > 60 ? preview.slice(0, 60) + '...' : preview}
                    </p>
                    {convo.unreadCount > 0 && (
                      <span className="flex-shrink-0 ml-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold"
                        style={{ background: 'var(--gold)', color: 'var(--dark)' }}>
                        {convo.unreadCount > 9 ? '9+' : convo.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
