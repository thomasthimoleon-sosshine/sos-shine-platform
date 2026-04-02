'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Challenge, ChallengePhase, ChallengeRewardType, ChallengeStatus } from '@/types/database'

const REWARD_TYPES = [
  { value: 'xp', label: 'XP', icon: '⭐' },
  { value: 'video', label: 'Vidéo dédiée', icon: '🎬' },
  { value: 'call', label: 'Appel vidéo', icon: '📞' },
  { value: 'badge', label: 'Badge exclusif', icon: '🏆' },
]

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: 'Brouillon', color: 'var(--text-muted)' },
  active: { label: 'Actif', color: '#55EFC4' },
  completed: { label: 'Terminé', color: '#D4AF37' },
  archived: { label: 'Archivé', color: '#EF4444' },
}

type PhaseForm = {
  title: string
  description: string
  duration_days: string
}

type ChallengeForm = {
  title: string
  description: string
  reward_type: string
  reward_value: number
  reward_detail: string
  start_date: string
  end_date: string
  max_participants: string
  phases: PhaseForm[]
}

const emptyPhase: PhaseForm = { title: '', description: '', duration_days: '' }

const emptyForm: ChallengeForm = {
  title: '', description: '', reward_type: 'xp', reward_value: 100,
  reward_detail: '', start_date: '', end_date: '', max_participants: '',
  phases: [],
}

type ChallengeWithMeta = Challenge & { participant_count?: number; phases?: ChallengePhase[] }

