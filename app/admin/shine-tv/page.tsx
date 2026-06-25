'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import FileUpload from '@/components/FileUpload'

interface ShineVideo {
  id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  thumbnail_desktop_url?: string | null
  video_url: string | null
  subtitle_url?: string | null
  category: string
  duration_minutes: number
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
  { id: 'healing', label: 'Guérison intérieure', icon: '🌿' },
  { id: 'meditation', label: 'Méditations guidées', icon: '🧘' },
  { id: 'confidence', label: 'Confiance en soi', icon: '💪' },
  { id: 'relationships', label: 'Relations saines', icon: '💛' },
  { id: 'resilience', label: 'Résilience', icon: '🔥' },
  { id: 'gratitude', label: 'Gratitude & Joie', icon: '✨' },
  { id: 'sleep', label: 'Sommeil & Détente', icon: '🌙' },
  { id: 'masterclass', label: 'Masterclass', icon: '🎓' },
  { id: 'testimony', label: 'Témoignages', icon: '🗣️' },
  { id: 'children', label: 'Enfants', icon: '👶' },
]

const emptyForm = {
  title: '',
  description: '',
  thumbnail_url: '',
  thumbnail_desktop_url: '',
  video_url: '',
  subtitle_url: '',
  category: 'healing',
  duration_minutes: 0,
  year: new Date().getFullYear(),
  douleur_id: '',
}

