'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import FileUpload from '@/components/FileUpload'

interface ShineShort {
  id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  video_url: string | null
  category: string
  duration_seconds: number
  douleur_id: string | null
  is_published: boolean
  created_at: string
}

interface DouleurOption {
  id: string
  title: string
  slug: string
}

const CATEGORIES = [
  { id: 'cours', label: 'Cours', icon: '🎓' },
  { id: 'astuce', label: 'Astuces rapides', icon: '💡' },
  { id: 'exercice', label: 'Exercices', icon: '🧘' },
  { id: 'motivation', label: 'Motivation', icon: '🔥' },
  { id: 'temoignage', label: 'Témoignages', icon: '🗣️' },
  { id: 'meditation', label: 'Mini-méditations', icon: '🌙' },
  { id: 'respiration', label: 'Respirations', icon: '🌬️' },
  { id: 'defi', label: 'Défis', icon: '⚡' },
]

const emptyForm = {
  title: '',
  description: '',
  thumbnail_url: '',
  video_url: '',
  category: 'cours',
  duration_seconds: 0,
  douleur_id: '',
}

export default function AdminShineShortsPage() {
  const [shorts, setShorts] = useState<ShineShort[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [douleurs, setDouleurs] = useState<DouleurOption[]>([])

  const supabase = createClient()

  async function loadShorts() {
    setLoading(true)
    const { data, error } = await supabase
      .from('shine_shorts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setShorts((data as ShineShort[]) ?? [])
    setLoading(false)
  }

  async function loadDouleurs() {
    const { data } = await supabase
      .from('douleurs')
      .select('id, title, slug')
      .eq('is_active', true)
      .order('title', { ascending: true })
    if (data) setDouleurs(data as DouleurOption[])
  }

  useEffect(() => {
    loadShorts()
    loadDouleurs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: name === 'duration_seconds' ? Number(value) : value }))
  }

  function openEdit(s: ShineShort) {
    setEditingId(s.id)
    setForm({
      title: s.title,
      description: s.description || '',
      thumbnail_url: s.thumbnail_url || '',
      video_url: s.video_url || '',
      category: s.category,
      duration_seconds: s.duration_seconds || 0,
      douleur_id: s.douleur_id || '',
    })
    setShowForm(true)
    setError(null)
  }

  function cancelForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
    setError(null)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      thumbnail_url: form.thumbnail_url.trim() || null,
      video_url: form.video_url.trim() || null,
      category: form.category,
      duration_seconds: form.duration_seconds,
      douleur_id: form.douleur_id || null,
    }

    if (editingId) {
      const { error } = await supabase.from('shine_shorts').update(payload).eq('id', editingId)
      if (error) { setError(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('shine_shorts').insert({ ...payload, is_published: false })
      if (error) { setError(error.message); setSaving(false); return }
    }

    cancelForm()
    await loadShorts()
    setSaving(false)
  }

  async function togglePublish(s: ShineShort) {
    const willPublish = !s.is_published
    const { error } = await supabase
      .from('shine_shorts')
      .update({ is_published: willPublish })
      .eq('id', s.id)

    if (error) { setError(error.message); return }
    setShorts((prev) => prev.map((item) => item.id === s.id ? { ...item, is_published: willPublish } : item))

    if (willPublish) {
      try {
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'new_post',
            title: 'Nouveau Shine Short',
            body: s.title,
            link: '/dashboard/shine-shorts',
          }),
        })
      } catch { /* notification best-effort */ }
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce short ? Cette action est irréversible.')) return
    const { error } = await supabase.from('shine_shorts').delete().eq('id', id)
    if (error) setError(error.message)
    else setShorts((prev) => prev.filter((s) => s.id !== id))
  }

  const filteredShorts = filterCategory === 'all' ? shorts : shorts.filter((s) => s.category === filterCategory)
  const getCategoryLabel = (cat: string) => CATEGORIES.find((c) => c.id === cat)?.label || cat
  const getCategoryIcon = (cat: string) => CATEGORIES.find((c) => c.id === cat)?.icon || '🎬'

  function formatDuration(secs: number) {
    if (secs >= 60) return `${Math.floor(secs / 60)}:${(secs % 60).toString().padStart(2, '0')}`
    return `0:${secs.toString().padStart(2, '0')}`
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: '8px',
    border: '1px solid var(--dark-border)', background: 'var(--dark)',
    color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)',
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Shine Shorts
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Publiez et gérez les vidéos courtes (cours, astuces, exercices).
          </p>
        </div>
        {!showForm && (
          <button onClick={() => { setEditingId(null); setForm(emptyForm); setShowForm(true); setError(null) }}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 self-start sm:self-auto"
            style={{ background: '#A29BFE', color: '#fff' }}>
            Ajouter un short
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-lg px-4 py-3 text-sm" style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.25)', color: '#FF6B6B' }}>
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSave} className="rounded-xl p-6 space-y-5" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
          <h2 className="font-semibold text-lg" style={{ color: '#A29BFE' }}>
            {editingId ? 'Modifier le short' : 'Nouveau short'}
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="title" style={labelStyle}>Titre *</label>
              <input id="title" name="title" type="text" required value={form.title} onChange={handleChange} placeholder="Ex : 3 clés pour lâcher prise" style={inputStyle} />
            </div>
            <div>
              <label htmlFor="category" style={labelStyle}>Catégorie *</label>
              <select id="category" name="category" value={form.category} onChange={handleChange} style={inputStyle}>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="description" style={labelStyle}>Description</label>
            <textarea id="description" name="description" rows={3} value={form.description} onChange={handleChange} placeholder="Décrivez le contenu de ce short..." style={{ ...inputStyle, resize: 'vertical' as const }} />
          </div>

          <div>
            <label htmlFor="duration_seconds" style={labelStyle}>Durée (secondes)</label>
            <input id="duration_seconds" name="duration_seconds" type="number" min={0} value={form.duration_seconds} onChange={handleChange} style={inputStyle} />
          </div>

          <div>
            <label htmlFor="douleur_id" style={labelStyle}>Lier à une douleur (Encyclopédie)</label>
            <select id="douleur_id" name="douleur_id" value={form.douleur_id} onChange={handleChange} style={inputStyle}>
              <option value="">— Aucune —</option>
              {douleurs.map((d) => (
                <option key={d.id} value={d.id}>{d.title}</option>
              ))}
            </select>
          </div>

          <FileUpload
            label="Miniature (thumbnail)"
            accept="image/*"
            folder="shine-shorts"
            currentUrl={form.thumbnail_url || null}
            hint="Image 9:16 ou 1:1 recommandée (JPG, PNG, WebP)"
            onUploaded={(url) => setForm((prev) => ({ ...prev, thumbnail_url: url }))}
            onRemoved={() => setForm((prev) => ({ ...prev, thumbnail_url: '' }))}
          />

          <FileUpload
            label="Fichier vidéo"
            accept="video/*"
            folder="shine-shorts"
            currentUrl={form.video_url || null}
            hint="MP4 recommandé, format vertical de préférence"
            maxSize={0}
            onUploaded={(url) => setForm((prev) => ({ ...prev, video_url: url }))}
            onRemoved={() => setForm((prev) => ({ ...prev, video_url: '' }))}
          />

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={saving || !form.title.trim()}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-40"
              style={{ background: '#A29BFE', color: '#fff' }}>
              {saving ? 'Enregistrement...' : editingId ? 'Mettre à jour' : 'Enregistrer'}
            </button>
            <button type="button" onClick={cancelForm}
              className="px-5 py-2.5 rounded-lg text-sm transition-colors"
              style={{ color: 'var(--text-muted)', border: '1px solid var(--dark-border)' }}>
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Filter bar */}
      {!showForm && (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilterCategory('all')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: filterCategory === 'all' ? 'rgba(162,155,254,0.15)' : 'transparent',
              color: filterCategory === 'all' ? '#A29BFE' : 'var(--text-muted)',
              border: `1px solid ${filterCategory === 'all' ? 'rgba(162,155,254,0.3)' : 'var(--dark-border)'}`,
            }}>
            Tout ({shorts.length})
          </button>
          {CATEGORIES.map((c) => {
            const count = shorts.filter((s) => s.category === c.id).length
            if (count === 0) return null
            return (
              <button key={c.id} onClick={() => setFilterCategory(c.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: filterCategory === c.id ? 'rgba(162,155,254,0.15)' : 'transparent',
                  color: filterCategory === c.id ? '#A29BFE' : 'var(--text-muted)',
                  border: `1px solid ${filterCategory === c.id ? 'rgba(162,155,254,0.3)' : 'var(--dark-border)'}`,
                }}>
                {c.icon} {c.label} ({count})
              </button>
            )
          })}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#A29BFE] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredShorts.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
          <p className="text-4xl mb-3">📱</p>
          <p style={{ color: 'var(--text-muted)' }}>Aucun short pour le moment.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredShorts.map((s) => (
            <div key={s.id} className="rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
              {/* Thumbnail */}
              <div className="relative aspect-[9/16] max-h-64" style={{ background: 'rgba(162,155,254,0.08)' }}>
                {s.thumbnail_url ? (
                  <img src={s.thumbnail_url} alt={s.title} className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">📱</div>
                )}
                {/* Duration badge */}
                {s.duration_seconds > 0 && (
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-medium"
                    style={{ background: 'rgba(0,0,0,0.75)', color: '#fff' }}>
                    {formatDuration(s.duration_seconds)}
                  </span>
                )}
                {/* Status badge */}
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-medium"
                  style={{
                    background: s.is_published ? 'rgba(85,239,196,0.9)' : 'rgba(255,107,53,0.9)',
                    color: '#fff',
                  }}>
                  {s.is_published ? 'Publié' : 'Brouillon'}
                </span>
              </div>

              {/* Info */}
              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{s.title}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(162,155,254,0.1)', color: '#A29BFE' }}>
                    {getCategoryIcon(s.category)} {getCategoryLabel(s.category)}
                  </span>
                </div>
                {s.description && (
                  <p className="text-xs line-clamp-2" style={{ color: 'var(--text-muted)' }}>{s.description}</p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <button onClick={() => openEdit(s)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                    style={{ background: 'rgba(116,192,252,0.1)', color: '#74C0FC', border: '1px solid rgba(116,192,252,0.2)' }}>
                    Modifier
                  </button>
                  <button onClick={() => togglePublish(s)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                    style={{
                      background: s.is_published ? 'rgba(255,107,53,0.1)' : 'rgba(85,239,196,0.1)',
                      color: s.is_published ? '#FF6B35' : '#55EFC4',
                      border: `1px solid ${s.is_published ? 'rgba(255,107,53,0.2)' : 'rgba(85,239,196,0.2)'}`,
                    }}>
                    {s.is_published ? 'Dépublier' : 'Publier'}
                  </button>
                  <button onClick={() => handleDelete(s.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80 ml-auto"
                    style={{ background: 'rgba(255,107,107,0.1)', color: '#FF6B6B', border: '1px solid rgba(255,107,107,0.2)' }}>
                    Suppr.
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
