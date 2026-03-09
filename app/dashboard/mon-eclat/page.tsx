'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Post, PostCategory, PostMediaType, PostVisibility } from '@/types/database'
import { useTranslation } from '@/lib/i18n/useTranslation'
import FileUpload from '@/components/FileUpload'
import AudioPlayer from '@/components/AudioPlayer'
import VoiceRecorder from '@/components/VoiceRecorder'

/* ── Types locaux ── */
type PostRow = {
  id: string
  author_id: string
  title: string
  content: string
  image_url: string | null
  video_url: string | null
  audio_url: string | null
  post_type: string
  category: string
  media_type: string
  visibility: string
  is_published: boolean
  delete_locked: boolean
  created_at: string
  updated_at: string
  profiles: { prenom: string; role: string; avatar_url: string | null } | null
  post_likes: { count: number }[]
  post_comments: { count: number }[]
  user_has_liked?: boolean
}

type CommentRow = {
  id: string
  post_id: string
  author_id: string
  content: string
  created_at: string
  profiles: { prenom: string; role: string; avatar_url: string | null } | null
}

/* ── Category config ── */
const CATEGORIES: { value: PostCategory; label: string; icon: string; color: string }[] = [
  { value: 'temoignage', label: 'Pensée', icon: '💭', color: '#D4AF37' },
  { value: 'partage', label: 'Partage', icon: '💫', color: '#74C0FC' },
  { value: 'gratitude', label: 'Gratitude', icon: '✨', color: '#FFEAA7' },
  { value: 'citation', label: 'Citation', icon: '💬', color: '#FD79A8' },
  { value: 'remerciements', label: 'Moment de joie', icon: '🌟', color: '#55EFC4' },
  { value: 'question', label: 'Réflexion', icon: '🔮', color: '#A29BFE' },
]

const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.value, c]))

function getCategoryInfo(cat: string) {
  return CATEGORY_MAP[cat] || CATEGORIES[1]
}

