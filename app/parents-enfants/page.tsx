'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState } from 'react'
import ThemeToggle from '@/components/ThemeToggle'

const SECTIONS = [
  {
    icon: '🌱',
    title: 'Comprendre les émotions de votre enfant',
    desc: 'Les enfants vivent les émotions de façon intense et souvent incompréhensible pour les adultes. Apprenez à décoder leurs réactions, colères, peurs et tristesses comme des messages précieux de leur monde intérieur.',
    details: [
      'Décrypter les crises émotionnelles selon l\'âge',
      'Identifier les besoins cachés derrière chaque comportement',
      'Différencier caprice et détresse émotionnelle',
      'Accompagner les premières expériences de deuil, séparation ou peur',
    ],
  },
  {
    icon: '💛',
    title: 'Renforcer le lien parent-enfant',
    desc: 'Le lien d\'attachement est le socle du développement émotionnel de l\'enfant. Découvrez des pratiques simples et puissantes pour nourrir ce lien au quotidien, même dans les moments difficiles.',
    details: [
      'Rituels de connexion quotidiens (5 minutes suffisent)',
      'Communication bienveillante adaptée à chaque âge',
      'Gérer les conflits sans abîmer la relation',
      'Créer un espace de confiance et de sécurité émotionnelle',
    ],
  },
  {
    icon: '🧘',
    title: 'Prendre soin de soi en tant que parent',
    desc: 'Vous ne pouvez pas verser d\'un vase vide. La parentalité consciente commence par prendre soin de votre propre équilibre émotionnel. Des outils concrets pour vous ressourcer sans culpabiliser.',
    details: [
      'Méditations guidées spéciales parents (5 à 15 min)',
      'Exercices de respiration pour les moments de débordement',
      'Techniques pour gérer la charge mentale parentale',
      'Retrouver son identité au-delà du rôle de parent',
    ],
  },
  {
    icon: '✨',
    title: 'Activités bien-être en famille',
    desc: 'Des activités à faire ensemble pour cultiver le bien-être familial. Méditations, jeux émotionnels, exercices créatifs - transformez le quotidien en moments de connexion et de joie.',
    details: [
      'Méditations parent-enfant guidées par Julia',
      'Le jeu des émotions : nommer pour apprivoiser',
      'Carnet de gratitude familial',
      'Shine Walks en famille : marches conscientes en nature',
    ],
  },
]

