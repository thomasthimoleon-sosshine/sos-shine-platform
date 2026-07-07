'use client'

/**
 * Expérience landing SOS Shine — voyage émotionnel premium.
 * Palette claire (ivoire / beige / or doux / gris chaud / bleu léger).
 * Animations pensées comme une respiration. Respecte prefers-reduced-motion.
 * Contenu réel : 10 Signatures Émotionnelles, histoire de Julia, témoignages, FAQ.
 */

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
  useReducedMotion,
} from 'framer-motion'

const QUIZ_URL = '/signature-emotionnelle?start=1'
const breathe = [0.16, 1, 0.3, 1] as [number, number, number, number]

const C = {
  bg: '#FAF8F3',
  ivory: '#F3ECE0',
  gold: '#C9A961',
  goldSoft: '#D8C69A',
  goldDeep: '#B8974D',
  text: '#3A352E',
  textMuted: '#8A8175',
  blue: '#9FC1D9',
}

/* ================================================================
   FOND VIBRATOIRE — ondes de fréquence (canvas), réaction souris
   ================================================================ */
function WaveBackground({ deep = false, absolute = false }: { deep?: boolean; absolute?: boolean }) {
  const ref = useRef<HTMLCanvasElement | null>(null)
  const mouse = useRef({ x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 })
  const reduce = useReducedMotion()

  useEffect(() => {
    const cvs = ref.current
    if (!cvs) return
    const ctx = cvs.getContext('2d')
    if (!ctx) return
    let raf = 0, w = 0, h = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    function size() {
      const r = cvs!.getBoundingClientRect()
      w = r.width || window.innerWidth
      h = r.height || window.innerHeight
      cvs!.width = w * dpr
      cvs!.height = h * dpr
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    size()
    window.addEventListener('resize', size)

    const LINES = deep ? 5 : 7
    function draw(t: number) {
      ctx!.clearRect(0, 0, w, h)
      mouse.current.x += (mouse.current.tx - mouse.current.x) * 0.04
      mouse.current.y += (mouse.current.ty - mouse.current.y) * 0.04
      const mx = mouse.current.x, my = mouse.current.y
      const time = t * 0.00016
      for (let i = 0; i < LINES; i++) {
        const p = i / (LINES - 1)
        const yBase = h * (0.18 + p * 0.66) + (my - 0.5) * 30 * (p - 0.5)
        const amp = (24 + i * 9) * (0.7 + my * 0.5)
        const freq = 0.0016 + i * 0.00035
        const phase = time * (1 + i * 0.25) + i * 0.9 + mx * 1.3
        const rgb = i % 3 === 2 ? '159,193,217' : '201,169,97'
        const alpha = deep ? 0.16 : 0.09
        ctx!.beginPath()
        for (let x = -20; x <= w + 20; x += 14) {
          const y = yBase + Math.sin(x * freq + phase) * amp + Math.sin(x * freq * 0.5 + phase * 1.7) * amp * 0.35
          if (x === -20) ctx!.moveTo(x, y); else ctx!.lineTo(x, y)
        }
        const g = ctx!.createLinearGradient(0, 0, w, 0)
        g.addColorStop(0, `rgba(${rgb},0)`)
        g.addColorStop(0.5, `rgba(${rgb},${alpha})`)
        g.addColorStop(1, `rgba(${rgb},0)`)
        ctx!.strokeStyle = g
        ctx!.lineWidth = 1.2
        ctx!.stroke()
      }
      raf = requestAnimationFrame(draw)
    }
    if (reduce) draw(0)
    else raf = requestAnimationFrame(draw)

    function onMove(e: MouseEvent) {
      mouse.current.tx = e.clientX / window.innerWidth
      mouse.current.ty = e.clientY / window.innerHeight
    }
    window.addEventListener('mousemove', onMove)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', size)
      window.removeEventListener('mousemove', onMove)
    }
  }, [deep, reduce])

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={absolute ? 'absolute inset-0 pointer-events-none' : 'fixed inset-0 pointer-events-none'}
      style={{ zIndex: 0 }}
    />
  )
}

