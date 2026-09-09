'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'

const QUIZ_URL = '/signature-emotionnelle'

function Reveal({
  children,
  delay = 0,
  className = '',
  y = 28,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
  y?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-2.5 text-[10px] tracking-[0.32em] uppercase font-semibold"
      style={{ color: 'var(--brand, #B8A472)' }}
    >
      <span className="w-5 h-px" style={{ background: 'var(--brand, #B8A472)' }} />
      {children}
    </span>
  )
}

const PILLARS = [
  {
    n: '01',
    title: 'Comprendre',
    color: '#6BCFA0',
    desc: 'Décoder le schéma émotionnel qui pilote vos réactions. Pas pour vous juger, pour enfin voir clair. Quand on comprend pourquoi on répète, on arrête de subir.',
  },
  {
    n: '02',
    title: 'Libérer',
    color: '#6B9FD4',
    desc: 'Une libération physique et émotionnelle immédiate. Pour les crises à 2h du matin, quand penser positif ne suffit pas. Le corps a sa propre mémoire, on travaille avec lui.',
  },
  {
    n: '03',
    title: 'Agir',
    color: '#D4A054',
    desc: 'Reprogrammer les réflexes automatiques par l\'hypnose et des protocoles concrets. Pour que le changement ne soit pas un effort de volonté, mais une nouvelle nature.',
  },
]

const FOUNDERS = [
  {
    name: 'Julia Laureau',
    role: 'Fondatrice · Auteure du Déconditionnement',
    desc: 'Tout est parti d\'un livre. Julia accompagne depuis des années des personnes en burn-out, en rupture, prises dans des schémas relationnels qui se répètent. SOS Shine est la suite vivante de ce travail.',
  },
  {
    name: 'William',
    role: 'Approche corporelle & Hypnose',
    desc: 'L\'émotion ne se règle pas qu\'avec la tête. William apporte le travail du corps et l\'hypnose, pour aller là où les mots seuls n\'atteignent pas.',
  },
  {
    name: 'Thomas',
    role: 'Protocoles d\'action & Architecture',
    desc: 'Comprendre ne suffit pas s\'il n\'y a rien à faire ensuite. Thomas conçoit les protocoles concrets qui transforment la prise de conscience en changement réel.',
  },
]

const NOT_THIS_BUT_THAT = [
  {
    not: 'Pas des affirmations positives',
    that: 'On ne vous répète pas que « tout est possible ». On vous montre pourquoi vous faites ce que vous faites, et comment faire autrement.',
  },
  {
    not: 'Pas une nième méthode miracle',
    that: 'Pas de promesse de transformation en 7 jours. Un travail réel, progressif, qui respecte votre rythme et votre histoire.',
  },
  {
    not: 'Pas du contenu à consommer',
    that: 'Des protocoles à pratiquer. Vous ne regardez pas, vous traversez. Et quelqu\'un est là, à chaque étape.',
  },
]

const INCLUDED = [
  'Votre Signature Émotionnelle complète',
  'L\'encyclopédie : des protocoles guidés',
  'Un protocole d\'urgence accessible 24/7',
  'La communauté privée « Le Feu de Camp »',
  'Shine TV, Audible, Journal & Shorts',
  'Des lives et soins collectifs avec Julia',
]

