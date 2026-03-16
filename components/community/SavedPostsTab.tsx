'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import AudioPlayer from '@/components/AudioPlayer'

type SavedPost = {
  id: string
  post_id: string
  category: string
  created_at: string
  post: {
    id: string
    title: string
    content: string
    image_url: string | null
    video_url: string | null
    audio_url: string | null
    media_type: string
    category: string
    created_at: string
    author_prenom: string
    author_avatar: string | null
  }
}

type FilterType = 'all' | 'video' | 'text' | 'audio' | 'watch_later'

const FILTERS: { id: FilterType; label: string; icon: string }[] = [
  { id: 'all', label: 'Tous', icon: '📚' },
  { id: 'video', label: 'Vidéos / Réels', icon: '🎬' },
  { id: 'text', label: 'Publications', icon: '📝' },
  { id: 'audio', label: 'Audios', icon: '🎙️' },
  { id: 'watch_later', label: 'À regarder', icon: '🕐' },
]

type Props = {
  onProfileClick?: (userId: string) => void
}

export default function SavedPostsTab({ onProfileClick }: Props) {
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [error, setError] = useState<string | null>(null)

  const loadSavedPosts = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load bookmarks with post data
      const { data: bookmarks, error: bookmarkError } = await supabase
        .from('post_bookmarks' as string)
        .select('id, post_id, category, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }) as { data: { id: string; post_id: string; category: string; created_at: string }[] | null; error: { code?: string; message?: string } | null }

      if (bookmarkError) {
        if (bookmarkError.code === '42P01') {
          setError('La fonctionnalité de sauvegarde sera bientôt disponible. Appliquez la migration SQL_COMMUNITY_HUB.sql.')
        }
        setLoading(false)
        return
      }

      if (!bookmarks || bookmarks.length === 0) {
        setSavedPosts([])
        setLoading(false)
        return
      }

      const postIds = bookmarks.map(b => b.post_id)
      const { data: posts } = await supabase
        .from('posts')
        .select('id, title, content, image_url, video_url, audio_url, media_type, category, created_at, author_id')
        .in('id', postIds)

      if (!posts) { setLoading(false); return }

      const authorIds = [...new Set(posts.map(p => p.author_id))]
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, prenom, avatar_url')
        .in('id', authorIds)
      const profileMap = new Map((profiles || []).map(p => [p.id, p]))

      const postMap = new Map(posts.map(p => {
        const prof = profileMap.get(p.author_id)
        return [p.id, { ...p, author_prenom: prof?.prenom || 'Membre', author_avatar: prof?.avatar_url || null }]
      }))

      const enriched: SavedPost[] = bookmarks
        .filter(b => postMap.has(b.post_id))
        .map(b => ({
          ...b,
          post: postMap.get(b.post_id)!,
        }))

      setSavedPosts(enriched)
      setLoading(false)
    } catch {
      setError('Erreur de chargement')
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadSavedPosts() }, [loadSavedPosts])

  async function removeBookmark(bookmarkId: string) {
    const supabase = createClient()
    await supabase.from('post_bookmarks').delete().eq('id', bookmarkId)
    setSavedPosts(prev => prev.filter(s => s.id !== bookmarkId))
  }

  const filteredPosts = savedPosts.filter(s => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'watch_later') return s.category === 'watch_later'
    if (activeFilter === 'video') return s.post.media_type === 'video'
    if (activeFilter === 'text') return s.post.media_type === 'text'
    if (activeFilter === 'audio') return s.post.media_type === 'audio'
    return true
  })

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16 rounded-2xl" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
        <div className="text-4xl mb-4">📌</div>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer"
            style={{
              background: activeFilter === f.id ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${activeFilter === f.id ? 'rgba(212,175,55,0.3)' : 'var(--dark-border)'}`,
              color: activeFilter === f.id ? 'var(--gold)' : 'var(--text-muted)',
            }}
          >
            <span>{f.icon}</span> {f.label}
          </button>
        ))}
      </div>

      {/* Posts */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
          <div className="text-4xl mb-4">📌</div>
          <h3 className="font-semibold text-[15px] mb-2" style={{ color: 'var(--text-primary)' }}>
            {activeFilter === 'all' ? 'Aucun post enregistré' : 'Aucun résultat pour ce filtre'}
          </h3>
          <p className="text-sm max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>
            Sauvegardez des publications depuis le Mur pour les retrouver ici.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPosts.map(saved => (
            <div key={saved.id} className="rounded-2xl p-5 group" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
              {/* Author */}
              <div className="flex items-center gap-3 mb-3">
                <button onClick={() => onProfileClick?.(saved.post.author_prenom)} className="shrink-0 cursor-pointer">
                  {saved.post.author_avatar ? (
                    <img src={saved.post.author_avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                      style={{ background: 'rgba(212,175,55,0.12)', color: 'var(--gold)' }}>
                      {saved.post.author_prenom.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>
                <div className="flex-1">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{saved.post.author_prenom}</span>
                  <span className="text-[11px] ml-2" style={{ color: 'var(--text-muted)' }}>
                    {new Date(saved.post.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <button
                  onClick={() => removeBookmark(saved.id)}
                  className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  style={{ color: 'var(--text-muted)' }}
                  title="Retirer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l1.664 1.664M21 21l-1.5-1.5m-5.533-1.8a3 3 0 01-2.684 0L3 14.5V5.664M6.667 6.667L21 21" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              {saved.post.title && (
                <h4 className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{saved.post.title}</h4>
              )}
              <p className="text-sm leading-relaxed line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
                {saved.post.content}
              </p>

              {/* Media preview */}
              {saved.post.image_url && (
                <div className="mt-3 rounded-xl overflow-hidden">
                  <img src={saved.post.image_url} alt="" className="w-full max-h-48 object-cover" />
                </div>
              )}
              {saved.post.video_url && (
                <div className="mt-3 rounded-xl overflow-hidden">
                  <video src={saved.post.video_url} controls className="w-full max-h-48" />
                </div>
              )}
              {saved.post.audio_url && (
                <div className="mt-3"><AudioPlayer src={saved.post.audio_url} /></div>
              )}

              {/* Bookmark category tag */}
              {saved.category === 'watch_later' && (
                <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(116,192,252,0.1)', color: '#74C0FC' }}>
                  🕐 À regarder plus tard
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
