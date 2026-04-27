'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Profile, PrivateMessage } from '@/types/database'
import AudioPlayer from '@/components/AudioPlayer'
import VoiceRecorder from '@/components/VoiceRecorder'

export default function ConversationPage() {
  const { id: partnerId } = useParams<{ id: string }>()
  const router = useRouter()
  const [messages, setMessages] = useState<PrivateMessage[]>([])
  const [partner, setPartner] = useState<Profile | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      // Charger le profil du partenaire
      const { data: partnerData } = await supabase.from('profiles').select('*').eq('id', partnerId).single()
      if (partnerData) setPartner(partnerData as Profile)

      await loadMessages(user.id)

      // Polling toutes les 5 secondes pour les nouveaux messages
      pollRef.current = setInterval(() => loadMessages(user.id), 5000)
    }
    init()
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [partnerId, router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadMessages(uid: string) {
    const supabase = createClient()

    // Charger les messages entre les deux utilisateurs
    const { data } = await supabase
      .from('private_messages')
      .select('*')
      .or(
        `and(sender_id.eq.${uid},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${uid})`
      )
      .order('created_at', { ascending: true })
      .limit(200)

    if (data) {
      setMessages(data as PrivateMessage[])

      // Marquer comme lu les messages reçus non lus
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
    setLoading(false)
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || !userId || sending) return
    setSending(true)
    const supabase = createClient()
    await supabase.from('private_messages').insert({
      sender_id: userId,
      receiver_id: partnerId,
      content: newMessage.trim(),
      message_type: 'text',
      is_read: false,
    })
    setNewMessage('')
    await loadMessages(userId)
    setSending(false)
  }

  const sendVoice = useCallback(async (audioUrl: string) => {
    if (!userId) return
    const supabase = createClient()
    await supabase.from('private_messages').insert({
      sender_id: userId,
      receiver_id: partnerId,
      content: null,
      audio_url: audioUrl,
      message_type: 'audio',
      is_read: false,
    })
    await loadMessages(userId)
  }, [userId, partnerId])

  function formatTime(d: string) {
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
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

  // Grouper les messages par jour
  function getDateGroup(msg: PrivateMessage, prevMsg: PrivateMessage | null): string | null {
    const date = new Date(msg.created_at).toDateString()
    if (!prevMsg || new Date(prevMsg.created_at).toDateString() !== date) {
      return formatDateSeparator(msg.created_at)
    }
    return null
  }

  const partnerName = partner?.pseudo || partner?.prenom || 'Membre'

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <Link href="/dashboard/messages" className="p-2 rounded-lg flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>

        {partner && (
          <Link href={`/dashboard/membre/${partnerId}`} className="flex items-center gap-3 flex-1 min-w-0">
            {partner.avatar_url ? (
              <img src={partner.avatar_url} alt={partnerName} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold"
                style={{ background: 'rgba(201,169,97,0.12)', color: 'var(--gold)' }}>
                {partnerName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="font-display text-lg font-semibold truncate" style={{
                color: partner.role === 'founder' ? 'var(--gold)' : 'var(--text-primary)',
              }}>
                {partnerName}
              </h1>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Cliquez pour voir le profil</p>
            </div>
          </Link>
        )}

      </div>

      {/* Messages */}
      <div className="flex-1 rounded-2xl overflow-hidden flex flex-col min-h-0"
        style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(201,169,97,0.1)' }}>
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} style={{ color: 'var(--gold)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Démarrez la conversation
              </h3>
              <p className="text-sm max-w-xs" style={{ color: 'var(--text-secondary)' }}>
                Envoyez un premier message à {partnerName}.
              </p>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isMine = msg.sender_id === userId
              const dateLabel = getDateGroup(msg, messages[i - 1] || null)
              return (
                <div key={msg.id}>
                  {dateLabel && (
                    <div className="flex items-center justify-center my-4">
                      <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)' }}>
                        {dateLabel}
                      </span>
                    </div>
                  )}
                  <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-1`}>
                    <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${isMine ? 'rounded-br-md' : 'rounded-bl-md'}`}
                      style={{
                        background: isMine ? 'rgba(201,169,97,0.15)' : 'rgba(255,255,255,0.04)',
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
          <form onSubmit={sendMessage} className="flex items-center gap-2 rounded-xl px-4 py-2"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)' }}>
            <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Écrire à ${partnerName}...`}
              className="flex-1 bg-transparent text-sm outline-none" style={{ color: 'var(--text-primary)' }} maxLength={2000} />
            {newMessage.trim() ? (
              <button type="submit" disabled={sending}
                className="p-2 rounded-lg transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed" style={{ color: 'var(--gold)' }}>
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
