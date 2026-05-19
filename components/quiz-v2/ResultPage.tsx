'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { DIMENSIONS, type DimensionScores } from '@/lib/quiz-v2/dimensions'
import { calculateMatchScores } from '@/lib/quiz-v2/scoring'
import { createClient } from '@/lib/supabase/client'
import { getArchetype, BLESSURE_COLORS } from '@/lib/quiz-v2/archetypes.legacy'

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

function Beat({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
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
  } catch {
    // fire-and-forget
  }
}

export function ResultPage({ firstName, scores, dominant, secondary, email }: Props) {
  const [protocols, setProtocols] = useState<Protocol[]>([])
  const [protocolsLoading, setProtocolsLoading] = useState(true)

  const dimInfo = DIMENSIONS[parseInt(dominant) as keyof typeof DIMENSIONS]
  const archetype = getArchetype(dominant, secondary)
  const bc = BLESSURE_COLORS[archetype.blessure]
  const displayName = firstName || 'Toi'

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
  const topProtocol = available[0] ?? sortedProtocols[0] ?? null

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

  return (
    <div className="min-h-screen">

      {/* ══════════ OUVERTURE — IDENTITÉ ARCHÉTYPALE ══════════ */}
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
          className="text-[11px] tracking-[0.22em] uppercase"
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

      {/* ══════════ NARRATION PSYCHOLOGIQUE ══════════ */}
      <div className="px-6 max-w-lg mx-auto">

        <hr style={{ borderColor: 'rgba(255,255,255,0.06)' }} className="my-20" />
        <Beat>
          <p className="text-[11px] tracking-[0.22em] uppercase mb-8" style={{ color: bc.text, opacity: 0.55 }}>
            Ce qu&apos;on voit en toi
          </p>
          <p className="text-[1.35rem] font-light leading-[1.65] whitespace-pre-line" style={{ color: 'var(--text-primary)' }}>
            {archetype.reconnaissance}
          </p>
        </Beat>

        <hr style={{ borderColor: 'rgba(255,255,255,0.06)' }} className="my-20" />
        <Beat>
          <p className="text-[11px] tracking-[0.22em] uppercase mb-8" style={{ color: bc.text, opacity: 0.55 }}>
            La vérité cachée
          </p>
          <p className="text-[1.15rem] font-light leading-[1.7] whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
            {archetype.verite}
          </p>
        </Beat>

        <hr style={{ borderColor: 'rgba(255,255,255,0.06)' }} className="my-20" />
        <Beat>
          <p className="text-[11px] tracking-[0.22em] uppercase mb-8" style={{ color: bc.text, opacity: 0.55 }}>
            La mécanique intérieure
          </p>
          <p className="text-[1.05rem] font-light leading-[1.75] whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
            {archetype.mecanique}
          </p>
        </Beat>

        <hr style={{ borderColor: 'rgba(255,255,255,0.06)' }} className="my-20" />
        <Beat>
          <p className="text-[11px] tracking-[0.22em] uppercase mb-8" style={{ color: bc.text, opacity: 0.55 }}>
            Ce que ça coûte
          </p>
          <p className="text-[1.15rem] font-light leading-[1.7] whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
            {archetype.consequence}
          </p>
        </Beat>

        <hr style={{ borderColor: 'rgba(255,255,255,0.06)' }} className="my-20" />
        <Beat>
          <p className="text-[11px] tracking-[0.22em] uppercase mb-8" style={{ color: bc.text, opacity: 0.55 }}>
            La suite
          </p>
          <p className="text-[1.15rem] font-light leading-[1.7] whitespace-pre-line" style={{ color: 'var(--brand)' }}>
            {archetype.transition}
          </p>
        </Beat>

        <hr style={{ borderColor: 'rgba(255,255,255,0.06)' }} className="my-20" />
      </div>

      {/* ══════════ PROTOCOLE RECOMMANDÉ ══════════ */}
      <div className="px-6 pb-24 max-w-lg mx-auto space-y-8">

        <Beat>
          <p className="text-[11px] tracking-[0.22em] uppercase mb-2" style={{ color: 'var(--brand)', opacity: 0.7 }}>
            Ton protocole recommandé
          </p>
          {topProtocol && (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              C&apos;est le point de départ le plus adapté à ce que ton test vient de révéler.
            </p>
          )}
        </Beat>

        {protocolsLoading ? (
          <div className="rounded-2xl p-6 animate-pulse" style={{ background: 'rgba(201,169,97,0.05)', border: '1px solid rgba(201,169,97,0.12)' }}>
            <div className="h-4 rounded w-2/3 mb-3" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="h-3 rounded w-1/2" style={{ background: 'rgba(255,255,255,0.04)' }} />
          </div>
        ) : topProtocol ? (
          <Beat>
            <div className="rounded-2xl p-6 space-y-5"
              style={{ background: 'linear-gradient(160deg, rgba(201,169,97,0.10), rgba(201,169,97,0.03))', border: '1px solid rgba(201,169,97,0.25)' }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {topProtocol.title}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {topProtocol.duration_days} jours · {topProtocol.matchScore}% de correspondance
                  </p>
                </div>
                <span className="text-xl flex-shrink-0">{dimInfo?.icon}</span>
              </div>

              <div className="space-y-3 pt-1" style={{ borderTop: '1px solid rgba(201,169,97,0.15)' }}>
                {[
                  { num: '1', label: 'Comprendre', desc: 'reconnaître quand le schéma s\'active' },
                  { num: '2', label: 'Libérer & intégrer', desc: 'relier le présent à ton histoire' },
                  { num: '3', label: 'Agir', desc: 'remplacer l\'automatisme par un choix' },
                ].map(step => (
                  <div key={step.num} className="flex items-start gap-3 pt-2">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                      style={{ background: 'rgba(201,169,97,0.2)', color: 'var(--brand)' }}>
                      {step.num}
                    </span>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{step.label}</span> — {step.desc}
                    </p>
                  </div>
                ))}
              </div>

              <Link
                href={ctaUrl}
                onClick={() => { storeProtocolSlug(); trackResultEvent('cta_clicked', { protocolSlug: topProtocol.slug }, email) }}
                className="block text-center py-4 rounded-full text-sm font-semibold transition-all hover:brightness-110"
                style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-deep, #B8960F))', color: '#000000' }}
              >
                Commencer mon protocole — 7 jours gratuits
              </Link>

              <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                Annulable à tout moment · Aucun engagement
              </p>
            </div>
          </Beat>
        ) : (
          <Beat>
            <Link
              href={signupUrl}
              className="block text-center w-full py-4 rounded-full text-sm font-semibold transition-all hover:brightness-110"
              style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-deep, #B8960F))', color: '#000000' }}
            >
              Créer mon espace gratuit
            </Link>
          </Beat>
        )}

        {/* Partage */}
        <Beat>
          <div className="text-center space-y-4 pt-4">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Partage ton résultat :
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
                href={`https://wa.me/?text=${encodeURIComponent("Je viens de découvrir ma Signature Émotionnelle sur SOS Shine 🔥 → https://sosshine.com/signature-emotionnelle")}`}
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
