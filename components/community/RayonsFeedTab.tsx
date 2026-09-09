'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import AudioPlayer from '@/components/AudioPlayer'
import ShineIcon from '@/components/icons/ShineIcon'
import { getCategory } from '@/lib/community/categories'

type PostRow = {
  id: string
  author_id: string
  title: string
  content: string
  image_url: string | null
  video_url: string | null
  audio_url: string | null
  category: string
  media_type: string
  created_at: string
  author_prenom: string
  author_avatar: string | null
  author_role: string
  like_count: number
  comment_count: number
  user_has_liked: boolean
}

type CommentRow = {
  id: string
  post_id: string
  author_id: string
  content: string
  created_at: string
  prenom: string
  avatar_url: string | null
  role: string
}

/* Catégories : lib/community/categories.ts (source unique) */

function getCat(cat: string) {
  return getCategory(cat)
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
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
}

type Props = {
  onProfileClick?: (userId: string) => void
}

export default function RayonsFeedTab({ onProfileClick }: Props) {
  const [posts, setPosts] = useState<PostRow[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [expandedComments, setExpandedComments] = useState<string | null>(null)
  const [comments, setComments] = useState<Record<string, CommentRow[]>>({})
  const [commentText, setCommentText] = useState('')
  const [sendingComment, setSendingComment] = useState(false)

  const loadPosts = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setCurrentUserId(user.id)

    // Get confirmed Rayon connections
    const { data: connections } = await supabase
      .from('shine_connections')
      .select('sender_id, receiver_id')
      .eq('status', 'accepted')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)

    if (!connections || connections.length === 0) {
      setPosts([])
      setLoading(false)
      return
    }

    const rayonIds = connections.map(c =>
      c.sender_id === user.id ? c.receiver_id : c.sender_id
    )

    // Fetch posts from Rayons
    const { data: rawPosts } = await supabase
      .from('posts')
      .select('id, author_id, title, content, image_url, video_url, audio_url, category, media_type, created_at')
      .in('author_id', rayonIds)
      .eq('is_published', true)
      .in('post_type', ['community', 'eclat'])
      .order('created_at', { ascending: false })
      .limit(50)

    if (!rawPosts || rawPosts.length === 0) {
      setPosts([])
      setLoading(false)
      return
    }

    // Load profiles
    const authorIds = [...new Set(rawPosts.map(p => p.author_id))]
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, prenom, avatar_url, role')
      .in('id', authorIds)
    const profileMap = new Map((profiles || []).map(p => [p.id, p]))

    // Load like counts
    const postIds = rawPosts.map(p => p.id)
    const { data: likes } = await supabase.from('post_likes').select('post_id').in('post_id', postIds)
    const likeCountMap = new Map<string, number>()
    for (const l of (likes || [])) {
      likeCountMap.set(l.post_id, (likeCountMap.get(l.post_id) || 0) + 1)
    }

    // Load comment counts
    const { data: comms } = await supabase.from('post_comments').select('post_id').in('post_id', postIds)
    const commentCountMap = new Map<string, number>()
    for (const c of (comms || [])) {
      commentCountMap.set(c.post_id, (commentCountMap.get(c.post_id) || 0) + 1)
    }

    // User likes
    const { data: userLikes } = await supabase.from('post_likes').select('post_id').eq('user_id', user.id).in('post_id', postIds)
    const likedSet = new Set((userLikes || []).map(l => l.post_id))

    const enriched: PostRow[] = rawPosts.map(p => {
      const prof = profileMap.get(p.author_id)
      return {
        ...p,
        author_prenom: prof?.prenom || 'Membre',
        author_avatar: prof?.avatar_url || null,
        author_role: prof?.role || 'member',
        like_count: likeCountMap.get(p.id) || 0,
        comment_count: commentCountMap.get(p.id) || 0,
        user_has_liked: likedSet.has(p.id),
      }
    })

    setPosts(enriched)
    setLoading(false)
  }, [])

  useEffect(() => { loadPosts() }, [loadPosts])

  async function toggleLike(postId: string) {
    if (!currentUserId) return
    const post = posts.find(p => p.id === postId)
    if (!post) return
    const wasLiked = post.user_has_liked

    setPosts(prev => prev.map(p => p.id === postId ? {
      ...p,
      user_has_liked: !wasLiked,
      like_count: wasLiked ? Math.max(0, p.like_count - 1) : p.like_count + 1,
    } : p))

    const supabase = createClient()
    const { error } = wasLiked
      ? await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', currentUserId)
      : await supabase.from('post_likes').insert({ post_id: postId, user_id: currentUserId })

    if (error) {
      setPosts(prev => prev.map(p => p.id === postId ? {
        ...p,
        user_has_liked: wasLiked,
        like_count: wasLiked ? p.like_count + 1 : Math.max(0, p.like_count - 1),
      } : p))
    }
  }

  async function loadComments(postId: string) {
    const supabase = createClient()
    const { data: rawComments } = await supabase
      .from('post_comments')
      .select('id, post_id, author_id, content, created_at')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (!rawComments || rawComments.length === 0) {
      setComments(prev => ({ ...prev, [postId]: [] }))
      return
    }

    const authorIds = [...new Set(rawComments.map(c => c.author_id))]
    const { data: profiles } = await supabase.from('profiles').select('id, prenom, avatar_url, role').in('id', authorIds)
    const profileMap = new Map((profiles || []).map(p => [p.id, p]))

    const enriched: CommentRow[] = rawComments.map(c => {
      const prof = profileMap.get(c.author_id)
      return { ...c, prenom: prof?.prenom || 'Membre', avatar_url: prof?.avatar_url || null, role: prof?.role || 'member' }
    })
    setComments(prev => ({ ...prev, [postId]: enriched }))
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
    await supabase.from('post_comments').insert({ post_id: postId, author_id: currentUserId, content: commentText.trim() })
    setCommentText('')
    await loadComments(postId)
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comment_count: p.comment_count + 1 } : p))
    setSendingComment(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-16 rounded-2xl" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
        <div className="text-4xl mb-4">☀️</div>
        <h3 className="font-semibold text-[15px] mb-2" style={{ color: 'var(--text-primary)' }}>
          Aucune publication de vos Rayons
        </h3>
        <p className="text-sm max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>
          Connectez-vous avec d&apos;autres membres pour voir leurs publications ici.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map(post => {
        const catInfo = getCat(post.category)
        const isCommentsOpen = expandedComments === post.id
        return (
          <article key={post.id} className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
            <div className="p-5">
              {/* Author header */}
              <div className="flex items-center gap-3 mb-3">
                <button onClick={() => onProfileClick?.(post.author_id)} className="shrink-0 cursor-pointer">
                  {post.author_avatar ? (
                    <img src={post.author_avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
                      style={{ background: 'rgba(201,169,97,0.12)', color: 'var(--brand)' }}>
                      {post.author_prenom.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <button onClick={() => onProfileClick?.(post.author_id)}
                    className="text-sm font-semibold cursor-pointer hover:underline"
                    style={{ color: post.author_role === 'founder' ? 'var(--brand)' : 'var(--text-primary)' }}>
                    {post.author_prenom}
                  </button>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{formatDate(post.created_at)}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: `${catInfo.color}15`, color: catInfo.color }}>
                  <ShineIcon name={catInfo.icon} className="w-3.5 h-3.5" />
                  {catInfo.label}
                </span>
              </div>

              {/* Content */}
              {post.title && <h3 className="font-semibold text-base mb-1.5" style={{ color: catInfo.color }}>{post.title}</h3>}
              <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>{post.content}</p>

              {/* Media */}
 {post.image_url && <div className="mt-3 rounded-xl overflow-hidden w-full" ><img src={post.image_url} alt="" /></div>}
 {post.video_url && <div className="mt-3 rounded-xl overflow-hidden w-full" ><video src={post.video_url} controls controlsList="nodownload" onContextMenu={(e) => e.preventDefault()} /></div>}
              {post.audio_url && <div className="mt-3"><AudioPlayer src={post.audio_url} /></div>}
            </div>

            {/* Actions */}
            <div className="px-5 py-3 flex items-center gap-1" style={{ borderTop: '1px solid var(--border)' }}>
              <button onClick={() => toggleLike(post.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                style={{ color: post.user_has_liked ? '#C9A961' : 'var(--text-muted)' }}>
                <svg className="w-4 h-4" fill={post.user_has_liked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
                {post.like_count > 0 && <span>{post.like_count}</span>}
              </button>
              <button onClick={() => toggleComments(post.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                style={{ color: isCommentsOpen ? 'var(--brand)' : 'var(--text-muted)' }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                </svg>
                {post.comment_count > 0 && <span>{post.comment_count}</span>}
              </button>
            </div>

            {/* Comments */}
            {isCommentsOpen && (
              <div className="px-5 pb-4 space-y-3" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="pt-3 space-y-3">
                  {(comments[post.id] || []).map(comment => (
                    <div key={comment.id} className="flex gap-2.5">
                      {comment.avatar_url ? (
                        <img src={comment.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5" />
                      ) : (
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0 mt-0.5"
                          style={{ background: 'rgba(201,169,97,0.12)', color: 'var(--brand)' }}>
                          {comment.prenom.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold" style={{ color: comment.role === 'founder' ? 'var(--brand)' : 'var(--text-primary)' }}>
                            {comment.prenom}
                          </span>
                          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{formatDate(comment.created_at)}</span>
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
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                    />
                    <button
                      onClick={() => sendComment(post.id)}
                      disabled={sendingComment || !commentText.trim()}
                      className="px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-40"
                      style={{ background: 'var(--brand)', color: 'var(--dark)' }}
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
  )
}
