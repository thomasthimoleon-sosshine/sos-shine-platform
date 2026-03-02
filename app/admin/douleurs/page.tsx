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
  image_url: '',
  // Step 1
  video_url: '',
  step1_audio_url: '',
  step1_pdf_url: '',
  step1_image_url: '',
  // Step 2
  step2_video_url: '',
  audio_energy_url: '',
  step2_pdf_url: '',
  step2_image_url: '',
  // Step 3
  step3_video_url: '',
  audio_meditation_url: '',
  pdf_url: '',
  step3_image_url: '',
  exercise_content: '',
}

const STEPS = [
  { num: 1, title: 'Comprendre', icon: '🎬', color: '#55EFC4', colorBg: 'rgba(85,239,196,0.04)', colorBorder: 'rgba(85,239,196,0.1)' },
  { num: 2, title: 'Libérer & Intégrer', icon: '✨', color: '#74C0FC', colorBg: 'rgba(116,192,252,0.04)', colorBorder: 'rgba(116,192,252,0.1)' },
  { num: 3, title: 'Agir', icon: '⚡', color: '#E17055', colorBg: 'rgba(225,112,85,0.04)', colorBorder: 'rgba(225,112,85,0.1)' },
]

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
      image_url: d.image_url || '',
      video_url: d.video_url || '',
      step1_audio_url: d.step1_audio_url || '',
      step1_pdf_url: d.step1_pdf_url || '',
      step1_image_url: d.step1_image_url || '',
      step2_video_url: d.step2_video_url || '',
      audio_energy_url: d.audio_energy_url || '',
      step2_pdf_url: d.step2_pdf_url || '',
      step2_image_url: d.step2_image_url || '',
      step3_video_url: d.step3_video_url || '',
      audio_meditation_url: d.audio_meditation_url || '',
      pdf_url: d.pdf_url || '',
      step3_image_url: d.step3_image_url || '',
      exercise_content: d.exercise_content || '',
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
      image_url: form.image_url.trim() || null,
      video_url: form.video_url.trim() || null,
      step1_audio_url: form.step1_audio_url.trim() || null,
      step1_pdf_url: form.step1_pdf_url.trim() || null,
      step1_image_url: form.step1_image_url.trim() || null,
      step2_video_url: form.step2_video_url.trim() || null,
      audio_energy_url: form.audio_energy_url.trim() || null,
      step2_pdf_url: form.step2_pdf_url.trim() || null,
      step2_image_url: form.step2_image_url.trim() || null,
      step3_video_url: form.step3_video_url.trim() || null,
      audio_meditation_url: form.audio_meditation_url.trim() || null,
      pdf_url: form.pdf_url.trim() || null,
      step3_image_url: form.step3_image_url.trim() || null,
      exercise_content: form.exercise_content.trim() || null,
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
    setError(null)
    const willPublish = !d.is_published

    // Method 1: Try direct update
    const { data: updated, error } = await supabase
      .from('douleurs')
      .update({ is_published: willPublish })
      .eq('id', d.id)
      .select('id, is_published')
      .single()

    if (error || !updated) {
      // Method 2: Fallback to RPC function (bypasses RLS issues)
      console.warn('Direct update failed, trying RPC fallback:', error?.message)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: rpcResult, error: rpcError } = await (supabase as any)
        .rpc('toggle_douleur_publish', {
          douleur_id: d.id,
          new_published: willPublish,
        })

      if (rpcError) {
        setError(
          `Échec de la publication : ${rpcError.message}. ` +
          `Assurez-vous d'avoir exécuté la migration SQL "20260302_fix_douleurs_publish_v2.sql" dans Supabase.`
        )
        return
      }

      if (!rpcResult || (Array.isArray(rpcResult) && rpcResult.length === 0)) {
        setError('La mise à jour n\'a pas été appliquée. Vérifiez vos permissions administrateur.')
        return
      }
    }

    // Verify the change actually persisted
    const { data: verified } = await supabase
      .from('douleurs')
      .select('id, is_published')
      .eq('id', d.id)
      .single()

    const confirmedPublished = verified ? verified.is_published : willPublish

    if (verified && verified.is_published !== willPublish) {
      setError(
        `Attention : la publication a été bloquée par les permissions Supabase (RLS). ` +
        `Exécutez la migration "20260302_fix_douleurs_publish_v2.sql" dans votre dashboard Supabase → SQL Editor.`
      )
    }

    setDouleurs((prev) =>
      prev.map((item) =>
        item.id === d.id ? { ...item, is_published: confirmedPublished } : item
      )
    )

    if (confirmedPublished && !d.is_published) {
      try {
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'new_douleur',
            title: 'Nouveau protocole disponible',
            body: d.title,
            link: `/dashboard/encyclopedie/${d.slug}`,
          }),
        })
      } catch {
        // notification sending failed silently
      }
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

  // Helper: get media fields for a step
  function getStepFields(stepNum: number) {
    if (stepNum === 1) return { video: 'video_url', audio: 'step1_audio_url', pdf: 'step1_pdf_url', image: 'step1_image_url' }
    if (stepNum === 2) return { video: 'step2_video_url', audio: 'audio_energy_url', pdf: 'step2_pdf_url', image: 'step2_image_url' }
    return { video: 'step3_video_url', audio: 'audio_meditation_url', pdf: 'pdf_url', image: 'step3_image_url' }
  }

  // Check if a douleur has content for a given step
  function hasStepContent(d: Douleur, stepNum: number): boolean {
    const fields = getStepFields(stepNum)
    const v = d[fields.video as keyof Douleur]
    const a = d[fields.audio as keyof Douleur]
    const p = d[fields.pdf as keyof Douleur]
    return !!(v || a || p)
  }

  // Get detailed media status for a step
  function getStepMediaDetails(d: Douleur, stepNum: number) {
    const fields = getStepFields(stepNum)
    return {
      hasVideo: !!d[fields.video as keyof Douleur],
      hasAudio: !!d[fields.audio as keyof Douleur],
      hasPdf: !!d[fields.pdf as keyof Douleur],
      hasImage: !!d[fields.image as keyof Douleur],
    }
  }

  // Count total media across all steps
  function getTotalMediaCount(d: Douleur): number {
    let count = 0
    for (let i = 1; i <= 3; i++) {
      const m = getStepMediaDetails(d, i)
      if (m.hasVideo) count++
      if (m.hasAudio) count++
      if (m.hasPdf) count++
      if (m.hasImage) count++
    }
    return count
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
              <label htmlFor="slug" style={labelStyle}>Slug (auto-généré)</label>
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

          {/* 3 Steps — each with Video + Audio + PDF */}
          {STEPS.map((step) => {
            const fields = getStepFields(step.num)
            return (
              <div key={step.num} className="rounded-lg p-4 space-y-4" style={{ background: step.colorBg, border: `1px solid ${step.colorBorder}` }}>
                <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: step.color }}>
                  <span className="text-lg">{step.icon}</span>
                  Étape {step.num} — {step.title}
                </h3>

                <div className="grid gap-4">
                  {/* Video */}
                  <FileUpload
                    label={`Vidéo — Étape ${step.num}`}
                    accept="video/*"
                    folder="douleurs"
                    currentUrl={(form as Record<string, string>)[fields.video] || null}
                    hint="MP4 recommandé, max 100 Mo"
                    onUploaded={(url) => setForm((prev) => ({ ...prev, [fields.video]: url }))}
                    onRemoved={() => setForm((prev) => ({ ...prev, [fields.video]: '' }))}
                  />

                  {/* Audio */}
                  <FileUpload
                    label={`Audio — Étape ${step.num}`}
                    accept="audio/*"
                    folder="douleurs"
                    currentUrl={(form as Record<string, string>)[fields.audio] || null}
                    hint="MP3 ou WAV, max 100 Mo"
                    onUploaded={(url) => setForm((prev) => ({ ...prev, [fields.audio]: url }))}
                    onRemoved={() => setForm((prev) => ({ ...prev, [fields.audio]: '' }))}
                  />

                  {/* PDF */}
                  <FileUpload
                    label={`PDF — Étape ${step.num}`}
                    accept="application/pdf"
                    folder="douleurs"
                    currentUrl={(form as Record<string, string>)[fields.pdf] || null}
                    hint="PDF max 100 Mo"
                    onUploaded={(url) => setForm((prev) => ({ ...prev, [fields.pdf]: url }))}
                    onRemoved={() => setForm((prev) => ({ ...prev, [fields.pdf]: '' }))}
                  />

                  {/* Image */}
                  <FileUpload
                    label={`Image / Photo — Étape ${step.num}`}
                    accept="image/*"
                    folder="douleurs"
                    currentUrl={(form as Record<string, string>)[fields.image] || null}
                    hint="JPG, PNG ou WebP (optionnel)"
                    onUploaded={(url) => setForm((prev) => ({ ...prev, [fields.image]: url }))}
                    onRemoved={() => setForm((prev) => ({ ...prev, [fields.image]: '' }))}
                  />
                </div>

                {/* Exercise content only on step 3 */}
                {step.num === 3 && (
                  <div>
                    <label htmlFor="exercise_content" style={labelStyle}>Contenu exercice (texte)</label>
                    <textarea id="exercise_content" name="exercise_content" rows={5} value={form.exercise_content} onChange={handleChange} placeholder="Instructions de l'exercice..." style={{ ...inputStyle, resize: 'vertical' as const }} />
                  </div>
                )}
              </div>
            )
          })}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={saving || !form.title.trim()}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-40"
              style={{ background: '#74C0FC', color: '#fff' }}>
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
        <div className="space-y-4">
          {douleurs.map((d) => {
            const totalMedia = getTotalMediaCount(d)
            return (
              <div key={d.id} className="rounded-xl overflow-hidden transition-all duration-200"
                style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>

                {/* Header row */}
                <div className="p-5 pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Left: cover image + info */}
                    <div className="flex gap-4 flex-1 min-w-0">
                      {/* Cover image thumbnail */}
                      {d.image_url ? (
                        <img src={d.image_url} alt={d.title}
                          className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                          style={{ border: '1px solid var(--dark-border)' }} />
                      ) : (
                        <div className="w-14 h-14 rounded-lg flex-shrink-0 flex items-center justify-center text-xl"
                          style={{ background: 'rgba(116,192,252,0.08)', border: '1px solid rgba(116,192,252,0.15)' }}>
                          💎
                        </div>
                      )}

                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-base truncate" style={{ color: 'var(--text-primary)' }}>
                            {d.title}
                          </h3>
                          <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)' }}>
                            /{d.slug}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full"
                            style={{
                              background: d.is_published ? 'rgba(85,239,196,0.1)' : 'rgba(255,107,53,0.1)',
                              color: d.is_published ? '#55EFC4' : '#FF6B35',
                              border: `1px solid ${d.is_published ? 'rgba(85,239,196,0.2)' : 'rgba(255,107,53,0.2)'}`,
                            }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: d.is_published ? '#55EFC4' : '#FF6B35' }} />
                            {d.is_published ? 'Publié' : 'Brouillon'}
                          </span>
                          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                            {totalMedia}/12 médias
                          </span>
                          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                            Créé le {new Date(d.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>

                        {d.description && (
                          <p className="text-xs truncate" style={{ color: 'var(--text-muted)', maxWidth: '500px' }}>
                            {d.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => openEditForm(d)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:opacity-80"
                        style={{ background: 'rgba(116,192,252,0.1)', color: '#74C0FC', border: '1px solid rgba(116,192,252,0.2)' }}>
                        Modifier
                      </button>
                      <button onClick={() => togglePublish(d)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:opacity-80"
                        style={{
                          background: d.is_published ? 'rgba(255,107,53,0.1)' : 'rgba(85,239,196,0.1)',
                          color: d.is_published ? '#FF6B35' : '#55EFC4',
                          border: `1px solid ${d.is_published ? 'rgba(255,107,53,0.2)' : 'rgba(85,239,196,0.2)'}`,
                        }}>
                        {d.is_published ? 'Dépublier' : 'Publier'}
                      </button>
                      <button onClick={() => handleDelete(d.id)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:opacity-80"
                        style={{ background: 'rgba(255,107,107,0.1)', color: '#FF6B6B', border: '1px solid rgba(255,107,107,0.2)' }}>
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>

                {/* Step media detail grid */}
                <div className="grid grid-cols-3 gap-px" style={{ background: 'var(--dark-border)' }}>
                  {STEPS.map((step) => {
                    const media = getStepMediaDetails(d, step.num)
                    const has = hasStepContent(d, step.num)
                    const mediaCount = [media.hasVideo, media.hasAudio, media.hasPdf, media.hasImage].filter(Boolean).length
                    return (
                      <div key={step.num} className="p-3 space-y-2"
                        style={{ background: has ? step.colorBg : 'var(--dark-card)' }}>
                        {/* Step header */}
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold flex items-center gap-1.5" style={{ color: has ? step.color : 'var(--text-muted)' }}>
                            <span className="text-sm">{step.icon}</span>
                            Ét. {step.num} — {step.title}
                          </span>
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                            style={{
                              background: mediaCount === 4 ? 'rgba(85,239,196,0.15)' : mediaCount > 0 ? 'rgba(212,175,55,0.15)' : 'rgba(90,83,71,0.2)',
                              color: mediaCount === 4 ? '#55EFC4' : mediaCount > 0 ? '#D4AF37' : 'var(--text-muted)',
                            }}>
                            {mediaCount}/4
                          </span>
                        </div>

                        {/* Media type indicators */}
                        <div className="flex flex-col gap-1">
                          {/* Video */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px]" style={{ opacity: media.hasVideo ? 1 : 0.35 }}>🎬</span>
                            <span className="text-[10px] font-medium" style={{ color: media.hasVideo ? step.color : 'var(--text-muted)', opacity: media.hasVideo ? 1 : 0.5 }}>
                              Vidéo
                            </span>
                            {media.hasVideo ? (
                              <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#55EFC4' }} />
                            ) : (
                              <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: 'var(--dark-border)' }} />
                            )}
                          </div>

                          {/* Audio */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px]" style={{ opacity: media.hasAudio ? 1 : 0.35 }}>🎵</span>
                            <span className="text-[10px] font-medium" style={{ color: media.hasAudio ? step.color : 'var(--text-muted)', opacity: media.hasAudio ? 1 : 0.5 }}>
                              Audio
                            </span>
                            {media.hasAudio ? (
                              <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#55EFC4' }} />
                            ) : (
                              <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: 'var(--dark-border)' }} />
                            )}
                          </div>

                          {/* PDF */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px]" style={{ opacity: media.hasPdf ? 1 : 0.35 }}>📄</span>
                            <span className="text-[10px] font-medium" style={{ color: media.hasPdf ? step.color : 'var(--text-muted)', opacity: media.hasPdf ? 1 : 0.5 }}>
                              PDF
                            </span>
                            {media.hasPdf ? (
                              <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#55EFC4' }} />
                            ) : (
                              <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: 'var(--dark-border)' }} />
                            )}
                          </div>

                          {/* Image */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px]" style={{ opacity: media.hasImage ? 1 : 0.35 }}>🖼️</span>
                            <span className="text-[10px] font-medium" style={{ color: media.hasImage ? step.color : 'var(--text-muted)', opacity: media.hasImage ? 1 : 0.5 }}>
                              Image
                            </span>
                            {media.hasImage ? (
                              <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#55EFC4' }} />
                            ) : (
                              <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: 'var(--dark-border)' }} />
                            )}
                          </div>
                        </div>

                        {/* Exercise content indicator for step 3 */}
                        {step.num === 3 && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px]" style={{ opacity: d.exercise_content ? 1 : 0.35 }}>✍️</span>
                            <span className="text-[10px] font-medium" style={{ color: d.exercise_content ? step.color : 'var(--text-muted)', opacity: d.exercise_content ? 1 : 0.5 }}>
                              Exercice
                            </span>
                            {d.exercise_content ? (
                              <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#55EFC4' }} />
                            ) : (
                              <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: 'var(--dark-border)' }} />
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
