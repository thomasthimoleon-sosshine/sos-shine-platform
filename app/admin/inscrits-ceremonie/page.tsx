'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { isSpamEmail, isSpamName } from '@/lib/anti-spam'

type VisitRow = {
  created_at: string
  utm_source: string | null
  referrer: string | null
}

type DayStats = { date: string; count: number }
type SourceStats = { source: string; count: number }

function getReferrerSource(referrer: string | null, utmSource: string | null): string {
  if (utmSource) return utmSource
  if (!referrer) return 'Direct'
  try {
    const host = new URL(referrer).hostname.replace('www.', '')
    if (host.includes('instagram')) return 'instagram'
    if (host.includes('facebook')) return 'facebook'
    if (host.includes('google')) return 'google'
    if (host.includes('tiktok')) return 'tiktok'
    if (host.includes('whatsapp')) return 'whatsapp'
    if (host.includes('sosshine') || host.includes('localhost') || host.includes('vercel')) return 'interne'
    return host
  } catch {
    return 'Direct'
  }
}

const SOURCE_ICON: Record<string, string> = {
  instagram: '📸',
  facebook: '📘',
  google: '🔍',
  tiktok: '🎵',
  whatsapp: '💬',
  Direct: '🔗',
  interne: '🏠',
}

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
  paid:       { label: 'Payé',       color: '#55EFC4', bg: 'rgba(85,239,196,0.12)' },
  pending:    { label: 'En attente', color: '#C9A961', bg: 'rgba(201,169,97,0.12)' },
  cancelled:  { label: 'Annulé',    color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  refunded:   { label: 'Remboursé', color: '#74C0FC', bg: 'rgba(116,192,252,0.12)' },
}

function isBot(r: Reservation): boolean {
  return isSpamName(r.prenom) || isSpamName(r.nom) || isSpamEmail(r.email)
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

async function deleteReservations(ids: string[]): Promise<boolean> {
  const res = await fetch('/api/ceremonie/reservations', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  })
  return res.ok
}

