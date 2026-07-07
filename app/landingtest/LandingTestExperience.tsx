'use client'

/**
 * Expérience landing SOS Shine — voyage émotionnel premium.
 * Palette claire (ivoire / beige / or doux / gris chaud / bleu léger).
 * Animations pensées comme une respiration. Respecte prefers-reduced-motion.
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useReducedMotion,
} from 'framer-motion'

const QUIZ_URL = '/signature-emotionnelle?start=1'

// Courbe d'easing "respiration" — très douce, jamais brutale.
const breathe = [0.16, 1, 0.3, 1] as [number, number, number, number]

// ── Palette locale ────────────────────────────────────────────────
const C = {
  bg: '#FAF8F3',
  ivory: '#F3ECE0',
  beige: '#EFE6D6',
  gold: '#C9A961',
  goldSoft: '#D8C69A',
  text: '#3A352E',
  textMuted: '#8A8175',
  blue: '#9FC1D9',
  blueSoft: '#C6DAE8',
}

/* ================================================================
   FOND VIBRATOIRE — ondes de fréquence sur canvas
   Lignes organiques, respiration lente, légère réaction souris.
   ================================================================ */
function WaveBackground({ tone = 'light' }: { tone?: 'light' | 'deep' }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const mouse = useRef({ x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 })
  const reduce = useReducedMotion()

  useEffect(() => {
    const cvs = canvasRef.current
    if (!cvs) return
    const ctx = cvs.getContext('2d')
    if (!ctx) return

    let raf = 0
    let w = 0
    let h = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    function resize() {
      w = window.innerWidth
      h = window.innerHeight
      cvs!.width = w * dpr
      cvs!.height = h * dpr
      cvs!.style.width = w + 'px'
      cvs!.style.height = h + 'px'
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const LINES = 7
    const base = tone === 'deep' ? '201,169,97' : '201,169,97'
    const accent = tone === 'deep' ? '159,193,217' : '159,193,217'

    function draw(t: number) {
      ctx!.clearRect(0, 0, w, h)
      // Easing doux du suivi souris
      mouse.current.x += (mouse.current.tx - mouse.current.x) * 0.04
      mouse.current.y += (mouse.current.ty - mouse.current.y) * 0.04
      const mx = mouse.current.x
      const my = mouse.current.y

      const time = t * 0.00016 // très lent

      for (let i = 0; i < LINES; i++) {
        const p = i / (LINES - 1)
        const yBase = h * (0.2 + p * 0.62) + (my - 0.5) * 28 * (p - 0.5)
        const amp = (26 + i * 9) * (0.7 + my * 0.5)
        const freq = 0.0016 + i * 0.00035
        const phase = time * (1 + i * 0.25) + i * 0.9 + mx * 1.2
        const useAccent = i % 3 === 2
        const rgb = useAccent ? accent : base
        const alpha = tone === 'deep' ? 0.14 : 0.09

        ctx!.beginPath()
        for (let x = -20; x <= w + 20; x += 14) {
          const y =
            yBase +
            Math.sin(x * freq + phase) * amp +
            Math.sin(x * freq * 0.5 + phase * 1.7) * amp * 0.35
          if (x === -20) ctx!.moveTo(x, y)
          else ctx!.lineTo(x, y)
        }
        const grad = ctx!.createLinearGradient(0, 0, w, 0)
        grad.addColorStop(0, `rgba(${rgb},0)`)
        grad.addColorStop(0.5, `rgba(${rgb},${alpha})`)
        grad.addColorStop(1, `rgba(${rgb},0)`)
        ctx!.strokeStyle = grad
        ctx!.lineWidth = 1.2
        ctx!.stroke()
      }

      raf = requestAnimationFrame(draw)
    }

    if (reduce) {
      // Rendu statique unique
      draw(0)
      cancelAnimationFrame(raf)
    } else {
      raf = requestAnimationFrame(draw)
    }

    function onMove(e: MouseEvent) {
      mouse.current.tx = e.clientX / window.innerWidth
      mouse.current.ty = e.clientY / window.innerHeight
    }
    window.addEventListener('mousemove', onMove)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
    }
  }, [tone, reduce])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}

