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
  douleur_published: { label: 'Challenge publié', color: '#55EFC4', icon: '📘' },
  event_published: { label: 'Événement publié', color: '#74C0FC', icon: '📅' },
  general: { label: 'Général', color: '#9A9080', icon: '💬' },
  community: { label: 'Communauté', color: '#A29BFE', icon: '🌟' },
}

const CATEGORY_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  temoignage: { label: 'Témoignage', color: '#D4AF37', icon: '🗣️' },
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

  // Warning modal
  const [warningUserId, setWarningUserId] = useState<string | null>(null)
  const [warningUserName, setWarningUserName] = useState('')
  const [warningMessage, setWarningMessage] = useState('')
  const [sendingWarning, setSendingWarning] = useState(false)

  // Lock toggle
  const [lockingId, setLockingId] = useState<string | null>(null)

  // Error/success feedback
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

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

    if (error) {
      console.error('[Admin] Create error:', error)
      setActionError(`Impossible de creer: ${error.message} (code: ${error.code})`)
      setSaving(false)
      return
    }
    setForm(emptyForm)
    setShowForm(false)
    setActionSuccess('Publication creee.')
    setTimeout(() => setActionSuccess(null), 3000)
    await loadPosts()
    setSaving(false)
  }

  async function togglePublish(post: PostWithProfile) {
    setTogglingId(post.id)
    setActionError(null)
    const willPublish = !post.is_published
    const supabase = createClient()
    const { error } = await supabase.from('posts').update({ is_published: willPublish }).eq('id', post.id)

    if (error) {
      console.error('[Admin] Toggle publish error:', error)
      setActionError(`Impossible de ${willPublish ? 'publier' : 'masquer'}: ${error.message} (code: ${error.code})`)
      setTogglingId(null)
      return
    }

    if (willPublish) {
      try {
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'new_post', title: 'Nouvelle publication', body: post.title, link: '/dashboard/mur' }),
        })
      } catch { /* silent */ }
    }

    setActionSuccess(willPublish ? 'Publication rendue visible.' : 'Publication masquee.')
    setTimeout(() => setActionSuccess(null), 3000)
    await loadPosts()
    setTogglingId(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette publication ? Cette action est irreversible.')) return
    setDeletingId(id)
    setActionError(null)
    const supabase = createClient()
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (error) {
      console.error('[Admin] Delete error:', error)
      setActionError(`Impossible de supprimer: ${error.message} (code: ${error.code})`)
      setDeletingId(null)
      return
    }
    setActionSuccess('Publication supprimee.')
    setTimeout(() => setActionSuccess(null), 3000)
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
    setActionError(null)
    const supabase = createClient()
    const { error } = await supabase.from('post_comments').delete().eq('id', commentId)
    if (error) {
      console.error('[Admin] Delete comment error:', error)
      setActionError(`Impossible de supprimer le commentaire: ${error.message}`)
      setDeletingCommentId(null)
      return
    }
    setComments(prev => prev.filter(c => c.id !== commentId))
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
    setActionError(null)
    const supabase = createClient()
    const until = new Date()
    until.setDate(until.getDate() + days)
    const { error } = await supabase.from('profiles').update({ publish_banned_until: until.toISOString() }).eq('id', banUserId)
    setBanning(false)
    if (error) {
      console.error('[Admin] Ban error:', error)
      setActionError(`Impossible de bloquer: ${error.message} (code: ${error.code})`)
      return
    }
    setBanUserId(null)
    setActionSuccess(`Membre bloque pour ${days} jours.`)
    setTimeout(() => setActionSuccess(null), 3000)
  }

  async function unbanUser(userId: string) {
    setActionError(null)
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({ publish_banned_until: null }).eq('id', userId)
    if (error) {
      console.error('[Admin] Unban error:', error)
      setActionError(`Impossible de debloquer: ${error.message} (code: ${error.code})`)
      return
    }
    setActionSuccess('Blocage de publication leve.')
    setTimeout(() => setActionSuccess(null), 3000)
  }

  /* ── Lock / Unlock delete for a post ── */
  async function toggleDeleteLock(post: PostWithProfile) {
    setLockingId(post.id)
    setActionError(null)
    const newLocked = !post.delete_locked
    const supabase = createClient()
    const { error } = await supabase.from('posts').update({ delete_locked: newLocked }).eq('id', post.id)
    if (error) {
      console.error('[Admin] Toggle delete lock error:', error)
      setActionError(`Impossible de ${newLocked ? 'verrouiller' : 'deverrouiller'}: ${error.message} (code: ${error.code})`)
      setLockingId(null)
      return
    }
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, delete_locked: newLocked } : p))
    setActionSuccess(newLocked ? 'Suppression verrouillee — le membre ne peut plus supprimer cette publication.' : 'Suppression deverrouillee — le membre peut supprimer sa publication.')
    setTimeout(() => setActionSuccess(null), 4000)
    setLockingId(null)
  }

  /* ── Send warning notification to a user ── */
  async function sendWarning() {
    if (!warningUserId || !warningMessage.trim()) return
    setSendingWarning(true)
    setActionError(null)
    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'warning',
          target_user_id: warningUserId,
          title: 'Avertissement',
          body: warningMessage.trim(),
          link: '/dashboard/mur',
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setActionError(`Impossible d'envoyer l'avertissement: ${data.error || 'Erreur inconnue'}`)
        setSendingWarning(false)
        return
      }
      setWarningUserId(null)
      setWarningUserName('')
      setWarningMessage('')
      setActionSuccess('Avertissement envoye au membre.')
      setTimeout(() => setActionSuccess(null), 4000)
    } catch {
      setActionError("Erreur réseau lors de l'envoi de l'avertissement.")
    }
    setSendingWarning(false)
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const inputStyle = { background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text-primary)' }

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

      {/* ── Error / Success banners ── */}
      {actionError && (
        <div className="rounded-xl p-4 text-sm flex items-start gap-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}>
          <span className="flex-1">
            <p className="font-medium mb-0.5">Erreur</p>
            <p className="text-xs">{actionError}</p>
            <p className="text-[10px] mt-1 opacity-70">Verifiez que la migration SQL admin a bien ete executee dans Supabase.</p>
          </span>
          <button onClick={() => setActionError(null)} className="shrink-0 cursor-pointer" style={{ color: '#EF4444' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      {actionSuccess && (
        <div className="rounded-xl p-3 text-sm" style={{ background: 'rgba(85,239,196,0.08)', border: '1px solid rgba(85,239,196,0.2)', color: '#55EFC4' }}>
          {actionSuccess}
        </div>
      )}

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: 'all', label: 'Tout', color: 'var(--text-secondary)' },
          { value: 'community', label: 'Communauté', color: '#A29BFE' },
          { value: 'announcement', label: 'Annonces', color: '#D4AF37' },
          { value: 'general', label: 'General', color: '#9A9080' },
        ].map(f => (
          <button key={f.value} onClick={() => setFilterType(f.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
            style={{
              background: filterType === f.value ? `${f.color}20` : 'rgba(255,255,255,0.03)',
              border: `1px solid ${filterType === f.value ? `${f.color}50` : 'var(--border)'}`,
              color: filterType === f.value ? f.color : 'var(--text-muted)',
            }}>
            {f.label}
          </button>
        ))}
        <span className="mx-1" style={{ color: 'var(--border)' }}>|</span>
        {Object.entries(CATEGORY_CONFIG).map(([key, cat]) => (
          <button key={key} onClick={() => setFilterType(key)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
            style={{
              background: filterType === key ? `${cat.color}20` : 'rgba(255,255,255,0.03)',
              border: `1px solid ${filterType === key ? `${cat.color}50` : 'var(--border)'}`,
              color: filterType === key ? cat.color : 'var(--text-muted)',
            }}>
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="rounded-xl p-6 space-y-5" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
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
                      border: `1px solid ${form.category === key ? `${cat.color}50` : 'var(--border)'}`,
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
        <div className="text-center py-16 rounded-xl" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
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
                style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>

                {/* Author row with avatar */}
                <div className="flex items-center gap-3 mb-3">
                  {post.profiles?.avatar_url ? (
                    <img src={post.profiles.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
                      style={{ background: 'rgba(212,175,55,0.12)', color: 'var(--brand)' }}>
                      {post.profiles?.prenom?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold truncate" style={{ color: post.profiles?.role === 'founder' ? 'var(--brand)' : 'var(--text-primary)' }}>
                        {post.profiles?.prenom || 'Inconnu'}
                      </span>
                      {post.profiles?.role === 'founder' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(212,175,55,0.15)', color: 'var(--brand)' }}>Fondateur</span>
                      )}
                    </div>
                    <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{formatDate(post.created_at)}</span>
                  </div>

                  {/* Moderation buttons for non-founder posts */}
                  {post.profiles?.role !== 'founder' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => { setWarningUserId(post.author_id); setWarningUserName(post.profiles?.prenom || 'Ce membre') }}
                        className="px-2 py-1 rounded-lg text-[10px] font-medium transition-all cursor-pointer"
                        style={{ color: '#F59E0B', border: '1px solid rgba(245,158,11,0.25)' }}
                        title="Envoyer un avertissement"
                      >
                        Avertir
                      </button>
                      <button
                        onClick={() => { setBanUserId(post.author_id); setBanUserName(post.profiles?.prenom || 'Ce membre') }}
                        className="px-2 py-1 rounded-lg text-[10px] font-medium transition-all cursor-pointer"
                        style={{ color: '#FF6B55', border: '1px solid rgba(255,107,85,0.2)' }}
                        title="Bloquer ce membre"
                      >
                        Bloquer
                      </button>
                    </div>
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
                  {post.delete_locked && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
                      style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                      Suppression verrouillee
                    </span>
                  )}
                  {/* Stats */}
                  {likeCount > 0 && (
                    <span className="text-[11px] flex items-center gap-1" style={{ color: '#D4AF37' }}>
                      ⭐ {likeCount} Shines
                    </span>
                  )}
                  {commentCount > 0 && (
                    <button onClick={() => openComments(post.id)}
                      className="text-[11px] flex items-center gap-1 cursor-pointer underline"
                      style={{ color: 'var(--brand)' }}>
                      💬 {commentCount} commentaire{commentCount > 1 ? 's' : ''}
                    </button>
                  )}
                </div>

                {/* Content preview */}
                <div className="flex items-start gap-3 mb-3">
                  {post.image_url && (
                    <img src={post.image_url} alt="" className="w-16 h-16 object-contain rounded-lg flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{post.title}</h3>
                    <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{post.content}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 flex-wrap" style={{ borderTop: '1px solid var(--border)' }}>
                  <button onClick={() => togglePublish(post)} disabled={togglingId === post.id}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 cursor-pointer"
                    style={{
                      background: post.is_published ? 'rgba(255,107,85,0.1)' : 'rgba(85,239,196,0.1)',
                      color: post.is_published ? '#FF6B55' : '#55EFC4',
                      border: `1px solid ${post.is_published ? 'rgba(255,107,85,0.2)' : 'rgba(85,239,196,0.2)'}`,
                    }}>
                    {togglingId === post.id ? '...' : post.is_published ? 'Masquer' : 'Rendre visible'}
                  </button>

                  {/* Lock/Unlock delete — only for non-founder posts */}
                  {post.profiles?.role !== 'founder' && (
                    <button onClick={() => toggleDeleteLock(post)} disabled={lockingId === post.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                      style={{
                        background: post.delete_locked ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.03)',
                        color: post.delete_locked ? '#F59E0B' : 'var(--text-muted)',
                        border: `1px solid ${post.delete_locked ? 'rgba(245,158,11,0.25)' : 'var(--border)'}`,
                      }}
                      title={post.delete_locked ? 'Deverrouiller la suppression' : 'Verrouiller la suppression (empecher le membre de supprimer)'}>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        {post.delete_locked ? (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        )}
                      </svg>
                      {lockingId === post.id ? '...' : post.delete_locked ? 'Deverrouiller' : 'Verrouiller suppr.'}
                    </button>
                  )}

                  {commentCount > 0 && (
                    <button onClick={() => openComments(post.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                      style={{ background: 'rgba(212,175,55,0.08)', color: 'var(--brand)', border: '1px solid rgba(212,175,55,0.2)' }}>
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
          <div className="w-full max-w-lg rounded-2xl p-6 space-y-4 max-h-[80vh] overflow-y-auto" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
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
                <div className="w-6 h-6 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-center text-sm py-6" style={{ color: 'var(--text-muted)' }}>Aucun commentaire</p>
            ) : (
              <div className="space-y-3">
                {comments.map(comment => (
                  <div key={comment.id} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                    <div className="flex items-start gap-3">
                      {comment.profiles?.avatar_url ? (
                        <img src={comment.profiles.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                          style={{ background: 'rgba(212,175,55,0.12)', color: 'var(--brand)' }}>
                          {comment.profiles?.prenom?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold" style={{ color: comment.profiles?.role === 'founder' ? 'var(--brand)' : 'var(--text-primary)' }}>
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
          <div className="w-full max-w-sm rounded-2xl p-6 space-y-5" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
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

      {/* ── Warning modal ── */}
      {warningUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md rounded-2xl p-6 space-y-5" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg flex items-center gap-2" style={{ color: '#F59E0B' }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                Avertir {warningUserName}
              </h3>
              <button onClick={() => { setWarningUserId(null); setWarningMessage('') }} className="p-1 cursor-pointer" style={{ color: 'var(--text-muted)' }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Envoyez un avertissement a ce membre. Il recevra une notification dans son espace.
            </p>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Message d&apos;avertissement</label>
              <textarea
                rows={4}
                value={warningMessage}
                onChange={(e) => setWarningMessage(e.target.value)}
                placeholder="Votre publication ne respecte pas les règles de la communauté. Merci de corriger..."
                className="w-full rounded-lg px-4 py-2.5 text-sm outline-none resize-y"
                style={inputStyle}
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => { setWarningUserId(null); setWarningMessage('') }}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
              >
                Annuler
              </button>
              <button
                onClick={sendWarning}
                disabled={sendingWarning || !warningMessage.trim()}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#fff' }}
              >
                {sendingWarning ? 'Envoi...' : 'Envoyer l\'avertissement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
