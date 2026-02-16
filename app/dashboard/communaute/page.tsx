'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { MessageWithProfile } from '@/types/database'

type Channel = 'general' | string

export default function CommunautePage() {
  const [messages, setMessages] = useState<MessageWithProfile[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [activeChannel, setActiveChannel] = useState<Channel>('general')
  const [userId, setUserId] = useState<string | null>(null)
  const [userPrenom, setUserPrenom] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const channels = [
    { id: 'general', label: 'Général', description: 'Discussions libres entre membres' },
    { id: 'rupture-amoureuse', label: 'Rupture', description: 'Soutien après une séparation' },
    { id: 'deuil', label: 'Deuil', description: 'Accompagnement dans le deuil' },
    { id: 'burn-out', label: 'Burn-out', description: 'Partage sur l\'épuisement' },
    { id: 'victoires', label: 'Victoires', description: 'Célébrez vos avancées !' },
  ]

  useEffect(() => {
    const supabase = createClient()

    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserId(user.id)

      // Get profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('prenom')
        .eq('id', user.id)
        .single()

      const profileData = profile as { prenom: string } | null
      setUserPrenom(profileData?.prenom || user.user_metadata?.prenom || 'Membre')

      await loadMessages()
    }

    init()
  }, [])

  useEffect(() => {
    loadMessages()
  }, [activeChannel])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function loadMessages() {
    setLoading(true)
    const supabase = createClient()

    let query = supabase
      .from('messages')
      .select('*, profiles(prenom, role, avatar_url)')
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })
      .limit(50)

    if (activeChannel === 'general') {
      query = query.eq('is_general', true)
    } else {
      query = query.eq('is_general', false)
    }

    const { data } = await query

    if (data) {
      setMessages(data as unknown as MessageWithProfile[])
    }
    setLoading(false)
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || !userId || sending) return

    setSending(true)
    const supabase = createClient()

    const { error } = await supabase.from('messages').insert({
      user_id: userId,
      content: newMessage.trim(),
      is_general: activeChannel === 'general',
      douleur_id: activeChannel !== 'general' ? null : null,
      is_deleted: false,
    })

    if (!error) {
      setNewMessage('')
      await loadMessages()
    }
    setSending(false)
  }

  function formatTime(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Le Feu de Camp
        </h1>
        <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
          Un espace sûr pour partager, écouter et avancer ensemble.
        </p>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Channels sidebar */}
        <div
          className="hidden sm:flex flex-col w-52 flex-shrink-0 rounded-2xl overflow-hidden"
          style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}
        >
          <div className="p-4" style={{ borderBottom: '1px solid var(--dark-border)' }}>
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Salons
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setActiveChannel(channel.id)}
                className="w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all duration-200 cursor-pointer"
                style={{
                  background: activeChannel === channel.id ? 'rgba(212, 168, 67, 0.1)' : 'transparent',
                  color: activeChannel === channel.id ? 'var(--gold)' : 'var(--text-secondary)',
                }}
              >
                <span className="font-medium">
                  {channel.id === 'victoires' ? '🏆 ' : '# '}
                  {channel.label}
                </span>
              </button>
            ))}
          </div>

          {/* Community guidelines */}
          <div className="p-3" style={{ borderTop: '1px solid var(--dark-border)' }}>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Bienveillance et respect sont les règles d&apos;or de cet espace.
            </p>
          </div>
        </div>

        {/* Mobile channel selector */}
        <div className="sm:hidden mb-3">
          <select
            value={activeChannel}
            onChange={(e) => setActiveChannel(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-sm cursor-pointer"
            style={{
              background: 'var(--dark-card)',
              border: '1px solid var(--dark-border)',
              color: 'var(--text-primary)',
            }}
          >
            {channels.map((ch) => (
              <option key={ch.id} value={ch.id}>{ch.label}</option>
            ))}
          </select>
        </div>

        {/* Chat area */}
        <div
          className="flex-1 flex flex-col rounded-2xl overflow-hidden min-w-0"
          style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}
        >
          {/* Channel header */}
          <div
            className="px-5 py-4 flex items-center gap-3"
            style={{ borderBottom: '1px solid var(--dark-border)' }}
          >
            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              # {channels.find(c => c.id === activeChannel)?.label || 'Général'}
            </span>
            <span className="text-xs hidden sm:inline" style={{ color: 'var(--text-muted)' }}>
              — {channels.find(c => c.id === activeChannel)?.description}
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-2xl"
                  style={{ background: 'rgba(255, 107, 53, 0.1)' }}
                >
                  🔥
                </div>
                <h3 className="font-display text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Le feu attend d&apos;être allumé
                </h3>
                <p className="text-sm max-w-xs" style={{ color: 'var(--text-secondary)' }}>
                  Soyez le premier à partager dans ce salon. Votre voix compte.
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="flex gap-3 group">
                  {/* Avatar */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold"
                    style={{
                      background: msg.user_id === userId
                        ? 'rgba(212, 168, 67, 0.15)'
                        : 'rgba(255, 255, 255, 0.05)',
                      color: msg.user_id === userId ? 'var(--gold)' : 'var(--text-secondary)',
                    }}
                  >
                    {msg.profiles?.prenom?.charAt(0).toUpperCase() || '?'}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="text-sm font-semibold" style={{
                        color: msg.profiles?.role === 'founder' ? 'var(--gold)' : 'var(--text-primary)'
                      }}>
                        {msg.profiles?.prenom || 'Membre'}
                      </span>
                      {msg.profiles?.role === 'founder' && (
                        <span
                          className="text-xs px-1.5 py-0.5 rounded"
                          style={{ background: 'rgba(212, 168, 67, 0.15)', color: 'var(--gold)' }}
                        >
                          Fondateur
                        </span>
                      )}
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {formatTime(msg.created_at)}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed break-words" style={{ color: 'var(--text-secondary)' }}>
                      {msg.content}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={sendMessage}
            className="p-4"
            style={{ borderTop: '1px solid var(--dark-border)' }}
          >
            <div
              className="flex items-center gap-2 rounded-xl px-4 py-2"
              style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--dark-border)' }}
            >
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Message en tant que ${userPrenom}...`}
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: 'var(--text-primary)' }}
                maxLength={500}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="p-2 rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ color: 'var(--gold)' }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
