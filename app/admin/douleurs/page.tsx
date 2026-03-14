'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import FileUpload from '@/components/FileUpload'
import type { Douleur, DouleurQuizQuestion } from '@/types/database'

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

// ── Quiz Question Form type ──
type QuizQuestionForm = {
  id?: string
  question: string
  options: string[]
  correct_indices: number[]
}

const emptyQuizQuestion: QuizQuestionForm = {
  question: '',
  options: ['', '', '', ''],
  correct_indices: [],
}

export default function AdminDouleursPage() {
  const [douleurs, setDouleurs] = useState<Douleur[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState<string | null>(null)

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<DouleurQuizQuestion[]>([])
  const [quizForm, setQuizForm] = useState<QuizQuestionForm>(emptyQuizQuestion)
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null)
  const [showQuizForm, setShowQuizForm] = useState(false)
  const [savingQuiz, setSavingQuiz] = useState(false)
  const [quizCounts, setQuizCounts] = useState<Record<string, number>>({})

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

  async function loadQuizCounts() {
    const { data } = await supabase
      .from('douleur_quiz_questions')
      .select('douleur_id')
    if (data) {
      const counts: Record<string, number> = {}
      for (const q of data) {
        counts[q.douleur_id] = (counts[q.douleur_id] || 0) + 1
      }
      setQuizCounts(counts)
    }
  }

  async function loadQuizForDouleur(douleurId: string) {
    const { data } = await supabase
      .from('douleur_quiz_questions')
      .select('*')
      .eq('douleur_id', douleurId)
      .order('sort_order', { ascending: true })
    setQuizQuestions((data as DouleurQuizQuestion[]) || [])
  }

  async function saveQuizQuestion(douleurId: string) {
    if (!quizForm.question.trim() || quizForm.correct_indices.length === 0) return
    setSavingQuiz(true)

    const validOptions = quizForm.options.filter(o => o.trim())
    if (validOptions.length < 2) { setSavingQuiz(false); return }

    const payload = {
      douleur_id: douleurId,
      question: quizForm.question.trim(),
      options: validOptions,
      correct_indices: quizForm.correct_indices,
      sort_order: editingQuizId ? undefined : quizQuestions.length,
    }

    if (editingQuizId) {
      await supabase.from('douleur_quiz_questions').update({
        question: payload.question,
        options: payload.options,
        correct_indices: payload.correct_indices,
      }).eq('id', editingQuizId)
    } else {
      await supabase.from('douleur_quiz_questions').insert(payload)
    }

    setShowQuizForm(false)
    setEditingQuizId(null)
    setQuizForm(emptyQuizQuestion)
    setSavingQuiz(false)
    await loadQuizForDouleur(douleurId)
    await loadQuizCounts()
  }

  async function deleteQuizQuestion(id: string, douleurId: string) {
    if (!confirm('Supprimer cette question ?')) return
    await supabase.from('douleur_quiz_questions').delete().eq('id', id)
    await loadQuizForDouleur(douleurId)
    await loadQuizCounts()
  }

  function editQuizQuestion(q: DouleurQuizQuestion) {
    setEditingQuizId(q.id)
    setQuizForm({
      id: q.id,
      question: q.question,
      options: [...q.options, ...Array(Math.max(0, 4 - q.options.length)).fill('')],
      correct_indices: [...q.correct_indices],
    })
    setShowQuizForm(true)
  }

  useEffect(() => {
    loadDouleurs()
    loadQuizCounts()
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
    loadQuizForDouleur(d.id)
    setShowQuizForm(false)
    setEditingQuizId(null)
    setQuizForm(emptyQuizQuestion)
  }

  function duplicateChallenge(d: Douleur) {
    setEditingId(null)
    setForm({
      title: d.title + ' (copie)',
      slug: generateSlug(d.title + ' copie'),
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
    setQuizQuestions([])
    setShowQuizForm(false)
    setEditingQuizId(null)
    setQuizForm(emptyQuizQuestion)
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Challenges émotionnels
          </h1>
          <p className="mt-1 text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
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
            className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:opacity-90 self-start sm:self-auto flex-shrink-0"
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

          {/* ── Quiz QCM Section (only when editing) ── */}
          {editingId && (
            <div className="rounded-lg p-4 space-y-4" style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.15)' }}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: '#D4AF37' }}>
                  <span className="text-lg">📝</span>
                  Quiz de validation ({quizQuestions.length} question{quizQuestions.length !== 1 ? 's' : ''})
                </h3>
                <button type="button" onClick={() => { setShowQuizForm(true); setEditingQuizId(null); setQuizForm(emptyQuizQuestion) }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
                  style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)' }}>
                  + Ajouter une question
                </button>
              </div>

              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Le membre doit obtenir au moins 8/10 pour valider le challenge. Ajoutez vos questions QCM ci-dessous.
              </p>

              {/* Existing questions list */}
              {quizQuestions.length > 0 && (
                <div className="space-y-2">
                  {quizQuestions.map((q, idx) => (
                    <div key={q.id} className="rounded-lg p-3" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--dark-border)' }}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            <span className="text-xs font-mono mr-2" style={{ color: '#D4AF37' }}>Q{idx + 1}</span>
                            {q.question}
                          </p>
                          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
                            {q.options.map((opt, oi) => (
                              <div key={oi} className="flex items-center gap-2 text-xs py-0.5">
                                {(q.correct_indices as number[]).includes(oi) ? (
                                  <span className="w-4 h-4 rounded flex items-center justify-center text-[10px]" style={{ background: 'rgba(85,239,196,0.2)', color: '#55EFC4' }}>✓</span>
                                ) : (
                                  <span className="w-4 h-4 rounded flex items-center justify-center text-[10px]" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>○</span>
                                )}
                                <span style={{ color: (q.correct_indices as number[]).includes(oi) ? '#55EFC4' : 'var(--text-secondary)' }}>{opt}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button type="button" onClick={() => editQuizQuestion(q)}
                            className="px-2 py-1 rounded text-[10px] font-medium cursor-pointer"
                            style={{ color: '#74C0FC' }}>
                            Modifier
                          </button>
                          <button type="button" onClick={() => deleteQuizQuestion(q.id, editingId)}
                            className="px-2 py-1 rounded text-[10px] font-medium cursor-pointer"
                            style={{ color: '#FF6B6B' }}>
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add/Edit question form */}
              {showQuizForm && (
                <div className="rounded-lg p-4 space-y-3" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(212,175,55,0.2)' }}>
                  <h4 className="text-xs font-semibold" style={{ color: '#D4AF37' }}>
                    {editingQuizId ? 'Modifier la question' : 'Nouvelle question'}
                  </h4>

                  {/* Question text */}
                  <div>
                    <label style={labelStyle}>Question *</label>
                    <input type="text" value={quizForm.question}
                      onChange={(e) => setQuizForm(prev => ({ ...prev, question: e.target.value }))}
                      placeholder="Ex : Quel est le premier pas vers la guérison ?"
                      style={inputStyle} />
                  </div>

                  {/* Options */}
                  <div>
                    <label style={labelStyle}>Réponses proposées (cochez les bonnes réponses)</label>
                    <div className="space-y-2">
                      {quizForm.options.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <button type="button"
                            onClick={() => {
                              setQuizForm(prev => {
                                const newCorrect = prev.correct_indices.includes(idx)
                                  ? prev.correct_indices.filter(i => i !== idx)
                                  : [...prev.correct_indices, idx]
                                return { ...prev, correct_indices: newCorrect }
                              })
                            }}
                            className="w-7 h-7 rounded flex items-center justify-center shrink-0 cursor-pointer transition-all"
                            style={{
                              background: quizForm.correct_indices.includes(idx) ? 'rgba(85,239,196,0.2)' : 'rgba(255,255,255,0.05)',
                              border: quizForm.correct_indices.includes(idx) ? '2px solid #55EFC4' : '2px solid var(--dark-border)',
                              color: quizForm.correct_indices.includes(idx) ? '#55EFC4' : 'var(--text-muted)',
                              fontSize: '12px',
                            }}>
                            {quizForm.correct_indices.includes(idx) ? '✓' : ''}
                          </button>
                          <input type="text" value={opt}
                            onChange={(e) => {
                              const newOpts = [...quizForm.options]
                              newOpts[idx] = e.target.value
                              setQuizForm(prev => ({ ...prev, options: newOpts }))
                            }}
                            placeholder={`Réponse ${idx + 1}`}
                            className="flex-1"
                            style={inputStyle} />
                          {quizForm.options.length > 2 && (
                            <button type="button"
                              onClick={() => {
                                const newOpts = quizForm.options.filter((_, i) => i !== idx)
                                const newCorrect = quizForm.correct_indices
                                  .filter(i => i !== idx)
                                  .map(i => i > idx ? i - 1 : i)
                                setQuizForm(prev => ({ ...prev, options: newOpts, correct_indices: newCorrect }))
                              }}
                              className="text-xs cursor-pointer px-1" style={{ color: '#FF6B6B' }}>✕</button>
                          )}
                        </div>
                      ))}
                    </div>
                    {quizForm.options.length < 6 && (
                      <button type="button"
                        onClick={() => setQuizForm(prev => ({ ...prev, options: [...prev.options, ''] }))}
                        className="mt-2 text-xs font-medium cursor-pointer"
                        style={{ color: '#D4AF37' }}>
                        + Ajouter une réponse
                      </button>
                    )}
                  </div>

                  {quizForm.correct_indices.length === 0 && quizForm.question.trim() && (
                    <p className="text-xs" style={{ color: '#FF6B6B' }}>Cochez au moins une bonne réponse.</p>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={() => saveQuizQuestion(editingId!)} disabled={savingQuiz || !quizForm.question.trim() || quizForm.correct_indices.length === 0 || quizForm.options.filter(o => o.trim()).length < 2}
                      className="px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-40"
                      style={{ background: '#D4AF37', color: '#09090b' }}>
                      {savingQuiz ? 'Enregistrement...' : editingQuizId ? 'Mettre à jour' : 'Ajouter la question'}
                    </button>
                    <button type="button" onClick={() => { setShowQuizForm(false); setEditingQuizId(null); setQuizForm(emptyQuizQuestion) }}
                      className="px-4 py-2 rounded-lg text-xs cursor-pointer"
                      style={{ color: 'var(--text-muted)' }}>
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

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
                          <span className="text-[11px]" style={{ color: quizCounts[d.id] ? '#D4AF37' : 'var(--text-muted)' }}>
                            📝 {quizCounts[d.id] || 0} quiz
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
                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                      <button onClick={() => openEditForm(d)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:opacity-80"
                        style={{ background: 'rgba(116,192,252,0.1)', color: '#74C0FC', border: '1px solid rgba(116,192,252,0.2)' }}>
                        Modifier
                      </button>
                      <button onClick={() => duplicateChallenge(d)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:opacity-80"
                        style={{ background: 'rgba(186,146,255,0.1)', color: '#BA92FF', border: '1px solid rgba(186,146,255,0.2)' }}>
                        Dupliquer
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-px" style={{ background: 'var(--dark-border)' }}>
                  {STEPS.map((step) => {
                    const media = getStepMediaDetails(d, step.num)
                    const has = hasStepContent(d, step.num)
                    const mediaCount = [media.hasVideo, media.hasAudio, media.hasPdf, media.hasImage].filter(Boolean).length
                    const mediaTypes = [
                      { icon: '🎬', label: 'Vidéo', active: media.hasVideo },
                      { icon: '🎵', label: 'Audio', active: media.hasAudio },
                      { icon: '📄', label: 'PDF', active: media.hasPdf },
                      { icon: '🖼️', label: 'Image', active: media.hasImage },
                    ]
                    return (
                      <div key={step.num} className="p-3 sm:space-y-2"
                        style={{ background: has ? step.colorBg : 'var(--dark-card)' }}>
                        {/* Step header */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-[11px] font-semibold flex items-center gap-1.5" style={{ color: has ? step.color : 'var(--text-muted)' }}>
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

                        {/* Media type indicators — horizontal on mobile, vertical on desktop */}
                        <div className="flex flex-row flex-wrap gap-x-3 gap-y-1 mt-1.5 sm:mt-0 sm:flex-col sm:gap-1">
                          {mediaTypes.map((m) => (
                            <div key={m.label} className="flex items-center gap-1.5">
                              <span className="text-[10px]" style={{ opacity: m.active ? 1 : 0.35 }}>{m.icon}</span>
                              <span className="text-[11px] sm:text-[10px] font-medium" style={{ color: m.active ? step.color : 'var(--text-muted)', opacity: m.active ? 1 : 0.5 }}>
                                {m.label}
                              </span>
                              {m.active ? (
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#55EFC4' }} />
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--dark-border)' }} />
                              )}
                            </div>
                          ))}

                          {/* Exercise content indicator for step 3 */}
                          {step.num === 3 && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px]" style={{ opacity: d.exercise_content ? 1 : 0.35 }}>✍️</span>
                              <span className="text-[11px] sm:text-[10px] font-medium" style={{ color: d.exercise_content ? step.color : 'var(--text-muted)', opacity: d.exercise_content ? 1 : 0.5 }}>
                                Exercice
                              </span>
                              {d.exercise_content ? (
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#55EFC4' }} />
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--dark-border)' }} />
                              )}
                            </div>
                          )}
                        </div>
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
