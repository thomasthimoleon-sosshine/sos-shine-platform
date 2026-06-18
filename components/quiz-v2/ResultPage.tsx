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

function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

async function trackResultEvent(
  eventType: string,
  eventData: Record<string, unknown>,
  email: string,
) {
  try {
    await fetch('/api/quiz-v2/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: null,
        quizResponseId: null,
        eventType,
        eventData: { ...eventData, email },
      }),
    })
  } catch {
    // fire-and-forget
  }
}

const SECTION_LABELS = [
  { num: '01', title: 'Ce qu\'on voit en toi', key: 'reconnaissance' as const },
  { num: '02', title: 'La vérité cachée',      key: 'verite' as const },
  { num: '03', title: 'La mécanique intérieure', key: 'mecanique' as const },
  { num: '04', title: 'Ce que ça coûte',        key: 'consequence' as const },
  { num: '05', title: 'La suite',               key: 'transition' as const },
]

export function ResultPage({ firstName, scores, dominant, secondary, email }: Props) {
  const [protocols, setProtocols] = useState<Protocol[]>([])
  const [protocolsLoading, setProtocolsLoading] = useState(true)

  const dimInfo = DIMENSIONS[parseInt(dominant) as keyof typeof DIMENSIONS]
  const archetype = getArchetype(dominant, secondary)
  const bc = BLESSURE_COLORS[archetype.blessure]
  const displayName = firstName || 'toi'

  useEffect(() => {
    async function loadProtocols() {
      const supabase = createClient()
      const [{ data }, { data: publishedDouleurs }] = await Promise.all([
        (supabase as any).from('protocols').select('*'),
        (supabase as any).from('douleurs').select('slug').eq('is_published', true),
      ])
      const publishedSet = new Set(
        (publishedDouleurs || []).map((d: { slug: string }) => d.slug),
      )
      if (data)
        setProtocols((data as Protocol[]).filter(p => publishedSet.has(p.slug)))
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
    <div className="min-h-screen" style={{ background: 'var(--bg, #0a0a0a)' }}>

      {/* ─── HERO ─── */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center overflow-hidden">

        {/* Halo décoratif */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${bc.bg.replace('0.07', '0.18')} 0%, transparent 70%)`,
          }}
        />

        {/* Badge blessure */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative mb-8"
        >
          <span
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-[10px] tracking-[0.28em] uppercase font-semibold"
            style={{ background: bc.bg, color: bc.text, border: `1px solid ${bc.border}` }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: bc.text }}
            />
            Blessure {archetype.blessure}
          </span>
        </motion.div>

        {/* Prénom + intro */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="text-sm mb-3 tracking-wide"
          style={{ color: 'rgba(255,255,255,0.38)' }}
        >
          {displayName}, voici ta signature émotionnelle
        </motion.p>

        {/* Nom archétype */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="font-display font-light leading-[1.08] mb-6 max-w-sm"
          style={{
            fontSize: 'clamp(2rem, 8vw, 3.5rem)',
            color: 'var(--brand, #C9A961)',
            letterSpacing: '-0.01em',
          }}
        >
          {archetype.name}
        </motion.h1>

        {/* Tags émotion · mode · zone */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="flex flex-wrap justify-center gap-2 mb-16"
        >
          {[archetype.emotion, archetype.mode, archetype.zone].map(tag => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-[10px] tracking-[0.18em] uppercase"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.45)',
              }}
            >
              {tag}
            </span>
          ))}
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.9 }}
          className="flex flex-col items-center gap-2"
          style={{ color: 'rgba(255,255,255,0.2)' }}
        >
          <span className="text-[9px] tracking-[0.3em] uppercase">Découvrir</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-px h-8"
            style={{ background: 'linear-gradient(to bottom, rgba(201,169,97,0.5), transparent)' }}
          />
        </motion.div>
      </section>

      {/* ─── SÉPARATEUR ─── */}
      <div className="flex items-center gap-4 px-6 max-w-lg mx-auto py-4">
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <span
          className="text-[9px] tracking-[0.3em] uppercase"
          style={{ color: 'rgba(201,169,97,0.4)' }}
        >
          Lecture psychologique
        </span>
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
      </div>

      {/* ─── SECTIONS NARRATIVES ─── */}
      <div className="px-6 max-w-lg mx-auto space-y-0 pb-8">
        {SECTION_LABELS.map((section, i) => (
          <Reveal key={section.num} delay={0.05 * i} className="py-14">
            <div className="flex gap-6">
              {/* Numéro + ligne verticale */}
              <div className="flex flex-col items-center gap-2 pt-1 flex-shrink-0">
                <span
                  className="text-[10px] font-bold tabular-nums"
                  style={{ color: 'var(--brand, #C9A961)', opacity: 0.6 }}
                >
                  {section.num}
                </span>
                {i < SECTION_LABELS.length - 1 && (
                  <div
                    className="w-px flex-1 mt-2"
                    style={{
                      minHeight: 60,
                      background: 'linear-gradient(to bottom, rgba(201,169,97,0.2), transparent)',
                    }}
                  />
                )}
              </div>

              {/* Contenu */}
              <div className="flex-1 pb-2">
                <p
                  className="text-[10px] tracking-[0.28em] uppercase font-semibold mb-4"
                  style={{ color: 'var(--brand, #C9A961)', opacity: 0.65 }}
                >
                  {section.title}
                </p>
                <p
                  className="text-[0.95rem] leading-[1.85] font-light whitespace-pre-line"
                  style={{
                    color: section.key === 'transition'
                      ? 'var(--brand, #C9A961)'
                      : section.key === 'reconnaissance'
                      ? 'rgba(255,255,255,0.9)'
                      : 'rgba(255,255,255,0.65)',
                  }}
                >
                  {archetype[section.key]}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* ─── PROTOCOLE ─── */}
      <div className="px-6 max-w-lg mx-auto pb-8">
        <div
          className="h-px mb-16"
          style={{ background: 'linear-gradient(to right, transparent, rgba(201,169,97,0.25), transparent)' }}
        />

        <Reveal>
          <div className="mb-8">
            <p
              className="text-[10px] tracking-[0.3em] uppercase font-semibold mb-2"
              style={{ color: 'var(--brand, #C9A961)', opacity: 0.6 }}
            >
              Protocole recommandé
            </p>
            <p className="text-xl font-light" style={{ color: 'rgba(255,255,255,0.85)' }}>
              Le point de départ adapté à ton profil
            </p>
          </div>
        </Reveal>

        {protocolsLoading ? (
          <div
            className="rounded-2xl p-7 animate-pulse"
            style={{
              background: 'rgba(201,169,97,0.04)',
              border: '1px solid rgba(201,169,97,0.12)',
            }}
          >
            <div className="h-4 rounded w-2/3 mb-3" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="h-3 rounded w-1/2"    style={{ background: 'rgba(255,255,255,0.04)' }} />
          </div>
        ) : topProtocol ? (
          <Reveal>
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, rgba(201,169,97,0.09) 0%, rgba(201,169,97,0.03) 100%)',
                border: '1px solid rgba(201,169,97,0.22)',
              }}
            >
              {/* Header protocole */}
              <div className="p-6 pb-5">
                <div className="flex items-start justify-between gap-4 mb-1">
                  <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary, #fff)' }}>
                    {topProtocol.title}
                  </h3>
                  <span className="text-2xl flex-shrink-0 mt-0.5">{dimInfo?.icon}</span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span
                    className="text-[10px] tracking-[0.15em] uppercase px-2.5 py-1 rounded-full"
                    style={{
                      background: 'rgba(201,169,97,0.12)',
                      color: 'var(--brand, #C9A961)',
                    }}
                  >
                    {topProtocol.duration_days} jours
                  </span>
                  <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {topProtocol.matchScore}% de correspondance
                  </span>
                </div>
              </div>

              {/* Étapes */}
              <div
                className="px-6 py-5 space-y-4"
                style={{ borderTop: '1px solid rgba(201,169,97,0.12)' }}
              >
                {[
                  { num: 1, label: 'Comprendre',         desc: 'Reconnaître quand le schéma s\'active' },
                  { num: 2, label: 'Libérer & intégrer', desc: 'Relier le présent à ton histoire' },
                  { num: 3, label: 'Agir',               desc: 'Remplacer l\'automatisme par un choix conscient' },
                ].map(step => (
                  <div key={step.num} className="flex items-start gap-4">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                      style={{
                        background: 'rgba(201,169,97,0.15)',
                        color: 'var(--brand, #C9A961)',
                        border: '1px solid rgba(201,169,97,0.25)',
                      }}
                    >
                      {step.num}
                    </div>
                    <div>
                      <p className="text-[0.8rem] font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>
                        {step.label}
                      </p>
                      <p className="text-[0.75rem] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="px-6 pb-6 pt-4">
                <Link
                  href={ctaUrl}
                  onClick={() => {
                    storeProtocolSlug()
                    trackResultEvent('cta_clicked', { protocolSlug: topProtocol.slug }, email)
                  }}
                  className="block text-center py-4 rounded-xl text-sm font-semibold transition-all hover:brightness-110 active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, #C9A961, #B8960F)',
                    color: '#000',
                    letterSpacing: '0.02em',
                  }}
                >
                  Commencer mon protocole
                </Link>
              </div>
            </div>
          </Reveal>
        ) : (
          <Reveal>
            <Link
              href={signupUrl}
              className="block text-center w-full py-4 rounded-xl text-sm font-semibold transition-all hover:brightness-110"
              style={{
                background: 'linear-gradient(135deg, #C9A961, #B8960F)',
                color: '#000',
              }}
            >
              Créer mon espace gratuit
            </Link>
          </Reveal>
        )}
      </div>

      {/* ─── SCANNER APPROFONDI ─── */}
      <div className="px-6 max-w-lg mx-auto pb-10">
        <Reveal>
          <div
            className="rounded-2xl p-6"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 text-lg"
                style={{ background: 'rgba(201,169,97,0.1)', border: '1px solid rgba(201,169,97,0.2)' }}
              >
                🔬
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  Scanner émotionnel approfondi
                </p>
                <p className="text-xs leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  40 questions · 12 dimensions · lecture personnalisée générée par IA — pour aller bien au-delà de cet aperçu.
                </p>
                <a
                  href="/quiz-approfondi"
                  className="inline-flex items-center gap-2 text-xs font-medium transition-all hover:brightness-125"
                  style={{ color: 'var(--brand, #C9A961)' }}
                >
                  Faire le scanner complet
                  <span>→</span>
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* ─── PARTAGE ─── */}
      <div className="px-6 max-w-lg mx-auto pb-24">
        <Reveal>
          <div
            className="h-px mb-10"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          />
          <div className="text-center space-y-5">
            <p className="text-[10px] tracking-[0.25em] uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Partager mon résultat
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  const text = `Je viens de découvrir ma Signature Émotionnelle sur SOS Shine. Et toi ? 👉 https://sosshine.com/signature-emotionnelle`
                  if (navigator.share) {
                    navigator.share({
                      title: 'Ma Signature Émotionnelle',
                      text,
                      url: 'https://sosshine.com/signature-emotionnelle',
                    }).catch(() => {})
                  } else {
                    navigator.clipboard.writeText(text).then(() => alert('Lien copié !'))
                  }
                }}
                className="px-5 py-2.5 rounded-full text-xs font-medium cursor-pointer transition-all hover:scale-[1.03]"
                style={{
                  background: 'rgba(201,169,97,0.07)',
                  border: '1px solid rgba(201,169,97,0.18)',
                  color: 'var(--brand, #C9A961)',
                }}
              >
                📤 Partager
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent('Je viens de découvrir ma Signature Émotionnelle sur SOS Shine 🔥 → https://sosshine.com/signature-emotionnelle')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-full text-xs font-medium transition-all hover:scale-[1.03]"
                style={{
                  background: 'rgba(37,211,102,0.07)',
                  border: '1px solid rgba(37,211,102,0.18)',
                  color: '#25D366',
                }}
              >
                💬 WhatsApp
              </a>
            </div>
          </div>
        </Reveal>
      </div>

    </div>
  )
}