/* ================================================================
   TITRE RÉVÉLÉ PAR UNE ONDE — les mots apparaissent en vague
   ================================================================ */
function WaveReveal({
  text,
  className,
  delay = 0,
  style,
}: {
  text: string
  className?: string
  delay?: number
  style?: React.CSSProperties
}) {
  const reduce = useReducedMotion()
  const words = text.split(' ')
  return (
    <span className={className} style={style} aria-label={text}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom" style={{ paddingBottom: '0.08em' }}>
          <motion.span
            className="inline-block"
            initial={reduce ? { opacity: 0 } : { y: '110%', opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { y: '0%', opacity: 1 }}
            transition={{ duration: 1.1, ease: breathe, delay: delay + i * 0.08 }}
          >
            {word}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </span>
  )
}

/* ================================================================
   BOUTON VIVANT — très légère pulsation
   ================================================================ */
function LivingButton({
  children,
  href,
  dark = false,
}: {
  children: React.ReactNode
  href: string
  dark?: boolean
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className="inline-block"
      animate={reduce ? {} : { scale: [1, 1.022, 1] }}
      transition={{ duration: 3.6, ease: 'easeInOut', repeat: Infinity }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
    >
      <Link
        href={href}
        className="inline-flex items-center gap-3 rounded-full px-9 py-4 text-[15px] font-medium tracking-wide transition-shadow"
        style={{
          background: dark
            ? 'linear-gradient(135deg, #C9A961, #B8974D)'
            : 'linear-gradient(135deg, #C9A961, #D8C69A)',
          color: dark ? '#211d16' : '#2A2620',
          boxShadow: '0 10px 40px -12px rgba(201,169,97,0.55)',
        }}
      >
        {children}
        <span aria-hidden>→</span>
      </Link>
    </motion.div>
  )
}

/* ================================================================
   HERO
   ================================================================ */
function Hero() {
  const reduce = useReducedMotion()
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6" style={{ zIndex: 1 }}>
      <div className="max-w-5xl mx-auto w-full grid md:grid-cols-[1fr_0.85fr] gap-12 md:gap-16 items-center py-28">
        {/* Texte */}
        <div className="order-2 md:order-1 text-center md:text-left">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.4, ease: breathe }}
            className="text-[11px] tracking-[0.32em] uppercase mb-8"
            style={{ color: C.gold }}
          >
            SOS Shine
          </motion.p>

          <h1
            className="font-display font-light leading-[1.12] mb-7"
            style={{ color: C.text, fontSize: 'clamp(1.9rem, 4.6vw, 3.4rem)' }}
          >
            <WaveReveal text="Tu n'es peut-être pas la personne que tu crois être." delay={0.2} />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.3, ease: breathe, delay: 1.5 }}
            className="font-light leading-relaxed mb-10 max-w-xl mx-auto md:mx-0"
            style={{ color: C.textMuted, fontSize: 'clamp(1rem, 1.6vw, 1.2rem)' }}
          >
            Tu es peut-être devenue la personne que ton cerveau a appris à protéger.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: breathe, delay: 2.3 }}
          >
            <LivingButton href={QUIZ_URL}>Découvrir ma Signature</LivingButton>
            <p className="mt-5 text-[12px]" style={{ color: C.textMuted }}>
              12 questions · 3 minutes · gratuit
            </p>
          </motion.div>
        </div>

        {/* Portrait */}
        <motion.div
          className="order-1 md:order-2 relative mx-auto"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, ease: breathe, delay: 0.3 }}
        >
          <motion.div
            animate={reduce ? {} : { y: [0, -10, 0] }}
            transition={{ duration: 7, ease: 'easeInOut', repeat: Infinity }}
            className="relative rounded-[28px] overflow-hidden"
            style={{
              width: 'min(78vw, 340px)',
              aspectRatio: '3 / 4',
              boxShadow: '0 40px 120px -40px rgba(120,100,60,0.4)',
              border: '1px solid rgba(201,169,97,0.25)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/julia.jpeg" alt="Julia" className="w-full h-full object-cover" />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(180deg, transparent 55%, rgba(250,248,243,0.25))' }}
            />
          </motion.div>
          {/* Halo respirant */}
          {!reduce && (
            <motion.div
              aria-hidden
              className="absolute -inset-8 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(201,169,97,0.16), transparent 65%)', zIndex: -1 }}
              animate={{ opacity: [0.5, 0.85, 0.5], scale: [1, 1.06, 1] }}
              transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity }}
            />
          )}
        </motion.div>
      </div>

      {/* Indice de scroll */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3, duration: 1.5 }}
      >
        <motion.div
          animate={reduce ? {} : { y: [0, 8, 0] }}
          transition={{ duration: 2.4, ease: 'easeInOut', repeat: Infinity }}
          className="w-[22px] h-[36px] rounded-full flex justify-center pt-2"
          style={{ border: `1px solid ${C.goldSoft}` }}
        >
          <div className="w-[3px] h-[7px] rounded-full" style={{ background: C.gold }} />
        </motion.div>
      </motion.div>
    </section>
  )
}

