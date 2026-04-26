'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type EmailEvent = {
  id: string
  contact_email: string
  event_type: string
  metadata: Record<string, unknown> | null
  created_at: string
}

const EVENT_LABELS: Record<string, { label: string; color: string }> = {
  'sent': { label: 'Campagne envoyée', color: '#74C0FC' },
  'open': { label: 'Ouvert', color: '#55EFC4' },
  'click': { label: 'Cliqué', color: '#C9A961' },
  'sequence_sent': { label: 'Séquence envoyée', color: '#A29BFE' },
  'signature_result_sent': { label: 'Résultat quiz V1', color: '#E17055' },
  'signature_v2_completed': { label: 'Quiz V2 terminé', color: '#55EFC4' },
  'quiz_v2_email_01_sent': { label: 'Quiz V2 — Email 1 (Capture)', color: '#C9A961' },
  'quiz_v2_email_02_sent': { label: 'Quiz V2 — Email 2 (Résultat)', color: '#C9A961' },
  'quiz_v2_email_03_sent': { label: 'Quiz V2 — Email 3 (J+1)', color: '#C9A961' },
  'quiz_v2_email_04_sent': { label: 'Quiz V2 — Email 4 (J+2)', color: '#C9A961' },
  'quiz_v2_email_05_sent': { label: 'Quiz V2 — Email 5 (J+3)', color: '#C9A961' },
  'quiz_v2_email_06_sent': { label: 'Quiz V2 — Email 6 (J+4)', color: '#C9A961' },
  'quiz_v2_email_07_sent': { label: 'Quiz V2 — Email 7 (J+5)', color: '#C9A961' },
  'quiz_v2_email_08_sent': { label: 'Quiz V2 — Email 8 (J+6)', color: '#C9A961' },
  'quiz_v2_email_09_sent': { label: 'Quiz V2 — Email 9 (J+7)', color: '#C9A961' },
  'quiz_v2_email_10_sent': { label: 'Quiz V2 — Email 10 (J+8)', color: '#C9A961' },
  'quiz_v2_email_11_sent': { label: 'Quiz V2 — Email 11 (J+9)', color: '#C9A961' },
  'quiz_v2_email_12_sent': { label: 'Quiz V2 — Email 12 (J+10)', color: '#C9A961' },
  'quiz_v2_email_13_sent': { label: 'Quiz V2 — Email 13 (J+11)', color: '#C9A961' },
  'quiz_v2_email_14_sent': { label: 'Quiz V2 — Email 14 (J+12)', color: '#C9A961' },
  'quiz_v2_email_15_sent': { label: 'Quiz V2 — Email 15 (J+13)', color: '#C9A961' },
  'quiz_v2_email_16_sent': { label: 'Quiz V2 — Email 16 (J+14)', color: '#C9A961' },
  'sequences_paused_for_v2': { label: 'Séquences suspendues (V2)', color: '#E17055' },
  'registration_welcome': { label: 'Bienvenue inscription', color: '#55EFC4' },
}

function getLabel(type: string) {
  return EVENT_LABELS[type] || { label: type, color: 'var(--text-muted)' }
}

export default function EmailLogPage() {
  const [events, setEvents] = useState<EmailEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 50

  useEffect(() => {
    loadEvents()
  }, [page, filter])

  async function loadEvents() {
    setLoading(true)
    const supabase = createClient()
    let query = supabase
      .from('crm_campaign_events')
      .select('id, contact_email, event_type, metadata, created_at')
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (filter !== 'all') {
      if (filter === 'quiz_v2') {
        query = query.like('event_type', 'quiz_v2_%')
      } else {
        query = query.eq('event_type', filter)
      }
    }

    const { data, error } = await query

    if (error) {
      console.error('Email log error:', error)
    } else {
      setEvents(data || [])
    }
    setLoading(false)
  }

  const filteredEvents = search
    ? events.filter(e => e.contact_email?.toLowerCase().includes(search.toLowerCase()))
    : events

  const filterOptions = [
    { value: 'all', label: 'Tous' },
    { value: 'quiz_v2', label: 'Quiz V2 (séquence)' },
    { value: 'sent', label: 'Campagnes' },
    { value: 'sequence_sent', label: 'Séquences classiques' },
    { value: 'open', label: 'Ouvertures' },
    { value: 'click', label: 'Clics' },
    { value: 'signature_result_sent', label: 'Quiz V1' },
    { value: 'signature_v2_completed', label: 'Quiz V2 complétés' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold" style={{ color: 'var(--brand)' }}>
          Journal des emails
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Tous les emails automatiques envoyés depuis la plateforme, en temps réel.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par email..."
          className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
        />
        <select
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setPage(0) }}
          className="px-4 py-2.5 rounded-xl text-sm cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
        >
          {filterOptions.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button
          onClick={() => { setPage(0); loadEvents() }}
          className="px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
          style={{ background: 'rgba(201,169,97,0.1)', border: '1px solid rgba(201,169,97,0.2)', color: 'var(--brand)' }}
        >
          Rafraîchir
        </button>
      </div>

      {/* Stats bar */}
      <div className="flex gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
        <span>{filteredEvents.length} résultats</span>
        <span>Page {page + 1}</span>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12 text-sm" style={{ color: 'var(--text-muted)' }}>
            Aucun email trouvé.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th className="text-left px-4 py-3 font-medium text-xs" style={{ color: 'var(--text-muted)' }}>Date</th>
                  <th className="text-left px-4 py-3 font-medium text-xs" style={{ color: 'var(--text-muted)' }}>Destinataire</th>
                  <th className="text-left px-4 py-3 font-medium text-xs" style={{ color: 'var(--text-muted)' }}>Type</th>
                  <th className="text-left px-4 py-3 font-medium text-xs" style={{ color: 'var(--text-muted)' }}>Détails</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map(event => {
                  const info = getLabel(event.event_type)
                  return (
                    <tr key={event.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                        {new Date(event.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                        <span className="ml-1.5 opacity-60">
                          {new Date(event.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>
                        {event.contact_email || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${info.color}15`, color: info.color }}>
                          {info.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs max-w-[200px] truncate" style={{ color: 'var(--text-muted)' }}>
                        {event.metadata ? JSON.stringify(event.metadata).slice(0, 80) : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
          className="text-sm px-4 py-2 rounded-lg cursor-pointer disabled:opacity-30"
          style={{ color: 'var(--text-muted)' }}
        >
          ← Précédent
        </button>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={filteredEvents.length < PAGE_SIZE}
          className="text-sm px-4 py-2 rounded-lg cursor-pointer disabled:opacity-30"
          style={{ color: 'var(--text-muted)' }}
        >
          Suivant →
        </button>
      </div>
    </div>
  )
}
