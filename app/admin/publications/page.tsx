'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import FileUpload from '@/components/FileUpload'
import type { Post } from '@/types/database'

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

const POST_TYPES: Post['post_type'][] = ['announcement', 'douleur_published', 'event_published', 'general']

const emptyForm = {
  title: '',
  content: '',
  post_type: 'general' as Post['post_type'],
  image_url: '',
}

export default function AdminPublications() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadPosts()
  }, [])

  async function loadPosts() {
    const supabase = createClient()
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
    setPosts((data as Post[]) || [])
    setLoading(false)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) return

    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    // Insertion avec les champs alignés sur le typage strict de la BDD
    const { error } = await supabase.from('posts').insert({
      title: form.title.trim(),
      content: form.content.trim(),
      post_type: form.post_type,
      image_url: form.image_url.trim() || null,
      author_id: user.id,
      is_published: false,
      category: 'partage', // <-- Remplacement de 'general' par une valeur valide
      media_type: form.image_url.trim() ? 'image' : 'text', 
      video_url: null 
    })

    if (!error) {
      setForm(emptyForm)
      setShowForm(false)
      await loadPosts()
    }
    setSaving(false)
  }

  async function togglePublish(post: Post) {
    setTogglingId(post.id)
    const willPublish = !post.is_published
    const supabase = createClient()
    await supabase
      .from('posts')
      .update({ is_published: willPublish })
      .eq('id', post.id)

    if (willPublish) {
      try {
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'new_post',
            title: 'Nouvelle publication',
            body: post.title,
            link: '/dashboard/mur',
          }),
        })
      } catch {
        // notification sending failed silently
      }
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

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Publications
          </h1>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
            Gerez les publications du mur communautaire.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 self-start"
          style={{
            background: showForm ? 'rgba(116,192,252,0.1)' : 'linear-gradient(135deg, #74C0FC, #4DA3E8)',
            color: showForm ? '#74C0FC' : '#fff',
            border: showForm ? '1px solid rgba(116,192,252,0.3)' : 'none',
          }}
        >
          {showForm ? 'Annuler' : '+ Nouvelle publication'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="rounded-xl p-6 space-y-5"
          style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}
        >
          <h2 className="font-semibold text-lg" style={{ color: '#74C0FC' }}>
            Nouvelle publication
          </h2>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Titre
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Titre de la publication..."
              className="w-full rounded-lg px-4 py-2.5 text-sm outline-none transition-colors"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Contenu
            </label>
            <textarea
              required
              rows={5}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Contenu de la publication..."
              className="w-full rounded-lg px-4 py-2.5 text-sm outline-none resize-y transition-colors"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Type de publication
              </label>
              <select
                value={form.post_type}
                onChange={(e) => setForm({ ...form, post_type: e.target.value as Post['post_type'] })}
                className="w-full rounded-lg px-4 py-2.5 text-sm outline-none transition-colors"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
              >
                {POST_TYPES.map((t) => (
                  <option key={t} value={t} style={{ background: '#111', color: '#E8E0D4' }}>
                    {POST_TYPE_CONFIG[t].icon} {POST_TYPE_CONFIG[t].label}
                  </option>
                ))}
              </select>
            </div>

            <FileUpload
              label="Image (optionnel)"
              accept="image/*"
              folder="posts"
              currentUrl={form.image_url || null}
              hint="JPG, PNG ou WebP"
              onUploaded={(url) => setForm({ ...form, image_url: url })}
              onRemoved={() => setForm({ ...form, image_url: '' })}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
              style={{ background: 'linear-gradient(135deg, #74C0FC, #4DA3E8)', color: '#fff' }}
            >
              {saving ? 'Enregistrement...' : 'Enregistrer la publication'}
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
            return (
              <div key={post.id} className="rounded-xl p-5 transition-all duration-200"
                style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
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
                        {post.is_published ? 'Publie' : 'Brouillon'}
                      </span>
                    </div>

                    <div className="flex items-start gap-3">
                      {post.image_url && (
                        <img src={post.image_url} alt="" className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                          {post.title}
                        </h3>
                        <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                          {post.content}
                        </p>
                      </div>
                    </div>

                    <p className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>
                      {formatDate(post.created_at)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => togglePublish(post)}
                      disabled={togglingId === post.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 disabled:opacity-50"
                      style={{
                        background: post.is_published ? 'rgba(255,107,85,0.1)' : 'rgba(85,239,196,0.1)',
                        color: post.is_published ? '#FF6B55' : '#55EFC4',
                        border: `1px solid ${post.is_published ? 'rgba(255,107,85,0.2)' : 'rgba(85,239,196,0.2)'}`,
                      }}>
                      {togglingId === post.id ? '...' : post.is_published ? 'Depublier' : 'Publier'}
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      disabled={deletingId === post.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 disabled:opacity-50"
                      style={{ background: 'rgba(255,75,75,0.08)', color: '#FF4B4B', border: '1px solid rgba(255,75,75,0.15)' }}>
                      {deletingId === post.id ? '...' : 'Supprimer'}
                    </button>
                  </div>
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
          {posts.filter((p) => p.is_published).length} publiee{posts.filter((p) => p.is_published).length > 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
