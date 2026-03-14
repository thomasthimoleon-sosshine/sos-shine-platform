'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Challenge, ChallengeRewardType, ChallengeStatus } from '@/types/database'

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

type ChallengeForm = {
  title: string
  description: string
  reward_type: string
  reward_value: number
  reward_detail: string
  start_date: string
  end_date: string
  max_participants: string
}

const emptyForm: ChallengeForm = {
  title: '', description: '', reward_type: 'xp', reward_value: 100,
  reward_detail: '', start_date: '', end_date: '', max_participants: '',
}

export default function AdminDefisPage() {
  const [challenges, setChallenges] = useState<(Challenge & { participant_count?: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ChallengeForm>(emptyForm)
  const [saving, setSaving] = useState(false)

  async function loadChallenges() {
    const supabase = createClient()
    const { data } = await supabase
      .from('challenges')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) {
      const withCounts = []
      for (const ch of data as Challenge[]) {
        const { count } = await supabase
          .from('challenge_participations')
          .select('*', { count: 'exact', head: true })
          .eq('challenge_id', ch.id)
        withCounts.push({ ...ch, participant_count: count || 0 })
      }
      setChallenges(withCounts)
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
    const last = challenges[0] // Already sorted by created_at desc
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
    })
    setShowForm(true)
  }

  function openEdit(ch: Challenge) {
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
    })
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.title.trim() || saving) return
    setSaving(true)
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

    if (editingId) {
      await supabase.from('challenges').update(payload).eq('id', editingId)
    } else {
      await supabase.from('challenges').insert({ ...payload, created_by: user?.id ?? null, status: 'draft' as ChallengeStatus, winner_id: null })
    }

    setShowForm(false)
    setSaving(false)
    await loadChallenges()
  }

  async function updateStatus(id: string, status: ChallengeStatus) {
    const supabase = createClient()
    await supabase.from('challenges').update({ status }).eq('id', id)
    await loadChallenges()
  }

  async function selectWinner(challengeId: string) {
    const supabase = createClient()
    // Get first completed participant
    const { data } = await supabase
      .from('challenge_participations')
      .select('user_id')
      .eq('challenge_id', challengeId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: true })
      .limit(1)
      .single()

    if (data) {
      await supabase.from('challenges').update({ winner_id: data.user_id, status: 'completed' as ChallengeStatus }).eq('id', challengeId)

      // Create pinned post announcement
      const challenge = challenges.find(c => c.id === challengeId)
      const { data: { user } } = await supabase.auth.getUser()

      if (challenge) {
        const { data: post } = await supabase.from('posts').insert({
          author_id: user!.id,
          title: `Défi "${challenge.title}" — Vainqueur !`,
          content: `Félicitations au vainqueur du défi "${challenge.title}" ! Bravo pour votre engagement et votre persévérance.`,
          post_type: 'announcement',
          category: 'remerciements',
          media_type: 'text',
          visibility: 'public',
          is_published: true,
        } as never).select('id').single()

        if (post) {
          await supabase.from('pinned_posts').insert({
            post_id: (post as { id: string }).id,
            challenge_id: challengeId,
            pinned_by: user?.id ?? null,
            pin_type: 'winner' as const,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          })
        }
      }

      await loadChallenges()
    }
  }

  async function deleteChallenge(id: string) {
    if (!confirm('Supprimer ce défi ?')) return
    const supabase = createClient()
    await supabase.from('challenges').delete().eq('id', id)
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
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
