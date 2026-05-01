'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'

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
            <span className="mx-6 text-[#3D3A36]">·</span>
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
      <header className="fixed top-0 left-0 right-0 z-50 py-5 md:py-6 transition-all duration-700">
        <div className="flex items-center justify-between max-w-7xl mx-auto px-6 md:px-10">
          <Link href="/">
            <img src="/images/logo-shine.png" alt="SOS Shine" className="h-12 md:h-14 w-auto object-contain" />
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

      {/* ═══ HERO ═══ */}
      <motion.section ref={heroRef} className="relative min-h-[100vh] flex items-center pt-28 pb-20" style={{ opacity: heroOpacity }}>
        {/* Ambient */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(ellipse, rgba(15,22,36,0.8) 0%, transparent 70%)' }} />
          <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[400px] h-[300px] rounded-full opacity-[0.03]"
            style={{ background: 'radial-gradient(circle, #B8A472 0%, transparent 60%)' }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-10 w-full text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.3, ease }}
            className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase font-medium text-[#9B9590] mb-10 md:mb-12"
          >
            Plateforme de d&eacute;conditionnement &eacute;motionnel
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease }}
            className="font-display font-light text-[2.2rem] sm:text-[3rem] md:text-[3.8rem] lg:text-[4.5rem] leading-[1.06] tracking-[-0.02em] mb-10 md:mb-14"
          >
            Ce que vous vivez<br />
            a une explication.<br />
            <span className="text-[#B8A472]">Et une sortie.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease }}
            className="text-[15px] sm:text-[17px] text-[#9B9590] leading-[1.7] max-w-xl mx-auto font-light mb-14 md:mb-16"
          >
            SOS Shine d&eacute;code les sch&eacute;mas &eacute;motionnels qui pilotent votre vie
            et vous donne les outils pour reprendre les commandes.
            Pas du bien-&ecirc;tre. De la transformation r&eacute;elle.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1, ease }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/signature-emotionnelle"
              className="w-full sm:w-auto px-8 sm:px-10 py-4 rounded-full text-[14px] font-medium bg-[#B8A472] text-[#08090A] transition-all duration-500 hover:bg-[#C4B080] hover:shadow-[0_0_40px_rgba(184,164,114,0.12)] active:scale-[0.98] text-center"
            >
              D&eacute;couvrir ma Signature &Eacute;motionnelle
            </Link>
            <Link href="/encyclopedie"
              className="w-full sm:w-auto px-8 py-4 rounded-full text-[14px] font-light text-[#9B9590] border border-[rgba(184,164,114,0.12)] hover:border-[rgba(184,164,114,0.25)] hover:text-[#F5F0E8] transition-all duration-500 text-center"
            >
              D&eacute;couvrir les protocoles
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.5, ease }}
            className="flex items-center justify-center gap-6 mt-8 text-[11px] text-[#6B6560]"
          >
            <span>200+ protocoles</span>
            <span className="w-1 h-1 rounded-full bg-[#3D3A36]" />
            <span>7 jours gratuits</span>
            <span className="w-1 h-1 rounded-full bg-[#3D3A36]" />
            <span>Sans engagement</span>
          </motion.div>
        </div>
      </motion.section>

      {/* ═══ TICKER ═══ */}
      <TickerBand items={[
        'D&eacute;conditionnement &eacute;motionnel',
        'Protocoles guid&eacute;s',
        'Communaut&eacute; bienveillante',
        'Shine TV',
        'Shine Audible',
        'Encyclop&eacute;die 200+ sujets',
        'Lives hebdomadaires',
      ]} />

      {/* ═══ PROBLÈME ═══ */}
      <section className="py-24 md:py-36">
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
              Ce sont des sch&eacute;mas. Construits dans l&apos;enfance,
              renforc&eacute;s par vos exp&eacute;riences, r&eacute;p&eacute;t&eacute;s &agrave; votre insu.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="text-[17px] text-[#F5F0E8] font-light mt-10">
              Quand vous comprenez votre sch&eacute;ma, vous arr&ecirc;tez de le subir.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ 3 ÉTAPES ═══ */}
      <section className="py-24 md:py-36 border-t border-[rgba(184,164,114,0.04)]">
        <div className="max-w-5xl mx-auto px-6 md:px-10">
          <Reveal>
            <p className="text-[10px] tracking-[0.3em] uppercase font-medium text-[#6B6560] mb-8 text-center">
              Le parcours
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display text-[1.8rem] sm:text-[2.5rem] font-light leading-[1.1] tracking-[-0.02em] text-center mb-16 md:mb-20">
              Trois &eacute;tapes.<br />Un nouveau d&eacute;part.
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {[
              { num: '01', title: 'Comprendre', desc: 'Mettre des mots sur ce qui vous détruit en silence. Identifier le schéma qui se répète.' },
              { num: '02', title: 'Libérer', desc: 'Une crise à 2h du matin ? Une libération physique et émotionnelle immédiate, guidée pas à pas.' },
              { num: '03', title: 'Agir', desc: 'Reprogrammer vos automatismes en nouveaux réflexes. Des protocoles concrets, pas de la théorie.' },
            ].map((step, i) => (
              <Reveal key={step.num} delay={i * 0.15}>
                <div className="text-center md:text-left">
                  <span className="font-display text-[3rem] md:text-[4rem] font-light text-[rgba(184,164,114,0.12)] leading-none block mb-4">
                    {step.num}
                  </span>
                  <h3 className="text-[18px] font-medium text-[#F5F0E8] mb-3 tracking-wide">
                    {step.title}
                  </h3>
                  <p className="text-[14px] text-[#9B9590] leading-[1.7] font-light">
                    {step.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CE QUE VOUS RECEVEZ ═══ */}
      <section className="py-24 md:py-36 border-t border-[rgba(184,164,114,0.04)]">
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
              { icon: '📖', title: 'L’Encyclopédie', desc: '200+ protocoles de déconditionnement classés par expérience de vie. De A à Z.' },
              { icon: '🎬', title: 'Shine TV', desc: 'Protocoles vidéo guidés par Julia. Comprendre, libérer, agir — en image.' },
              { icon: '🎧', title: 'Shine Audible', desc: 'Méditations, respirations, guidances audio. Pour les moments où vous avez juste besoin d’écouter.' },
              { icon: '📚', title: 'Shine Librairie', desc: 'eBooks et guides écrits par Julia. Votre bibliothèque de transformation.' },
              { icon: '🔥', title: 'Communauté', desc: 'Le Feu de Camp — un espace anonyme, bienveillant, sans jugement. Vous n’êtes plus seul(e).' },
              { icon: '📅', title: 'Événements live', desc: 'Lives hebdomadaires avec Julia, soins collectifs mensuels, ateliers thématiques.' },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.08}>
                <div className="p-6 rounded-[20px] bg-[#0D1018] border border-[rgba(184,164,114,0.06)] hover:border-[rgba(184,164,114,0.15)] transition-all duration-500 h-full">
                  <span className="text-2xl block mb-4">{item.icon}</span>
                  <h3 className="text-[15px] font-medium text-[#F5F0E8] mb-2">{item.title}</h3>
                  <p className="text-[13px] text-[#9B9590] leading-[1.7] font-light">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ JULIA ═══ */}
      <section className="py-24 md:py-36 border-t border-[rgba(184,164,114,0.04)]">
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
      <section className="py-24 md:py-36">
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
            {/* Essentielle */}
            <Reveal delay={0.15}>
              <div className="p-8 rounded-[24px] bg-[#0D1018] border border-[rgba(184,164,114,0.06)] text-center">
                <p className="text-[11px] tracking-[0.2em] uppercase text-[#9B9590] mb-4">Essentielle</p>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="font-display text-[2.5rem] font-light text-[#F5F0E8]">9,90</span>
                  <span className="text-[15px] text-[#6B6560]">&euro;/mois</span>
                </div>
                <p className="text-[12px] text-[#6B6560] mb-8">Acc&egrave;s imm&eacute;diat</p>
                <Link href="/rejoindre"
                  className="block w-full py-3.5 rounded-full text-[13px] font-medium border border-[rgba(184,164,114,0.15)] text-[#9B9590] hover:border-[rgba(184,164,114,0.3)] hover:text-[#F5F0E8] transition-all duration-500"
                >
                  Choisir Essentielle
                </Link>
              </div>
            </Reveal>

            {/* Sérénité */}
            <Reveal delay={0.25}>
              <div className="p-8 rounded-[24px] bg-[#0D1018] border border-[rgba(184,164,114,0.15)] text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-[linear-gradient(90deg,transparent,rgba(184,164,114,0.3),transparent)]" />
                <p className="text-[11px] tracking-[0.2em] uppercase text-[#B8A472] mb-4">S&eacute;r&eacute;nit&eacute;</p>
                <div className="flex items-baseline justify-center gap-2 mb-1">
                  <span className="text-[16px] text-[#6B6560] line-through">49,90&euro;</span>
                  <span className="font-display text-[2.5rem] font-light text-[#F5F0E8]">29,90</span>
                  <span className="text-[15px] text-[#6B6560]">&euro;/mois</span>
                </div>
                <p className="text-[12px] text-[#B8A472] mb-8">7 jours d&apos;essai gratuit &middot; code SHINE2026</p>
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
      <section className="py-24 md:py-36 border-t border-[rgba(184,164,114,0.04)]">
        <div className="max-w-2xl mx-auto px-6 md:px-10">
          <Reveal>
            <h2 className="font-display text-[1.8rem] sm:text-[2.5rem] font-light leading-[1.1] text-center mb-16">
              Questions fr&eacute;quentes
            </h2>
          </Reveal>

          <div className="space-y-6">
            {[
              { q: 'Est-ce que SOS Shine remplace un thérapeute ?', a: 'Non. SOS Shine est un complément. Nous ne posons aucun diagnostic. Nous vous aidons à comprendre vos schémas et à agir dessus au quotidien.' },
              { q: 'Combien de temps faut-il pour voir des résultats ?', a: 'La plupart des membres rapportent un déclic dès les 2 premières semaines. Les transformations profondes prennent 2 à 3 mois de pratique régulière.' },
              { q: 'Je peux annuler quand je veux ?', a: 'Oui. Sans engagement, sans justification. Si on doit vous retenir par un contrat, c’est qu’on n’a pas fait notre travail.' },
              { q: 'C’est quoi la Signature Émotionnelle ?', a: 'Un test gratuit de 15 questions qui révèle votre schéma émotionnel dominant — celui qui pilote vos réactions sans que vous le sachiez. C’est le point de départ.' },
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
      <section className="py-24 md:py-36 border-t border-[rgba(184,164,114,0.04)]">
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
