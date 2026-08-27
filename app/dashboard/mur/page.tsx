'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Post, PostCategory, PostMediaType } from '@/types/database'
import ShineIcon from '@/components/icons/ShineIcon'
import { POST_CATEGORIES, MEDIA_TYPES, getCategory } from '@/lib/community/categories'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { incrementAndCheckBadges } from '@/lib/badgeService'
import FileUpload from '@/components/FileUpload'
import AudioPlayer from '@/components/AudioPlayer'
import VoiceRecorder from '@/components/VoiceRecorder'
import ProfileDrawer from '@/components/community/ProfileDrawer'

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

/* ── Catégories : voir lib/community/categories.ts (source unique) ── */
const CATEGORIES = POST_CATEGORIES

/**
 * Contenus publiés par l'équipe : eux gardent un bandeau de type, car
 * « Annonce » ou « Nouveau protocole » n'est pas une catégorie de membre.
 * Les publications de membres n'en ont plus : leur identité est portée par
 * le signe coloré posé devant le titre.
 */
const EDITORIAL_TYPES: Record<string, { label: string; color: string; icon: 'diffuser' | 'texte' | 'garder' }> = {
  announcement: { label: 'Annonce', color: '#C9A961', icon: 'diffuser' },
  douleur_published: { label: 'Nouveau protocole', color: '#E3D5BE', icon: 'texte' },
  event_published: { label: 'Nouvel événement', color: '#C78790', icon: 'garder' },
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

  // Profile drawer
  const [profileDrawerUserId, setProfileDrawerUserId] = useState<string | null>(null)

  // Quick Rayon
  const [sendingRayon, setSendingRayon] = useState<string | null>(null)
  const [rayonConnections, setRayonConnections] = useState<Set<string>>(new Set())
  const [rayonPending, setRayonPending] = useState<Set<string>>(new Set())

  // Bookmarks
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set())

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
        setError('Reconnectez-vous pour continuer.')
        setLoading(false)
        return
      }
      if (!user) {
        console.error('[Mur] No user found')
        setError('Reconnectez-vous pour voir le fil.')
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

      // 3. Load posts (without fragile FK joins - we load profiles separately)
      let query = supabase
        .from('posts')
        .select('*')
        .eq('is_published', true)
        .neq('post_type', 'eclat')
        .lte('created_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(100)

      if (filterCategory !== 'all') {
        query = query.eq('category', filterCategory)
      }

      const { data: rawPostsData, error: queryError } = await query

      if (queryError) {
        console.error('[Mur] Posts query error:', queryError)
        setError('Impossible de charger le fil pour le moment. Réessayez.')
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

      // Load Rayon connections for quick-add feature
      const { data: connections } = await supabase
        .from('shine_connections')
        .select('sender_id, receiver_id, status')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      const connectedSet = new Set<string>()
      const pendingSet = new Set<string>()
      for (const c of (connections || [])) {
        const partnerId = c.sender_id === user.id ? c.receiver_id : c.sender_id
        if (c.status === 'accepted') connectedSet.add(partnerId)
        else pendingSet.add(partnerId)
      }
      setRayonConnections(connectedSet)
      setRayonPending(pendingSet)

      // Load bookmarks (table may not exist yet)
      try {
        const { data: bookmarks } = await supabase
          .from('post_bookmarks' as string)
          .select('post_id')
          .eq('user_id', user.id) as { data: { post_id: string }[] | null }
        if (bookmarks) setBookmarkedPosts(new Set(bookmarks.map(b => b.post_id)))
      } catch { /* table might not exist */ }

      setLoading(false)
    } catch (err) {
      console.error('[Mur] Unexpected error:', err)
      setError('Oups, une erreur est survenue. Réessayez.')
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCategory])

  useEffect(() => { loadPosts() }, [loadPosts])

  /* ── Quick Rayon request ── */
  async function sendQuickRayon(targetUserId: string) {
    if (!currentUserId || sendingRayon || currentUserId === targetUserId) return
    if (rayonConnections.has(targetUserId) || rayonPending.has(targetUserId)) return
    setSendingRayon(targetUserId)
    const supabase = createClient()
    const { error } = await supabase.from('shine_connections').insert({
      sender_id: currentUserId,
      receiver_id: targetUserId,
      status: 'pending',
    })
    if (!error) {
      setRayonPending(prev => new Set([...prev, targetUserId]))
    }
    setSendingRayon(null)
  }

  /* ── Bookmark toggle ── */
  async function toggleBookmark(postId: string) {
    if (!currentUserId) return
    const supabase = createClient()
    const isBookmarked = bookmarkedPosts.has(postId)
    if (isBookmarked) {
      await (supabase.from('post_bookmarks' as string) as ReturnType<typeof supabase.from>).delete().eq('user_id', currentUserId).eq('post_id', postId)
      setBookmarkedPosts(prev => { const next = new Set(prev); next.delete(postId); return next })
    } else {
      await (supabase.from('post_bookmarks' as string) as ReturnType<typeof supabase.from>).insert({ user_id: currentUserId, post_id: postId } as Record<string, unknown>)
      setBookmarkedPosts(prev => new Set([...prev, postId]))
    }
  }

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
        title: createTitle.trim() || getCategory(createCategory).label,
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
        setCreateError('Oups, ça n\'a pas marché. Réessayez dans un instant.')
        setCreating(false)
        return
      }

      incrementAndCheckBadges(user.id, 'publications_created').catch(() => {})

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
      setCreateError('Oups, ça n\'a pas marché. Réessayez dans un instant.')
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

    // XP et compteurs shines_given/shines_received sont gérés
    // automatiquement par le trigger DB sur post_likes (INSERT/DELETE)
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
      setError('Votre message n’a pas pu être envoyé. Réessayez.')
    } else {
      incrementAndCheckBadges(currentUserId, 'comments_left').catch(() => {})
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
  /**
   * Un partage vers l'extérieur, quel que soit le canal.
   * Le compteur shares_external existait en base mais rien ne l'incrémentait :
   * la catégorie de badges « L'Ambassadeur » (7 badges) était donc
   * inatteignable, et le compteur « Partages » du profil affichait zéro pour
   * tout le monde, indéfiniment.
   */
  function countShare() {
    if (!currentUserId) return
    incrementAndCheckBadges(currentUserId, 'shares_external').catch(() => {})
  }

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

  const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-primary)' }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-end gap-4">
        {isBanned ? (
          <div className="px-4 py-2.5 rounded-xl text-xs font-medium text-right shrink-0"
            style={{ background: 'rgba(255,107,85,0.08)', border: '1px solid rgba(255,107,85,0.2)', color: '#FF6B55' }}>
            Publication suspendue<br />
            <span className="text-[10px] text-[var(--text-muted)]">
              jusqu&apos;au {banUntil ? new Date(banUntil).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) : ''}
            </span>
          </div>
        ) : (
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 cursor-pointer"
            style={{
              background: showCreate ? 'rgba(201,169,97,0.1)' : 'linear-gradient(135deg, var(--brand), #A88248)',
              color: showCreate ? 'var(--brand)' : '#000000',
              border: showCreate ? '1px solid rgba(201,169,97,0.3)' : 'none',
            }}
          >
            {showCreate ? 'Annuler' : '+ Publier'}
          </button>
        )}
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="rounded-xl p-4 text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--danger)' }}>
          <p className="font-medium mb-1">Erreur</p>
          <p>{error}</p>
          <button
            onClick={() => { setError(null); setLoading(true); loadPosts() }}
            className="mt-2 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
            style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--danger)' }}
          >
            Réessayer
          </button>
        </div>
      )}

      {/* ── Create post form ── */}
      {showCreate && (
        <div className="rounded-2xl p-6 space-y-5 bg-[var(--surface-card)] border border-[var(--border)]">
          <h2 className="font-semibold text-lg text-[var(--brand)]">Nouvelle publication</h2>

          {createError && (
            <div className="rounded-xl p-3 text-xs text-[var(--danger)]" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              {createError}
            </div>
          )}

          {/* Category selection */}
          <div>
            <label className="block text-xs font-medium mb-2 text-[var(--text-secondary)]">Sujet</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setCreateCategory(cat.value)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer"
                  style={{
                    background: createCategory === cat.value ? `${cat.color}20` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${createCategory === cat.value ? `${cat.color}50` : 'var(--border)'}`,
                    color: createCategory === cat.value ? cat.color : 'var(--text-secondary)',
                  }}
                >
                  <ShineIcon
                    name={cat.icon}
                    className="w-4 h-4"
                    color={createCategory === cat.value ? cat.color : undefined}
                  />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Media type selection */}
          <div>
            <label className="block text-xs font-medium mb-2 text-[var(--text-secondary)]">Type de contenu</label>
            <div className="flex gap-2">
              {MEDIA_TYPES.map(mt => (
                <button
                  key={mt.value}
                  onClick={() => setCreateMediaType(mt.value)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer"
                  style={{
                    background: createMediaType === mt.value ? 'rgba(201,169,97,0.12)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${createMediaType === mt.value ? 'rgba(201,169,97,0.3)' : 'var(--border)'}`,
                    color: createMediaType === mt.value ? 'var(--brand)' : 'var(--text-secondary)',
                  }}
                >
                  <ShineIcon name={mt.icon} className="w-4 h-4" /> {mt.label}
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
                    style={{ color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)' }}
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
              style={{ background: 'linear-gradient(135deg, var(--brand), #A88248)', color: '#000000' }}
            >
              {creating ? 'Publication…' : 'Partager'}
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
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              {filterCategory === 'all' ? 'Toutes les catégories' : (
                <span className="flex items-center gap-2" style={{ color: getCategory(filterCategory).color }}>
                  <ShineIcon name={getCategory(filterCategory).icon} className="w-4 h-4" />
                  {getCategory(filterCategory).label}
                </span>
              )}
            </span>
            <svg className={`w-4 h-4 transition-transform text-[var(--text-muted)] ${filterOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {filterOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-xl py-1 z-30 shadow-xl bg-[var(--surface-card)] border border-[var(--border)]">
              <button
                onClick={() => { setFilterCategory('all'); setFilterOpen(false) }}
                className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors cursor-pointer"
                style={{ color: filterCategory === 'all' ? 'var(--brand)' : 'var(--text-secondary)', background: filterCategory === 'all' ? 'rgba(201,169,97,0.08)' : 'transparent' }}
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
                  <ShineIcon
                    name={cat.icon}
                    className="w-4 h-4"
                    color={filterCategory === cat.value ? cat.color : undefined}
                  />
                  {cat.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Posts list ── */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : posts.length === 0 && !error ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(201,169,97,0.08)' }}>
            <ShineIcon
              name={filterCategory !== 'all' ? getCategory(filterCategory).icon : 'texte'}
              className="w-9 h-9"
              color={filterCategory !== 'all' ? getCategory(filterCategory).color : 'var(--brand)'}
              strokeWidth={1.2}
            />
          </div>
          <h3 className="font-display text-xl font-semibold mb-2 text-[var(--text-primary)]">
            {filterCategory !== 'all' ? `Aucune publication dans "${getCategory(filterCategory).label}"` : t('dashboard.wall_empty_title')}
          </h3>
          <p className="text-sm max-w-sm mx-auto text-[var(--text-secondary)]">
            {filterCategory !== 'all' ? 'Soyez le premier à publier dans cette catégorie !' : t('dashboard.wall_empty_desc')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const cat = getCategory(post.category)
            const editorial = EDITORIAL_TYPES[post.post_type]
            const isOwner = currentUserId === post.author_id
            const isEditing = editingPost === post.id
            const likeCount = post.post_likes?.[0]?.count || 0
            const commentCount = post.post_comments?.[0]?.count || 0
            const isCommentsOpen = expandedComments === post.id

            return (
              <article key={post.id} className="rounded-2xl overflow-hidden bg-[var(--surface-card)] border border-[var(--border)]">
                <div className="p-6">
                  {/* En-tete : bandeau reserve aux contenus de l'equipe, date, menu */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {editorial && (
                        <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                          style={{ background: `${editorial.color}15`, color: editorial.color }}>
                          <ShineIcon name={editorial.icon} className="w-3.5 h-3.5" />
                          {editorial.label}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--text-muted)]">{formatDate(post.created_at)}</span>
                      {isOwner && !isEditing && (
                        <div className="relative">
                          <button
                            onClick={() => setMenuOpen(menuOpen === post.id ? null : post.id)}
                            className="p-1.5 rounded-lg transition-colors cursor-pointer text-[var(--text-muted)]"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                            </svg>
                          </button>
                          {menuOpen === post.id && (
                            <div className="absolute right-0 top-8 rounded-xl py-1 z-20 min-w-[140px] shadow-xl bg-[var(--surface-card)] border border-[var(--border)]">
                              <button onClick={() => startEdit(post)}
                                className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors cursor-pointer text-[var(--text-secondary)]"
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
                                  className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors cursor-pointer text-[var(--danger)]"
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

                  {/* Author (click opens profile drawer) */}
                  <div className="flex items-center gap-2.5 mb-4">
                    <button onClick={() => setProfileDrawerUserId(post.author_id)} className="shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
                      {post.profiles?.avatar_url ? (
                        <img src={post.profiles.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                          style={{ background: 'rgba(201,169,97,0.12)', color: 'var(--brand)' }}>
                          {post.profiles?.prenom?.charAt(0).toUpperCase() || 'S'}
                        </div>
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setProfileDrawerUserId(post.author_id)}
                          className="text-sm font-semibold cursor-pointer hover:underline"
                          style={{ color: post.profiles?.role === 'founder' ? 'var(--brand)' : 'var(--text-primary)' }}>
                          {post.profiles?.prenom || 'Membre SOS Shine'}
                        </button>
                        {post.profiles?.role === 'founder' && (
                          <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(201,169,97,0.15)', color: 'var(--brand)' }}>
                            Fondateur
                          </span>
                        )}
                        {/* Quick add Rayon button */}
                        {post.author_id !== currentUserId && !rayonConnections.has(post.author_id) && !rayonPending.has(post.author_id) && (
                          <button
                            onClick={() => sendQuickRayon(post.author_id)}
                            disabled={sendingRayon === post.author_id}
                            className="w-5 h-5 rounded-full flex items-center justify-center text-xs cursor-pointer transition-all opacity-60 hover:opacity-100"
                            style={{ background: 'rgba(201,169,97,0.12)', color: 'var(--brand)', border: '1px solid rgba(201,169,97,0.2)' }}
                            title="Envoyer un Rayon"
                          >
                            {sendingRayon === post.author_id ? '·' : '+'}
                          </button>
                        )}
                        {rayonPending.has(post.author_id) && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(201,169,97,0.08)', color: 'var(--brand)' }}>
                            Envoyé
                          </span>
                        )}
                        {rayonConnections.has(post.author_id) && (
                          <span title="Rayon connecté">
                            <svg className="w-3.5 h-3.5 text-[var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                            </svg>
                          </span>
                        )}
                      </div>
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
                          className="px-4 py-2 rounded-xl text-xs font-medium cursor-pointer text-[var(--text-muted)] border border-[var(--border)]">
                          Annuler
                        </button>
                        <button onClick={() => saveEdit(post.id)} disabled={saving}
                          className="px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50"
                          style={{ background: 'var(--brand)', color: 'var(--surface)' }}>
                          {saving ? '...' : 'Enregistrer'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Le signe de la categorie precede le titre (systeme « Les Eclats ») */}
                      {editorial ? (
                        post.title && (
                          <h3 className="font-semibold text-lg mb-2 text-[var(--text-primary)]">{post.title}</h3>
                        )
                      ) : (
                        <div className="flex items-start gap-2.5 mb-2">
                          <ShineIcon
                            name={cat.icon}
                            color={cat.color}
                            className="w-[18px] h-[18px] shrink-0 mt-[6px]"
                            title={`${cat.label}, ${cat.meaning}`}
                          />
                          <h3 className="font-semibold text-lg text-[var(--text-primary)]">
                            {post.title && post.title !== cat.label
                              ? post.title
                              : <span style={{ color: cat.color }}>{cat.label}</span>}
                          </h3>
                        </div>
                      )}
                      <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: post.category === 'citation' ? 'var(--brand)' : 'var(--text-secondary)', fontStyle: post.category === 'citation' ? 'italic' : 'normal' }}>
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
                          <video src={post.video_url} controls controlsList="nodownload" onContextMenu={(e) => e.preventDefault()} className="w-full" />
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
                  <div className="px-6 py-3 flex items-center gap-1 border-t border-[var(--border)]">
                    {/* Shine */}
                    <button onClick={() => toggleShine(post.id)}
                      title={post.user_has_liked ? 'Retirer mon éclat' : 'Donner un éclat'}
                      aria-label={post.user_has_liked ? 'Retirer mon éclat' : 'Donner un éclat'}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                      style={{ color: post.user_has_liked ? 'var(--brand)' : 'var(--text-muted)' }}>
                      <ShineIcon name="eclat" className="w-4 h-4" filled={post.user_has_liked} />
                      {likeCount > 0 && <span>{likeCount}</span>}
                    </button>

                    {/* Comment */}
                    <button onClick={() => toggleComments(post.id)}
                      title="Répondre" aria-label="Répondre"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                      style={{ color: isCommentsOpen ? 'var(--brand)' : 'var(--text-muted)' }}>
                      <ShineIcon name="parole" className="w-4 h-4" />
                      {commentCount > 0 && <span>{commentCount}</span>}
                    </button>

                    {/* Share DM */}
                    <button onClick={() => openShareDM(post.id)}
                      title="Envoyer à un proche" aria-label="Envoyer à un proche"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer text-[var(--text-muted)]">
                      <ShineIcon name="rayon" className="w-4 h-4" />
                    </button>

                    {/* Bookmark */}
                    <button onClick={() => toggleBookmark(post.id)}
                      title={bookmarkedPosts.has(post.id) ? 'Retirer des enregistrés' : 'Garder'}
                      aria-label={bookmarkedPosts.has(post.id) ? 'Retirer des enregistrés' : 'Garder'}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                      style={{ color: bookmarkedPosts.has(post.id) ? 'var(--brand)' : 'var(--text-muted)' }}>
                      <ShineIcon name="garder" className="w-4 h-4" filled={bookmarkedPosts.has(post.id)} />
                    </button>

                    {/* Share Social */}
                    <div className="ml-auto relative">
                      <button onClick={() => setSocialShareId(socialShareId === post.id ? null : post.id)}
                        title="Partager en dehors de SOS Shine" aria-label="Partager en dehors de SOS Shine"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer text-[var(--text-muted)]">
                        <ShineIcon name="diffuser" className="w-4 h-4" />
                      </button>

                      {socialShareId === post.id && (
                        <div className="absolute right-0 bottom-full mb-2 rounded-xl py-2 px-1 z-30 shadow-xl min-w-[160px] bg-[var(--surface-card)] border border-[var(--border)]">
                          <a
                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getPostUrl(post.id))}`}
                            target="_blank" rel="noopener noreferrer"
                            onClick={countShare}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors text-[var(--text-secondary)]"
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <span className="text-sm">📘</span> Facebook
                          </a>
                          <a
                            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(getPostUrl(post.id))}&text=${encodeURIComponent(post.title || post.content.slice(0, 100))}`}
                            target="_blank" rel="noopener noreferrer"
                            onClick={countShare}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors text-[var(--text-secondary)]"
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <span className="text-sm">🐦</span> X (Twitter)
                          </a>
                          <a
                            href={`https://wa.me/?text=${encodeURIComponent((post.title || 'Publication SOS Shine') + ' ' + getPostUrl(post.id))}`}
                            target="_blank" rel="noopener noreferrer"
                            onClick={countShare}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors text-[var(--text-secondary)]"
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <span className="text-sm">💬</span> WhatsApp
                          </a>
                          <button
                            onClick={() => { navigator.clipboard.writeText(getPostUrl(post.id)); countShare(); setSocialShareId(null) }}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors w-full text-left cursor-pointer text-[var(--text-secondary)]"
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
                  <div className="px-6 pb-5 space-y-3 border-t border-[var(--border)]">
                    <div className="pt-4 space-y-3">
                      {(comments[post.id] || []).map(comment => (
                        <div key={comment.id} className="flex gap-2.5">
                          {comment.profiles?.avatar_url ? (
                            <img src={comment.profiles.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5" />
                          ) : (
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0 mt-0.5"
                              style={{ background: 'rgba(201,169,97,0.12)', color: 'var(--brand)' }}>
                              {comment.profiles?.prenom?.charAt(0).toUpperCase() || '?'}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold" style={{ color: comment.profiles?.role === 'founder' ? 'var(--brand)' : 'var(--text-primary)' }}>
                                {comment.profiles?.prenom || 'Membre'}
                              </span>
                              <span className="text-[10px] text-[var(--text-muted)]">{formatDate(comment.created_at)}</span>
                              {currentUserId === comment.author_id && (
                                <button onClick={() => deleteComment(comment.id, post.id)}
                                  className="text-[10px] cursor-pointer ml-auto text-[var(--text-muted)]">
                                  supprimer
                                </button>
                              )}
                            </div>
                            <p className="text-xs mt-0.5 leading-relaxed text-[var(--text-secondary)]">{comment.content}</p>
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
                          style={{ background: 'var(--brand)', color: 'var(--surface)' }}
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
          <div className="w-full max-w-sm rounded-2xl p-6 space-y-4 bg-[var(--surface-card)] border border-[var(--border)]">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[var(--text-primary)]">Envoyer en message privé</h3>
              <button onClick={() => setSharePostId(null)} className="p-1 cursor-pointer text-[var(--text-muted)]">
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
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all cursor-pointer disabled:opacity-50 text-[var(--text-primary)]"
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {member.avatar_url ? (
                    <img src={member.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                      style={{ background: 'rgba(201,169,97,0.12)', color: 'var(--brand)' }}>
                      {member.prenom?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                  <span className="flex-1 text-left">{member.prenom}</span>
                  {shareSending === member.id ? (
                    <div className="w-4 h-4 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                  )}
                </button>
              ))}
              {filteredShareMembers.length === 0 && (
                <p className="text-center text-xs py-4 text-[var(--text-muted)]">Aucun membre trouvé</p>
              )}
            </div>
          </div>
        </div>
      )}
      {/* ── Profile Drawer ── */}
      {profileDrawerUserId && (
        <ProfileDrawer
          userId={profileDrawerUserId}
          onClose={() => setProfileDrawerUserId(null)}
        />
      )}
    </div>
  )
}
