'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function CreerVisioPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startTime, setStartTime] = useState('')
  const [maxParticipants, setMaxParticipants] = useState('')
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      // Vérifier le rôle
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      const p = profile as { role: string } | null
      if (p?.role !== 'founder' && p?.role !== 'admin_content') {
        router.push('/dashboard/visio')
        return
      }
      setUserId(user.id)
    }
    init()
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !startTime || !userId || saving) return

    setSaving(true)
    const supabase = createClient()

    // La salle signaling_rooms sera créée quand l'hôte lancera la session
    await supabase.from('group_events').insert({
      host_id: userId,
      title: title.trim(),
      description: description.trim() || null,
      start_time: new Date(startTime).toISOString(),
      status: 'scheduled',
      max_participants: maxParticipants ? parseInt(maxParticipants) : null,
    })

    router.push('/dashboard/visio')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Créer une session de groupe
        </h1>
        <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
          Planifiez une visio accessible à toute la communauté.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-2xl p-6 space-y-5"
          style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>

          {/* Titre */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Titre de la session *
            </label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex : Cercle de parole du lundi"
              maxLength={200} required
              className="w-full px-4 py-3 rounded-xl text-sm bg-transparent outline-none"
              style={{ color: 'var(--text-primary)', border: '1px solid var(--dark-border)' }} />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Description
            </label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez le contenu de la session..."
              rows={3} maxLength={1000}
              className="w-full px-4 py-3 rounded-xl text-sm bg-transparent outline-none resize-none"
              style={{ color: 'var(--text-primary)', border: '1px solid var(--dark-border)' }} />
          </div>

          {/* Date et heure */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Date et heure *
            </label>
            <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl text-sm bg-transparent outline-none"
              style={{ color: 'var(--text-primary)', border: '1px solid var(--dark-border)', colorScheme: 'dark' }} />
          </div>

          {/* Max participants */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Nombre max de participants (optionnel)
            </label>
            <input type="number" value={maxParticipants} onChange={(e) => setMaxParticipants(e.target.value)}
              placeholder="Laisser vide = illimité" min={2} max={100}
              className="w-full px-4 py-3 rounded-xl text-sm bg-transparent outline-none"
              style={{ color: 'var(--text-primary)', border: '1px solid var(--dark-border)' }} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => router.push('/dashboard/visio')}
            className="px-6 py-3 rounded-xl text-sm font-medium cursor-pointer"
            style={{ color: 'var(--text-secondary)', border: '1px solid var(--dark-border)' }}>
            Annuler
          </button>
          <button type="submit" disabled={!title.trim() || !startTime || saving}
            className="px-6 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'var(--gold)', color: 'var(--dark)' }}>
            {saving ? 'Création...' : 'Créer la session'}
          </button>
        </div>
      </form>
    </div>
  )
}
