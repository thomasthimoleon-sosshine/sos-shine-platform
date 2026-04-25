'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { DIMENSIONS, type DimensionScores } from '@/lib/quiz-v2/dimensions'
import { DIMENSION_TEXTS, generateActe4 } from '@/lib/quiz-v2/result-texts'
import { calculateMatchScores } from '@/lib/quiz-v2/scoring'
import { createClient } from '@/lib/supabase/client'

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

const STRIPE_SERENITE = 'https://buy.stripe.com/3cI5kvai06p51oJbgK5ZC0f'
const STRIPE_ESSENTIELLE = 'https://buy.stripe.com/3cIcMXducdRx3wResW5ZC0e'

function Acte({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  )
}

export function ResultPage({ firstName, scores, dominant, secondary, q15Response, email }: Props) {
  const [protocols, setProtocols] = useState<Protocol[]>([])
  const dimInfo = DIMENSIONS[parseInt(dominant) as keyof typeof DIMENSIONS]
  const texts = DIMENSION_TEXTS[dominant]

  useEffect(() => {
    async function loadProtocols() {
      const supabase = createClient()
      const { data } = await (supabase as any).from('protocols').select('*')
      if (data) setProtocols(data)
    }
    loadProtocols()
  }, [])

  const matchedProtocols = protocols
    .map(p => ({ ...p, matchScore: calculateMatchScores(scores, p.dimension_weights) }))
    .filter(p => p.matchScore >= 70)
    .sort((a, b) => b.matchScore - a.matchScore)

  const available = matchedProtocols.filter(p => p.status === 'available')
  const comingSoon = matchedProtocols.filter(p => p.status === 'coming_soon')

  const displayName = firstName || 'Toi'

  async function handleNotify(protocolId: string) {
    const supabase = createClient()
    await (supabase as any).from('protocol_notifications').insert({
      user_email: email,
      protocol_id: protocolId,
    })
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 space-y-20">

      {/* ══════════ ACTE 1 — RECONNAISSANCE ══════════ */}
      <Acte>
        <div className="text-center space-y-6">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="font-display text-2xl sm:text-3xl font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            {displayName},
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="text-sm leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Avant toute chose : merci d&apos;avoir eu le courage de répondre jusqu&apos;au bout.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.8, type: 'spring' }}
          >
            <span className="text-4xl">✨</span>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
            className="text-sm"
            style={{ color: 'var(--text-secondary)' }}
          >
            Voilà ce que tes 15 réponses nous ont révélé.
          </motion.p>
        </div>
      </Acte>

      {/* ══════════ ACTE 2 — LE PATTERN ══════════ */}
      {texts && (
        <Acte>
          <div className="space-y-6">
            <h2 className="font-display text-lg sm:text-xl font-semibold tracking-wide uppercase" style={{ color: 'var(--gold)' }}>
              Il y a un pattern dans tes réponses.
            </h2>
            <div className="whitespace-pre-line text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {texts.acte2}
            </div>
          </div>
        </Acte>
      )}

      {/* ══════════ ACTE 3 — LE POURQUOI ══════════ */}
      {texts && (
        <Acte>
          <div className="space-y-6">
            <h2 className="font-display text-lg sm:text-xl font-semibold tracking-wide uppercase" style={{ color: 'var(--gold)' }}>
              D&apos;où ça vient ?
            </h2>
            <div className="whitespace-pre-line text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {texts.acte3}
            </div>
          </div>
        </Acte>
      )}

      {/* ══════════ ACTE 4 — LE COÛT ══════════ */}
      <Acte>
        <div className="space-y-6">
          <h2 className="font-display text-lg sm:text-xl font-semibold tracking-wide uppercase" style={{ color: 'var(--gold)' }}>
            Ce qui va se passer si rien ne change.
          </h2>
          <div className="whitespace-pre-line text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {generateActe4(dominant)}
          </div>
        </div>
      </Acte>

      {/* ══════════ ACTE 5 — LA PROMESSE ══════════ */}
      <Acte>
        <div className="space-y-6">
          <h2 className="font-display text-lg sm:text-xl font-semibold tracking-wide uppercase" style={{ color: 'var(--gold)' }}>
            Mais tu peux changer.
          </h2>

          {q15Response && (
            <div className="space-y-4">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Tout à l&apos;heure, tu as écrit une phrase à l&apos;enfant en toi :
              </p>
              <blockquote
                className="font-display text-xl sm:text-2xl italic text-center py-6 px-4"
                style={{ color: 'var(--gold)' }}
              >
                &laquo;&nbsp;{q15Response}&nbsp;&raquo;
              </blockquote>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Cette phrase n&apos;était pas un hasard.
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                C&apos;est exactement ce que cet(te) enfant attendait d&apos;entendre il y a 20, 30 ans.
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Et c&apos;est exactement ce que SOS Shine va t&apos;aider à lui dire vraiment.
              </p>
            </div>
          )}
        </div>
      </Acte>

      {/* ══════════ ACTE 6 — LE CHEMIN ══════════ */}
      <Acte>
        <div className="space-y-8">
          <div>
            <h2 className="font-display text-lg sm:text-xl font-semibold tracking-wide uppercase" style={{ color: 'var(--gold)' }}>
              Voici ton chemin.
            </h2>
            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
              À partir de tes 15 réponses, voici les protocoles qui vont vraiment te parler.
            </p>
          </div>

          {/* Available protocols */}
          {available.length > 0 && (
            <div className="space-y-3">
              {available.slice(0, 4).map(p => (
                <div key={p.id} className="rounded-xl p-5 flex items-center justify-between"
                  style={{ background: 'rgba(85,239,196,0.06)', border: '1px solid rgba(85,239,196,0.15)' }}>
                  <div>
                    <p className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <span style={{ color: '#55EFC4' }}>✓</span> {p.title}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      {p.duration_days} jours de protocole · Match : {p.matchScore}%
                    </p>
                  </div>
                  <Link href={`/dashboard/encyclopedie/${p.slug}`}
                    className="text-xs px-4 py-2 rounded-full font-medium flex-shrink-0"
                    style={{ background: 'rgba(85,239,196,0.15)', color: '#55EFC4' }}>
                    Commencer →
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* Coming soon protocols */}
          {comingSoon.length > 0 && (
            <div className="space-y-3">
              {comingSoon.slice(0, 3).map(p => (
                <div key={p.id} className="rounded-xl p-5 flex items-center justify-between"
                  style={{ background: 'rgba(201,169,97,0.06)', border: '1px solid rgba(201,169,97,0.15)' }}>
                  <div>
                    <p className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <span style={{ color: 'var(--gold)' }}>⏳</span> {p.title}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      Disponible en {p.release_date ? new Date(p.release_date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : 'bientôt'} · Match : {p.matchScore}%
                    </p>
                  </div>
                  <button onClick={() => handleNotify(p.id)}
                    className="text-xs px-4 py-2 rounded-full font-medium flex-shrink-0 cursor-pointer"
                    style={{ background: 'rgba(201,169,97,0.15)', color: 'var(--gold)' }}>
                    Être notifié(e)
                  </button>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            On t&apos;enverra un email personnalisé à chaque nouveau protocole qui te correspond.
          </p>
        </div>
      </Acte>

      {/* ══════════ CTA FINAL ══════════ */}
      <Acte>
        <div className="rounded-2xl p-8 text-center space-y-6"
          style={{ background: 'linear-gradient(160deg, rgba(201,169,97,0.08), rgba(201,169,97,0.02))', border: '1px solid rgba(201,169,97,0.2)' }}>

          <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--gold)' }}>
            Rejoindre SOS Shine
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Accès à TOUS tes protocoles personnalisés, à ta communauté, aux lives, et à tout ce qui viendra pour toi dans les prochains mois.
          </p>

          <a href={STRIPE_SERENITE}
            className="block w-full py-4 rounded-full text-sm font-semibold transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-deep, #B8960F))', color: '#050505' }}>
            COMMENCER SÉRÉNITÉ · 🎁 7 jours offerts
          </a>

          <a href={STRIPE_ESSENTIELLE}
            className="block text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: 'var(--text-secondary)' }}>
            Voir la formule Essentielle (9,90€/mois) →
          </a>

          <p className="text-xs flex items-center justify-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
            💾 Ton résultat complet a été envoyé à ton email.
          </p>
        </div>
      </Acte>
    </div>
  )
}
