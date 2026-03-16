'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type ProfileData = {
  id: string
  prenom: string
  pseudo: string | null
  bio: string | null
  avatar_url: string | null
  role: string
}

type Props = {
  userId: string
  onClose: () => void
}

export default function ProfileDrawer({ userId, onClose }: Props) {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending_sent' | 'pending_received' | 'connected'>('none')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [sendingRayon, setSendingRayon] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setCurrentUserId(user.id)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, prenom, pseudo, bio, avatar_url, role')
        .eq('id', userId)
        .single()
      if (profileData) setProfile(profileData)

      if (user.id === userId) { setLoading(false); return }

      // Check connection status
      const { data: connections } = await supabase
        .from('shine_connections')
        .select('sender_id, receiver_id, status')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`)

      if (connections && connections.length > 0) {
        const conn = connections[0]
        if (conn.status === 'accepted') {
          setConnectionStatus('connected')
        } else if (conn.sender_id === user.id) {
          setConnectionStatus('pending_sent')
        } else {
          setConnectionStatus('pending_received')
        }
      }
      setLoading(false)
    }
    load()
  }, [userId])

  async function sendRayonRequest() {
    if (!currentUserId || sendingRayon || currentUserId === userId) return
    setSendingRayon(true)
    const supabase = createClient()
    const { error } = await supabase.from('shine_connections').insert({
      sender_id: currentUserId,
      receiver_id: userId,
      status: 'pending',
    })
    if (!error) {
      setConnectionStatus('pending_sent')
      setToast('Demande de Rayon envoyée !')
      setTimeout(() => setToast(null), 3000)
    }
    setSendingRayon(false)
  }

  const displayName = profile?.pseudo || profile?.prenom || 'Membre'
  const isSelf = currentUserId === userId

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] transition-opacity"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Panel - Bottom sheet on mobile, side panel on desktop */}
      <div
        className="fixed z-[61] bottom-0 inset-x-0 max-h-[75vh] rounded-t-2xl lg:inset-x-auto lg:top-0 lg:right-0 lg:bottom-0 lg:w-[380px] lg:max-h-full lg:rounded-none lg:rounded-l-2xl overflow-y-auto"
        style={{ background: 'var(--dark-card)', borderTop: '1px solid var(--dark-border)', borderLeft: '1px solid var(--dark-border)' }}
      >
        {/* Toast */}
        {toast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: 'var(--gold)', color: 'var(--dark)' }}>
            {toast}
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center p-4" style={{ borderBottom: '1px solid var(--dark-border)' }}>
          <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Profil</span>
          <button onClick={onClose} className="p-2 rounded-lg cursor-pointer" style={{ color: 'var(--text-muted)' }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : profile ? (
          <div className="p-6 text-center">
            {/* Avatar */}
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={displayName}
                className="w-24 h-24 rounded-2xl object-cover mx-auto mb-4 ring-2 ring-[var(--gold)]/20" />
            ) : (
              <div className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl font-display font-semibold"
                style={{ background: 'rgba(212,175,55,0.12)', color: 'var(--gold)' }}>
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Name */}
            <h2 className="font-display text-xl font-semibold"
              style={{ color: profile.role === 'founder' ? 'var(--gold)' : 'var(--text-primary)' }}>
              {displayName}
            </h2>

            {/* Bio */}
            {profile.bio && (
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {profile.bio}
              </p>
            )}

            {/* Connection badge */}
            {connectionStatus === 'connected' && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                style={{ background: 'rgba(85,239,196,0.1)', color: '#55EFC4', border: '1px solid rgba(85,239,196,0.2)' }}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
                Rayon connecté
              </div>
            )}

            {/* Actions */}
            {!isSelf && (
              <div className="mt-6 space-y-3">
                {connectionStatus === 'none' && (
                  <button
                    onClick={sendRayonRequest}
                    disabled={sendingRayon}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, var(--gold), #B8960F)', color: '#050505' }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                    </svg>
                    {sendingRayon ? 'Envoi...' : 'Envoyer un Rayon'}
                  </button>
                )}

                {connectionStatus === 'pending_sent' && (
                  <div className="w-full px-5 py-3 rounded-xl text-sm font-medium text-center"
                    style={{ background: 'rgba(212,175,55,0.08)', color: 'var(--gold)', border: '1px solid rgba(212,175,55,0.15)' }}>
                    Demande de Rayon envoyée
                  </div>
                )}

                <Link
                  href={`/dashboard/messages/${userId}`}
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid var(--dark-border)' }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  Message
                </Link>

                <Link
                  href={`/dashboard/membre/${userId}`}
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-medium transition-all"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Voir le profil complet
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 text-center">
            <p style={{ color: 'var(--text-muted)' }}>Profil introuvable</p>
          </div>
        )}
      </div>
    </>
  )
}
