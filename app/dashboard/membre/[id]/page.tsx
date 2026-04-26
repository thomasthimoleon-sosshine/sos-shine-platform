'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'
import AudioPlayer from '@/components/AudioPlayer'

type EclatPost = {
  id: string
  title: string
  content: string
  image_url: string | null
  video_url: string | null
  audio_url: string | null
  category: string
  created_at: string
  post_likes: { count: number }[]
  post_comments: { count: number }[]
}

const ECLAT_CATEGORIES: Record<string, { label: string; icon: string; color: string }> = {
  temoignage: { label: 'Pensée', icon: '💭', color: '#D4AF37' },
  partage: { label: 'Partage', icon: '💫', color: '#74C0FC' },
  gratitude: { label: 'Gratitude', icon: '✨', color: '#FFEAA7' },
  citation: { label: 'Citation', icon: '💬', color: '#FD79A8' },
  remerciements: { label: 'Moment de joie', icon: '🌟', color: '#55EFC4' },
  question: { label: 'Réflexion', icon: '🔮', color: '#A29BFE' },
}

export default function MembreProfilPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [eclatPosts, setEclatPosts] = useState<EclatPost[]>([])
  const [eclatLoading, setEclatLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending_sent' | 'pending_received' | 'accepted'>('none')
  const [connectionId, setConnectionId] = useState<string | null>(null)
  const [rayonLoading, setRayonLoading] = useState(false)
  const [rayonError, setRayonError] = useState<string | null>(null)
  const [rayonSuccess, setRayonSuccess] = useState<string | null>(null)

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

      // Vérifier le statut de connexion (rayon) — avant de charger les posts
      let isRayon = false
      const { data: connData, error: connError } = await supabase
        .from('shine_connections')
        .select('id, sender_id, receiver_id, status')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${id}),and(sender_id.eq.${id},receiver_id.eq.${user.id})`)
        .maybeSingle()

      if (connData && !connError) {
        if (connData.status === 'accepted') {
          setConnectionId(connData.id)
          setConnectionStatus('accepted')
          isRayon = true
        } else if (connData.status === 'pending') {
          setConnectionId(connData.id)
          setConnectionStatus(connData.sender_id === user.id ? 'pending_sent' : 'pending_received')
        }
        // Si 'declined', on ne set pas connectionId ni connectionStatus
        // pour permettre un nouvel envoi propre
      }

      // Load member's Éclat posts
      let postsQuery = supabase
        .from('posts')
        .select('id, title, content, image_url, video_url, audio_url, category, visibility, created_at')
        .eq('author_id', id)
        .eq('post_type', 'eclat')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(20)

      // Si pas un Rayon, ne montrer que les posts publics
      if (!isRayon) {
        postsQuery = postsQuery.eq('visibility', 'public')
      }

      const { data: posts } = await postsQuery

      if (posts && posts.length > 0) {
        const postIds = posts.map(p => p.id)

        const { data: likeData } = await supabase
          .from('post_likes').select('post_id').in('post_id', postIds)
        const likeCountMap = new Map<string, number>()
        for (const l of (likeData || []) as { post_id: string }[]) {
          likeCountMap.set(l.post_id, (likeCountMap.get(l.post_id) || 0) + 1)
        }

        const { data: commentData } = await supabase
          .from('post_comments').select('post_id').in('post_id', postIds)
        const commentCountMap = new Map<string, number>()
        for (const c of (commentData || []) as { post_id: string }[]) {
          commentCountMap.set(c.post_id, (commentCountMap.get(c.post_id) || 0) + 1)
        }

        setEclatPosts(posts.map(p => ({
          ...p,
          post_likes: [{ count: likeCountMap.get(p.id) || 0 }],
          post_comments: [{ count: commentCountMap.get(p.id) || 0 }],
        })))
      }
      setEclatLoading(false)
    }
    load()
  }, [id, router])

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  function getRoleLabel(role: string) {
    const map: Record<string, { label: string; color: string }> = {
      founder: { label: 'Fondateur', color: 'var(--brand)' },
      admin_content: { label: 'Admin Contenu', color: '#74C0FC' },
      admin_support: { label: 'Admin Support', color: '#74C0FC' },
      member: { label: 'Membre', color: 'var(--text-secondary)' },
    }
    return map[role] || map.member
  }

  async function handleSendRayon() {
    setRayonLoading(true)
    setRayonError(null)
    setRayonSuccess(null)
    try {
      const res = await fetch('/api/rayons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiver_id: id }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.connection) {
        setConnectionStatus('pending_sent')
        setConnectionId(data.connection.id)
        setRayonSuccess(`Rayon envoyé à ${profile?.pseudo || profile?.prenom || 'ce membre'} !`)
      } else if (res.status === 409) {
        // Connexion déjà existante — resynchroniser le statut
        setRayonError('Une demande de connexion existe déjà avec ce membre.')
        if (data.status === 'pending') {
          setConnectionStatus('pending_sent')
        } else if (data.status === 'accepted') {
          setConnectionStatus('accepted')
        }
      } else if (res.status === 401) {
        setRayonError('Session expirée. Veuillez rafraîchir la page et réessayer.')
      } else {
        setRayonError(data.error || 'Une erreur est survenue. Veuillez réessayer.')
      }
    } catch {
      setRayonError('Erreur de connexion. Vérifiez votre réseau et réessayez.')
    }
    setRayonLoading(false)
  }

  async function handleCancelRayon() {
    if (!connectionId) return
    setRayonLoading(true)
    setRayonError(null)
    setRayonSuccess(null)
    try {
      const res = await fetch('/api/rayons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connection_id: connectionId, action: 'cancel' }),
      })
      if (res.ok) {
        setConnectionStatus('none')
        setConnectionId(null)
      } else {
        setRayonError('Impossible d\'annuler le rayon. Veuillez réessayer.')
      }
    } catch {
      setRayonError('Erreur de connexion. Vérifiez votre réseau.')
    }
    setRayonLoading(false)
  }

  async function handleAcceptRayon() {
    if (!connectionId) return
    setRayonLoading(true)
    setRayonError(null)
    setRayonSuccess(null)
    try {
      const res = await fetch('/api/rayons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connection_id: connectionId, action: 'accept' }),
      })
      if (res.ok) {
        setConnectionStatus('accepted')
        setRayonSuccess('Rayon accepté ! Vous êtes maintenant connectés.')
      } else {
        setRayonError('Impossible d\'accepter le rayon. Veuillez réessayer.')
      }
    } catch {
      setRayonError('Erreur de connexion. Vérifiez votre réseau.')
    }
    setRayonLoading(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
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
        <Link href="/dashboard" className="px-5 py-2.5 rounded-xl text-sm font-medium" style={{ background: 'var(--brand)', color: 'var(--dark)' }}>
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
      <div className="rounded-2xl p-6 sm:p-8 text-center" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
        {/* Avatar */}
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt={displayName} className="w-24 h-24 rounded-2xl object-cover mx-auto mb-5" />
        ) : (
          <div className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-5 text-4xl font-display font-semibold"
            style={{ background: 'rgba(212,175,55,0.12)', color: 'var(--brand)' }}>
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

        {/* Action buttons */}
        {currentUserId && currentUserId !== id && (
          <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
            {/* Bouton Rayon */}
            {connectionStatus === 'none' && (
              <button
                type="button"
                onClick={handleSendRayon}
                disabled={rayonLoading}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-deep))', color: 'var(--dark)' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
                {rayonLoading ? '...' : 'Envoyer un Rayon'}
              </button>
            )}
            {connectionStatus === 'pending_sent' && (
              <button
                type="button"
                onClick={handleCancelRayon}
                disabled={rayonLoading}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer"
                style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--brand)', border: '1px solid rgba(212,175,55,0.2)' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {rayonLoading ? '...' : 'Rayon envoyé'}
              </button>
            )}
            {connectionStatus === 'pending_received' && (
              <button
                type="button"
                onClick={handleAcceptRayon}
                disabled={rayonLoading}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-deep))', color: 'var(--dark)' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
                {rayonLoading ? '...' : 'Accepter le Rayon'}
              </button>
            )}
            {connectionStatus === 'accepted' && (
              <span className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium"
                style={{ background: 'rgba(85,239,196,0.1)', color: '#55EFC4', border: '1px solid rgba(85,239,196,0.2)' }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
                Rayon connect&eacute;
              </span>
            )}

            {/* Feedback Rayon */}
            {rayonSuccess && (
              <p className="w-full text-center text-sm font-semibold px-4 py-3 rounded-xl" style={{ background: 'rgba(85,239,196,0.15)', color: '#55EFC4', border: '1px solid rgba(85,239,196,0.3)' }}>
                {rayonSuccess}
              </p>
            )}
            {rayonError && (
              <p className="w-full text-center text-sm font-semibold px-4 py-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                {rayonError}
              </p>
            )}

            {/* Bouton Message */}
            <Link href={`/dashboard/messages/${id}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{ background: connectionStatus === 'none' ? 'var(--brand)' : 'rgba(255,255,255,0.05)', color: connectionStatus === 'none' ? 'var(--dark)' : 'var(--text-primary)', border: connectionStatus === 'none' ? 'none' : '1px solid var(--border)' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              Message
            </Link>
          </div>
        )}
      </div>

      {/* Bio */}
      {profile.bio && (
        <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
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
        <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
            Vidéo de présentation
          </h3>
          <video src={profile.video_url} controls className="w-full rounded-xl bg-black max-h-96" />
        </div>
      )}

      {/* Éclat — Personal Wall */}
      <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
        <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--brand)' }}>
          <span className="text-xl">✨</span>
          Éclat de {displayName}
        </h3>

        {eclatLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : eclatPosts.length === 0 ? (
          <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>
            Ce membre n&apos;a pas encore publié sur son Éclat.
          </p>
        ) : (
          <div className="space-y-4">
            {eclatPosts.map(post => {
              const cat = ECLAT_CATEGORIES[post.category] || ECLAT_CATEGORIES.partage
              return (
                <div key={post.id} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm">{cat.icon}</span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: `${cat.color}15`, color: cat.color }}>
                      {cat.label}
                    </span>
                    <span className="text-[10px] ml-auto" style={{ color: 'var(--text-muted)' }}>
                      {new Date(post.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                    </span>
                  </div>

                  {post.title && post.title !== cat.label && (
                    <h4 className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{post.title}</h4>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-line"
                    style={{ color: post.category === 'citation' ? 'var(--brand)' : 'var(--text-secondary)', fontStyle: post.category === 'citation' ? 'italic' : 'normal' }}>
                    {post.content}
                  </p>

                  {post.image_url && (
                    <div className="mt-3 rounded-lg overflow-hidden">
                      <img src={post.image_url} alt="" className="w-full" />
                    </div>
                  )}
                  {post.video_url && (
                    <div className="mt-3 rounded-lg overflow-hidden">
                      <video src={post.video_url} controls className="w-full" />
                    </div>
                  )}
                  {post.audio_url && (
                    <div className="mt-3">
                      <AudioPlayer src={post.audio_url} />
                    </div>
                  )}

                  <div className="flex items-center gap-3 mt-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    <span className="flex items-center gap-1" style={{ color: '#D4AF37' }}>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                      </svg>
                      {post.post_likes[0].count}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                      </svg>
                      {post.post_comments[0].count}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