/* ================================================================
   SECTION IDENTIFICATION — une phrase à la fois, pilotée au scroll
   ================================================================ */
const IDENTIFY = [
  'Tu donnes toujours plus que les autres.',
  'Tu culpabilises facilement.',
  'Tu analyses tout.',
  'Tu cherches à sauver tout le monde.',
  'Tu veux être parfaite.',
  'Tu repousses parfois ceux que tu aimes.',
  "Tu fais semblant d'aller bien.",
  'Tu comprends énormément de choses…',
  '…mais rien ne change.',
]

function Identification() {
  const ref = useRef<HTMLDivElement | null>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [index, setIndex] = useState(0)

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const i = Math.min(IDENTIFY.length - 1, Math.max(0, Math.floor(v * IDENTIFY.length)))
    setIndex(i)
  })

  const last = index === IDENTIFY.length - 1

  return (
    <section ref={ref} style={{ height: `${IDENTIFY.length * 100}vh`, position: 'relative', zIndex: 1 }}>
      <div className="sticky top-0 h-screen flex items-center justify-center px-6 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 26, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -26, filter: 'blur(8px)' }}
            transition={{ duration: 0.8, ease: breathe }}
            className="font-display font-light text-center max-w-4xl leading-[1.15]"
            style={{
              color: last ? C.gold : C.text,
              fontSize: 'clamp(1.8rem, 5.2vw, 4rem)',
            }}
          >
            {IDENTIFY[index]}
          </motion.p>
        </AnimatePresence>
      </div>
    </section>
  )
}

/* ================================================================
   TRANSFORMATION DES PHRASES — morph "eau / sable / vibration"
   ================================================================ */
const MORPH = [
  'Je dois être parfaite.',
  'Je dois être aimée.',
  'Je dois être utile.',
  'Je dois être forte.',
  'Je dois tout contrôler.',
  'Je ne suis jamais assez.',
]

