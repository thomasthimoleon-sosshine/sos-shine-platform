'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import FileUpload from '@/components/FileUpload'
import type { Douleur, DouleurStep, DouleurQuizQuestion } from '@/types/database'

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

const DEFAULT_STEP_COLORS = ['#55EFC4', '#74C0FC', '#E17055', '#BA92FF', '#F8C291', '#FDA7DF', '#78E08F']
const DEFAULT_STEP_ICONS = ['🎬', '✨', '⚡', '🌊', '🔥', '💎', '🌟']

type StepForm = {
  id?: string
  title: string
  subtitle: string
  description: string
  icon: string
  color: string
  video_url: string
  video_url_2: string
  audio_url: string
  audio_url_2: string
  pdf_url: string
  image_url: string
  video_cover: string
  video2_cover: string
  audio_cover: string
  audio2_cover: string
  exercise_content: string
}

function createEmptyStep(num: number): StepForm {
  return {
    title: '',
    subtitle: '',
    description: '',
    icon: DEFAULT_STEP_ICONS[(num - 1) % DEFAULT_STEP_ICONS.length],
    color: DEFAULT_STEP_COLORS[(num - 1) % DEFAULT_STEP_COLORS.length],
    video_url: '',
    video_url_2: '',
    audio_url: '',
    audio_url_2: '',
    pdf_url: '',
    image_url: '',
    video_cover: '',
    video2_cover: '',
    audio_cover: '',
    audio2_cover: '',
    exercise_content: '',
  }
}

const DEFAULT_STEPS: StepForm[] = [
  { title: 'Comprendre', subtitle: 'Vidéo, audio & ressources', description: '', icon: '🎬', color: '#55EFC4', video_url: '', video_url_2: '', audio_url: '', audio_url_2: '', pdf_url: '', image_url: '', video_cover: '', video2_cover: '', audio_cover: '', audio2_cover: '', exercise_content: '' },
  { title: 'Libérer & Intégrer', subtitle: 'Audio, vidéo & ressources', description: '', icon: '✨', color: '#74C0FC', video_url: '', video_url_2: '', audio_url: '', audio_url_2: '', pdf_url: '', image_url: '', video_cover: '', video2_cover: '', audio_cover: '', audio2_cover: '', exercise_content: '' },
  { title: 'Agir', subtitle: 'Exercices, audio & ressources', description: '', icon: '⚡', color: '#E17055', video_url: '', video_url_2: '', audio_url: '', audio_url_2: '', pdf_url: '', image_url: '', video_cover: '', video2_cover: '', audio_cover: '', audio2_cover: '', exercise_content: '' },
]

const ENCYCLOPEDIE_CATEGORIES = [
  "Émotions & Psychologie",
  "Relations & Liens",
  "Blessures & Traumatismes",
  "Développement Personnel",
  "Corps & Somatique",
  "Spiritualité & Énergie",
  "Soins & Thérapies",
  "Identité & Mission",
  "Vie & Expériences",
  "Pratiques & Outils",
]

type ChallengeForm = {
  title: string
  slug: string
  subtitle: string
  category: string
  description: string
  image_url: string
  tags: string
  sos_audio_url: string
  sos_description: string
  sos_duration_seconds: string
  related_slugs: string[]
  steps: StepForm[]
}

const emptyForm: ChallengeForm = {
  title: '',
  slug: '',
  subtitle: '',
  category: '',
  description: '',
  image_url: '',
  tags: '',
  sos_audio_url: '',
  sos_description: '',
  sos_duration_seconds: '300',
  related_slugs: [],
  steps: DEFAULT_STEPS.map(s => ({ ...s })),
}

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

type DouleurWithSteps = Douleur & { dynamicSteps?: DouleurStep[] }

