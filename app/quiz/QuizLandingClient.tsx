'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const QUIZ_URL = '/signature-emotionnelle?start=1'
const EVENT_URL = '/ceremonie'

const TICKER_ITEMS = [
  '✨ Événement SOS Shine',
  '📍 Sud de la France',
  '📅 13 juin 2026',
  '🕕 18h - 21h30',
  '→ Réserver ma place',
]

function EventTicker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS]
  return (
    <Link href={EVENT_URL} className="fixed top-0 left-0 right-0 z-[60] block overflow-hidden cursor-pointer" style={{ background: '#C9A961', height: '36px' }}>
      <style>{`@keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-33.333%)}}`}</style>
      <div className="flex items-center h-full whitespace-nowrap" style={{ animation: 'ticker 22s linear infinite' }}>
        {items.map((item, i) => (
          <span key={i} className="text-xs font-semibold px-4 mx-3 flex-shrink-0" style={{ color: '#000' }}>
            {item}
          </span>
        ))}
      </div>
    </Link>
  )
}

function TopNav() {
  return (
    <nav
      className="fixed left-0 right-0 z-50 flex items-center justify-end gap-3 px-6 py-4"
      style={{ top: '36px', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
    >
      <Link
        href="/login"
        className="text-sm font-medium px-4 py-2 rounded-full transition-colors hover:bg-white/5"
        style={{ color: 'rgba(255,255,255,0.45)' }}
      >
        Se connecter
      </Link>
      <Link
        href={QUIZ_URL}
        className="text-sm font-semibold px-5 py-2 rounded-full transition-all hover:brightness-110"
        style={{ background: 'linear-gradient(135deg, var(--brand), var(--gold-deep, #B8960F))', color: '#000' }}
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
      className={`inline-block text-center font-semibold rounded-full transition-all hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] ${large ? 'w-full px-10 py-4 text-sm' : 'px-8 py-4 text-sm'}`}
      style={{ background: 'linear-gradient(135deg, var(--brand), var(--gold-deep, #B8960F))', color: '#000000' }}
    >
      {label}
    </Link>
  )
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left cursor-pointer"
      >
        <span className="text-sm font-medium pr-4" style={{ color: 'var(--text-primary)' }}>{question}</span>
        <span
          className="text-lg flex-shrink-0 transition-transform"
          style={{ color: 'var(--brand)', transform: open ? 'rotate(45deg)' : 'rotate(0)', display: 'inline-block' }}
        >
          +
        </span>
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="pb-5"
        >
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{answer}</p>
        </motion.div>
      )}
    </div>
  )
}

