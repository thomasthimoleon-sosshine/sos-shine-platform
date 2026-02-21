'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import FileUpload from '@/components/FileUpload'
import type { Douleur } from '@/types/database'

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

const emptyForm = {
  title: '',
  slug: '',
  description: '',
  video_url: '',
  audio_energy_url: '',
  audio_meditation_url: '',
  pdf_url: '',
  exercise_content: '',
  image_url: '',
}

export default function AdminDouleursPage() {
  const [douleurs, setDouleurs] = useState<Douleur[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  async function loadDouleurs() {
    setLoading(true)
    const { data, error } = await supabase
      .from('douleurs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setDouleurs((data as Douleur[]) ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadDouleurs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm((prev) => {
      const next = { ...prev, [name]: value }
      if (name === 'title') {
        next.slug = generateSlug(value)
      }
      return next
    })
  }

  function openEditForm(d: Douleur) {
    setEditingId(d.id)
    setForm({
      title: d.title,
      slug: d.slug,
      description: d.description || '',
      video_url: d.video_url || '',
      audio_energy_url: d.audio_energy_url || '',
      audio_meditation_url: d.audio_meditation_url || '',
      pdf_url: d.pdf_url || '',
      exercise_content: d.exercise_content || '',
      image_url: d.image_url || '',
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
      slug: form.slug,
      description: form.description.trim() || null,
      video_url: form.video_url.trim() || null,
      audio_energy_url: form.audio_energy_url.trim() || null,
      audio_meditation_url: form.audio_meditation_url.trim() || null,
      pdf_url: form.pdf_url.trim() || null,
      exercise_content: form.exercise_content.trim() || null,
      image_url: form.image_url.trim() || null,
    }

    if (editingId) {
      const { error } = await supabase
        .from('douleurs')
        .update(payload)
        .eq('id', editingId)

      if (error) {
        setError(error.message)
        setSaving(false)
        return
      }
    } else {
      const { error } = await supabase.from('douleurs').insert({
        ...payload,
        is_active: true,
        is_published: false,
      })

      if (error) {
        setError(error.message)
        setSaving(false)
        return
      }
    }

    cancelForm()
    await loadDouleurs()
    setSaving(false)
  }

  async function togglePublish(d: Douleur) {
    const { error } = await supabase
      .from('douleurs')
      .update({ is_published: !d.is_published })
      .eq('id', d.id)

    if (error) {
      setError(error.message)
    } else {
      setDouleurs((prev) =>
        prev.map((item) =>
          item.id === d.id ? { ...item, is_published: !item.is_published } : item
        )
      )
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce challenge émotionnel ? Cette action est irréversible.')) return

    const { error } = await supabase.from('douleurs').delete().eq('id', id)

    if (error) {
      setError(error.message)
    } else {
      setDouleurs((prev) => prev.filter((d) => d.id !== id))
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid var(--dark-border)',
    background: 'var(--dark)',
    color: 'var(--text-primary)',
    fontSize: '14px',
    outline: 'none',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--text-secondary)',
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Challenges émotionnels
          </h1>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
            Gérez les challenges émotionnels de l&apos;encyclopédie SOS Shine.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              setEditingId(null)
              setForm(emptyForm)
              setShowForm(true)
              setError(null)
            }}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:opacity-90"
            style={{ background: '#74C0FC', color: '#fff' }}
          >
            Créer un challenge
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
          <h2 className="font-semibold text-lg" style={{ color: '#74C0FC' }}>
            {editingId ? 'Modifier le challenge' : 'Nouveau challenge émotionnel'}
          </h2>

          {/* Title + Slug */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="title" style={labelStyle}>Titre *</label>
              <input id="title" name="title" type="text" required value={form.title} onChange={handleChange} placeholder="Ex : Abandon" style={inputStyle} />
            </div>
            <div>
              <label htmlFor="slug" style={labelStyle}>Slug (auto-genere)</label>
              <input id="slug" name="slug" type="text" required value={form.slug} onChange={handleChange} placeholder="abandon" style={{ ...inputStyle, color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" style={labelStyle}>Description</label>
            <textarea id="description" name="description" rows={3} value={form.description} onChange={handleChange} placeholder="Brève description de ce challenge émotionnel..." style={{ ...inputStyle, resize: 'vertical' as const }} />
          </div>

          {/* Image de couverture */}
          <FileUpload
            label="Image de couverture"
            accept="image/*"
            folder="douleurs"
            currentUrl={form.image_url || null}
            hint="Image représentant ce challenge émotionnel (optionnel)"
            onUploaded={(url) => setForm((prev) => ({ ...prev, image_url: url }))}
            onRemoved={() => setForm((prev) => ({ ...prev, image_url: '' }))}
          />

          {/* Uploads for 4 steps */}
          <div className="rounded-lg p-4" style={{ background: 'rgba(85,239,196,0.04)', border: '1px solid rgba(85,239,196,0.1)' }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: '#55EFC4' }}>Etape 1 — Comprendre (Video)</h3>
            <FileUpload
              label="Video de coaching"
              accept="video/*"
              folder="douleurs"
              currentUrl={form.video_url || null}
              hint="MP4 recommande, max 100 Mo"
              onUploaded={(url) => setForm((prev) => ({ ...prev, video_url: url }))}
              onRemoved={() => setForm((prev) => ({ ...prev, video_url: '' }))}
            />
          </div>

          <div className="rounded-lg p-4" style={{ background: 'rgba(116,192,252,0.04)', border: '1px solid rgba(116,192,252,0.1)' }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: '#74C0FC' }}>Etape 2 — Liberation Energetique (Audio)</h3>
            <FileUpload
              label="Audio soin energetique"
              accept="audio/*"
              folder="douleurs"
              currentUrl={form.audio_energy_url || null}
              hint="MP3 ou WAV, max 100 Mo"
              onUploaded={(url) => setForm((prev) => ({ ...prev, audio_energy_url: url }))}
              onRemoved={() => setForm((prev) => ({ ...prev, audio_energy_url: '' }))}
            />
          </div>

          <div className="rounded-lg p-4" style={{ background: 'rgba(225,112,85,0.04)', border: '1px solid rgba(225,112,85,0.1)' }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: '#E17055' }}>Etape 3 — Integration & Meditation (Audio)</h3>
            <FileUpload
              label="Audio meditation guidee"
              accept="audio/*"
              folder="douleurs"
              currentUrl={form.audio_meditation_url || null}
              hint="MP3 ou WAV, max 100 Mo"
              onUploaded={(url) => setForm((prev) => ({ ...prev, audio_meditation_url: url }))}
              onRemoved={() => setForm((prev) => ({ ...prev, audio_meditation_url: '' }))}
            />
          </div>

          <div className="rounded-lg p-4" style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.1)' }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: '#D4AF37' }}>Etape 4 — Action & Reprogrammation</h3>
            <FileUpload
              label="PDF exercices"
              accept="application/pdf"
              folder="douleurs"
              currentUrl={form.pdf_url || null}
              hint="PDF max 100 Mo"
              onUploaded={(url) => setForm((prev) => ({ ...prev, pdf_url: url }))}
              onRemoved={() => setForm((prev) => ({ ...prev, pdf_url: '' }))}
            />
            <div className="mt-4">
              <label htmlFor="exercise_content" style={labelStyle}>Contenu exercice (texte)</label>
              <textarea id="exercise_content" name="exercise_content" rows={5} value={form.exercise_content} onChange={handleChange} placeholder="Instructions de l'exercice..." style={{ ...inputStyle, resize: 'vertical' as const }} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={saving || !form.title.trim()}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-40"
              style={{ background: '#74C0FC', color: '#fff' }}>
              {saving ? 'Enregistrement...' : editingId ? 'Mettre a jour' : 'Enregistrer'}
            </button>
            <button type="button" onClick={cancelForm}
              className="px-5 py-2.5 rounded-lg text-sm transition-colors"
              style={{ color: 'var(--text-muted)', border: '1px solid var(--dark-border)' }}>
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#74C0FC] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : douleurs.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
          <p style={{ color: 'var(--text-muted)' }}>Aucun challenge émotionnel créé pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {douleurs.map((d) => (
            <div key={d.id} className="rounded-xl p-5 transition-all duration-200"
              style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-base truncate" style={{ color: 'var(--text-primary)' }}>
                      {d.title}
                    </h3>
                    <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)' }}>
                      /{d.slug}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                      style={{
                        background: d.is_published ? 'rgba(85,239,196,0.1)' : 'rgba(255,107,53,0.1)',
                        color: d.is_published ? '#55EFC4' : '#FF6B35',
                        border: `1px solid ${d.is_published ? 'rgba(85,239,196,0.2)' : 'rgba(255,107,53,0.2)'}`,
                      }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: d.is_published ? '#55EFC4' : '#FF6B35' }} />
                      {d.is_published ? 'Publie' : 'Brouillon'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {[
                      { ok: !!d.video_url, label: 'Video', color: '#55EFC4' },
                      { ok: !!d.audio_energy_url, label: 'Audio energie', color: '#74C0FC' },
                      { ok: !!d.audio_meditation_url, label: 'Audio meditation', color: '#E17055' },
                      { ok: !!d.pdf_url, label: 'PDF', color: '#D4AF37' },
                    ].map((item) => (
                      <span key={item.label} className="text-[10px] px-2 py-0.5 rounded-full" style={{
                        background: item.ok ? `${item.color}15` : 'rgba(90,83,71,0.2)',
                        color: item.ok ? item.color : 'var(--text-muted)',
                      }}>
                        {item.ok ? '\u25CF' : '\u25CB'} {item.label}
                      </span>
                    ))}
                  </div>

                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    Cree le {new Date(d.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => openEditForm(d)}
                    className="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 hover:opacity-80"
                    style={{ background: 'rgba(116,192,252,0.1)', color: '#74C0FC', border: '1px solid rgba(116,192,252,0.2)' }}>
                    Modifier
                  </button>
                  <button onClick={() => togglePublish(d)}
                    className="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 hover:opacity-80"
                    style={{
                      background: d.is_published ? 'rgba(255,107,53,0.1)' : 'rgba(85,239,196,0.1)',
                      color: d.is_published ? '#FF6B35' : '#55EFC4',
                      border: `1px solid ${d.is_published ? 'rgba(255,107,53,0.2)' : 'rgba(85,239,196,0.2)'}`,
                    }}>
                    {d.is_published ? 'Depublier' : 'Publier'}
                  </button>
                  <button onClick={() => handleDelete(d.id)}
                    className="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 hover:opacity-80"
                    style={{ background: 'rgba(255,107,107,0.1)', color: '#FF6B6B', border: '1px solid rgba(255,107,107,0.2)' }}>
                    Supprimer
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
