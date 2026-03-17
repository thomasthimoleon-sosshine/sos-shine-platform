'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ResourcePage {
  id: string
  slug: string
  title: string
  subtitle: string
  content: string
  cover_image: string
  button_label: string
  button_url: string
  published: boolean
  updated_at: string
}

export default function RessourceEditionPage() {
  const [pages, setPages] = useState<ResourcePage[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const loadPages = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('resource_pages' as never)
      .select('*')
      .order('created_at', { ascending: true })
    if (data) setPages(data as unknown as ResourcePage[])
    setLoading(false)
  }, [])

  useEffect(() => { loadPages() }, [loadPages])

  function updateField(id: string, field: keyof ResourcePage, value: string | boolean) {
    setPages(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  async function handleSave(page: ResourcePage) {
    setSaving(page.id)
    setSuccess(null)
    const supabase = createClient()
    const { error } = await supabase
      .from('resource_pages' as never)
      .update({
        title: page.title,
        subtitle: page.subtitle,
        content: page.content,
        cover_image: page.cover_image,
        button_label: page.button_label,
        button_url: page.button_url,
        published: page.published,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id' as never, page.id as never)
    setSaving(null)
    if (!error) setSuccess(page.id)
    setTimeout(() => setSuccess(null), 3000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#74C0FC] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold" style={{ color: '#74C0FC' }}>
          Ressource Édition
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Gérez les pages de ressources accessibles depuis la page de connexion.
        </p>
      </div>

      {pages.map((page) => (
        <div key={page.id} className="rounded-2xl p-6 space-y-5"
          style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              {page.slug === 'livre-sos-shine' ? 'Livre SOS Shine' : 'Livre Supers Pouvoirs'}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                /{page.slug}
              </span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={page.published}
                  onChange={(e) => updateField(page.id, 'published', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 rounded-full transition-colors peer-checked:bg-green-500 bg-gray-600 relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-4" />
                <span className="text-xs" style={{ color: page.published ? '#4ade80' : 'var(--text-muted)' }}>
                  {page.published ? 'Publié' : 'Masqué'}
                </span>
              </label>
            </div>
          </div>

          <div className="grid gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Titre</label>
              <input
                value={page.title}
                onChange={(e) => updateField(page.id, 'title', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Sous-titre</label>
              <input
                value={page.subtitle}
                onChange={(e) => updateField(page.id, 'subtitle', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Image de couverture (URL)</label>
              <input
                value={page.cover_image}
                onChange={(e) => updateField(page.id, 'cover_image', e.target.value)}
                placeholder="https://exemple.com/image.jpg"
                className="w-full px-4 py-2.5 rounded-xl text-sm"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
              />
              {page.cover_image && (
                <img src={page.cover_image} alt="Aperçu" className="mt-2 h-32 rounded-xl object-cover" />
              )}
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Contenu (HTML)
              </label>
              <textarea
                value={page.content}
                onChange={(e) => updateField(page.id, 'content', e.target.value)}
                rows={10}
                className="w-full px-4 py-2.5 rounded-xl text-sm font-mono"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)', resize: 'vertical' }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Texte du bouton CTA</label>
                <input
                  value={page.button_label}
                  onChange={(e) => updateField(page.id, 'button_label', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>URL du bouton CTA</label>
                <input
                  value={page.button_url}
                  onChange={(e) => updateField(page.id, 'button_url', e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-xl text-sm"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => handleSave(page)}
              disabled={saving === page.id}
              className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
              style={{ background: '#74C0FC', color: '#0a0a0a' }}
            >
              {saving === page.id ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            {success === page.id && (
              <span className="text-sm" style={{ color: '#4ade80' }}>Sauvegardé avec succès</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
