'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import FileUpload from '@/components/FileUpload'

interface ShineTrack {
  id: string
  title: string
  description: string | null
  cover_url: string | null
  audio_url: string | null
  narrator: string | null
  category: string
  content_type: string
  duration_seconds: number
  year: number
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
  { id: 'meditation', label: 'Méditation', icon: '🧘' },
  { id: 'healing', label: 'Guérison', icon: '🌿' },
  { id: 'confidence', label: 'Confiance', icon: '💪' },
  { id: 'sleep', label: 'Sommeil', icon: '🌙' },
  { id: 'energy', label: 'Énergie', icon: '⚡' },
  { id: 'gratitude', label: 'Gratitude', icon: '✨' },
  { id: 'relationships', label: 'Relations', icon: '💛' },
  { id: 'resilience', label: 'Résilience', icon: '🔥' },
  { id: 'children', label: 'Enfants', icon: '👶' },
]

const CONTENT_TYPES = [
  { id: 'podcast', label: 'Podcast', icon: '🎙️' },
  { id: 'audiobook', label: 'Livre audio', icon: '📖' },
  { id: 'meditation', label: 'Méditation guidée', icon: '🧘' },
  { id: 'hypnosis', label: 'Hypnose', icon: '🌀' },
  { id: 'ambient', label: 'Ambiance sonore', icon: '🎵' },
]

const emptyForm = {
  title: '',
  description: '',
  cover_url: '',
  audio_url: '',
  narrator: '',
  category: 'meditation',
  content_type: 'podcast',
  duration_seconds: 0,
  year: new Date().getFullYear(),
  douleur_id: '',
}