export default function AdminDouleursPage() {
  const [douleurs, setDouleurs] = useState<DouleurWithSteps[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<ChallengeForm>(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [expandedStep, setExpandedStep] = useState<number | null>(null)

  // Filter state
  const [filterCat, setFilterCat] = useState('ALL')
  const [filterSearch, setFilterSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all')

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
      const items = (data as Douleur[]) ?? []
      // Load dynamic steps for each douleur
      const withSteps: DouleurWithSteps[] = []
      for (const d of items) {
        const { data: steps } = await supabase
          .from('douleur_steps')
          .select('*')
          .eq('douleur_id', d.id)
          .order('step_number', { ascending: true })
        withSteps.push({ ...d, dynamicSteps: (steps as DouleurStep[]) || [] })
      }
      setDouleurs(withSteps)
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

  // Convert legacy douleur columns to StepForm array
  function legacyToSteps(d: Douleur): StepForm[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyD = d as any
    return [
      {
        title: 'Comprendre', subtitle: 'Vidéo, audio & ressources', description: '', icon: '🎬', color: '#55EFC4',
        video_url: d.video_url || '', video_url_2: anyD.video_url_2 || '',
        audio_url: d.step1_audio_url || '', audio_url_2: '',
        pdf_url: d.step1_pdf_url || '', image_url: d.step1_image_url || '',
        video_cover: '', video2_cover: '', audio_cover: '', audio2_cover: '', exercise_content: '',
      },
      {
        title: 'Libérer & Intégrer', subtitle: 'Audio, vidéo & ressources', description: '', icon: '✨', color: '#74C0FC',
        video_url: d.step2_video_url || '', video_url_2: '',
        audio_url: d.audio_energy_url || '', audio_url_2: anyD.audio_energy_url_2 || '',
        pdf_url: d.step2_pdf_url || '', image_url: d.step2_image_url || '',
        video_cover: '', video2_cover: '', audio_cover: '', audio2_cover: '', exercise_content: '',
      },
      {
        title: 'Agir', subtitle: 'Exercices, audio & ressources', description: '', icon: '⚡', color: '#E17055',
        video_url: d.step3_video_url || '', video_url_2: '',
        audio_url: d.audio_meditation_url || '', audio_url_2: '',
        pdf_url: d.pdf_url || '', image_url: d.step3_image_url || '',
        video_cover: '', video2_cover: '', audio_cover: '', audio2_cover: '', exercise_content: d.exercise_content || '',
      },
    ]
  }

  function dynamicStepsToForm(steps: DouleurStep[]): StepForm[] {
    return steps.map(s => ({
      id: s.id,
      title: s.title,
      subtitle: s.subtitle || '',
      description: s.description || '',
      icon: s.icon,
      color: s.color,
      video_url: s.video_url || '',
      video_url_2: s.video_url_2 || '',
      audio_url: s.audio_url || '',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      audio_url_2: s.audio_url_2 || '',
      pdf_url: s.pdf_url || '',
      image_url: s.image_url || '',
      video_cover: s.video_cover || '',
      video2_cover: s.video2_cover || '',
      audio_cover: s.audio_cover || '',
      audio2_cover: s.audio2_cover || '',
      exercise_content: s.exercise_content || '',
    }))
  }

  function openEditForm(d: DouleurWithSteps) {
    setEditingId(d.id)
    const steps = d.dynamicSteps && d.dynamicSteps.length > 0
      ? dynamicStepsToForm(d.dynamicSteps)
      : legacyToSteps(d)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyD = d as any
    setForm({
      title: d.title,
      slug: d.slug,
      subtitle: d.subtitle || '',
      category: d.category || '',
      description: d.description || '',
      image_url: d.image_url || '',
      tags: Array.isArray(d.tags) ? d.tags.join(', ') : '',
      sos_audio_url: anyD.sos_audio_url || '',
      sos_description: anyD.sos_description || '',
      sos_duration_seconds: anyD.sos_duration_seconds ? String(anyD.sos_duration_seconds) : '300',
      related_slugs: Array.isArray(anyD.related_slugs) ? anyD.related_slugs : [],
      steps,
    })
    setShowForm(true)
    setError(null)
    setExpandedStep(null)
    loadQuizForDouleur(d.id)
    setShowQuizForm(false)
    setEditingQuizId(null)
    setQuizForm(emptyQuizQuestion)
  }

  function duplicateChallenge(d: DouleurWithSteps) {
    setEditingId(null)
    const steps = d.dynamicSteps && d.dynamicSteps.length > 0
      ? dynamicStepsToForm(d.dynamicSteps)
      : legacyToSteps(d)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyD = d as any
    setForm({
      title: d.title + ' (copie)',
      slug: generateSlug(d.title + ' copie'),
      subtitle: d.subtitle || '',
      category: d.category || '',
      description: d.description || '',
      image_url: d.image_url || '',
      tags: Array.isArray(d.tags) ? d.tags.join(', ') : '',
      sos_audio_url: anyD.sos_audio_url || '',
      sos_description: anyD.sos_description || '',
      sos_duration_seconds: anyD.sos_duration_seconds ? String(anyD.sos_duration_seconds) : '300',
      related_slugs: Array.isArray(anyD.related_slugs) ? anyD.related_slugs : [],
      steps: steps.map(s => ({ ...s, id: undefined })),
    })
    setShowForm(true)
    setError(null)
    setExpandedStep(null)
  }

  function cancelForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
    setError(null)
    setExpandedStep(null)
    setQuizQuestions([])
    setShowQuizForm(false)
    setEditingQuizId(null)
    setQuizForm(emptyQuizQuestion)
  }

  function addStep() {
    const num = form.steps.length + 1
    setForm(prev => ({
      ...prev,
      steps: [...prev.steps, createEmptyStep(num)],
    }))
    setExpandedStep(form.steps.length) // expand the new step
  }

  function removeStep(index: number) {
    if (form.steps.length <= 1) return
    setForm(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index),
    }))
    setExpandedStep(null)
  }

  function moveStep(index: number, direction: 'up' | 'down') {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= form.steps.length) return
    const updated = [...form.steps]
    const temp = updated[index]
    updated[index] = updated[newIndex]
    updated[newIndex] = temp
    setForm(prev => ({ ...prev, steps: updated }))
  }

  function updateStep(index: number, field: keyof StepForm, value: string) {
    setForm(prev => {
      const steps = [...prev.steps]
      steps[index] = { ...steps[index], [field]: value }
      return { ...prev, steps }
    })
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)

    // Build legacy columns from first 3 steps for backward compatibility
    const s1 = form.steps[0] || createEmptyStep(1)
    const s2 = form.steps[1] || createEmptyStep(2)
    const s3 = form.steps[2] || createEmptyStep(3)

    const tagsArray = form.tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0)

    const payload = {
      title: form.title.trim(),
      slug: form.slug,
      subtitle: form.subtitle.trim() || null,
      category: form.category || null,
      description: form.description.trim() || null,
      image_url: form.image_url.trim() || null,
      tags: tagsArray,
      // SOS emergency meditation (per douleur)
      sos_audio_url: form.sos_audio_url.trim() || null,
      sos_description: form.sos_description.trim() || null,
      sos_duration_seconds: form.sos_duration_seconds ? parseInt(form.sos_duration_seconds, 10) : null,
      related_slugs: form.related_slugs.length > 0 ? form.related_slugs : null,
      // Legacy columns (first 3 steps mapped for backward compat)
      video_url: s1.video_url.trim() || null,
      video_url_2: s1.video_url_2.trim() || null, // Step 1: 2nd video
      step1_audio_url: s1.audio_url.trim() || null,
      step1_pdf_url: s1.pdf_url.trim() || null,
      step1_image_url: s1.image_url.trim() || null,
      step2_video_url: s2.video_url.trim() || null,
      audio_energy_url: s2.audio_url.trim() || null,
      audio_energy_url_2: s2.audio_url_2.trim() || null, // Step 2: 2nd audio
      step2_pdf_url: s2.pdf_url.trim() || null,
      step2_image_url: s2.image_url.trim() || null,
      step3_video_url: s3.video_url.trim() || null,
      audio_meditation_url: s3.audio_url.trim() || null,
      pdf_url: s3.pdf_url.trim() || null,
      step3_image_url: s3.image_url.trim() || null,
      exercise_content: s3.exercise_content.trim() || null,
    }

    let douleurId: string | null = null

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
      douleurId = editingId
    } else {
      const { data, error } = await supabase.from('douleurs').insert({
        ...payload,
        is_active: true,
        is_published: false,
        is_original: false,
      }).select('id').single()

      if (error) {
        setError(error.message)
        setSaving(false)
        return
      }
      douleurId = (data as { id: string })?.id ?? null
    }

    // Save dynamic steps via UPSERT (safer than DELETE+INSERT:
    // if save fails, existing data is preserved instead of wiped)
    if (douleurId) {
      const stepsToUpsert = form.steps.map((s, i) => ({
        douleur_id: douleurId!,
        step_number: i + 1,
        title: s.title.trim() || `Étape ${i + 1}`,
        subtitle: s.subtitle.trim() || null,
        description: s.description.trim() || null,
        icon: s.icon || DEFAULT_STEP_ICONS[i % DEFAULT_STEP_ICONS.length],
        color: s.color || DEFAULT_STEP_COLORS[i % DEFAULT_STEP_COLORS.length],
        video_url: s.video_url.trim() || null,
        video_url_2: s.video_url_2.trim() || null,
        audio_url: s.audio_url.trim() || null,
        audio_url_2: s.audio_url_2.trim() || null,
        pdf_url: s.pdf_url.trim() || null,
        image_url: s.image_url.trim() || null,
        video_cover: s.video_cover.trim() || null,
        video2_cover: s.video2_cover.trim() || null,
        audio_cover: s.audio_cover.trim() || null,
        audio2_cover: s.audio2_cover.trim() || null,
        exercise_content: s.exercise_content.trim() || null,
      }))

      if (stepsToUpsert.length > 0) {
        const { error: stepsError } = await supabase
          .from('douleur_steps')
          .upsert(stepsToUpsert, { onConflict: 'douleur_id,step_number' })
        if (stepsError) {
          console.error('Error saving steps:', stepsError)
          setError(`Échec de l'enregistrement des étapes : ${stepsError.message}. Vos données existantes sont préservées. Vérifiez la console pour les détails.`)
          setSaving(false)
          return
        }
      }

      // Delete any steps that were removed (e.g., user reduced from 4 to 3 steps)
      const { error: cleanupError } = await supabase
        .from('douleur_steps')
        .delete()
        .eq('douleur_id', douleurId)
        .gt('step_number', form.steps.length)
      if (cleanupError) {
        console.warn('Non-critical: could not clean up removed steps:', cleanupError.message)
      }
    }

    cancelForm()
    await loadDouleurs()
    setSaving(false)
  }

  async function togglePublish(d: Douleur) {
    setError(null)
    const willPublish = !d.is_published

    const { data: updated, error } = await supabase
      .from('douleurs')
      .update({ is_published: willPublish })
      .eq('id', d.id)
      .select('id, is_published')
      .single()

    if (error || !updated) {
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
            type: 'new_protocol',
            title: '📖 Nouveau protocole dans l\'Encyclopédie',
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

  // Get step media count
  function getStepMediaCount(s: StepForm | DouleurStep): number {
    let count = 0
    const vid = 'video_url' in s ? s.video_url : null
    const aud = 'audio_url' in s ? s.audio_url : null
    const aud2 = 'audio_url_2' in s ? s.audio_url_2 : null
    const pdf = 'pdf_url' in s ? s.pdf_url : null
    const img = 'image_url' in s ? s.image_url : null
    if (vid) count++
    if (aud) count++
    if (aud2) count++
    if (pdf) count++
    if (img) count++
    return count
  }

  function getTotalMediaCount(d: DouleurWithSteps): number {
    if (d.dynamicSteps && d.dynamicSteps.length > 0) {
      return d.dynamicSteps.reduce((sum, s) => sum + getStepMediaCount(s), 0)
    }
    // Legacy fallback
    let count = 0
    if (d.video_url) count++
    if (d.step1_audio_url) count++
    if (d.step1_pdf_url) count++
    if (d.step1_image_url) count++
    if (d.step2_video_url) count++
    if (d.audio_energy_url) count++
    if ((d as any).audio_energy_url_2) count++
    if (d.step2_pdf_url) count++
    if (d.step2_image_url) count++
    if (d.step3_video_url) count++
    if (d.audio_meditation_url) count++
    if (d.pdf_url) count++
    if (d.step3_image_url) count++
    return count
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
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
              setForm({ ...emptyForm, steps: DEFAULT_STEPS.map(s => ({ ...s })) })
              setShowForm(true)
              setError(null)
              setExpandedStep(null)
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
        <form onSubmit={handleSave} className="rounded-xl p-6 space-y-5" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
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

          {/* Subtitle + Category */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="subtitle" style={labelStyle}>Sous-titre (encyclopédie)</label>
              <input id="subtitle" name="subtitle" type="text" value={form.subtitle} onChange={handleChange} placeholder="Ex : grandir sans père, sans mère ou sans les deux" style={inputStyle} />
            </div>
            <div>
              <label htmlFor="category" style={labelStyle}>Catégorie (encyclopédie)</label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                style={inputStyle}
              >
                <option value="">— Choisir une catégorie —</option>
                {ENCYCLOPEDIE_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
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

          {/* Tags pour interconnecter les douleurs */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Tags (séparés par des virgules)
            </label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              placeholder="rupture, abandon, solitude, couple"
            />
            <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
              Ces tags permettent d&apos;interconnecter ce challenge avec d&apos;autres (ex : &quot;rupture&quot; apparaîtra dans toutes les pages qui ont ce tag).
            </p>
          </div>

          {/* Sujets complémentaires */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Sujets complémentaires
            </label>
            <p className="text-[11px] mb-2" style={{ color: 'var(--text-muted)' }}>
              Sélectionnez les modules à recommander à la fin de ce challenge. Ils apparaîtront dans la section &quot;Sujets complémentaires&quot; en bas de la page.
            </p>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.related_slugs.map(slug => {
                const match = douleurs.find(d => d.slug === slug)
                return (
                  <span key={slug} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs"
                    style={{ background: 'rgba(201,169,97,0.1)', border: '1px solid rgba(201,169,97,0.2)', color: '#C9A961' }}>
                    {match?.title || slug}
                    <button type="button" onClick={() => setForm(prev => ({ ...prev, related_slugs: prev.related_slugs.filter(s => s !== slug) }))}
                      className="ml-0.5 hover:opacity-70 cursor-pointer" style={{ color: '#FF6B6B' }}>×</button>
                  </span>
                )
              })}
            </div>
            <select
              value=""
              onChange={e => {
                const val = e.target.value
                if (val && !form.related_slugs.includes(val)) {
                  setForm(prev => ({ ...prev, related_slugs: [...prev.related_slugs, val] }))
                }
              }}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
              <option value="">+ Ajouter un sujet complémentaire...</option>
              {douleurs
                .filter(d => d.slug !== form.slug && !form.related_slugs.includes(d.slug))
                .sort((a, b) => a.title.localeCompare(b.title))
                .map(d => (
                  <option key={d.id} value={d.slug}>{d.title}</option>
                ))}
            </select>
          </div>

          {/* ── SOS MEDITATION SECTION ── */}
          <div className="rounded-xl p-4 space-y-4" style={{ background: 'rgba(255,107,107,0.05)', border: '1px solid rgba(255,107,107,0.25)' }}>
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: '#FF6B6B' }}>
                <span>🆘</span> Méditation SOS d&apos;urgence
              </h3>
              <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                Audio de ~5 min accessible depuis le bouton SOS rouge affiché en haut de cette douleur. Utilisé quand un membre est en crise et a besoin d&apos;aide immédiate.
              </p>
            </div>
            <FileUpload
              label="Audio de la méditation SOS"
              accept="audio/*"
              folder="douleurs"
              currentUrl={form.sos_audio_url || null}
              hint="MP3 ou WAV, idéalement 3 à 7 minutes"
              onUploaded={(url) => setForm((prev) => ({ ...prev, sos_audio_url: url }))}
              onRemoved={() => setForm((prev) => ({ ...prev, sos_audio_url: '' }))}
            />
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Description courte (affichée avant de lancer l&apos;audio)
              </label>
              <textarea
                value={form.sos_description}
                onChange={(e) => setForm((prev) => ({ ...prev, sos_description: e.target.value }))}
                rows={3}
                placeholder="Ex: Respirez avec moi. Cette méditation va court-circuiter la panique en 5 minutes. Vous n'êtes pas seul(e)."
                className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-y"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Durée (en secondes)
              </label>
              <input
                type="number"
                value={form.sos_duration_seconds}
                onChange={(e) => setForm((prev) => ({ ...prev, sos_duration_seconds: e.target.value }))}
                placeholder="300"
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              />
              <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                300 = 5 minutes. Utilisé pour l&apos;affichage uniquement.
              </p>
            </div>
          </div>

          {/* ── DYNAMIC STEPS SECTION ── */}
          <div className="rounded-xl p-4" style={{ background: 'rgba(201,169,97,0.05)', border: '1px solid rgba(201,169,97,0.2)' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--brand)' }}>
                  Étapes du challenge ({form.steps.length})
                </h3>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Ajoutez autant d&apos;étapes que nécessaire. Chaque étape peut contenir vidéo, audio, PDF, image et exercice.
                </p>
              </div>
              <button type="button" onClick={addStep}
                className="px-3 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer transition-all"
                style={{ background: 'rgba(201,169,97,0.15)', color: 'var(--brand)', border: '1px solid rgba(201,169,97,0.3)' }}>
                + Ajouter une étape
              </button>
            </div>

            <div className="space-y-2">
              {form.steps.map((step, i) => {
                const isExpanded = expandedStep === i
                const mediaCount = getStepMediaCount(step)
                return (
                  <div key={i} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${step.color}30`, background: `${step.color}04` }}>
                    {/* Step header - always visible */}
                    <div
                      className="flex items-center justify-between p-3 cursor-pointer"
                      onClick={() => setExpandedStep(isExpanded ? null : i)}
                      style={{ background: isExpanded ? `${step.color}08` : 'transparent' }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-lg flex-shrink-0">{step.icon}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                              style={{ background: `${step.color}20`, color: step.color }}>
                              Étape {i + 1}
                            </span>
                            <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                              {step.title || '(sans titre)'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                              {mediaCount}/4 médias
                            </span>
                            {step.exercise_content && (
                              <span className="text-[10px]" style={{ color: step.color }}>+ exercice</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button type="button" onClick={(e) => { e.stopPropagation(); moveStep(i, 'up') }} disabled={i === 0}
                          className="w-7 h-7 rounded-md text-[11px] cursor-pointer disabled:opacity-30 flex items-center justify-center"
                          style={{ color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)' }} title="Monter">
                          ↑
                        </button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); moveStep(i, 'down') }} disabled={i === form.steps.length - 1}
                          className="w-7 h-7 rounded-md text-[11px] cursor-pointer disabled:opacity-30 flex items-center justify-center"
                          style={{ color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)' }} title="Descendre">
                          ↓
                        </button>
                        {form.steps.length > 1 && (
                          <button type="button" onClick={(e) => { e.stopPropagation(); removeStep(i) }}
                            className="w-7 h-7 rounded-md text-[11px] cursor-pointer flex items-center justify-center"
                            style={{ color: '#EF4444', background: 'rgba(239,68,68,0.1)' }} title="Supprimer">
                            ✕
                          </button>
                        )}
                        <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>
                          {isExpanded ? '▼' : '▶'}
                        </span>
                      </div>
                    </div>

                    {/* Step content - collapsible */}
                    {isExpanded && (
                      <div className="p-4 pt-2 space-y-4" style={{ borderTop: `1px solid ${step.color}15` }}>
                        {/* Step metadata */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div>
                            <label style={labelStyle}>Titre *</label>
                            <input type="text" value={step.title} onChange={e => updateStep(i, 'title', e.target.value)}
                              placeholder={`Étape ${i + 1}`} style={inputStyle} />
                          </div>
                          <div>
                            <label style={labelStyle}>Sous-titre</label>
                            <input type="text" value={step.subtitle} onChange={e => updateStep(i, 'subtitle', e.target.value)}
                              placeholder="Vidéo, audio & ressources" style={inputStyle} />
                          </div>
                          <div>
                            <label style={labelStyle}>Icône</label>
                            <input type="text" value={step.icon} onChange={e => updateStep(i, 'icon', e.target.value)}
                              placeholder="🎬" style={inputStyle} />
                          </div>
                          <div>
                            <label style={labelStyle}>Couleur</label>
                            <div className="flex gap-2">
                              <input type="color" value={step.color} onChange={e => updateStep(i, 'color', e.target.value)}
                                className="w-10 h-10 rounded cursor-pointer" style={{ background: 'transparent', border: 'none' }} />
                              <input type="text" value={step.color} onChange={e => updateStep(i, 'color', e.target.value)}
                                style={{ ...inputStyle, flex: 1 }} />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label style={labelStyle}>Description de l&apos;étape</label>
                          <textarea value={step.description} onChange={e => updateStep(i, 'description', e.target.value)}
                            rows={2} placeholder="Description affichée aux membres..."
                            style={{ ...inputStyle, resize: 'vertical' as const }} />
                        </div>

                        {/* Media uploads */}
                        <div className="grid gap-4">
                          <FileUpload
                            label={i === 0 ? `Vidéo principale — Étape ${i + 1}` : `Vidéo — Étape ${i + 1}`}
                            accept="video/*"
                            folder="douleurs"
                            currentUrl={step.video_url || null}
                            hint={i === 0 ? 'Vidéo principale' : 'Vidéo de l\'étape'}
                            onUploaded={(url) => updateStep(i, 'video_url', url)}
                            onRemoved={() => updateStep(i, 'video_url', '')}
                          />
                          {/* 2nd video: only on step 1 (Comprendre) */}
                          <FileUpload
                            label={`Couverture vidéo — Étape ${i + 1}`}
                            accept="image/*"
                            folder="douleurs"
                            currentUrl={step.video_cover || null}
                            hint="Image affichée avant la lecture de la vidéo"
                            onUploaded={(url) => updateStep(i, 'video_cover', url)}
                            onRemoved={() => updateStep(i, 'video_cover', '')}
                          />
                          {i === 0 && (
                            <>
                            <FileUpload
                              label={`Vidéo secondaire — Étape ${i + 1} (optionnel)`}
                              accept="video/*"
                              folder="douleurs"
                              currentUrl={step.video_url_2 || null}
                              hint="2ème vidéo : complément, témoignage, variation"
                              onUploaded={(url) => updateStep(i, 'video_url_2', url)}
                              onRemoved={() => updateStep(i, 'video_url_2', '')}
                            />
                            <FileUpload
                              label={`Couverture vidéo secondaire — Étape ${i + 1}`}
                              accept="image/*"
                              folder="douleurs"
                              currentUrl={step.video2_cover || null}
                              hint="Image avant lecture de la 2ème vidéo"
                              onUploaded={(url) => updateStep(i, 'video2_cover', url)}
                              onRemoved={() => updateStep(i, 'video2_cover', '')}
                            />
                            </>
                          )}
                          <FileUpload
                            label={i === 1 ? `Audio principal — Étape ${i + 1}` : `Audio — Étape ${i + 1}`}
                            accept="audio/*"
                            folder="douleurs"
                            currentUrl={step.audio_url || null}
                            hint={i === 1 ? 'Audio principal de libération' : 'MP3 ou WAV'}
                            onUploaded={(url) => updateStep(i, 'audio_url', url)}
                            onRemoved={() => updateStep(i, 'audio_url', '')}
                          />
                          <FileUpload
                            label={`Couverture audio — Étape ${i + 1}`}
                            accept="image/*"
                            folder="douleurs"
                            currentUrl={step.audio_cover || null}
                            hint="Image affichée au-dessus du player audio"
                            onUploaded={(url) => updateStep(i, 'audio_cover', url)}
                            onRemoved={() => updateStep(i, 'audio_cover', '')}
                          />
                          {/* 2nd audio: only on step 2 (Libérer) */}
                          {i === 1 && (
                            <>
                            <FileUpload
                              label={`Audio secondaire — Étape ${i + 1} (optionnel)`}
                              accept="audio/*"
                              folder="douleurs"
                              currentUrl={step.audio_url_2 || null}
                              hint="2ème audio : version alternative, intégration, ambiance"
                              onUploaded={(url) => updateStep(i, 'audio_url_2', url)}
                              onRemoved={() => updateStep(i, 'audio_url_2', '')}
                            />
                            <FileUpload
                              label={`Couverture audio secondaire — Étape ${i + 1}`}
                              accept="image/*"
                              folder="douleurs"
                              currentUrl={step.audio2_cover || null}
                              hint="Image avant lecture du 2ème audio"
                              onUploaded={(url) => updateStep(i, 'audio2_cover', url)}
                              onRemoved={() => updateStep(i, 'audio2_cover', '')}
                            />
                            </>
                          )}
                          <FileUpload
                            label={`PDF — Étape ${i + 1}`}
                            accept="application/pdf"
                            folder="douleurs"
                            currentUrl={step.pdf_url || null}
                            hint="PDF max 500 Mo"
                            onUploaded={(url) => updateStep(i, 'pdf_url', url)}
                            onRemoved={() => updateStep(i, 'pdf_url', '')}
                          />
                          <FileUpload
                            label={`Image / Photo — Étape ${i + 1}`}
                            accept="image/*"
                            folder="douleurs"
                            currentUrl={step.image_url || null}
                            hint="JPG, PNG ou WebP (optionnel)"
                            onUploaded={(url) => updateStep(i, 'image_url', url)}
                            onRemoved={() => updateStep(i, 'image_url', '')}
                          />
                        </div>

                        {/* Exercise content */}
                        <div>
                          <label style={labelStyle}>Contenu exercice (texte)</label>
                          <textarea value={step.exercise_content} onChange={e => updateStep(i, 'exercise_content', e.target.value)}
                            rows={4} placeholder="Instructions de l'exercice pour cette étape..."
                            style={{ ...inputStyle, resize: 'vertical' as const }} />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Add step button at bottom */}
            <button type="button" onClick={addStep}
              className="mt-3 w-full py-2.5 rounded-lg text-[11px] font-medium cursor-pointer transition-all"
              style={{ color: 'var(--brand)', border: '1px dashed rgba(201,169,97,0.3)', background: 'transparent' }}>
              + Ajouter une autre étape
            </button>
          </div>

          {/* ── Quiz QCM Section (only when editing) ── */}
          {editingId && (
            <div className="rounded-lg p-4 space-y-4" style={{ background: 'rgba(201,169,97,0.04)', border: '1px solid rgba(201,169,97,0.15)' }}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: '#C9A961' }}>
                  <span className="text-lg">📝</span>
                  Quiz de validation ({quizQuestions.length} question{quizQuestions.length !== 1 ? 's' : ''})
                </h3>
                <button type="button" onClick={() => { setShowQuizForm(true); setEditingQuizId(null); setQuizForm(emptyQuizQuestion) }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
                  style={{ background: 'rgba(201,169,97,0.15)', color: '#C9A961', border: '1px solid rgba(201,169,97,0.3)' }}>
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
                    <div key={q.id} className="rounded-lg p-3" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)' }}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            <span className="text-xs font-mono mr-2" style={{ color: '#C9A961' }}>Q{idx + 1}</span>
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
                <div className="rounded-lg p-4 space-y-3" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(201,169,97,0.2)' }}>
                  <h4 className="text-xs font-semibold" style={{ color: '#C9A961' }}>
                    {editingQuizId ? 'Modifier la question' : 'Nouvelle question'}
                  </h4>

                  <div>
                    <label style={labelStyle}>Question *</label>
                    <input type="text" value={quizForm.question}
                      onChange={(e) => setQuizForm(prev => ({ ...prev, question: e.target.value }))}
                      placeholder="Ex : Quel est le premier pas vers la guérison ?"
                      style={inputStyle} />
                  </div>

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
                              border: quizForm.correct_indices.includes(idx) ? '2px solid #55EFC4' : '2px solid var(--border)',
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
                        style={{ color: '#C9A961' }}>
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
                      style={{ background: '#C9A961', color: '#09090b' }}>
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
              style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      {!showForm && douleurs.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              placeholder="Rechercher un challenge..."
              style={inputStyle}
              className="sm:max-w-xs"
            />
            <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} style={inputStyle} className="sm:max-w-[220px]">
              <option value="ALL">Toutes les catégories</option>
              {ENCYCLOPEDIE_CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as 'all' | 'published' | 'draft')} style={inputStyle} className="sm:max-w-[160px]">
              <option value="all">Tous les statuts</option>
              <option value="published">Publiés</option>
              <option value="draft">Brouillons</option>
            </select>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {douleurs.filter(d => {
              const matchSearch = !filterSearch || d.title.toLowerCase().includes(filterSearch.toLowerCase()) || (d.subtitle || '').toLowerCase().includes(filterSearch.toLowerCase())
              const matchCat = filterCat === 'ALL' || d.category === filterCat
              const matchStatus = filterStatus === 'all' || (filterStatus === 'published' ? d.is_published : !d.is_published)
              return matchSearch && matchCat && matchStatus
            }).length} / {douleurs.length} challenges affichés
          </p>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#74C0FC] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : douleurs.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--text-muted)' }}>Aucun challenge émotionnel créé pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {douleurs.filter(d => {
            const matchSearch = !filterSearch || d.title.toLowerCase().includes(filterSearch.toLowerCase()) || (d.subtitle || '').toLowerCase().includes(filterSearch.toLowerCase())
            const matchCat = filterCat === 'ALL' || d.category === filterCat
            const matchStatus = filterStatus === 'all' || (filterStatus === 'published' ? d.is_published : !d.is_published)
            return matchSearch && matchCat && matchStatus
          }).map((d) => {
            const totalMedia = getTotalMediaCount(d)
            const stepCount = d.dynamicSteps && d.dynamicSteps.length > 0 ? d.dynamicSteps.length : 3
            const totalPossibleMedia = stepCount * 4 + 1
            return (
              <div key={d.id} className="rounded-xl overflow-hidden transition-all duration-200"
                style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>

                {/* Header row */}
                <div className="p-5 pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Left: cover image + info */}
                    <div className="flex gap-4 flex-1 min-w-0">
                      {d.image_url ? (
                        <img src={d.image_url} alt={d.title}
                          className="w-14 h-14 rounded-lg object-contain flex-shrink-0"
                          style={{ border: '1px solid var(--border)' }} />
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
                          {d.is_original && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                              style={{ background: 'rgba(201,169,97,0.15)', color: '#C9A961', border: '1px solid rgba(201,169,97,0.25)' }}>
                              &diams; Original
                            </span>
                          )}
                          <span className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                            style={{ background: 'rgba(201,169,97,0.1)', color: '#C9A961' }}>
                            {stepCount} étape{stepCount > 1 ? 's' : ''}
                          </span>
                          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                            {totalMedia}/{totalPossibleMedia} médias
                          </span>
                          <span className="text-[11px]" style={{ color: quizCounts[d.id] ? '#C9A961' : 'var(--text-muted)' }}>
                            📝 {quizCounts[d.id] || 0} quiz
                          </span>
                          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                            Créé le {new Date(d.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>

                        {d.subtitle && (
                          <p className="text-xs italic truncate" style={{ color: 'var(--text-secondary)', maxWidth: '500px' }}>
                            {d.subtitle}
                          </p>
                        )}
                        {d.category && (
                          <span className="inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(201,169,97,0.08)', color: '#C9A961', border: '1px solid rgba(201,169,97,0.15)' }}>
                            {d.category}
                          </span>
                        )}
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

                {/* Step overview grid */}
                <div className="flex flex-wrap gap-px" style={{ background: 'var(--border)' }}>
                  {(d.dynamicSteps && d.dynamicSteps.length > 0 ? d.dynamicSteps : []).map((step, i) => {
                    const mediaCount = getStepMediaCount(step)
                    return (
                      <div key={step.id} className="flex-1 min-w-[120px] p-2.5"
                        style={{ background: mediaCount > 0 ? `${step.color}06` : 'var(--surface-card)' }}>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold flex items-center gap-1" style={{ color: mediaCount > 0 ? step.color : 'var(--text-muted)' }}>
                            <span className="text-xs">{step.icon}</span>
                            Ét. {i + 1}
                          </span>
                          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                            style={{
                              background: mediaCount === 4 ? 'rgba(85,239,196,0.15)' : mediaCount > 0 ? 'rgba(201,169,97,0.15)' : 'rgba(90,83,71,0.2)',
                              color: mediaCount === 4 ? '#55EFC4' : mediaCount > 0 ? '#C9A961' : 'var(--text-muted)',
                            }}>
                            {mediaCount}/4
                          </span>
                        </div>
                        <p className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                          {step.title}
                        </p>
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
