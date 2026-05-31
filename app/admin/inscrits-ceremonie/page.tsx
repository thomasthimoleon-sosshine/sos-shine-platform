'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Reservation = {
  id: string
  prenom: string
  nom: string
  email: string
  status: 'pending' | 'paid' | 'refunded' | 'cancelled'
  created_at: string
  paid_at: string | null
  ceremonie_date: string | null
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  paid:       { label: 'Payé',     color: '#55EFC4', bg: 'rgba(85,239,196,0.12)' },
  pending:    { label: 'En attente', color: '#C9A961', bg: 'rgba(201,169,97,0.12)' },
  cancelled:  { label: 'Annulé',  color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  refunded:   { label: 'Remboursé', color: '#74C0FC', bg: 'rgba(116,192,252,0.12)' },
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function InscritsCeremonieAdmin() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('ceremonie_reservations')
        .select('id, prenom, nom, email, status, created_at, paid_at, ceremonie_date')
        .order('created_at', { ascending: false })

      if (!error && data) setReservations(data as Reservation[])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = reservations.filter(r => {
    const matchStatus = filter === 'all' || r.status === filter
    const q = search.toLowerCase()
    const matchSearch = !q || r.prenom.toLowerCase().includes(q) || r.nom.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  const stats = {
    total: reservations.length,
    paid: reservations.filter(r => r.status === 'paid').length,
    pending: reservations.filter(r => r.status === 'pending').length,
    cancelled: reservations.filter(r => r.status === 'cancelled' || r.status === 'refunded').length,
  }

  const copyEmails = () => {
    const emails = filtered.filter(r => r.status === 'paid').map(r => r.email).join(', ')
    navigator.clipboard.writeText(emails)
    setCopied('emails')
    setTimeout(() => setCopied(null), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl sm:text-3xl font-light text-[var(--text-primary)] mb-1">
          Inscrits — L&apos;Éveil
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          13 juin 2026 · Lac de Saint-Cassien · 20 places
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total inscrits', value: stats.total, color: 'var(--text-primary)' },
          { label: 'Places payées', value: stats.paid, color: '#55EFC4' },
          { label: 'En attente paiement', value: stats.pending, color: '#C9A961' },
          { label: 'Places restantes', value: Math.max(0, 20 - stats.paid), color: '#74C0FC' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4 text-center"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
            <div className="text-2xl font-bold mb-1" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-[var(--text-muted)]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters + search */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
          {['all', 'paid', 'pending', 'cancelled', 'refunded'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: filter === s ? 'rgba(201,169,97,0.2)' : 'transparent',
                color: filter === s ? 'var(--brand)' : 'var(--text-secondary)',
                border: filter === s ? '1px solid rgba(201,169,97,0.3)' : '1px solid transparent',
              }}>
              {s === 'all' ? 'Tous' : STATUS_CONFIG[s]?.label ?? s}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Rechercher nom, email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[180px] px-4 py-2 rounded-xl text-sm outline-none transition-all"
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
          }}
        />

        <button
          onClick={copyEmails}
          className="px-4 py-2 rounded-xl text-xs font-medium transition-all"
          style={{
            background: copied === 'emails' ? 'rgba(85,239,196,0.15)' : 'rgba(201,169,97,0.1)',
            border: `1px solid ${copied === 'emails' ? 'rgba(85,239,196,0.3)' : 'rgba(201,169,97,0.2)'}`,
            color: copied === 'emails' ? '#55EFC4' : 'var(--brand)',
          }}>
          {copied === 'emails' ? '✓ Copié !' : '📋 Copier emails payés'}
        </button>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[var(--text-muted)]">
          {reservations.length === 0
            ? 'Aucune inscription pour le moment.'
            : 'Aucun résultat pour cette recherche.'}
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--surface-card)', borderBottom: '1px solid var(--border)' }}>
                  {['Prénom', 'Nom', 'Email', 'Statut', 'Inscrit le', 'Payé le'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium tracking-wide uppercase text-[var(--text-muted)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => {
                  const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending
                  return (
                    <tr key={r.id}
                      style={{
                        background: i % 2 === 0 ? 'var(--surface)' : 'var(--surface-card)',
                        borderBottom: '1px solid var(--border)',
                      }}>
                      <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{r.prenom}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{r.nom}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">
                        <a href={`mailto:${r.email}`} className="hover:underline" style={{ color: 'var(--brand)' }}>{r.email}</a>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: cfg.bg, color: cfg.color }}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{formatDate(r.created_at)}</td>
                      <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{formatDate(r.paid_at)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden divide-y divide-[var(--border)]">
            {filtered.map(r => {
              const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending
              return (
                <div key={r.id} className="p-4" style={{ background: 'var(--surface-card)' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{r.prenom} {r.nom}</p>
                      <a href={`mailto:${r.email}`} className="text-xs" style={{ color: 'var(--brand)' }}>{r.email}</a>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: cfg.bg, color: cfg.color }}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">Inscrit le {formatDate(r.created_at)}</p>
                  {r.paid_at && <p className="text-xs text-[var(--text-muted)]">Payé le {formatDate(r.paid_at)}</p>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <p className="text-xs text-[var(--text-muted)] mt-4 text-center">
        {filtered.length} inscription{filtered.length > 1 ? 's' : ''} affichée{filtered.length > 1 ? 's' : ''}
      </p>
    </div>
  )
}