/* ================================================================
   RÉVÉLATION LETTRE PAR LETTRE — comme une onde qui traverse
   ================================================================ */
function LetterWave({ text, delay = 0, style }: { text: string; delay?: number; style?: React.CSSProperties }) {
  const reduce = useReducedMotion()
  const chars = Array.from(text)
  return (
    <span aria-label={text} style={style}>
      {chars.map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="inline-block"
          style={{ whiteSpace: 'pre' }}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: '0.5em', filter: 'blur(6px)' }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: '0em', filter: 'blur(0px)' }}
          transition={{
            // onde : le délai suit une courbe, la vague balaie de gauche à droite
            duration: 0.9,
            ease: breathe,
            delay: delay + i * 0.03 + Math.sin((i / chars.length) * Math.PI) * 0.12,
          }}
        >
          {ch === ' ' ? ' ' : ch}
        </motion.span>
      ))}
    </span>
  )
}

/* ================================================================
   MORPH DE LETTRES — les lettres se dissolvent et se recomposent
   (comme de l'eau, du sable, une vibration)
   ================================================================ */
function LetterMorph({ text, color }: { text: string; color?: string }) {
  const reduce = useReducedMotion()
  const chars = Array.from(text)
  return (
    <span className="inline-block" style={{ color }}>
      <AnimatePresence mode="wait">
        <motion.span key={text} className="inline-block">
          {chars.map((ch, i) => {
            const dir = i % 2 === 0 ? 1 : -1
            return (
              <motion.span
                key={i}
                className="inline-block"
                style={{ whiteSpace: 'pre' }}
                initial={reduce ? { opacity: 0 } : { opacity: 0, filter: 'blur(12px)', y: dir * 16, scale: 0.94 }}
                animate={reduce ? { opacity: 1 } : { opacity: 1, filter: 'blur(0px)', y: 0, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, filter: 'blur(12px)', y: -dir * 16, scale: 1.04 }}
                transition={{ duration: 0.55, ease: breathe, delay: i * 0.02 }}
              >
                {ch === ' ' ? ' ' : ch}
              </motion.span>
            )
          })}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

/* ================================================================
   BOUTON VIVANT — légère pulsation
   ================================================================ */
function LivingButton({ children, href, dark = false }: { children: React.ReactNode; href: string; dark?: boolean }) {
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
        className="inline-flex items-center gap-3 rounded-full px-9 py-4 text-[15px] font-medium tracking-wide"
        style={{
          background: dark ? `linear-gradient(135deg, ${C.gold}, ${C.goldDeep})` : `linear-gradient(135deg, ${C.gold}, ${C.goldSoft})`,
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
  const [showSecond, setShowSecond] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setShowSecond(true), 2600)
    return () => clearTimeout(t)
  }, [])
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6" style={{ zIndex: 1 }}>
      <div className="max-w-5xl mx-auto w-full grid md:grid-cols-[1fr_0.82fr] gap-12 md:gap-16 items-center py-28">
        <div className="order-2 md:order-1 text-center md:text-left">
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 1.4, ease: breathe }}
            className="text-[11px] tracking-[0.32em] uppercase mb-8" style={{ color: C.gold }}
          >
            SOS Shine
          </motion.p>

          <h1 className="font-display font-light leading-[1.14] mb-6" style={{ color: C.text, fontSize: 'clamp(1.85rem, 4.4vw, 3.3rem)' }}>
            <LetterWave text="Tu n'es peut-être pas la personne que tu crois être." delay={0.3} />
          </h1>

          <div className="min-h-[3.4em] mb-9">
            <AnimatePresence>
              {showSecond && (
                <motion.p
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 1.4, ease: breathe }}
                  className="font-light leading-relaxed max-w-xl mx-auto md:mx-0"
                  style={{ color: C.textMuted, fontSize: 'clamp(1rem, 1.6vw, 1.2rem)' }}
                >
                  Tu es peut-être devenue la personne que ton cerveau a appris à protéger.
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease: breathe, delay: 3.4 }}>
            <LivingButton href={QUIZ_URL}>Découvrir ma Signature</LivingButton>
            <p className="mt-5 text-[12px]" style={{ color: C.textMuted }}>12 questions · 3 minutes · gratuit</p>
          </motion.div>
        </div>

        <motion.div
          className="order-1 md:order-2 relative mx-auto"
          initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, ease: breathe, delay: 0.3 }}
        >
          <motion.div
            animate={reduce ? {} : { y: [0, -10, 0] }}
            transition={{ duration: 7, ease: 'easeInOut', repeat: Infinity }}
            className="relative rounded-[28px] overflow-hidden"
            style={{
              width: 'min(78vw, 330px)', aspectRatio: '3 / 4',
              boxShadow: '0 40px 120px -40px rgba(120,100,60,0.4)', border: '1px solid rgba(201,169,97,0.25)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/julia.jpeg" alt="Julia, fondatrice de SOS Shine" className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 58%, rgba(250,248,243,0.22))' }} />
          </motion.div>
          {!reduce && (
            <motion.div
              aria-hidden className="absolute -inset-8 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(201,169,97,0.16), transparent 65%)', zIndex: -1 }}
              animate={{ opacity: [0.5, 0.85, 0.5], scale: [1, 1.06, 1] }}
              transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity }}
            />
          )}
        </motion.div>
      </div>

      <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 4, duration: 1.5 }}>
        <motion.div
          animate={reduce ? {} : { y: [0, 8, 0] }} transition={{ duration: 2.4, ease: 'easeInOut', repeat: Infinity }}
          className="w-[22px] h-[36px] rounded-full flex justify-center pt-2" style={{ border: `1px solid ${C.goldSoft}` }}
        >
          <div className="w-[3px] h-[7px] rounded-full" style={{ background: C.gold }} />
        </motion.div>
      </motion.div>
    </section>
  )
}

