'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const QUIZ_URL = '/signature-emotionnelle'
const EVENT_URL = '/ceremonie'

const TICKER_ITEMS = [
  '✨ Événement SOS Shine',
  '📍 Sud de la France',
  '📅 13 juin 2026',
  '🕕 18h – 21h30',
  '→ Réserver ma place',
]

function EventTicker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS]
  return (
    <Link href={EVENT_URL} className="fixed top-0 left-0 right-0 z-[60] block overflow-hidden cursor-pointer" style={{ background: 'var(--brand, #C9A961)' }}>
      <div
        className="flex whitespace-nowrap"
        style={{
          animation: 'ticker 22s linear infinite',
        }}
      >
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center px-4 py-2 text-xs font-semibold tracking-wide flex-shrink-0" style={{ color: '#000' }}>
            {item}
            <span className="mx-3 opacity-40">·</span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </Link>
  )
}

function TopNav() {
  return (
    <nav
      className="fixed left-0 right-0 z-50 flex items-center justify-end gap-3 px-6 py-4"
      style={{ top: '32px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
    >
      <Link
        href="/login"
        className="text-sm font-medium px-4 py-2 rounded-lg transition-colors hover:bg-white/5"
        style={{ color: '#a1a1aa' }}
      >
        Se connecter
      </Link>
      <Link
        href={QUIZ_URL}
        className="text-sm font-semibold px-4 py-2 rounded-lg transition-all hover:brightness-110"
        style={{ background: 'var(--brand, #C9A961)', color: '#000' }}
      >
        S'inscrire
      </Link>
    </nav>
  )
}

function trackCta(position: string) {
  fetch('/api/quiz-v2/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: `landing_${Date.now()}`,
      eventType: 'landing_quiz_cta_clicked',
      eventData: { cta_position: position, timestamp: new Date().toISOString() },
    }),
  }).catch(() => {})
}

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function CtaButton({ position, label = 'DÉCOUVRIR MA SIGNATURE →', large = false }: { position: string; label?: string; large?: boolean }) {
  return (
    <Link
      href={QUIZ_URL}
      onClick={() => trackCta(position)}
      className={`inline-block text-center font-semibold rounded-lg transition-all hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] ${large ? 'w-full sm:w-auto px-10 py-5 text-base' : 'px-8 py-4 text-sm'}`}
      style={{ background: 'var(--brand, var(--brand))', color: '#000000' }}
    >
      {label}
    </Link>
  )
}

// ═══════════════════════════════════════════
// FAQ Accordion
// ═══════════════════════════════════════════
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left cursor-pointer"
      >
        <span className="text-sm font-medium pr-4" style={{ color: 'var(--text-primary, #e0e0e0)' }}>{question}</span>
        <span className="text-lg flex-shrink-0 transition-transform" style={{ color: 'var(--brand, var(--brand))', transform: open ? 'rotate(45deg)' : 'rotate(0)' }}>+</span>
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="pb-5"
        >
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary, #a1a1aa)' }}>{answer}</p>
        </motion.div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════
