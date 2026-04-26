'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function MentionsLegalesPage() {
  const [title, setTitle] = useState('Mentions légales')
  const [content, setContent] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const supabase = createClient()

      // Try landing_sections first (new system)
      const { data: section } = await supabase
        .from('landing_sections')
        .select('content')
        .eq('section_key', 'legal_mentions')
        .maybeSingle()

      if (section?.content?.html_content) {
        setTitle(section.content.title || 'Mentions légales')
        setContent(section.content.html_content)
      } else {
        // Fallback to site_settings (old system)
        const { data } = await supabase.from('site_settings').select('key, value').in('key', ['mentions_title', 'mentions_content'])
        if (data) {
          const map: Record<string, string> = {}
          data.forEach((r: { key: string; value: string }) => { map[r.key] = r.value })
          if (map.mentions_title) setTitle(map.mentions_title)
          if (map.mentions_content) setContent(map.mentions_content)
        }
      }

      // Get logo
      const { data: globalSection } = await supabase
        .from('landing_sections')
        .select('content')
        .eq('section_key', '_global')
        .maybeSingle()

      if (globalSection?.content?.logo_url) {
        setLogoUrl(globalSection.content.logo_url)
      } else {
        const { data: logoData } = await supabase.from('site_settings').select('value').eq('key', 'logo_url').maybeSingle()
        if (logoData?.value) setLogoUrl(logoData.value)
      }
    } catch { /* defaults */ }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" /></div>

  return (
    <main className="min-h-screen px-6 py-16" style={{ background: 'var(--dark)' }}>
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm mb-8 transition-colors" style={{ color: 'var(--text-muted)' }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          Retour à l&apos;accueil
        </Link>

        <Link href="/"><img src={logoUrl || '/images/logo-shine.png'} alt="SOS Shine" className="h-10 mb-6 object-contain" /></Link>

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
