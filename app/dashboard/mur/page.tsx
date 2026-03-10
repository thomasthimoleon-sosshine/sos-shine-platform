'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Post, PostCategory, PostMediaType } from '@/types/database'
import { useTranslation } from '@/lib/i18n/useTranslation'
import FileUpload from '@/components/FileUpload'
import AudioPlayer from '@/components/AudioPlayer'
import VoiceRecorder from '@/components/VoiceRecorder'

/* ── Types locaux pour les données remontées par Supabase ── */
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
  { value: 'temoignage', label: 'Témoignage', icon: '🗣️', color: '#D4AF37' },
  { value: 'partage', label: "Partage d'expériences", icon: '💫', color: '#74C0FC' },
  { value: 'question', label: 'Question', icon: '❓', color: '#A29BFE' },
  { value: 'remerciements', label: 'Remerciements', icon: '🙏', color: '#55EFC4' },
  { value: 'gratitude', label: 'Gratitude', icon: '✨', color: '#FFEAA7' },
  { value: 'citation', label: 'Citation', icon: '💬', color: '#FD79A8' },
]

const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.value, c]))

function getCategoryInfo(cat: string) {
  return CATEGORY_MAP[cat] || CATEGORIES[1]
}

function getTypeLabel(type: string, category?: string) {
  if (type === 'community' && category) return getCategoryInfo(category)
  const map: Record<string, { label: string; color: string; icon: string }> = {
    announcement: { label: 'Annonce', color: '#D4AF37', icon: '📢' },
    douleur_published: { label: 'Nouveau challenge', color: '#55EFC4', icon: '📘' },
    event_published: { label: 'Nouvel événement', color: '#74C0FC', icon: '📅' },
    general: { label: 'Publication', color: 'var(--text-secondary)', icon: '💬' },
  }
  return map[type] || map.general
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

function getPostUrl(postId: string) {
  if (typeof window !== 'undefined') return `${window.location.origin}/dashboard/mur?post=${postId}`
  return `/dashboard/mur?post=${postId}`
}

/* ── Composant principal ── */
export default function MurPage() {
  const { t } = useTranslation()
  const [posts, setPosts] = useState<PostRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // Filters
  const [filterCategory, setFilterCategory] = useState<PostCategory | 'all'>('all')
  const [filterOpen, setFilterOpen] = useState(false)

  // Create post
  const [showCreate, setShowCreate] = useState(false)
  const [createCategory, setCreateCategory] = useState<PostCategory>('partage')
  const [createMediaType, setCreateMediaType] = useState<PostMediaType>('text')
  const [createTitle, setCreateTitle] = useState('')
  const [createContent, setCreateContent] = useState('')
  const [createImageUrl, setCreateImageUrl] = useState('')
  const [createVideoUrl, setCreateVideoUrl] = useState('')
  const [createAudioUrl, setCreateAudioUrl] = useState('')
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

  // Share DM
  const [sharePostId, setSharePostId] = useState<string | null>(null)
  const [shareMembers, setShareMembers] = useState<{ id: string; prenom: string; avatar_url: string | null }[]>([])
  const [shareSearch, setShareSearch] = useState('')
  const [shareSending, setShareSending] = useState<string | null>(null)

  // Social share
  const [socialShareId, setSocialShareId] = useState<string | null>(null)

  // Ban status
  const [isBanned, setIsBanned] = useState(false)
  const [banUntil, setBanUntil] = useState<string | null>(null)

  const filterRef = useRef<HTMLDivElement>(null)

  /* ── Load posts ── */
  const loadPosts = useCallback(async () => {
    try {
      setError(null)
      const supabase = createClient()

      // 1. Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) {
        console.error('[Mur] Auth error:', authError)
        setError('Erreur d\'authentification. Veuillez vous reconnecter.')
        setLoading(false)
        return
      }
      if (!user) {
        console.error('[Mur] No user found')
        setError('Vous devez être connecté pour accéder au mur.')
        setLoading(false)
        return
      }

      setCurrentUserId(user.id)

      // 2. Check ban status
      const { data: profile } = await supabase
        .from('profiles')
        .select('publish_banned_until')
        .eq('id', user.id)
        .single()

      if (profile?.publish_banned_until && new Date(profile.publish_banned_until) > new Date()) {
        setIsBanned(true)
        setBanUntil(profile.publish_banned_until)
      } else {
        setIsBanned(false)
        setBanUntil(null)
      }

      // 3. Load posts (without fragile FK joins — we load profiles separately)
      let query = supabase
        .from('posts')
        .select('*')
        .eq('is_published', true)
        .lte('created_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(100)

      if (filterCategory !== 'all') {
        query = query.eq('category', filterCategory)
      }

      const { data: rawPostsData, error: queryError } = await query

      if (queryError) {
        console.error('[Mur] Posts query error:', queryError)
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

      // 4. Load profiles for all unique author_ids
      const authorIds = [...new Set(rawPosts.map(p => p.author_id))]
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, prenom, role, avatar_url')
        .in('id', authorIds)

      const profileMap = new Map(
        (profiles || []).map((pr: { id: string; prenom: string; role: string; avatar_url: string | null }) => [pr.id, pr])
      )

      // 5. Load like counts per post
      const postIds = rawPosts.map(p => p.id)
      const { data: likeData } = await supabase
        .from('post_likes')
        .select('post_id')
        .in('post_id', postIds)
      const likeCounts = (likeData || []) as { post_id: string }[]

      const likeCountMap = new Map<string, number>()
      for (const l of likeCounts) {
        likeCountMap.set(l.post_id, (likeCountMap.get(l.post_id) || 0) + 1)
      }

      // 6. Load comment counts per post
      const { data: commentData } = await supabase
        .from('post_comments')
        .select('post_id')
        .in('post_id', postIds)
      const commentCounts = (commentData || []) as { post_id: string }[]

      const commentCountMap = new Map<string, number>()
      for (const c of commentCounts) {
        commentCountMap.set(c.post_id, (commentCountMap.get(c.post_id) || 0) + 1)
      }

      // 7. Load which posts the current user has liked
      const { data: userLikeData } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds)
      const userLikes = (userLikeData || []) as { post_id: string }[]

      const likedSet = new Set(userLikes.map(l => l.post_id))

      // 8. Assemble enriched posts
      const enriched: PostRow[] = rawPosts.map(p => {
        const prof = profileMap.get(p.author_id)
        return {
          ...p,
          profiles: prof ? { prenom: prof.prenom, role: prof.role, avatar_url: prof.avatar_url } : null,
          post_likes: [{ count: likeCountMap.get(p.id) || 0 }],
          post_comments: [{ count: commentCountMap.get(p.id) || 0 }],
          user_has_liked: likedSet.has(p.id),
        }
      })

      setPosts(enriched)
      setLoading(false)
    } catch (err) {
      console.error('[Mur] Unexpected error:', err)
      setError(`Erreur inattendue: ${err instanceof Error ? err.message : 'inconnue'}`)
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCategory])

  useEffect(() => { loadPosts() }, [loadPosts])

  // Close filter dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false)
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

      const insertData = {
        title: createTitle.trim() || getCategoryInfo(createCategory).label,
        content: createContent.trim(),
        post_type: 'community' as const,
        category: createCategory,
        media_type: createMediaType,
        image_url: createMediaType === 'image' ? (createImageUrl || null) : null,
        video_url: createMediaType === 'video' ? (createVideoUrl || null) : null,
        audio_url: createMediaType === 'audio' ? (createAudioUrl || null) : null,
        author_id: user.id,
        is_published: true,
      }

      console.log('[Mur] Inserting post:', insertData)

      const { error: insertError } = await supabase.from('posts').insert(insertData)

      if (insertError) {
        console.error('[Mur] Insert error:', insertError)
        if (insertError.code === '42501') {
          setCreateError('Permission refusée. Vérifiez que les politiques RLS sont bien appliquées dans Supabase. (Erreur 42501)')
        } else if (insertError.code === '23503') {
          setCreateError('Erreur de référence. Votre profil n\'existe peut-être pas encore dans la table profiles.')
        } else if (insertError.code === '23514') {
          setCreateError('Valeur invalide. Vérifiez que la contrainte post_type inclut "community".')
        } else {
          setCreateError(`Erreur: ${insertError.message} (code: ${insertError.code || 'inconnu'})`)
        }
        setCreating(false)
        return
      }

      // Success: reset form and reload
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
      console.error('[Mur] Create error:', err)
      setCreateError(`Erreur inattendue: ${err instanceof Error ? err.message : 'inconnue'}`)
    }
    setCreating(false)
  }

  /* ── Shine / Un-Shine ── */
  async function toggleShine(postId: string) {
    if (!currentUserId) return
    const supabase = createClient()
    const post = posts.find(p => p.id === postId)
    if (!post) return

    const wasShined = post.user_has_liked

    // Optimistic update
    setPosts(prev => prev.map(p => p.id === postId
      ? {
          ...p,
          user_has_liked: !wasShined,
          post_likes: [{ count: wasShined ? Math.max(0, (p.post_likes?.[0]?.count || 1) - 1) : (p.post_likes?.[0]?.count || 0) + 1 }],
        }
      : p
    ))

    const { error } = wasShined
      ? await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', currentUserId)
      : await supabase.from('post_likes').insert({ post_id: postId, user_id: currentUserId })

    if (error) {
      console.error('[Mur] Shine error:', error)
      // Revert optimistic update
      setPosts(prev => prev.map(p => p.id === postId
        ? {
            ...p,
            user_has_liked: wasShined,
            post_likes: [{ count: wasShined ? (p.post_likes?.[0]?.count || 0) + 1 : Math.max(0, (p.post_likes?.[0]?.count || 1) - 1) }],
          }
        : p
      ))
    }

    // Update XP: award XP for giving a Shine
    if (!wasShined && !error) {
      try {
        await supabase.rpc('add_xp', { p_user_id: currentUserId, p_amount: 5, p_reason: 'shine_given' })
      } catch { /* XP update is non-critical */ }
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

    // Load author profiles separately
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
    if (commentError) {
      console.error('[Mur] Comment error:', commentError)
      setError(`Erreur lors de l'envoi du commentaire: ${commentError.message}`)
    } else {
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

  /* ── Share via DM ── */
  async function openShareDM(postId: string) {
    setSharePostId(postId)
    setShareSearch('')
    const supabase = createClient()
    const { data } = await supabase
      .from('profiles')
      .select('id, prenom, avatar_url')
      .neq('id', currentUserId!)
      .order('prenom')
      .limit(50)
    if (data) setShareMembers(data as { id: string; prenom: string; avatar_url: string | null }[])
  }

  async function sendShareDM(receiverId: string, postId: string) {
    setShareSending(receiverId)
    const supabase = createClient()
    const post = posts.find(p => p.id === postId)
    const url = getPostUrl(postId)
    const msg = `Je te partage cette publication du mur communautaire :\n\n"${post?.title || 'Publication'}"\n${url}`
    await supabase.from('private_messages').insert({
      sender_id: currentUserId!,
      receiver_id: receiverId,
      content: msg,
      message_type: 'text',
      is_read: false // Correction apportée pour répondre aux exigences du schéma
    })
    setShareSending(null)
    setSharePostId(null)
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
    const post = posts.find(p => p.id === postId)
    if (post?.delete_locked) {
      alert('Cette publication a ete verrouillee par un administrateur et ne peut pas etre supprimee.')
      setMenuOpen(null)
      return
    }
    if (!confirm('Supprimer cette publication ?')) return
    const supabase = createClient()
    const { error } = await supabase.from('posts').delete().eq('id', postId).eq('author_id', currentUserId!)
    if (error) {
      alert('Impossible de supprimer cette publication.')
      setMenuOpen(null)
      return
    }
    setPosts(prev => prev.filter(p => p.id !== postId))
    setMenuOpen(null)
  }

  /* ── Filtered members for DM share ── */
  const filteredShareMembers = shareMembers.filter(m =>
    m.prenom.toLowerCase().includes(shareSearch.toLowerCase())
  )

  const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            {t('dashboard.wall_title')}
          </h1>
          <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
            {t('dashboard.wall_subtitle')}
          </p>
        </div>
        {isBanned ? (
          <div className="px-4 py-2.5 rounded-xl text-xs font-medium text-right shrink-0"
            style={{ background: 'rgba(255,107,85,0.08)', border: '1px solid rgba(255,107,85,0.2)', color: '#FF6B55' }}>
            Publication suspendue<br />
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              jusqu&apos;au {banUntil ? new Date(banUntil).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) : ''}
            </span>
          </div>
        ) : (
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 cursor-pointer"
            style={{
              background: showCreate ? 'rgba(212,175,55,0.1)' : 'linear-gradient(135deg, var(--gold), #B8960F)',
              color: showCreate ? 'var(--gold)' : '#050505',
              border: showCreate ? '1px solid rgba(212,175,55,0.3)' : 'none',
            }}
          >
            {showCreate ? 'Annuler' : '+ Publier'}
          </button>
        )}
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="rounded-xl p-4 text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}>
          <p className="font-medium mb-1">Erreur</p>
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
          <h2 className="font-semibold text-lg" style={{ color: 'var(--gold)' }}>Nouvelle publication</h2>

          {createError && (
            <div className="rounded-xl p-3 text-xs" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}>
              {createError}
            </div>
          )}

          {/* Category selection */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Sujet</label>
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

          {/* Media type selection */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Type de contenu</label>
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

          {/* Title (optional) */}
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
            placeholder={createCategory === 'citation' ? 'Votre citation...' : 'Partagez votre message...'}
            rows={4}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-y"
            style={inputStyle}
          />

          {/* Media upload */}
          {createMediaType === 'image' && (
            <FileUpload
              label="Image"
              accept="image/*"
              folder="posts"
              currentUrl={createImageUrl || null}
              hint="JPG, PNG ou WebP"
              onUploaded={(url) => setCreateImageUrl(url)}
              onRemoved={() => setCreateImageUrl('')}
            />
          )}

          {createMediaType === 'video' && (
            <FileUpload
              label="Vidéo"
              accept="video/*"
              folder="posts"
              currentUrl={createVideoUrl || null}
              hint="MP4, WebM"
              onUploaded={(url) => setCreateVideoUrl(url)}
              onRemoved={() => setCreateVideoUrl('')}
            />
          )}

          {createMediaType === 'audio' && (
            <div className="space-y-3">
              {createAudioUrl ? (
                <div className="flex items-center gap-3">
                  <AudioPlayer src={createAudioUrl} />
                  <button
                    onClick={() => setCreateAudioUrl('')}
                    className="text-xs px-3 py-1.5 rounded-lg cursor-pointer"
                    style={{ color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}
                  >Supprimer</button>
                </div>
              ) : currentUserId ? (
                <VoiceRecorder
                  userId={currentUserId}
                  onSend={(audioUrl) => setCreateAudioUrl(audioUrl)}
                />
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
              {creating ? 'Publication...' : 'Publier'}
            </button>
          </div>
        </div>
      )}

      {/* ── Filter bar ── */}
      <div className="flex items-center gap-3">
        <div ref={filterRef} className="relative flex-1">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all cursor-pointer"
            style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: 'var(--text-muted)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              {filterCategory === 'all' ? 'Toutes les catégories' : getCategoryInfo(filterCategory).icon + ' ' + getCategoryInfo(filterCategory).label}
            </span>
            <svg className={`w-4 h-4 transition-transform ${filterOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: 'var(--text-muted)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {filterOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-xl py-1 z-30 shadow-xl"
              style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
              <button
                onClick={() => { setFilterCategory('all'); setFilterOpen(false) }}
                className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors cursor-pointer"
                style={{ color: filterCategory === 'all' ? 'var(--gold)' : 'var(--text-secondary)', background: filterCategory === 'all' ? 'rgba(212,175,55,0.08)' : 'transparent' }}
              >
                Toutes les catégories
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => { setFilterCategory(cat.value); setFilterOpen(false) }}
                  className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors cursor-pointer"
                  style={{ color: filterCategory === cat.value ? cat.color : 'var(--text-secondary)', background: filterCategory === cat.value ? `${cat.color}10` : 'transparent' }}
                >
                  <span>{cat.icon}</span> {cat.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Posts list ── */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : posts.length === 0 && !error ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl" style={{ background: 'rgba(212,175,55,0.08)' }}>
            {filterCategory !== 'all' ? getCategoryInfo(filterCategory).icon : '📋'}
          </div>
          <h3 className="font-display text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            {filterCategory !== 'all' ? `Aucune publication dans "${getCategoryInfo(filterCategory).label}"` : t('dashboard.wall_empty_title')}
          </h3>
          <p className="text-sm max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
            {filterCategory !== 'all' ? 'Soyez le premier à publier dans cette catégorie !' : t('dashboard.wall_empty_desc')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const typeInfo = getTypeLabel(post.post_type, post.category)
            const isOwner = currentUserId === post.author_id
            const isEditing = editingPost === post.id
            const likeCount = post.post_likes?.[0]?.count || 0
            const commentCount = post.post_comments?.[0]?.count || 0
            const isCommentsOpen = expandedComments === post.id

            return (
              <article key={post.id} className="rounded-2xl overflow-hidden" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
                <div className="p-6">
                  {/* Post type/category badge + actions */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{typeInfo.icon}</span>
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: `${typeInfo.color}15`, color: typeInfo.color }}>
                        {typeInfo.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(post.created_at)}</span>
                      {isOwner && !isEditing && (
                        <div className="relative">
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
                              {post.delete_locked ? (
                                <span
                                  className="w-full text-left px-4 py-2 text-sm flex items-center gap-2"
                                  style={{ color: 'var(--text-muted)', opacity: 0.5 }}
                                  title="Un administrateur a verrouille la suppression de cette publication">
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                  </svg>
                                  Verrouille
                                </span>
                              ) : (
                                <button onClick={() => deletePost(post.id)}
                                  className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors cursor-pointer"
                                  style={{ color: '#EF4444' }}
                                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                  Supprimer
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Author */}
                  <Link href={`/dashboard/membre/${post.author_id}`} className="flex items-center gap-2.5 mb-4 hover:opacity-80 transition-opacity">
                    {post.profiles?.avatar_url ? (
                      <img src={post.profiles.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                        style={{ background: 'rgba(212,175,55,0.12)', color: 'var(--gold)' }}>
                        {post.profiles?.prenom?.charAt(0).toUpperCase() || 'S'}
                      </div>
                    )}
                    <div>
                      <span className="text-sm font-semibold" style={{ color: post.profiles?.role === 'founder' ? 'var(--gold)' : 'var(--text-primary)' }}>
                        {post.profiles?.prenom || 'Membre SOS Shine'}
                      </span>
                      {post.profiles?.role === 'founder' && (
                        <span className="text-xs ml-2 px-1.5 py-0.5 rounded" style={{ background: 'rgba(212,175,55,0.15)', color: 'var(--gold)' }}>
                          Fondateur
                        </span>
                      )}
                    </div>
                  </Link>

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
                      {post.title && post.post_type !== 'community' && (
                        <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>{post.title}</h3>
                      )}
                      {post.title && post.post_type === 'community' && post.title !== getCategoryInfo(post.category).label && (
                        <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>{post.title}</h3>
                      )}
                      <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: post.category === 'citation' ? 'var(--gold)' : 'var(--text-secondary)', fontStyle: post.category === 'citation' ? 'italic' : 'normal' }}>
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

                {/* ── Action bar: Like, Comment, Share DM, Share Social ── */}
                {!isEditing && (
                  <div className="px-6 py-3 flex items-center gap-1" style={{ borderTop: '1px solid var(--dark-border)' }}>
                    {/* Shine */}
                    <button onClick={() => toggleShine(post.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                      style={{ color: post.user_has_liked ? '#D4AF37' : 'var(--text-muted)' }}>
                      <svg className="w-4 h-4" fill={post.user_has_liked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                      </svg>
                      {likeCount > 0 && <span>{likeCount}</span>}
                    </button>

                    {/* Comment */}
                    <button onClick={() => toggleComments(post.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                      style={{ color: isCommentsOpen ? 'var(--gold)' : 'var(--text-muted)' }}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                      </svg>
                      {commentCount > 0 && <span>{commentCount}</span>}
                    </button>

                    {/* Share DM */}
                    <button onClick={() => openShareDM(post.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                      style={{ color: 'var(--text-muted)' }}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                      </svg>
                      <span>Envoyer</span>
                    </button>

                    {/* Share Social */}
                    <div className="ml-auto relative">
                      <button onClick={() => setSocialShareId(socialShareId === post.id ? null : post.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                        style={{ color: 'var(--text-muted)' }}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                        </svg>
                        <span>Partager</span>
                      </button>

                      {socialShareId === post.id && (
                        <div className="absolute right-0 bottom-full mb-2 rounded-xl py-2 px-1 z-30 shadow-xl min-w-[160px]"
                          style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
                          <a
                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getPostUrl(post.id))}`}
                            target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors"
                            style={{ color: 'var(--text-secondary)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <span className="text-sm">📘</span> Facebook
                          </a>
                          <a
                            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(getPostUrl(post.id))}&text=${encodeURIComponent(post.title || post.content.slice(0, 100))}`}
                            target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors"
                            style={{ color: 'var(--text-secondary)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <span className="text-sm">🐦</span> X (Twitter)
                          </a>
                          <a
                            href={`https://wa.me/?text=${encodeURIComponent((post.title || 'Publication SOS Shine') + ' ' + getPostUrl(post.id))}`}
                            target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors"
                            style={{ color: 'var(--text-secondary)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <span className="text-sm">💬</span> WhatsApp
                          </a>
                          <button
                            onClick={() => { navigator.clipboard.writeText(getPostUrl(post.id)); setSocialShareId(null) }}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors w-full text-left cursor-pointer"
                            style={{ color: 'var(--text-secondary)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <span className="text-sm">🔗</span> Copier le lien
                          </button>
                        </div>
                      )}
                    </div>
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

                      {/* Add comment */}
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

      {/* ── Share DM Modal ── */}
      {sharePostId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6 space-y-4" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Envoyer en message privé</h3>
              <button onClick={() => setSharePostId(null)} className="p-1 cursor-pointer" style={{ color: 'var(--text-muted)' }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <input
              type="text"
              value={shareSearch}
              onChange={e => setShareSearch(e.target.value)}
              placeholder="Rechercher un membre..."
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={inputStyle}
            />

            <div className="max-h-60 overflow-y-auto space-y-1">
              {filteredShareMembers.map(member => (
                <button
                  key={member.id}
                  onClick={() => sendShareDM(member.id, sharePostId!)}
                  disabled={shareSending === member.id}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all cursor-pointer disabled:opacity-50"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {member.avatar_url ? (
                    <img src={member.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                      style={{ background: 'rgba(212,175,55,0.12)', color: 'var(--gold)' }}>
                      {member.prenom?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                  <span className="flex-1 text-left">{member.prenom}</span>
                  {shareSending === member.id ? (
                    <div className="w-4 h-4 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: 'var(--text-muted)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                  )}
                </button>
              ))}
              {filteredShareMembers.length === 0 && (
                <p className="text-center text-xs py-4" style={{ color: 'var(--text-muted)' }}>Aucun membre trouvé</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
