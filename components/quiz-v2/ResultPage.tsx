'use client'

import { useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
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

function FadeIn({
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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
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

// Format today's date as "18 juin 2026"
function formatDate() {
  return new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function ResultPage({ firstName, scores, dominant, secondary, email }: Props) {
  const [protocols, setProtocols] = useState<Protocol[]>([])
  const [protocolsLoading, setProtocolsLoading] = useState(true)
  const { scrollYProgress } = useScroll()
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  const archetype = getArchetype(dominant, secondary)
  const bc = BLESSURE_COLORS[archetype.blessure]
  const displayName = firstName || null

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
  // Conversion : on va DIRECTEMENT à la création de compte (1 clic), en gardant
  // le protocole recommandé en mémoire (retrouvé dans l'espace juste après).
  const ctaUrl = topProtocol
    ? `/signup?source=quiz&protocol=${topProtocol.slug}&email=${encodeURIComponent(email)}`
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
    <div style={{ background: '#080808', color: '#fff', minHeight: '100vh' }}>

      {/* Barre de progression */}
      <motion.div
        className="fixed top-0 left-0 h-[2px] z-50 origin-left"
        style={{ width: progressWidth, background: bc.text }}
      />

      {/* ─── PAGE : COVER ─── */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden"
      >
        {/* Ambiance lumineuse */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 50% 40%, ${bc.bg.replace('0.07', '0.2')} 0%, transparent 70%)`,
          }}
        />

        {/* En-tête lettre */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="relative flex flex-col items-center gap-1 mb-16"
        >
          <span className="text-[9px] tracking-[0.4em] uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>
            SOS Shine
          </span>
          <div className="w-px h-8 mt-2" style={{ background: 'rgba(255,255,255,0.1)' }} />
        </motion.div>

        {/* Corps cover */}
        <div className="relative max-w-sm w-full">

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="text-sm font-light mb-4"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            Une lettre pour
          </motion.p>

          {displayName && (
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="font-display font-light mb-6"
              style={{
                fontSize: 'clamp(1.6rem, 7vw, 2.8rem)',
                letterSpacing: '-0.01em',
                color: 'rgba(255,255,255,0.9)',
              }}
            >
              {displayName}
            </motion.p>
          )}

          {/* Sceau archétype */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 1.3, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex flex-col items-center gap-4 px-8 py-8 rounded-2xl my-4"
            style={{
              background: bc.bg,
              border: `1px solid ${bc.border}`,
            }}
          >
            <span className="text-[8px] tracking-[0.4em] uppercase" style={{ color: bc.text, opacity: 0.7 }}>
              Signature Émotionnelle · Blessure de {archetype.blessure}
            </span>
            <h1
              className="font-display font-light leading-tight text-center"
              style={{
                fontSize: 'clamp(1.7rem, 7vw, 3rem)',
                letterSpacing: '-0.02em',
                background: `linear-gradient(160deg, #fff 30%, ${bc.text} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {archetype.name}
            </h1>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {[archetype.emotion, archetype.mode].map(t => (
                <span
                  key={t}
                  className="text-[9px] tracking-[0.2em] uppercase px-3 py-1 rounded-full"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.4)',
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.9 }}
            className="text-[10px] mt-8"
            style={{ color: 'rgba(255,255,255,0.15)' }}
          >
            {formatDate()}
          </motion.p>
        </div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.3 }}
          className="absolute bottom-12 flex flex-col items-center gap-3"
        >
          <span className="text-[8px] tracking-[0.4em] uppercase" style={{ color: 'rgba(255,255,255,0.15)' }}>
            Lire la lettre
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-px h-8"
            style={{ background: `linear-gradient(to bottom, ${bc.text}66, transparent)` }}
          />
        </motion.div>
      </section>

      {/* ─── LETTRE ─── */}
      <article className="relative px-6 max-w-[580px] mx-auto pt-20 pb-10">

        {/* Ligne latérale gauche */}
        <div
          className="absolute top-0 bottom-0 left-6 sm:left-10 w-px pointer-events-none"
          style={{
            background: `linear-gradient(to bottom, transparent, ${bc.border} 8%, ${bc.border} 92%, transparent)`,
          }}
        />

        <div className="pl-8 sm:pl-12">

          {/* Date et objet */}
          <FadeIn className="mb-14">
            <p className="text-[10px] tracking-[0.25em] uppercase mb-6" style={{ color: 'rgba(255,255,255,0.2)' }}>
              {formatDate()}
            </p>
            <p className="text-[11px] tracking-wide uppercase font-semibold mb-1" style={{ color: bc.text, opacity: 0.8 }}>
              Objet
            </p>
            <p className="text-base font-light" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Ta Signature Émotionnelle, {archetype.name}
            </p>
          </FadeIn>

          {/* Salutation */}
          <FadeIn delay={0.1} className="mb-10">
            <p
              className="font-display font-light"
              style={{
                fontSize: 'clamp(1.1rem, 4vw, 1.5rem)',
                color: 'rgba(255,255,255,0.85)',
                letterSpacing: '-0.01em',
              }}
            >
              {displayName ? `${displayName},` : 'À toi,'}
            </p>
          </FadeIn>

          {/* Paragraphe 1 — Reconnaissance */}
          <FadeIn delay={0.15} className="mb-10">
            <p
              className="text-[0.92rem] leading-[2] font-light whitespace-pre-line"
              style={{ color: 'rgba(255,255,255,0.82)' }}
            >
              {archetype.reconnaissance}
            </p>
          </FadeIn>

          {/* Pull quote — Vérité */}
          <FadeIn delay={0.2} className="mb-10">
            <blockquote
              className="pl-5 py-1"
              style={{ borderLeft: `2px solid ${bc.text}` }}
            >
              <p
                className="text-[0.88rem] leading-[1.95] font-light italic whitespace-pre-line"
                style={{ color: 'rgba(255,255,255,0.5)' }}
              >
                {archetype.verite}
              </p>
            </blockquote>
          </FadeIn>

          {/* Paragraphe 2 — Mécanique */}
          <FadeIn delay={0.25} className="mb-10">
            <p
              className="text-[0.92rem] leading-[2] font-light whitespace-pre-line"
              style={{ color: 'rgba(255,255,255,0.65)' }}
            >
              {archetype.mecanique}
            </p>
          </FadeIn>

          {/* Paragraphe 3 — Conséquence */}
          <FadeIn delay={0.3} className="mb-10">
            <p
              className="text-[0.92rem] leading-[2] font-light whitespace-pre-line"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              {archetype.consequence}
            </p>
          </FadeIn>

          {/* Clôture — Transition */}
          <FadeIn delay={0.35} className="mb-16">
            <p
              className="text-[0.95rem] leading-[2] font-light whitespace-pre-line"
              style={{ color: bc.text }}
            >
              {archetype.transition}
            </p>
          </FadeIn>

          {/* Signature */}
          <FadeIn delay={0.4} className="mb-20">
            <div className="flex flex-col gap-2">
              <div className="w-12 h-px" style={{ background: 'rgba(255,255,255,0.12)' }} />
              <p className="text-xs font-light" style={{ color: 'rgba(255,255,255,0.25)' }}>
                L'équipe SOS Shine
              </p>
            </div>
          </FadeIn>

        </div>
      </article>

      {/* ─── PROTOCOLE ─── */}
      <section className="px-6 max-w-[580px] mx-auto pb-8">

        <FadeIn>
          <div className="flex items-center gap-4 mb-12">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
            <span className="text-[9px] tracking-[0.35em] uppercase" style={{ color: bc.text, opacity: 0.55 }}>
              Recommandation
            </span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
          </div>
        </FadeIn>

        <FadeIn className="mb-8">
          <p className="text-[9px] tracking-[0.3em] uppercase mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Protocole adapté
          </p>
          <p
            className="font-display font-light"
            style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', letterSpacing: '-0.01em', color: '#fff' }}
          >
            Par où commencer
          </p>
        </FadeIn>

        {protocolsLoading ? (
          <div
            className="rounded-2xl p-8 animate-pulse"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div className="h-5 rounded w-3/4 mb-4" style={{ background: 'rgba(255,255,255,0.04)' }} />
            <div className="h-3 rounded w-1/2" style={{ background: 'rgba(255,255,255,0.03)' }} />
          </div>
        ) : topProtocol ? (
          <FadeIn>
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: `linear-gradient(160deg, ${bc.bg.replace('0.07', '0.1')} 0%, rgba(255,255,255,0.015) 60%)`,
                border: `1px solid ${bc.border}`,
              }}
            >
              <div className="p-7 pb-5">
                <div className="flex justify-between items-start gap-4 mb-4">
                  <h3
                    className="text-lg font-semibold leading-snug"
                    style={{ color: '#fff', letterSpacing: '-0.01em' }}
                  >
                    {topProtocol.title}
                  </h3>
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{ background: bc.bg, border: `1px solid ${bc.border}` }}
                  >
                    {DIMENSIONS[parseInt(dominant) as keyof typeof DIMENSIONS]?.icon}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="text-[9px] tracking-[0.2em] uppercase px-3 py-1.5 rounded-full font-semibold"
                    style={{ background: bc.bg, color: bc.text, border: `1px solid ${bc.border}` }}
                  >
                    {topProtocol.duration_days} jours
                  </span>
                  <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    {topProtocol.matchScore}% de correspondance
                  </span>
                </div>
              </div>

              <div
                className="px-7 py-5 space-y-4"
                style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
              >
                {[
                  { label: 'Comprendre',          desc: 'Reconnaître quand le schéma s\'active' },
                  { label: 'Libérer & intégrer',   desc: 'Relier le présent à ton histoire' },
                  { label: 'Agir',                 desc: 'Remplacer l\'automatisme par un choix conscient' },
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5"
                      style={{ background: bc.bg, color: bc.text, border: `1px solid ${bc.border}` }}
                    >
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-[0.8rem] font-semibold" style={{ color: 'rgba(255,255,255,0.8)' }}>
                        {step.label}
                      </p>
                      <p className="text-[0.72rem] mt-0.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-7 pb-7 pt-5">
                <Link
                  href={ctaUrl}
                  onClick={() => {
                    storeProtocolSlug()
                    trackResultEvent('cta_clicked', { protocolSlug: topProtocol.slug }, email)
                  }}
                  className="flex items-center justify-center gap-3 py-4 rounded-xl text-sm font-semibold transition-all hover:brightness-110 active:scale-[0.98]"
                  style={{
                    background: `linear-gradient(135deg, ${bc.text}, #A88248)`,
                    color: '#000',
                    letterSpacing: '0.02em',
                  }}
                >
                  Créer mon compte pour commencer
                  <span>→</span>
                </Link>
                {/* Réassurance collée au bouton */}
                <p className="text-[11px] text-center mt-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  Gratuit · 20 secondes · sans carte bancaire, tu retrouves ta lettre et ton protocole dans ton espace.
                </p>
              </div>
            </div>
          </FadeIn>
        ) : (
          <FadeIn>
            <Link
              href={signupUrl}
              className="flex items-center justify-center gap-3 w-full py-4 rounded-xl text-sm font-semibold transition-all hover:brightness-110"
              style={{ background: `linear-gradient(135deg, ${bc.text}, #A88248)`, color: '#000' }}
            >
              Créer mon compte gratuit
              <span>→</span>
            </Link>
            <p className="text-[11px] text-center mt-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Gratuit · 20 secondes · sans carte bancaire, tu retrouves ta lettre dans ton espace.
            </p>
          </FadeIn>
        )}
      </section>

      {/* ─── SCANNER : retiré de la page de résultat (fuite de conversion).
           Le scanner approfondi reste accessible depuis le dashboard, après inscription. ─── */}

      {/* ─── PARTAGE ─── */}
      <section className="px-6 max-w-[580px] mx-auto pb-28 pt-4">
        <FadeIn>
          <div className="flex items-center gap-4 mb-7">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.04)' }} />
            <span className="text-[9px] tracking-[0.3em] uppercase" style={{ color: 'rgba(255,255,255,0.12)' }}>
              Partager
            </span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.04)' }} />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                const text = `Je viens de découvrir ma Signature Émotionnelle sur SOS Shine. Et toi ? 👉 https://sosshine.com/signature-emotionnelle`
                if (navigator.share) {
                  navigator.share({ title: 'Ma Signature Émotionnelle', text, url: 'https://sosshine.com/signature-emotionnelle' }).catch(() => {})
                } else {
                  navigator.clipboard.writeText(text).then(() => alert('Lien copié !'))
                }
              }}
              className="flex-1 py-3 rounded-xl text-xs font-medium cursor-pointer transition-all hover:brightness-110"
              style={{
                background: 'rgba(201,169,97,0.05)',
                border: '1px solid rgba(201,169,97,0.12)',
                color: 'var(--brand, #C9A961)',
              }}
            >
              📤 Partager
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent('Je viens de découvrir ma Signature Émotionnelle sur SOS Shine 🔥 → https://sosshine.com/signature-emotionnelle')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 rounded-xl text-xs font-medium text-center transition-all hover:brightness-110"
              style={{
                background: 'rgba(37,211,102,0.05)',
                border: '1px solid rgba(37,211,102,0.12)',
                color: '#25D366',
              }}
            >
              💬 WhatsApp
            </a>
          </div>
        </FadeIn>
      </section>

    </div>
  )
}
