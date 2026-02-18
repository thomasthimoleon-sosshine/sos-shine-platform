'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ConferenceRoom from '@/components/ConferenceRoom'
import type { GroupEvent, Profile } from '@/types/database'

type GroupEventWithHost = GroupEvent & {
  profiles: Pick<Profile, 'prenom' | 'pseudo' | 'avatar_url' | 'role'>
}

export default function VisioPage() {
  const router = useRouter()
  const [events, setEvents] = useState<GroupEventWithHost[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState<string>('member')
  const [activeRoom, setActiveRoom] = useState<{ roomId: string; callType: 'audio' | 'video' } | null>(null)

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data: profile } = await supabase.from('profiles').select('prenom, pseudo, role').eq('id', user.id).single()
      const p = profile as { prenom: string; pseudo: string | null; role: string } | null
      setUserName(p?.pseudo || p?.prenom || 'Membre')
      setUserRole(p?.role || 'member')

      await loadEvents()
    }
    init()
  }, [router])

  async function loadEvents() {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('group_events')
      .select('*, profiles(prenom, pseudo, avatar_url, role)')
      .in('status', ['scheduled', 'live'])
      .order('start_time', { ascending: true })

    if (data) setEvents(data as unknown as GroupEventWithHost[])
    setLoading(false)
  }

  async function joinRoom(event: GroupEventWithHost) {
    const supabase = createClient()
    const callType = event.event_type || 'video'

    // Si la salle n'existe pas encore, la créer (quand l'hôte lance)
    let roomId = event.room_id
    if (!roomId && event.host_id === userId) {
      const { data: room } = await supabase.from('signaling_rooms').insert({
        created_by: userId!,
        room_type: 'group',
        call_type: callType,
        status: 'active',
      }).select('id').single()

      if (room) {
        roomId = (room as { id: string }).id
        await supabase.from('group_events').update({ room_id: roomId, status: 'live' }).eq('id', event.id)
      }
    }

    if (!roomId) return

    if (event.host_id === userId && event.status === 'scheduled') {
      await supabase.from('group_events').update({ status: 'live' }).eq('id', event.id)
    }

    setActiveRoom({ roomId, callType })
  }

  const leaveRoom = useCallback(async () => {
    setActiveRoom(null)
    await loadEvents()
  }, [])

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  function getStatusLabel(status: string) {
    if (status === 'live') return { label: 'En direct', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' }
    return { label: 'Planifié', color: 'var(--gold)', bg: 'rgba(212,175,55,0.12)' }
  }

  // Vue active : on est dans une salle
  if (activeRoom && userId) {
    return (
      <div className="h-[calc(100vh-8rem)]">
        <ConferenceRoom
          roomId={activeRoom.roomId}
          userId={userId}
          userName={userName}
          userRole={userRole}
          callType={activeRoom.callType}
          onLeave={leaveRoom}
        />
      </div>
    )
  }

  // Vue liste
  const canCreate = userRole === 'founder' || userRole === 'admin_content'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Conférences de groupe
          </h1>
          <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
            Rejoignez les sessions audio ou vidéo en direct ou planifiées.
          </p>
        </div>
        {canCreate && (
          <button onClick={() => router.push('/dashboard/visio/creer')}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all hover:opacity-90"
            style={{ background: 'var(--gold)', color: 'var(--dark)' }}>
            Créer une session
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(212,175,55,0.08)' }}>
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} style={{ color: 'var(--gold)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>
          <h3 className="font-display text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Aucune session prévue
          </h3>
          <p className="text-sm max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Les sessions de visio de groupe apparaîtront ici une fois planifiées.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const hostName = event.profiles?.pseudo || event.profiles?.prenom || 'Membre'
            const s = getStatusLabel(event.status)
            const isHost = event.host_id === userId
            return (
              <div key={event.id} className="rounded-2xl p-5 transition-all"
                style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: s.bg, color: s.color }}>
                        {s.label}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)' }}>
                        {event.event_type === 'audio' ? 'Audio' : 'Vidéo'}
                      </span>
                      {isHost && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(212,175,55,0.12)', color: 'var(--gold)' }}>
                          Vous êtes l&apos;hôte
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-lg font-semibold mb-1 truncate" style={{ color: 'var(--text-primary)' }}>
                      {event.title}
                    </h3>
                    {event.description && (
                      <p className="text-sm mb-2 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{event.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <span>{formatDate(event.start_time)}</span>
                      <span>Hôte : {hostName}</span>
                      {event.max_participants && <span>Max {event.max_participants} participants</span>}
                    </div>
                  </div>

                  <button onClick={() => joinRoom(event)}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold flex-shrink-0 cursor-pointer transition-all hover:opacity-90"
                    style={{
                      background: event.status === 'live' ? 'rgba(34,197,94,0.15)' : 'rgba(212,175,55,0.15)',
                      color: event.status === 'live' ? '#22c55e' : 'var(--gold)',
                    }}>
                    {event.status === 'live' ? 'Rejoindre' : isHost ? 'Lancer' : 'Rejoindre'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
