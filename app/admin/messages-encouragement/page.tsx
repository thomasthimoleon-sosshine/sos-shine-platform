'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

type TimeSlot = 'night' | 'morning' | 'afternoon' | 'evening'

interface EncouragementMessage {
  id: string
  time_slot: TimeSlot
  message: string
  sort_order: number
  is_active: boolean
}

const SLOT_LABELS: Record<TimeSlot, { label: string; icon: string; hours: string }> = {
  night: { label: 'Nuit', icon: '🌙', hours: '0h - 5h' },
  morning: { label: 'Matin', icon: '☀️', hours: '5h - 12h' },
  afternoon: { label: 'Après-midi', icon: '🌤️', hours: '12h - 18h' },
  evening: { label: 'Soir', icon: '🌅', hours: '18h - 0h' },
}

const SLOTS: TimeSlot[] = ['night', 'morning', 'afternoon', 'evening']

export default function MessagesEncouragementPage() {
  const [messages, setMessages] = useState<EncouragementMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeSlot, setActiveSlot] = useState<TimeSlot>('morning')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [importing, setImporting] = useState(false)

  const loadMessages = useCallback(async () => {
    const supabase = createClient()
    const { data, error: fetchError } = await supabase
      .from('encouragement_messages')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
      setLoading(false)
      return
    }
    setMessages((data as EncouragementMessage[]) || [])
    setLoading(false)
  }, [])

  useEffect(() => { loadMessages() }, [loadMessages])

  const slotMessages = messages.filter(m => m.time_slot === activeSlot)

  async function handleAdd() {
    if (!newMessage.trim()) return
    setSaving(true); setError(null)
    const supabase = createClient()
    const maxOrder = slotMessages.reduce((max, m) => Math.max(max, m.sort_order), -1)
    const { data, error: insertError } = await supabase
      .from('encouragement_messages')
      .insert({ time_slot: activeSlot, message: newMessage.trim(), sort_order: maxOrder + 1 })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
    } else if (data) {
      setMessages(prev => [...prev, data as EncouragementMessage])
      setNewMessage('')
    }
    setSaving(false)
  }

  async function handleUpdate(id: string) {
    if (!editText.trim()) return
    setSaving(true); setError(null)
    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('encouragement_messages')
      .update({ message: editText.trim(), updated_at: new Date().toISOString() })
      .eq('id', id)

    if (updateError) {
      setError(updateError.message)
    } else {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, message: editText.trim() } : m))
      setEditingId(null); setEditText('')
    }
    setSaving(false)
  }

  async function handleToggleActive(id: string, currentActive: boolean) {
    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('encouragement_messages')
      .update({ is_active: !currentActive, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (updateError) {
      setError(updateError.message)
    } else {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, is_active: !currentActive } : m))
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce message ?')) return
    const supabase = createClient()
    const { error: deleteError } = await supabase
      .from('encouragement_messages')
      .delete()
      .eq('id', id)

    if (deleteError) {
      setError(deleteError.message)
    } else {
      setMessages(prev => prev.filter(m => m.id !== id))
    }
  }

  async function handleImportDefaults() {
    if (!confirm(
      'Importer les messages par défaut pour le créneau "' + SLOT_LABELS[activeSlot].label + '" ?\n\n' +
      'Les messages existants ne seront pas supprimés.'
    )) return

    setImporting(true); setError(null)

    try {
      const { greetingsData } = await import('@/data/greetingsData')
      const defaultMessages = greetingsData[activeSlot]
      const supabase = createClient()
      const maxOrder = slotMessages.reduce((max, m) => Math.max(max, m.sort_order), -1)

      const rows = defaultMessages.map((msg: string, i: number) => ({
        time_slot: activeSlot,
        message: msg,
        sort_order: maxOrder + 1 + i,
        is_active: true,
      }))

      const { data, error: insertError } = await supabase
        .from('encouragement_messages')
        .insert(rows)
        .select()

      if (insertError) {
        setError(insertError.message)
      } else if (data) {
        setMessages(prev => [...prev, ...(data as EncouragementMessage[])])
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (err) {
      setError(`Erreur d'import: ${err instanceof Error ? err.message : 'Erreur inconnue'}`)
    }
    setImporting(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#74C0FC] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--dark-border)',
    color: 'var(--text-primary)',
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Messages d&apos;encouragement
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Personnalisez les messages qui s&apos;affichent sur le dashboard des membres selon l&apos;heure de la journée.
          </p>
        </div>
        {saved && <span className="text-sm font-medium" style={{ color: '#55EFC4' }}>Sauvegardé !</span>}
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm" style={{
          background: 'rgba(255,107,107,0.1)',
          border: '1px solid rgba(255,107,107,0.25)',
          color: '#FF6B6B',
        }}>
          {error}
        </div>
      )}

      {/* Slot tabs */}
      <div className="flex gap-2 flex-wrap">
        {SLOTS.map(slot => {
          const info = SLOT_LABELS[slot]
          const count = messages.filter(m => m.time_slot === slot && m.is_active).length
          const isActive = activeSlot === slot
          return (
            <button
              key={slot}
              onClick={() => setActiveSlot(slot)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer"
              style={{
                background: isActive ? 'rgba(116,192,252,0.15)' : 'rgba(255,255,255,0.03)',
                border: isActive ? '1px solid rgba(116,192,252,0.4)' : '1px solid var(--dark-border)',
                color: isActive ? '#74C0FC' : 'var(--text-secondary)',
              }}
            >
              <span>{info.icon}</span>
              <span>{info.label}</span>
              <span className="text-xs opacity-60">({info.hours})</span>
              <span className="ml-1 px-1.5 py-0.5 rounded-md text-xs" style={{
                background: isActive ? 'rgba(116,192,252,0.2)' : 'rgba(255,255,255,0.05)',
              }}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Add message */}
      <div className="rounded-xl p-4" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
        <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Ajouter un nouveau message
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Tapez votre message d'encouragement..."
            className="flex-1 rounded-lg px-3 py-2.5 text-sm outline-none"
            style={inputStyle}
          />
          <button
            onClick={handleAdd}
            disabled={saving || !newMessage.trim()}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold cursor-pointer disabled:opacity-50 whitespace-nowrap"
            style={{ background: '#74C0FC', color: '#fff' }}
          >
            Ajouter
          </button>
        </div>
      </div>

      {/* Import defaults */}
      {slotMessages.length === 0 && (
        <div className="rounded-xl p-6 text-center" style={{ background: 'var(--dark-card)', border: '1px dashed var(--dark-border)' }}>
          <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
            Aucun message pour ce créneau. Importez les messages par défaut pour commencer.
          </p>
          <button
            onClick={handleImportDefaults}
            disabled={importing}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold cursor-pointer disabled:opacity-50"
            style={{ background: 'rgba(85,239,196,0.15)', color: '#55EFC4', border: '1px solid rgba(85,239,196,0.3)' }}
          >
            {importing ? 'Import en cours...' : `Importer les ${40} messages par défaut`}
          </button>
        </div>
      )}

      {/* Messages list */}
      <div className="space-y-2">
        {slotMessages.map((msg, idx) => (
          <div
            key={msg.id}
            className="rounded-xl p-4 flex items-start gap-3 group"
            style={{
              background: msg.is_active ? 'var(--dark-card)' : 'rgba(255,255,255,0.01)',
              border: '1px solid var(--dark-border)',
              opacity: msg.is_active ? 1 : 0.5,
            }}
          >
            <span className="text-xs font-mono mt-1 w-6 text-center flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
              {idx + 1}
            </span>

            {editingId === msg.id ? (
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleUpdate(msg.id)
                    if (e.key === 'Escape') { setEditingId(null); setEditText('') }
                  }}
                  autoFocus
                  className="flex-1 rounded-lg px-3 py-1.5 text-sm outline-none"
                  style={inputStyle}
                />
                <button onClick={() => handleUpdate(msg.id)} disabled={saving}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
                  style={{ background: '#55EFC4', color: '#000' }}>
                  OK
                </button>
                <button onClick={() => { setEditingId(null); setEditText('') }}
                  className="px-3 py-1.5 rounded-lg text-xs cursor-pointer"
                  style={{ color: 'var(--text-muted)', border: '1px solid var(--dark-border)' }}>
                  Annuler
                </button>
              </div>
            ) : (
              <>
                <p className="flex-1 text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  {msg.message}
                </p>
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={() => { setEditingId(msg.id); setEditText(msg.message) }}
                    className="p-1.5 rounded-lg cursor-pointer hover:bg-white/5"
                    title="Modifier"
                    style={{ color: '#74C0FC' }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleToggleActive(msg.id, msg.is_active)}
                    className="p-1.5 rounded-lg cursor-pointer hover:bg-white/5"
                    title={msg.is_active ? 'Désactiver' : 'Activer'}
                    style={{ color: msg.is_active ? '#55EFC4' : 'var(--text-muted)' }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      {msg.is_active ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.64 0 8.577 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.64 0-8.577-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      )}
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="p-1.5 rounded-lg cursor-pointer hover:bg-white/5"
                    title="Supprimer"
                    style={{ color: '#FF6B6B' }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Import button when there are already messages */}
      {slotMessages.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleImportDefaults}
            disabled={importing}
            className="px-4 py-2 rounded-lg text-xs cursor-pointer disabled:opacity-50"
            style={{ color: 'var(--text-muted)', border: '1px solid var(--dark-border)' }}
          >
            {importing ? 'Import...' : 'Importer les messages par défaut'}
          </button>
        </div>
      )}

      {/* Push Notification Section */}
      <PushNotificationAdmin />
    </div>
  )
}

/* ─────────────────────────────────────
   Admin section for push notifications
   ───────────────────────────────────── */
function PushNotificationAdmin() {
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [testTitle, setTestTitle] = useState('SOS Shine')
  const [testBody, setTestBody] = useState('')
  const [subCount, setSubCount] = useState<number | null>(null)

  useEffect(() => {
    async function loadCount() {
      const supabase = createClient()
      const { count } = await supabase
        .from('push_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
      setSubCount(count ?? 0)
    }
    loadCount()
  }, [])

  async function handleSendTest() {
    if (!testBody.trim()) return
    setSending(true); setResult(null)

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'new_soin',
          title: testTitle,
          body: testBody.trim(),
          link: '/dashboard',
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setResult(`${data.count} notifications créées et push envoyés`)
      } else {
        setResult(`Erreur: ${data.error}`)
      }
    } catch (err) {
      setResult(`Erreur: ${err instanceof Error ? err.message : 'Inconnue'}`)
    }
    setSending(false)
  }

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--dark-border)',
    color: 'var(--text-primary)',
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
      <div className="p-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--dark-border)' }}>
        <h2 className="font-semibold text-base flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          Notifications Push
        </h2>
        {subCount !== null && (
          <span className="text-xs px-2.5 py-1 rounded-lg" style={{
            background: 'rgba(116,192,252,0.1)',
            color: '#74C0FC',
          }}>
            {subCount} abonné{subCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="p-5 space-y-4">
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Envoyez une notification push manuelle à tous les membres abonnés, ou configurez le CRON pour envoyer automatiquement les messages d&apos;encouragement.
        </p>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="text-sm sm:w-20 flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>Titre</label>
            <input
              type="text"
              value={testTitle}
              onChange={(e) => setTestTitle(e.target.value)}
              className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
              style={inputStyle}
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="text-sm sm:w-20 flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>Message</label>
            <input
              type="text"
              value={testBody}
              onChange={(e) => setTestBody(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendTest()}
              placeholder="Tapez le message à envoyer..."
              className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
              style={inputStyle}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSendTest}
            disabled={sending || !testBody.trim()}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold cursor-pointer disabled:opacity-50"
            style={{ background: '#74C0FC', color: '#fff' }}
          >
            {sending ? 'Envoi...' : 'Envoyer la notification'}
          </button>
          {result && (
            <span className="text-xs" style={{ color: result.startsWith('Erreur') ? '#FF6B6B' : '#55EFC4' }}>
              {result}
            </span>
          )}
        </div>

        <div className="mt-4 p-3 rounded-lg text-xs" style={{
          background: 'rgba(116,192,252,0.05)',
          border: '1px solid rgba(116,192,252,0.15)',
          color: 'var(--text-muted)',
        }}>
          <strong style={{ color: '#74C0FC' }}>CRON automatique :</strong> Configurez un cron Vercel pour appeler{' '}
          <code className="px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)' }}>
            /api/push/cron
          </code>{' '}
          à intervalles réguliers. Ce cron pioche un message d&apos;encouragement aléatoire du créneau horaire actuel et l&apos;envoie à tous les abonnés.
        </div>
      </div>
    </div>
  )
}
