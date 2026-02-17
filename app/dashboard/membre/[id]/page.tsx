'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'

export default function MembreProfilPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setCurrentUserId(user.id)

      // Si l'utilisateur visite son propre profil → rediriger
      if (user.id === id) { router.push('/dashboard/profil'); return }

      const { data } = await supabase.from('profiles').select('*').eq('id', id).single()
      if (data) setProfile(data as Profile)
      setLoading(false)
    }
    load()
  }, [id, router])

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  function getRoleLabel(role: string) {
    const map: Record<string, { label: string; color: string }> = {
      founder: { label: 'Fondateur', color: 'var(--gold)' },
      admin_content: { label: 'Admin Contenu', color: '#74C0FC' },
      admin_support: { label: 'Admin Support', color: '#74C0FC' },
      member: { label: 'Membre', color: 'var(--text-secondary)' },
    }
    return map[role] || map.member
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl" style={{ background: 'rgba(255,107,107,0.1)' }}>
          ?
        </div>
        <h2 className="font-display text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Membre introuvable</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Ce profil n&apos;existe pas ou a été supprimé.</p>
        <Link href="/dashboard" className="px-5 py-2.5 rounded-xl text-sm font-medium" style={{ background: 'var(--gold)', color: 'var(--dark)' }}>
          Retour à l&apos;accueil
        </Link>
      </div>
    )
  }

  const roleInfo = getRoleLabel(profile.role)
  const displayName = profile.pseudo || profile.prenom

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--text-muted)' }}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Retour
      </button>

      {/* Profile card */}
      <div className="rounded-2xl p-6 sm:p-8 text-center" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
        {/* Avatar */}
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt={displayName} className="w-24 h-24 rounded-2xl object-cover mx-auto mb-5" />
        ) : (
          <div className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-5 text-4xl font-display font-semibold"
            style={{ background: 'rgba(212,175,55,0.12)', color: 'var(--gold)' }}>
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Name + role */}
        <h1 className="font-display text-2xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
          {displayName}
        </h1>
        {profile.pseudo && profile.prenom !== profile.pseudo && (
          <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>{profile.prenom}</p>
        )}
        <span className="inline-block text-xs font-medium px-3 py-1 rounded-full mb-4"
          style={{ background: `${roleInfo.color}15`, color: roleInfo.color }}>
          {roleInfo.label}
        </span>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Membre depuis {formatDate(profile.created_at)}
        </p>

        {/* Message button */}
        {currentUserId && currentUserId !== id && (
          <Link href={`/dashboard/messages/${id}`}
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl text-sm font-semibold transition-all"
            style={{ background: 'var(--gold)', color: 'var(--dark)' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            Envoyer un message
          </Link>
        )}
      </div>

      {/* Bio */}
      {profile.bio && (
        <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
            À propos
          </h3>
          <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>{profile.bio}</p>
        </div>
      )}

      {/* Video */}
      {profile.video_url && (
        <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
            Vidéo de présentation
          </h3>
          <video src={profile.video_url} controls className="w-full rounded-xl bg-black max-h-96" />
        </div>
      )}
    </div>
  )
}
