'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { MessageWithProfile } from '@/types/database'

export default function ChatGeneralPage() {
  const [messages, setMessages] = useState<MessageWithProfile[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [userPrenom, setUserPrenom] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data: profile } = await supabase.from('profiles').select('prenom').eq('id', user.id).single()
      const p = profile as { prenom: string } | null
      setUserPrenom(p?.prenom || user.user_metadata?.prenom || 'Membre')

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
      .select('*, profiles(prenom, role, avatar_url)')
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
      user_id: userId, content: newMessage.trim(), is_general: true, douleur_id: null, is_deleted: false,
    })
    setNewMessage('')
    await loadMessages()
    setSending(false)
  }

  function formatTime(d: string) {
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-4">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Chat Général
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Espace libre d&apos;échange pour toute la communauté SOS Shine.
        </p>
      </div>

      {/* Quick links to douleur chats */}
      <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-2">
        <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>Salons :</span>
        <Link href="/dashboard/chat" className="px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0"
          style={{ background: 'rgba(212,175,55,0.15)', color: 'var(--gold)' }}>
          Général
        </Link>
        <Link href="/dashboard/encyclopedie" className="px-3 py-1.5 rounded-lg text-xs flex-shrink-0 transition-colors"
          style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', color: 'var(--text-secondary)' }}>
          Voir les chats par douleur
        </Link>
      </div>

      {/* Messages */}
      <div className="flex-1 rounded-2xl overflow-hidden flex flex-col min-h-0"
        style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-2xl" style={{ background: 'rgba(212,175,55,0.1)' }}>
                💬
              </div>
              <h3 className="font-display text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Le chat attend vos mots
              </h3>
              <p className="text-sm max-w-xs" style={{ color: 'var(--text-secondary)' }}>
                Soyez le premier à partager. Votre voix compte.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold"
                  style={{
                    background: msg.user_id === userId ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.05)',
                    color: msg.user_id === userId ? 'var(--gold)' : 'var(--text-secondary)',
                  }}>
                  {msg.profiles?.prenom?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="text-sm font-semibold" style={{ color: msg.profiles?.role === 'founder' ? 'var(--gold)' : 'var(--text-primary)' }}>
                      {msg.profiles?.prenom || 'Membre'}
                    </span>
                    {msg.profiles?.role === 'founder' && (
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(212,175,55,0.15)', color: 'var(--gold)' }}>Fondateur</span>
                    )}
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatTime(msg.created_at)}</span>
                  </div>
                  <p className="text-sm leading-relaxed break-words" style={{ color: 'var(--text-secondary)' }}>{msg.content}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="p-4" style={{ borderTop: '1px solid var(--dark-border)' }}>
          <div className="flex items-center gap-2 rounded-xl px-4 py-2"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)' }}>
            <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Message en tant que ${userPrenom}...`}
              className="flex-1 bg-transparent text-sm outline-none" style={{ color: 'var(--text-primary)' }} maxLength={500} />
            <button type="submit" disabled={!newMessage.trim() || sending}
              className="p-2 rounded-lg transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed" style={{ color: 'var(--gold)' }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