/* ================================================================
   IDENTIFICATION — une phrase à la fois (morph de lettres), au scroll
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
    setIndex(Math.min(IDENTIFY.length - 1, Math.max(0, Math.floor(v * IDENTIFY.length))))
  })
  const last = index === IDENTIFY.length - 1
  return (
    <section ref={ref} style={{ height: `${IDENTIFY.length * 100}vh`, position: 'relative', zIndex: 1 }}>
      <div className="sticky top-0 h-screen flex items-center justify-center px-6 overflow-hidden text-center">
        <h2 className="font-display font-light leading-[1.15] max-w-4xl" style={{ fontSize: 'clamp(1.7rem, 5vw, 3.8rem)' }}>
          <LetterMorph text={IDENTIFY[index]} color={last ? C.gold : C.text} />
        </h2>
      </div>
    </section>
  )
}

/* ================================================================
   TRANSFORMATION — animation signature (morph continu de lettres)
   ================================================================ */
const MORPH = [
  'Je dois être parfaite.',
  'Je dois être aimée.',
  'Je dois être utile.',
  'Je dois être forte.',
  'Je dois tout contrôler.',
  'Je ne suis jamais assez.',
]

function Transformation() {
  const [i, setI] = useState(0)
  const [active, setActive] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setI((p) => (p + 1) % MORPH.length), 2800)
    return () => clearInterval(id)
  }, [active])
  return (
    <section ref={ref} className="relative py-40 px-6" style={{ zIndex: 1 }}>
      <div className="max-w-4xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.2 }}
          className="text-[11px] tracking-[0.3em] uppercase mb-14" style={{ color: C.gold }}
        >
          La phrase qui te dirige sans que tu le saches
        </motion.p>
        <div className="flex items-center justify-center" style={{ minHeight: 'clamp(2.6rem, 8vw, 5rem)' }}>
          <span className="font-display font-light" style={{ fontSize: 'clamp(1.9rem, 6vw, 4.2rem)', color: C.text }}>
            <LetterMorph text={MORPH[i]} />
          </span>
        </div>
        <div className="flex justify-center gap-2 mt-14">
          {MORPH.map((_, k) => (
            <span key={k} className="h-[3px] rounded-full transition-all duration-500"
              style={{ width: k === i ? 26 : 8, background: k === i ? C.gold : C.goldSoft, opacity: k === i ? 1 : 0.4 }} />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ================================================================
   MOMENT WOW — fond sombre, immense onde, soulagement
   ================================================================ */
function MomentWow() {
  return (
    <section className="relative py-52 px-6 overflow-hidden" style={{ zIndex: 2, background: '#181612' }}>
      <WaveBackground deep absolute />
      <motion.svg
        className="absolute left-0 w-full" style={{ top: '50%', height: 360 }}
        viewBox="0 0 1200 360" preserveAspectRatio="none" aria-hidden
      >
        <motion.path d="M0 180 Q 300 60 600 180 T 1200 180" fill="none" stroke="rgba(201,169,97,0.5)" strokeWidth="1.5"
          initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 3, ease: breathe }} />
        <motion.path d="M0 180 Q 300 300 600 180 T 1200 180" fill="none" stroke="rgba(159,193,217,0.4)" strokeWidth="1.5"
          initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 3, ease: breathe, delay: 0.3 }} />
      </motion.svg>
      <div className="relative max-w-3xl mx-auto text-center" style={{ zIndex: 2 }}>
        <motion.p
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.3, ease: breathe }}
          className="font-display font-light leading-[1.25]" style={{ color: '#F3ECE0', fontSize: 'clamp(1.7rem, 4.4vw, 3.2rem)' }}
        >
          Depuis toujours…
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.4, ease: breathe, delay: 0.9 }}
          className="font-display font-light leading-[1.25] mt-4" style={{ color: C.gold, fontSize: 'clamp(1.7rem, 4.4vw, 3.2rem)' }}
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
const CHAIN = ['Naissance', 'Conditionnements', 'Stratégies de protection', 'Phrase inconsciente', 'Pensées', 'Émotions', 'Décisions', 'Vie actuelle']