export default function InscritsCeremonieAdmin() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [cleaning, setCleaning] = useState(false)
  const [confirmClean, setConfirmClean] = useState(false)

  // Analytics state
  const [visits, setVisits] = useState<VisitRow[]>([])
  const [analyticsLoading, setAnalyticsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data, error } = await supabase
        .from('ceremonie_reservations')
        .select('id, prenom, nom, email, status, created_at, paid_at, ceremonie_date')
        .order('created_at', { ascending: false })
      if (!error && data) setReservations(data as Reservation[])
      setLoading(false)
    }

    async function loadAnalytics() {
      const since = new Date()
      since.setDate(since.getDate() - 30)
      const { data } = await supabase
        .from('site_visits')
        .select('created_at, utm_source, referrer')
        .like('page_path', '/event%')
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: false })
      setVisits((data || []) as unknown as VisitRow[])
      setAnalyticsLoading(false)
    }

    load()
    loadAnalytics()
  }, [])

  const filtered = reservations.filter(r => {
    const matchStatus = filter === 'all' || r.status === filter
    const q = search.toLowerCase()
    const matchSearch = !q || r.prenom.toLowerCase().includes(q) || r.nom.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  const botEntries = reservations.filter(isBot)

  const stats = {
    total: reservations.length,
    paid: reservations.filter(r => r.status === 'paid').length,
    pending: reservations.filter(r => r.status === 'pending').length,
    bots: botEntries.length,
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    const ok = await deleteReservations([id])
    if (ok) setReservations(prev => prev.filter(r => r.id !== id))
    setDeleting(null)
  }

  const handleCleanBots = async () => {
    if (!confirmClean) { setConfirmClean(true); return }
    setCleaning(true)
    setConfirmClean(false)
    const ids = botEntries.map(r => r.id)
    const ok = await deleteReservations(ids)
    if (ok) setReservations(prev => prev.filter(r => !ids.includes(r.id)))
    setCleaning(false)
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

  // Analytics computed values
  const today = new Date().toISOString().slice(0, 10)
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString()
  const visitsToday = visits.filter(v => v.created_at.slice(0, 10) === today).length
  const visitsWeek = visits.filter(v => v.created_at >= weekAgo).length
  const visitsTotal = visits.length

  // Daily for last 14 days
  const dailyMap: Record<string, number> = {}
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)
    dailyMap[d] = 0
  }
  visits.forEach(v => {
    const d = v.created_at.slice(0, 10)
    if (d in dailyMap) dailyMap[d]++
  })
  const dailyStats: DayStats[] = Object.entries(dailyMap).map(([date, count]) => ({ date, count }))
  const maxDay = Math.max(...dailyStats.map(d => d.count), 1)

  // Sources
  const sourceMap: Record<string, number> = {}
  visits.forEach(v => {
    const s = getReferrerSource(v.referrer, v.utm_source)
    sourceMap[s] = (sourceMap[s] || 0) + 1
  })
  const sources: SourceStats[] = Object.entries(sourceMap)
    .sort((a, b) => b[1] - a[1])
    .map(([source, count]) => ({ source, count }))

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

      {/* Analytics block */}
      <div className="rounded-2xl p-6 mb-8" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-base font-medium text-[var(--text-primary)]">
            📊 Visites — page /event (30 derniers jours)
          </h2>
          {analyticsLoading && (
            <div className="w-4 h-4 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Aujourd'hui", value: visitsToday, color: '#C9A961' },
            { label: 'Cette semaine', value: visitsWeek, color: '#74C0FC' },
            { label: 'Total (30j)', value: visitsTotal, color: 'var(--text-primary)' },
          ].map(k => (
            <div key={k.label} className="rounded-xl p-4 text-center"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
              <div className="font-display text-2xl font-light mb-1" style={{ color: k.color }}>{k.value}</div>
              <div className="text-xs text-[var(--text-muted)]">{k.label}</div>
            </div>
          ))}
        </div>

        {/* Daily bar chart */}
        <div className="mb-6">
          <p className="text-xs text-[var(--text-muted)] mb-3 uppercase tracking-widest">14 derniers jours</p>
          <div className="flex items-end gap-1" style={{ height: '64px' }}>
            {dailyStats.map(d => {
              const heightPct = maxDay > 0 ? (d.count / maxDay) * 100 : 0
              const isToday = d.date === today
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div
                    className="w-full rounded-t-sm transition-all"
                    style={{
                      height: `${Math.max(heightPct, d.count > 0 ? 8 : 2)}%`,
                      background: isToday
                        ? 'linear-gradient(to top, #C9A961, #E8C97A)'
                        : 'rgba(201,169,97,0.35)',
                      minHeight: '2px',
                    }}
                  />
                  {d.count > 0 && (
                    <span className="absolute -top-5 text-xs text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {d.count}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-[var(--text-muted)] opacity-40">{dailyStats[0]?.date.slice(5)}</span>
            <span className="text-xs text-[var(--text-muted)] opacity-40">{dailyStats[13]?.date.slice(5)}</span>
          </div>
        </div>

        {/* Sources */}
        {sources.length > 0 && (
          <div>
            <p className="text-xs text-[var(--text-muted)] mb-3 uppercase tracking-widest">Sources de trafic</p>
            <div className="space-y-2">
              {sources.map(s => (
                <div key={s.source} className="flex items-center gap-3">
                  <span className="text-base w-6 flex-shrink-0">{SOURCE_ICON[s.source] || '🌐'}</span>
                  <span className="text-sm text-[var(--text-secondary)] capitalize flex-shrink-0 w-28 truncate">{s.source}</span>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(s.count / visitsTotal) * 100}%`,
                        background: 'linear-gradient(to right, #C9A961, #E8C97A)',
                      }}
                    />
                  </div>
                  <span className="text-sm text-[var(--text-muted)] flex-shrink-0 w-8 text-right">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!analyticsLoading && visits.length === 0 && (
          <p className="text-sm text-[var(--text-muted)] text-center py-4">
            Aucune visite encore enregistrée sur /event
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total inscrits', value: stats.total, color: 'var(--text-primary)' },
          { label: 'Places payées', value: stats.paid, color: '#55EFC4' },
          { label: 'En attente', value: stats.pending, color: '#C9A961' },
          { label: 'Places restantes', value: Math.max(0, 20 - stats.paid), color: '#74C0FC' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4 text-center"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
            <div className="text-2xl font-bold mb-1" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-[var(--text-muted)]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Bot cleanup banner */}
      {stats.bots > 0 && (
        <div className="rounded-xl p-4 mb-6 flex items-center justify-between gap-4"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <div>
            <p className="text-sm font-medium" style={{ color: '#ef4444' }}>
              🤖 {stats.bots} entrée{stats.bots > 1 ? 's' : ''} suspecte{stats.bots > 1 ? 's' : ''} détectée{stats.bots > 1 ? 's' : ''}
            </p>
            <p className="text-xs mt-0.5 text-[var(--text-muted)]">
              Noms et emails au format bot — aucune d&apos;entre elles n&apos;est payée
            </p>
          </div>
          <button
            onClick={handleCleanBots}
            disabled={cleaning}
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all flex-shrink-0"
            style={{
              background: confirmClean ? '#ef4444' : 'rgba(239,68,68,0.15)',
              color: confirmClean ? '#fff' : '#ef4444',
              border: '1px solid rgba(239,68,68,0.3)',
            }}>
            {cleaning ? 'Suppression...' : confirmClean ? '⚠️ Confirmer la suppression' : `🗑 Supprimer les ${stats.bots} bots`}
          </button>
        </div>
      )}

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
          className="flex-1 min-w-[180px] px-4 py-2 rounded-xl text-sm outline-none"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
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

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[var(--text-muted)]">
          {reservations.length === 0 ? 'Aucune inscription pour le moment.' : 'Aucun résultat.'}
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--surface-card)', borderBottom: '1px solid var(--border)' }}>
                  {['Prénom', 'Nom', 'Email', 'Statut', 'Inscrit le', 'Payé le', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium tracking-wide uppercase text-[var(--text-muted)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => {
                  const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending
                  const bot = isBot(r)
                  return (
                    <tr key={r.id}
                      style={{
                        background: bot ? 'rgba(239,68,68,0.04)' : i % 2 === 0 ? 'var(--surface)' : 'var(--surface-card)',
                        borderBottom: '1px solid var(--border)',
                      }}>
                      <td className="px-4 py-3 font-medium text-[var(--text-primary)]">
                        {bot && <span className="text-xs mr-1" title="Bot détecté">🤖</span>}
                        {r.prenom}
                      </td>
                      <td className="px-4 py-3 text-[var(--text-secondary)] max-w-[160px] truncate">{r.nom}</td>
                      <td className="px-4 py-3">
                        <a href={`mailto:${r.email}`} className="hover:underline" style={{ color: bot ? '#ef4444' : 'var(--brand)' }}>{r.email}</a>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: cfg.bg, color: cfg.color }}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{formatDate(r.created_at)}</td>
                      <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{formatDate(r.paid_at)}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(r.id)}
                          disabled={deleting === r.id}
                          title="Supprimer"
                          className="w-7 h-7 flex items-center justify-center rounded-lg transition-all hover:bg-red-500/20"
                          style={{ color: '#ef4444' }}>
                          {deleting === r.id
                            ? <span className="w-3.5 h-3.5 border border-red-400 border-t-transparent rounded-full animate-spin inline-block" />
                            : '🗑'}
                        </button>
                      </td>
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
              const bot = isBot(r)
              return (
                <div key={r.id} className="p-4 flex items-start gap-3"
                  style={{ background: bot ? 'rgba(239,68,68,0.05)' : 'var(--surface-card)' }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {bot && <span className="text-xs">🤖</span>}
                      <p className="font-medium text-[var(--text-primary)] truncate">{r.prenom} {r.nom}</p>
                    </div>
                    <a href={`mailto:${r.email}`} className="text-xs block truncate mb-1" style={{ color: bot ? '#ef4444' : 'var(--brand)' }}>{r.email}</a>
                    <p className="text-xs text-[var(--text-muted)]">Inscrit le {formatDate(r.created_at)}</p>
                    {r.paid_at && <p className="text-xs text-[var(--text-muted)]">Payé le {formatDate(r.paid_at)}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: cfg.bg, color: cfg.color }}>
                      {cfg.label}
                    </span>
                    <button
                      onClick={() => handleDelete(r.id)}
                      disabled={deleting === r.id}
                      className="text-xs px-2 py-1 rounded-lg transition-all"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                      {deleting === r.id ? '...' : 'Supprimer'}
                    </button>
                  </div>
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