function MorphPhrases() {
  const [i, setI] = useState(0)
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement | null>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => setActive(e.isIntersecting),
      { threshold: 0.5 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setI((p) => (p + 1) % MORPH.length), 2600)
    return () => clearInterval(id)
  }, [active])

  return (
    <section ref={ref} className="relative py-40 px-6" style={{ zIndex: 1 }}>
      <div className="max-w-4xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
          className="text-[11px] tracking-[0.3em] uppercase mb-14"
          style={{ color: C.gold }}
        >
          La phrase qui te dirige sans que tu le saches
        </motion.p>

        <div className="h-[1.4em] flex items-center justify-center" style={{ minHeight: 'clamp(2.4rem, 7vw, 5rem)' }}>
          <AnimatePresence mode="wait">
            <motion.span
              key={i}
              initial={reduce ? { opacity: 0 } : { opacity: 0, filter: 'blur(14px)', letterSpacing: '0.2em', scale: 0.98 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, filter: 'blur(0px)', letterSpacing: '0em', scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, filter: 'blur(14px)', letterSpacing: '0.2em', scale: 1.02 }}
              transition={{ duration: 0.9, ease: breathe }}
              className="font-display font-light"
              style={{ color: C.text, fontSize: 'clamp(1.9rem, 6vw, 4.2rem)' }}
            >
              {MORPH[i]}
            </motion.span>
          </AnimatePresence>
        </div>

        <div className="flex justify-center gap-2 mt-14">
          {MORPH.map((_, k) => (
            <span
              key={k}
              className="h-[3px] rounded-full transition-all duration-500"
              style={{
                width: k === i ? 26 : 8,
                background: k === i ? C.gold : C.goldSoft,
                opacity: k === i ? 1 : 0.4,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ================================================================
   MOMENT WOW — fond plus sombre, immense onde, soulagement
   ================================================================ */
function MomentWow() {
  const ref = useRef<HTMLDivElement | null>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const dark = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [0, 1, 1, 0])
  const bg = useTransform(dark, (d) => `rgba(24,22,18,${d * 0.94})`)
  const textColor = useTransform(dark, (d) => (d > 0.5 ? '#F3ECE0' : '#3A352E'))

  return (
    <section ref={ref} className="relative py-48 px-6 overflow-hidden" style={{ zIndex: 2 }}>
      <motion.div className="absolute inset-0" style={{ background: bg }} aria-hidden />
      {/* Onde immense */}
      <motion.svg
        className="absolute left-0 w-full"
        style={{ top: '50%', height: 400, opacity: dark }}
        viewBox="0 0 1200 400"
        preserveAspectRatio="none"
        aria-hidden
      >
        <motion.path
          d="M0 200 Q 300 80 600 200 T 1200 200"
          fill="none"
          stroke="rgba(201,169,97,0.5)"
          strokeWidth="1.5"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 3, ease: breathe }}
        />
        <motion.path
          d="M0 200 Q 300 320 600 200 T 1200 200"
          fill="none"
          stroke="rgba(159,193,217,0.4)"
          strokeWidth="1.5"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 3, ease: breathe, delay: 0.3 }}
        />
      </motion.svg>

      <div className="relative max-w-3xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.3, ease: breathe }}
          className="font-display font-light leading-[1.25]"
          style={{ color: textColor as unknown as string, fontSize: 'clamp(1.7rem, 4.4vw, 3.2rem)' }}
        >
          Depuis toujours…
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: breathe, delay: 0.9 }}
          className="font-display font-light leading-[1.25] mt-4"
          style={{ color: C.gold, fontSize: 'clamp(1.7rem, 4.4vw, 3.2rem)' }}
        >
          …ton cerveau essaie simplement de te protéger.
        </motion.p>
      </div>
    </section>
  )
}

/* ================================================================
   EXPLICATION — chaîne reliée par des lignes organiques
   ================================================================ */
const CHAIN = [
  'Naissance',
  'Conditionnements',
  'Stratégies de protection',
  'Phrase inconsciente',
  'Pensées',
  'Émotions',
  'Décisions',
  'Vie actuelle',
]

function Explication() {
  return (
    <section className="relative py-40 px-6" style={{ zIndex: 1 }}>
      <div className="max-w-2xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: breathe }}
          className="font-display font-light text-center mb-20"
          style={{ color: C.text, fontSize: 'clamp(1.6rem, 3.6vw, 2.6rem)' }}
        >
          Comment une seule phrase a façonné toute ta vie
        </motion.h2>

        <div className="relative">
          {CHAIN.map((step, i) => (
            <div key={step} className="relative flex items-center gap-6 pb-14 last:pb-0">
              {/* Ligne organique verticale */}
              {i < CHAIN.length - 1 && (
                <svg className="absolute left-[15px] top-8" width="2" height="88" aria-hidden>
                  <motion.line
                    x1="1" y1="0" x2="1" y2="88"
                    stroke={C.goldSoft}
                    strokeWidth="1.5"
                    strokeDasharray="1 5"
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.06 }}
                  />
                </svg>
              )}
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: breathe, delay: i * 0.08 }}
                className="relative z-10 shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-medium"
                style={{
                  background: i === CHAIN.length - 1 ? C.gold : C.ivory,
                  color: i === CHAIN.length - 1 ? '#fff' : C.gold,
                  border: `1px solid ${C.goldSoft}`,
                }}
              >
                {i + 1}
              </motion.span>
              <motion.p
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: breathe, delay: i * 0.08 + 0.05 }}
                className="font-display"
                style={{
                  color: i === CHAIN.length - 1 ? C.gold : C.text,
                  fontSize: 'clamp(1.1rem, 2.4vw, 1.5rem)',
                  fontWeight: i === CHAIN.length - 1 ? 500 : 300,
                }}
              >
                {step}
              </motion.p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ================================================================
   RÉSULTATS — cartes Signature premium avec onde lumineuse au survol
   ================================================================ */
