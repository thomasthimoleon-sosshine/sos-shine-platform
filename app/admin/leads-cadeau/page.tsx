'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Lead = {
  id: string
  prenom: string
  email: string
  source: string
  created_at: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function LeadsCadeauAdmin() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('event_leads')
      .select('id, prenom, email, source, created_at')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setLeads(data as Lead[])
        setLoading(false)
      })
  }, [])

  const visible = leads.filter(l => {
    const q = search.toLowerCase()
    return !q || l.prenom.toLowerCase().includes(q) || l.email.toLowerCase().includes(q)
  })

  const copyEmails = () => {
    const text = visible.map(l => `${l.prenom} <${l.email}>`).join(', ')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    const supabase = createClient()
    await supabase.from('event_leads').delete().eq('id', id)
    setLeads(prev => prev.filter(l => l.id !== id))
    setDeleting(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl sm:text-3xl font-light text-[var(--text-primary)] mb-1">
          Leads, Le Couple Vivant
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          {leads.length} contact{leads.length !== 1 ? 's' : ''} · guide PDF offert
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl p-4 text-center" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
          <div className="text-3xl font-bold mb-1" style={{ color: '#C9A961' }}>{leads.length}</div>
          <div className="text-xs text-[var(--text-muted)]">Total contacts</div>
        </div>
        <div className="rounded-xl p-4 text-center" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
          <div className="text-3xl font-bold mb-1" style={{ color: '#55EFC4' }}>
            {leads.filter(l => {
              const d = new Date(l.created_at)
              const now = new Date()
              return now.getTime() - d.getTime() < 7 * 24 * 60 * 60 * 1000
            }).length}
          </div>
          <div className="text-xs text-[var(--text-muted)]">Cette semaine</div>
        </div>
      </div>

      {/* Search + copy */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <input
          type="text"
          placeholder="Rechercher prénom, email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[180px] px-4 py-2 rounded-xl text-sm outline-none"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
        />
        <button
          onClick={copyEmails}
          className="px-4 py-2 rounded-xl text-xs font-medium transition-all"
          style={{
            background: copied ? 'rgba(85,239,196,0.15)' : 'rgba(201,169,97,0.1)',
            border: `1px solid ${copied ? 'rgba(85,239,196,0.3)' : 'rgba(201,169,97,0.2)'}`,
            color: copied ? '#55EFC4' : 'var(--brand)',
          }}>
          {copied ? '✓ Copié !' : '📋 Copier les emails'}
        </button>
      </div>

      {/* Table */}
      {visible.length === 0 ? (
        <div className="text-center py-16 text-[var(--text-muted)]">
          {leads.length === 0 ? 'Aucun contact pour le moment.' : 'Aucun résultat.'}
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          {/* Desktop */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--surface-card)', borderBottom: '1px solid var(--border)' }}>
                  {['Prénom', 'Email', 'Source', 'Inscrit le', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium tracking-wide uppercase text-[var(--text-muted)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((l, i) => (
                  <tr key={l.id} style={{
                    background: i % 2 === 0 ? 'var(--surface)' : 'var(--surface-card)',
                    borderBottom: '1px solid var(--border)',
                  }}>
                    <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{l.prenom}</td>
                    <td className="px-4 py-3">
                      <a href={`mailto:${l.email}`} className="hover:underline" style={{ color: 'var(--brand)' }}>{l.email}</a>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{l.source}</td>
                    <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{formatDate(l.created_at)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(l.id)}
                        disabled={deleting === l.id}
                        title="Supprimer"
                        className="w-7 h-7 flex items-center justify-center rounded-lg transition-all hover:bg-red-500/20"
                        style={{ color: '#ef4444' }}>
                        {deleting === l.id
                          ? <span className="w-3.5 h-3.5 border border-red-400 border-t-transparent rounded-full animate-spin inline-block" />
                          : '🗑'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="sm:hidden divide-y divide-[var(--border)]">
            {visible.map(l => (
              <div key={l.id} className="p-4 flex items-start gap-3" style={{ background: 'var(--surface-card)' }}>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--text-primary)] mb-1">{l.prenom}</p>
                  <a href={`mailto:${l.email}`} className="text-xs block truncate mb-1" style={{ color: 'var(--brand)' }}>{l.email}</a>
                  <p className="text-xs text-[var(--text-muted)]">{formatDate(l.created_at)}</p>
                </div>
                <button
                  onClick={() => handleDelete(l.id)}
                  disabled={deleting === l.id}
                  className="text-xs px-2 py-1 rounded-lg flex-shrink-0"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {deleting === l.id ? '...' : 'Supprimer'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-[var(--text-muted)] mt-4 text-center">
        {visible.length} contact{visible.length !== 1 ? 's' : ''} affiché{visible.length !== 1 ? 's' : ''}
      </p>
    </div>
  )
}
