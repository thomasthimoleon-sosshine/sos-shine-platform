'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'

const IMG = 'https://krdfvggmfswbohuevzlb.supabase.co/storage/v1/object/public/uploads'
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
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay, ease }} className={className}>
      {children}
    </motion.div>
  )
}

export default function LandingLight() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <main className="bg-[#FAF9F6] text-[#1A1916] overflow-hidden selection:bg-[#C4A86C]/20">

      {/* ═══ HEADER ═══ */}
      <header className="fixed top-0 left-0 right-0 z-50 py-5 md:py-6 bg-[#FAF9F6]/80 backdrop-blur-2xl border-b border-[#1A1916]/[0.04]">
        <div className="flex items-center justify-between max-w-7xl mx-auto px-6 md:px-10">
          <Link href="/">
            <img src="/images/logo-shine.png" alt="SOS Shine" className="h-10 md:h-12 w-auto object-contain" />
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/login" className="text-[13px] text-[#1A1916]/40 hover:text-[#1A1916] transition-colors duration-300">
              Connexion
            </Link>
            <Link href="/signup" className="hidden sm:inline-flex px-5 py-2.5 rounded-full text-[13px] font-medium bg-[#1A1916] text-[#FAF9F6] hover:bg-[#2A2926] transition-all duration-500">
              Rejoindre
            </Link>
          </nav>
        </div>
      </header>

      {/* ═══ HERO ═══ */}
      <motion.section ref={heroRef} className="min-h-[100vh] flex items-center pt-28 pb-20" style={{ opacity: heroOpacity }}>
        <div className="max-w-5xl mx-auto px-6 md:px-10 w-full text-center">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 1, ease }}
            className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase font-medium text-[#C4A86C] mb-8 md:mb-10"
          >
            D&eacute;conditionnement &eacute;motionnel
          </motion.p>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8, ease }}
            className="font-display font-light text-[2.2rem] sm:text-[3rem] md:text-[4rem] lg:text-[5rem] leading-[1.04] tracking-[-0.04em] mb-8 md:mb-10 text-[#1A1916]"
          >
            Et si ce qui te fait souffrir{' '}
            <em className="italic text-[#1A1916]/40">
              &eacute;tait exactement ce qui doit briller&nbsp;?
            </em>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.8, ease }}
            className="text-[15px] sm:text-[17px] text-[#1A1916]/45 leading-[1.7] max-w-xl mx-auto font-light mb-12"
          >
            SOS Shine d&eacute;code les sch&eacute;mas &eacute;motionnels qui pilotent ta vie
            et te donne les outils pour reprendre les commandes.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.8, ease }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/signature-emotionnelle"
              className="px-8 py-4 rounded-full text-[14px] font-medium bg-[#1A1916] text-[#FAF9F6] hover:bg-[#2A2926] transition-all duration-500 active:scale-[0.98] text-center"
            >
              D&eacute;couvrir ma Signature
            </Link>
            <Link href="/signature-emotionnelle"
              className="px-8 py-4 rounded-full text-[14px] font-light text-[#1A1916]/50 border border-[#1A1916]/10 hover:border-[#1A1916]/25 hover:text-[#1A1916] transition-all duration-500 text-center"
            >
              Découvrir mon protocole
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 0.6, ease }}
            className="flex items-center justify-center gap-6 mt-8 text-[11px] text-[#1A1916]/25"
          >
            <span>200+ protocoles</span>
            <span className="w-1 h-1 rounded-full bg-[#1A1916]/15" />
            <span>7 jours gratuits</span>
            <span className="w-1 h-1 rounded-full bg-[#1A1916]/15" />
            <span>Sans engagement</span>
          </motion.div>
        </div>
      </motion.section>

      {/* ═══ DOULEURS ═══ */}
      <section className="py-24 md:py-36 bg-[#1A1916] text-[#FAF9F6]">
        <div className="max-w-3xl mx-auto px-6 md:px-10 space-y-16 md:space-y-24">
          {[
            "Tu souris. À l'intérieur, tu hurles.",
            "Tu sais. Tu n'arrives pas à faire.",
            "Tu donnes. Personne ne voit que tu meurs.",
            "Tu contrôles. Parce que lâcher, c'est tomber.",
          ].map((pain, i) => (
            <Reveal key={i}>
              <p className="font-display text-[1.4rem] sm:text-[2rem] md:text-[2.5rem] font-light leading-[1.2] tracking-[-0.02em] italic text-center text-[#FAF9F6]/60">
                {pain}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ 3 ÉTAPES ═══ */}
      <section className="py-28 md:py-40">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <Reveal>
            <p className="text-[10px] tracking-[0.3em] uppercase font-medium text-[#1A1916]/25 mb-6 text-center">Le parcours</p>
            <h2 className="font-display text-[1.8rem] sm:text-[2.5rem] md:text-[3rem] font-light leading-[1.06] tracking-[-0.03em] text-center mb-20 md:mb-28 text-[#1A1916]">
              Tu ne te r&eacute;pareras pas. <em className="italic text-[#1A1916]/30">Tu te r&eacute;v&egrave;les.</em>
            </h2>
          </Reveal>

          {[
            { img: COMPREND, num: '01', title: 'Comprendre', desc: "Identifier le schéma inconscient qui pilote tes réactions. Pas de la théorie. Une lecture précise de ce qui se joue en toi.", color: '#7DD3FC', reverse: false },
            { img: LIBERER, num: '02', title: 'Libérer', desc: "Décharger l'émotion stockée dans le corps. Respiration ventrale, libération somatique. Ce qui doit sortir sort.", color: '#A78BFA', reverse: true },
            { img: AGIR, num: '03', title: 'Agir', desc: "Reprogrammer l'automatisme. Miroir, ancrage, rituel du matin. Chaque jour, un nouveau réflexe remplace l'ancien.", color: '#FBCFE8', reverse: false },
          ].map((step, i) => (
            <Reveal key={step.num}>
              <div className={`flex flex-col ${step.reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-10 md:gap-16 ${i < 2 ? 'mb-20 md:mb-28' : ''}`}>
                <div className="w-full md:w-1/2 aspect-[4/3] rounded-[24px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.1)]">
                  <img src={step.img} alt={step.title} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="w-full md:w-1/2">
                  <span className="block text-[11px] uppercase tracking-[0.3em] font-medium mb-4" style={{ color: step.color }}>{step.num}</span>
                  <h3 className="font-display text-[1.5rem] sm:text-[2rem] font-light tracking-[-0.02em] text-[#1A1916] mb-4 leading-[1.15]">{step.title}</h3>
                  <p className="text-[15px] text-[#1A1916]/45 leading-[1.8] font-light">{step.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ MOCKUP ═══ */}
      <section className="py-28 md:py-40 bg-[#F3F1EC]">
        <div className="max-w-5xl mx-auto px-6 md:px-10 text-center">
          <Reveal>
            <p className="text-[10px] tracking-[0.3em] uppercase font-medium text-[#1A1916]/25 mb-6">Ton sanctuaire digital</p>
            <h2 className="font-display text-[1.8rem] sm:text-[2.5rem] font-light leading-[1.1] tracking-[-0.02em] text-[#1A1916] mb-16">
              Une exp&eacute;rience pens&eacute;e pour ta transformation.
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="rounded-[24px] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.15)]">
              <img src={MOCKUP} alt="SOS Shine" className="w-full" loading="lazy" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ CE QUE TU REÇOIS ═══ */}
      <section className="py-28 md:py-40">
        <div className="max-w-5xl mx-auto px-6 md:px-10">
          <Reveal>
            <h2 className="font-display text-[1.8rem] sm:text-[2.5rem] font-light leading-[1.1] tracking-[-0.02em] text-center text-[#1A1916] mb-16 md:mb-20">
              Tout ce dont tu as besoin. <em className="italic text-[#1A1916]/30">Rien de superflu.</em>
            </h2>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: "L'Encyclopédie", desc: "200+ protocoles de déconditionnement classés par expérience de vie.", tag: '200+ sujets' },
              { title: 'Shine TV', desc: "Protocoles vidéo guidés par Julia. Comprendre, libérer, agir — en image.", tag: 'Vidéo' },
              { title: 'Shine Audible', desc: "Méditations, respirations, guidances audio. Accessible gratuitement.", tag: 'Gratuit' },
              { title: 'Shine Librairie', desc: "eBooks et guides écrits par Julia. Ta bibliothèque de transformation.", tag: 'eBooks' },
              { title: 'Communauté', desc: "Le Feu de Camp — un espace anonyme, bienveillant. Accessible gratuitement.", tag: 'Gratuit' },
              { title: 'Lives', desc: "Lives hebdomadaires avec Julia, soins collectifs mensuels.", tag: 'Chaque semaine' },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.06}>
                <div className="p-6 rounded-[20px] bg-[#F3F1EC] border border-[#1A1916]/[0.04] hover:border-[#1A1916]/[0.1] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-500 h-full group">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[15px] font-medium text-[#1A1916]">{item.title}</h3>
                    <span className="text-[10px] uppercase tracking-wider text-[#1A1916]/25 font-medium">{item.tag}</span>
                  </div>
                  <p className="text-[13px] text-[#1A1916]/40 leading-[1.7] font-light">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ JULIA ═══ */}
      <section className="py-28 md:py-40 bg-[#F3F1EC]">
        <div className="max-w-4xl mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
            <Reveal className="shrink-0">
              <div className="w-44 h-44 md:w-52 md:h-52 rounded-full overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
                <img src="/images/julia.jpeg" alt="Julia Laureau" className="w-full h-full object-cover" />
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <div>
                <p className="text-[10px] tracking-[0.3em] uppercase font-medium text-[#C4A86C] mb-3">Fondatrice</p>
                <h2 className="font-display text-[1.8rem] sm:text-[2.2rem] font-light leading-[1.15] text-[#1A1916] mb-5">Julia Laureau</h2>
                <p className="text-[15px] text-[#1A1916]/45 leading-[1.8] font-light mb-5">
                  Auteure du livre &laquo;&nbsp;Le D&eacute;conditionnement&nbsp;&raquo;. Elle accompagne depuis des ann&eacute;es
                  des personnes qui r&eacute;p&egrave;tent les m&ecirc;mes sch&eacute;mas sans comprendre pourquoi.
                </p>
                <p className="text-[14px] text-[#C4A86C] font-light italic">
                  &laquo;&nbsp;On ne comprend vraiment quelqu&apos;un que quand on est pass&eacute; par l&agrave;.&nbsp;&raquo;
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ COMMUNAUTÉ ═══ */}
      <section className="py-28 md:py-40">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
            <Reveal className="w-full md:w-3/5">
              <div className="aspect-[16/10] rounded-[24px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.1)]">
                <img src={COMMUNTE} alt="Communauté" className="w-full h-full object-cover" loading="lazy" />
              </div>
            </Reveal>
            <Reveal delay={0.15} className="w-full md:w-2/5">
              <p className="text-[10px] tracking-[0.3em] uppercase font-medium text-[#1A1916]/25 mb-3">Le Feu de Camp</p>
              <h2 className="font-display text-[1.8rem] sm:text-[2.2rem] font-light leading-[1.15] text-[#1A1916] mb-5">
                Tu n&apos;es plus seul(e).
              </h2>
              <p className="text-[15px] text-[#1A1916]/45 leading-[1.8] font-light mb-6">
                Un espace anonyme, bienveillant, sans jugement. Des personnes qui traversent les m&ecirc;mes sch&eacute;mas que toi.
              </p>
              <Link href="/signup" className="inline-flex px-6 py-3 rounded-full text-[13px] font-medium bg-[#1A1916] text-[#FAF9F6] hover:bg-[#2A2926] transition-all duration-500">
                Rejoindre gratuitement
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section className="py-28 md:py-40 bg-[#1A1916] text-[#FAF9F6]">
        <div className="max-w-4xl mx-auto px-6 md:px-10">
          <Reveal>
            <h2 className="font-display text-[1.8rem] sm:text-[2.5rem] font-light leading-[1.1] tracking-[-0.02em] text-center mb-16">
              Un prix. Tout inclus.
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { name: 'Gratuit', price: '0', period: '€', sub: 'Pour toujours', features: ['Test Signature Émotionnelle', 'Shine Audible complet', 'Communauté & Feu de Camp', 'Encyclopédie (aperçu)'], cta: 'Créer mon compte', href: '/signup', primary: false },
              { name: 'Essentielle', price: '9,90', period: '€/mois', sub: 'Accès immédiat', features: ['Tout le gratuit inclus', 'Encyclopédie complète', 'Shine TV — Vidéos guidées', 'Shine Librairie', 'Lives hebdomadaires'], cta: 'Choisir Essentielle', href: '/rejoindre', primary: false },
              { name: 'Sérénité', price: '29,90', period: '€/mois', sub: '7 jours GRATUIT · SHINE2026', features: ['Tout Essentielle inclus', 'Sessions groupe avec Julia', 'Soins collectifs mensuels', 'Parcours personnalisé', 'Support prioritaire'], cta: 'Essayer 7 jours gratuit', href: '/rejoindre', primary: true },
            ].map((plan, i) => (
              <Reveal key={plan.name} delay={i * 0.1}>
                <div className={`p-7 rounded-[24px] h-full flex flex-col justify-between ${plan.primary ? 'bg-[#FAF9F6]/[0.06] border border-[#FAF9F6]/[0.1]' : 'bg-[#FAF9F6]/[0.02] border border-[#FAF9F6]/[0.04]'}`}>
                  <div>
                    <p className={`text-[11px] tracking-[0.2em] uppercase mb-4 text-center ${plan.primary ? 'text-[#D4AF7F]' : 'text-[#FAF9F6]/40'}`}>{plan.name}</p>
                    <div className="flex items-baseline justify-center gap-1 mb-1">
                      <span className="font-display text-[2.2rem] font-light text-[#FAF9F6]">{plan.price}</span>
                      <span className="text-[14px] text-[#FAF9F6]/30">{plan.period}</span>
                    </div>
                    <p className={`text-[11px] text-center mb-7 ${plan.primary ? 'text-[#D4AF7F]' : 'text-[#FAF9F6]/25'}`}>{plan.sub}</p>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-start gap-3 text-[13px] text-[#FAF9F6]/45 font-light">
                          <span className="text-[#D4AF7F] mt-0.5 shrink-0 text-[11px]">&#10003;</span>{f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link href={plan.href}
                    className={`block w-full py-3.5 rounded-full text-[13px] font-medium text-center transition-all duration-500 ${plan.primary ? 'bg-[#FAF9F6] text-[#1A1916] hover:bg-[#D4AF7F]' : 'border border-[#FAF9F6]/10 text-[#FAF9F6]/50 hover:border-[#FAF9F6]/25 hover:text-[#FAF9F6]'}`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.3}>
            <p className="text-center text-[12px] text-[#FAF9F6]/15 mt-8">Sans engagement &middot; Annulable &agrave; tout instant</p>
          </Reveal>
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <section className="py-28 md:py-40">
        <div className="max-w-3xl mx-auto px-6 md:px-10 text-center">
          <Reveal>
            <h2 className="font-display text-[1.8rem] sm:text-[2.5rem] md:text-[3rem] font-light leading-[1.1] tracking-[-0.02em] text-[#1A1916] mb-6">
              Tu m&eacute;rites de comprendre <em className="italic text-[#1A1916]/30">ce qui t&apos;arrive.</em>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-[15px] text-[#1A1916]/40 leading-[1.7] font-light max-w-lg mx-auto mb-12">
              Commence par d&eacute;couvrir ta Signature &Eacute;motionnelle. Gratuit. 5 minutes.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <Link href="/signature-emotionnelle"
              className="inline-flex px-10 py-4 rounded-full text-[14px] font-medium bg-[#1A1916] text-[#FAF9F6] hover:bg-[#2A2926] transition-all duration-500 active:scale-[0.98]"
            >
              Faire mon test gratuit
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-16 border-t border-[#1A1916]/[0.06]">
        <div className="max-w-5xl mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <img src="/images/logo-shine.png" alt="SOS Shine" className="h-9 mx-auto md:mx-0 mb-3 object-contain opacity-40" />
              <p className="text-[12px] text-[#1A1916]/25">La premi&egrave;re encyclop&eacute;die mondiale du bien-&ecirc;tre &eacute;motionnel.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-[12px] text-[#1A1916]/25">
              <Link href="/mentions-legales" className="hover:text-[#1A1916]/50 transition-colors">Mentions l&eacute;gales</Link>
              <Link href="/cgv" className="hover:text-[#1A1916]/50 transition-colors">CGV</Link>
              <Link href="/confidentialite" className="hover:text-[#1A1916]/50 transition-colors">Confidentialit&eacute;</Link>
              <Link href="/contact" className="hover:text-[#1A1916]/50 transition-colors">Contact</Link>
            </div>
          </div>
          <p className="text-center text-[10px] text-[#1A1916]/10 mt-10">&copy; {new Date().getFullYear()} SOS Shine&reg;</p>
        </div>
      </footer>
    </main>
  )
}