const SIGNATURES = [
  { name: 'La Protectrice', word: 'Je dois être forte.', color: '#C9A961', bg: 'linear-gradient(160deg,#F3ECE0,#EAD9B8)' },
  { name: "L'Indispensable", word: 'Je dois être utile.', color: '#9FC1D9', bg: 'linear-gradient(160deg,#EEF3F6,#CFE0EC)' },
  { name: 'La Parfaite', word: 'Je dois tout réussir.', color: '#C4A0B8', bg: 'linear-gradient(160deg,#F4EDF1,#E4CEDD)' },
  { name: "L'Aimante", word: 'Je dois être choisie.', color: '#D8A177', bg: 'linear-gradient(160deg,#F5EAE1,#EDD2BC)' },
  { name: 'La Discrète', word: 'Je ne dois pas déranger.', color: '#A7B79C', bg: 'linear-gradient(160deg,#EEF2E9,#D4E0C8)' },
  { name: 'La Libre', word: 'Je ne dois dépendre de personne.', color: '#B0A8C9', bg: 'linear-gradient(160deg,#F0EEF5,#D6CFE6)' },
]

function SignatureCard({ s, i }: { s: (typeof SIGNATURES)[number]; i: number }) {
  const [hover, setHover] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.9, ease: breathe, delay: (i % 3) * 0.1 }}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      whileHover={{ y: -6 }}
      className="relative rounded-[22px] p-7 overflow-hidden cursor-default"
      style={{ background: s.bg, border: '1px solid rgba(201,169,97,0.18)', minHeight: 190 }}
    >
      {/* Onde lumineuse traversante */}
      <AnimatePresence>
        {hover && (
          <motion.div
            aria-hidden
            className="absolute inset-y-0 w-1/2 pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)' }}
            initial={{ x: '-120%' }}
            animate={{ x: '240%' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: breathe }}
          />
        )}
      </AnimatePresence>

      <span
        className="inline-block w-9 h-9 rounded-full mb-5"
        style={{ background: s.color, boxShadow: `0 8px 24px -8px ${s.color}` }}
      />
      <h3 className="font-display text-xl mb-2" style={{ color: C.text }}>{s.name}</h3>
      <p className="text-sm italic font-light" style={{ color: C.textMuted }}>{s.word}</p>
    </motion.div>
  )
}