export default function QuizLandingClient() {
  return (
    <main className="min-h-screen" style={{ background: '#000000', color: 'var(--text-primary)' }}>
      <EventTicker />
      <TopNav />

      {/* ══════════ HERO ══════════ */}
      <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden" style={{ paddingTop: '80px' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-[0.05] blur-[100px]" style={{ background: 'var(--brand)' }} />
        </div>

        <div className="relative z-10 max-w-sm w-full text-center space-y-10">
          <Reveal>
            <Link href="/" className="inline-block">
              <img src="/images/logo-shine.png" alt="SOS Shine" className="h-24 mx-auto" />
            </Link>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="space-y-4">
              <h1 className="font-sans text-[22px] sm:text-3xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                Il y a une phrase qui résume comment tu te protèges émotionnellement depuis toujours.
              </h1>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Tu ne l&apos;as jamais entendue.<br />
                Mais elle dirige ta vie.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="space-y-3">
              <CtaButton position="hero" label="Commencer →" large />
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Gratuit · Aucun engagement · Résultat immédiat
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════ POURQUOI DIFFÉRENT ══════════ */}
      <section className="px-6 py-20 sm:py-28">
        <div className="max-w-lg mx-auto text-center space-y-10">
          <Reveal>
            <p className="text-[11px] tracking-[0.3em] uppercase font-medium" style={{ color: 'var(--brand)', opacity: 0.7 }}>
              Pourquoi ce test est différent
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="space-y-5">
              <p className="font-sans text-lg sm:text-xl font-bold leading-snug" style={{ color: 'var(--text-primary)' }}>
                Pas un énième test de magazine.
              </p>
              <p className="font-sans text-lg sm:text-xl font-bold leading-snug" style={{ color: 'var(--text-primary)' }}>
                Pas de cases dans lesquelles on te range.
              </p>
              <p className="font-sans text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Pas de &laquo;&nbsp;personnalité INFP&nbsp;&raquo; ou &laquo;&nbsp;type 4 ennéagramme&nbsp;&raquo;.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="w-10 h-px mx-auto" style={{ background: 'var(--brand)', opacity: 0.4 }} />
          </Reveal>

          <Reveal delay={0.3}>
            <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
              <p>
                Juste <strong style={{ color: 'var(--text-primary)' }}>UNE phrase</strong>. La tienne.
              </p>
              <p>
                Celle qui résume comment tu réagis quand quelque chose te touche.
              </p>
              <p>
                Pourquoi tu portes ce que tu portes. Pourquoi tu fuis ce que tu fuis. Pourquoi tu reproduis ce que tu ne veux pas reproduire.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.4}>
            <CtaButton position="section_2" label="Commencer le test →" />
          </Reveal>
        </div>
      </section>

      {/* ══════════ EN 3 ÉTAPES ══════════ */}
      <section className="px-6 py-20 sm:py-28" style={{ background: 'rgba(201,169,97,0.025)', borderTop: '1px solid rgba(201,169,97,0.08)', borderBottom: '1px solid rgba(201,169,97,0.08)' }}>
        <div className="max-w-lg mx-auto space-y-12">
          <Reveal>
            <p className="text-[11px] tracking-[0.3em] uppercase font-medium text-center" style={{ color: 'var(--brand)', opacity: 0.7 }}>
              En 3 étapes
            </p>
          </Reveal>

          {[
            { num: '01', title: 'Tu réponds à 12 questions.', desc: "Pas de jugement. Pas de bonne ou mauvaise réponse. Juste toi. Certaines questions vont te toucher. C'est normal." },
            { num: '02', title: 'On analyse ton profil sur 10 dimensions.', desc: "Pas un seul résultat parmi 10. Une combinaison unique qui te ressemble vraiment." },
            { num: '03', title: 'Tu reçois ta Signature.', desc: "Avec un texte personnalisé qui décode ce que tu portes, d'où ça vient, et comment t'en libérer." },
          ].map((step, i) => (
            <Reveal key={step.num} delay={i * 0.1}>
              <div className="flex gap-6 items-start">
                <span className="font-display text-3xl font-light flex-shrink-0 mt-1" style={{ color: 'var(--brand)', opacity: 0.5 }}>
                  {step.num}
                </span>
                <div className="space-y-1.5">
                  <h3 className="font-sans font-bold text-base leading-snug" style={{ color: 'var(--text-primary)' }}>{step.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{step.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══════════ TÉMOIGNAGES ══════════ */}
      <section className="px-6 py-20 sm:py-28">
        <div className="max-w-2xl mx-auto space-y-10">
          <Reveal>
            <p className="text-[11px] tracking-[0.3em] uppercase font-medium text-center" style={{ color: 'var(--brand)', opacity: 0.7 }}>
              Elles ont fait le test
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { text: "J'ai pleuré en lisant ma Signature. Pas de tristesse. De soulagement. Quelqu'un voyait enfin ce que je portais.", author: 'Camille, 41 ans' },
              { text: "Pas un énième test de magazine. Un vrai miroir.", author: 'Léa, 29 ans' },
              { text: "10 ans en thérapie. Et en 3 minutes sur SOS Shine, j'ai compris un truc que personne n'avait réussi à me dire.", author: 'Sophie, 34 ans' },
              { text: "Mon mari et moi avons fait le test séparément. On a compris nos 12 ans de conflit en 10 minutes.", author: 'Marc, 45 ans' },
            ].map((t, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div
                  className="rounded-2xl p-6 h-full"
                  style={{ background: 'rgba(201,169,97,0.04)', border: '1px solid rgba(201,169,97,0.15)' }}
                >
                  <p className="text-sm italic leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    &laquo;&nbsp;{t.text}&nbsp;&raquo;
                  </p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>- {t.author}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.3}>
            <div className="text-center">
              <CtaButton position="section_4" label="Faire le test →" large />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════ JULIA ══════════ */}
      <section className="px-6 py-20 sm:py-28" style={{ background: 'rgba(201,169,97,0.025)', borderTop: '1px solid rgba(201,169,97,0.08)', borderBottom: '1px solid rgba(201,169,97,0.08)' }}>
        <div className="max-w-lg mx-auto">
          <Reveal>
            <p className="text-[11px] tracking-[0.3em] uppercase font-medium text-center mb-10" style={{ color: 'var(--brand)', opacity: 0.7 }}>
              Créé par Julia Laureau
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="flex flex-col sm:flex-row items-center gap-8 text-center sm:text-left">
              <img src="/images/julia.jpeg" alt="Julia Laureau" className="w-24 h-24 rounded-full object-cover flex-shrink-0" style={{ border: '2px solid rgba(201,169,97,0.3)' }} />
              <div className="space-y-3">
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  Auteure du livre fondateur <strong style={{ color: 'var(--text-primary)' }}>&laquo;&nbsp;SOS Shine - Briller Comme un Diamant&nbsp;&raquo;</strong>.
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  Ce test est l&apos;aboutissement de plusieurs années d&apos;accompagnements.
                </p>
                <p className="text-xs" style={{ color: 'var(--brand)', opacity: 0.8 }}>⭐⭐⭐⭐⭐ Sur Amazon</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════ FAQ ══════════ */}
      <section className="px-6 py-20 sm:py-28">
        <div className="max-w-lg mx-auto space-y-8">
          <Reveal>
            <p className="text-[11px] tracking-[0.3em] uppercase font-medium text-center" style={{ color: 'var(--brand)', opacity: 0.7 }}>
              Questions fréquentes
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div>
              <FaqItem question="C'est vraiment gratuit ?" answer="Oui. 100% gratuit. Aucune carte bancaire demandée." />
              <FaqItem question="Combien de temps ça prend ?" answer="Entre 3 et 5 minutes selon ton rythme." />
              <FaqItem question="Je dois m'inscrire pour commencer ?" answer="Non. Tu peux commencer immédiatement. On te demandera ton email à mi-test pour t'envoyer ton résultat par mail." />
              <FaqItem question="Mes réponses sont confidentielles ?" answer="Oui, totalement. Aucune réponse n'est partagée avec qui que ce soit." />
              <FaqItem question="C'est de la psychologie sérieuse ?" answer="C'est basé sur des années d'accompagnements et de recherche sur les schémas émotionnels. Ce n'est pas un test scientifique validé, c'est un outil de prise de conscience." />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════ CTA FINAL ══════════ */}
      <section className="relative px-6 py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-[0.04] blur-[100px]" style={{ background: 'var(--brand)' }} />
        </div>

        <div className="relative z-10 max-w-sm mx-auto text-center space-y-8">
          <Reveal>
            <h2 className="font-sans text-[22px] sm:text-3xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
              Prête à te voir ?
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
              3 minutes pour découvrir une phrase qui va peut-être changer la lecture que tu as de toi-même.
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="space-y-3">
              <CtaButton position="footer" label="Commencer maintenant →" large />
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Gratuit · Aucun engagement · Résultat immédiat
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="px-6 py-10 text-center" style={{ borderTop: '1px solid rgba(201,169,97,0.08)' }}>
        <div className="flex items-center justify-center mb-4">
          <img src="/images/logo-shine.png" alt="SOS Shine" className="h-8 opacity-40" />
        </div>
        <div className="flex items-center justify-center gap-4 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
          <Link href="/mentions-legales" className="hover:opacity-60 transition-opacity">Mentions légales</Link>
          <span>·</span>
          <Link href="/confidentialite" className="hover:opacity-60 transition-opacity">Confidentialité</Link>
        </div>
        <p className="text-xs mt-3" style={{ color: 'rgba(255,255,255,0.15)' }}>© 2026 SOS Shine®</p>
      </footer>
    </main>
  )
}