export default function AdminShineAudiblePage() {
  const [tracks, setTracks] = useState<ShineTrack[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string>('all')
  const [douleurs, setDouleurs] = useState<DouleurOption[]>([])

  const supabase = createClient()

  async function loadTracks() {
    setLoading(true)
    const { data, error } = await supabase
      .from('shine_audible_tracks')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setTracks((data as ShineTrack[]) ?? [])
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
    loadTracks()
    loadDouleurs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: name === 'duration_seconds' || name === 'year' ? Number(value) : value }))
  }

  function openEdit(t: ShineTrack) {
    setEditingId(t.id)
    setForm({
      title: t.title,
      description: t.description || '',
      cover_url: t.cover_url || '',
      audio_url: t.audio_url || '',
      narrator: t.narrator || '',
      category: t.category,
      content_type: t.content_type,
      duration_seconds: t.duration_seconds || 0,
      year: t.year || new Date().getFullYear(),
      douleur_id: t.douleur_id || '',
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
      cover_url: form.cover_url.trim() || null,
      audio_url: form.audio_url.trim() || null,
      narrator: form.narrator.trim() || null,
      category: form.category,
      content_type: form.content_type as 'podcast' | 'audiobook' | 'meditation' | 'hypnosis' | 'ambient',
      duration_seconds: form.duration_seconds,
      year: form.year,
      douleur_id: form.douleur_id || null,
    }

    if (editingId) {
      const { error } = await supabase.from('shine_audible_tracks').update(payload).eq('id', editingId)
      if (error) { setError(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('shine_audible_tracks').insert({ ...payload, is_published: false })
      if (error) { setError(error.message); setSaving(false); return }
    }

    cancelForm()
    await loadTracks()
    setSaving(false)
  }

  async function togglePublish(t: ShineTrack) {
    const willPublish = !t.is_published
    const { error } = await supabase
      .from('shine_audible_tracks')
      .update({ is_published: willPublish })
      .eq('id', t.id)

    if (error) { setError(error.message); return }
    setTracks((prev) => prev.map((item) => item.id === t.id ? { ...item, is_published: willPublish } : item))

    if (willPublish) {
      try {
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'new_audio',
            title: '🎧 Nouveau contenu audio sur Shine Audible',
            body: t.title,
            link: '/dashboard/shine-audible',
          }),
        })
      } catch { /* notification best-effort */ }
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cet audio ? Cette action est irréversible.')) return
    const { error } = await supabase.from('shine_audible_tracks').delete().eq('id', id)
    if (error) setError(error.message)
    else setTracks((prev) => prev.filter((t) => t.id !== id))
  }

  function formatDuration(seconds: number): string {
    if (seconds <= 0) return '-'
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  const filteredTracks = filterType === 'all' ? tracks : tracks.filter((t) => t.content_type === filterType)
  const getTypeLabel = (type: string) => CONTENT_TYPES.find((c) => c.id === type)?.label || type
  const getTypeIcon = (type: string) => CONTENT_TYPES.find((c) => c.id === type)?.icon || '🎵'
  const getCategoryLabel = (cat: string) => CATEGORIES.find((c) => c.id === cat)?.label || cat

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: '8px',
    border: '1px solid var(--border)', background: 'var(--dark)',
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
            Shine Audible
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Publiez et gérez les contenus audio : podcasts, livres audio, méditations, hypnoses.
          </p>
        </div>
        {!showForm && (
          <button onClick={() => { setEditingId(null); setForm(emptyForm); setShowForm(true); setError(null) }}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 self-start sm:self-auto"
            style={{ background: '#9B59B6', color: '#fff' }}>
            Ajouter un audio
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
        <form onSubmit={handleSave} className="rounded-xl p-6 space-y-5" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
          <h2 className="font-semibold text-lg" style={{ color: '#9B59B6' }}>
            {editingId ? 'Modifier le contenu audio' : 'Nouveau contenu audio'}
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="title" style={labelStyle}>Titre *</label>
              <input id="title" name="title" type="text" required value={form.title} onChange={handleChange} placeholder="Ex : Méditation du soir" style={inputStyle} />
            </div>
            <div>
              <label htmlFor="narrator" style={labelStyle}>Narrateur / Auteur</label>
              <input id="narrator" name="narrator" type="text" value={form.narrator} onChange={handleChange} placeholder="Ex : Julia" style={inputStyle} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="content_type" style={labelStyle}>Type de contenu *</label>
              <select id="content_type" name="content_type" value={form.content_type} onChange={handleChange} style={inputStyle}>
                {CONTENT_TYPES.map((c) => (
                  <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                ))}
              </select>
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
            <textarea id="description" name="description" rows={3} value={form.description} onChange={handleChange} placeholder="Décrivez le contenu audio..." style={{ ...inputStyle, resize: 'vertical' as const }} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="duration_seconds" style={labelStyle}>Durée (secondes)</label>
              <input id="duration_seconds" name="duration_seconds" type="number" min={0} value={form.duration_seconds} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label htmlFor="year" style={labelStyle}>Année</label>
              <input id="year" name="year" type="number" min={2020} value={form.year} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          <div>
            <label htmlFor="douleur_id" style={labelStyle}>Lier à une douleur (Encyclopédie)</label>
            <select id="douleur_id" name="douleur_id" value={form.douleur_id} onChange={handleChange} style={inputStyle}>
              <option value="">- Aucune -</option>
              {douleurs.map((d) => (
                <option key={d.id} value={d.id}>{d.title}</option>
              ))}
            </select>
          </div>

          <FileUpload
            label="Couverture (pochette)"
            accept="image/*"
            folder="shine-audible"
            currentUrl={form.cover_url || null}
            hint="Image carrée recommandée (JPG, PNG, WebP)"
            onUploaded={(url) => setForm((prev) => ({ ...prev, cover_url: url }))}
            onRemoved={() => setForm((prev) => ({ ...prev, cover_url: '' }))}
          />

          <FileUpload
            label="Fichier audio"
            accept="audio/*"
            folder="shine-audible"
            currentUrl={form.audio_url || null}
            hint="MP3, WAV ou M4A recommandé, aucune limite de taille"
            maxSize={0}
            onUploaded={(url) => setForm((prev) => ({ ...prev, audio_url: url }))}
            onRemoved={() => setForm((prev) => ({ ...prev, audio_url: '' }))}
          />

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={saving || !form.title.trim()}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-40"
              style={{ background: '#9B59B6', color: '#fff' }}>
              {saving ? 'Enregistrement...' : editingId ? 'Mettre à jour' : 'Enregistrer'}
            </button>
            <button type="button" onClick={cancelForm}
              className="px-5 py-2.5 rounded-lg text-sm transition-colors"
              style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Filter bar */}
      {!showForm && (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilterType('all')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: filterType === 'all' ? 'rgba(155,89,182,0.15)' : 'transparent',
              color: filterType === 'all' ? '#9B59B6' : 'var(--text-muted)',
              border: `1px solid ${filterType === 'all' ? 'rgba(155,89,182,0.3)' : 'var(--border)'}`,
            }}>
            Tout ({tracks.length})
          </button>
          {CONTENT_TYPES.map((c) => {
            const count = tracks.filter((t) => t.content_type === c.id).length
            if (count === 0) return null
            return (
              <button key={c.id} onClick={() => setFilterType(c.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: filterType === c.id ? 'rgba(155,89,182,0.15)' : 'transparent',
                  color: filterType === c.id ? '#9B59B6' : 'var(--text-muted)',
                  border: `1px solid ${filterType === c.id ? 'rgba(155,89,182,0.3)' : 'var(--border)'}`,
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
          <div className="w-8 h-8 border-2 border-[#9B59B6] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredTracks.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
          <p className="text-4xl mb-3">🎧</p>
          <p style={{ color: 'var(--text-muted)' }}>Aucun contenu audio pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTracks.map((t) => (
            <div key={t.id} className="rounded-xl overflow-hidden transition-all duration-200"
              style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-4 p-4">
                {/* Cover */}
                <div className="w-16 h-16 rounded-lg flex-shrink-0 overflow-hidden" style={{ background: 'rgba(155,89,182,0.08)' }}>
                  {t.cover_url ? (
                    <img src={t.cover_url} alt={t.title} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl opacity-30">🎧</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{t.title}</h3>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
                      style={{
                        background: t.is_published ? 'rgba(85,239,196,0.1)' : 'rgba(255,107,53,0.1)',
                        color: t.is_published ? '#55EFC4' : '#FF6B35',
                      }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: t.is_published ? '#55EFC4' : '#FF6B35' }} />
                      {t.is_published ? 'Publié' : 'Brouillon'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    <span className="px-2 py-0.5 rounded-full" style={{ background: 'rgba(155,89,182,0.1)', color: '#9B59B6' }}>
                      {getTypeIcon(t.content_type)} {getTypeLabel(t.content_type)}
                    </span>
                    <span>{getCategoryLabel(t.category)}</span>
                    {t.narrator && <span>par {t.narrator}</span>}
                    <span>{formatDuration(t.duration_seconds)}</span>
                    <span>{t.year}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => openEdit(t)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                    style={{ background: 'rgba(116,192,252,0.1)', color: '#74C0FC', border: '1px solid rgba(116,192,252,0.2)' }}>
                    Modifier
                  </button>
                  <button onClick={() => togglePublish(t)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                    style={{
                      background: t.is_published ? 'rgba(255,107,53,0.1)' : 'rgba(85,239,196,0.1)',
                      color: t.is_published ? '#FF6B35' : '#55EFC4',
                      border: `1px solid ${t.is_published ? 'rgba(255,107,53,0.2)' : 'rgba(85,239,196,0.2)'}`,
                    }}>
                    {t.is_published ? 'Dépublier' : 'Publier'}
                  </button>
                  <button onClick={() => handleDelete(t.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
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