export default function QuizLandingClient() {
  return (
    <main className="min-h-screen" style={{ background: '#000000', color: '#e0e0e0' }}>
      <EventTicker />
      <TopNav />

      {/* ══════════ SECTION 1 — HERO ══════════ */}
      <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden pt-24">
        {/* Background gradient */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-[0.06] blur-[100px]" style={{ background: 'var(--brand, var(--brand))' }} />
        </div>

        <div className="relative z-10 max-w-lg text-center space-y-8">
          {/* Logo */}
          <Reveal>
            <div className="flex items-center justify-center mb-4">
              <img src="/images/logo-shine.png" alt="SOS Shine" className="h-24" />
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight" style={{ color: '#e0e0e0' }}>
              Il y a une phrase qui résume comment tu te protèges émotionnellement depuis toujours.
            </h1>
          </Reveal>

          <Reveal delay={0.3}>
            <p className="text-base sm:text-lg leading-relaxed" style={{ color: '#a1a1aa' }}>
              Tu ne l&apos;as jamais entendue.<br />
              Mais elle dirige ta vie.
            </p>
          </Reveal>

          <Reveal delay={0.4}>
            <CtaButton position="hero" large />
          </Reveal>

          <Reveal delay={0.5}>
            <p className="text-xs flex items-center justify-center gap-2 flex-wrap" style={{ color: '#737373' }}>
              <span>⏱️ 3 minutes</span>
              <span>·</span>
              <span>🎁 Gratuit</span>
              <span>·</span>
              <span>🔒 Aucune inscription</span>
            </p>
          </Reveal>

          <Reveal delay={0.6}>
            <div className="pt-4">
              <p className="text-sm" style={{ color: 'var(--brand, var(--brand))' }}>⭐⭐⭐⭐⭐</p>
              <p className="text-xs italic mt-1" style={{ color: '#737373' }}>&laquo; Une révélation. &raquo;</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════ SECTION 2 — POURQUOI DIFFÉRENT ══════════ */}
      <section className="px-6 py-20 sm:py-28">
        <div className="max-w-lg mx-auto text-center space-y-8">
          <Reveal>
            <p className="text-xs tracking-[0.3em] uppercase font-medium" style={{ color: 'var(--brand, var(--brand))' }}>
              Pourquoi ce test est différent
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="space-y-6">
              <p className="font-display text-lg sm:text-xl leading-relaxed" style={{ color: '#e0e0e0' }}>
                Pas un énième test de magazine.
              </p>
              <p className="font-display text-lg sm:text-xl leading-relaxed" style={{ color: '#e0e0e0' }}>
                Pas de cases dans lesquelles on te range.
              </p>
              <p className="font-display text-lg sm:text-xl leading-relaxed" style={{ color: '#a1a1aa' }}>
                Pas de &laquo;&nbsp;personnalité INFP&nbsp;&raquo; ou &laquo;&nbsp;type 4 ennéagramme&nbsp;&raquo;.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="w-12 h-px mx-auto" style={{ background: 'var(--brand, var(--brand))' }} />
          </Reveal>

          <Reveal delay={0.3}>
            <div className="space-y-4">
              <p className="text-base leading-relaxed" style={{ color: '#a1a1aa' }}>
                Juste <strong style={{ color: '#e0e0e0' }}>UNE phrase</strong>. La tienne.
              </p>
              <p className="text-base leading-relaxed" style={{ color: '#a1a1aa' }}>
                Celle qui résume comment tu réagis quand quelque chose te touche.
              </p>
              <p className="text-base leading-relaxed" style={{ color: '#a1a1aa' }}>
                Pourquoi tu portes ce que tu portes. Pourquoi tu fuis ce que tu fuis. Pourquoi tu reproduis ce que tu ne veux pas reproduire.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.4}>
            <CtaButton position="section_2" label="COMMENCER LE TEST →" />
          </Reveal>
        </div>
      </section>

      {/* ══════════ SECTION 3 — EN 3 ÉTAPES ══════════ */}
      <section className="px-6 py-20 sm:py-28" style={{ background: 'rgba(255,255,255,0.015)' }}>
        <div className="max-w-2xl mx-auto space-y-12">
          <Reveal>
            <p className="text-xs tracking-[0.3em] uppercase font-medium text-center" style={{ color: 'var(--brand, var(--brand))' }}>
              En 3 étapes
            </p>
          </Reveal>

          {[
            { num: '01', title: 'Tu réponds à 15 questions.', desc: "Pas de jugement. Pas de bonne ou mauvaise réponse. Juste toi. Certaines questions vont te toucher. C'est normal." },
            { num: '02', title: 'On analyse ton profil sur 10 dimensions.', desc: "Pas un seul résultat parmi 10. Une combinaison unique qui te ressemble vraiment." },
            { num: '03', title: 'Tu reçois ta Signature.', desc: "Avec un texte personnalisé qui décode ce que tu portes, d'où ça vient, et comment t'en libérer." },
          ].map((step, i) => (
            <Reveal key={step.num} delay={i * 0.1}>
              <div className="flex gap-6 items-start">
                <span className="font-display text-3xl font-light flex-shrink-0" style={{ color: 'var(--brand, var(--brand))', opacity: 0.6 }}>
                  {step.num}
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold mb-2" style={{ color: '#e0e0e0' }}>{step.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#a1a1aa' }}>{step.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══════════ SECTION 4 — TÉMOIGNAGES ══════════ */}
      <section className="px-6 py-20 sm:py-28">
        <div className="max-w-2xl mx-auto space-y-10">
          <Reveal>
            <p className="text-xs tracking-[0.3em] uppercase font-medium text-center" style={{ color: 'var(--brand, var(--brand))' }}>
              Elles ont fait le test
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { text: "J'ai pleuré en lisant ma Signature. Pas de tristesse. De soulagement. Quelqu'un voyait enfin ce que je portais.", author: 'Camille, 41 ans' },
              { text: "Pas un énième test de magazine. Un vrai miroir.", author: 'Léa, 29 ans' },
              { text: "10 ans en thérapie. Et en 3 minutes sur SOS Shine, j'ai compris un truc que personne n'avait réussi à me dire.", author: 'Sophie, 34 ans' },
              { text: "Mon mari et moi avons fait le test séparément. On a compris nos 12 ans de conflit en 10 minutes.", author: 'Marc, 45 ans' },
            ].map((t, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="rounded-xl p-6 h-full" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="font-display text-sm italic leading-relaxed mb-4" style={{ color: '#e0e0e0' }}>
                    &laquo;&nbsp;{t.text}&nbsp;&raquo;
                  </p>
                  <p className="text-xs" style={{ color: '#737373' }}>— {t.author}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.4}>
            <div className="text-center pt-4">
              <CtaButton position="section_4" label="FAIRE LE TEST →" large />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════ SECTION 5 — JULIA + LIVRE ══════════ */}
      <section className="px-6 py-20 sm:py-28" style={{ background: 'rgba(255,255,255,0.015)' }}>
        <div className="max-w-2xl mx-auto">
          <Reveal>
            <p className="text-xs tracking-[0.3em] uppercase font-medium text-center mb-10" style={{ color: 'var(--brand, var(--brand))' }}>
              Créé par Julia Laureau
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="flex flex-col sm:flex-row items-center gap-8 text-center sm:text-left">
              <img src="/images/julia.jpeg" alt="Julia Laureau" className="w-24 h-24 rounded-full object-cover flex-shrink-0" />
              <div className="space-y-3">
                <p className="text-sm leading-relaxed" style={{ color: '#a1a1aa' }}>
                  Auteure du livre fondateur <strong style={{ color: '#e0e0e0' }}>&laquo;&nbsp;SOS Shine — Briller Comme un Diamant&nbsp;&raquo;</strong>.
                </p>
                <p className="text-sm leading-relaxed" style={{ color: '#a1a1aa' }}>
                  Ce test est l&apos;aboutissement de plusieurs années d&apos;accompagnements.
                </p>
                <p className="text-sm" style={{ color: 'var(--brand, var(--brand))' }}>⭐⭐⭐⭐⭐ Sur Amazon</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════ SECTION 6 — FAQ ══════════ */}
      <section className="px-6 py-20 sm:py-28">
        <div className="max-w-lg mx-auto space-y-8">
          <Reveal>
            <p className="text-xs tracking-[0.3em] uppercase font-medium text-center" style={{ color: 'var(--brand, var(--brand))' }}>
              Questions fréquentes
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div>
              <FaqItem question="C'est vraiment gratuit ?" answer="Oui. 100% gratuit. Aucune carte bancaire demandée." />
              <FaqItem question="Combien de temps ça prend ?" answer="Entre 3 et 5 minutes selon ton rythme." />
              <FaqItem question="Je dois m'inscrire pour commencer ?" answer="Non. Tu peux commencer immédiatement. On te demandera ton email à la mi-test pour t'envoyer ton résultat par mail (et pour que tu puisses y revenir plus tard)." />
              <FaqItem question="Mes réponses sont confidentielles ?" answer="Oui, totalement. Aucune réponse n'est partagée avec qui que ce soit." />
              <FaqItem question="C'est de la psychologie sérieuse ?" answer="C'est basé sur des années d'accompagnements et de recherche sur les schémas émotionnels. Ce n'est pas un test scientifique validé, c'est un outil de prise de conscience." />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════ SECTION 7 — CTA FINAL ══════════ */}
      <section className="relative px-6 py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-[0.04] blur-[120px]" style={{ background: 'var(--brand, var(--brand))' }} />
        </div>

        <div className="relative z-10 max-w-lg mx-auto text-center space-y-8">
          <Reveal>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold" style={{ color: '#e0e0e0' }}>
              Prêt(e) à te voir ?
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="text-base leading-relaxed" style={{ color: '#a1a1aa' }}>
              3 minutes pour découvrir une phrase qui va peut-être changer la lecture que tu as de toi-même.
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <CtaButton position="footer" label="COMMENCER MAINTENANT →" large />
          </Reveal>

          <Reveal delay={0.3}>
            <p className="text-xs" style={{ color: '#737373' }}>
              Gratuit · Sans inscription · 3 à 5 minutes
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="px-6 py-10 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center justify-center mb-4">
          <img src="/images/logo-shine.png" alt="SOS Shine" className="h-8 opacity-50" />
        </div>
        <div className="flex items-center justify-center gap-4 text-xs" style={{ color: '#525252' }}>
          <Link href="/mentions-legales" className="hover:underline">Mentions légales</Link>
          <span>·</span>
          <Link href="/confidentialite" className="hover:underline">Confidentialité</Link>
        </div>
        <p className="text-xs mt-3" style={{ color: '#525252' }}>© 2026 SOS Shine®</p>
      </footer>
    </main>
  )
}
