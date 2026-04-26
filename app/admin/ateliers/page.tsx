'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { PremiumAtelier } from '@/types/database'

const MONTHS = ['Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre', 'Janvier', 'Février', 'Mars']

export default function AdminAteliersPage() {
  const [ateliers, setAteliers] = useState<PremiumAtelier[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(1)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<PremiumAtelier>>({})
  const [message, setMessage] = useState('')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const supabase = createClient()
    const { data } = await supabase
      .from('premium_ateliers')
      .select('*')
      .order('month_index')
      .order('week')
    if (data) setAteliers(data)
    setLoading(false)
  }

  function startEdit(atelier: PremiumAtelier) {
    setEditingId(atelier.id)
    setEditForm({
      title: atelier.title,
      description: atelier.description || '',
      month_theme: atelier.month_theme,
      month_icon: atelier.month_icon,
      arc_label: atelier.arc_label,
      arc_number: atelier.arc_number,
      video_url: atelier.video_url || '',
      live_url: atelier.live_url || '',
      replay_url: atelier.replay_url || '',
      is_live: atelier.is_live,
      is_active: atelier.is_active,
    })
  }

  async function saveEdit(id: string) {
    setSaving(id)
    const supabase = createClient()
    const { error } = await supabase
      .from('premium_ateliers')
      .update({
        title: editForm.title,
        description: editForm.description || null,
        month_theme: editForm.month_theme,
        month_icon: editForm.month_icon,
        arc_label: editForm.arc_label,
        arc_number: editForm.arc_number,
        video_url: editForm.video_url || null,
        live_url: editForm.live_url || null,
        replay_url: editForm.replay_url || null,
        is_live: editForm.is_live,
        is_active: editForm.is_active,
      })
      .eq('id', id)

    if (error) {
      setMessage('Erreur: ' + error.message)
    } else {
      setMessage('Atelier mis à jour !')
      setEditingId(null)
      load()
    }
    setSaving(null)
    setTimeout(() => setMessage(''), 3000)
  }

  const monthAteliers = ateliers.filter(a => a.month_index === selectedMonth)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--brand)' }}>
            Ateliers Premium
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Gérez les 48 ateliers du programme annuel
          </p>
        </div>
        {message && (
          <span
            className="px-4 py-2 rounded-full text-xs font-medium"
            style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--brand)' }}
          >
            {message}
          </span>
        )}
      </div>

      {/* Month Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {MONTHS.map((m, i) => {
          const monthIndex = i + 1
          const isActive = selectedMonth === monthIndex
          const monthCount = ateliers.filter(a => a.month_index === monthIndex).length
          return (
            <button
              key={monthIndex}
              onClick={() => { setSelectedMonth(monthIndex); setEditingId(null) }}
              className="px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer"
              style={{
                background: isActive ? 'var(--brand)' : 'var(--surface-card)',
                color: isActive ? '#050505' : 'var(--text-secondary)',
                border: '1px solid ' + (isActive ? 'var(--brand)' : 'var(--border)'),
              }}
            >
              {m} ({monthCount})
            </button>
          )
        })}
      </div>

      {/* Ateliers List */}
      <div className="space-y-4">
        {monthAteliers.map((atelier) => {
          const isEditing = editingId === atelier.id
          return (
            <div
              key={atelier.id}
              className="rounded-xl overflow-hidden"
              style={{
                background: 'var(--surface-card)',
                border: '1px solid ' + (isEditing ? 'var(--brand)' : 'var(--border)'),
              }}
            >
              {/* Header row */}
              <div className="flex items-center gap-4 px-5 py-4">
                <span
                  className="text-sm font-bold shrink-0"
                  style={{ color: 'var(--brand)' }}
                >
                  S{atelier.week}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {atelier.title}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {atelier.month_icon} {atelier.month_theme} &middot; Arc {atelier.arc_number} — {atelier.arc_label}
                    {atelier.is_live && ' · 🔴 Live'}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {atelier.video_url && (
                    <span className="w-2 h-2 rounded-full bg-green-500" title="Vidéo présente" />
                  )}
                  {atelier.live_url && (
                    <span className="w-2 h-2 rounded-full bg-red-500" title="Lien live" />
                  )}
                  {atelier.replay_url && (
                    <span className="w-2 h-2 rounded-full bg-blue-500" title="Replay" />
                  )}
                  <button
                    onClick={() => isEditing ? setEditingId(null) : startEdit(atelier)}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer transition-colors"
                    style={{
                      background: isEditing ? 'rgba(239,68,68,0.1)' : 'rgba(212,175,55,0.1)',
                      color: isEditing ? '#EF4444' : 'var(--brand)',
                    }}
                  >
                    {isEditing ? 'Annuler' : 'Modifier'}
                  </button>
                </div>
              </div>

              {/* Edit Form */}
              {isEditing && (
                <div className="px-5 pb-5 space-y-4" style={{ borderTop: '1px solid var(--border)' }}>
                  <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Titre</label>
                      <input
                        type="text"
                        value={editForm.title || ''}
                        onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg text-sm"
                        style={{ background: 'var(--dark)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Thème du mois</label>
                      <input
                        type="text"
                        value={editForm.month_theme || ''}
                        onChange={e => setEditForm({ ...editForm, month_theme: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg text-sm"
                        style={{ background: 'var(--dark)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Icône du mois</label>
                      <input
                        type="text"
                        value={editForm.month_icon || ''}
                        onChange={e => setEditForm({ ...editForm, month_icon: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg text-sm"
                        style={{ background: 'var(--dark)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Arc (label)</label>
                      <input
                        type="text"
                        value={editForm.arc_label || ''}
                        onChange={e => setEditForm({ ...editForm, arc_label: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg text-sm"
                        style={{ background: 'var(--dark)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Description</label>
                      <textarea
                        value={editForm.description || ''}
                        onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg text-sm"
                        style={{ background: 'var(--dark)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium mb-1" style={{ color: 'var(--text-muted)' }}>URL Vidéo</label>
                      <input
                        type="url"
                        value={editForm.video_url || ''}
                        onChange={e => setEditForm({ ...editForm, video_url: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3 py-2 rounded-lg text-sm"
                        style={{ background: 'var(--dark)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium mb-1" style={{ color: 'var(--text-muted)' }}>URL Live</label>
                      <input
                        type="url"
                        value={editForm.live_url || ''}
                        onChange={e => setEditForm({ ...editForm, live_url: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3 py-2 rounded-lg text-sm"
                        style={{ background: 'var(--dark)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium mb-1" style={{ color: 'var(--text-muted)' }}>URL Replay</label>
                      <input
                        type="url"
                        value={editForm.replay_url || ''}
                        onChange={e => setEditForm({ ...editForm, replay_url: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3 py-2 rounded-lg text-sm"
                        style={{ background: 'var(--dark)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                      />
                    </div>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editForm.is_live || false}
                          onChange={e => setEditForm({ ...editForm, is_live: e.target.checked })}
                          className="accent-[var(--brand)]"
                        />
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Live</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editForm.is_active !== false}
                          onChange={e => setEditForm({ ...editForm, is_active: e.target.checked })}
                          className="accent-[var(--brand)]"
                        />
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Actif</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => saveEdit(atelier.id)}
                      disabled={saving === atelier.id}
                      className="px-6 py-2.5 rounded-full text-xs font-semibold cursor-pointer transition-all hover:scale-[1.03]"
                      style={{
                        background: 'linear-gradient(135deg, var(--brand), var(--brand-deep))',
                        color: '#050505',
                        opacity: saving === atelier.id ? 0.6 : 1,
                      }}
                    >
                      {saving === atelier.id ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {monthAteliers.length === 0 && (
        <div className="text-center py-16">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Aucun atelier pour ce mois. Exécutez la migration pour initialiser les données.
          </p>
        </div>
      )}
    </div>
  )
}
