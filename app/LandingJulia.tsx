'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'

const IMG = 'https://krdfvggmfswbohuevzlb.supabase.co/storage/v1/object/public/uploads'
const HERO     = `${IMG}/616ED53A-03A5-4368-9C3E-15655CE75A3A.png`
const COMPREND = `${IMG}/AC966289-197D-4246-B77B-F5FB2139B4EC.png`
const LIBERER  = `${IMG}/4075E759-EDBC-479B-B270-833CD22B3D2E.png`
const AGIR     = `${IMG}/66DBE573-D7E0-4E9F-BD4D-9D4CEC07CAE1.png`
const MOCKUP   = `${IMG}/8DC279D8-7E82-43EE-BC60-DFAE22AD31FA.png`
const COMMUNTE = `${IMG}/D3025812-9AA8-42DE-B8C2-C034218A2EFA.png`

const ease = [0.16, 1, 0.3, 1] as const

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

function TickerBand({ items }: { items: string[] }) {
  const doubled = [...items, ...items]
  return (
    <div className="relative overflow-hidden py-5 border-y border-[rgba(184,164,114,0.06)]">
      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="text-[11px] uppercase tracking-[0.25em] font-medium text-[#6B6560]">
            {item}
            <span className="mx-6 text-[#3D3A36]">&middot;</span>
          </span>
        ))}
      </motion.div>
    </div>
  )
}

