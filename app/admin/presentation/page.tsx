'use client'

/**
 * Présentation SOS Shine — landing interne (admin only)
 * Présente la plateforme, les étapes du parcours et les tarifs.
 * Tous les CTA pointent vers le quiz de signature émotionnelle.
 *
 * Visible uniquement par les admins : la page hérite du garde de rôle
 * défini dans app/admin/layout.tsx.
 */

import Link from 'next/link'
import { useRef } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'

const QUIZ_URL = '/signature-emotionnelle?start=1'
const ease = [0.16, 1, 0.3, 1] as [number, number, number, number]

// ── Données ──────────────────────────────────────────────────────

const STEPS = [
  {
    num: '01',
    title: 'Comprendre',
    body: "Identifier le schéma inconscient qui pilote tes réactions. Pas de la théorie — une lecture précise de ce qui se joue en toi depuis toujours.",
    accent: '#7DD3FC',
  },
  {
    num: '02',
    title: 'Libérer',
    body: "Décharger l'émotion stockée dans le corps. Respiration ventrale, libération somatique, cris silencieux. Ce qui doit sortir sort.",
    accent: '#A78BFA',
  },
  {
    num: '03',
    title: 'Agir',
    body: "Reprogrammer l'automatisme. Miroir, ancrage, rituel du matin. Chaque jour, un nouveau réflexe remplace l'ancien. Tu ne te répares pas — tu te révèles.",
    accent: '#FBCFE8',
  },
]

const PILLARS = [
  { name: 'Encyclopédie', desc: '200+ protocoles guidés, classés par expérience de vie.', icon: '📘' },
  { name: 'Shine TV', desc: 'Vidéos & soins guidés par Julia, chaque semaine.', icon: '🎬' },
  { name: 'Shine Audible', desc: 'Méditations et libérations sonores à emporter partout.', icon: '🎧' },
  { name: 'Shine Librairie', desc: 'eBooks, guides et rituels à télécharger.', icon: '📚' },
  { name: 'Le Feu de Camp', desc: 'Une communauté bienveillante, jamais seule.', icon: '🔥' },
  { name: 'Événements live', desc: 'Rendez-vous collectifs hebdomadaires en direct.', icon: '✨' },
]

const PLANS = [
  {
    name: 'Gratuit',
    price: '0',
    period: '',
    badge: null as string | null,
    highlight: false,
    features: [
      'Communauté & Mur',
      'Shine Audible — méditations',
      'Étape 1 de votre protocole recommandé',
      'Quiz Signature Émotionnelle',
    ],
    cta: 'Créer mon compte gratuit',
  },
  {
    name: 'SOS Shine',
    price: '29,90',
    period: '/mois',
    badge: '7 JOURS GRATUIT',
    highlight: true,
    features: [
      'Encyclopédie complète — 200+ protocoles',
      'Étapes 2 & 3 de votre protocole recommandé',
      'Shine TV, Shorts, Audible & Librairie',
      'Communauté & Feu de Camp',
      'Soins collectifs, lives & événements',
      'Support prioritaire',
    ],
    cta: 'Essayer 7 jours gratuit',
  },
]

// ── Composants ───────────────────────────────────────────────────

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function CtaButton({ children, large = false }: { children: React.ReactNode; large?: boolean }) {
  return (
    <Link
      href={QUIZ_URL}
      className={`group relative inline-flex items-center justify-center gap-3 rounded-full font-medium text-[#0A0A0F] transition-transform duration-300 hover:scale-[1.03] ${
        large ? 'px-10 py-5 text-[15px]' : 'px-8 py-4 text-[14px]'
      }`}
      style={{ background: 'linear-gradient(135deg, #D4C99A, #B8A472)' }}
    >
      <span className="relative z-10">{children}</span>
      <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">→</span>
    </Link>
  )
}

// ── Page ─────────────────────────────────────────────────────────