export default function DecouvrirClient() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <div style={{ background: 'var(--surface, #08090A)', color: 'var(--text-primary, #F5F0E8)' }}>

      {/* ════ HERO ════ */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden"
      >
        {/* Halo */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 55% at 50% 38%, rgba(184,164,114,0.13) 0%, transparent 70%)',
          }}
        />
        {/* Grille */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse at center, black 15%, transparent 72%)',
          }}
        />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mb-8"
          >
            <SectionLabel>Plateforme de déconditionnement émotionnel</SectionLabel>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-light leading-[1.08] mb-7"
            style={{ fontSize: 'clamp(2.4rem, 7vw, 4.2rem)', letterSpacing: '-0.02em' }}
          >
            Ce que vous vivez<br />
            a une explication.<br />
            <span
              style={{
                background: 'linear-gradient(120deg, #F5F0E8 0%, #B8A472 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Et une sortie.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="text-base sm:text-lg font-light leading-relaxed max-w-xl mx-auto mb-12"
            style={{ color: 'var(--text-secondary, #A8A29E)' }}
          >
            SOS Shine décode les schémas émotionnels qui pilotent votre vie, et vous
            donne les outils concrets pour en sortir. Pas du développement personnel.
            Du déconditionnement.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.1 }}
            className="flex flex-col items-center gap-4"
          >
            <Link
              href={QUIZ_URL}
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-full text-sm font-semibold transition-all hover:brightness-110 active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #D4C99A, #B8A472)',
                color: '#08090A',
                letterSpacing: '0.01em',
                boxShadow: '0 0 40px rgba(184,164,114,0.18)',
              }}
            >
              Découvrir ma signature émotionnelle
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <span className="text-[11px] tracking-wide" style={{ color: 'var(--text-muted, #64605A)' }}>
              100 % gratuit · 5 minutes · sans inscription
            </span>
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="absolute bottom-10 flex flex-col items-center gap-2"
        >
          <span className="text-[9px] tracking-[0.3em] uppercase" style={{ color: 'var(--text-muted, #64605A)' }}>
            Découvrir
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-px h-9"
            style={{ background: 'linear-gradient(to bottom, rgba(184,164,114,0.5), transparent)' }}
          />
        </motion.div>
      </section>

      {/* ════ PROBLÈME / POSITIONNEMENT ════ */}
      <section className="px-6 py-28 max-w-3xl mx-auto">
        <Reveal className="mb-6">
          <SectionLabel>La vérité qui change tout</SectionLabel>
        </Reveal>
        <Reveal delay={0.1}>
          <h2
            className="font-display font-light leading-[1.15] mb-10"
            style={{ fontSize: 'clamp(1.9rem, 5vw, 3rem)', letterSpacing: '-0.015em' }}
          >
            Vous n'êtes pas cassé(e).<br />
            <span style={{ color: 'var(--text-muted, #64605A)' }}>Vous êtes conditionné(e).</span>
          </h2>
        </Reveal>
        <div className="space-y-6 max-w-2xl">
          {[
            'Vous avez peut-être déjà lu les livres. Suivi les formations. Compris, intellectuellement, beaucoup de choses sur vous-même.',
            'Et pourtant, dans les moments qui comptent, les mêmes réactions reviennent. La même peur. Le même repli. Le même schéma.',
            'Ce n\'est pas un manque de volonté. C\'est votre système nerveux qui rejoue une programmation installée il y a longtemps, pour vous protéger. Tant qu\'on ne va pas à la source, comprendre ne suffit pas.',
          ].map((p, i) => (
            <Reveal key={i} delay={0.15 + i * 0.08}>
              <p
                className="text-[1.05rem] leading-[1.9] font-light"
                style={{ color: 'var(--text-secondary, #A8A29E)' }}
              >
                {p}
              </p>
            </Reveal>
          ))}
          <Reveal delay={0.4}>
            <p
              className="text-[1.15rem] leading-[1.7] font-light pt-4"
              style={{ color: 'var(--brand-light, #D4C99A)' }}
            >
              Quand vous comprenez votre schéma, vous arrêtez de le subir.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ════ MÉTHODE — 3 PILIERS ════ */}
      <section className="px-6 py-24" style={{ background: 'var(--surface-raised, #0F1624)' }}>
        <div className="max-w-5xl mx-auto">
          <Reveal className="mb-4 text-center flex justify-center">
            <SectionLabel>Le parcours SOS Shine</SectionLabel>
          </Reveal>
          <Reveal delay={0.1} className="text-center mb-16">
            <h2
              className="font-display font-light leading-tight"
              style={{ fontSize: 'clamp(1.9rem, 5vw, 3rem)', letterSpacing: '-0.015em' }}
            >
              Trois étapes. Dans l'ordre.<br />
              <span style={{ color: 'var(--text-muted, #64605A)' }}>Pour que ça dure.</span>
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-5">
            {PILLARS.map((p, i) => (
              <Reveal key={p.n} delay={0.1 * i}>
                <div
                  className="h-full rounded-2xl p-8 transition-all hover:-translate-y-1"
                  style={{
                    background: 'var(--surface-card, #131A2B)',
                    border: '1px solid var(--border, rgba(184,164,114,0.08))',
                  }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <span
                      className="text-3xl font-display font-light"
                      style={{ color: p.color }}
                    >
                      {p.n}
                    </span>
                    <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                  </div>
                  <h3
                    className="text-xl font-display font-medium mb-4"
                    style={{ color: 'var(--text-primary, #F5F0E8)' }}
                  >
                    {p.title}
                  </h3>
                  <p
                    className="text-sm leading-[1.8] font-light"
                    style={{ color: 'var(--text-secondary, #A8A29E)' }}
                  >
                    {p.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════ CE QUE NOUS NE SOMMES PAS ════ */}
      <section className="px-6 py-28 max-w-3xl mx-auto">
        <Reveal className="mb-4">
          <SectionLabel>Ce que nous ne sommes pas</SectionLabel>
        </Reveal>
        <Reveal delay={0.1} className="mb-14">
          <h2
            className="font-display font-light leading-[1.18]"
            style={{ fontSize: 'clamp(1.8rem, 4.5vw, 2.7rem)', letterSpacing: '-0.015em' }}
          >
            SOS Shine n'est pas une plateforme<br />
            de développement personnel.<br />
            <span style={{ color: 'var(--brand-light, #D4C99A)' }}>
              C'est un espace de déconditionnement.
            </span>
          </h2>
        </Reveal>

        <div className="space-y-px">
          {NOT_THIS_BUT_THAT.map((item, i) => (
            <Reveal key={i} delay={0.08 * i}>
              <div className="py-7" style={{ borderTop: '1px solid var(--border-subtle, rgba(255,255,255,0.04))' }}>
                <p
                  className="text-[11px] tracking-[0.18em] uppercase font-semibold mb-3"
                  style={{ color: 'var(--text-muted, #64605A)' }}
                >
                  {item.not}
                </p>
                <p
                  className="text-[1.02rem] leading-[1.8] font-light"
                  style={{ color: 'var(--text-secondary, #A8A29E)' }}
                >
                  {item.that}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ════ QUI SOMMES-NOUS ════ */}
      <section className="px-6 py-24" style={{ background: 'var(--surface-raised, #0F1624)' }}>
        <div className="max-w-4xl mx-auto">
          <Reveal className="mb-4 text-center flex justify-center">
            <SectionLabel>L'équipe derrière SOS Shine</SectionLabel>
          </Reveal>
          <Reveal delay={0.1} className="text-center mb-16">
            <h2
              className="font-display font-light leading-tight"
              style={{ fontSize: 'clamp(1.9rem, 5vw, 3rem)', letterSpacing: '-0.015em' }}
            >
              Trois personnes. Une conviction.
            </h2>
          </Reveal>

          <div className="space-y-5">
            {FOUNDERS.map((f, i) => (
              <Reveal key={f.name} delay={0.08 * i}>
                <div
                  className="rounded-2xl p-7 sm:p-8 flex flex-col sm:flex-row sm:items-start gap-5"
                  style={{
                    background: 'var(--surface-card, #131A2B)',
                    border: '1px solid var(--border, rgba(184,164,114,0.08))',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 font-display text-lg"
                    style={{
                      background: 'var(--brand-alpha-medium, rgba(184,164,114,0.12))',
                      border: '1px solid var(--border-medium, rgba(184,164,114,0.15))',
                      color: 'var(--brand-light, #D4C99A)',
                    }}
                  >
                    {f.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary, #F5F0E8)' }}>
                      {f.name}
                    </h3>
                    <p
                      className="text-[11px] tracking-[0.14em] uppercase mb-3 mt-0.5"
                      style={{ color: 'var(--brand, #B8A472)' }}
                    >
                      {f.role}
                    </p>
                    <p
                      className="text-sm leading-[1.8] font-light"
                      style={{ color: 'var(--text-secondary, #A8A29E)' }}
                    >
                      {f.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════ CE QUE VOUS OBTENEZ ════ */}
      <section className="px-6 py-28 max-w-3xl mx-auto">
        <Reveal className="mb-4">
          <SectionLabel>Ce que vous recevez</SectionLabel>
        </Reveal>
        <Reveal delay={0.1} className="mb-12">
          <h2
            className="font-display font-light leading-[1.15]"
            style={{ fontSize: 'clamp(1.9rem, 5vw, 3rem)', letterSpacing: '-0.015em' }}
          >
            Tout, dès le premier soir.
          </h2>
        </Reveal>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1">
          {INCLUDED.map((item, i) => (
            <Reveal key={i} delay={0.05 * i}>
              <div
                className="flex items-start gap-4 py-5"
                style={{ borderTop: '1px solid var(--border-subtle, rgba(255,255,255,0.04))' }}
              >
                <span
                  className="mt-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] shrink-0"
                  style={{
                    background: 'var(--brand-alpha-medium, rgba(184,164,114,0.12))',
                    color: 'var(--brand-light, #D4C99A)',
                  }}
                >
                  ✓
                </span>
                <span
                  className="text-[0.98rem] leading-relaxed font-light"
                  style={{ color: 'var(--text-secondary, #A8A29E)' }}
                >
                  {item}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ════ CTA FINAL ════ */}
      <section className="relative px-6 py-32 text-center overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(184,164,114,0.12) 0%, transparent 70%)',
          }}
        />
        <div className="relative max-w-2xl mx-auto">
          <Reveal>
            <h2
              className="font-display font-light leading-[1.12] mb-6"
              style={{ fontSize: 'clamp(2.1rem, 6vw, 3.4rem)', letterSpacing: '-0.02em' }}
            >
              Commencez par vous comprendre.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p
              className="text-base sm:text-lg font-light leading-relaxed max-w-lg mx-auto mb-10"
              style={{ color: 'var(--text-secondary, #A8A29E)' }}
            >
              En 5 minutes, découvrez la signature émotionnelle qui explique vos schémas,
              et le premier protocole pour en sortir.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <Link
              href={QUIZ_URL}
              className="group inline-flex items-center gap-3 px-9 py-4 rounded-full text-sm font-semibold transition-all hover:brightness-110 active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #D4C99A, #B8A472)',
                color: '#08090A',
                boxShadow: '0 0 50px rgba(184,164,114,0.2)',
              }}
            >
              Faire le test gratuit
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="text-[11px] tracking-wide mt-6" style={{ color: 'var(--text-muted, #64605A)' }}>
              100 % gratuit · résultat immédiat · aucune carte bancaire
            </p>
          </Reveal>
        </div>
      </section>

    </div>
  )
}