function Explication() {
  return (
    <section className="relative py-40 px-6" style={{ zIndex: 1 }}>
      <div className="max-w-2xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: breathe }}
          className="font-display font-light text-center mb-20" style={{ color: C.text, fontSize: 'clamp(1.6rem, 3.6vw, 2.6rem)' }}
        >
          Comment une seule phrase a façonné toute ta vie
        </motion.h2>
        <div className="relative">
          {CHAIN.map((step, i) => {
            const isLast = i === CHAIN.length - 1
            return (
              <div key={step} className="relative flex items-center gap-6 pb-14 last:pb-0">
                {!isLast && (
                  <svg className="absolute left-[15px] top-8" width="2" height="88" aria-hidden>
                    <motion.line x1="1" y1="0" x2="1" y2="88" stroke={C.goldSoft} strokeWidth="1.5" strokeDasharray="1 5"
                      initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.06 }} />
                  </svg>
                )}
                <motion.span
                  initial={{ scale: 0, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: breathe, delay: i * 0.08 }}
                  className="relative z-10 shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-medium"
                  style={{ background: isLast ? C.gold : C.ivory, color: isLast ? '#fff' : C.gold, border: `1px solid ${C.goldSoft}` }}
                >
                  {i + 1}
                </motion.span>
                <motion.p
                  initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: breathe, delay: i * 0.08 + 0.05 }}
                  className="font-display" style={{ color: isLast ? C.gold : C.text, fontSize: 'clamp(1.1rem, 2.4vw, 1.5rem)', fontWeight: isLast ? 500 : 300 }}
                >
                  {step}
                </motion.p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ================================================================
   RÉSULTATS — les 10 vraies Signatures Émotionnelles
   ================================================================ */
const SIGNATURES = [
  { name: "L'Analyste", sub: "L'Architecture Mentale", icon: '🧠', color: '#74C0FC', bg: 'linear-gradient(160deg,#EEF4FA,#D5E6F5)' },
  { name: "L'Électron Libre", sub: "L'Architecture en Mouvement", icon: '⚡', color: '#FF8C42', bg: 'linear-gradient(160deg,#FBEFE6,#F6D9BF)' },
  { name: 'Le Pilier', sub: "L'Architecture Symbiotique", icon: '💗', color: '#E879A8', bg: 'linear-gradient(160deg,#FAEDF3,#F1CFDF)' },
  { name: 'La Citadelle', sub: "L'Architecture Citadelle", icon: '🏰', color: '#8B9DC3', bg: 'linear-gradient(160deg,#EEF0F6,#D2D9E8)' },
  { name: 'Le Gardien du Cadre', sub: "L'Architecture du Contrôle", icon: '🛡️', color: '#A3BE8C', bg: 'linear-gradient(160deg,#EFF3E9,#D5E2C6)' },
  { name: 'Le Caméléon', sub: "L'Architecture Adaptative", icon: '🦎', color: '#C4A0E8', bg: 'linear-gradient(160deg,#F2ECFA,#DEC9F0)' },
  { name: 'La Vigie', sub: "L'Architecture d'Anticipation", icon: '🔭', color: '#E5B93D', bg: 'linear-gradient(160deg,#FAF3DE,#F0E1B0)' },
  { name: "L'Idéaliste", sub: "L'Architecture des Profondeurs", icon: '✨', color: '#FF6B9D', bg: 'linear-gradient(160deg,#FBEBF1,#F6CCDC)' },
  { name: 'Le Diplomate', sub: "L'Architecture de l'Harmonie", icon: '🕊️', color: '#88D8B0', bg: 'linear-gradient(160deg,#EAF6EF,#CDE9DA)' },
  { name: 'Le Catalyseur', sub: "L'Architecture de l'Intensité", icon: '🔥', color: '#FF5E5B', bg: 'linear-gradient(160deg,#FBEAEA,#F6C9C8)' },
]

function SignatureCard({ s, i }: { s: (typeof SIGNATURES)[number]; i: number }) {
  const [hover, setHover] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.9, ease: breathe, delay: (i % 3) * 0.08 }}
      onHoverStart={() => setHover(true)} onHoverEnd={() => setHover(false)} whileHover={{ y: -6 }}
      className="relative rounded-[22px] p-6 overflow-hidden cursor-default"
      style={{ background: s.bg, border: '1px solid rgba(201,169,97,0.18)', minHeight: 168 }}
    >
      <AnimatePresence>
        {hover && (
          <motion.div
            aria-hidden className="absolute inset-y-0 w-1/2 pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)' }}
            initial={{ x: '-120%' }} animate={{ x: '240%' }} exit={{ opacity: 0 }} transition={{ duration: 1.1, ease: breathe }}
          />
        )}
      </AnimatePresence>
      <div className="flex items-center gap-3 mb-4">
        <span className="w-11 h-11 rounded-full flex items-center justify-center text-xl shrink-0"
          style={{ background: '#fff', border: `1px solid ${s.color}55`, boxShadow: `0 8px 24px -10px ${s.color}` }}>
          {s.icon}
        </span>
      </div>
      <h3 className="font-display text-lg mb-1" style={{ color: C.text }}>{s.name}</h3>
      <p className="text-[13px] font-light" style={{ color: C.textMuted }}>{s.sub}</p>
      <span className="absolute bottom-5 right-6 w-2 h-2 rounded-full" style={{ background: s.color }} />
    </motion.div>
  )
}