export default function PresentationPage() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    // Casse le padding du layout admin pour une présentation pleine largeur
    <div
      className="-m-4 sm:-m-6 lg:-m-8 overflow-hidden"
      style={{ background: '#08090A', color: '#FAFAF7' }}
    >
      {/* ── Hero ── */}
      <section ref={heroRef} className="relative min-h-[88vh] flex items-center justify-center px-6">
        {/* Halos */}
        <motion.div
          aria-hidden
          className="absolute rounded-full blur-[120px] opacity-40"
          style={{ width: 520, height: 520, background: '#B8A472', top: '-10%', left: '50%', x: '-50%' }}
        />
        <motion.div
          aria-hidden
          className="absolute rounded-full blur-[140px] opacity-20"
          style={{ width: 420, height: 420, background: '#7DD3FC', bottom: '-15%', right: '5%' }}
        />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative text-center max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease }}
            className="text-[11px] tracking-[0.4em] uppercase font-medium text-[#FAFAF7]/40 mb-8"
          >
            La plateforme SOS Shine
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease }}
            className="font-display font-light leading-[1.02] tracking-[-0.03em] text-[2.8rem] sm:text-[4rem] md:text-[5rem]"
          >
            Te libérer de ce qui<br />
            <span className="italic text-[#D4C99A]">te retient depuis toujours.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease }}
            className="mt-8 text-[16px] sm:text-[18px] text-[#FAFAF7]/55 font-light leading-[1.8] max-w-xl mx-auto"
          >
            Un accompagnement émotionnel guidé, pensé pour les femmes. Comprendre,
            libérer, agir — un protocole à la fois, à ton rythme.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease }}
            className="mt-12 flex flex-col items-center gap-4"
          >
            <CtaButton large>Commencer mon quiz</CtaButton>
            <span className="text-[12px] text-[#FAFAF7]/30 font-light">
              2 minutes · Gratuit · Ta signature émotionnelle révélée
            </span>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Manifeste ── */}
      <section className="px-6 py-28 md:py-40">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal>
            <p className="text-[10px] tracking-[0.3em] uppercase font-medium text-[#FAFAF7]/30 mb-8">
              Pourquoi SOS Shine
            </p>
            <h2 className="font-display text-[2rem] sm:text-[3rem] font-light leading-[1.15] tracking-[-0.02em]">
              Tu n&apos;as pas besoin d&apos;un livre de plus.
              <br />
              <span className="text-[#FAFAF7]/40 italic">Tu as besoin d&apos;un chemin.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mt-10 text-[16px] text-[#FAFAF7]/55 font-light leading-[1.9]">
              SOS Shine réunit tout ce dont tu as besoin pour avancer&nbsp;: une encyclopédie
              de protocoles guidés, des soins en vidéo et en audio, une communauté qui ne te lâche
              pas, et un parcours qui s&apos;adapte à ce que tu traverses vraiment.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Les étapes ── */}
      <section className="px-6 py-20 md:py-28 border-y border-[#FAFAF7]/[0.06]">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-20">
            <p className="text-[10px] tracking-[0.3em] uppercase font-medium text-[#FAFAF7]/30 mb-6">
              Le parcours en 3 temps
            </p>
            <h2 className="font-display text-[2rem] sm:text-[3rem] font-light tracking-[-0.02em]">
              Comment ça marche
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8 md:gap-6">
            {STEPS.map((step, i) => (
              <Reveal key={step.num} delay={i * 0.12}>
                <div
                  className="relative h-full rounded-[28px] p-8 md:p-10"
                  style={{
                    background: 'linear-gradient(160deg, rgba(250,250,247,0.04), rgba(250,250,247,0.01))',
                    border: '1px solid rgba(250,250,247,0.07)',
                  }}
                >
                  <div
                    aria-hidden
                    className="absolute -top-px left-8 right-8 h-px"
                    style={{ background: `linear-gradient(90deg, transparent, ${step.accent}66, transparent)` }}
                  />
                  <span
                    className="block font-display text-[3rem] font-light leading-none mb-6"
                    style={{ color: step.accent }}
                  >
                    {step.num}
                  </span>
                  <h3 className="font-display text-[1.7rem] font-light mb-4">{step.title}</h3>
                  <p className="text-[14px] text-[#FAFAF7]/50 leading-[1.8] font-light">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.2} className="text-center mt-16">
            <CtaButton>Découvrir mon point de départ</CtaButton>
          </Reveal>
        </div>
      </section>

      {/* ── Les piliers ── */}
      <section className="px-6 py-28 md:py-40">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-16">
            <p className="text-[10px] tracking-[0.3em] uppercase font-medium text-[#FAFAF7]/30 mb-6">
              Tout est inclus
            </p>
            <h2 className="font-display text-[2rem] sm:text-[3rem] font-light tracking-[-0.02em]">
              Ce que tu trouves à l&apos;intérieur
            </h2>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PILLARS.map((p, i) => (
              <Reveal key={p.name} delay={(i % 3) * 0.1}>
                <div
                  className="h-full rounded-3xl p-7 transition-colors duration-300 hover:border-[#B8A472]/30"
                  style={{
                    background: 'rgba(250,250,247,0.02)',
                    border: '1px solid rgba(250,250,247,0.06)',
                  }}
                >
                  <span className="text-2xl">{p.icon}</span>
                  <h3 className="font-display text-[1.4rem] font-light mt-4 mb-2">{p.name}</h3>
                  <p className="text-[13.5px] text-[#FAFAF7]/45 leading-[1.7] font-light">{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tarifs ── */}
      <section className="px-6 py-24 md:py-36 border-t border-[#FAFAF7]/[0.06]">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-16">
            <p className="text-[10px] tracking-[0.3em] uppercase font-medium text-[#FAFAF7]/30 mb-6">
              Les formules
            </p>
            <h2 className="font-display text-[2rem] sm:text-[3rem] font-light leading-[1.1] tracking-[-0.02em]">
              Ta décision n&apos;est pas un achat.
              <br />
              <span className="italic text-[#FAFAF7]/40">C&apos;est un serment envers toi-même.</span>
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {PLANS.map((plan, i) => (
              <Reveal key={plan.name} delay={i * 0.12}>
                <div
                  className="relative h-full rounded-[32px] p-8 md:p-10 flex flex-col"
                  style={{
                    background: plan.highlight
                      ? 'linear-gradient(160deg, rgba(184,164,114,0.12), rgba(184,164,114,0.02))'
                      : 'linear-gradient(160deg, rgba(250,250,247,0.04), rgba(250,250,247,0.01))',
                    border: plan.highlight
                      ? '1px solid rgba(184,164,114,0.3)'
                      : '1px solid rgba(250,250,247,0.07)',
                  }}
                >
                  {plan.badge && (
                    <div className="flex justify-center mb-6">
                      <span className="px-4 py-1.5 rounded-full text-[10px] uppercase tracking-[0.2em] font-semibold bg-[#D4AF7F]/10 text-[#D4C99A] border border-[#D4AF7F]/20">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h3 className="font-display text-[1.6rem] font-light mb-4">{plan.name}</h3>
                    <div className="flex items-baseline justify-center gap-2.5">
                      <span className="font-display text-[3.5rem] font-light tracking-[-0.03em]">{plan.price}</span>
                      <span className="text-[15px] text-[#FAFAF7]/30 font-light">€{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-3.5 mb-9 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-[13.5px] text-[#FAFAF7]/55 font-light leading-relaxed">
                        <span className="text-[#D4C99A] mt-0.5 shrink-0 text-[12px]">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="flex justify-center">
                    <CtaButton>{plan.cta}</CtaButton>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <p className="text-center text-[12px] text-[#FAFAF7]/25 mt-10 font-light">
            Sans engagement · Annulable en 1 clic · Paiement sécurisé Stripe
          </p>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="relative px-6 py-32 md:py-44 text-center overflow-hidden">
        <div
          aria-hidden
          className="absolute rounded-full blur-[130px] opacity-25"
          style={{ width: 600, height: 600, background: '#B8A472', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        />
        <Reveal className="relative max-w-2xl mx-auto">
          <h2 className="font-display text-[2.4rem] sm:text-[3.5rem] font-light leading-[1.1] tracking-[-0.02em]">
            Le premier pas tient<br />
            <span className="italic text-[#D4C99A]">en deux minutes.</span>
          </h2>
          <p className="mt-8 text-[16px] text-[#FAFAF7]/55 font-light leading-[1.8]">
            Réponds au quiz et découvre ta signature émotionnelle — le point de départ
            de ton parcours sur SOS Shine.
          </p>
          <div className="mt-12">
            <CtaButton large>Faire le quiz maintenant</CtaButton>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
