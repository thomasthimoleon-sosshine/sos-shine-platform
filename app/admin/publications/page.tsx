'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import FileUpload from '@/components/FileUpload'
import type { Post, PostCategory, PostCommentWithAuthor } from '@/types/database'

type PostWithProfile = Post & {
  profiles: { prenom: string; role: string; avatar_url: string | null } | null
  post_likes: { count: number }[]
  post_comments: { count: number }[]
}

const POST_TYPE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  announcement: { label: 'Annonce', color: '#D4AF37', icon: '📢' },
  douleur_published: { label: 'Challenge publie', color: '#55EFC4', icon: '📘' },
  event_published: { label: 'Evenement publie', color: '#74C0FC', icon: '📅' },
  general: { label: 'General', color: '#9A9080', icon: '💬' },
  community: { label: 'Communaute', color: '#A29BFE', icon: '🌟' },
}

const CATEGORY_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  temoignage: { label: 'Temoignage', color: '#D4AF37', icon: '🗣️' },
  partage: { label: "Partage d'exp.", color: '#74C0FC', icon: '💫' },
  question: { label: 'Question', color: '#A29BFE', icon: '❓' },
  remerciements: { label: 'Remerciements', color: '#55EFC4', icon: '🙏' },
  gratitude: { label: 'Gratitude', color: '#FFEAA7', icon: '✨' },
  citation: { label: 'Citation', color: '#FD79A8', icon: '💬' },
}

const POST_TYPES: Post['post_type'][] = ['community', 'announcement', 'douleur_published', 'event_published', 'general']

const BAN_DURATIONS = [
  { label: '5 jours', days: 5 },
  { label: '10 jours', days: 10 },
  { label: '15 jours', days: 15 },
  { label: '1 mois', days: 30 },
]

const emptyForm = {
  title: '',
  content: '',
  post_type: 'community' as Post['post_type'],
  category: 'partage' as PostCategory,
  image_url: '',
}

