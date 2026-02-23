'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { PostWithAuthor } from '@/types/database'
import { useTranslation } from '@/lib/i18n/useTranslation'

export default function MurPage() {
  const { t } = useTranslation()
  const [posts, setPosts] = useState<PostWithAuthor[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [editingPost, setEditingPost] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setCurrentUserId(user.id)

      const { data } = await supabase
        .from('posts')
        .select('*, profiles(prenom, role, avatar_url)')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(50)

      if (data) setPosts(data as unknown as PostWithAuthor[])
      setLoading(false)
    }
    load()
  }, [])

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  function getTypeLabel(type: string) {
    const map: Record<string, { label: string; color: string; icon: string }> = {
      announcement: { label: t('dashboard.announcement'), color: '#D4AF37', icon: '📢' },
      douleur_published: { label: t('dashboard.new_challenge'), color: '#55EFC4', icon: '📘' },
      event_published: { label: t('dashboard.new_event'), color: '#74C0FC', icon: '📅' },
      general: { label: t('dashboard.publication'), color: 'var(--text-secondary)', icon: '💬' },
    }
    return map[type] || map.general
  }

  function startEdit(post: PostWithAuthor) {
    setEditingPost(post.id)
    setEditTitle(post.title)
    setEditContent(post.content)
    setMenuOpen(null)
  }

  async function saveEdit(postId: string) {
    if (!editTitle.trim() || !editContent.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('posts')
      .update({ title: editTitle.trim(), content: editContent.trim(), updated_at: new Date().toISOString() })
      .eq('id', postId)
      .eq('author_id', currentUserId!)

    if (!error) {
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, title: editTitle.trim(), content: editContent.trim() } : p))
      setEditingPost(null)
    }
    setSaving(false)
  }

  async function deletePost(postId: string) {
    if (!confirm(t('dashboard.delete_post_confirm'))) return
    const supabase = createClient()
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('author_id', currentUserId!)

    if (!error) {
      setPosts(prev => prev.filter(p => p.id !== postId))
    }
    setMenuOpen(null)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          {t('dashboard.wall_title')}
        </h1>
        <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
          {t('dashboard.wall_subtitle')}
        </p>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl" style={{ background: 'rgba(212,175,55,0.08)' }}>
            📋
          </div>
          <h3 className="font-display text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            {t('dashboard.wall_empty_title')}
          </h3>
          <p className="text-sm max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
            {t('dashboard.wall_empty_desc')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const typeInfo = getTypeLabel(post.post_type)
            const isOwner = currentUserId === post.author_id
            const isEditing = editingPost === post.id

            return (
              <article key={post.id} className="rounded-2xl p-6 relative" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
                {/* Post type badge + actions */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{typeInfo.icon}</span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: `${typeInfo.color}15`, color: typeInfo.color }}>
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
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                              </svg>
                              {t('common.edit')}
                            </button>
                            <button onClick={() => deletePost(post.id)}
                              className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors cursor-pointer"
                              style={{ color: '#EF4444' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                              {t('common.delete')}
                            </button>
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
                    <span className="text-sm font-semibold hover:underline" style={{ color: post.profiles?.role === 'founder' ? 'var(--gold)' : 'var(--text-primary)' }}>
                      {post.profiles?.prenom || 'SOS Shine'}
                    </span>
                    {post.profiles?.role === 'founder' && (
                      <span className="text-xs ml-2 px-1.5 py-0.5 rounded" style={{ background: 'rgba(212,175,55,0.15)', color: 'var(--gold)' }}>
                        {t('dashboard.founder')}
                      </span>
                    )}
                  </div>
                </Link>

                {/* Content — editable or display */}
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold outline-none"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
                    />
                    <textarea
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--dark-border)', color: 'var(--text-secondary)' }}
                    />
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => setEditingPost(null)}
                        className="px-4 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors"
                        style={{ color: 'var(--text-muted)', border: '1px solid var(--dark-border)' }}>
                        {t('common.cancel')}
                      </button>
                      <button onClick={() => saveEdit(post.id)} disabled={saving}
                        className="px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors disabled:opacity-50"
                        style={{ background: 'var(--gold)', color: 'var(--dark)' }}>
                        {saving ? t('dashboard.saving') : t('common.save')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>{post.title}</h3>
                    <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>{post.content}</p>

                    {post.image_url && (
                      <div className="mt-4 rounded-xl overflow-hidden">
                        <img src={post.image_url} alt="" className="w-full" />
                      </div>
                    )}
                  </>
                )}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