function Resultats() {
  return (
    <section className="relative py-40 px-6" style={{ zIndex: 1 }}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: breathe }}
          className="text-center mb-16"
        >
          <p className="text-[11px] tracking-[0.3em] uppercase mb-5" style={{ color: C.gold }}>
            Les Signatures Émotionnelles
          </p>
          <h2 className="font-display font-light" style={{ color: C.text, fontSize: 'clamp(1.7rem, 4vw, 2.8rem)' }}>
            Laquelle est la tienne&nbsp;?
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {SIGNATURES.map((s, i) => (
            <SignatureCard key={s.name} s={s} i={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ================================================================
   JULIA — storytelling (une quête, jamais gourou)
   ================================================================ */
function JuliaStory() {
  const paragraphs = [
    "Julia n'a pas commencé avec une méthode. Elle a commencé avec une question : pourquoi répétons-nous les mêmes schémas, même quand nous comprenons tout&nbsp;?",
    "Pendant des années, elle a observé. Écouté. Accompagné des centaines de personnes, une à une. Elle a remarqué que derrière chaque blocage se cachait une même mécanique&nbsp;: une phrase apprise très tôt, pour se protéger.",
    "De cette observation patiente est né un modèle. Non pas une vérité absolue, mais une lecture. Une carte pour se comprendre — et enfin, se déposer.",
  ]
  return (
    <section className="relative py-40 px-6" style={{ zIndex: 1 }}>
      <div className="max-w-4xl mx-auto grid md:grid-cols-[0.7fr_1fr] gap-12 md:gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.3, ease: breathe }}
          className="rounded-[24px] overflow-hidden mx-auto"
          style={{ width: 'min(70vw, 280px)', aspectRatio: '4/5', border: '1px solid rgba(201,169,97,0.25)' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/julia.jpeg" alt="Julia" className="w-full h-full object-cover" />
        </motion.div>

        <div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-[11px] tracking-[0.3em] uppercase mb-6"
            style={{ color: C.gold }}
          >
            La quête de Julia
          </motion.p>
          {paragraphs.map((p, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: breathe, delay: i * 0.15 }}
              className="font-light leading-relaxed mb-5"
              style={{ color: C.textMuted, fontSize: 'clamp(0.98rem, 1.5vw, 1.1rem)' }}
              dangerouslySetInnerHTML={{ __html: p }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ================================================================
   TÉMOIGNAGES — avant / découverte / transformation
   ================================================================ */
const STORIES = [
  {
    name: 'Camille',
    before: "Je m'épuisais à rendre tout le monde heureux, sauf moi.",
    turn: "En découvrant ma Signature, j'ai enfin mis un mot sur ce réflexe.",
    after: "Aujourd'hui je sais dire non sans culpabiliser. Je respire.",
  },
  {
    name: 'Sarah',
    before: "Je croyais que je devais être parfaite pour être aimée.",
    turn: "Le protocole m'a montré d'où venait cette phrase.",
    after: "J'ose être imparfaite — et je me sens plus proche des autres.",
  },
  {
    name: 'Léa',
    before: "Je comprenais tout de moi, mais rien ne bougeait.",
    turn: "J'ai compris que comprendre ne suffit pas : il faut libérer.",
    after: "Pour la première fois, un changement a vraiment tenu.",
  },
]

function Temoignages() {
  return (
    <section className="relative py-40 px-6" style={{ zIndex: 1 }}>
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: breathe }}
          className="font-display font-light text-center mb-16"
          style={{ color: C.text, fontSize: 'clamp(1.7rem, 4vw, 2.8rem)' }}
        >
          Elles se sont reconnues
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-6">
          {STORIES.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.9, ease: breathe, delay: i * 0.12 }}
              whileHover={{ y: -5 }}
              className="rounded-[22px] p-7 flex flex-col gap-4"
              style={{
                background: '#FFFFFF',
                border: '1px solid rgba(201,169,97,0.16)',
                boxShadow: '0 20px 60px -30px rgba(120,100,60,0.28)',
              }}
            >
              <div className="flex items-center gap-3 mb-1">
                <span className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium"
                  style={{ background: C.ivory, color: C.gold }}>
                  {s.name.charAt(0)}
                </span>
                <span className="font-display text-lg" style={{ color: C.text }}>{s.name}</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: C.textMuted }}>
                <span style={{ color: C.gold, fontWeight: 500 }}>Avant · </span>{s.before}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: C.textMuted }}>
                <span style={{ color: C.gold, fontWeight: 500 }}>Le déclic · </span>{s.turn}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: C.text }}>
                <span style={{ color: C.gold, fontWeight: 500 }}>Aujourd'hui · </span>{s.after}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ================================================================
   FAQ — accordéon premium (respiration)
   ================================================================ */
const FAQ = [
  { q: "Qu'est-ce qu'une Signature Émotionnelle&nbsp;?", a: "C'est le schéma inconscient — souvent résumé par une phrase — que ton cerveau a construit très tôt pour te protéger, et qui pilote encore aujourd'hui tes réactions." },
  { q: "Le test est-il vraiment gratuit&nbsp;?", a: "Oui. Le quiz et la première étape de ton protocole recommandé sont entièrement gratuits, sans carte bancaire." },
  { q: "Combien de temps ça prend&nbsp;?", a: "Environ 3 minutes pour le test, puis un résultat immédiat et un protocole que tu avances à ton rythme." },
  { q: "Est-ce que c'est de la thérapie&nbsp;?", a: "Non. SOS Shine est un accompagnement de compréhension et de transformation de soi. Il ne remplace pas un suivi médical ou psychologique." },
]

function FaqItem({ item, i }: { item: (typeof FAQ)[number]; i: number }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: breathe, delay: i * 0.06 }}
      className="border-b"
      style={{ borderColor: 'rgba(201,169,97,0.2)' }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 py-6 text-left cursor-pointer"
      >
        <span className="font-display" style={{ color: C.text, fontSize: 'clamp(1.05rem, 2vw, 1.3rem)' }}
          dangerouslySetInnerHTML={{ __html: item.q }} />
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.4, ease: breathe }}
          className="shrink-0 text-2xl font-light leading-none"
          style={{ color: C.gold }}
        >
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.6, ease: breathe }}
            className="overflow-hidden"
          >
            <p className="pb-6 font-light leading-relaxed" style={{ color: C.textMuted, fontSize: '0.98rem' }}
              dangerouslySetInnerHTML={{ __html: item.a }} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function FaqSection() {
  return (
    <section className="relative py-40 px-6" style={{ zIndex: 1 }}>
      <div className="max-w-2xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: breathe }}
          className="font-display font-light text-center mb-14"
          style={{ color: C.text, fontSize: 'clamp(1.7rem, 4vw, 2.6rem)' }}
        >
          Questions fréquentes
        </motion.h2>
        {FAQ.map((item, i) => (
          <FaqItem key={i} item={item} i={i} />
        ))}
      </div>
    </section>
  )
}

