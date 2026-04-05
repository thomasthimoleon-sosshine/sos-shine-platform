'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import FileUpload from '@/components/FileUpload'

interface ShineBook {
  id: string
  title: string
  author: string
  description: string | null
  cover_url: string | null
  pdf_url: string | null
  category: string
  content_type: string
  page_count: number
  year: number
  douleur_id: string | null
  is_published: boolean
  is_featured: boolean
  sort_order: number
  created_at: string
}

interface DouleurOption {
  id: string
  title: string
  slug: string
}

const CATEGORIES = [
  { id: 'healing', label: 'Guérison intérieure', icon: '🌿' },
  { id: 'confidence', label: 'Confiance en soi', icon: '💪' },
  { id: 'relationships', label: 'Relations saines', icon: '💛' },
  { id: 'resilience', label: 'Résilience', icon: '🔥' },
  { id: 'gratitude', label: 'Gratitude & Joie', icon: '✨' },
  { id: 'anxiety', label: 'Anxiété & Stress', icon: '🧠' },
  { id: 'grief', label: 'Deuil & Perte', icon: '🕊️' },
  { id: 'trauma', label: 'Trauma', icon: '💎' },
  { id: 'self-love', label: 'Amour de soi', icon: '🩷' },
  { id: 'spirituality', label: 'Spiritualité', icon: '🙏' },
  { id: 'children', label: 'Enfants', icon: '👶' },
]

const CONTENT_TYPES = [
  { id: 'ebook', label: 'eBook', icon: '📖' },
  { id: 'guide', label: 'Guide pratique', icon: '📋' },
  { id: 'workbook', label: 'Cahier d\'exercices', icon: '✍️' },
  { id: 'journal', label: 'Journal guidé', icon: '📓' },
  { id: 'protocol', label: 'Protocole de soin', icon: '🩺' },
]

const emptyForm = {
  title: '',
  author: 'SOS Shine',
  description: '',
  cover_url: '',
  pdf_url: '',
  category: 'healing',
  content_type: 'ebook',
  page_count: 0,
  year: new Date().getFullYear(),
  is_featured: false,
  douleur_id: '',
}

