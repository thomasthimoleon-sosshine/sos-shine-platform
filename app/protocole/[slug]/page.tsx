'use client'

import { useEffect, useState, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

type Protocol = {
  id: string
  title: string
  slug: string
  description: string
  status: string
  duration_days: number
  dimension_weights: Record<string, number>
}

async function track(eventType: string, eventData: Record<string, unknown>) {
  try {
    await fetch('/api/quiz-v2/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: null, quizResponseId: null, eventType, eventData }),
    })
  } catch {}
}

function ProtocolPreviewContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params.slug as string
  const email = searchParams.get('email') || ''

  const [protocol, setProtocol] = useState<Protocol | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await (supabase as any).from('protocols').select('*').eq('slug', slug).maybeSingle()
      setProtocol(data || null)
      setLoading(false)
      if (data) {
        track('protocol_preview_viewed', { protocolSlug: slug, protocolTitle: data.title, email })
      }
    }
    load()
  }, [slug]) // eslint-disable-line

  function handleCtaClick() {
    try {
      sessionStorage.setItem('sos_protocol_slug', slug)
      if (email) sessionStorage.setItem('sos_quiz_email', email)
    } catch {}
    track('protocol_cta_clicked', { protocolSlug: slug, from: 'preview', email })
  }

  const ctaUrl = `/signup?source=quiz&protocol=${slug}&email=${encodeURIComponent(email)}`

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--surface)' }}>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Chargement...</p>
      </main>
    )
  }

  if (!protocol) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--surface)' }}>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Protocole introuvable.</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen" style={{ background: 'var(--surface)' }}>
      <div className="max-w-2xl mx-auto px-6 py-16 space-y-10">

        {/* Bloc 1 — Contexte */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <p className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--brand)', opacity: 0.7 }}>
            Recommandé suite à ton test
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            {protocol.title}
          </h1>
          <p className="text-sm leading-relaxed max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Ce protocole t&apos;est recommandé suite à ton test.<br />
            Il correspond directement au schéma que tu viens d&apos;identifier.
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {protocol.duration_days} jours de protocole
          </p>
        </motion.div>

        {/* Bloc 2 — Structure 3 étapes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-3"
        >
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Structure du protocole
          </p>
          <div className="flex gap-2">
            {['Comprendre', 'Libérer & intégrer', 'Agir'].map((label, i) => (
              <div key={i} className="flex-1 rounded-xl px-3 py-3 text-center"
                style={{ background: 'rgba(201,169,97,0.07)', border: '1px solid rgba(201,169,97,0.18)' }}>
                <p className="text-xs font-bold" style={{ color: 'var(--brand)' }}>{i + 1}</p>
                <p className="text-xs mt-1 leading-tight" style={{ color: 'var(--text-secondary)' }}>{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bloc 3 — Étape 1 visible */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl p-6 space-y-4"
          style={{ background: 'linear-gradient(160deg, rgba(201,169,97,0.08), rgba(201,169,97,0.02))', border: '1px solid rgba(201,169,97,0.2)' }}
        >
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: 'rgba(201,169,97,0.2)', color: 'var(--brand)' }}>
              1
            </span>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Comprendre
            </p>
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(85,239,196,0.12)', color: '#55EFC4' }}>
              Accessible
            </span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {protocol.description}
          </p>
        </motion.div>

        {/* Bloc 4 — Étapes 2-3 verrouillées */}
        {[{ num: 2, label: 'Libérer & intégrer' }, { num: 3, label: 'Agir' }].map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28 + i * 0.08 }}
            className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                {step.num}
              </span>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
                {step.label}
              </p>
              <span className="ml-auto text-sm">🔒</span>
            </div>
            <p className="text-xs mt-3 ml-9" style={{ color: 'var(--text-muted)', filter: 'blur(2px)', userSelect: 'none' }}>
              Débloquée une fois que tu commences
            </p>
          </motion.div>
        ))}

        {/* Bloc 5 — CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.44 }}
          className="space-y-3 text-center"
        >
          <a
            href={ctaUrl}
            onClick={handleCtaClick}
            className="block w-full py-4 rounded-full text-sm font-semibold transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-deep, #B8960F))', color: '#000000' }}
          >
            Créer mon espace et commencer
          </a>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Gratuit · accès immédiat à ton chemin · upgrade possible ensuite
          </p>
        </motion.div>

      </div>
    </main>
  )
}

export default function ProtocolPreviewPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--surface)' }}>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Chargement...</p>
      </main>
    }>
      <ProtocolPreviewContent />
    </Suspense>
  )
}
