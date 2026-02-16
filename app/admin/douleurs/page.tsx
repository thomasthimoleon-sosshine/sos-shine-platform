'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
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
}

export default function AdminDouleursPage() {
  const [douleurs, setDouleurs] = useState<Douleur[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // ── Load douleurs ──
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

  // ── Handle form field changes ──
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

  // ── Create douleur ──
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)

    const { error } = await supabase.from('douleurs').insert({
      title: form.title.trim(),
      slug: form.slug,
      description: form.description.trim() || null,
      video_url: form.video_url.trim() || null,
      audio_energy_url: form.audio_energy_url.trim() || null,
      audio_meditation_url: form.audio_meditation_url.trim() || null,
      pdf_url: form.pdf_url.trim() || null,
      exercise_content: form.exercise_content.trim() || null,
      is_active: true,
      is_published: false,
    })

    if (error) {
      setError(error.message)
    } else {
      setForm(emptyForm)
      setShowForm(false)
      await loadDouleurs()
    }
    setSaving(false)
  }

  // ── Toggle publish ──
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

  // ── Delete douleur ──
  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette douleur ? Cette action est irréversible.')) return

    const { error } = await supabase.from('douleurs').delete().eq('id', id)

    if (error) {
      setError(error.message)
    } else {
      setDouleurs((prev) => prev.filter((d) => d.id !== id))
    }
  }

  // ── Styles ──
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
          <h1
            className="font-display text-3xl font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            Douleurs
          </h1>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
            Gérez les douleurs de l&apos;encyclopédie SOS Shine.
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setError(null)
            if (showForm) setForm(emptyForm)
          }}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:opacity-90"
          style={{
            background: '#A29BFE',
            color: '#fff',
          }}
        >
          {showForm ? 'Annuler' : 'Créer une douleur'}
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div
          className="rounded-lg px-4 py-3 text-sm"
          style={{
            background: 'rgba(255,107,107,0.1)',
            border: '1px solid rgba(255,107,107,0.25)',
            color: '#FF6B6B',
          }}
        >
          {error}
        </div>
      )}

      {/* Inline creation form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="rounded-xl p-6 space-y-5"
          style={{
            background: 'var(--dark-card)',
            border: '1px solid var(--dark-border)',
          }}
        >
          <h2
            className="font-semibold text-lg"
            style={{ color: '#A29BFE' }}
          >
            Nouvelle douleur
          </h2>

          {/* Title + Slug row */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="title" style={labelStyle}>
                Titre *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={form.title}
                onChange={handleChange}
                placeholder="Ex : Abandon"
                style={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="slug" style={labelStyle}>
                Slug (auto-généré)
              </label>
              <input
                id="slug"
                name="slug"
                type="text"
                required
                value={form.slug}
                onChange={handleChange}
                placeholder="abandon"
                style={{ ...inputStyle, color: 'var(--text-muted)' }}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" style={labelStyle}>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={form.description}
              onChange={handleChange}
              placeholder="Brève description de cette douleur..."
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* Media URLs */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="video_url" style={labelStyle}>
                URL Vidéo (Étape 1 — Comprendre)
              </label>
              <input
                id="video_url"
                name="video_url"
                type="url"
                value={form.video_url}
                onChange={handleChange}
                placeholder="https://..."
                style={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="audio_energy_url" style={labelStyle}>
                URL Audio Énergie (Étape 2 — Libération)
              </label>
              <input
                id="audio_energy_url"
                name="audio_energy_url"
                type="url"
                value={form.audio_energy_url}
                onChange={handleChange}
                placeholder="https://..."
                style={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="audio_meditation_url" style={labelStyle}>
                URL Audio Méditation (Étape 3 — Intégration)
              </label>
              <input
                id="audio_meditation_url"
                name="audio_meditation_url"
                type="url"
                value={form.audio_meditation_url}
                onChange={handleChange}
                placeholder="https://..."
                style={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="pdf_url" style={labelStyle}>
                URL PDF (Étape 4 — Action)
              </label>
              <input
                id="pdf_url"
                name="pdf_url"
                type="url"
                value={form.pdf_url}
                onChange={handleChange}
                placeholder="https://..."
                style={inputStyle}
              />
            </div>
          </div>

          {/* Exercise content */}
          <div>
            <label htmlFor="exercise_content" style={labelStyle}>
              Contenu exercice (Étape 4 — Reprogrammation)
            </label>
            <textarea
              id="exercise_content"
              name="exercise_content"
              rows={5}
              value={form.exercise_content}
              onChange={handleChange}
              placeholder="Instructions de l'exercice..."
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving || !form.title.trim()}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-40"
              style={{
                background: '#A29BFE',
                color: '#fff',
              }}
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#A29BFE] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : douleurs.length === 0 ? (
        <div
          className="rounded-xl p-12 text-center"
          style={{
            background: 'var(--dark-card)',
            border: '1px solid var(--dark-border)',
          }}
        >
          <p style={{ color: 'var(--text-muted)' }}>
            Aucune douleur créée pour le moment.
          </p>
        </div>
      ) : (
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: 'var(--dark-card)',
            border: '1px solid var(--dark-border)',
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid var(--dark-border)',
                  }}
                >
                  <th
                    className="text-left text-xs font-semibold uppercase tracking-wider px-5 py-3"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Titre
                  </th>
                  <th
                    className="text-left text-xs font-semibold uppercase tracking-wider px-5 py-3"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Slug
                  </th>
                  <th
                    className="text-left text-xs font-semibold uppercase tracking-wider px-5 py-3"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Statut
                  </th>
                  <th
                    className="text-left text-xs font-semibold uppercase tracking-wider px-5 py-3"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Créé le
                  </th>
                  <th
                    className="text-right text-xs font-semibold uppercase tracking-wider px-5 py-3"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {douleurs.map((d) => (
                  <tr
                    key={d.id}
                    className="transition-colors duration-150"
                    style={{
                      borderBottom: '1px solid var(--dark-border)',
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = 'rgba(162,155,254,0.04)')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = 'transparent')
                    }
                  >
                    <td
                      className="px-5 py-4 text-sm font-medium"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {d.title}
                    </td>
                    <td
                      className="px-5 py-4 text-sm font-mono"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {d.slug}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{
                          background: d.is_published
                            ? 'rgba(85,239,196,0.1)'
                            : 'rgba(255,107,53,0.1)',
                          color: d.is_published ? '#55EFC4' : '#FF6B35',
                          border: `1px solid ${d.is_published ? 'rgba(85,239,196,0.2)' : 'rgba(255,107,53,0.2)'}`,
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            background: d.is_published ? '#55EFC4' : '#FF6B35',
                          }}
                        />
                        {d.is_published ? 'Publié' : 'Brouillon'}
                      </span>
                    </td>
                    <td
                      className="px-5 py-4 text-sm"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {new Date(d.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => togglePublish(d)}
                          className="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 hover:opacity-80"
                          style={{
                            background: d.is_published
                              ? 'rgba(255,107,53,0.1)'
                              : 'rgba(85,239,196,0.1)',
                            color: d.is_published ? '#FF6B35' : '#55EFC4',
                            border: `1px solid ${d.is_published ? 'rgba(255,107,53,0.2)' : 'rgba(85,239,196,0.2)'}`,
                          }}
                        >
                          {d.is_published ? 'Dépublier' : 'Publier'}
                        </button>
                        <button
                          onClick={() => handleDelete(d.id)}
                          className="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 hover:opacity-80"
                          style={{
                            background: 'rgba(255,107,107,0.1)',
                            color: '#FF6B6B',
                            border: '1px solid rgba(255,107,107,0.2)',
                          }}
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