export default function AdminPublications() {
  const [posts, setPosts] = useState<PostWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Filter
  const [filterType, setFilterType] = useState<string>('all')

  // Comments panel
  const [commentsPostId, setCommentsPostId] = useState<string | null>(null)
  const [comments, setComments] = useState<PostCommentWithAuthor[]>([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null)

  // Ban modal
  const [banUserId, setBanUserId] = useState<string | null>(null)
  const [banUserName, setBanUserName] = useState('')
  const [banning, setBanning] = useState(false)

  const loadPosts = useCallback(async () => {
    const supabase = createClient()

    // Load posts without fragile FK joins
    let query = supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (filterType !== 'all') {
      if (Object.keys(CATEGORY_CONFIG).includes(filterType)) {
        query = query.eq('category', filterType as PostCategory)
      } else {
        query = query.eq('post_type', filterType as Post['post_type'])
      }
    }

    const { data: rawPostsData } = await query
    const rawPosts = (rawPostsData || []) as Post[]

    if (rawPosts.length === 0) {
      setPosts([])
      setLoading(false)
      return
    }

    // Load profiles separately
    const authorIds = [...new Set(rawPosts.map(p => p.author_id))]
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, prenom, role, avatar_url')
      .in('id', authorIds)

    const profileMap = new Map(
      (profiles || []).map((pr: { id: string; prenom: string; role: string; avatar_url: string | null }) => [pr.id, pr])
    )

    // Load like/comment counts
    const postIds = rawPosts.map(p => p.id)
    const { data: likesData } = await supabase.from('post_likes').select('post_id').in('post_id', postIds)
    const likes = (likesData || []) as { post_id: string }[]
    const { data: commentData } = await supabase.from('post_comments').select('post_id').in('post_id', postIds)
    const commentRows = (commentData || []) as { post_id: string }[]

    const likeMap = new Map<string, number>()
    for (const l of likes) likeMap.set(l.post_id, (likeMap.get(l.post_id) || 0) + 1)

    const commentMap = new Map<string, number>()
    for (const c of commentRows) commentMap.set(c.post_id, (commentMap.get(c.post_id) || 0) + 1)

    const enriched: PostWithProfile[] = rawPosts.map(p => {
      const prof = profileMap.get(p.author_id)
      return {
        ...p,
        profiles: prof ? { prenom: prof.prenom, role: prof.role, avatar_url: prof.avatar_url } : null,
        post_likes: [{ count: likeMap.get(p.id) || 0 }],
        post_comments: [{ count: commentMap.get(p.id) || 0 }],
      } as PostWithProfile
    })

    setPosts(enriched)
    setLoading(false)
  }, [filterType])

  useEffect(() => { loadPosts() }, [loadPosts])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) return

    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    const { error } = await supabase.from('posts').insert({
      title: form.title.trim(),
      content: form.content.trim(),
      post_type: form.post_type,
      category: form.post_type === 'community' ? form.category : 'partage',
      media_type: form.image_url.trim() ? 'image' : 'text',
      image_url: form.image_url.trim() || null,
      video_url: null,
      author_id: user.id,
      is_published: false,
    })

    if (!error) {
      setForm(emptyForm)
      setShowForm(false)
      await loadPosts()
    }
    setSaving(false)
  }

  async function togglePublish(post: PostWithProfile) {
    setTogglingId(post.id)
    const willPublish = !post.is_published
    const supabase = createClient()
    await supabase.from('posts').update({ is_published: willPublish }).eq('id', post.id)

    if (willPublish) {
      try {
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'new_post', title: 'Nouvelle publication', body: post.title, link: '/dashboard/mur' }),
        })
      } catch { /* silent */ }
    }

    await loadPosts()
    setTogglingId(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette publication ? Cette action est irreversible.')) return
    setDeletingId(id)
    const supabase = createClient()
    await supabase.from('posts').delete().eq('id', id)
    await loadPosts()
    setDeletingId(null)
  }

  /* ── Comments moderation ── */
  async function openComments(postId: string) {
    setCommentsPostId(postId)
    setLoadingComments(true)
    const supabase = createClient()

    // Load comments
    const { data: rawCommentsData } = await supabase
      .from('post_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: false })

    const rawComments = (rawCommentsData || []) as { id: string; post_id: string; author_id: string; content: string; created_at: string }[]

    if (rawComments.length === 0) {
      setComments([])
      setLoadingComments(false)
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

    setComments(enriched as unknown as PostCommentWithAuthor[])
    setLoadingComments(false)
  }

  async function deleteComment(commentId: string) {
    setDeletingCommentId(commentId)
    const supabase = createClient()
    await supabase.from('post_comments').delete().eq('id', commentId)
    setComments(prev => prev.filter(c => c.id !== commentId))
    // Update count on the post
    setPosts(prev => prev.map(p => p.id === commentsPostId
      ? { ...p, post_comments: [{ count: Math.max(0, (p.post_comments?.[0]?.count || 1) - 1) }] }
      : p
    ))
    setDeletingCommentId(null)
  }

  /* ── Ban / Unban member from publishing ── */
  async function banUser(days: number) {
    if (!banUserId) return
    setBanning(true)
    const supabase = createClient()
    const until = new Date()
    until.setDate(until.getDate() + days)
    await supabase.from('profiles').update({ publish_banned_until: until.toISOString() }).eq('id', banUserId)
    setBanning(false)
    setBanUserId(null)
    alert(`Membre bloque pour ${days} jours.`)
  }

  async function unbanUser(userId: string) {
    const supabase = createClient()
    await supabase.from('profiles').update({ publish_banned_until: null }).eq('id', userId)
    alert('Blocage de publication leve.')
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const inputStyle = { background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Publications & Moderation
          </h1>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
            Gerez les publications, moderez les commentaires, bloquez les abus.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 self-start cursor-pointer"
          style={{
            background: showForm ? 'rgba(116,192,252,0.1)' : 'linear-gradient(135deg, #74C0FC, #4DA3E8)',
            color: showForm ? '#74C0FC' : '#fff',
            border: showForm ? '1px solid rgba(116,192,252,0.3)' : 'none',
          }}
        >
          {showForm ? 'Annuler' : '+ Nouvelle publication'}
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: 'all', label: 'Tout', color: 'var(--text-secondary)' },
          { value: 'community', label: 'Communaute', color: '#A29BFE' },
          { value: 'announcement', label: 'Annonces', color: '#D4AF37' },
          { value: 'general', label: 'General', color: '#9A9080' },
        ].map(f => (
          <button key={f.value} onClick={() => setFilterType(f.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
            style={{
              background: filterType === f.value ? `${f.color}20` : 'rgba(255,255,255,0.03)',
              border: `1px solid ${filterType === f.value ? `${f.color}50` : 'var(--dark-border)'}`,
              color: filterType === f.value ? f.color : 'var(--text-muted)',
            }}>
            {f.label}
          </button>
        ))}
        <span className="mx-1" style={{ color: 'var(--dark-border)' }}>|</span>
        {Object.entries(CATEGORY_CONFIG).map(([key, cat]) => (
          <button key={key} onClick={() => setFilterType(key)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
            style={{
              background: filterType === key ? `${cat.color}20` : 'rgba(255,255,255,0.03)',
              border: `1px solid ${filterType === key ? `${cat.color}50` : 'var(--dark-border)'}`,
              color: filterType === key ? cat.color : 'var(--text-muted)',
            }}>
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="rounded-xl p-6 space-y-5" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
          <h2 className="font-semibold text-lg" style={{ color: '#74C0FC' }}>Nouvelle publication</h2>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Titre</label>
            <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Titre de la publication..." className="w-full rounded-lg px-4 py-2.5 text-sm outline-none" style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Contenu</label>
            <textarea required rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Contenu..." className="w-full rounded-lg px-4 py-2.5 text-sm outline-none resize-y" style={inputStyle} />
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Type</label>
              <select value={form.post_type} onChange={(e) => setForm({ ...form, post_type: e.target.value as Post['post_type'] })}
                className="w-full rounded-lg px-4 py-2.5 text-sm outline-none" style={inputStyle}>
                {POST_TYPES.map((t) => (
                  <option key={t} value={t} style={{ background: '#111', color: '#E8E0D4' }}>
                    {POST_TYPE_CONFIG[t].icon} {POST_TYPE_CONFIG[t].label}
                  </option>
                ))}
              </select>
            </div>
            <FileUpload label="Image (optionnel)" accept="image/*" folder="posts" currentUrl={form.image_url || null} hint="JPG, PNG ou WebP"
              onUploaded={(url) => setForm({ ...form, image_url: url })} onRemoved={() => setForm({ ...form, image_url: '' })} />
          </div>
          {form.post_type === 'community' && (
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Categorie</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(CATEGORY_CONFIG).map(([key, cat]) => (
                  <button key={key} type="button"
                    onClick={() => setForm({ ...form, category: key as PostCategory })}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                    style={{
                      background: form.category === key ? `${cat.color}20` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${form.category === key ? `${cat.color}50` : 'var(--dark-border)'}`,
                      color: form.category === key ? cat.color : 'var(--text-muted)',
                    }}>
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #74C0FC, #4DA3E8)', color: '#fff' }}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      )}

      {/* Posts List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#74C0FC] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 rounded-xl" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
          <p className="text-4xl mb-3">📢</p>
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Aucune publication</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Cliquez sur &quot;Nouvelle publication&quot; pour commencer.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => {
            const config = POST_TYPE_CONFIG[post.post_type] || POST_TYPE_CONFIG.general
            const catConfig = post.post_type === 'community' && post.category ? CATEGORY_CONFIG[post.category] : null
            const likeCount = post.post_likes?.[0]?.count || 0
            const commentCount = post.post_comments?.[0]?.count || 0

            return (
              <div key={post.id} className="rounded-xl p-5 transition-all duration-200"
                style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>

                {/* Author row with avatar */}
                <div className="flex items-center gap-3 mb-3">
                  {post.profiles?.avatar_url ? (
                    <img src={post.profiles.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
                      style={{ background: 'rgba(212,175,55,0.12)', color: 'var(--gold)' }}>
                      {post.profiles?.prenom?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold truncate" style={{ color: post.profiles?.role === 'founder' ? 'var(--gold)' : 'var(--text-primary)' }}>
                        {post.profiles?.prenom || 'Inconnu'}
                      </span>
                      {post.profiles?.role === 'founder' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(212,175,55,0.15)', color: 'var(--gold)' }}>Fondateur</span>
                      )}
                    </div>
                    <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{formatDate(post.created_at)}</span>
                  </div>

                  {/* Moderation: Ban button for non-founder posts */}
                  {post.post_type === 'community' && post.profiles?.role !== 'founder' && (
                    <button
                      onClick={() => { setBanUserId(post.author_id); setBanUserName(post.profiles?.prenom || 'Ce membre') }}
                      className="px-2 py-1 rounded-lg text-[10px] font-medium transition-all cursor-pointer"
                      style={{ color: '#FF6B55', border: '1px solid rgba(255,107,85,0.2)' }}
                      title="Bloquer ce membre"
                    >
                      Bloquer
                    </button>
                  )}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{ background: `${config.color}15`, color: config.color }}>
                    <span className="text-[10px]">{config.icon}</span>
                    {config.label}
                  </span>
                  {catConfig && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
                      style={{ background: `${catConfig.color}15`, color: catConfig.color }}>
                      <span className="text-[10px]">{catConfig.icon}</span>
                      {catConfig.label}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
                    style={{
                      background: post.is_published ? 'rgba(85,239,196,0.1)' : 'rgba(255,107,85,0.1)',
                      color: post.is_published ? '#55EFC4' : '#FF6B55',
                    }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: post.is_published ? '#55EFC4' : '#FF6B55' }} />
                    {post.is_published ? 'Visible' : 'Masque'}
                  </span>
                  {/* Stats */}
                  {likeCount > 0 && (
                    <span className="text-[11px] flex items-center gap-1" style={{ color: '#EF4444' }}>
                      ❤️ {likeCount}
                    </span>
                  )}
                  {commentCount > 0 && (
                    <button onClick={() => openComments(post.id)}
                      className="text-[11px] flex items-center gap-1 cursor-pointer underline"
                      style={{ color: 'var(--gold)' }}>
                      💬 {commentCount} commentaire{commentCount > 1 ? 's' : ''}
                    </button>
                  )}
                </div>

                {/* Content preview */}
                <div className="flex items-start gap-3 mb-3">
                  {post.image_url && (
                    <img src={post.image_url} alt="" className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{post.title}</h3>
                    <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{post.content}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2" style={{ borderTop: '1px solid var(--dark-border)' }}>
                  <button onClick={() => togglePublish(post)} disabled={togglingId === post.id}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 cursor-pointer"
                    style={{
                      background: post.is_published ? 'rgba(255,107,85,0.1)' : 'rgba(85,239,196,0.1)',
                      color: post.is_published ? '#FF6B55' : '#55EFC4',
                      border: `1px solid ${post.is_published ? 'rgba(255,107,85,0.2)' : 'rgba(85,239,196,0.2)'}`,
                    }}>
                    {togglingId === post.id ? '...' : post.is_published ? 'Masquer' : 'Rendre visible'}
                  </button>

                  {commentCount > 0 && (
                    <button onClick={() => openComments(post.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                      style={{ background: 'rgba(212,175,55,0.08)', color: 'var(--gold)', border: '1px solid rgba(212,175,55,0.2)' }}>
                      Moderer les commentaires
                    </button>
                  )}

                  <button onClick={() => handleDelete(post.id)} disabled={deletingId === post.id}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 ml-auto cursor-pointer"
                    style={{ background: 'rgba(255,75,75,0.08)', color: '#FF4B4B', border: '1px solid rgba(255,75,75,0.15)' }}>
                    {deletingId === post.id ? '...' : 'Supprimer'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!loading && posts.length > 0 && (
        <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
          {posts.length} publication{posts.length > 1 ? 's' : ''} au total
          {' '}&middot;{' '}
          {posts.filter((p) => p.is_published).length} visible{posts.filter((p) => p.is_published).length > 1 ? 's' : ''}
        </p>
      )}

      {/* ── Comments moderation modal ── */}
      {commentsPostId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-lg rounded-2xl p-6 space-y-4 max-h-[80vh] overflow-y-auto" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>Moderation des commentaires</h3>
              <button onClick={() => setCommentsPostId(null)} className="p-1 cursor-pointer" style={{ color: 'var(--text-muted)' }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {loadingComments ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-center text-sm py-6" style={{ color: 'var(--text-muted)' }}>Aucun commentaire</p>
            ) : (
              <div className="space-y-3">
                {comments.map(comment => (
                  <div key={comment.id} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)' }}>
                    <div className="flex items-start gap-3">
                      {comment.profiles?.avatar_url ? (
                        <img src={comment.profiles.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                          style={{ background: 'rgba(212,175,55,0.12)', color: 'var(--gold)' }}>
                          {comment.profiles?.prenom?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold" style={{ color: comment.profiles?.role === 'founder' ? 'var(--gold)' : 'var(--text-primary)' }}>
                            {comment.profiles?.prenom || 'Membre'}
                          </span>
                          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{formatDate(comment.created_at)}</span>
                        </div>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{comment.content}</p>
                      </div>
                      <button
                        onClick={() => deleteComment(comment.id)}
                        disabled={deletingCommentId === comment.id}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer disabled:opacity-50 shrink-0"
                        style={{ color: '#FF4B4B', border: '1px solid rgba(255,75,75,0.2)' }}
                      >
                        {deletingCommentId === comment.id ? '...' : 'Supprimer'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Ban modal ── */}
      {banUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6 space-y-5" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>Bloquer {banUserName}</h3>
              <button onClick={() => setBanUserId(null)} className="p-1 cursor-pointer" style={{ color: 'var(--text-muted)' }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Empecher ce membre de publier sur le mur communautaire pendant une periode donnee.
            </p>

            <div className="space-y-2">
              {BAN_DURATIONS.map(d => (
                <button
                  key={d.days}
                  onClick={() => banUser(d.days)}
                  disabled={banning}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer disabled:opacity-50"
                  style={{ background: 'rgba(255,107,85,0.06)', border: '1px solid rgba(255,107,85,0.15)', color: '#FF6B55' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,107,85,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,107,85,0.06)'}
                >
                  <span>Bloquer {d.label}</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>→ {new Date(Date.now() + d.days * 86400000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => { unbanUser(banUserId); setBanUserId(null) }}
              className="w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer"
              style={{ background: 'rgba(85,239,196,0.08)', border: '1px solid rgba(85,239,196,0.2)', color: '#55EFC4' }}
            >
              Debloquer ce membre
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