function Resultats() {
  return (
    <section className="relative py-40 px-6" style={{ zIndex: 1 }}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: breathe }}
          className="text-center mb-16"
        >
          <p className="text-[11px] tracking-[0.3em] uppercase mb-5" style={{ color: C.gold }}>Les 10 Signatures Émotionnelles</p>
          <h2 className="font-display font-light" style={{ color: C.text, fontSize: 'clamp(1.7rem, 4vw, 2.8rem)' }}>Laquelle est la tienne&nbsp;?</h2>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SIGNATURES.map((s, i) => <SignatureCard key={s.name} s={s} i={i} />)}
        </div>
      </div>
    </section>
  )
}

/* ================================================================
   JULIA — storytelling (réel : le livre, la recherche, la trinité)
   ================================================================ */
function JuliaStory() {
  const paragraphs = [
    "Tout a commencé avec un livre. Julia Laureau, thérapeute holistique, a écrit <em>SOS Shine — Briller Comme un Diamant</em>&nbsp;: non pas un ouvrage de plus sur le développement personnel, mais une tentative de répondre à une question qui l'habitait depuis des années.",
    "Pourquoi répétons-nous les mêmes schémas, même lorsque nous comprenons tout&nbsp;? En accompagnant des centaines de personnes, une à une, Julia a observé la même mécanique&nbsp;: derrière chaque blocage, une phrase apprise très tôt — pour se protéger.",
    "De cette observation patiente est né un modèle. Non pas une vérité absolue, mais une lecture. Puis William et Thomas l'ont rejointe&nbsp;: trois regards, trois piliers, pour déconditionner l'être humain dans sa totalité. Julia n'est pas une sauveuse. Elle est une guide.",
  ]
  return (
    <section className="relative py-40 px-6" style={{ zIndex: 1 }}>
      <div className="max-w-4xl mx-auto grid md:grid-cols-[0.7fr_1fr] gap-12 md:gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 1.3, ease: breathe }}
          className="rounded-[24px] overflow-hidden mx-auto" style={{ width: 'min(70vw, 280px)', aspectRatio: '4/5', border: '1px solid rgba(201,169,97,0.25)' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/julia.jpeg" alt="Julia Laureau" className="w-full h-full object-cover" />
        </motion.div>
        <div>
          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1 }}
            className="text-[11px] tracking-[0.3em] uppercase mb-6" style={{ color: C.gold }}
          >
            La quête de Julia
          </motion.p>
          {paragraphs.map((p, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, ease: breathe, delay: i * 0.15 }}
              className="font-light leading-relaxed mb-5" style={{ color: C.textMuted, fontSize: 'clamp(0.98rem, 1.5vw, 1.1rem)' }}
              dangerouslySetInnerHTML={{ __html: p }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ================================================================
   TÉMOIGNAGES — réels
   ================================================================ */
const STORIES = [
  { text: "J'ai pleuré en lisant ma Signature. Pas de tristesse. De soulagement. Quelqu'un voyait enfin ce que je portais.", author: 'Camille', meta: '41 ans · Lyon' },
  { text: "10 ans en thérapie. Et en 3 minutes sur SOS Shine, j'ai compris un truc que personne n'avait réussi à me dire.", author: 'Sophie', meta: '34 ans · Paris' },
  { text: "Mon couple a changé. Pas parce que lui a changé. Parce que j'ai arrêté de rejouer le même film.", author: 'Nadia', meta: '29 ans · Marseille' },
  { text: 'Mon mari et moi avons fait le test séparément. On a compris nos 12 ans de conflit en 10 minutes.', author: 'Marc', meta: '45 ans · Bordeaux' },
  { text: 'Je recommençais tout, tout le temps. Les relations, les jobs, les amitiés. Maintenant je le vois venir.', author: 'Marie', meta: '38 ans · Bordeaux' },
  { text: "Le Courrier Anonyme m'a sauvée un dimanche soir à 23h. Quelqu'un a répondu. Quelqu'un comprenait.", author: 'Léa', meta: '26 ans · Nantes' },
]

function Temoignages() {
  return (
    <section className="relative py-40 px-6" style={{ zIndex: 1 }}>
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: breathe }}
          className="font-display font-light text-center mb-16" style={{ color: C.text, fontSize: 'clamp(1.7rem, 4vw, 2.8rem)' }}
        >
          Elles se sont reconnues
        </motion.h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {STORIES.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.9, ease: breathe, delay: (i % 3) * 0.1 }} whileHover={{ y: -5 }}
              className="rounded-[22px] p-7 flex flex-col gap-5"
              style={{ background: '#FFFFFF', border: '1px solid rgba(201,169,97,0.16)', boxShadow: '0 20px 60px -30px rgba(120,100,60,0.28)' }}
            >
              <p className="text-[15px] italic leading-relaxed font-light" style={{ color: C.text }}>«&nbsp;{s.text}&nbsp;»</p>
              <div className="flex items-center gap-3 mt-auto">
                <span className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium" style={{ background: C.ivory, color: C.gold }}>
                  {s.author.charAt(0)}
                </span>
                <span className="text-[13px]" style={{ color: C.textMuted }}>{s.author} · {s.meta}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ================================================================
   FAQ — réelle, accordéon premium
   ================================================================ */
const FAQ = [
  { q: "C'est vraiment gratuit&nbsp;?", a: 'Oui. 100% gratuit. Aucune carte bancaire demandée pour faire le test et recevoir ta Signature.' },
  { q: 'Combien de temps ça prend&nbsp;?', a: 'Entre 3 et 5 minutes selon ton rythme. Tu reçois ton résultat immédiatement.' },
  { q: "Je dois m'inscrire pour commencer&nbsp;?", a: "Non. Tu peux commencer immédiatement. On te demandera ton email à mi-test pour t'envoyer ton résultat." },
  { q: 'Mes réponses sont confidentielles&nbsp;?', a: "Oui, totalement. Aucune réponse n'est partagée avec qui que ce soit." },
  { q: "C'est de la psychologie sérieuse&nbsp;?", a: "C'est basé sur des années d'accompagnements et de recherche sur les schémas émotionnels. Ce n'est pas un test scientifique validé, c'est un outil de prise de conscience profonde." },
  { q: "Que se passe-t-il après le test&nbsp;?", a: 'Tu reçois ta Signature Émotionnelle personnalisée. Elle t\'ouvre l\'accès à la plateforme SOS Shine et aux protocoles adaptés à ton profil.' },
]

function FaqItem({ item, i }: { item: (typeof FAQ)[number]; i: number }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: breathe, delay: i * 0.05 }}
      className="border-b" style={{ borderColor: 'rgba(201,169,97,0.2)' }}
    >
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between gap-4 py-6 text-left cursor-pointer">
        <span className="font-display" style={{ color: C.text, fontSize: 'clamp(1.05rem, 2vw, 1.3rem)' }} dangerouslySetInnerHTML={{ __html: item.q }} />
        <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.4, ease: breathe }} className="shrink-0 text-2xl font-light leading-none" style={{ color: C.gold }}>+</motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.6, ease: breathe }} className="overflow-hidden">
            <p className="pb-6 font-light leading-relaxed" style={{ color: C.textMuted, fontSize: '0.98rem' }} dangerouslySetInnerHTML={{ __html: item.a }} />
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
          initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: breathe }}
          className="font-display font-light text-center mb-14" style={{ color: C.text, fontSize: 'clamp(1.7rem, 4vw, 2.6rem)' }}
        >
          Questions fréquentes
        </motion.h2>
        {FAQ.map((item, i) => <FaqItem key={i} item={item} i={i} />)}
      </div>
    </section>
  )
}

