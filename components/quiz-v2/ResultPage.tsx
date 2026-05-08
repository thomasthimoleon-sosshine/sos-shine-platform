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

export function ResultPage({ firstName, scores, dominant, secondary, q15Response, email }: Props) {
  const [protocols, setProtocols] = useState<Protocol[]>([])
  const [protocolsLoading, setProtocolsLoading] = useState(true)
  const dimInfo = DIMENSIONS[parseInt(dominant) as keyof typeof DIMENSIONS]
  const texts = DIMENSION_TEXTS[dominant]

  useEffect(() => {
    async function loadProtocols() {
      const supabase = createClient()
      const { data } = await (supabase as any).from('protocols').select('*')
      if (data) setProtocols(data)
      setProtocolsLoading(false)
    }
    loadProtocols()

    trackResultEvent('result_page_viewed', { dominant, secondary }, email)
    if (dimInfo) {
      trackResultEvent('pattern_identified', { dominant, secondary, dimName: dimInfo.name }, email)
    }
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

  useEffect(() => {
    if (topProtocol) {
      trackResultEvent('protocol_recommendation_viewed', { protocolId: topProtocol.id, protocolTitle: topProtocol.title, matchScore: topProtocol.matchScore }, email)
    }
  }, [topProtocol?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleNotify(protocolId: string) {
    const supabase = createClient()
    await (supabase as any).from('protocol_notifications').insert({
      user_email: email,
      protocol_id: protocolId,
    })
  }

  function storeProtocolSlug() {
    if (topProtocol) {
      try {
        sessionStorage.setItem('sos_protocol_slug', topProtocol.slug)
        if (email) sessionStorage.setItem('sos_quiz_email', email)
      } catch {}
    }
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
            Ce n&apos;est pas par hasard que tu es allé(e) jusqu&apos;au bout.
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
            15 questions. Un schéma qui se dessine depuis des années. Voilà ce que tes réponses nous ont révélé.
          </motion.p>
        </div>
      </Acte>

      {/* ══════════ ACTE 2 — LE PATTERN ══════════ */}
      {texts && dimInfo && (
        <Acte>
          <div className="space-y-6">
            <h2 className="font-display text-lg sm:text-xl font-semibold tracking-wide uppercase" style={{ color: 'var(--brand)' }}>
              On a identifié un schéma.
            </h2>
            <div className="whitespace-pre-line text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {texts.acte2}
            </div>
            <div className="rounded-xl px-5 py-4" style={{ background: 'rgba(201,169,97,0.07)', border: '1px solid rgba(201,169,97,0.18)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--brand)' }}>
                {dimInfo.icon} {dimInfo.name}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Ce n&apos;est pas une étiquette. C&apos;est une clé.
              </p>
            </div>
          </div>
        </Acte>
      )}

      {/* ══════════ COÛT IMMÉDIAT ══════════ */}
      {texts && (
        <Acte>
          <div className="space-y-5">
            <h2 className="font-display text-lg sm:text-xl font-semibold tracking-wide uppercase" style={{ color: 'var(--brand)' }}>
              Ce que ça te coûte aujourd&apos;hui.
            </h2>
            <ul className="space-y-3">
              {texts.costImmediate.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  <span className="mt-0.5 flex-shrink-0" style={{ color: 'var(--brand)' }}>—</span>
                  {item}
                </li>
              ))}
            </ul>
            {texts.safetyNote && (
              <p className="text-sm font-medium pt-1" style={{ color: 'var(--brand)', opacity: 0.9 }}>
                {texts.safetyNote}
              </p>
            )}
          </div>
        </Acte>
      )}

      {/* ══════════ ACTE 3 — D'OÙ ÇA VIENT ══════════ */}
      {texts && (
        <Acte>
          <div className="space-y-6">
            <h2 className="font-display text-lg sm:text-xl font-semibold tracking-wide uppercase" style={{ color: 'var(--brand)' }}>
              D&apos;où ça vient ?
            </h2>
            <div className="whitespace-pre-line text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {texts.acte3}
            </div>
          </div>
        </Acte>
      )}

      {/* ══════════ ACTE 4 — LE PIÈGE INVISIBLE ══════════ */}
      <Acte>
        <div className="space-y-6">
          <h2 className="font-display text-lg sm:text-xl font-semibold tracking-wide uppercase" style={{ color: 'var(--brand)' }}>
            Le piège invisible.
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Si rien ne change, voilà ce qui va se passer :
          </p>
          <div className="whitespace-pre-line text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {generateActe4(dominant)}
          </div>
        </div>
      </Acte>

      {/* ══════════ COMPRENDRE NE SUFFIT PAS ══════════ */}
      <Acte>
        <div className="rounded-2xl px-7 py-8 space-y-4 text-center"
          style={{ background: 'rgba(201,169,97,0.05)', border: '1px solid rgba(201,169,97,0.14)' }}>
          <h3 className="font-display text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Comprendre ne suffit pas.
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Tu sais déjà. Peut-être depuis longtemps.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Ce que tu ne sais pas encore, c&apos;est comment sortir du schéma. C&apos;est exactement pour ça que SOS Shine a été conçu.
          </p>
        </div>
      </Acte>

      {/* ══════════ CTA INTERMÉDIAIRE ══════════ */}
      <Acte>
        <div className="text-center space-y-3">
          {protocolsLoading ? (
            <button disabled className="block w-full py-4 rounded-full text-sm font-semibold opacity-50 cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-deep, #B8960F))', color: '#000000' }}>
              Chargement de ton protocole…
            </button>
          ) : (
            <Link
              href={ctaUrl}
              onClick={() => { storeProtocolSlug(); trackResultEvent('cta_clicked', { ctaType: 'intermediaire', position: 'before_acte5' }, email) }}
              className="block w-full py-4 rounded-full text-sm font-semibold transition-all hover:brightness-110"
              style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-deep, #B8960F))', color: '#000000' }}
            >
              Commencer mon protocole maintenant
            </Link>
          )}
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            7 jours offerts · accès immédiat · annulable à tout moment
          </p>
        </div>
      </Acte>

      {/* ══════════ ACTE 5 — LA PROMESSE ══════════ */}
      <Acte>
        <div className="space-y-6">
          <h2 className="font-display text-lg sm:text-xl font-semibold tracking-wide uppercase" style={{ color: 'var(--brand)' }}>
            Mais tu peux changer.
          </h2>

          <div className="space-y-4">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Les schémas qui te freinent aujourd&apos;hui se sont formés pour te protéger. Ils ont eu leur utilité. Mais ils ne te servent plus.
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Ce n&apos;est pas une question de volonté. C&apos;est une question de méthode.
            </p>
          </div>
        </div>
      </Acte>

      {/* ══════════ ACTE 6 — TON POINT DE DÉPART ══════════ */}
      <Acte>
        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="font-display text-lg sm:text-xl font-semibold tracking-wide uppercase" style={{ color: 'var(--brand)' }}>
              Ton protocole recommandé
            </h2>
            {topProtocol ? (
              <>
                <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {topProtocol.title} — {topProtocol.matchScore}% de correspondance
                </p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  C&apos;est le point de départ le plus adapté à ce que ton test vient de révéler.
                </p>
              </>
            ) : (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Crée ton espace pour découvrir les protocoles qui te correspondent.
              </p>
            )}
          </div>

          {/* Top protocol — highlighted */}
          {topProtocol && (
            <div className="rounded-2xl p-6 space-y-5"
              style={{ background: 'linear-gradient(160deg, rgba(201,169,97,0.10), rgba(201,169,97,0.03))', border: '1px solid rgba(201,169,97,0.25)' }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--brand)', opacity: 0.7 }}>
                    Ton protocole recommandé
                  </p>
                  <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {topProtocol.title}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {topProtocol.duration_days} jours · Match {topProtocol.matchScore}%
                  </p>
                </div>
                <span className="text-xl flex-shrink-0">{dimInfo?.icon}</span>
              </div>

              <div className="space-y-3 pt-1" style={{ borderTop: '1px solid rgba(201,169,97,0.15)' }}>
                <p className="text-xs font-medium pt-2" style={{ color: 'var(--text-muted)' }}>
                  Ce protocole t&apos;accompagne en 3 étapes :
                </p>
                {[
                  { num: '1', label: 'Comprendre', desc: 'reconnaître quand le schéma s\'active dans ton quotidien' },
                  { num: '2', label: 'Libérer & intégrer', desc: 'relier le présent à ce qui s\'est formé dans ton histoire' },
                  { num: '3', label: 'Agir', desc: 'remplacer l\'automatisme par un choix conscient' },
                ].map(step => (
                  <div key={step.num} className="flex items-start gap-3">
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
                onClick={() => storeProtocolSlug()}
                className="block text-center py-3 rounded-full text-sm font-semibold transition-all hover:brightness-110"
                style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-deep, #B8960F))', color: '#000000' }}
              >
                Découvrir mon protocole
              </Link>
            </div>
          )}

          {/* Other available protocols */}
          {available.length > 1 && (
            <div className="space-y-3">
              {available.slice(1, 4).map(p => (
                <div key={p.id} className="rounded-xl p-5 flex items-center justify-between"
                  style={{ background: 'rgba(85,239,196,0.06)', border: '1px solid rgba(85,239,196,0.15)' }}>
                  <div>
                    <p className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <span style={{ color: '#55EFC4' }}>✓</span> {p.title}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      {p.duration_days} jours · Match {p.matchScore}%
                    </p>
                  </div>
                  <Link href={`/protocole/${p.slug}?preview=true&email=${encodeURIComponent(email)}`}
                    className="text-xs px-4 py-2 rounded-full font-medium flex-shrink-0"
                    style={{ background: 'rgba(85,239,196,0.15)', color: '#55EFC4' }}>
                    Voir →
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
                      <span style={{ color: 'var(--brand)' }}>⏳</span> {p.title}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      Disponible en {p.release_date ? new Date(p.release_date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : 'bientôt'} · Match {p.matchScore}%
                    </p>
                  </div>
                  <button onClick={() => handleNotify(p.id)}
                    className="text-xs px-4 py-2 rounded-full font-medium flex-shrink-0 cursor-pointer"
                    style={{ background: 'rgba(201,169,97,0.15)', color: 'var(--brand)' }}>
                    Être notifié(e)
                  </button>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            On t&apos;enverra un email personnalisé à chaque nouveau protocole qui te correspond.
          </p>

          {!topProtocol && !protocolsLoading && (
            <Link
              href={signupUrl}
              className="block text-center w-full py-4 rounded-full text-sm font-semibold transition-all hover:brightness-110"
              style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-deep, #B8960F))', color: '#000000' }}
            >
              Créer mon espace gratuit
            </Link>
          )}
        </div>
      </Acte>

      {/* ══════════ ACTE 7 — CONCLUSION ══════════ */}
      <Acte>
        <div className="rounded-2xl p-8 text-center space-y-4"
          style={{ background: 'linear-gradient(160deg, rgba(201,169,97,0.08), rgba(201,169,97,0.02))', border: '1px solid rgba(201,169,97,0.2)' }}>
          <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--brand)' }}>
            Rejoindre SOS Shine
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Ton protocole personnalisé, ta communauté, les lives — tout ce qu&apos;il faut pour que le schéma change vraiment, pas juste se comprendre.
          </p>
        </div>
      </Acte>

      {/* ══════════ PARTAGE SOCIAL ══════════ */}
      <Acte>
        <div className="text-center space-y-4">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Partage ton résultat avec quelqu&apos;un qui en a besoin :
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => {
                const text = `Je viens de découvrir ma Signature Émotionnelle sur SOS Shine. Et toi, c'est quoi ton pattern ? 👉 https://sosshine.com/signature-emotionnelle`
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
      </Acte>
    </div>
  )
}
