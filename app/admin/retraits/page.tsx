'use client'

import { useEffect, useState, useMemo } from 'react'

type WithdrawalProfile = {
  prenom: string
  email: string
  avatar_url: string | null
}

type Withdrawal = {
  id: string
  user_id: string
  affiliate_id: string
  amount: number
  iban: string | null
  paypal_email: string | null
  payment_method: 'bank_transfer' | 'paypal'
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  admin_note: string | null
  processed_by: string | null
  processed_at: string | null
  created_at: string
  profiles: WithdrawalProfile
}

const statusStyles: Record<string, { bg: string; color: string; label: string }> = {
  pending:    { bg: 'rgba(201,169,97,0.12)',  color: '#C9A961', label: 'En attente' },
  processing: { bg: 'rgba(116,192,252,0.12)', color: '#74C0FC', label: 'En cours' },
  completed:  { bg: 'rgba(85,239,196,0.12)',  color: '#55EFC4', label: 'Effectue' },
  rejected:   { bg: 'rgba(239,68,68,0.12)',   color: '#ef4444', label: 'Refuse' },
}

const methodLabels: Record<string, string> = {
  bank_transfer: 'Virement bancaire',
  paypal: 'PayPal',
}

function formatDateFR(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default function AdminRetraits() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [processing, setProcessing] = useState<string | null>(null)
  const [noteInput, setNoteInput] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/withdrawals')
        if (!res.ok) { setError('Impossible de charger les demandes'); setLoading(false); return }
        const json = await res.json()
        setWithdrawals(json.withdrawals || [])
      } catch {
        setError('Erreur de connexion')
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleAction(id: string, action: 'processing' | 'complete' | 'reject') {
    setProcessing(id)
    setError(null)
    try {
      const res = await fetch('/api/admin/withdrawals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ withdrawalId: id, action, admin_note: noteInput[id] || null }),
      })
      if (res.ok) {
        const json = await res.json()
        setWithdrawals(prev => prev.map(w =>
          w.id === id ? {
            ...w,
            status: json.status,
            processed_at: action !== 'processing' ? new Date().toISOString() : w.processed_at,
            admin_note: noteInput[id] || w.admin_note,
          } : w
        ))
      } else {
        const json = await res.json()
        setError(json.error || 'Erreur')
      }
    } catch {
      setError('Erreur de connexion')
    }
    setProcessing(null)
  }

  const stats = useMemo(() => {
    const pending = withdrawals.filter(w => w.status === 'pending')
    const processingW = withdrawals.filter(w => w.status === 'processing')
    const completed = withdrawals.filter(w => w.status === 'completed')
    return {
      total: withdrawals.length,
      pending: pending.length,
      pendingAmount: pending.reduce((s, w) => s + w.amount, 0),
      processing: processingW.length,
      processingAmount: processingW.reduce((s, w) => s + w.amount, 0),
      completed: completed.length,
      completedAmount: completed.reduce((s, w) => s + w.amount, 0),
    }
  }, [withdrawals])

  const filtered = useMemo(() => {
    let list = withdrawals
    if (filterStatus !== 'all') list = list.filter(w => w.status === filterStatus)
    if (search.trim()) {
      const q = search.toLowerCase().trim()
      list = list.filter(w =>
        w.profiles?.prenom?.toLowerCase().includes(q) ||
        w.profiles?.email?.toLowerCase().includes(q)
      )
    }
    return list
  }, [withdrawals, search, filterStatus])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Demandes de retrait
        </h1>
        <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
          {loading ? 'Chargement...' : `${withdrawals.length} demande${withdrawals.length !== 1 ? 's' : ''} de retrait.`}
        </p>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'En attente', value: stats.pending, sub: `${stats.pendingAmount.toFixed(2)}\u20AC`, color: '#C9A961' },
            { label: 'En cours', value: stats.processing, sub: `${stats.processingAmount.toFixed(2)}\u20AC`, color: '#74C0FC' },
            { label: 'Effectues', value: stats.completed, sub: `${stats.completedAmount.toFixed(2)}\u20AC`, color: '#55EFC4' },
            { label: 'Total', value: stats.total, sub: '', color: 'var(--text-primary)' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4 text-center" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
              <p className="font-display text-2xl font-light" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              {s.sub && <p className="text-xs mt-0.5 font-medium" style={{ color: s.color }}>{s.sub}</p>}
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
          <input type="text" placeholder="Rechercher par nom ou email..."
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
          <option value="processing">En cours</option>
          <option value="completed">Effectues</option>
          <option value="rejected">Refuses</option>
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
            {search.trim() ? 'Aucune demande ne correspond.' : 'Aucune demande de retrait pour le moment.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(w => {
            const st = statusStyles[w.status] || statusStyles.pending
            return (
              <div key={w.id} className="rounded-xl p-5"
                style={{
                  background: 'var(--dark-card)',
                  border: `1px solid ${w.status === 'pending' ? 'rgba(201,169,97,0.2)' : w.status === 'processing' ? 'rgba(116,192,252,0.2)' : 'var(--dark-border)'}`,
                }}>
                {/* Top row */}
                <div className="flex items-start gap-3 mb-4">
                  {w.profiles?.avatar_url ? (
                    <img src={w.profiles.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
                      style={{ background: 'rgba(201,169,97,0.12)', color: '#C9A961' }}>
                      {w.profiles?.prenom?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                        {w.profiles?.prenom || 'Inconnu'}
                      </span>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium"
                        style={{ background: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{w.profiles?.email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display text-2xl font-semibold" style={{ color: '#C9A961' }}>
                      {w.amount.toFixed(2)}&#8364;
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {formatDateFR(w.created_at)}
                    </p>
                  </div>
                </div>

                {/* Payment info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>Methode</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {methodLabels[w.payment_method] || w.payment_method}
                    </p>
                  </div>
                  {w.payment_method === 'bank_transfer' && w.iban && (
                    <div className="rounded-lg p-3 sm:col-span-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>IBAN</p>
                      <p className="text-sm font-mono select-all" style={{ color: 'var(--text-primary)' }}>
                        {w.iban}
                      </p>
                    </div>
                  )}
                  {w.payment_method === 'paypal' && w.paypal_email && (
                    <div className="rounded-lg p-3 sm:col-span-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>Email PayPal</p>
                      <p className="text-sm select-all" style={{ color: 'var(--text-primary)' }}>
                        {w.paypal_email}
                      </p>
                    </div>
                  )}
                </div>

                {/* Admin note */}
                {w.admin_note && (
                  <div className="rounded-lg p-3 mb-4" style={{ background: 'rgba(116,192,252,0.05)', border: '1px solid rgba(116,192,252,0.1)' }}>
                    <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: '#74C0FC' }}>Note admin</p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{w.admin_note}</p>
                  </div>
                )}

                {/* Processed info */}
                {w.processed_at && (
                  <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                    Traite le {formatDateFR(w.processed_at)}
                  </p>
                )}

                {/* Actions for pending/processing */}
                {(w.status === 'pending' || w.status === 'processing') && (
                  <div className="space-y-3 pt-2" style={{ borderTop: '1px solid var(--dark-border)' }}>
                    <div className="pt-3">
                      <input
                        type="text"
                        placeholder="Note interne (optionnel)"
                        value={noteInput[w.id] || ''}
                        onChange={e => setNoteInput(prev => ({ ...prev, [w.id]: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                        style={{ background: 'var(--dark)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      {w.status === 'pending' && (
                        <button
                          onClick={() => handleAction(w.id, 'processing')}
                          disabled={processing === w.id}
                          className="px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all disabled:opacity-50"
                          style={{ background: 'rgba(116,192,252,0.15)', color: '#74C0FC', border: '1px solid rgba(116,192,252,0.25)' }}>
                          {processing === w.id ? 'Traitement...' : 'Marquer en cours'}
                        </button>
                      )}
                      <button
                        onClick={() => handleAction(w.id, 'complete')}
                        disabled={processing === w.id}
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all disabled:opacity-50"
                        style={{ background: 'rgba(85,239,196,0.15)', color: '#55EFC4', border: '1px solid rgba(85,239,196,0.25)' }}>
                        {processing === w.id ? 'Traitement...' : 'Virement effectue'}
                      </button>
                      <button
                        onClick={() => handleAction(w.id, 'reject')}
                        disabled={processing === w.id}
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all disabled:opacity-50"
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)' }}>
                        Refuser
                      </button>
                    </div>
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
