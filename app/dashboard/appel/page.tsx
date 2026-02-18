'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import JitsiVideoRoom from '@/components/JitsiVideoRoom'

export default function AppelPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const callId = searchParams.get('id')
  const [roomName, setRoomName] = useState<string | null>(null)
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const endedRef = useRef(false)

  useEffect(() => {
    async function init() {
      if (!callId) { setError('Aucun appel spécifié'); setLoading(false); return }

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      // Charger le profil utilisateur
      const { data: profile } = await supabase.from('profiles').select('prenom, pseudo').eq('id', user.id).single()
      const p = profile as { prenom: string; pseudo: string | null } | null
      setUserName(p?.pseudo || p?.prenom || 'Membre')

      // Charger l'appel
      const { data: call } = await supabase
        .from('active_calls')
        .select('*')
        .eq('id', callId)
        .single()

      if (!call) { setError("Appel introuvable"); setLoading(false); return }

      const c = call as { caller_id: string; receiver_id: string; status: string; jitsi_room_id: string }

      // Vérifier que l'utilisateur participe à cet appel
      if (c.caller_id !== user.id && c.receiver_id !== user.id) {
        setError("Vous ne participez pas à cet appel")
        setLoading(false)
        return
      }

      if (c.status === 'ended' || c.status === 'rejected') {
        setError("Cet appel est terminé")
        setLoading(false)
        return
      }

      setRoomName(c.jitsi_room_id)
      setLoading(false)
    }
    init()
  }, [callId, router])

  const handleCallEnd = useCallback(async () => {
    if (endedRef.current || !callId) return
    endedRef.current = true

    const supabase = createClient()
    await supabase
      .from('active_calls')
      .update({ status: 'ended' })
      .eq('id', callId)

    router.push('/dashboard/messages')
  }, [callId, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Connexion à l&apos;appel...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(239,68,68,0.1)' }}>
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: '#ef4444' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 3.75L18 6m0 0l2.25 2.25M18 6l2.25-2.25M18 6l-2.25 2.25m1.5 13.5c-8.284 0-15-6.716-15-15V4.5A2.25 2.25 0 016.75 2.25H9a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75H6.108a9.747 9.747 0 006.47 6.47V12a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v2.25a2.25 2.25 0 01-2.25 2.25h-.372" />
            </svg>
          </div>
          <h2 className="font-display text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{error}</h2>
          <button onClick={() => router.push('/dashboard/messages')}
            className="mt-4 px-6 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
            style={{ background: 'var(--gold)', color: 'var(--dark)' }}>
            Retour aux messages
          </button>
        </div>
      </div>
    )
  }

  if (!roomName) return null

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Appel vidéo en cours
        </h1>
        <button onClick={handleCallEnd}
          className="px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all hover:opacity-80"
          style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
          Raccrocher
        </button>
      </div>
      <div className="flex-1 min-h-0">
        <JitsiVideoRoom roomName={roomName} userName={userName} onCallEnd={handleCallEnd} />
      </div>
    </div>
  )
}
