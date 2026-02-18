'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ActiveCall } from '@/types/database'

export type IncomingCall = ActiveCall & {
  callerName: string
  callerAvatar: string | null
}

export function useCallNotification(userId: string | null) {
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null)
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)

  useEffect(() => {
    if (!userId) return

    const supabase = createClient()

    // Écouter les insertions en temps réel sur active_calls
    const channel = supabase
      .channel('incoming-calls')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'active_calls',
          filter: `receiver_id=eq.${userId}`,
        },
        async (payload) => {
          const call = payload.new as ActiveCall
          if (call.status !== 'ringing') return

          // Charger le profil de l'appelant
          const { data: profile } = await supabase
            .from('profiles')
            .select('prenom, pseudo, avatar_url')
            .eq('id', call.caller_id)
            .single()

          const p = profile as { prenom: string; pseudo: string | null; avatar_url: string | null } | null

          setIncomingCall({
            ...call,
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
          table: 'active_calls',
          filter: `receiver_id=eq.${userId}`,
        },
        (payload) => {
          const call = payload.new as ActiveCall
          // Si l'appel est annulé/terminé côté appelant, on ferme la modale
          if (call.status === 'ended' || call.status === 'rejected') {
            setIncomingCall((prev) => (prev?.id === call.id ? null : prev))
          }
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const acceptCall = useCallback(async (callId: string) => {
    const supabase = createClient()
    await supabase
      .from('active_calls')
      .update({ status: 'accepted' })
      .eq('id', callId)
    const call = incomingCall
    setIncomingCall(null)
    return call
  }, [incomingCall])

  const rejectCall = useCallback(async (callId: string) => {
    const supabase = createClient()
    await supabase
      .from('active_calls')
      .update({ status: 'rejected' })
      .eq('id', callId)
    setIncomingCall(null)
  }, [])

  const dismiss = useCallback(() => {
    setIncomingCall(null)
  }, [])

  return { incomingCall, acceptCall, rejectCall, dismiss }
}