export default function LandingJulia() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0])

  return (
    <main className="min-h-screen bg-[#06070A] text-[#F5F0E8] overflow-hidden">

      {/* ═══ HEADER ═══ */}
      <header className="fixed top-0 left-0 right-0 z-50 py-5 md:py-6 bg-[#06070A]/60 backdrop-blur-2xl">
        <div className="flex items-center justify-between max-w-7xl mx-auto px-6 md:px-10">
          <Link href="/">
            <img src="/images/logo-shine.png" alt="SOS Shine" className="h-10 md:h-12 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-5 sm:gap-6">
            <Link href="/login" className="text-[13px] text-[#9B9590] hover:text-[#F5F0E8] transition-colors duration-300">
              Se connecter
            </Link>
            <Link
              href="/signup"
              className="hidden sm:inline-flex px-5 py-2.5 rounded-full text-[13px] font-medium bg-[#B8A472] text-[#08090A] hover:bg-[#C4B080] transition-all duration-500 active:scale-[0.98]"
            >
              Commencer
            </Link>
          </div>
        </div>
      </header>

      {/* ═══ HERO — fullscreen image + text ═══ */}
      <motion.section ref={heroRef} className="relative min-h-[100vh] flex items-end" style={{ opacity: heroOpacity }}>
        {/* Background image */}
        <div className="absolute inset-0">
          <img src={HERO} alt="" className="w-full h-full object-cover object-[70%_center]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#06070A] via-[#06070A]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#06070A]/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-10 w-full pb-20 md:pb-28">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.3, ease }}
            className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase font-medium text-[#B8A472] mb-6"
          >
            Plateforme de d&eacute;conditionnement &eacute;motionnel
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease }}
            className="font-display font-light text-[2.2rem] sm:text-[3rem] md:text-[3.8rem] lg:text-[4.5rem] leading-[1.06] tracking-[-0.02em] mb-6 md:mb-8 max-w-3xl"
          >
            Ce que vous vivez<br />
            a une explication.<br />
            Et une sortie.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease }}
            className="text-[15px] sm:text-[17px] text-[#9B9590] leading-[1.7] max-w-lg font-light mb-10"
          >
            SOS Shine d&eacute;code les sch&eacute;mas &eacute;motionnels qui pilotent votre vie
            et vous donne les outils pour reprendre les commandes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1, ease }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link href="/signature-emotionnelle"
              className="px-8 py-4 rounded-full text-[14px] font-medium bg-[#B8A472] text-[#08090A] transition-all duration-500 hover:bg-[#C4B080] hover:shadow-[0_0_40px_rgba(184,164,114,0.15)] active:scale-[0.98] text-center"
            >
              D&eacute;couvrir ma Signature &Eacute;motionnelle
            </Link>
            <Link href="/encyclopedie"
              className="px-8 py-4 rounded-full text-[14px] font-light text-[#9B9590] border border-[rgba(184,164,114,0.12)] hover:border-[rgba(184,164,114,0.25)] hover:text-[#F5F0E8] transition-all duration-500 text-center"
            >
              D&eacute;couvrir les protocoles
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* ═══ TICKER ═══ */}
      <TickerBand items={[
        'Déconditionnement émotionnel',
        'Protocoles guidés',
        'Communauté bienveillante',
        'Shine TV',
        'Shine Audible',
        'Encyclopédie 200+ sujets',
        'Lives hebdomadaires',
      ]} />

      {/* ═══ PROBLÈME ═══ */}
      <section className="py-28 md:py-40">
        <div className="max-w-3xl mx-auto px-6 md:px-10 text-center">
          <Reveal>
            <p className="text-[10px] tracking-[0.3em] uppercase font-medium text-[#6B6560] mb-8">
              La v&eacute;rit&eacute; qui change tout
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display text-[1.8rem] sm:text-[2.5rem] md:text-[3rem] font-light leading-[1.1] tracking-[-0.02em] mb-10">
              Vous n&apos;&ecirc;tes pas cass&eacute;(e).<br />
              <span className="text-[#B8A472]">Vous &ecirc;tes conditionn&eacute;(e).</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-[15px] text-[#9B9590] leading-[1.8] font-light max-w-lg mx-auto">
              Chaque r&eacute;action excessive. Chaque relation qui finit pareil.
              Chaque effondrement que vous n&apos;arrivez pas &agrave; expliquer.
              Ce ne sont pas des d&eacute;fauts de caract&egrave;re.
              Ce sont des sch&eacute;mas — construits dans l&apos;enfance,
              renforc&eacute;s par vos exp&eacute;riences, r&eacute;p&eacute;t&eacute;s &agrave; votre insu.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="text-[17px] text-[#F5F0E8] font-light mt-12">
              Quand vous comprenez votre sch&eacute;ma, vous arr&ecirc;tez de le subir.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ 3 ÉTAPES — avec images ═══ */}
      <section className="py-28 md:py-40 border-t border-[rgba(184,164,114,0.04)]">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <Reveal>
            <p className="text-[10px] tracking-[0.3em] uppercase font-medium text-[#6B6560] mb-8 text-center">
              Le parcours
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display text-[1.8rem] sm:text-[2.5rem] font-light leading-[1.1] tracking-[-0.02em] text-center mb-20 md:mb-28">
              Trois &eacute;tapes. Un nouveau d&eacute;part.
            </h2>
          </Reveal>

          {/* Step 1 — Comprendre */}
          <Reveal>
            <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16 mb-24 md:mb-32">
              <div className="w-full md:w-1/2 aspect-[4/3] rounded-[24px] overflow-hidden">
                <img src={COMPREND} alt="Comprendre" className="w-full h-full object-cover" />
              </div>
              <div className="w-full md:w-1/2">
                <span className="font-display text-[4rem] font-light text-[rgba(184,164,114,0.1)] leading-none block mb-4">01</span>
                <h3 className="text-[20px] font-medium text-[#F5F0E8] mb-4">Comprendre</h3>
                <p className="text-[15px] text-[#9B9590] leading-[1.8] font-light">
                  Mettre des mots sur ce qui vous d&eacute;truit en silence.
                  Identifier le sch&eacute;ma qui se r&eacute;p&egrave;te.
                  Comprendre pourquoi vous r&eacute;agissez comme &ccedil;a — sans jugement.
                </p>
              </div>
            </div>
          </Reveal>

          {/* Step 2 — Libérer */}
          <Reveal>
            <div className="flex flex-col md:flex-row-reverse items-center gap-10 md:gap-16 mb-24 md:mb-32">
              <div className="w-full md:w-1/2 aspect-[4/3] rounded-[24px] overflow-hidden">
                <img src={LIBERER} alt="Libérer" className="w-full h-full object-cover" />
              </div>
              <div className="w-full md:w-1/2">
                <span className="font-display text-[4rem] font-light text-[rgba(184,164,114,0.1)] leading-none block mb-4">02</span>
                <h3 className="text-[20px] font-medium text-[#F5F0E8] mb-4">Lib&eacute;rer</h3>
                <p className="text-[15px] text-[#9B9590] leading-[1.8] font-light">
                  Une crise &agrave; 2h du matin ? Une lib&eacute;ration physique et &eacute;motionnelle
                  imm&eacute;diate, guid&eacute;e pas &agrave; pas. Protocoles de respiration,
                  de d&eacute;charge, de recentrage — accessibles 24/7.
                </p>
              </div>
            </div>
          </Reveal>

          {/* Step 3 — Agir */}
          <Reveal>
            <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
              <div className="w-full md:w-1/2 aspect-[4/3] rounded-[24px] overflow-hidden">
                <img src={AGIR} alt="Agir" className="w-full h-full object-cover" />
              </div>
              <div className="w-full md:w-1/2">
                <span className="font-display text-[4rem] font-light text-[rgba(184,164,114,0.1)] leading-none block mb-4">03</span>
                <h3 className="text-[20px] font-medium text-[#F5F0E8] mb-4">Agir</h3>
                <p className="text-[15px] text-[#9B9590] leading-[1.8] font-light">
                  Reprogrammer vos automatismes en nouveaux r&eacute;flexes.
                  Des protocoles concrets, pas de la th&eacute;orie.
                  Chaque jour, un pas vers la personne que vous &ecirc;tes vraiment.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ MOCKUP PLATEFORME ═══ */}
      <section className="py-28 md:py-40 border-t border-[rgba(184,164,114,0.04)]">
        <div className="max-w-5xl mx-auto px-6 md:px-10 text-center">
          <Reveal>
            <p className="text-[10px] tracking-[0.3em] uppercase font-medium text-[#6B6560] mb-8">
              Votre sanctuaire digital
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display text-[1.8rem] sm:text-[2.5rem] font-light leading-[1.1] tracking-[-0.02em] mb-16 md:mb-20">
              Une exp&eacute;rience pens&eacute;e<br />pour votre transformation.
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="rounded-[24px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
              <img src={MOCKUP} alt="SOS Shine — Application" className="w-full" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ CE QUE VOUS RECEVEZ ═══ */}
      <section className="py-28 md:py-40 border-t border-[rgba(184,164,114,0.04)]">
        <div className="max-w-5xl mx-auto px-6 md:px-10">
          <Reveal>
            <p className="text-[10px] tracking-[0.3em] uppercase font-medium text-[#6B6560] mb-8 text-center">
              Tout est inclus
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display text-[1.8rem] sm:text-[2.5rem] font-light leading-[1.1] tracking-[-0.02em] text-center mb-16 md:mb-20">
              Ce que vous recevez<br />d&egrave;s le premier jour.
            </h2>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '📖', title: "L'Encyclopédie", desc: "200+ protocoles de déconditionnement classés par expérience de vie. De A à Z." },
              { icon: '🎬', title: 'Shine TV', desc: "Protocoles vidéo guidés par Julia. Comprendre, libérer, agir — en image." },
              { icon: '🎧', title: 'Shine Audible', desc: "Méditations, respirations, guidances audio. Pour les moments où vous avez juste besoin d'écouter." },
              { icon: '📚', title: 'Shine Librairie', desc: "eBooks et guides écrits par Julia. Votre bibliothèque de transformation." },
              { icon: '🔥', title: 'Communauté', desc: "Le Feu de Camp — un espace anonyme, bienveillant, sans jugement. Vous n'êtes plus seul(e).", featured: true },
              { icon: '📅', title: 'Événements live', desc: "Lives hebdomadaires avec Julia, soins collectifs mensuels, ateliers thématiques." },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.08}>
                <div className="p-7 rounded-[20px] bg-[#0D1018] border border-[rgba(184,164,114,0.06)] hover:border-[rgba(184,164,114,0.15)] transition-all duration-500 h-full group">
                  <span className="text-2xl block mb-5 group-hover:scale-110 transition-transform duration-500">{item.icon}</span>
                  <h3 className="text-[15px] font-medium text-[#F5F0E8] mb-3">{item.title}</h3>
                  <p className="text-[13px] text-[#9B9590] leading-[1.7] font-light">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ JULIA ═══ */}
      <section className="py-28 md:py-40 border-t border-[rgba(184,164,114,0.04)]">
        <div className="max-w-4xl mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
            <Reveal className="shrink-0">
              <div className="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-2 border-[rgba(184,164,114,0.1)]">
                <img src="/images/julia.jpeg" alt="Julia Laureau" className="w-full h-full object-cover" />
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <div>
                <p className="text-[10px] tracking-[0.3em] uppercase font-medium text-[#6B6560] mb-4">
                  Fondatrice
                </p>
                <h2 className="font-display text-[1.8rem] sm:text-[2.2rem] font-light leading-[1.15] mb-6">
                  Julia Laureau
                </h2>
                <p className="text-[15px] text-[#9B9590] leading-[1.8] font-light mb-6">
                  Auteure du livre &laquo;&nbsp;Le D&eacute;conditionnement&nbsp;&raquo;,
                  Julia accompagne depuis des ann&eacute;es des personnes qui r&eacute;p&egrave;tent
                  les m&ecirc;mes sch&eacute;mas sans comprendre pourquoi.
                  SOS Shine est n&eacute; de cette exp&eacute;rience : rendre accessible
                  &agrave; tous ce qui change vraiment une vie.
                </p>
                <p className="text-[14px] text-[#B8A472] font-light italic">
                  &laquo;&nbsp;On ne comprend vraiment quelqu&apos;un que quand on est pass&eacute; par l&agrave;.&nbsp;&raquo;
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ COMMUNAUTÉ — Feu de Camp ═══ */}
      <section className="py-28 md:py-40 border-t border-[rgba(184,164,114,0.04)]">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
            <Reveal className="w-full md:w-3/5">
              <div className="aspect-[16/10] rounded-[24px] overflow-hidden">
                <img src={COMMUNTE} alt="Le Feu de Camp — Communauté SOS Shine" className="w-full h-full object-cover" />
              </div>
            </Reveal>
            <Reveal delay={0.15} className="w-full md:w-2/5">
              <p className="text-[10px] tracking-[0.3em] uppercase font-medium text-[#6B6560] mb-4">
                Le Feu de Camp
              </p>
              <h2 className="font-display text-[1.8rem] sm:text-[2.2rem] font-light leading-[1.15] mb-6">
                Vous n&apos;&ecirc;tes<br />plus seul(e).
              </h2>
              <p className="text-[15px] text-[#9B9590] leading-[1.8] font-light mb-6">
                Un espace anonyme, bienveillant, sans jugement.
                Des personnes qui traversent les m&ecirc;mes sch&eacute;mas que vous.
                Des conversations qui gu&eacute;rissent autant que les protocoles.
              </p>
              <Link href="/signup"
                className="inline-flex px-6 py-3 rounded-full text-[13px] font-medium border border-[rgba(184,164,114,0.15)] text-[#9B9590] hover:border-[rgba(184,164,114,0.3)] hover:text-[#F5F0E8] transition-all duration-500"
              >
                Rejoindre la communaut&eacute;
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ TICKER 2 ═══ */}
      <TickerBand items={[
        '200+ protocoles',
        '7 jours gratuits',
        'Sans engagement',
        'Accessible 24/7',
        'Communauté bienveillante',
        'Contenu exclusif',
      ]} />

      {/* ═══ PRICING ═══ */}
      <section className="py-28 md:py-40">
        <div className="max-w-4xl mx-auto px-6 md:px-10">
          <Reveal>
            <p className="text-[10px] tracking-[0.3em] uppercase font-medium text-[#6B6560] mb-8 text-center">
              L&apos;offre
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display text-[1.8rem] sm:text-[2.5rem] font-light leading-[1.1] tracking-[-0.02em] text-center mb-16">
              Un prix. Tout inclus.
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Reveal delay={0.15}>
              <div className="p-8 rounded-[24px] bg-[#0D1018] border border-[rgba(184,164,114,0.06)] text-center h-full flex flex-col justify-between">
                <div>
                  <p className="text-[11px] tracking-[0.2em] uppercase text-[#9B9590] mb-4">Essentielle</p>
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className="font-display text-[2.5rem] font-light text-[#F5F0E8]">9,90</span>
                    <span className="text-[15px] text-[#6B6560]">&euro;/mois</span>
                  </div>
                  <p className="text-[12px] text-[#6B6560] mb-8">Acc&egrave;s imm&eacute;diat</p>
                </div>
                <Link href="/rejoindre"
                  className="block w-full py-3.5 rounded-full text-[13px] font-medium border border-[rgba(184,164,114,0.15)] text-[#9B9590] hover:border-[rgba(184,164,114,0.3)] hover:text-[#F5F0E8] transition-all duration-500"
                >
                  Choisir Essentielle
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.25}>
              <div className="p-8 rounded-[24px] bg-[#0D1018] border border-[rgba(184,164,114,0.15)] text-center relative overflow-hidden h-full flex flex-col justify-between">
                <div className="absolute top-0 left-0 right-0 h-px bg-[linear-gradient(90deg,transparent,rgba(184,164,114,0.3),transparent)]" />
                <div>
                  <p className="text-[11px] tracking-[0.2em] uppercase text-[#B8A472] mb-4">S&eacute;r&eacute;nit&eacute;</p>
                  <div className="flex items-baseline justify-center gap-2 mb-1">
                    <span className="text-[16px] text-[#6B6560] line-through">49,90&euro;</span>
                    <span className="font-display text-[2.5rem] font-light text-[#F5F0E8]">29,90</span>
                    <span className="text-[15px] text-[#6B6560]">&euro;/mois</span>
                  </div>
                  <p className="text-[12px] text-[#B8A472] mb-8">7 jours d&apos;essai gratuit &middot; code SHINE2026</p>
                </div>
                <Link href="/rejoindre"
                  className="block w-full py-3.5 rounded-full text-[13px] font-medium bg-[#B8A472] text-[#08090A] hover:bg-[#C4B080] hover:shadow-[0_0_30px_rgba(184,164,114,0.1)] transition-all duration-500"
                >
                  Commencer S&eacute;r&eacute;nit&eacute;
                </Link>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.3}>
            <p className="text-center text-[12px] text-[#6B6560] mt-8">
              Sans engagement &middot; Annulable &agrave; tout instant &middot; Paiement s&eacute;curis&eacute;
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="py-28 md:py-40 border-t border-[rgba(184,164,114,0.04)]">
        <div className="max-w-2xl mx-auto px-6 md:px-10">
          <Reveal>
            <h2 className="font-display text-[1.8rem] sm:text-[2.5rem] font-light leading-[1.1] text-center mb-16">
              Questions fr&eacute;quentes
            </h2>
          </Reveal>

          <div className="space-y-6">
            {[
              { q: "Est-ce que SOS Shine remplace un thérapeute ?", a: "Non. SOS Shine est un complément. Nous ne posons aucun diagnostic. Nous vous aidons à comprendre vos schémas et à agir dessus au quotidien." },
              { q: "Combien de temps faut-il pour voir des résultats ?", a: "La plupart des membres rapportent un déclic dès les 2 premières semaines. Les transformations profondes prennent 2 à 3 mois de pratique régulière." },
              { q: "Je peux annuler quand je veux ?", a: "Oui. Sans engagement, sans justification. Si on doit vous retenir par un contrat, c'est qu'on n'a pas fait notre travail." },
              { q: "C'est quoi la Signature Émotionnelle ?", a: "Un test gratuit de 15 questions qui révèle votre schéma émotionnel dominant — celui qui pilote vos réactions sans que vous le sachiez. C'est le point de départ." },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="p-6 rounded-[20px] bg-[#0D1018] border border-[rgba(184,164,114,0.06)]">
                  <h3 className="text-[15px] font-medium text-[#F5F0E8] mb-3">{item.q}</h3>
                  <p className="text-[13px] text-[#9B9590] leading-[1.7] font-light">{item.a}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <section className="py-28 md:py-40 border-t border-[rgba(184,164,114,0.04)]">
        <div className="max-w-3xl mx-auto px-6 md:px-10 text-center">
          <Reveal>
            <h2 className="font-display text-[1.8rem] sm:text-[2.5rem] md:text-[3rem] font-light leading-[1.1] tracking-[-0.02em] mb-6">
              Vous m&eacute;ritez de comprendre<br />
              <span className="text-[#B8A472]">ce qui vous arrive.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-[15px] text-[#9B9590] leading-[1.7] font-light max-w-lg mx-auto mb-12">
              Commencez par d&eacute;couvrir votre Signature &Eacute;motionnelle.
              C&apos;est gratuit, &ccedil;a prend 5 minutes, et &ccedil;a change tout.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <Link href="/signature-emotionnelle"
              className="inline-flex px-10 py-4 rounded-full text-[14px] font-medium bg-[#B8A472] text-[#08090A] hover:bg-[#C4B080] hover:shadow-[0_0_40px_rgba(184,164,114,0.12)] transition-all duration-500 active:scale-[0.98]"
            >
              Faire mon test gratuit
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-16 border-t border-[rgba(184,164,114,0.04)]">
        <div className="max-w-5xl mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <img src="/images/logo-shine.png" alt="SOS Shine" className="h-10 mx-auto md:mx-0 mb-3 object-contain opacity-60" />
              <p className="text-[12px] text-[#6B6560]">
                La premi&egrave;re encyclop&eacute;die mondiale<br />du bien-&ecirc;tre &eacute;motionnel.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-[12px] text-[#6B6560]">
              <Link href="/mentions-legales" className="hover:text-[#9B9590] transition-colors">Mentions l&eacute;gales</Link>
              <Link href="/cgv" className="hover:text-[#9B9590] transition-colors">CGV</Link>
              <Link href="/confidentialite" className="hover:text-[#9B9590] transition-colors">Confidentialit&eacute;</Link>
              <Link href="/contact" className="hover:text-[#9B9590] transition-colors">Contact</Link>
            </div>
          </div>
          <p className="text-center text-[11px] text-[#3D3A36] mt-10">
            &copy; {new Date().getFullYear()} SOS Shine&reg;. Tous droits r&eacute;serv&eacute;s.
          </p>
        </div>
      </footer>
    </main>
  )
}