/* ================================================================
   CTA FINAL
   ================================================================ */
function CtaFinal() {
  return (
    <section className="relative py-52 px-6" style={{ zIndex: 2, background: '#FDFCFA' }}>
      <div className="max-w-3xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.3, ease: breathe }}
          className="font-display font-light leading-[1.2] mb-4" style={{ color: C.text, fontSize: 'clamp(1.7rem, 4.4vw, 3rem)' }}
        >
          Et si cette phrase que tu cherches depuis des années était déjà en toi&nbsp;?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, delay: 0.5 }}
          className="font-display italic mb-12" style={{ color: C.gold, fontSize: 'clamp(1.3rem, 3vw, 2rem)' }}
        >
          Découvre-la.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: breathe, delay: 0.8 }}>
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
  const reduce = useReducedMotion()
  useEffect(() => {
    document.documentElement.style.scrollBehavior = reduce ? 'auto' : 'smooth'
    return () => { document.documentElement.style.scrollBehavior = '' }
  }, [reduce])

  return (
    <main style={{ background: C.bg, color: C.text, position: 'relative', overflowX: 'hidden' }}>
      <WaveBackground />
      <Hero />
      <Identification />
      <Transformation />
      <MomentWow />
      <Explication />
      <Resultats />
      <JuliaStory />
      <Temoignages />
      <FaqSection />
      <CtaFinal />
      <footer className="relative py-10 text-center" style={{ zIndex: 1 }}>
        <p className="text-[12px]" style={{ color: C.textMuted }}>© {new Date().getFullYear()} SOS Shine — Briller comme un diamant</p>
      </footer>
    </main>
  )
}