const AGES = [
  { range: '0 - 3 ans', label: 'Petite enfance', desc: 'Attachement, régulation co-créée, sécurité de base' },
  { range: '3 - 6 ans', label: 'Éveil émotionnel', desc: 'Tempêtes émotionnelles, socialisation, autonomie naissante' },
  { range: '6 - 12 ans', label: 'Âge de raison', desc: 'Confiance en soi, gestion des conflits, harcèlement scolaire' },
  { range: '12 - 18 ans', label: 'Adolescence', desc: 'Identité, séparation, communication, estime de soi' },
]

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function ParentsEnfantsPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  return (
    <main className="min-h-screen watermark-container bg-[var(--surface)]">
      <div className="watermark" />

      {/* Header */}
      <header className="px-6 md:px-20 py-5 flex items-center justify-between border-b border-[var(--border)]">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-display text-base font-semibold"
            style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-deep))', color: 'var(--dark)' }}>
            S
          </div>
          <span className="font-display text-lg font-medium text-[var(--brand)]">SOS Shine</span>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            href="/signup"
            className="px-5 py-2.5 rounded-full text-sm font-medium transition-all"
            style={{ background: 'var(--brand)', color: 'var(--dark)' }}
          >
            Rejoindre
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(201,169,97,0.06), transparent)' }} />
        <div className="max-w-5xl mx-auto px-6 py-20 md:py-32 text-center relative z-10">
          <Reveal>
            <span className="inline-block px-5 py-2 rounded-full text-xs tracking-[0.25em] uppercase font-medium mb-8"
              style={{ background: 'rgba(201,169,97,0.08)', color: 'var(--brand)', border: '1px solid rgba(201,169,97,0.15)' }}>
              Espace dédié
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-light leading-tight mb-6 text-[var(--text-primary)]">
              Parents{' '}
              <span className="text-shimmer">&amp; Enfants</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-4 text-[var(--text-secondary)]">
              Accompagnez vos enfants dans leurs émotions avec bienveillance et justesse.
              Un espace pensé pour les familles, par Julia Laureau.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="text-sm max-w-2xl mx-auto mb-10 text-[var(--text-muted)]">
              Parce que le bien-être émotionnel se construit dès l&apos;enfance, et que les parents méritent aussi d&apos;être accompagnés.
            </p>
          </Reveal>
          <Reveal delay={0.4}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup"
                className="px-8 py-3.5 rounded-full text-sm font-semibold transition-all"
                style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-deep))', color: '#000000' }}>
                Rejoindre la communauté
              </Link>
              <Link href="/signature-emotionnelle"
                className="px-8 py-3.5 rounded-full text-sm font-medium transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                Faire le test gratuit
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Intro quote */}
      <section className="px-6 pb-16">
        <Reveal>
          <div className="max-w-3xl mx-auto text-center py-12 px-8 rounded-3xl"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
            <p className="font-display text-xl md:text-2xl font-light italic leading-relaxed mb-4 text-[var(--text-primary)]">
              &ldquo;Un enfant qui se sent compris n&apos;a plus besoin de crier pour être entendu.&rdquo;
            </p>
            <p className="text-sm text-[var(--brand)]">- Julia Laureau</p>
          </div>
        </Reveal>
      </section>

      {/* Content sections */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <h2 className="font-display text-3xl md:text-4xl font-light text-center mb-4 text-[var(--text-primary)]">
              Ce que vous trouverez ici
            </h2>
            <p className="text-center mb-14 max-w-2xl mx-auto text-[var(--text-secondary)]">
              Des ressources concrètes pour traverser les défis parentaux avec conscience et douceur.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-6">
            {SECTIONS.map((s, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div
                  className="rounded-2xl p-6 sm:p-8 transition-all duration-300 cursor-pointer group"
                  style={{
                    background: openIdx === i ? 'rgba(201,169,97,0.04)' : 'var(--surface-card)',
                    border: openIdx === i ? '1px solid rgba(201,169,97,0.15)' : '1px solid var(--border)',
                  }}
                  onClick={() => setOpenIdx(openIdx === i ? null : i)}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">{s.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-lg font-semibold mb-2 group-hover:text-[var(--brand)] transition-colors text-[var(--text-primary)]">
                        {s.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                        {s.desc}
                      </p>
                      <motion.div
                        initial={false}
                        animate={{ height: openIdx === i ? 'auto' : 0, opacity: openIdx === i ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <ul className="mt-4 space-y-2">
                          {s.details.map((d, j) => (
                            <li key={j} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                              <span className="text-[var(--brand)] mt-0.5">&#x2726;</span>
                              {d}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                      <button className="mt-3 text-xs font-medium text-[var(--brand)]">
                        {openIdx === i ? 'Réduire' : 'En savoir plus'}
                      </button>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Age groups */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <h2 className="font-display text-3xl md:text-4xl font-light text-center mb-4 text-[var(--text-primary)]">
              Adapté à chaque <span className="text-[var(--brand)]">tranche d&apos;âge</span>
            </h2>
            <p className="text-center mb-14 max-w-2xl mx-auto text-[var(--text-secondary)]">
              Chaque étape du développement a ses défis émotionnels. Nos protocoles s&apos;adaptent à l&apos;âge de votre enfant.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {AGES.map((a, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="rounded-2xl p-6 text-center transition-all duration-300 hover:border-[rgba(201,169,97,0.2)]"
                  style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-sm font-semibold mx-auto mb-4"
                    style={{ background: 'rgba(201,169,97,0.08)', color: 'var(--brand)', border: '1px solid rgba(201,169,97,0.12)' }}>
                    {a.range.split('-')[0].trim()}
                  </div>
                  <h3 className="font-display text-base font-semibold mb-1 text-[var(--text-primary)]">{a.label}</h3>
                  <p className="text-xs text-[var(--brand)]">{a.range}</p>
                  <p className="text-xs mt-3 leading-relaxed text-[var(--text-secondary)]">{a.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Approach */}
      <section className="px-6 pb-20">
        <Reveal>
          <div className="max-w-4xl mx-auto rounded-3xl p-8 md:p-12"
            style={{ background: 'rgba(201,169,97,0.03)', border: '1px solid rgba(201,169,97,0.1)' }}>
            <h2 className="font-display text-2xl md:text-3xl font-light mb-6 text-center text-[var(--text-primary)]">
              L&apos;approche SOS Shine pour les familles
            </h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              {[
                { step: '1', title: 'Comprendre', desc: 'Identifiez ce qui se joue réellement chez votre enfant grâce à nos vidéos de coaching parental.' },
                { step: '2', title: 'Libérer', desc: 'Des exercices énergétiques et émotionnels adaptés pour aider votre enfant à traverser ses tempêtes.' },
                { step: '3', title: 'Intégrer', desc: 'Des méditations et activités en famille pour ancrer les apprentissages et renforcer le lien.' },
              ].map((s, i) => (
                <div key={i}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold mx-auto mb-3"
                    style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-deep))', color: '#000000' }}>
                    {s.step}
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-2 text-[var(--brand)]">{s.title}</h3>
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* Coming soon notice */}
      <section className="px-6 pb-20">
        <Reveal>
          <div className="max-w-3xl mx-auto text-center rounded-3xl py-14 px-8"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6"
              style={{ background: 'rgba(201,169,97,0.08)', border: '1px solid rgba(201,169,97,0.12)' }}>
              🚀
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-light mb-4 text-[var(--text-primary)]">
              Bientôt disponible
            </h2>
            <p className="text-sm leading-relaxed max-w-lg mx-auto mb-8 text-[var(--text-secondary)]">
              La section Parents &amp; Enfants est en cours de développement. Rejoignez SOS Shine dès maintenant pour être
              parmi les premiers à y accéder et bénéficier du tarif fondateur.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup"
                className="px-8 py-3.5 rounded-full text-sm font-semibold transition-all"
                style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-deep))', color: '#000000' }}>
                Rejoindre SOS Shine
              </Link>
              <Link href="/contact"
                className="text-sm font-medium transition-colors text-[var(--brand)]">
                Nous contacter
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 text-center" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--text-muted)]">
          <Link href="/" className="hover:text-[var(--brand)] transition-colors">Accueil</Link>
          <Link href="/signature-emotionnelle" className="hover:text-[var(--brand)] transition-colors">Signature Émotionnelle</Link>
          <Link href="/signature-emotionnelle" className="hover:text-[var(--brand)] transition-colors">Signature Émotionnelle</Link>
          <Link href="/contact" className="hover:text-[var(--brand)] transition-colors">Contact</Link>
          <Link href="/cgv" className="hover:text-[var(--brand)] transition-colors">CGV</Link>
          <Link href="/confidentialite" className="hover:text-[var(--brand)] transition-colors">Confidentialité</Link>
        </div>
        <p className="text-xs mt-4 text-[var(--text-muted)]">&copy; 2026 SOS Shine. Tous droits réservés.</p>
      </footer>
    </main>
  )
}
