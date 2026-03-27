'use client'

import { useEffect, useState, useCallback } from 'react'
import { BLOG_CATEGORIES } from '@/data/blog/articles'

interface BlogArticle {
  id: string
  slug: string
  title: string
  subtitle: string
  excerpt: string
  meta_title: string
  meta_description: string
  author_name: string
  author_role: string
  published_at: string
  read_time: number
  category: string
  tags: string[]
  cover_image: string | null
  featured: boolean
  content: string
  is_published: boolean
  created_at: string
}

const emptyForm = {
  slug: '',
  title: '',
  subtitle: '',
  excerpt: '',
  meta_title: '',
  meta_description: '',
  author_name: '',
  author_role: '',
  published_at: new Date().toISOString().split('T')[0],
  read_time: 5,
  category: 'transformation',
  tags: '' as string,
  cover_image: '',
  featured: false,
  content: '',
  is_published: true,
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function AdminBlog() {
  const [articles, setArticles] = useState<BlogArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [tableExists, setTableExists] = useState(true)
  const [creatingTable, setCreatingTable] = useState(false)

  const loadArticles = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/blog')
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          setArticles(data)
          setTableExists(true)
        }
      } else {
        const err = await res.json()
        if (err.error?.includes('does not exist') || err.error?.includes('relation')) {
          setTableExists(false)
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadArticles() }, [loadArticles])

  async function createTable() {
    setCreatingTable(true)
    try {
      await loadArticles()
    } catch {
      // ignore
    } finally {
      setCreatingTable(false)
    }
  }

  function openNew() {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(true)
  }

  function openEdit(article: BlogArticle) {
    setForm({
      slug: article.slug,
      title: article.title,
      subtitle: article.subtitle || '',
      excerpt: article.excerpt || '',
      meta_title: article.meta_title || '',
      meta_description: article.meta_description || '',
      author_name: article.author_name || '',
      author_role: article.author_role || '',
      published_at: article.published_at || '',
      read_time: article.read_time || 5,
      category: article.category || 'transformation',
      tags: (article.tags || []).join(', '),
      cover_image: article.cover_image || '',
      featured: article.featured || false,
      content: article.content || '',
      is_published: article.is_published ?? true,
    })
    setEditingId(article.id)
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.title.trim() || !form.content.trim()) return
    setSaving(true)

    const slug = form.slug || slugify(form.title)
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)
    const payload = {
      ...form,
      slug,
      tags,
      meta_title: form.meta_title || form.title,
      meta_description: form.meta_description || form.excerpt,
    }

    try {
      if (editingId) {
        await fetch('/api/admin/blog', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...payload }),
        })
      } else {
        await fetch('/api/admin/blog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }
      setShowForm(false)
      setEditingId(null)
      setForm(emptyForm)
      await loadArticles()
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cet article ?')) return
    setDeletingId(id)
    try {
      await fetch(`/api/admin/blog?id=${id}`, { method: 'DELETE' })
      await loadArticles()
    } catch {
      // ignore
    } finally {
      setDeletingId(null)
    }
  }

  async function togglePublish(article: BlogArticle) {
    await fetch('/api/admin/blog', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: article.id, is_published: !article.is_published }),
    })
    await loadArticles()
  }

  async function toggleFeatured(article: BlogArticle) {
    await fetch('/api/admin/blog', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: article.id, featured: !article.featured }),
    })
    await loadArticles()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#74C0FC] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!tableExists) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-6">
        <h1 className="text-2xl font-display font-semibold" style={{ color: '#74C0FC' }}>
          Blog - Configuration requise
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          La table <code className="px-2 py-0.5 rounded" style={{ background: 'rgba(116,192,252,0.1)', color: '#74C0FC' }}>blog_articles</code> n&apos;existe pas encore dans votre base de donn&eacute;es Supabase.
        </p>
        <div className="rounded-xl p-6 text-left" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
          <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
            Ex&eacute;cutez ce SQL dans l&apos;&eacute;diteur SQL de Supabase :
          </p>
          <pre className="text-xs p-4 rounded-lg overflow-x-auto" style={{ background: 'rgba(0,0,0,0.3)', color: '#74C0FC' }}>{`CREATE TABLE blog_articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  excerpt TEXT DEFAULT '',
  meta_title TEXT DEFAULT '',
  meta_description TEXT DEFAULT '',
  author_name TEXT DEFAULT 'SOS Shine',
  author_role TEXT DEFAULT '',
  published_at DATE DEFAULT CURRENT_DATE,
  read_time INT DEFAULT 5,
  category TEXT DEFAULT 'transformation',
  tags TEXT[] DEFAULT '{}',
  cover_image TEXT,
  featured BOOLEAN DEFAULT false,
  content TEXT DEFAULT '',
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE blog_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published articles"
  ON blog_articles FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can manage articles"
  ON blog_articles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('founder', 'admin_content', 'admin_support')
    )
  );`}</pre>
        </div>
        <button
          onClick={createTable}
          disabled={creatingTable}
          className="px-6 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer"
          style={{ background: '#74C0FC', color: '#050505' }}
        >
          {creatingTable ? 'V\u00e9rification...' : 'V\u00e9rifier \u00e0 nouveau'}
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold" style={{ color: '#74C0FC' }}>
            Blog
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {articles.length} article{articles.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={openNew}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer hover:scale-[1.02]"
          style={{ background: '#74C0FC', color: '#050505' }}
        >
          + Nouvel article
        </button>
      </div>

      {/* Article list */}
      <div className="space-y-3">
        {articles.length === 0 && (
          <div className="text-center py-16 rounded-2xl" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
            <p className="text-4xl mb-4">✍️</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Aucun article pour le moment</p>
            <button onClick={openNew} className="mt-4 text-sm font-medium cursor-pointer" style={{ color: '#74C0FC' }}>
              Cr&eacute;er le premier article
            </button>
          </div>
        )}

        {articles.map((article) => {
          const cat = BLOG_CATEGORIES.find(c => c.slug === article.category)
          return (
            <div
              key={article.id}
              className="flex items-start gap-4 p-4 rounded-xl transition-all"
              style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {!article.is_published && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444' }}>
                      Brouillon
                    </span>
                  )}
                  {article.featured && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37' }}>
                      En vedette
                    </span>
                  )}
                  {cat && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: `${cat.color}15`, color: cat.color }}>
                      {cat.label}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                  {article.title}
                </h3>
                <p className="text-xs mt-1 line-clamp-1" style={{ color: 'var(--text-muted)' }}>
                  {article.excerpt}
                </p>
                <div className="flex items-center gap-3 mt-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  <span>{article.author_name}</span>
                  <span>{article.published_at}</span>
                  <span>{article.read_time} min</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => togglePublish(article)}
                  className="text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                  style={{
                    background: article.is_published ? 'rgba(85,239,196,0.1)' : 'rgba(239,68,68,0.1)',
                    color: article.is_published ? '#55EFC4' : '#EF4444',
                    border: `1px solid ${article.is_published ? 'rgba(85,239,196,0.2)' : 'rgba(239,68,68,0.2)'}`,
                  }}
                >
                  {article.is_published ? 'Publi\u00e9' : 'Brouillon'}
                </button>
                <button
                  onClick={() => toggleFeatured(article)}
                  className="text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                  style={{
                    background: article.featured ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.03)',
                    color: article.featured ? '#D4AF37' : 'var(--text-muted)',
                    border: `1px solid ${article.featured ? 'rgba(212,175,55,0.2)' : 'var(--dark-border)'}`,
                  }}
                  title="Mettre en vedette"
                >
                  {article.featured ? '\u2605' : '\u2606'}
                </button>
                <button
                  onClick={() => openEdit(article)}
                  className="text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                  style={{ background: 'rgba(116,192,252,0.1)', color: '#74C0FC', border: '1px solid rgba(116,192,252,0.2)' }}
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(article.id)}
                  disabled={deletingId === article.id}
                  className="text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  {deletingId === article.id ? '...' : 'Supprimer'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Form modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-10 pb-10 px-4 overflow-y-auto"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowForm(false)}
        >
          <div
            className="w-full max-w-3xl rounded-2xl p-6 space-y-5"
            style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-display font-semibold" style={{ color: '#74C0FC' }}>
              {editingId ? 'Modifier l\u2019article' : 'Nouvel article'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Titre *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) })}
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
                  placeholder="Titre de l'article"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Slug (URL)</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
                  placeholder="mon-article"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Sous-titre</label>
                <input
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
                  placeholder="Sous-titre"
                />
              </div>

              {/* Excerpt */}
              <div className="md:col-span-2">
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Extrait</label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none resize-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
                  placeholder="Court r&eacute;sum&eacute; de l'article..."
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Cat&eacute;gorie</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
                >
                  {BLOG_CATEGORIES.map((cat) => (
                    <option key={cat.slug} value={cat.slug} style={{ background: '#0a0a0a' }}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Author */}
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Auteur</label>
                <input
                  value={form.author_name}
                  onChange={(e) => setForm({ ...form, author_name: e.target.value })}
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
                  placeholder="Nom de l'auteur"
                />
              </div>

              {/* Author Role */}
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>R&ocirc;le de l&apos;auteur</label>
                <input
                  value={form.author_role}
                  onChange={(e) => setForm({ ...form, author_role: e.target.value })}
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
                  placeholder="Ex: Th&eacute;rapeute holistique"
                />
              </div>

              {/* Date */}
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Date de publication</label>
                <input
                  type="date"
                  value={form.published_at}
                  onChange={(e) => setForm({ ...form, published_at: e.target.value })}
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
                />
              </div>

              {/* Read time */}
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Temps de lecture (min)</label>
                <input
                  type="number"
                  value={form.read_time}
                  onChange={(e) => setForm({ ...form, read_time: parseInt(e.target.value) || 5 })}
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
                  min={1}
                />
              </div>

              {/* Tags */}
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Tags (s&eacute;par&eacute;s par virgule)</label>
                <input
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
                  placeholder="tag1, tag2, tag3"
                />
              </div>

              {/* Cover image */}
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Image de couverture (URL)</label>
                <input
                  value={form.cover_image}
                  onChange={(e) => setForm({ ...form, cover_image: e.target.value })}
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
                  placeholder="https://..."
                />
              </div>

              {/* SEO */}
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Meta titre (SEO)</label>
                <input
                  value={form.meta_title}
                  onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
                  placeholder="Titre pour le SEO"
                />
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Meta description (SEO)</label>
                <input
                  value={form.meta_description}
                  onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
                  placeholder="Description pour le SEO"
                />
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>En vedette</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Publi&eacute;</span>
                </label>
              </div>

              {/* Content */}
              <div className="md:col-span-2">
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>
                  Contenu (Markdown) *
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={15}
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none resize-y font-mono"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
                  placeholder="## Mon titre&#10;&#10;Votre contenu en markdown..."
                />
                <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                  Utilisez ## pour les titres, **gras**, *italique*, - pour les listes
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-xl text-sm cursor-pointer"
                style={{ color: 'var(--text-muted)', border: '1px solid var(--dark-border)' }}
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.title.trim() || !form.content.trim()}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all hover:scale-[1.02] disabled:opacity-50"
                style={{ background: '#74C0FC', color: '#050505' }}
              >
                {saving ? 'Enregistrement...' : editingId ? 'Mettre \u00e0 jour' : 'Publier'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
