'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n/useTranslation'

export default function ContactPage() {
  const { t } = useTranslation()
  const [title, setTitle] = useState('Contact')
  const [email, setEmail] = useState('julialaureau@sosshine.com')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
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
        .eq('section_key', 'legal_contact')
        .maybeSingle()

      if (section?.content && (section.content.email || section.content.html_content)) {
        setTitle(section.content.title || 'Contact')
        setEmail(section.content.email || 'julialaureau@sosshine.com')
        setPhone(section.content.phone || '')
        setAddress(section.content.address || '')
        setContent(section.content.html_content || '')
      } else {
        // Fallback to site_settings (old system)
        const { data } = await supabase.from('site_settings').select('key, value').in('key', [
          'contact_title', 'contact_email', 'contact_phone', 'contact_address', 'contact_content',
        ])
        if (data) {
          const map: Record<string, string> = {}
          data.forEach((r: { key: string; value: string }) => { map[r.key] = r.value })
          if (map.contact_title) setTitle(map.contact_title)
          if (map.contact_email) setEmail(map.contact_email)
          if (map.contact_phone) setPhone(map.contact_phone)
          if (map.contact_address) setAddress(map.contact_address)
          if (map.contact_content) setContent(map.contact_content)
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

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" /></div>

  return (
    <main className="min-h-screen px-6 py-16" style={{ background: 'var(--dark)' }}>
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm mb-8 transition-colors" style={{ color: 'var(--text-muted)' }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          {t('contact.back')}
        </Link>

        {logoUrl && (
          <Link href="/"><img src={logoUrl} alt="SOS Shine" className="h-10 mb-6 rounded-lg object-cover" /></Link>
        )}

        <h1 className="font-display text-3xl md:text-4xl font-semibold mb-8" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h1>

        <div className="rounded-2xl p-8 space-y-6" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
          {/* Email */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(212,175,55,0.1)' }}>
              <svg className="w-5 h-5" style={{ color: 'var(--gold)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Email</p>
              <a href={`mailto:${email}`} className="text-sm hover:underline" style={{ color: 'var(--gold)' }}>{email}</a>
            </div>
          </div>

          {/* Phone */}
          {phone && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(212,175,55,0.1)' }}>
                <svg className="w-5 h-5" style={{ color: 'var(--gold)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>{t('contact.phone')}</p>
                <a href={`tel:${phone}`} className="text-sm hover:underline" style={{ color: 'var(--gold)' }}>{phone}</a>
              </div>
            </div>
          )}

          {/* Address */}
          {address && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(212,175,55,0.1)' }}>
                <svg className="w-5 h-5" style={{ color: 'var(--gold)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>{t('contact.address')}</p>
                <p className="text-sm whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>{address}</p>
              </div>
            </div>
          )}
        </div>

        {/* Extra content */}
        {content && (
          <div
            className="prose prose-invert max-w-none text-sm leading-relaxed space-y-4 mt-8"
            style={{ color: 'var(--text-secondary)' }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </div>
    </main>
  )
}
