'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function CreerVisioPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [eventType, setEventType] = useState<'audio' | 'video'>('video')
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
      event_type: eventType,
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
          Planifiez une conférence audio ou vidéo accessible à toute la communauté.
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

          {/* Type de session */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Type de session *
            </label>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setEventType('audio')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer"
                style={{
                  background: eventType === 'audio' ? 'rgba(212,175,55,0.15)' : 'transparent',
                  color: eventType === 'audio' ? 'var(--gold)' : 'var(--text-secondary)',
                  border: eventType === 'audio' ? '2px solid var(--gold)' : '1px solid var(--dark-border)',
                }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                Conférence audio
              </button>
              <button type="button" onClick={() => setEventType('video')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer"
                style={{
                  background: eventType === 'video' ? 'rgba(212,175,55,0.15)' : 'transparent',
                  color: eventType === 'video' ? 'var(--gold)' : 'var(--text-secondary)',
                  border: eventType === 'video' ? '2px solid var(--gold)' : '1px solid var(--dark-border)',
                }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
                Visioconférence
              </button>
            </div>
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
