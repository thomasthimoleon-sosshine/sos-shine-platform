'use client'

import { useRef, Suspense } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import MagneticButton from '@/components/landing/MagneticButton'
import PricingMorph from '@/components/landing/PricingMorph'

const IMG = 'https://krdfvggmfswbohuevzlb.supabase.co/storage/v1/object/public/uploads'
const HERO     = `${IMG}/616ED53A-03A5-4368-9C3E-15655CE75A3A.png`
const COMPREND = `${IMG}/AC966289-197D-4246-B77B-F5FB2139B4EC.png`
const LIBERER  = `${IMG}/4075E759-EDBC-479B-B270-833CD22B3D2E.png`
const AGIR     = `${IMG}/66DBE573-D7E0-4E9F-BD4D-9D4CEC07CAE1.png`
const COMMUNTE = `${IMG}/D3025812-9AA8-42DE-B8C2-C034218A2EFA.png`
const MOCKUP   = `${IMG}/8DC279D8-7E82-43EE-BC60-DFAE22AD31FA.png`

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number]

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function ImageReveal({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  return (
    <motion.div
      ref={ref}
      initial={{ clipPath: 'inset(100% 0 0 0)' }}
      animate={isInView ? { clipPath: 'inset(0% 0 0 0)' } : {}}
      transition={{ duration: 1, ease }}
      className={className}
    >
      <img src={src} alt={alt} className="w-full h-full object-cover" />
    </motion.div>
  )
}

export default function LandingJulia() {
  const heroRef = useRef(null)
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroOpacity = useTransform(heroProgress, [0, 0.8], [1, 0])
  const heroScale = useTransform(heroProgress, [0, 1], [1, 0.95])

  return (
    <main className="bg-[#0A0A0F] text-[#FAFAF7] overflow-hidden selection:bg-[#D4AF7F]/20 selection:text-[#FAFAF7]">

      {/* ═══════════════════════════════════════════
          HEADER
      ═══════════════════════════════════════════ */}
      <header className="fixed top-0 left-0 right-0 z-50 py-5 md:py-6 mix-blend-difference">
        <div className="flex items-center justify-between max-w-7xl mx-auto px-6 md:px-10">
          <Link href="/">
            <img src="/images/logo-shine.png" alt="SOS Shine" className="h-10 md:h-12 w-auto object-contain invert" />
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/login" className="text-[13px] text-[#FAFAF7]/50 hover:text-[#FAFAF7] transition-colors duration-500">
              Connexion
            </Link>
            <Link
              href="/signup"
              className="hidden sm:inline-flex px-5 py-2.5 rounded-full text-[13px] font-medium bg-[#FAFAF7] text-[#0A0A0F] hover:bg-[#D4AF7F] transition-all duration-500"
            >
              Rejoindre
            </Link>
          </nav>
        </div>
      </header>

      {/* ═══════════════════════════════════════════
          ACTE 1 — LE HOOK (Hero avec image)
      ═══════════════════════════════════════════ */}
      <motion.section ref={heroRef} className="relative min-h-[100vh] flex items-end" style={{ opacity: heroOpacity, scale: heroScale }}>
        <div className="absolute inset-0">
          <img src={HERO} alt="" className="w-full h-full object-cover object-[70%_center]" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/60 to-[#0A0A0F]/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0F]/70 to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-10 w-full pb-16 md:pb-24">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 1, ease }}
            className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase font-medium text-[#D4AF7F] mb-6"
          >
            D&eacute;conditionnement &eacute;motionnel
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8, ease }}
            className="font-display font-light text-[2rem] sm:text-[3rem] md:text-[4rem] lg:text-[5rem] leading-[1.04] tracking-[-0.04em] mb-8 max-w-3xl"
          >
            Et si ce qui te fait souffrir &eacute;tait exactement{' '}
            <em className="italic text-[#FAFAF7]/60">ce qui doit briller&nbsp;?</em>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8, ease }}
            className="text-[15px] sm:text-[17px] text-[#FAFAF7]/45 leading-[1.7] max-w-lg font-light mb-10"
          >
            SOS Shine d&eacute;code les sch&eacute;mas &eacute;motionnels qui pilotent ta vie
            et te donne les outils pour reprendre les commandes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8, ease }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <MagneticButton href="/signature-emotionnelle">
              D&eacute;couvrir ma Signature
            </MagneticButton>
            <MagneticButton href="/encyclopedie" variant="ghost">
              Explorer les protocoles
            </MagneticButton>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <motion.div
            className="w-px h-10 bg-gradient-to-b from-[#FAFAF7]/20 to-transparent origin-top"
            animate={{ scaleY: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease }}
          />
        </motion.div>
      </motion.section>

      {/* ═══════════════════════════════════════════
          ACTE 2 — LE MIROIR (Pain Recognition)
      ═══════════════════════════════════════════ */}
      <section className="py-28 md:py-40">
        <div className="max-w-3xl mx-auto px-6 md:px-10 space-y-20 md:space-y-28">
          {[
            "Tu souris. À l'intérieur, tu hurles.",
            "Tu sais. Tu n'arrives pas à faire.",
            "Tu donnes. Personne ne voit que tu meurs.",
            "Tu contrôles. Parce que lâcher, c'est tomber.",
            "Tu recommences. La même histoire. Le même mur.",
          ].map((pain, i) => (
            <Reveal key={i} delay={0.1}>
              <p className="font-display text-[1.5rem] sm:text-[2rem] md:text-[2.8rem] font-light leading-[1.15] tracking-[-0.03em] italic text-center text-[#FAFAF7]/70">
                {pain}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          ACTE 3 — LA RÉVÉLATION (3 étapes avec images)
      ═══════════════════════════════════════════ */}
      <section className="py-28 md:py-40 border-t border-[#FAFAF7]/[0.03]">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <Reveal>
            <p className="text-[10px] tracking-[0.3em] uppercase font-medium text-[#FAFAF7]/25 mb-6 text-center">
              Le parcours
            </p>
            <h2 className="font-display text-[1.8rem] sm:text-[2.5rem] md:text-[3rem] font-light leading-[1.06] tracking-[-0.03em] text-center mb-20 md:mb-28">
              Tu ne te r&eacute;pareras pas.<br />
              <span className="italic text-[#FAFAF7]/40">Tu te r&eacute;v&egrave;les.</span>
            </h2>
          </Reveal>

          {/* Step 1 */}
          <Reveal>
            <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16 mb-20 md:mb-28">
              <div className="w-full md:w-1/2 aspect-[4/3] rounded-[24px] overflow-hidden">
                <img src={COMPREND} alt="Comprendre" className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="w-full md:w-1/2">
                <span className="block text-[11px] uppercase tracking-[0.3em] font-medium text-[#7DD3FC] mb-4">01</span>
                <h3 className="font-display text-[1.5rem] sm:text-[2rem] font-light tracking-[-0.02em] text-[#FAFAF7] mb-4 leading-[1.15]">Comprendre</h3>
                <p className="text-[15px] text-[#FAFAF7]/45 leading-[1.8] font-light">
                  Identifier le sch&eacute;ma inconscient qui pilote tes r&eacute;actions. Pas de la th&eacute;orie.
                  Une lecture pr&eacute;cise de ce qui se joue en toi — depuis toujours.
                </p>
              </div>
            </div>
          </Reveal>

          {/* Step 2 */}
          <Reveal>
            <div className="flex flex-col md:flex-row-reverse items-center gap-10 md:gap-16 mb-20 md:mb-28">
              <div className="w-full md:w-1/2 aspect-[4/3] rounded-[24px] overflow-hidden">
                <img src={LIBERER} alt="Libérer" className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="w-full md:w-1/2">
                <span className="block text-[11px] uppercase tracking-[0.3em] font-medium text-[#A78BFA] mb-4">02</span>
                <h3 className="font-display text-[1.5rem] sm:text-[2rem] font-light tracking-[-0.02em] text-[#FAFAF7] mb-4 leading-[1.15]">Lib&eacute;rer</h3>
                <p className="text-[15px] text-[#FAFAF7]/45 leading-[1.8] font-light">
                  D&eacute;charger l&apos;&eacute;motion stock&eacute;e dans le corps. Respiration ventrale,
                  lib&eacute;ration somatique. Ce qui doit sortir sort.
                </p>
              </div>
            </div>
          </Reveal>

          {/* Step 3 */}
          <Reveal>
            <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
              <div className="w-full md:w-1/2 aspect-[4/3] rounded-[24px] overflow-hidden">
                <img src={AGIR} alt="Agir" className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="w-full md:w-1/2">
                <span className="block text-[11px] uppercase tracking-[0.3em] font-medium text-[#FBCFE8] mb-4">03</span>
                <h3 className="font-display text-[1.5rem] sm:text-[2rem] font-light tracking-[-0.02em] text-[#FAFAF7] mb-4 leading-[1.15]">Agir</h3>
                <p className="text-[15px] text-[#FAFAF7]/45 leading-[1.8] font-light">
                  Reprogrammer l&apos;automatisme. Miroir, ancrage, rituel du matin.
                  Chaque jour, un nouveau r&eacute;flexe remplace l&apos;ancien.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          ACTE 4 — LA TRINITÉ (Co-créateurs)
      ═══════════════════════════════════════════ */}
      <section className="py-32 md:py-44 border-t border-[#FAFAF7]/[0.03]">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <Reveal>
            <p className="text-[10px] tracking-[0.3em] uppercase font-medium text-[#FAFAF7]/25 mb-6 text-center">
              Les co-cr&eacute;ateurs
            </p>
            <h2 className="font-display text-[2rem] sm:text-[2.8rem] md:text-[3.5rem] font-light leading-[1.06] tracking-[-0.03em] text-center mb-20 md:mb-28">
              Une table. Trois chaises.<br />
              <span className="italic text-[#FAFAF7]/40">La tienne attend.</span>
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8 md:gap-6">
            {[
              {
                name: 'Julia',
                role: 'La Sœur Spirituelle',
                desc: "Cœur, intuition, résonance émotionnelle. Elle sent ce que les mots ne disent pas.",
                image: '/images/julia.jpeg',
                accent: '#FBCFE8',
              },
              {
                name: 'William',
                role: "L'Architecte Pédagogue",
                desc: "Mécanismes psychiques, MTC, hypnothérapie. Il décode ce que le mental cache.",
                image: null,
                accent: '#A78BFA',
              },
              {
                name: 'Thomas',
                role: 'Le Pratiquant Incarné',
                desc: "Miroir, respiration ventrale, ancrage. Il pratique chaque jour ce qu'il enseigne.",
                image: null,
                accent: '#7DD3FC',
              },
            ].map((person, i) => (
              <Reveal key={person.name} delay={i * 0.15}>
                <div className="group text-center">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border border-[#FAFAF7]/[0.06] relative">
                    {person.image ? (
                      <img src={person.image} alt={person.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[2rem] font-display font-light" style={{ color: person.accent, background: `${person.accent}08` }}>
                        {person.name[0]}
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] tracking-[0.2em] uppercase font-medium mb-2" style={{ color: person.accent }}>
                    {person.role}
                  </p>
                  <h3 className="font-display text-[1.5rem] font-light text-[#FAFAF7] mb-3 tracking-[-0.02em]">
                    {person.name}
                  </h3>
                  <p className="text-[13px] text-[#FAFAF7]/40 leading-[1.7] font-light max-w-xs mx-auto">
                    {person.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          ACTE 5 — LA PRATIQUE (Écosystème)
      ═══════════════════════════════════════════ */}
      <section className="py-32 md:py-44 border-t border-[#FAFAF7]/[0.03]">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <Reveal>
            <p className="text-[10px] tracking-[0.3em] uppercase font-medium text-[#FAFAF7]/25 mb-6 text-center">
              L&apos;&eacute;cosyst&egrave;me
            </p>
            <h2 className="font-display text-[2rem] sm:text-[2.8rem] font-light leading-[1.06] tracking-[-0.03em] text-center mb-20">
              Tout ce dont tu as besoin.<br />
              <span className="italic text-[#FAFAF7]/40">Rien de superflu.</span>
            </h2>
          </Reveal>

          {/* Bento Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px] md:auto-rows-[220px]">
            {/* Encyclopédie — large */}
            <Reveal className="col-span-2 row-span-2">
              <div className="h-full rounded-[24px] p-8 flex flex-col justify-end relative overflow-hidden group"
                style={{ background: 'linear-gradient(160deg, rgba(125,211,252,0.08) 0%, rgba(10,10,15,0.95) 60%)' }}>
                <div className="absolute top-6 right-6 text-[11px] tracking-[0.2em] uppercase text-[#7DD3FC]/60">203 sujets</div>
                <span className="text-3xl mb-3">&#9671;</span>
                <h3 className="font-display text-[1.3rem] font-light text-[#FAFAF7] mb-2">L&apos;Encyclop&eacute;die</h3>
                <p className="text-[12px] text-[#FAFAF7]/35 font-light leading-relaxed">
                  De A &agrave; Z, chaque exp&eacute;rience &eacute;motionnelle d&eacute;cod&eacute;e.
                  Protocoles guid&eacute;s : Comprendre &middot; Lib&eacute;rer &middot; Agir.
                </p>
              </div>
            </Reveal>

            {/* Shine TV */}
            <Reveal delay={0.1}>
              <div className="h-full rounded-[24px] p-6 flex flex-col justify-end"
                style={{ background: 'linear-gradient(160deg, rgba(167,139,250,0.06) 0%, rgba(10,10,15,0.95) 60%)' }}>
                <span className="text-xl mb-2">&#9654;</span>
                <h3 className="text-[14px] font-medium text-[#FAFAF7] mb-1">Shine TV</h3>
                <p className="text-[11px] text-[#FAFAF7]/30 font-light">Vid&eacute;os guid&eacute;es</p>
              </div>
            </Reveal>

            {/* Audible */}
            <Reveal delay={0.15}>
              <div className="h-full rounded-[24px] p-6 flex flex-col justify-end"
                style={{ background: 'linear-gradient(160deg, rgba(251,207,232,0.06) 0%, rgba(10,10,15,0.95) 60%)' }}>
                <span className="text-xl mb-2">&#9835;</span>
                <h3 className="text-[14px] font-medium text-[#FAFAF7] mb-1">Shine Audible</h3>
                <p className="text-[11px] text-[#FAFAF7]/30 font-light">M&eacute;ditations &middot; Gratuit</p>
              </div>
            </Reveal>

            {/* Librairie */}
            <Reveal delay={0.2}>
              <div className="h-full rounded-[24px] p-6 flex flex-col justify-end"
                style={{ background: 'linear-gradient(160deg, rgba(212,175,127,0.06) 0%, rgba(10,10,15,0.95) 60%)' }}>
                <span className="text-xl mb-2">&#9733;</span>
                <h3 className="text-[14px] font-medium text-[#FAFAF7] mb-1">Librairie</h3>
                <p className="text-[11px] text-[#FAFAF7]/30 font-light">eBooks &amp; guides</p>
              </div>
            </Reveal>

            {/* Communauté — wide */}
            <Reveal delay={0.25} className="col-span-2 md:col-span-1">
              <div className="h-full rounded-[24px] overflow-hidden relative group">
                <img src={COMMUNTE} alt="Communauté" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-[14px] font-medium text-[#FAFAF7] mb-1">Feu de Camp</h3>
                  <p className="text-[11px] text-[#FAFAF7]/30 font-light">Communaut&eacute; &middot; Gratuit</p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Mockup */}
          <Reveal delay={0.3}>
            <div className="mt-20 rounded-[24px] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
              <img src={MOCKUP} alt="SOS Shine — Application" className="w-full" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          ACTE 6 — LA PREUVE (Témoignages)
      ═══════════════════════════════════════════ */}
      <section className="py-32 md:py-44 border-t border-[#FAFAF7]/[0.03]">
        <div className="max-w-5xl mx-auto px-6 md:px-10">
          <Reveal>
            <p className="text-[10px] tracking-[0.3em] uppercase font-medium text-[#FAFAF7]/25 mb-6 text-center">
              T&eacute;moignages v&eacute;rifi&eacute;s
            </p>
            <h2 className="font-display text-[2rem] sm:text-[2.8rem] font-light leading-[1.06] tracking-[-0.03em] text-center mb-20">
              Elles ont travers&eacute;.<br />
              <span className="italic text-[#FAFAF7]/40">Elles t&eacute;moignent.</span>
            </h2>
          </Reveal>

          <div className="columns-1 md:columns-2 gap-5 space-y-5">
            {[
              { text: "J'ai compris en 3 semaines ce que 4 ans de thérapie n'avaient pas touché. Le schéma était là, sous mes yeux, depuis toujours.", name: 'Camille', detail: '34 ans · Lyon · 3 mois de pratique' },
              { text: "La première fois que j'ai fait le protocole de respiration ventrale, j'ai pleuré pendant 20 minutes. Pas de tristesse. De libération.", name: 'Sophie', detail: '41 ans · Paris · 6 mois de pratique' },
              { text: "Mon couple a changé. Pas parce que lui a changé. Parce que j'ai arrêté de rejouer le même film.", name: 'Nadia', detail: '29 ans · Marseille · 2 mois de pratique' },
              { text: "Je recommençais tout, tout le temps. Les relations, les jobs, les amitiés. Le même schéma. Maintenant je le vois venir.", name: 'Marie', detail: '38 ans · Bordeaux · 4 mois de pratique' },
              { text: "Le Feu de Camp m'a sauvée un dimanche soir à 23h. Quelqu'un a répondu. Quelqu'un comprenait.", name: 'Léa', detail: '26 ans · Nantes · 1 mois de pratique' },
            ].map((t, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div
                  className="break-inside-avoid p-6 rounded-[20px] transition-all duration-500 hover:scale-[1.02] group"
                  style={{
                    background: 'rgba(250,250,247,0.02)',
                    border: '1px solid rgba(250,250,247,0.04)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  <p className="text-[14px] text-[#FAFAF7]/60 leading-[1.8] font-light italic mb-5">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div>
                    <p className="text-[13px] text-[#FAFAF7] font-medium">{t.name}</p>
                    <p className="text-[11px] text-[#FAFAF7]/25 mt-0.5">{t.detail}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          ACTE 7 — LE CHOIX (Pricing)
      ═══════════════════════════════════════════ */}
      <PricingMorph />

      {/* ═══════════════════════════════════════════
          OUTRO — Footer
      ═══════════════════════════════════════════ */}
      <footer className="py-20 border-t border-[#FAFAF7]/[0.03]">
        <div className="max-w-4xl mx-auto px-6 md:px-10 text-center">
          <Reveal>
            <img src="/images/logo-shine.png" alt="SOS Shine" className="h-10 mx-auto mb-8 object-contain opacity-30" />
          </Reveal>
          <Reveal delay={0.1}>
            <p className="font-display text-[1.2rem] italic text-[#FAFAF7]/20 font-light mb-12">
              Julia &middot; William &middot; Thomas
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="flex flex-wrap justify-center gap-8 text-[12px] text-[#FAFAF7]/15">
              <Link href="/mentions-legales" className="hover:text-[#FAFAF7]/40 transition-colors">Mentions l&eacute;gales</Link>
              <Link href="/cgv" className="hover:text-[#FAFAF7]/40 transition-colors">CGV</Link>
              <Link href="/confidentialite" className="hover:text-[#FAFAF7]/40 transition-colors">Confidentialit&eacute;</Link>
              <Link href="/contact" className="hover:text-[#FAFAF7]/40 transition-colors">Contact</Link>
            </div>
          </Reveal>
          <p className="text-[10px] text-[#FAFAF7]/8 mt-10">
            &copy; {new Date().getFullYear()} SOS Shine&reg;
          </p>
        </div>
      </footer>
    </main>
  )
}
