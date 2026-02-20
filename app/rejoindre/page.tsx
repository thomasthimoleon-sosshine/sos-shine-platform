'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

// Lien de paiement Stripe (29,90€/mois)
const STRIPE_URL = 'https://buy.stripe.com/4gM28j89S7t9c3n2Ke5ZC0c'

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    title: 'Encyclopédie complète',
    description: 'Accès à toutes les douleurs de A à Z, avec un protocole en 4 étapes pour chacune.',
    color: '#D4AF37',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
      </svg>
    ),
    title: 'Vidéos de coaching',
    description: 'Analyse émotionnelle et coaching immersif pour comprendre votre douleur en profondeur.',
    color: '#55EFC4',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
    title: 'Soins énergétiques',
    description: 'Séances audio de libération énergétique pour décharger les tensions et les blocages.',
    color: '#74C0FC',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
      </svg>
    ),
    title: 'Méditations guidées',
    description: 'Stabilisation intérieure, reconnexion à soi et nouvelle fréquence émotionnelle.',
    color: '#E17055',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
    title: 'Communauté & Chat',
    description: 'Chat dédié par douleur, chat général et mur communautaire. Vous n\'êtes plus jamais seul.',
    color: '#A29BFE',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    title: 'Événements & soins collectifs',
    description: 'Ateliers en groupe, conférences en visio et soins collectifs réguliers.',
    color: '#FD79A8',
  },
]

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] as unknown as [number, number, number, number] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function RejoindrePage() {
  return (
    <main className="min-h-screen" style={{ background: 'var(--dark)' }}>
      {/* Header */}
      <header className="px-6 md:px-20 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--dark-border)' }}>
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-display text-base font-semibold"
            style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-deep))', color: 'var(--dark)' }}>
            S
          </div>
          <span className="font-display text-lg font-medium" style={{ color: 'var(--gold)' }}>SOS Shine</span>
        </Link>
        <Link href="/encyclopedie" className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--gold)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          Voir l&apos;encyclopédie
        </Link>
      </header>

      <div className="max-w-3xl mx-auto px-6 md:px-8 py-16">
        {/* Hero */}
        <Reveal>
          <div className="text-center mb-16">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.15)' }}>
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="var(--gold)" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-light leading-tight mb-4">
              Tout ce qui vous attend<br />
              à l&apos;intérieur
            </h1>
            <p className="text-lg leading-relaxed max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Un espace complet pour comprendre, apaiser et transformer vos douleurs émotionnelles. Accessible 24h/24, 7j/7.
            </p>
          </div>
        </Reveal>

        {/* Features grid */}
        <div className="grid sm:grid-cols-2 gap-4 mb-16">
          {features.map((feature, i) => (
            <Reveal key={feature.title} delay={0.1 + i * 0.07}>
              <div className="glass p-6 h-full" style={{ borderColor: `${feature.color}15` }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${feature.color}12`, color: feature.color }}>
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-[15px] mb-1.5">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {feature.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Pricing card */}
        <Reveal delay={0.5}>
          <div className="glass p-8 sm:p-10 text-center" style={{ borderColor: 'rgba(212,175,55,0.15)' }}>
            <p className="text-xs tracking-[0.25em] uppercase mb-4" style={{ color: 'var(--text-muted)' }}>
              Accès complet
            </p>
            <div className="flex items-baseline justify-center gap-1.5 mb-2">
              <span className="font-display text-5xl font-light" style={{ color: 'var(--gold)' }}>29,90&euro;</span>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>/mois</span>
            </div>
            <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
              Sans engagement &mdash; Annulable à tout instant
            </p>

            {/* Included list */}
            <div className="space-y-3 text-left max-w-sm mx-auto mb-8">
              {[
                'Encyclopédie complète des douleurs (A-Z)',
                'Vidéos de coaching immersif',
                'Soins énergétiques audio',
                'Méditations guidées',
                'Exercices & PDF téléchargeables',
                'Chat dédié par douleur',
                'Chat général & mur communautaire',
                'Soins collectifs & événements',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 text-sm flex-shrink-0" style={{ color: 'var(--gold)' }}>&#9670;</span>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <a
              href={STRIPE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-glow inline-block w-full max-w-sm py-4 rounded-full font-medium tracking-wide transition-all text-sm"
              style={{ background: 'var(--gold)', color: 'var(--dark)' }}
            >
              Passer au paiement sécurisé
            </a>

            <div className="flex items-center justify-center gap-4 mt-5">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: 'var(--text-muted)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Paiement sécurisé via Stripe</span>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Quote */}
        <Reveal delay={0.6}>
          <p className="text-center text-sm italic mt-10 max-w-md mx-auto leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            &laquo; Parce que si on doit vous retenir par un contrat, c&apos;est qu&apos;on n&apos;a pas fait notre travail. &raquo;
          </p>
        </Reveal>

        {/* Back link */}
        <Reveal delay={0.7}>
          <div className="text-center mt-10">
            <Link href="/encyclopedie" className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--gold)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              &larr; Retour à l&apos;encyclopédie
            </Link>
          </div>
        </Reveal>
      </div>
    </main>
  )
}