function formatDate(d: string) {
  const date = new Date(d)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return "À l'instant"
  if (diffMin < 60) return `Il y a ${diffMin}min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `Il y a ${diffH}h`
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

/* ── Composant principal ── */
export default function MonEclatPage() {
  const { t } = useTranslation()
  const [posts, setPosts] = useState<PostRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentProfile, setCurrentProfile] = useState<{ prenom: string; avatar_url: string | null } | null>(null)

  // Create post
  const [showCreate, setShowCreate] = useState(false)
  const [createCategory, setCreateCategory] = useState<PostCategory>('partage')
  const [createMediaType, setCreateMediaType] = useState<PostMediaType>('text')
  const [createTitle, setCreateTitle] = useState('')
  const [createContent, setCreateContent] = useState('')
  const [createImageUrl, setCreateImageUrl] = useState('')
  const [createVideoUrl, setCreateVideoUrl] = useState('')
  const [createAudioUrl, setCreateAudioUrl] = useState('')
  const [createVisibility, setCreateVisibility] = useState<PostVisibility>('public')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  // Edit
  const [editingPost, setEditingPost] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  // Comments
  const [expandedComments, setExpandedComments] = useState<string | null>(null)
  const [comments, setComments] = useState<Record<string, CommentRow[]>>({})
  const [commentText, setCommentText] = useState('')
  const [sendingComment, setSendingComment] = useState(false)

  // Ban status
  const [isBanned, setIsBanned] = useState(false)
  const [banUntil, setBanUntil] = useState<string | null>(null)

  // Stats
  const [totalLikes, setTotalLikes] = useState(0)
  const [totalComments, setTotalComments] = useState(0)

  const menuRef = useRef<HTMLDivElement>(null)

  /* ── Load posts ── */
  const loadPosts = useCallback(async () => {
    try {
      setError(null)
      const supabase = createClient()

      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        setError('Vous devez être connecté pour accéder à votre Éclat.')
        setLoading(false)
        return
      }

      setCurrentUserId(user.id)

      // Load profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('prenom, avatar_url, publish_banned_until')
        .eq('id', user.id)
        .single()

      if (profile) {
        setCurrentProfile({ prenom: profile.prenom, avatar_url: profile.avatar_url })
        if (profile.publish_banned_until && new Date(profile.publish_banned_until) > new Date()) {
          setIsBanned(true)
          setBanUntil(profile.publish_banned_until)
        }
      }

      // Load user's eclat posts
      const { data: rawPostsData, error: queryError } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', user.id)
        .eq('post_type', 'eclat')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(100)

      if (queryError) {
        setError(`Erreur de chargement: ${queryError.message}`)
        setLoading(false)
        return
      }

      const rawPosts = (rawPostsData || []) as Post[]

      if (rawPosts.length === 0) {
        setPosts([])
        setLoading(false)
        return
      }

      // Load like counts
      const postIds = rawPosts.map(p => p.id)
      const { data: likeData } = await supabase
        .from('post_likes')
        .select('post_id')
        .in('post_id', postIds)
      const likeCounts = (likeData || []) as { post_id: string }[]
      const likeCountMap = new Map<string, number>()
      let totalL = 0
      for (const l of likeCounts) {
        likeCountMap.set(l.post_id, (likeCountMap.get(l.post_id) || 0) + 1)
        totalL++
      }
      setTotalLikes(totalL)

      // Load comment counts
      const { data: commentData } = await supabase
        .from('post_comments')
        .select('post_id')
        .in('post_id', postIds)
      const commentCounts = (commentData || []) as { post_id: string }[]
      const commentCountMap = new Map<string, number>()
      let totalC = 0
      for (const c of commentCounts) {
        commentCountMap.set(c.post_id, (commentCountMap.get(c.post_id) || 0) + 1)
        totalC++
      }
      setTotalComments(totalC)

      // User likes
      const { data: userLikeData } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds)
      const likedSet = new Set((userLikeData || []).map((l: { post_id: string }) => l.post_id))

      const enriched: PostRow[] = rawPosts.map(p => ({
        ...p,
        profiles: profile ? { prenom: profile.prenom, role: 'member', avatar_url: profile.avatar_url } : null,
        post_likes: [{ count: likeCountMap.get(p.id) || 0 }],
        post_comments: [{ count: commentCountMap.get(p.id) || 0 }],
        user_has_liked: likedSet.has(p.id),
      }))

      setPosts(enriched)
      setLoading(false)
    } catch (err) {
      setError(`Erreur inattendue: ${err instanceof Error ? err.message : 'inconnue'}`)
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadPosts() }, [loadPosts])

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(null)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  /* ── Create post ── */
  async function handleCreate() {
    if (!createContent.trim()) return
    if (isBanned) return
    setCreating(true)
    setCreateError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setCreateError('Vous devez être connecté.')
        setCreating(false)
        return
      }

      const { error: insertError } = await supabase.from('posts').insert({
        title: createTitle.trim() || getCategoryInfo(createCategory).label,
        content: createContent.trim(),
        post_type: 'eclat' as const,
        category: createCategory,
        media_type: createMediaType,
        visibility: createVisibility,
        image_url: createMediaType === 'image' ? (createImageUrl || null) : null,
        video_url: createMediaType === 'video' ? (createVideoUrl || null) : null,
        audio_url: createMediaType === 'audio' ? (createAudioUrl || null) : null,
        author_id: user.id,
        is_published: true,
      })

      if (insertError) {
        if (insertError.code === '23514') {
          setCreateError('Erreur: le type "eclat" n\'est pas encore configuré dans la base. Appliquez le SQL de migration.')
        } else {
          setCreateError(`Erreur: ${insertError.message}`)
        }
        setCreating(false)
        return
      }

      setCreateTitle('')
      setCreateContent('')
      setCreateImageUrl('')
      setCreateVideoUrl('')
      setCreateAudioUrl('')
      setCreateMediaType('text')
      setShowCreate(false)
      setCreateError(null)
      await loadPosts()
    } catch (err) {
      setCreateError(`Erreur inattendue: ${err instanceof Error ? err.message : 'inconnue'}`)
    }
    setCreating(false)
  }

  /* ── Like / Unlike ── */
  async function toggleLike(postId: string) {
    if (!currentUserId) return
    const supabase = createClient()
    const post = posts.find(p => p.id === postId)
    if (!post) return

    const wasLiked = post.user_has_liked

    setPosts(prev => prev.map(p => p.id === postId
      ? {
          ...p,
          user_has_liked: !wasLiked,
          post_likes: [{ count: wasLiked ? Math.max(0, (p.post_likes?.[0]?.count || 1) - 1) : (p.post_likes?.[0]?.count || 0) + 1 }],
        }
      : p
    ))

    const { error } = wasLiked
      ? await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', currentUserId)
      : await supabase.from('post_likes').insert({ post_id: postId, user_id: currentUserId })

    if (error) {
      setPosts(prev => prev.map(p => p.id === postId
        ? {
            ...p,
            user_has_liked: wasLiked,
            post_likes: [{ count: wasLiked ? (p.post_likes?.[0]?.count || 0) + 1 : Math.max(0, (p.post_likes?.[0]?.count || 1) - 1) }],
          }
        : p
      ))
    }
  }

  /* ── Comments ── */
  async function loadComments(postId: string) {
    const supabase = createClient()
    const { data: rawCommentsData } = await supabase
      .from('post_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    const rawComments = (rawCommentsData || []) as { id: string; post_id: string; author_id: string; content: string; created_at: string }[]

    if (rawComments.length === 0) {
      setComments(prev => ({ ...prev, [postId]: [] }))
      return
    }

    const authorIds = [...new Set(rawComments.map(c => c.author_id))]
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, prenom, role, avatar_url')
      .in('id', authorIds)

    const profileMap = new Map(
      (profiles || []).map((pr: { id: string; prenom: string; role: string; avatar_url: string | null }) => [pr.id, pr])
    )

    const enriched = rawComments.map(c => {
      const prof = profileMap.get(c.author_id)
      return { ...c, profiles: prof ? { prenom: prof.prenom, role: prof.role, avatar_url: prof.avatar_url } : null }
    })

    setComments(prev => ({ ...prev, [postId]: enriched as CommentRow[] }))
  }

  async function toggleComments(postId: string) {
    if (expandedComments === postId) {
      setExpandedComments(null)
    } else {
      setExpandedComments(postId)
      if (!comments[postId]) await loadComments(postId)
    }
  }

  async function sendComment(postId: string) {
    if (!commentText.trim() || !currentUserId) return
    setSendingComment(true)
    const supabase = createClient()
    const { error: commentError } = await supabase.from('post_comments').insert({
      post_id: postId,
      author_id: currentUserId,
      content: commentText.trim(),
    })
    if (!commentError) {
      setCommentText('')
      await loadComments(postId)
      setPosts(prev => prev.map(p => p.id === postId
        ? { ...p, post_comments: [{ count: (p.post_comments?.[0]?.count || 0) + 1 }] }
        : p
      ))
    }
    setSendingComment(false)
  }

  async function deleteComment(commentId: string, postId: string) {
    const supabase = createClient()
    await supabase.from('post_comments').delete().eq('id', commentId)
    await loadComments(postId)
    setPosts(prev => prev.map(p => p.id === postId
      ? { ...p, post_comments: [{ count: Math.max(0, (p.post_comments?.[0]?.count || 1) - 1) }] }
      : p
    ))
  }

  /* ── Edit / Delete ── */
  function startEdit(post: PostRow) {
    setEditingPost(post.id)
    setEditTitle(post.title)
    setEditContent(post.content)
    setMenuOpen(null)
  }

  async function saveEdit(postId: string) {
    if (!editTitle.trim() || !editContent.trim()) return
    setSaving(true)
    const supabase = createClient()
    await supabase
      .from('posts')
      .update({ title: editTitle.trim(), content: editContent.trim(), updated_at: new Date().toISOString() })
      .eq('id', postId)
      .eq('author_id', currentUserId!)
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, title: editTitle.trim(), content: editContent.trim() } : p))
    setEditingPost(null)
    setSaving(false)
  }

  async function deletePost(postId: string) {
    if (!confirm('Supprimer cette publication de votre Éclat ?')) return
    const supabase = createClient()
    const { error } = await supabase.from('posts').delete().eq('id', postId).eq('author_id', currentUserId!)
    if (!error) {
      setPosts(prev => prev.filter(p => p.id !== postId))
    }
    setMenuOpen(null)
  }

  const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* ── Header with shine theme ── */}
      <div className="rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.08), rgba(212,175,55,0.02))', border: '1px solid rgba(212,175,55,0.15)' }}>
        {/* Decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full blur-3xl opacity-20"
          style={{ background: 'var(--gold)' }} />

        {/* Avatar */}
        {currentProfile?.avatar_url ? (
          <img src={currentProfile.avatar_url} alt="" className="w-20 h-20 rounded-2xl object-cover mx-auto mb-4 ring-2 ring-[var(--gold)]/20" />
        ) : (
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl font-display font-semibold ring-2 ring-[var(--gold)]/20"
            style={{ background: 'rgba(212,175,55,0.12)', color: 'var(--gold)' }}>
            {currentProfile?.prenom?.charAt(0).toUpperCase() || '?'}
          </div>
        )}

        <h1 className="font-display text-3xl sm:text-4xl font-semibold relative" style={{ color: 'var(--gold)' }}>
          {t('dashboard.eclat_title')}
        </h1>
        <p className="mt-2 text-sm max-w-md mx-auto relative" style={{ color: 'var(--text-secondary)' }}>
          {t('dashboard.eclat_subtitle')}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-center gap-6 mt-5 relative">
          <div className="text-center">
            <p className="text-xl font-semibold" style={{ color: 'var(--gold)' }}>{posts.length}</p>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>publications</p>
          </div>
          <div className="w-px h-8" style={{ background: 'var(--dark-border)' }} />
          <div className="text-center">
            <p className="text-xl font-semibold" style={{ color: 'var(--gold)' }}>{totalLikes}</p>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>j&apos;aime</p>
          </div>
          <div className="w-px h-8" style={{ background: 'var(--dark-border)' }} />
          <div className="text-center">
            <p className="text-xl font-semibold" style={{ color: 'var(--gold)' }}>{totalComments}</p>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>commentaires</p>
          </div>
        </div>
      </div>

      {/* ── Publish button ── */}
      <div className="flex justify-end">
        {isBanned ? (
          <div className="px-4 py-2.5 rounded-xl text-xs font-medium text-right"
            style={{ background: 'rgba(255,107,85,0.08)', border: '1px solid rgba(255,107,85,0.2)', color: '#FF6B55' }}>
            Publication suspendue<br />
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              jusqu&apos;au {banUntil ? new Date(banUntil).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) : ''}
            </span>
          </div>
        ) : (
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer"
            style={{
              background: showCreate ? 'rgba(212,175,55,0.1)' : 'linear-gradient(135deg, var(--gold), #B8960F)',
              color: showCreate ? 'var(--gold)' : '#050505',
              border: showCreate ? '1px solid rgba(212,175,55,0.3)' : 'none',
            }}
          >
            {showCreate ? 'Annuler' : '+ Faire briller'}
          </button>
        )}
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="rounded-xl p-4 text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}>
          <p>{error}</p>
          <button
            onClick={() => { setError(null); setLoading(true); loadPosts() }}
            className="mt-2 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
            style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444' }}
          >
            Réessayer
          </button>
        </div>
      )}

      {/* ── Create post form ── */}
      {showCreate && (
        <div className="rounded-2xl p-6 space-y-5" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
          <h2 className="font-semibold text-lg" style={{ color: 'var(--gold)' }}>Nouvelle publication sur votre Éclat</h2>

          {createError && (
            <div className="rounded-xl p-3 text-xs" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}>
              {createError}
            </div>
          )}

          {/* Category selection */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Type</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setCreateCategory(cat.value)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer"
                  style={{
                    background: createCategory === cat.value ? `${cat.color}20` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${createCategory === cat.value ? `${cat.color}50` : 'var(--dark-border)'}`,
                    color: createCategory === cat.value ? cat.color : 'var(--text-secondary)',
                  }}
                >
                  <span>{cat.icon}</span> {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Media type */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Contenu</label>
            <div className="flex gap-2">
              {([
                { value: 'text' as const, label: 'Texte', icon: '📝' },
                { value: 'image' as const, label: 'Image', icon: '🖼️' },
                { value: 'video' as const, label: 'Vidéo', icon: '🎬' },
                { value: 'audio' as const, label: 'Audio', icon: '🎙️' },
              ]).map(mt => (
                <button
                  key={mt.value}
                  onClick={() => setCreateMediaType(mt.value)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer"
                  style={{
                    background: createMediaType === mt.value ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${createMediaType === mt.value ? 'rgba(212,175,55,0.3)' : 'var(--dark-border)'}`,
                    color: createMediaType === mt.value ? 'var(--gold)' : 'var(--text-secondary)',
                  }}
                >
                  <span>{mt.icon}</span> {mt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Qui peut voir ?</label>
            <div className="flex gap-2">
              <button
                onClick={() => setCreateVisibility('public')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer"
                style={{
                  background: createVisibility === 'public' ? 'rgba(85,239,196,0.12)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${createVisibility === 'public' ? 'rgba(85,239,196,0.3)' : 'var(--dark-border)'}`,
                  color: createVisibility === 'public' ? '#55EFC4' : 'var(--text-secondary)',
                }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
                Public
              </button>
              <button
                onClick={() => setCreateVisibility('rayons_only')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer"
                style={{
                  background: createVisibility === 'rayons_only' ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${createVisibility === 'rayons_only' ? 'rgba(212,175,55,0.3)' : 'var(--dark-border)'}`,
                  color: createVisibility === 'rayons_only' ? 'var(--gold)' : 'var(--text-secondary)',
                }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
                Mes Rayons uniquement
              </button>
            </div>
          </div>

          {/* Title */}
          <input
            type="text"
            value={createTitle}
            onChange={e => setCreateTitle(e.target.value)}
            placeholder="Titre (optionnel)"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={inputStyle}
          />

          {/* Content */}
          <textarea
            value={createContent}
            onChange={e => setCreateContent(e.target.value)}
            placeholder={createCategory === 'citation' ? 'Votre citation...' : 'Que souhaitez-vous faire briller aujourd\'hui ?'}
            rows={4}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-y"
            style={inputStyle}
          />

          {/* Media upload */}
          {createMediaType === 'image' && (
            <FileUpload label="Image" accept="image/*" folder="posts"
              currentUrl={createImageUrl || null} hint="JPG, PNG ou WebP"
              onUploaded={(url) => setCreateImageUrl(url)} onRemoved={() => setCreateImageUrl('')} />
          )}
          {createMediaType === 'video' && (
            <FileUpload label="Vidéo" accept="video/*" folder="posts"
              currentUrl={createVideoUrl || null} hint="MP4, WebM"
              onUploaded={(url) => setCreateVideoUrl(url)} onRemoved={() => setCreateVideoUrl('')} />
          )}
          {createMediaType === 'audio' && (
            <div className="space-y-3">
              {createAudioUrl ? (
                <div className="flex items-center gap-3">
                  <AudioPlayer src={createAudioUrl} />
                  <button onClick={() => setCreateAudioUrl('')}
                    className="text-xs px-3 py-1.5 rounded-lg cursor-pointer"
                    style={{ color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                    Supprimer
                  </button>
                </div>
              ) : currentUserId ? (
                <VoiceRecorder userId={currentUserId} onSend={(audioUrl) => setCreateAudioUrl(audioUrl)} />
              ) : null}
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleCreate}
              disabled={creating || !createContent.trim()}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, var(--gold), #B8960F)', color: '#050505' }}
            >
              {creating ? 'Publication...' : 'Publier sur mon Éclat'}
            </button>
          </div>
        </div>
      )}

      {/* ── Posts list ── */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : posts.length === 0 && !error ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-5 text-4xl"
            style={{ background: 'rgba(212,175,55,0.08)' }}>
            ✨
          </div>
          <h3 className="font-display text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            {t('dashboard.eclat_empty_title')}
          </h3>
          <p className="text-sm max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
            {t('dashboard.eclat_empty_desc')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const catInfo = getCategoryInfo(post.category)
            const isEditing = editingPost === post.id
            const likeCount = post.post_likes?.[0]?.count || 0
            const commentCount = post.post_comments?.[0]?.count || 0
            const isCommentsOpen = expandedComments === post.id

            return (
              <article key={post.id} className="rounded-2xl overflow-hidden" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
                <div className="p-6">
                  {/* Category badge + actions */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{catInfo.icon}</span>
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: `${catInfo.color}15`, color: catInfo.color }}>
                        {catInfo.label}
                      </span>
                      {post.visibility === 'rayons_only' && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1"
                          style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--gold)', border: '1px solid rgba(212,175,55,0.15)' }}>
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                          </svg>
                          Rayons
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(post.created_at)}</span>
                      {!isEditing && (
                        <div className="relative" ref={menuOpen === post.id ? menuRef : undefined}>
                          <button
                            onClick={() => setMenuOpen(menuOpen === post.id ? null : post.id)}
                            className="p-1.5 rounded-lg transition-colors cursor-pointer"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                            </svg>
                          </button>
                          {menuOpen === post.id && (
                            <div className="absolute right-0 top-8 rounded-xl py-1 z-20 min-w-[140px] shadow-xl"
                              style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
                              <button onClick={() => startEdit(post)}
                                className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors cursor-pointer"
                                style={{ color: 'var(--text-secondary)' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                Modifier
                              </button>
                              <button onClick={() => deletePost(post.id)}
                                className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors cursor-pointer"
                                style={{ color: '#EF4444' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                Supprimer
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  {isEditing ? (
                    <div className="space-y-3">
                      <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold outline-none" style={inputStyle} />
                      <textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={4}
                        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none" style={inputStyle} />
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => setEditingPost(null)}
                          className="px-4 py-2 rounded-xl text-xs font-medium cursor-pointer"
                          style={{ color: 'var(--text-muted)', border: '1px solid var(--dark-border)' }}>
                          Annuler
                        </button>
                        <button onClick={() => saveEdit(post.id)} disabled={saving}
                          className="px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50"
                          style={{ background: 'var(--gold)', color: 'var(--dark)' }}>
                          {saving ? '...' : 'Enregistrer'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {post.title && post.title !== catInfo.label && (
                        <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>{post.title}</h3>
                      )}
                      <p className="text-sm leading-relaxed whitespace-pre-line"
                        style={{ color: post.category === 'citation' ? 'var(--gold)' : 'var(--text-secondary)', fontStyle: post.category === 'citation' ? 'italic' : 'normal' }}>
                        {post.content}
                      </p>

                      {/* Media */}
                      {post.image_url && (
                        <div className="mt-4 rounded-xl overflow-hidden">
                          <img src={post.image_url} alt="" className="w-full" />
                        </div>
                      )}
                      {post.video_url && (
                        <div className="mt-4 rounded-xl overflow-hidden">
                          <video src={post.video_url} controls className="w-full" />
                        </div>
                      )}
                      {post.audio_url && (
                        <div className="mt-4">
                          <AudioPlayer src={post.audio_url} />
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* ── Action bar ── */}
                {!isEditing && (
                  <div className="px-6 py-3 flex items-center gap-1" style={{ borderTop: '1px solid var(--dark-border)' }}>
                    <button onClick={() => toggleLike(post.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                      style={{ color: post.user_has_liked ? '#EF4444' : 'var(--text-muted)' }}>
                      <svg className="w-4 h-4" fill={post.user_has_liked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                      </svg>
                      {likeCount > 0 && <span>{likeCount}</span>}
                    </button>

                    <button onClick={() => toggleComments(post.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                      style={{ color: isCommentsOpen ? 'var(--gold)' : 'var(--text-muted)' }}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                      </svg>
                      {commentCount > 0 && <span>{commentCount}</span>}
                    </button>
                  </div>
                )}

                {/* ── Comments section ── */}
                {isCommentsOpen && (
                  <div className="px-6 pb-5 space-y-3" style={{ borderTop: '1px solid var(--dark-border)' }}>
                    <div className="pt-4 space-y-3">
                      {(comments[post.id] || []).map(comment => (
                        <div key={comment.id} className="flex gap-2.5">
                          {comment.profiles?.avatar_url ? (
                            <img src={comment.profiles.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5" />
                          ) : (
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0 mt-0.5"
                              style={{ background: 'rgba(212,175,55,0.12)', color: 'var(--gold)' }}>
                              {comment.profiles?.prenom?.charAt(0).toUpperCase() || '?'}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold" style={{ color: comment.profiles?.role === 'founder' ? 'var(--gold)' : 'var(--text-primary)' }}>
                                {comment.profiles?.prenom || 'Membre'}
                              </span>
                              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{formatDate(comment.created_at)}</span>
                              {currentUserId === comment.author_id && (
                                <button onClick={() => deleteComment(comment.id, post.id)}
                                  className="text-[10px] cursor-pointer ml-auto" style={{ color: 'var(--text-muted)' }}>
                                  supprimer
                                </button>
                              )}
                            </div>
                            <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{comment.content}</p>
                          </div>
                        </div>
                      ))}

                      <div className="flex gap-2 pt-2">
                        <input
                          type="text"
                          value={expandedComments === post.id ? commentText : ''}
                          onChange={e => setCommentText(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendComment(post.id) } }}
                          placeholder="Écrire un commentaire..."
                          className="flex-1 px-3 py-2 rounded-xl text-xs outline-none"
                          style={inputStyle}
                        />
                        <button
                          onClick={() => sendComment(post.id)}
                          disabled={sendingComment || !commentText.trim()}
                          className="px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-40"
                          style={{ background: 'var(--gold)', color: 'var(--dark)' }}
                        >
                          {sendingComment ? '...' : 'Envoyer'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