export default function AdminShineLibrairiePage() {
  const [books, setBooks] = useState<ShineBook[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string>('all')
  const [douleurs, setDouleurs] = useState<DouleurOption[]>([])

  const supabase = createClient()

  async function loadBooks() {
    setLoading(true)
    const { data, error } = await supabase
      .from('shine_library_books')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setBooks((data as ShineBook[]) ?? [])
    setLoading(false)
  }

  async function loadDouleurs() {
    const { data } = await supabase
      .from('douleurs')
      .select('id, title, slug')
      .eq('is_active', true)
      .order('title', { ascending: true })
    if (data) setDouleurs(data as DouleurOption[])
  }

  useEffect(() => {
    loadBooks()
    loadDouleurs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setForm((prev) => ({ ...prev, [name]: checked }))
    } else {
      setForm((prev) => ({ ...prev, [name]: name === 'page_count' || name === 'year' ? Number(value) : value }))
    }
  }

  function openEdit(b: ShineBook) {
    setEditingId(b.id)
    setForm({
      title: b.title,
      author: b.author || 'SOS Shine',
      description: b.description || '',
      cover_url: b.cover_url || '',
      pdf_url: b.pdf_url || '',
      category: b.category,
      content_type: b.content_type,
      page_count: b.page_count || 0,
      year: b.year || new Date().getFullYear(),
      is_featured: b.is_featured || false,
      douleur_id: b.douleur_id || '',
    })
    setShowForm(true)
    setError(null)
  }

  function cancelForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
    setError(null)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)

    const payload = {
      title: form.title.trim(),
      author: form.author.trim() || 'SOS Shine',
      description: form.description.trim() || null,
      cover_url: form.cover_url.trim() || null,
      pdf_url: form.pdf_url.trim() || null,
      category: form.category,
      content_type: form.content_type as 'ebook' | 'guide' | 'workbook' | 'journal' | 'protocol',
      page_count: form.page_count,
      year: form.year,
      is_featured: form.is_featured,
      douleur_id: form.douleur_id || null,
    }

    if (editingId) {
      const { error } = await supabase.from('shine_library_books').update(payload).eq('id', editingId)
      if (error) { setError(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('shine_library_books').insert({ ...payload, is_published: false })
      if (error) { setError(error.message); setSaving(false); return }
    }

    cancelForm()
    await loadBooks()
    setSaving(false)
  }

  async function togglePublish(b: ShineBook) {
    const willPublish = !b.is_published
    const { error } = await supabase
      .from('shine_library_books')
      .update({ is_published: willPublish })
      .eq('id', b.id)

    if (error) { setError(error.message); return }
    setBooks((prev) => prev.map((item) => item.id === b.id ? { ...item, is_published: willPublish } : item))

    if (willPublish) {
      try {
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'new_post',
            title: 'Nouveau livre dans la Librairie Shine',
            body: b.title,
            link: '/dashboard/shine-librairie',
          }),
        })
      } catch { /* notification best-effort */ }
    }
  }

  async function toggleFeatured(b: ShineBook) {
    const { error } = await supabase
      .from('shine_library_books')
      .update({ is_featured: !b.is_featured })
      .eq('id', b.id)

    if (error) { setError(error.message); return }
    setBooks((prev) => prev.map((item) => item.id === b.id ? { ...item, is_featured: !b.is_featured } : item))
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce livre ? Cette action est irréversible.')) return
    const { error } = await supabase.from('shine_library_books').delete().eq('id', id)
    if (error) setError(error.message)
    else setBooks((prev) => prev.filter((b) => b.id !== id))
  }

  const filteredBooks = filterType === 'all' ? books : books.filter((b) => b.content_type === filterType)
  const getTypeLabel = (type: string) => CONTENT_TYPES.find((c) => c.id === type)?.label || type
  const getTypeIcon = (type: string) => CONTENT_TYPES.find((c) => c.id === type)?.icon || '📖'
  const getCategoryLabel = (cat: string) => CATEGORIES.find((c) => c.id === cat)?.label || cat
  const getCategoryIcon = (cat: string) => CATEGORIES.find((c) => c.id === cat)?.icon || '📚'

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: '8px',
    border: '1px solid var(--dark-border)', background: 'var(--dark)',
    color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)',
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Shine Librairie
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Publiez vos eBooks, guides pratiques, cahiers d&apos;exercices et protocoles de soin.
          </p>
        </div>
        {!showForm && (
          <button onClick={() => { setEditingId(null); setForm(emptyForm); setShowForm(true); setError(null) }}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 self-start sm:self-auto"
            style={{ background: '#D4AF37', color: '#fff' }}>
            Ajouter un livre
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-lg px-4 py-3 text-sm" style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.25)', color: '#FF6B6B' }}>
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSave} className="rounded-xl p-6 space-y-5" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
          <h2 className="font-semibold text-lg" style={{ color: '#D4AF37' }}>
            {editingId ? 'Modifier le livre' : 'Nouveau livre / eBook'}
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="title" style={labelStyle}>Titre *</label>
              <input id="title" name="title" type="text" required value={form.title} onChange={handleChange} placeholder="Ex : Guérir de l'abandon" style={inputStyle} />
            </div>
            <div>
              <label htmlFor="author" style={labelStyle}>Auteur</label>
              <input id="author" name="author" type="text" value={form.author} onChange={handleChange} placeholder="SOS Shine" style={inputStyle} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="content_type" style={labelStyle}>Type de contenu *</label>
              <select id="content_type" name="content_type" value={form.content_type} onChange={handleChange} style={inputStyle}>
                {CONTENT_TYPES.map((c) => (
                  <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="category" style={labelStyle}>Catégorie (douleur) *</label>
              <select id="category" name="category" value={form.category} onChange={handleChange} style={inputStyle}>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="description" style={labelStyle}>Description</label>
            <textarea id="description" name="description" rows={4} value={form.description} onChange={handleChange} placeholder="Décrivez le contenu de ce livre : thème, à qui il s'adresse, ce que le lecteur va y trouver..." style={{ ...inputStyle, resize: 'vertical' as const }} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="page_count" style={labelStyle}>Nombre de pages</label>
              <input id="page_count" name="page_count" type="number" min={0} value={form.page_count} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label htmlFor="year" style={labelStyle}>Année</label>
              <input id="year" name="year" type="number" min={2020} value={form.year} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="is_featured" name="is_featured" checked={form.is_featured}
              onChange={handleChange} className="w-4 h-4 rounded" />
            <label htmlFor="is_featured" className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Mettre en avant (Featured)
            </label>
          </div>

          <div>
            <label htmlFor="douleur_id" style={labelStyle}>Lier à une douleur (Encyclopédie)</label>
            <select id="douleur_id" name="douleur_id" value={form.douleur_id} onChange={handleChange} style={inputStyle}>
              <option value="">— Aucune —</option>
              {douleurs.map((d) => (
                <option key={d.id} value={d.id}>{d.title}</option>
              ))}
            </select>
          </div>

          <FileUpload
            label="Couverture du livre"
            accept="image/*"
            folder="shine-library"
            currentUrl={form.cover_url || null}
            hint="Format portrait recommandé (style couverture de livre)"
            onUploaded={(url) => setForm((prev) => ({ ...prev, cover_url: url }))}
            onRemoved={() => setForm((prev) => ({ ...prev, cover_url: '' }))}
          />

          <FileUpload
            label="Fichier PDF du livre"
            accept="application/pdf"
            folder="shine-library"
            currentUrl={form.pdf_url || null}
            hint="PDF du livre complet, aucune limite de taille"
            maxSize={0}
            onUploaded={(url) => setForm((prev) => ({ ...prev, pdf_url: url }))}
            onRemoved={() => setForm((prev) => ({ ...prev, pdf_url: '' }))}
          />

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={saving || !form.title.trim()}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-40"
              style={{ background: '#D4AF37', color: '#fff' }}>
              {saving ? 'Enregistrement...' : editingId ? 'Mettre à jour' : 'Enregistrer'}
            </button>
            <button type="button" onClick={cancelForm}
              className="px-5 py-2.5 rounded-lg text-sm transition-colors"
              style={{ color: 'var(--text-muted)', border: '1px solid var(--dark-border)' }}>
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Filter bar */}
      {!showForm && (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilterType('all')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: filterType === 'all' ? 'rgba(212,175,55,0.15)' : 'transparent',
              color: filterType === 'all' ? '#D4AF37' : 'var(--text-muted)',
              border: `1px solid ${filterType === 'all' ? 'rgba(212,175,55,0.3)' : 'var(--dark-border)'}`,
            }}>
            Tout ({books.length})
          </button>
          {CONTENT_TYPES.map((c) => {
            const count = books.filter((b) => b.content_type === c.id).length
            if (count === 0) return null
            return (
              <button key={c.id} onClick={() => setFilterType(c.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: filterType === c.id ? 'rgba(212,175,55,0.15)' : 'transparent',
                  color: filterType === c.id ? '#D4AF37' : 'var(--text-muted)',
                  border: `1px solid ${filterType === c.id ? 'rgba(212,175,55,0.3)' : 'var(--dark-border)'}`,
                }}>
                {c.icon} {c.label} ({count})
              </button>
            )
          })}
        </div>
      )}

      {/* Stats */}
      {!showForm && !loading && books.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total livres', value: books.length, color: '#D4AF37' },
            { label: 'Publiés', value: books.filter((b) => b.is_published).length, color: '#55EFC4' },
            { label: 'Brouillons', value: books.filter((b) => !b.is_published).length, color: '#FF6B35' },
            { label: 'En vedette', value: books.filter((b) => b.is_featured).length, color: '#74C0FC' },
          ].map((s) => (
            <div key={s.label} className="rounded-lg p-3 text-center"
              style={{ background: `${s.color}08`, border: `1px solid ${s.color}20` }}>
              <p className="font-display text-2xl font-semibold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
          <p className="text-4xl mb-3">📚</p>
          <p style={{ color: 'var(--text-muted)' }}>Aucun livre pour le moment.</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Ajoutez vos eBooks, guides et protocoles pour enrichir la librairie.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredBooks.map((b) => (
            <div key={b.id} className="rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 flex flex-col"
              style={{ background: 'var(--dark-card)', border: `1px solid ${b.is_featured ? 'rgba(212,175,55,0.4)' : 'var(--dark-border)'}` }}>
              {/* Cover */}
              <div className="relative aspect-[3/4]" style={{ background: 'rgba(212,175,55,0.05)' }}>
                {b.cover_url ? (
                  <img src={b.cover_url} alt={b.title} className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4">
                    <span className="text-5xl opacity-20">📖</span>
                    <span className="text-xs text-center font-medium opacity-30" style={{ color: 'var(--text-muted)' }}>{b.title}</span>
                  </div>
                )}
                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium"
                    style={{
                      background: b.is_published ? 'rgba(85,239,196,0.9)' : 'rgba(255,107,53,0.9)',
                      color: '#fff',
                    }}>
                    {b.is_published ? 'Publié' : 'Brouillon'}
                  </span>
                  {b.is_featured && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium"
                      style={{ background: 'rgba(212,175,55,0.9)', color: '#fff' }}>
                      En vedette
                    </span>
                  )}
                </div>
                {/* Page count */}
                {b.page_count > 0 && (
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-medium"
                    style={{ background: 'rgba(0,0,0,0.75)', color: '#fff' }}>
                    {b.page_count} pages
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-4 space-y-2 flex-1 flex flex-col">
                <h3 className="font-semibold text-sm leading-tight" style={{ color: 'var(--text-primary)' }}>{b.title}</h3>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>par {b.author}</p>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37' }}>
                    {getTypeIcon(b.content_type)} {getTypeLabel(b.content_type)}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(116,192,252,0.1)', color: '#74C0FC' }}>
                    {getCategoryIcon(b.category)} {getCategoryLabel(b.category)}
                  </span>
                </div>
                {b.description && (
                  <p className="text-xs line-clamp-2 flex-1" style={{ color: 'var(--text-muted)' }}>{b.description}</p>
                )}

                {/* PDF indicator */}
                {b.pdf_url && (
                  <div className="flex items-center gap-1.5 text-[11px]" style={{ color: '#55EFC4' }}>
                    <span>PDF</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-2 mt-auto">
                  <button onClick={() => openEdit(b)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all hover:opacity-80"
                    style={{ background: 'rgba(116,192,252,0.1)', color: '#74C0FC', border: '1px solid rgba(116,192,252,0.2)' }}>
                    Modifier
                  </button>
                  <button onClick={() => togglePublish(b)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all hover:opacity-80"
                    style={{
                      background: b.is_published ? 'rgba(255,107,53,0.1)' : 'rgba(85,239,196,0.1)',
                      color: b.is_published ? '#FF6B35' : '#55EFC4',
                      border: `1px solid ${b.is_published ? 'rgba(255,107,53,0.2)' : 'rgba(85,239,196,0.2)'}`,
                    }}>
                    {b.is_published ? 'Dépublier' : 'Publier'}
                  </button>
                  <button onClick={() => toggleFeatured(b)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all hover:opacity-80"
                    style={{
                      background: b.is_featured ? 'rgba(212,175,55,0.15)' : 'rgba(212,175,55,0.05)',
                      color: '#D4AF37',
                      border: `1px solid rgba(212,175,55,${b.is_featured ? '0.3' : '0.15'})`,
                    }}>
                    {b.is_featured ? 'Retirer vedette' : 'Mettre en vedette'}
                  </button>
                  <button onClick={() => handleDelete(b.id)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all hover:opacity-80 ml-auto"
                    style={{ background: 'rgba(255,107,107,0.1)', color: '#FF6B6B', border: '1px solid rgba(255,107,107,0.2)' }}>
                    Suppr.
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
