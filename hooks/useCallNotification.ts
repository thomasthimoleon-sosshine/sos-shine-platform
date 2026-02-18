'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { SignalingRoom } from '@/types/database'

export type IncomingCall = SignalingRoom & {
  callerName: string
  callerAvatar: string | null
}

export function useCallNotification(userId: string | null) {
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null)
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)

  useEffect(() => {
    if (!userId) return

    const supabase = createClient()

    const channel = supabase
      .channel('incoming-calls')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'signaling_rooms',
          filter: `target_user_id=eq.${userId}`,
        },
        async (payload) => {
          const room = payload.new as SignalingRoom
          if (room.status !== 'waiting' || room.room_type !== 'one_to_one') return

          // Charger le profil de l'appelant
          const { data: profile } = await supabase
            .from('profiles')
            .select('prenom, pseudo, avatar_url')
            .eq('id', room.created_by)
            .single()

          const p = profile as { prenom: string; pseudo: string | null; avatar_url: string | null } | null

          setIncomingCall({
            ...room,
            callerName: p?.pseudo || p?.prenom || 'Membre',
            callerAvatar: p?.avatar_url || null,
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'signaling_rooms',
          filter: `target_user_id=eq.${userId}`,
        },
        (payload) => {
          const room = payload.new as SignalingRoom
          if (room.status === 'ended' || room.status === 'rejected') {
            setIncomingCall(prev => prev?.id === room.id ? null : prev)
          }
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const acceptCall = useCallback(async (roomId: string) => {
    const supabase = createClient()
    await supabase
      .from('signaling_rooms')
      .update({ status: 'active' })
      .eq('id', roomId)
    const call = incomingCall
    setIncomingCall(null)
    return call
  }, [incomingCall])

  const rejectCall = useCallback(async (roomId: string) => {
    const supabase = createClient()
    await supabase
      .from('signaling_rooms')
      .update({ status: 'rejected' })
      .eq('id', roomId)
    setIncomingCall(null)
  }, [])

  const dismiss = useCallback(() => {
    setIncomingCall(null)
  }, [])

  return { incomingCall, acceptCall, rejectCall, dismiss }
}
