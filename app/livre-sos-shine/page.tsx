'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

interface ResourcePage {
  title: string
  subtitle: string
  content: string
  cover_image: string
  button_label: string
  button_url: string
}

export default function LivreSOSShinePage() {
  const [page, setPage] = useState<ResourcePage | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('resource_pages' as never)
      .select('title, subtitle, content, cover_image, button_label, button_url')
      .eq('slug', 'livre-sos-shine')
      .eq('published', true)
      .single()
    if (data) setPage(data as ResourcePage)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--dark)' }}>
        <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  if (!page) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-6" style={{ background: 'var(--dark)' }}>
        <p className="text-[var(--text-muted)]">Cette page n&apos;est pas disponible pour le moment.</p>
        <Link href="/login" className="text-sm underline" style={{ color: 'var(--gold)' }}>Retour à la connexion</Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-6 py-12" style={{ background: 'var(--dark)' }}>
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link href="/login" className="inline-flex items-center gap-2 text-sm mb-8 transition-colors hover:underline" style={{ color: 'var(--gold)' }}>
          &larr; Retour à la connexion
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Cover image */}
          {page.cover_image && (
            <div className="rounded-2xl overflow-hidden">
              <img src={page.cover_image} alt={page.title} className="w-full max-h-[400px] object-cover" />
            </div>
          )}

          {/* Title */}
          <div className="text-center space-y-3">
            <h1 className="font-display text-3xl md:text-4xl font-bold" style={{ color: 'var(--gold)' }}>
              {page.title}
            </h1>
            {page.subtitle && (
              <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>{page.subtitle}</p>
            )}
          </div>

          {/* Content */}
          <div
            className="prose prose-invert max-w-none text-[var(--text-primary)] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />

          {/* CTA Button */}
          {page.button_label && page.button_url && (
            <div className="text-center pt-4">
              <a
                href={page.button_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-3.5 rounded-full font-medium text-sm tracking-wide transition-all cta-glow"
                style={{ background: 'var(--button-bg)', color: 'var(--dark)' }}
              >
                {page.button_label}
              </a>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  )
}
