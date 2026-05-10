'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { DIMENSIONS, type DimensionScores } from '@/lib/quiz-v2/dimensions'
import { calculateMatchScores } from '@/lib/quiz-v2/scoring'
import { createClient } from '@/lib/supabase/client'
import { getArchetype, BLESSURE_COLORS } from '@/lib/quiz-v2/archetypes'

type Protocol = {
  id: string
  title: string
  slug: string
  status: string
  release_date: string | null
  dimension_weights: Record<string, number>
  duration_days: number
}

type Props = {
  firstName: string
  scores: DimensionScores
  dominant: string
  secondary: string
  q15Response: string
  email: string
}

function Beat({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

async function trackResultEvent(eventType: string, eventData: Record<string, unknown>, email: string) {
  try {
    await fetch('/api/quiz-v2/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: null, quizResponseId: null, eventType, eventData: { ...eventData, email } }),
    })
  } catch {}
}

export function ResultPage({ firstName, scores, dominant, secondary, q15Response, email }: Props) {
  const [protocols, setProtocols] = useState<Protocol[]>([])
  const [protocolsLoading, setProtocolsLoading] = useState(true)
  const dimInfo = DIMENSIONS[parseInt(dominant) as keyof typeof DIMENSIONS]
  const archetype = getArchetype(dominant, secondary)
  const bc = BLESSURE_COLORS[archetype.blessure]

  useEffect(() => {
    async function loadProtocols() {
      const supabase = createClient()
      const { data } = await (supabase as any).from('protocols').select('*')
      if (data) setProtocols(data)
      setProtocolsLoading(false)
    }
    loadProtocols()
    trackResultEvent('result_page_viewed', { dominant, secondary }, email)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const sortedProtocols = protocols
    .map(p => ({ ...p, matchScore: calculateMatchScores(scores, p.dimension_weights) }))
    .sort((a, b) => b.matchScore - a.matchScore)

  const available = sortedProtocols.filter(p => p.status === 'available')
  const comingSoon = sortedProtocols.filter(p => p.status === 'coming_soon')
  const topProtocol = available[0] ?? comingSoon[0] ?? sortedProtocols[0] ?? null

  const displayName = firstName || 'Toi'
  const signupUrl = `/signup?source=quiz&email=${encodeURIComponent(email)}`
  const ctaUrl = topProtocol
    ? `/protocole/${topProtocol.slug}?preview=true&email=${encodeURIComponent(email)}`
    : signupUrl

  function storeProtocolSlug() {
    if (topProtocol) {
      try {
        sessionStorage.setItem('sos_protocol_slug', topProtocol.slug)
        if (email) sessionStorage.setItem('sos_quiz_email', email)
      } catch {}
    }
  }

  async function handleNotify(protocolId: string) {
    const supabase = createClient()
    await (supabase as any).from('protocol_notifications').insert({ user_email: email, protocol_id: protocolId })
  }

  return (
    <div className="min-h-screen">

      {/* ── OUVERTURE — identité archétypale ── */}
      <div className="flex flex-col items-center justify-center min-h-[90vh] px-6 text-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="inline-block px-4 py-1.5 rounded-full text-[11px] tracking-[0.22em] uppercase font-medium mb-10"
          style={{ background: bc.bg, color: bc.text, border: `1px solid ${bc.border}` }}
        >
          {archetype.blessure}
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-[2.4rem] sm:text-6xl font-light leading-[1.1] mb-6"
          style={{ color: 'var(--brand)', letterSpacing: '-0.01em' }}
        >
          {archetype.name}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="text-[11px] tracking-[0.22em] uppercase mb-2"
          style={{ color: bc.text, opacity: 0.6 }}
        >
          {archetype.emotion}&nbsp;&nbsp;·&nbsp;&nbsp;{archetype.mode}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="text-sm max-w-xs mt-4"
          style={{ color: 'var(--text-secondary)' }}
        >
          {displayName}, voilà ce que tes réponses ont révélé.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.0 }}
          className="mt-20 flex flex-col items-center gap-1"
          style={{ color: 'var(--text-muted)' }}
        >
          <span className="text-xs tracking-[0.15em] uppercase">Continue</span>
          <motion.span
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="text-lg"
          >
            ↓
          </motion.span>
        </motion.div>
      </div>

      {/* ── NARRATION ── */}
      <div className="px-6 pb-8 max-w-lg mx-auto">
        <hr style={{ borderColor: 'rgba(255,255,255,0.06)' }} className="my-12" />

        <Beat>
          <p className="text-[11px] tracking-[0.22em] uppercase mb-6" style={{ color: bc.text, opacity: 0.55 }}>
            Ce qu&apos;on voit en toi
          </p>
          <p className="text-[1.35rem] font-light leading-[1.65] whitespace-pre-line" style={{ color: 'var(--text-primary)' }}>
            {archetype.reconnaissance}
          </p>
        </Beat>

        <hr style={{ borderColor: 'rgba(255,255,255,0.06)' }} className="my-12" />

        <Beat>
          <p className="text-[11px] tracking-[0.22em] uppercase mb-6" style={{ color: bc.text, opacity: 0.55 }}>
            La vérité cachée
          </p>
          <p className="text-[1.15rem] font-light leading-[1.7] whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
            {archetype.verite}
          </p>
        </Beat>

        <hr style={{ borderColor: 'rgba(255,255,255,0.06)' }} className="my-12" />

        <Beat>
          <p className="text-[11px] tracking-[0.22em] uppercase mb-6" style={{ color: bc.text, opacity: 0.55 }}>
            La mécanique intérieure
          </p>
          <p className="text-[1.05rem] font-light leading-[1.75] whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
            {archetype.mecanique}
          </p>
        </Beat>

        <hr style={{ borderColor: 'rgba(255,255,255,0.06)' }} className="my-12" />

        <Beat>
          <p className="text-[11px] tracking-[0.22em] uppercase mb-6" style={{ color: bc.text, opacity: 0.55 }}>
            Ce que ça coûte
          </p>
          <p className="text-[1.15rem] font-light leading-[1.7] whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
            {archetype.consequence}
          </p>
        </Beat>

        <hr style={{ borderColor: 'rgba(255,255,255,0.06)' }} className="my-12" />

        <Beat>
          <p className="text-[11px] tracking-[0.22em] uppercase mb-6" style={{ color: bc.text, opacity: 0.55 }}>
            La suite
          </p>
          <p className="text-[1.15rem] font-light leading-[1.7] whitespace-pre-line" style={{ color: 'var(--brand)' }}>
            {archetype.transition}
          </p>
        </Beat>
      </div>

      {/* ── PROTOCOLE + CTA ── */}
      <div className="max-w-lg mx-auto px-6 py-12 space-y-6">

        <Beat>
          <div className="rounded-2xl p-6 space-y-5"
            style={{ background: 'linear-gradient(160deg, rgba(201,169,97,0.10), rgba(201,169,97,0.03))', border: '1px solid rgba(201,169,97,0.25)' }}>
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{dimInfo?.icon}</span>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--brand)', opacity: 0.7 }}>
                  Ton protocole recommandé
                </p>
                {protocolsLoading ? (
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Chargement…</p>
                ) : topProtocol ? (
                  <>
                    <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {topProtocol.title}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      {topProtocol.duration_days} jours · 3 étapes · Conçu pour ton profil
                    </p>
                  </>
                ) : (
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Crée ton espace pour accéder aux protocoles.
                  </p>
                )}
              </div>
            </div>

            <Link
              href={ctaUrl}
              onClick={() => { storeProtocolSlug(); trackResultEvent('cta_clicked', { ctaType: 'protocol_card' }, email) }}
              className="block text-center py-4 rounded-full text-sm font-semibold transition-all hover:brightness-110"
              style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-deep, #B8960F))', color: '#000000' }}
            >
              Commencer mon protocole
            </Link>

            <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
              7 jours offerts · accès immédiat · annulable à tout moment
            </p>
          </div>
        </Beat>

        {/* Coming soon */}
        {comingSoon.length > 0 && (
          <Beat delay={0.1}>
            <div className="space-y-2">
              {comingSoon.slice(0, 2).map(p => (
                <div key={p.id} className="rounded-xl p-4 flex items-center justify-between"
                  style={{ background: 'rgba(201,169,97,0.04)', border: '1px solid rgba(201,169,97,0.12)' }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>⏳ {p.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      Disponible {p.release_date ? new Date(p.release_date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : 'bientôt'}
                    </p>
                  </div>
                  <button onClick={() => handleNotify(p.id)}
                    className="text-xs px-3 py-1.5 rounded-full font-medium cursor-pointer flex-shrink-0"
                    style={{ background: 'rgba(201,169,97,0.12)', color: 'var(--brand)' }}>
                    Me notifier
                  </button>
                </div>
              ))}
            </div>
          </Beat>
        )}

        {/* Share */}
        <Beat delay={0.2}>
          <div className="text-center space-y-3 pt-4">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Partage avec quelqu&apos;un qui en a besoin
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  const text = `Je viens de découvrir ma Signature Émotionnelle sur SOS Shine. Et toi ? 👉 https://sosshine.com/signature-emotionnelle`
                  if (navigator.share) {
                    navigator.share({ title: 'Ma Signature Émotionnelle', text, url: 'https://sosshine.com/signature-emotionnelle' }).catch(() => {})
                  } else {
                    navigator.clipboard.writeText(text).then(() => alert('Lien copié !'))
                  }
                }}
                className="px-5 py-2.5 rounded-full text-sm font-medium cursor-pointer transition-all hover:scale-[1.03]"
                style={{ background: 'rgba(201,169,97,0.08)', border: '1px solid rgba(201,169,97,0.2)', color: 'var(--brand)' }}
              >
                📤 Partager
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent("Je viens de découvrir ma Signature Émotionnelle sur SOS Shine 🔥 Teste-toi aussi → https://sosshine.com/signature-emotionnelle")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:scale-[1.03]"
                style={{ background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.2)', color: '#25D366' }}
              >
                💬 WhatsApp
              </a>
            </div>
          </div>
        </Beat>

      </div>
    </div>
  )
}