export default function AdminDefisPage() {
  const [challenges, setChallenges] = useState<ChallengeWithMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ChallengeForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [expandedPhases, setExpandedPhases] = useState<string | null>(null)

  async function loadChallenges() {
    const supabase = createClient()
    const { data } = await supabase
      .from('challenges')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) {
      const withMeta: ChallengeWithMeta[] = []
      for (const ch of data as Challenge[]) {
        const { count } = await supabase
          .from('challenge_participations')
          .select('*', { count: 'exact', head: true })
          .eq('challenge_id', ch.id)
        const { data: phases } = await supabase
          .from('challenge_phases')
          .select('*')
          .eq('challenge_id', ch.id)
          .order('phase_number', { ascending: true })
        withMeta.push({ ...ch, participant_count: count || 0, phases: (phases as ChallengePhase[]) || [] })
      }
      setChallenges(withMeta)
    }
    setLoading(false)
  }

  useEffect(() => { loadChallenges() }, [])

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  function duplicateLast() {
    if (challenges.length === 0) return
    const last = challenges[0]
    setEditingId(null)
    setForm({
      title: last.title,
      description: last.description || '',
      reward_type: last.reward_type,
      reward_value: last.reward_value,
      reward_detail: last.reward_detail || '',
      start_date: last.start_date ? last.start_date.slice(0, 16) : '',
      end_date: last.end_date ? last.end_date.slice(0, 16) : '',
      max_participants: last.max_participants ? String(last.max_participants) : '',
      phases: (last.phases || []).map(p => ({
        title: p.title,
        description: p.description || '',
        duration_days: p.duration_days ? String(p.duration_days) : '',
      })),
    })
    setShowForm(true)
  }

  async function openEdit(ch: ChallengeWithMeta) {
    setEditingId(ch.id)
    setForm({
      title: ch.title,
      description: ch.description || '',
      reward_type: ch.reward_type,
      reward_value: ch.reward_value,
      reward_detail: ch.reward_detail || '',
      start_date: ch.start_date ? ch.start_date.slice(0, 16) : '',
      end_date: ch.end_date ? ch.end_date.slice(0, 16) : '',
      max_participants: ch.max_participants ? String(ch.max_participants) : '',
      phases: (ch.phases || []).map(p => ({
        title: p.title,
        description: p.description || '',
        duration_days: p.duration_days ? String(p.duration_days) : '',
      })),
    })
    setShowForm(true)
  }

  function addPhase() {
    setForm({ ...form, phases: [...form.phases, { ...emptyPhase }] })
  }

  function removePhase(index: number) {
    setForm({ ...form, phases: form.phases.filter((_, i) => i !== index) })
  }

  function updatePhase(index: number, field: keyof PhaseForm, value: string) {
    const updated = [...form.phases]
    updated[index] = { ...updated[index], [field]: value }
    setForm({ ...form, phases: updated })
  }

  function movePhase(index: number, direction: 'up' | 'down') {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= form.phases.length) return
    const updated = [...form.phases]
    const temp = updated[index]
    updated[index] = updated[newIndex]
    updated[newIndex] = temp
    setForm({ ...form, phases: updated })
  }

  async function handleSave() {
    if (!form.title.trim() || saving) return
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        reward_type: form.reward_type as ChallengeRewardType,
        reward_value: form.reward_value,
        reward_detail: form.reward_detail.trim() || null,
        start_date: form.start_date ? new Date(form.start_date).toISOString() : null,
        end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
        max_participants: form.max_participants ? parseInt(form.max_participants) : null,
      }

      let challengeId: string | null = null

      if (editingId) {
        const { error } = await supabase.from('challenges').update(payload).eq('id', editingId)
        if (error) throw error
        challengeId = editingId
      } else {
        const { data: newChallenge, error } = await supabase.from('challenges')
          .insert({ ...payload, created_by: user?.id ?? null, status: 'draft' as ChallengeStatus, winner_id: null })
          .select('id')
          .single()
        if (error) throw error
        challengeId = (newChallenge as { id: string } | null)?.id ?? null
      }

      // Save phases
      if (challengeId) {
        // Delete existing phases for this challenge
        const { error: delErr } = await supabase.from('challenge_phases').delete().eq('challenge_id', challengeId)
        if (delErr) throw delErr

        // Insert new phases
        if (form.phases.length > 0) {
          const phasesToInsert = form.phases
            .filter(p => p.title.trim())
            .map((p, i) => ({
              challenge_id: challengeId!,
              phase_number: i + 1,
              title: p.title.trim(),
              description: p.description.trim() || null,
              duration_days: p.duration_days ? parseInt(p.duration_days) : null,
            }))

          if (phasesToInsert.length > 0) {
            const { error: insErr } = await supabase.from('challenge_phases').insert(phasesToInsert)
            if (insErr) throw insErr
          }
        }
      }

      setShowForm(false)
      await loadChallenges()
    } catch (err) {
      console.error('Erreur sauvegarde défi:', err)
      alert('Erreur lors de la sauvegarde du défi. Veuillez réessayer.')
    } finally {
      setSaving(false)
    }
  }

  async function updateStatus(id: string, status: ChallengeStatus) {
    const supabase = createClient()
    const { error } = await supabase.from('challenges').update({ status }).eq('id', id)
    if (error) {
      console.error('Erreur mise à jour statut:', error)
      alert('Erreur lors de la mise à jour du statut.')
      return
    }
    await loadChallenges()
  }

  async function selectWinner(challengeId: string) {
    try {
      const supabase = createClient()
      const { data, error: fetchErr } = await supabase
        .from('challenge_participations')
        .select('user_id')
        .eq('challenge_id', challengeId)
        .eq('status', 'completed')
        .order('completed_at', { ascending: true })
        .limit(1)
        .single()

      if (fetchErr || !data) {
        alert('Aucun participant éligible trouvé pour ce défi.')
        return
      }

      const { error: updateErr } = await supabase.from('challenges').update({ winner_id: data.user_id, status: 'completed' as ChallengeStatus }).eq('id', challengeId)
      if (updateErr) throw updateErr

      const challenge = challenges.find(c => c.id === challengeId)
      const { data: { user } } = await supabase.auth.getUser()

      if (challenge && user) {
        const { data: post, error: postErr } = await supabase.from('posts').insert({
          author_id: user.id,
          title: `Défi "${challenge.title}" — Vainqueur !`,
          content: `Félicitations au vainqueur du défi "${challenge.title}" ! Bravo pour votre engagement et votre persévérance.`,
          post_type: 'announcement',
          category: 'remerciements',
          media_type: 'text',
          visibility: 'public',
          is_published: true,
        } as never).select('id').single()

        if (!postErr && post) {
          await supabase.from('pinned_posts').insert({
            post_id: (post as { id: string }).id,
            challenge_id: challengeId,
            pinned_by: user.id,
            pin_type: 'winner' as const,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          })
        }
      }

      await loadChallenges()
    } catch (err) {
      console.error('Erreur sélection vainqueur:', err)
      alert('Erreur lors de la sélection du vainqueur. Veuillez réessayer.')
    }
  }

  async function deleteChallenge(id: string) {
    if (!confirm('Supprimer ce défi ?')) return
    const supabase = createClient()
    const { error } = await supabase.from('challenges').delete().eq('id', id)
    if (error) {
      console.error('Erreur suppression défi:', error)
      alert('Erreur lors de la suppression du défi.')
      return
    }
    await loadChallenges()
  }

  const inputStyle = { background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>Défis Communautaires</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Créez et gérez les défis pour engager la communauté.</p>
        </div>
        <div className="flex items-center gap-2">
          {challenges.length > 0 && (
            <button onClick={duplicateLast}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all"
              style={{ background: 'rgba(212,175,55,0.15)', color: 'var(--gold)', border: '1px solid rgba(212,175,55,0.3)' }}>
              Dupliquer le dernier
            </button>
          )}
          <button onClick={openCreate}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all"
            style={{ background: 'var(--gold)', color: 'var(--dark)' }}>
            + Nouveau défi
          </button>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="rounded-2xl p-6" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            {editingId ? 'Modifier le défi' : 'Créer un défi'}
          </h3>
          <div className="space-y-4">
            <input type="text" placeholder="Titre du défi" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={inputStyle} />
            <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              rows={3} className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-y" style={inputStyle} />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>Type de récompense</label>
                <select value={form.reward_type} onChange={e => setForm({ ...form, reward_type: e.target.value })}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={inputStyle}>
                  {REWARD_TYPES.map(r => <option key={r.value} value={r.value}>{r.icon} {r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>Valeur XP</label>
                <input type="number" value={form.reward_value} onChange={e => setForm({ ...form, reward_value: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={inputStyle} />
              </div>
            </div>

            <input type="text" placeholder="Détail de la récompense (ex: Appel de 30min avec Julia)" value={form.reward_detail} onChange={e => setForm({ ...form, reward_detail: e.target.value })}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={inputStyle} />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>Date de début</label>
                <input type="datetime-local" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>Date de fin</label>
                <input type="datetime-local" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={inputStyle} />
              </div>
            </div>

            <input type="number" placeholder="Nombre max de participants (optionnel)" value={form.max_participants} onChange={e => setForm({ ...form, max_participants: e.target.value })}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={inputStyle} />

            {/* ── PHASES SECTION ── */}
            <div className="rounded-xl p-4" style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.2)' }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-semibold" style={{ color: 'var(--gold)' }}>
                    Phases du défi
                  </h4>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Ajoutez autant de phases que nécessaire. Les participants progresseront phase par phase.
                  </p>
                </div>
                <button onClick={addPhase}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer transition-all"
                  style={{ background: 'rgba(212,175,55,0.15)', color: 'var(--gold)', border: '1px solid rgba(212,175,55,0.3)' }}>
                  + Ajouter une phase
                </button>
              </div>

              {form.phases.length === 0 ? (
                <div className="text-center py-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--dark-border)' }}>
                  <p className="text-2xl mb-1">📋</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Aucune phase ajoutée. Cliquez sur &quot;+ Ajouter une phase&quot; pour structurer votre défi.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {form.phases.map((phase, i) => (
                    <div key={i} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--dark-border)' }}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                          style={{ background: 'rgba(212,175,55,0.15)', color: 'var(--gold)' }}>
                          Phase {i + 1}
                        </span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => movePhase(i, 'up')} disabled={i === 0}
                            className="w-7 h-7 rounded-md text-[11px] cursor-pointer disabled:opacity-30 flex items-center justify-center"
                            style={{ color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)' }}
                            title="Monter">
                            ↑
                          </button>
                          <button onClick={() => movePhase(i, 'down')} disabled={i === form.phases.length - 1}
                            className="w-7 h-7 rounded-md text-[11px] cursor-pointer disabled:opacity-30 flex items-center justify-center"
                            style={{ color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)' }}
                            title="Descendre">
                            ↓
                          </button>
                          <button onClick={() => removePhase(i)}
                            className="w-7 h-7 rounded-md text-[11px] cursor-pointer flex items-center justify-center"
                            style={{ color: '#EF4444', background: 'rgba(239,68,68,0.1)' }}
                            title="Supprimer">
                            ✕
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <input type="text" placeholder={`Titre de la phase ${i + 1}`}
                          value={phase.title} onChange={e => updatePhase(i, 'title', e.target.value)}
                          className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} />
                        <textarea placeholder="Description de la phase (optionnel)"
                          value={phase.description} onChange={e => updatePhase(i, 'description', e.target.value)}
                          rows={2} className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-y" style={inputStyle} />
                        <input type="number" placeholder="Durée en jours (optionnel)"
                          value={phase.duration_days} onChange={e => updatePhase(i, 'duration_days', e.target.value)}
                          className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {form.phases.length > 0 && (
                <button onClick={addPhase}
                  className="mt-3 w-full py-2 rounded-lg text-[11px] font-medium cursor-pointer transition-all"
                  style={{ color: 'var(--gold)', border: '1px dashed rgba(212,175,55,0.3)', background: 'transparent' }}>
                  + Ajouter une autre phase
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving || !form.title.trim()}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-50"
                style={{ background: 'var(--gold)', color: 'var(--dark)' }}>
                {saving ? 'Enregistrement...' : editingId ? 'Mettre à jour' : 'Créer le défi'}
              </button>
              <button onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-xl text-sm cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Challenges list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : challenges.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
          <p className="text-4xl mb-4">🏆</p>
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Aucun défi créé</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Créez votre premier défi communautaire.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {challenges.map(ch => {
            const status = STATUS_CONFIG[ch.status] || STATUS_CONFIG.draft
            const reward = REWARD_TYPES.find(r => r.value === ch.reward_type) || REWARD_TYPES[0]
            const phaseCount = ch.phases?.length || 0
            const isExpanded = expandedPhases === ch.id
            return (
              <div key={ch.id} className="rounded-xl p-5" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-base truncate" style={{ color: 'var(--text-primary)' }}>{ch.title}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                        style={{ background: `${status.color}15`, color: status.color }}>
                        {status.label}
                      </span>
                      {phaseCount > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                          style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--gold)' }}>
                          {phaseCount} phase{phaseCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    {ch.description && (
                      <p className="text-sm line-clamp-2 mb-2" style={{ color: 'var(--text-secondary)' }}>{ch.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      <span>{reward.icon} {reward.label}: {ch.reward_value} XP</span>
                      <span>👥 {ch.participant_count || 0} participants</span>
                      {ch.start_date && <span>📅 {new Date(ch.start_date).toLocaleDateString('fr-FR')}</span>}
                      {ch.end_date && <span>→ {new Date(ch.end_date).toLocaleDateString('fr-FR')}</span>}
                      {ch.winner_id && <span style={{ color: '#D4AF37' }}>🏆 Vainqueur désigné</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {phaseCount > 0 && (
                      <button onClick={() => setExpandedPhases(isExpanded ? null : ch.id)}
                        className="px-3 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer"
                        style={{ color: 'var(--gold)', background: 'rgba(212,175,55,0.1)' }}>
                        {isExpanded ? 'Masquer phases' : 'Voir phases'}
                      </button>
                    )}
                    {ch.status === 'draft' && (
                      <button onClick={() => updateStatus(ch.id, 'active')}
                        className="px-3 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer"
                        style={{ background: 'rgba(85,239,196,0.1)', color: '#55EFC4' }}>
                        Activer
                      </button>
                    )}
                    {ch.status === 'active' && !ch.winner_id && (
                      <button onClick={() => selectWinner(ch.id)}
                        className="px-3 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer"
                        style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37' }}>
                        Désigner vainqueur
                      </button>
                    )}
                    <button onClick={() => openEdit(ch)}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer"
                      style={{ color: 'var(--text-secondary)' }}>
                      Modifier
                    </button>
                    <button onClick={() => deleteChallenge(ch.id)}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer"
                      style={{ color: '#EF4444' }}>
                      Supprimer
                    </button>
                  </div>
                </div>

                {/* Expanded phases view */}
                {isExpanded && ch.phases && ch.phases.length > 0 && (
                  <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--dark-border)' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-semibold" style={{ color: 'var(--gold)' }}>Phases du défi</span>
                    </div>
                    <div className="space-y-2">
                      {ch.phases.map((phase, i) => (
                        <div key={phase.id} className="flex items-start gap-3 rounded-lg p-3"
                          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5"
                            style={{ background: 'rgba(212,175,55,0.15)', color: 'var(--gold)' }}>
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{phase.title}</p>
                            {phase.description && (
                              <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{phase.description}</p>
                            )}
                          </div>
                          {phase.duration_days && (
                            <span className="text-[10px] flex-shrink-0 px-2 py-0.5 rounded-full"
                              style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                              {phase.duration_days}j
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
