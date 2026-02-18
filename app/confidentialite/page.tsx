'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

const KEYS = ['privacy_title', 'privacy_content', 'logo_url']

export default function ConfidentialitePage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data } = await supabase.from('site_settings').select('key, value').in('key', KEYS)
      const map: Record<string, string> = {}
      if (data) data.forEach((r: { key: string; value: string }) => { map[r.key] = r.value })
      setSettings(map)
    } catch { /* defaults */ }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const title = settings.privacy_title || 'Politique de confidentialité'
  const content = settings.privacy_content || ''

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" /></div>

  return (
    <main className="min-h-screen px-6 py-16" style={{ background: 'var(--dark)' }}>
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm mb-8 transition-colors" style={{ color: 'var(--text-muted)' }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          Retour à l&apos;accueil
        </Link>

        {settings.logo_url && (
          <Link href="/"><img src={settings.logo_url} alt="SOS Shine" className="h-10 mb-6 rounded-lg object-cover" /></Link>
        )}

        <h1 className="font-display text-3xl md:text-4xl font-semibold mb-8" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h1>

        {content ? (
          <div
            className="prose prose-invert max-w-none text-sm leading-relaxed space-y-4"
            style={{ color: 'var(--text-secondary)' }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
            Cette page n&apos;a pas encore été renseignée. Rendez-vous dans le back-office pour ajouter le contenu.
          </p>
        )}
      </div>
    </main>
  )
}
