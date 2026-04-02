'use client'

import { useEffect, useState, useMemo } from 'react'

type CandidatureProfile = {
  prenom: string
  email: string
  avatar_url: string | null
}

type Candidature = {
  id: string
  user_id: string
  status: 'pending' | 'approved' | 'rejected' | 'suspended'
  referral_code: string
  motivation: string
  audience_size: string | null
  promotion_channels: string[]
  social_links: Record<string, string>
  website_url: string | null
  total_referrals: number
  total_earnings: number
  current_tier: string
  created_at: string
  approved_at: string | null
  rejected_at: string | null
  rejection_reason: string | null
  profiles: CandidatureProfile
}

const statusStyles: Record<string, { bg: string; color: string; label: string }> = {
  pending:   { bg: 'rgba(212,175,55,0.12)',  color: '#D4AF37', label: 'En attente' },
  approved:  { bg: 'rgba(85,239,196,0.12)',  color: '#55EFC4', label: 'Approuvée' },
  rejected:  { bg: 'rgba(239,68,68,0.12)',   color: '#ef4444', label: 'Refusée' },
  suspended: { bg: 'rgba(225,112,85,0.12)',  color: '#E17055', label: 'Suspendue' },
}

function formatDateFR(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default function AdminCandidatures() {
  const [candidatures, setCandidatures] = useState<Candidature[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [processing, setProcessing] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/candidatures')
        if (!res.ok) { setError('Impossible de charger les candidatures'); setLoading(false); return }
        const json = await res.json()
        setCandidatures(json.candidatures || [])
      } catch {
        setError('Erreur de connexion')
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleAction(id: string, action: 'approve' | 'reject', reason?: string) {
    setProcessing(id)
    setError(null)
    try {
      const res = await fetch('/api/admin/candidatures', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ affiliateId: id, action, rejection_reason: reason }),
      })
      if (res.ok) {
        const json = await res.json()
        setCandidatures(prev => prev.map(c =>
          c.id === id ? {
            ...c,
            status: json.status,
            approved_at: action === 'approve' ? new Date().toISOString() : c.approved_at,
            rejected_at: action === 'reject' ? new Date().toISOString() : c.rejected_at,
            rejection_reason: reason || null,
          } : c
        ))
        setRejectingId(null)
        setRejectReason('')
      } else {
        const json = await res.json()
        setError(json.error || 'Erreur')
      }
    } catch {
      setError('Erreur de connexion')
    }
    setProcessing(null)
  }

  const stats = useMemo(() => ({
    total: candidatures.length,
    pending: candidatures.filter(c => c.status === 'pending').length,
    approved: candidatures.filter(c => c.status === 'approved').length,
    rejected: candidatures.filter(c => c.status === 'rejected').length,
  }), [candidatures])

  const filtered = useMemo(() => {
    let list = candidatures
    if (filterStatus !== 'all') list = list.filter(c => c.status === filterStatus)
    if (search.trim()) {
      const q = search.toLowerCase().trim()
      list = list.filter(c =>
        c.profiles?.prenom?.toLowerCase().includes(q) ||
        c.profiles?.email?.toLowerCase().includes(q) ||
        c.motivation?.toLowerCase().includes(q)
      )
    }
    return list
  }, [candidatures, search, filterStatus])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Candidatures
        </h1>
        <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
          {loading ? 'Chargement...' : `${candidatures.length} candidature${candidatures.length !== 1 ? 's' : ''} au programme d'affiliation.`}
        </p>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: stats.total, color: 'var(--text-primary)' },
            { label: 'En attente', value: stats.pending, color: '#D4AF37' },
            { label: 'Approuvées', value: stats.approved, color: '#55EFC4' },
            { label: 'Refusées', value: stats.rejected, color: '#ef4444' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4 text-center" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
              <p className="font-display text-2xl font-light" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="px-4 py-3 rounded-xl text-sm" style={{ color: '#f87171', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)' }}>
          {error}
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <input
            type="text" placeholder="Rechercher par nom, email ou motivation..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
          />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm outline-none cursor-pointer"
          style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}>
          <option value="all">Toutes</option>
          <option value="pending">En attente</option>
          <option value="approved">Approuvées</option>
          <option value="rejected">Refusées</option>
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#74C0FC] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 rounded-xl" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {search.trim() ? 'Aucune candidature ne correspond.' : 'Aucune candidature pour le moment.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => {
            const st = statusStyles[c.status] || statusStyles.pending
            const isExpanded = expandedId === c.id
            return (
              <div key={c.id} className="rounded-xl overflow-hidden transition-all"
                style={{ background: 'var(--dark-card)', border: `1px solid ${c.status === 'pending' ? 'rgba(212,175,55,0.2)' : 'var(--dark-border)'}` }}>
                {/* Header row */}
                <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : c.id)}>
                  {c.profiles?.avatar_url ? (
                    <img src={c.profiles.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
                      style={{ background: 'rgba(212,175,55,0.12)', color: '#D4AF37' }}>
                      {c.profiles?.prenom?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                        {c.profiles?.prenom || 'Inconnu'}
                      </span>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium"
                        style={{ background: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                    </div>
                    <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{c.profiles?.email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDateFR(c.created_at)}</p>
                    {c.promotion_channels.length > 0 && (
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {c.promotion_channels.join(', ')}
                      </p>
                    )}
                  </div>
                  <svg className={`w-5 h-5 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-4" style={{ borderTop: '1px solid var(--dark-border)' }}>
                    {/* Motivation */}
                    <div className="pt-4">
                      <p className="text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Motivation</p>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{c.motivation}</p>
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {c.audience_size && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Audience</p>
                          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{c.audience_size}</p>
                        </div>
                      )}
                      {c.website_url && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Site web</p>
                          <a href={c.website_url} target="_blank" rel="noopener noreferrer"
                            className="text-sm underline" style={{ color: '#74C0FC' }}>
                            {c.website_url.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      )}
                      {c.social_links?.main && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Réseau social</p>
                          <a href={c.social_links.main} target="_blank" rel="noopener noreferrer"
                            className="text-sm underline" style={{ color: '#74C0FC' }}>
                            Voir le profil
                          </a>
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Code parrainage</p>
                        <p className="text-sm font-mono" style={{ color: 'var(--gold)' }}>{c.referral_code}</p>
                      </div>
                    </div>

                    {/* Stats if approved */}
                    {c.status === 'approved' && (
                      <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-lg p-3 text-center" style={{ background: 'rgba(85,239,196,0.05)' }}>
                          <p className="font-display text-lg font-light" style={{ color: '#55EFC4' }}>{c.total_referrals}</p>
                          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Filleuls</p>
                        </div>
                        <div className="rounded-lg p-3 text-center" style={{ background: 'rgba(212,175,55,0.05)' }}>
                          <p className="font-display text-lg font-light" style={{ color: '#D4AF37' }}>{c.total_earnings.toFixed(2)}&#8364;</p>
                          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Gains totaux</p>
                        </div>
                        <div className="rounded-lg p-3 text-center" style={{ background: 'rgba(116,192,252,0.05)' }}>
                          <p className="font-display text-lg font-light capitalize" style={{ color: '#74C0FC' }}>{c.current_tier}</p>
                          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Palier</p>
                        </div>
                      </div>
                    )}

                    {/* Rejection reason */}
                    {c.status === 'rejected' && c.rejection_reason && (
                      <div className="rounded-lg p-3" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)' }}>
                        <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#ef4444' }}>Motif du refus</p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{c.rejection_reason}</p>
                      </div>
                    )}

                    {/* Actions */}
                    {c.status === 'pending' && (
                      <div className="flex items-center gap-3 pt-2">
                        <button
                          onClick={() => handleAction(c.id, 'approve')}
                          disabled={processing === c.id}
                          className="px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all disabled:opacity-50"
                          style={{ background: 'rgba(85,239,196,0.15)', color: '#55EFC4', border: '1px solid rgba(85,239,196,0.25)' }}>
                          {processing === c.id ? 'Traitement...' : 'Approuver'}
                        </button>
                        {rejectingId === c.id ? (
                          <div className="flex-1 flex items-center gap-2">
                            <input
                              type="text" placeholder="Motif du refus (optionnel)"
                              value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                              className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                              style={{ background: 'var(--dark)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
                            />
                            <button onClick={() => handleAction(c.id, 'reject', rejectReason)}
                              disabled={processing === c.id}
                              className="px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer disabled:opacity-50"
                              style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
                              Confirmer
                            </button>
                            <button onClick={() => { setRejectingId(null); setRejectReason('') }}
                              className="text-xs cursor-pointer" style={{ color: 'var(--text-muted)' }}>
                              Annuler
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setRejectingId(c.id)}
                            className="px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all"
                            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)' }}>
                            Refuser
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