export default function AdminShineTVPage() {
  const [videos, setVideos] = useState<ShineVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [douleurs, setDouleurs] = useState<DouleurOption[]>([])

  const supabase = createClient()

  async function loadVideos() {
    setLoading(true)
    const { data, error } = await supabase
      .from('shine_tv_videos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setVideos((data as ShineVideo[]) ?? [])
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
    loadVideos()
    loadDouleurs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: name === 'duration_minutes' || name === 'year' ? Number(value) : value }))
  }

  function openEdit(v: ShineVideo) {
    setEditingId(v.id)
    setForm({
      title: v.title,
      description: v.description || '',
      thumbnail_url: v.thumbnail_url || '',
      thumbnail_desktop_url: v.thumbnail_desktop_url || '',
      video_url: v.video_url || '',
      subtitle_url: v.subtitle_url || '',
      category: v.category,
      duration_minutes: v.duration_minutes || 0,
      year: v.year || new Date().getFullYear(),
      douleur_id: v.douleur_id || '',
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
      thumbnail_desktop_url: form.thumbnail_desktop_url.trim() || null,
      video_url: form.video_url.trim() || null,
      subtitle_url: form.subtitle_url.trim() || null,
      category: form.category,
      duration_minutes: form.duration_minutes,
      year: form.year,
      douleur_id: form.douleur_id || null,
    }

    if (editingId) {
      const { error } = await supabase.from('shine_tv_videos').update(payload).eq('id', editingId)
      if (error) { setError(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('shine_tv_videos').insert({ ...payload, is_published: false })
      if (error) { setError(error.message); setSaving(false); return }
    }

    cancelForm()
    await loadVideos()
    setSaving(false)
  }

  async function togglePublish(v: ShineVideo) {
    const willPublish = !v.is_published
    const { error } = await supabase
      .from('shine_tv_videos')
      .update({ is_published: willPublish })
      .eq('id', v.id)

    if (error) { setError(error.message); return }
    setVideos((prev) => prev.map((item) => item.id === v.id ? { ...item, is_published: willPublish } : item))

    if (willPublish) {
      try {
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'new_video',
            title: '🎬 Nouvelle vidéo sur Shine TV',
            body: v.title,
            link: '/dashboard/shine-tv',
          }),
        })
      } catch { /* notification best-effort */ }
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette vidéo ? Cette action est irréversible.')) return
    const { error } = await supabase.from('shine_tv_videos').delete().eq('id', id)
    if (error) setError(error.message)
    else setVideos((prev) => prev.filter((v) => v.id !== id))
  }

  const filteredVideos = filterCategory === 'all' ? videos : videos.filter((v) => v.category === filterCategory)
  const getCategoryLabel = (cat: string) => CATEGORIES.find((c) => c.id === cat)?.label || cat
  const getCategoryIcon = (cat: string) => CATEGORIES.find((c) => c.id === cat)?.icon || '🎬'

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
            Shine TV
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Publiez et gérez les vidéos de la plateforme Shine TV.
          </p>
        </div>
        {!showForm && (
          <button onClick={() => { setEditingId(null); setForm(emptyForm); setShowForm(true); setError(null) }}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 self-start sm:self-auto"
            style={{ background: '#E17055', color: '#fff' }}>
            Ajouter une vidéo
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
          <h2 className="font-semibold text-lg" style={{ color: '#E17055' }}>
            {editingId ? 'Modifier la vidéo' : 'Nouvelle vidéo'}
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="title" style={labelStyle}>Titre *</label>
              <input id="title" name="title" type="text" required value={form.title} onChange={handleChange} placeholder="Ex : Méditation du matin" style={inputStyle} />
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
            <textarea id="description" name="description" rows={3} value={form.description} onChange={handleChange} placeholder="Décrivez le contenu de cette vidéo..." style={{ ...inputStyle, resize: 'vertical' as const }} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="duration_minutes" style={labelStyle}>Durée (minutes)</label>
              <input id="duration_minutes" name="duration_minutes" type="number" min={0} value={form.duration_minutes} onChange={handleChange} style={inputStyle} />
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
            label="Miniature mobile (thumbnail)"
            accept="image/*"
            folder="shine-tv"
            currentUrl={form.thumbnail_url || null}
            hint="Image portrait/carrée pour mobile (JPG, PNG, WebP)"
            onUploaded={(url) => setForm((prev) => ({ ...prev, thumbnail_url: url }))}
            onRemoved={() => setForm((prev) => ({ ...prev, thumbnail_url: '' }))}
          />

          <FileUpload
            label="Miniature desktop (facultatif)"
            accept="image/*"
            folder="shine-tv"
            currentUrl={form.thumbnail_desktop_url || null}
            hint="Image 16:9 paysage pour desktop — si vide, utilise l'image mobile"
            onUploaded={(url) => setForm((prev) => ({ ...prev, thumbnail_desktop_url: url }))}
            onRemoved={() => setForm((prev) => ({ ...prev, thumbnail_desktop_url: '' }))}
          />

          <FileUpload
            label="Fichier vid\u00e9o"
            accept="video/*"
            folder="shine-tv"
            currentUrl={form.video_url || null}
            hint="MP4 recommand\u00e9, aucune limite de taille"
            maxSize={0}
            onUploaded={(url) => setForm((prev) => ({ ...prev, video_url: url }))}
            onRemoved={() => setForm((prev) => ({ ...prev, video_url: '' }))}
          />

          <FileUpload
            label="Sous-titres (WebVTT)"
            accept=".vtt,.srt"
            folder="shine-tv/subtitles"
            currentUrl={form.subtitle_url || null}
            hint="Fichier .vtt ou .srt pour les sous-titres"
            onUploaded={(url) => setForm((prev) => ({ ...prev, subtitle_url: url }))}
            onRemoved={() => setForm((prev) => ({ ...prev, subtitle_url: '' }))}
          />

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={saving || !form.title.trim()}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-40"
              style={{ background: '#E17055', color: '#fff' }}>
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
          <button onClick={() => setFilterCategory('all')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: filterCategory === 'all' ? 'rgba(225,112,85,0.15)' : 'transparent',
              color: filterCategory === 'all' ? '#E17055' : 'var(--text-muted)',
              border: `1px solid ${filterCategory === 'all' ? 'rgba(225,112,85,0.3)' : 'var(--border)'}`,
            }}>
            Tout ({videos.length})
          </button>
          {CATEGORIES.map((c) => {
            const count = videos.filter((v) => v.category === c.id).length
            if (count === 0) return null
            return (
              <button key={c.id} onClick={() => setFilterCategory(c.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: filterCategory === c.id ? 'rgba(225,112,85,0.15)' : 'transparent',
                  color: filterCategory === c.id ? '#E17055' : 'var(--text-muted)',
                  border: `1px solid ${filterCategory === c.id ? 'rgba(225,112,85,0.3)' : 'var(--border)'}`,
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
          <div className="w-8 h-8 border-2 border-[#E17055] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
          <p className="text-4xl mb-3">🎬</p>
          <p style={{ color: 'var(--text-muted)' }}>Aucune vidéo pour le moment.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVideos.map((v) => (
            <div key={v.id} className="rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
              {/* Thumbnail */}
              <div className="relative aspect-video" style={{ background: 'rgba(225,112,85,0.08)' }}>
                {v.thumbnail_url ? (
                  <img src={v.thumbnail_url} alt={v.title} className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">🎬</div>
                )}
                {/* Duration badge */}
                {v.duration_minutes > 0 && (
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-medium"
                    style={{ background: 'rgba(0,0,0,0.75)', color: '#fff' }}>
                    {v.duration_minutes} min
                  </span>
                )}
                {/* Status badge */}
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-medium"
                  style={{
                    background: v.is_published ? 'rgba(85,239,196,0.9)' : 'rgba(255,107,53,0.9)',
                    color: '#fff',
                  }}>
                  {v.is_published ? 'Publié' : 'Brouillon'}
                </span>
              </div>

              {/* Info */}
              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{v.title}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(225,112,85,0.1)', color: '#E17055' }}>
                    {getCategoryIcon(v.category)} {getCategoryLabel(v.category)}
                  </span>
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{v.year}</span>
                </div>
                {v.description && (
                  <p className="text-xs line-clamp-2" style={{ color: 'var(--text-muted)' }}>{v.description}</p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <button onClick={() => openEdit(v)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                    style={{ background: 'rgba(116,192,252,0.1)', color: '#74C0FC', border: '1px solid rgba(116,192,252,0.2)' }}>
                    Modifier
                  </button>
                  <button onClick={() => togglePublish(v)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                    style={{
                      background: v.is_published ? 'rgba(255,107,53,0.1)' : 'rgba(85,239,196,0.1)',
                      color: v.is_published ? '#FF6B35' : '#55EFC4',
                      border: `1px solid ${v.is_published ? 'rgba(255,107,53,0.2)' : 'rgba(85,239,196,0.2)'}`,
                    }}>
                    {v.is_published ? 'Dépublier' : 'Publier'}
                  </button>
                  <button onClick={() => handleDelete(v.id)}
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
