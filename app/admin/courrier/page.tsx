'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CourrierAnonyme, CourrierAnonymeStatus, CourrierAnonymeCategory } from '@/types/database'

const STATUS_CONFIG: Record<CourrierAnonymeStatus, { label: string; color: string; bg: string }> = {
  new: { label: 'Nouveau', color: '#55EFC4', bg: 'rgba(85,239,196,0.1)' },
  read: { label: 'Lu', color: '#74C0FC', bg: 'rgba(116,192,252,0.1)' },
  planned: { label: 'Planifié', color: '#C9A961', bg: 'rgba(201,169,97,0.1)' },
  answered: { label: 'Répondu', color: '#A29BFE', bg: 'rgba(162,155,254,0.1)' },
  archived: { label: 'Archivé', color: 'var(--text-muted)', bg: 'rgba(255,255,255,0.03)' },
}

const CATEGORY_CONFIG: Record<CourrierAnonymeCategory, { label: string; icon: string }> = {
  question: { label: 'Question', icon: '❓' },
  recommandation: { label: 'Recommandation', icon: '💡' },
  temoignage: { label: 'Témoignage', icon: '💎' },
  suggestion: { label: 'Suggestion', icon: '✨' },
  autre: { label: 'Autre', icon: '💬' },
}

const ANSWERED_VIA_OPTIONS = [
  { value: 'shine_tv', label: 'Shine TV', icon: '🎬' },
  { value: 'podcast', label: 'Podcast / Audible', icon: '🎧' },
  { value: 'article', label: 'Article / Librairie', icon: '📖' },
  { value: 'direct', label: 'Réponse directe', icon: '💬' },
]

