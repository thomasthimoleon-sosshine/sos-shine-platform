'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import SubscriptionGate from '@/components/SubscriptionGate'
import type { MessageWithProfile } from '@/types/database'
import AudioPlayer from '@/components/AudioPlayer'
import VoiceRecorder from '@/components/VoiceRecorder'
import { useTranslation } from '@/lib/i18n/useTranslation'

export default function ChatGeneralPage() {
  const { t } = useTranslation()
  const [messages, setMessages] = useState<MessageWithProfile[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [userPrenom, setUserPrenom] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data: profile } = await supabase.from('profiles').select('prenom, pseudo').eq('id', user.id).single()
      const p = profile as { prenom: string; pseudo: string | null } | null
      setUserPrenom(p?.pseudo || p?.prenom || user.user_metadata?.prenom || 'Membre')

      await loadMessages()
    }
    init()
  }, [])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function loadMessages() {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('messages')
      .select('*, profiles(prenom, pseudo, role, avatar_url)')
      .eq('is_general', true)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })
      .limit(100)

    if (data) setMessages(data as unknown as MessageWithProfile[])
    setLoading(false)
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || !userId || sending) return
    setSending(true)
    const supabase = createClient()
    await supabase.from('messages').insert({
      user_id: userId, content: newMessage.trim(), is_general: true, douleur_id: null, is_deleted: false, is_anonymous: isAnonymous, message_type: 'text',
    })
    setNewMessage('')
    await loadMessages()
    setSending(false)
  }

  const sendVoice = useCallback(async (audioUrl: string) => {
    if (!userId) return
    const supabase = createClient()
    await supabase.from('messages').insert({
      user_id: userId, content: '', audio_url: audioUrl, message_type: 'audio', is_general: true, douleur_id: null, is_deleted: false, is_anonymous: isAnonymous,
    })
    await loadMessages()
  }, [userId, isAnonymous])

  function formatTime(d: string) {
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  function getDisplayName(msg: MessageWithProfile): string {
    if (msg.is_anonymous && msg.user_id !== userId) return t('dashboard.anonymous')
    return msg.profiles?.pseudo || msg.profiles?.prenom || 'Membre'
  }

  function getDisplayInitial(msg: MessageWithProfile): string {
    if (msg.is_anonymous && msg.user_id !== userId) return '?'
    return (msg.profiles?.pseudo || msg.profiles?.prenom)?.charAt(0).toUpperCase() || '?'
  }

  return (
    <SubscriptionGate allowFree>
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-4">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          {t('dashboard.chat_title')}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          {t('dashboard.chat_general_subtitle')}
        </p>
      </div>

      {/* Quick links to challenge chats */}
      <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-2">
        <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{t('dashboard.channels')}</span>
        <Link href="/dashboard/chat" className="px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0"
          style={{ background: 'rgba(201,169,97,0.15)', color: 'var(--brand)' }}>
          {t('dashboard.general')}
        </Link>
        <Link href="/dashboard/encyclopedie" className="px-3 py-1.5 rounded-lg text-xs flex-shrink-0 transition-colors"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
          {t('dashboard.view_challenge_chats')}
        </Link>
      </div>

      {/* Messages */}
      <div className="flex-1 rounded-2xl overflow-hidden flex flex-col min-h-0"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-2xl" style={{ background: 'rgba(201,169,97,0.1)' }}>
                💬
              </div>
              <h3 className="font-display text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                {t('dashboard.chat_empty_title')}
              </h3>
              <p className="text-sm max-w-xs" style={{ color: 'var(--text-secondary)' }}>
                {t('dashboard.chat_empty_desc')}
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isAnon = msg.is_anonymous && msg.user_id !== userId
              const canClickProfile = !isAnon && msg.user_id !== userId
              const avatarContent = !isAnon && msg.profiles?.avatar_url ? (
                <img src={msg.profiles.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold"
                  style={{
                    background: isAnon ? 'rgba(142,110,126,0.15)' : msg.user_id === userId ? 'rgba(201,169,97,0.15)' : 'rgba(255,255,255,0.05)',
                    color: isAnon ? 'var(--text-muted)' : msg.user_id === userId ? 'var(--brand)' : 'var(--text-secondary)',
                  }}>
                  {getDisplayInitial(msg)}
                </div>
              )
              return (
                <div key={msg.id} className="flex gap-3">
                  {/* Avatar */}
                  {canClickProfile ? (
                    <Link href={`/dashboard/membre/${msg.user_id}`} className="flex-shrink-0 hover:opacity-80 transition-opacity">
                      {avatarContent}
                    </Link>
                  ) : avatarContent}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      {canClickProfile ? (
                        <Link href={`/dashboard/membre/${msg.user_id}`} className="text-sm font-semibold hover:underline" style={{
                          color: msg.profiles?.role === 'founder' ? 'var(--brand)' : 'var(--text-primary)',
                        }}>
                          {getDisplayName(msg)}
                        </Link>
                      ) : (
                        <span className="text-sm font-semibold" style={{
                          color: isAnon ? 'var(--text-muted)' : msg.profiles?.role === 'founder' ? 'var(--brand)' : 'var(--text-primary)',
                          fontStyle: isAnon ? 'italic' : 'normal',
                        }}>
                          {getDisplayName(msg)}
                        </span>
                      )}
                      {!isAnon && msg.profiles?.role === 'founder' && (
                        <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(201,169,97,0.15)', color: 'var(--brand)' }}>{t('dashboard.founder')}</span>
                      )}
                      {msg.is_anonymous && msg.user_id === userId && (
                        <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(142,110,126,0.15)', color: 'var(--text-muted)' }}>{t('dashboard.anonymous')}</span>
                      )}
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatTime(msg.created_at)}</span>
                    </div>
                    {msg.message_type === 'audio' && msg.audio_url ? (
                      <AudioPlayer src={msg.audio_url} />
                    ) : (
                      <p className="text-sm leading-relaxed break-words" style={{ color: 'var(--text-secondary)' }}>{msg.content}</p>
                    )}
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
          {/* Anonymous toggle */}
          <div className="flex items-center gap-2 mb-2">
            <button type="button" onClick={() => setIsAnonymous(!isAnonymous)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer"
              style={{
                background: isAnonymous ? 'rgba(142,110,126,0.2)' : 'transparent',
                border: `1px solid ${isAnonymous ? 'var(--text-muted)' : 'var(--border)'}`,
                color: isAnonymous ? 'var(--text-primary)' : 'var(--text-muted)',
              }}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                {isAnonymous ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                )}
              </svg>
              {isAnonymous ? t('dashboard.anonymous_mode_active') : t('dashboard.anonymous')}
            </button>
          </div>
          <form onSubmit={sendMessage} className="flex items-center gap-2 rounded-xl px-4 py-2"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
            <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
              placeholder={isAnonymous ? t('dashboard.anonymous_message') : t('dashboard.message_as', { name: userPrenom })}
              className="flex-1 bg-transparent text-sm outline-none" style={{ color: 'var(--text-primary)' }} maxLength={500} />
            {newMessage.trim() ? (
              <button type="submit" disabled={sending}
                className="p-2 rounded-lg transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed" style={{ color: 'var(--brand)' }}>
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
    </SubscriptionGate>
  )
}