/* ================================================================
   CTA FINAL — fond presque blanc, épuré
   ================================================================ */
function CtaFinal() {
  return (
    <section className="relative py-52 px-6" style={{ zIndex: 2, background: '#FDFCFA' }}>
      <div className="max-w-3xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.3, ease: breathe }}
          className="font-display font-light leading-[1.2] mb-4"
          style={{ color: C.text, fontSize: 'clamp(1.7rem, 4.4vw, 3rem)' }}
        >
          Et si cette phrase que tu cherches depuis des années était déjà en toi&nbsp;?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.5 }}
          className="font-display italic mb-12"
          style={{ color: C.gold, fontSize: 'clamp(1.3rem, 3vw, 2rem)' }}
        >
          Découvre-la.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: breathe, delay: 0.8 }}
        >
          <LivingButton href={QUIZ_URL} dark>Faire le test gratuit</LivingButton>
        </motion.div>
      </div>
    </section>
  )
}

/* ================================================================
   RACINE
   ================================================================ */
export default function LandingTestExperience() {
  // Scroll cinématique doux (lerp léger) — désactivé si reduced-motion
  const reduce = useReducedMotion()
  const smootherOn = !reduce

  const onWheelSmooth = useCallback(() => {}, [])

  useEffect(() => {
    document.documentElement.style.scrollBehavior = smootherOn ? 'smooth' : 'auto'
    return () => { document.documentElement.style.scrollBehavior = '' }
  }, [smootherOn])

  return (
    <main
      onWheel={onWheelSmooth}
      style={{ background: C.bg, color: C.text, position: 'relative', overflowX: 'hidden' }}
    >
      <WaveBackground />

      {/* Badge discret : page de test admin */}
      <div
        className="fixed top-3 left-1/2 -translate-x-1/2 z-50 px-3 py-1 rounded-full text-[10px] tracking-[0.2em] uppercase"
        style={{ background: 'rgba(201,169,97,0.12)', color: C.gold, border: '1px solid rgba(201,169,97,0.25)' }}
      >
        Aperçu admin · /landingtest
      </div>

      <Hero />
      <Identification />
      <MorphPhrases />
      <MomentWow />
      <Explication />
      <Resultats />
      <JuliaStory />
      <Temoignages />
      <FaqSection />
      <CtaFinal />

      <footer className="relative py-10 text-center" style={{ zIndex: 1 }}>
        <p className="text-[12px]" style={{ color: C.textMuted }}>
          © {new Date().getFullYear()} SOS Shine — Aperçu de refonte
        </p>
      </footer>
    </main>
  )
}