export default function AdminCourrierPage() {
  const [courriers, setCourriers] = useState<CourrierAnonyme[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<CourrierAnonymeStatus | 'all'>('all')
  const [filterCategory, setFilterCategory] = useState<CourrierAnonymeCategory | 'all'>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [adminNote, setAdminNote] = useState('')
  const [answeredVia, setAnsweredVia] = useState('')
  const [answeredUrl, setAnsweredUrl] = useState('')
  const [saving, setSaving] = useState(false)

  const loadCourriers = useCallback(async () => {
    const supabase = createClient()
    let query = supabase.from('courrier_anonyme').select('*').order('is_pinned', { ascending: false }).order('created_at', { ascending: false })

    if (filterStatus !== 'all') query = query.eq('status', filterStatus)
    if (filterCategory !== 'all') query = query.eq('category', filterCategory)

    const { data } = await query
    setCourriers((data as CourrierAnonyme[]) || [])
    setLoading(false)
  }, [filterStatus, filterCategory])

  useEffect(() => { loadCourriers() }, [loadCourriers])

  const selected = courriers.find(c => c.id === selectedId)

  async function updateStatus(id: string, status: CourrierAnonymeStatus) {
    const supabase = createClient()
    await supabase.from('courrier_anonyme').update({ status }).eq('id', id)
    setCourriers(prev => prev.map(c => c.id === id ? { ...c, status } : c))
  }

  async function togglePin(id: string, pinned: boolean) {
    const supabase = createClient()
    await supabase.from('courrier_anonyme').update({ is_pinned: !pinned }).eq('id', id)
    setCourriers(prev => prev.map(c => c.id === id ? { ...c, is_pinned: !pinned } : c))
  }

  async function saveDetails() {
    if (!selectedId) return
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const update: Record<string, unknown> = { admin_note: adminNote || null }
    if (answeredVia) {
      update.answered_via = answeredVia
      update.answered_url = answeredUrl || null
      update.answered_at = new Date().toISOString()
      update.answered_by = user?.id || null
      update.status = 'answered'
    }

    await supabase.from('courrier_anonyme').update(update).eq('id', selectedId)
    await loadCourriers()
    setSaving(false)
  }

  // Marks selected as read when opened
  useEffect(() => {
    if (selected && selected.status === 'new') {
      updateStatus(selected.id, 'read')
    }
    if (selected) {
      setAdminNote(selected.admin_note || '')
      setAnsweredVia(selected.answered_via || '')
      setAnsweredUrl(selected.answered_url || '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])

  const stats = {
    total: courriers.length,
    new: courriers.filter(c => c.status === 'new').length,
    planned: courriers.filter(c => c.status === 'planned').length,
    answered: courriers.filter(c => c.status === 'answered').length,
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#74C0FC] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-semibold" style={{ color: '#74C0FC' }}>
            ✉️ Courrier des Membres
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Demandes, recommandations et témoignages anonymes
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'var(--text-primary)' },
          { label: 'Nouveaux', value: stats.new, color: '#55EFC4' },
          { label: 'Planifiés', value: stats.planned, color: '#C9A961' },
          { label: 'Répondus', value: stats.answered, color: '#A29BFE' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl p-4 text-center" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
            <p className="text-2xl font-display font-semibold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Statut :</span>
        {(['all', 'new', 'read', 'planned', 'answered', 'archived'] as const).map((s) => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className="px-3 py-1.5 rounded-lg text-xs transition-all"
            style={{
              background: filterStatus === s ? 'rgba(116,192,252,0.15)' : 'var(--surface-card)',
              color: filterStatus === s ? '#74C0FC' : 'var(--text-secondary)',
              border: '1px solid var(--border)',
            }}>
            {s === 'all' ? 'Tous' : STATUS_CONFIG[s].label}
          </button>
        ))}
        <span className="text-xs ml-3" style={{ color: 'var(--text-muted)' }}>Type :</span>
        {(['all', 'question', 'recommandation', 'temoignage', 'suggestion', 'autre'] as const).map((c) => (
          <button key={c} onClick={() => setFilterCategory(c)}
            className="px-3 py-1.5 rounded-lg text-xs transition-all"
            style={{
              background: filterCategory === c ? 'rgba(116,192,252,0.15)' : 'var(--surface-card)',
              color: filterCategory === c ? '#74C0FC' : 'var(--text-secondary)',
              border: '1px solid var(--border)',
            }}>
            {c === 'all' ? 'Tous' : CATEGORY_CONFIG[c].label}
          </button>
        ))}
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* List */}
        <div className="lg:col-span-2 space-y-2 max-h-[70vh] overflow-y-auto pr-1">
          {courriers.length === 0 ? (
            <div className="rounded-xl p-8 text-center" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
              <p className="text-3xl mb-3">📭</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Aucun courrier pour le moment</p>
            </div>
          ) : courriers.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className="w-full text-left rounded-xl p-4 transition-all"
              style={{
                background: selectedId === c.id ? 'rgba(116,192,252,0.08)' : 'var(--surface-card)',
                border: selectedId === c.id ? '1px solid rgba(116,192,252,0.2)' : '1px solid var(--border)',
              }}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg">{CATEGORY_CONFIG[c.category]?.icon || '💬'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {c.is_pinned && <span className="text-xs">📌</span>}
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: STATUS_CONFIG[c.status]?.bg, color: STATUS_CONFIG[c.status]?.color }}>
                      {STATUS_CONFIG[c.status]?.label}
                    </span>
                    {c.answered_via && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(162,155,254,0.1)', color: '#A29BFE' }}>
                        {ANSWERED_VIA_OPTIONS.find(o => o.value === c.answered_via)?.icon} {ANSWERED_VIA_OPTIONS.find(o => o.value === c.answered_via)?.label}
                      </span>
                    )}
                  </div>
                  {c.subject && (
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{c.subject}</p>
                  )}
                  <p className="text-xs line-clamp-2 mt-0.5" style={{ color: 'var(--text-secondary)' }}>{c.content}</p>
                  <p className="text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>{formatDate(c.created_at)}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-3">
          {selected ? (
            <div className="rounded-xl p-6" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{CATEGORY_CONFIG[selected.category]?.icon}</span>
                  <div>
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: STATUS_CONFIG[selected.status]?.bg, color: STATUS_CONFIG[selected.status]?.color }}>
                      {STATUS_CONFIG[selected.status]?.label}
                    </span>
                    <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
                      {CATEGORY_CONFIG[selected.category]?.label}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => togglePin(selected.id, selected.is_pinned)}
                    className="text-xs px-3 py-1.5 rounded-lg transition-all"
                    style={{ background: selected.is_pinned ? 'rgba(201,169,97,0.1)' : 'var(--dark)', border: '1px solid var(--border)', color: selected.is_pinned ? '#C9A961' : 'var(--text-muted)' }}>
                    📌 {selected.is_pinned ? 'Désépingler' : 'Épingler'}
                  </button>
                </div>
              </div>

              {/* Subject */}
              {selected.subject && (
                <h2 className="font-display text-lg font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                  {selected.subject}
                </h2>
              )}

              {/* Content */}
              <div className="rounded-xl p-4 mb-5"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                  {selected.content}
                </p>
              </div>

              <p className="text-[10px] mb-5" style={{ color: 'var(--text-muted)' }}>
                Reçu le {formatDate(selected.created_at)}
              </p>

              {/* Status change */}
              <div className="mb-5">
                <label className="text-xs font-medium uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>
                  Changer le statut
                </label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(STATUS_CONFIG) as CourrierAnonymeStatus[]).map((s) => (
                    <button key={s} onClick={() => updateStatus(selected.id, s)}
                      className="text-xs px-3 py-1.5 rounded-lg transition-all"
                      style={{
                        background: selected.status === s ? STATUS_CONFIG[s].bg : 'var(--dark)',
                        color: selected.status === s ? STATUS_CONFIG[s].color : 'var(--text-secondary)',
                        border: '1px solid var(--border)',
                      }}>
                      {STATUS_CONFIG[s].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Admin note */}
              <div className="mb-5">
                <label className="text-xs font-medium uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>
                  Note interne (visible uniquement par les admins)
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={3}
                  placeholder="Ajouter une note interne..."
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
                  style={{ background: 'var(--dark)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
              </div>

              {/* Answer tracking */}
              <div className="mb-5">
                <label className="text-xs font-medium uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>
                  Répondu via
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {ANSWERED_VIA_OPTIONS.map((opt) => (
                    <button key={opt.value} onClick={() => setAnsweredVia(answeredVia === opt.value ? '' : opt.value)}
                      className="text-xs px-3 py-1.5 rounded-lg transition-all"
                      style={{
                        background: answeredVia === opt.value ? 'rgba(162,155,254,0.1)' : 'var(--dark)',
                        color: answeredVia === opt.value ? '#A29BFE' : 'var(--text-secondary)',
                        border: '1px solid var(--border)',
                      }}>
                      {opt.icon} {opt.label}
                    </button>
                  ))}
                </div>
                {answeredVia && (
                  <input
                    type="text"
                    value={answeredUrl}
                    onChange={(e) => setAnsweredUrl(e.target.value)}
                    placeholder="Lien vers la réponse (vidéo, podcast, article...)"
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ background: 'var(--dark)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                )}
              </div>

              {/* Save */}
              <button onClick={saveDetails} disabled={saving}
                className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                style={{ background: 'rgba(116,192,252,0.15)', color: '#74C0FC', border: '1px solid rgba(116,192,252,0.2)' }}>
                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          ) : (
            <div className="rounded-xl p-12 text-center" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
              <p className="text-4xl mb-4">✉️</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Sélectionnez un courrier pour le consulter
              </p>
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                Vous pouvez répondre via Shine TV, le podcast ou un article
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
