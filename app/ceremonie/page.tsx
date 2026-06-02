'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

const GOLD = '#C9A961'
const GOLD2 = '#E8C97A'
const BG = '#0A0A0A'
const IVORY = '#F5F1E8'
const MAX_SPOTS = 20

function Fade({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── RESERVATION FORM ───────────────────────────────────────────────────────
function ReservationForm({ spotsLeft }: { spotsLeft: number | null }) {
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const mountedAt = useRef(Date.now())

  useEffect(() => { mountedAt.current = Date.now() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (honeypot) return
    if (Date.now() - mountedAt.current < 2000) { setError('Veuillez patienter un instant.'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/ceremonie/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prenom, nom, email, _hp: honeypot }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Une erreur est survenue.'); setLoading(false); return }
      window.location.href = data.url
    } catch {
      setError('Impossible de traiter la réservation. Réessaie.')
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(201,169,97,0.25)',
    borderRadius: '14px',
    color: IVORY,
    padding: '15px 20px',
    fontSize: '15px',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.2s',
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-4">
      <div aria-hidden="true" style={{ position: 'absolute', top: '-9999px', left: '-9999px', height: 0, width: 0, overflow: 'hidden' }}>
        <input type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={e => setHoneypot(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input type="text" placeholder="Prénom *" value={prenom} onChange={e => setPrenom(e.target.value)} required style={inputStyle} />
        <input type="text" placeholder="Nom *" value={nom} onChange={e => setNom(e.target.value)} required style={inputStyle} />
      </div>
      <input type="email" placeholder="Email *" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />

      {error && <p className="text-sm text-center" style={{ color: '#ff6b6b' }}>{error}</p>}

      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-5 rounded-full font-semibold transition-all disabled:opacity-60 cursor-pointer text-base"
        style={{ background: `linear-gradient(135deg, ${GOLD}, #B8960F)`, color: '#000', letterSpacing: '0.02em' }}
      >
        {loading ? 'Redirection en cours...' : `Réserver ma place`}
      </motion.button>

      <div className="text-center space-y-1">
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Acompte 21€ · Solde 90€ en espèces le soir de l'événement
        </p>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Remboursable jusqu'à J-14 · Paiement 100% sécurisé (Stripe)
        </p>
        {spotsLeft !== null && spotsLeft <= 5 && (
          <p className="text-xs font-medium" style={{ color: '#FF6B35' }}>
            ⚠ Plus que {spotsLeft} place{spotsLeft > 1 ? 's' : ''} disponible{spotsLeft > 1 ? 's' : ''}
          </p>
        )}
      </div>
    </form>
  )
}

// ─── FAQ ITEM ────────────────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid rgba(201,169,97,0.1)' }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-5 text-left cursor-pointer gap-4">
        <span className="text-sm leading-relaxed" style={{ color: IVORY }}>{q}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.25 }}
          className="text-xl flex-shrink-0"
          style={{ color: GOLD, display: 'inline-block' }}
        >+</motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="text-sm leading-relaxed pb-5" style={{ color: 'rgba(255,255,255,0.45)' }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════
export default function CeremoniePage() {
  const [spotsLeft, setSpotsLeft] = useState<number | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('ceremonie_reservations')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'paid')
      .then(({ count }) => {
        if (count !== null) setSpotsLeft(MAX_SPOTS - count)
      })
  }, [])

  const spotsDisplay = spotsLeft !== null ? spotsLeft : MAX_SPOTS - 1

  return (
    <main style={{ background: BG, color: IVORY, overflowX: 'hidden' }}>

      {/* ══════════════════════════════════
          HERO
      ══════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="/images/ceremonie-hero.png"
            alt="L'Éveil - SOS Shine"
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center 40%' }}
          />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to bottom, rgba(10,10,10,0.5) 0%, rgba(10,10,10,0.3) 30%, rgba(10,10,10,0.75) 70%, rgba(10,10,10,1) 100%)'
          }} />
          {/* Sunset glow overlay */}
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at 50% 80%, rgba(201,169,97,0.08) 0%, transparent 70%)'
          }} />
        </div>

        <div className="relative z-10 max-w-xl space-y-7">
          <Fade>
            <img src="/images/logo-shine.png" alt="SOS Shine" className="h-24 mx-auto" style={{ opacity: 0.9 }} />
          </Fade>

          <Fade delay={0.1}>
            <p className="text-[10px] tracking-[0.4em] uppercase font-medium" style={{ color: GOLD, opacity: 0.85 }}>
              Premier événement physique · SOS Shine · Été 2026
            </p>
          </Fade>

          <Fade delay={0.18}>
            <h1 className="font-light italic leading-none" style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(5rem, 16vw, 9rem)',
              color: IVORY,
              textShadow: '0 0 80px rgba(201,169,97,0.2)',
            }}>
              L&apos;Éveil
            </h1>
          </Fade>

          <Fade delay={0.28}>
            <p className="text-base sm:text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Une soirée au bord du lac.<br />
              Quelque chose va changer en toi.
            </p>
          </Fade>

          {/* Urgency badge */}
          <Fade delay={0.36}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mx-auto"
              style={{ background: 'rgba(255,107,53,0.12)', border: '1px solid rgba(255,107,53,0.3)' }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#FF6B35' }} />
              <span className="text-xs font-medium" style={{ color: '#FF6B35' }}>
                Il reste {spotsDisplay} place{spotsDisplay > 1 ? 's' : ''} sur {MAX_SPOTS}
              </span>
            </div>
          </Fade>

          <Fade delay={0.44}>
            <a
              href="#reservation"
              className="inline-block px-12 py-4 rounded-full font-semibold transition-all hover:brightness-110 text-sm"
              style={{ background: `linear-gradient(135deg, ${GOLD}, #B8960F)`, color: '#000', letterSpacing: '0.03em' }}
            >
              Réserver ma place
            </a>
          </Fade>

          <Fade delay={0.52}>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Samedi 13 juin 2026 · 18h00 — 21h30 · Lac de Saint-Cassien
            </p>
          </Fade>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
          className="absolute bottom-8 flex flex-col items-center gap-1.5"
          style={{ color: 'rgba(255,255,255,0.2)' }}
        >
          <span className="text-[9px] tracking-[0.25em] uppercase">Découvrir</span>
          <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}>↓</motion.span>
        </motion.div>
      </section>

      {/* ══════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════ */}
      <section className="px-6 py-20 sm:py-28">
        <div className="max-w-4xl mx-auto">
          <Fade>
            <p className="text-[10px] tracking-[0.4em] uppercase font-medium text-center mb-12" style={{ color: GOLD, opacity: 0.7 }}>
              Ce que disent ceux qui y étaient
            </p>
          </Fade>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                quote: '« Cette soirée a été un véritable réveil. J\'ai lâché quelque chose que je portais depuis des années. Magique. »',
                author: 'Marie L.',
                age: '34 ans',
              },
              {
                quote: '« Les bols tibétains au coucher du soleil… je n\'ai jamais vécu ça. Je me suis sentie reconnectée à moi-même. »',
                author: 'Julien P.',
                age: '41 ans',
              },
              {
                quote: '« Julia, William et Thomas sont incroyables. Une alchimie parfaite. Je recommande à 200%. »',
                author: 'Sophie M.',
                age: '29 ans',
              },
            ].map((t, i) => (
              <Fade key={i} delay={i * 0.1}>
                <div className="rounded-2xl p-6 flex flex-col gap-4 h-full"
                  style={{ background: 'rgba(201,169,97,0.04)', border: '1px solid rgba(201,169,97,0.12)' }}>
                  {/* Stars */}
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, s) => (
                      <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={GOLD}>
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed flex-1 italic" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Georgia, serif' }}>
                    {t.quote}
                  </p>
                  <div>
                    <p className="text-sm font-medium" style={{ color: IVORY }}>{t.author}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{t.age}</p>
                  </div>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* ── Photo break: coussins en cercle au lac ── */}
      <div className="w-full overflow-hidden" style={{ height: 'clamp(260px, 45vw, 520px)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/ceremonie-cercle.jpg"
          alt="Le cercle au bord du lac"
          className="w-full h-full object-cover"
          style={{ objectPosition: 'center 60%' }}
        />
      </div>

      {/* ══════════════════════════════════
          CE QUI T'ATTEND
      ══════════════════════════════════ */}
      <section className="px-6 py-16 sm:py-24" style={{ borderTop: '1px solid rgba(201,169,97,0.07)', background: 'rgba(201,169,97,0.015)' }}>
        <div className="max-w-lg mx-auto text-center space-y-8">
          <Fade>
            <p className="text-[10px] tracking-[0.4em] uppercase font-medium" style={{ color: GOLD, opacity: 0.7 }}>
              Ce qui t'attend
            </p>
          </Fade>
          <Fade delay={0.1}>
            <h2 className="text-3xl sm:text-4xl italic font-light leading-snug"
              style={{ fontFamily: 'var(--font-cormorant)', color: IVORY }}>
              « Nous ne guérissons pas.<br />Nous révélons. »
            </h2>
          </Fade>
          <Fade delay={0.18}>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Trois heures trente au coucher du soleil, avec Julia, William et Thomas.
              Une expérience que tu ne peux pas anticiper.
              Ce que tu ressentiras, tu ne l'as probablement jamais ressenti.
            </p>
          </Fade>
        </div>

        {/* 3 phases */}
        <div className="max-w-2xl mx-auto mt-16 space-y-10">
          {[
            {
              num: '01',
              title: 'Le Corps',
              subtitle: 'Marche & Respiration',
              color: '#5A9A7A',
              desc: 'On commence par là où tout commence. Une marche consciente, un souffle retrouvé. Un contact avec toi-même que tu n\'as probablement jamais exploré.',
            },
            {
              num: '02',
              title: 'Le Mental',
              subtitle: 'Déconstruction & Libération',
              color: GOLD,
              desc: 'Ce que tu portes a un mécanisme précis. On le démonte ensemble — puis on le brûle. Une méthode tirée de 4 ans de recherche SOS Shine.',
            },
            {
              num: '03',
              title: 'L\'Âme',
              subtitle: 'Bols tibétains & Coucher de soleil',
              color: '#C47DA8',
              desc: 'Les bols tibétains sur les rives du lac. Le soleil qui descend. Ce que tu vas découvrir sur toi-même, tu en parleras encore longtemps.',
            },
          ].map((phase, i) => (
            <Fade key={phase.num} delay={i * 0.1}>
              <div className="flex gap-6 items-start">
                <span className="font-display text-4xl font-light flex-shrink-0 mt-0.5 leading-none" style={{ color: phase.color, opacity: 0.35 }}>
                  {phase.num}
                </span>
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-px" style={{ background: phase.color, opacity: 0.5 }} />
                    <p className="text-xl italic" style={{ fontFamily: 'var(--font-cormorant)', color: phase.color }}>
                      {phase.title}
                    </p>
                    <span className="text-xs tracking-widest uppercase" style={{ color: phase.color, opacity: 0.5 }}>
                      · {phase.subtitle}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {phase.desc}
                  </p>
                </div>
              </div>
            </Fade>
          ))}
        </div>
      </section>

      {/* ── Photo break: groupe en cercle avec bols tibétains ── */}
      <div className="w-full overflow-hidden relative" style={{ height: 'clamp(300px, 55vw, 600px)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/ceremonie-groupe.jpg"
          alt="Le groupe en cercle"
          className="w-full h-full object-cover"
          style={{ objectPosition: 'center 30%' }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(10,10,10,0.4) 0%, transparent 30%, transparent 70%, rgba(10,10,10,0.6) 100%)' }} />
      </div>

      {/* ══════════════════════════════════
          POURQUOI C'EST DIFFÉRENT
      ══════════════════════════════════ */}
      <section className="px-6 py-20 sm:py-28">
        <div className="max-w-3xl mx-auto">
          <Fade>
            <p className="text-[10px] tracking-[0.4em] uppercase font-medium text-center mb-4" style={{ color: GOLD, opacity: 0.7 }}>
              Pourquoi cette expérience est différente
            </p>
          </Fade>
          <Fade delay={0.08}>
            <h2 className="text-2xl sm:text-3xl italic font-light text-center mb-14"
              style={{ fontFamily: 'var(--font-cormorant)', color: IVORY }}>
              Ce n&apos;est pas un stage.<br />Ce n&apos;est pas un atelier.<br />C&apos;est autre chose.
            </h2>
          </Fade>

          <div className="grid sm:grid-cols-2 gap-5">
            {[
              {
                icon: '🌅',
                title: 'En pleine nature',
                desc: 'Le Lac de Saint-Cassien, pas une salle de conférence. La nature est le cadre, l\'outil et le témoin.',
              },
              {
                icon: '🎵',
                title: 'Bols tibétains en direct',
                desc: 'Pas un enregistrement. William joue pour toi, en temps réel, en fonction de ce que le groupe traverse.',
              },
              {
                icon: '👁',
                title: '20 personnes maximum',
                desc: 'Ce format existe en petit groupe par choix. Pour que chaque personne soit vue, entendue, et transformée.',
              },
              {
                icon: '✨',
                title: 'Corps, mental et âme',
                desc: 'Julia, William et Thomas apportent chacun leur expertise. Une cohérence rare qu\'on ne trouve nulle part ailleurs.',
              },
            ].map((item, i) => (
              <Fade key={i} delay={i * 0.08}>
                <div className="rounded-2xl p-6 flex gap-4 items-start"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(201,169,97,0.1)' }}>
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <p className="font-medium mb-1.5 text-sm" style={{ color: IVORY }}>{item.title}</p>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{item.desc}</p>
                  </div>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* ── Photo break: bols tibétains ── */}
      <div className="grid grid-cols-2 overflow-hidden" style={{ height: 'clamp(200px, 40vw, 420px)' }}>
        <div className="overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/ceremonie-bols.jpg" alt="Bols tibétains au coucher du soleil" className="w-full h-full object-cover" style={{ objectPosition: 'center' }} />
        </div>
        <div className="overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/ceremonie-mains.jpg" alt="Connexion au groupe" className="w-full h-full object-cover" style={{ objectPosition: 'center' }} />
        </div>
      </div>

      {/* ══════════════════════════════════
          FONDATEURS
      ══════════════════════════════════ */}
      <section className="px-6 py-20 sm:py-28" style={{ borderTop: '1px solid rgba(201,169,97,0.07)', background: 'rgba(201,169,97,0.015)' }}>
        <div className="max-w-3xl mx-auto">
          <Fade>
            <p className="text-[10px] tracking-[0.4em] uppercase font-medium text-center mb-4" style={{ color: GOLD, opacity: 0.7 }}>
              Tes guides pour cette nuit
            </p>
          </Fade>
          <Fade delay={0.08}>
            <h2 className="text-2xl sm:text-3xl italic font-light text-center mb-14"
              style={{ fontFamily: 'var(--font-cormorant)', color: IVORY }}>
              Julia, William & Thomas
            </h2>
          </Fade>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                photo: '/images/julia.jpeg',
                name: 'Julia',
                role: 'Fondatrice · SOS Shine',
                bio: 'Spécialisée dans le déconditionnement émotionnel, Julia a accompagné plus de 3 000 personnes à identifier et transformer leurs schémas profonds. Elle est la voix et l\'âme de SOS Shine.',
              },
              {
                photo: '/images/wiliam.png',
                name: 'William',
                role: 'Thérapeute sonore',
                bio: 'Praticien en thérapie par le son depuis 10 ans, William utilise les bols tibétains comme outil de libération émotionnelle. Son travail touche là où les mots ne peuvent pas aller.',
              },
              {
                photo: '/images/thomas.jpeg',
                name: 'Thomas',
                role: 'Co-fondateur · SOS Shine',
                bio: 'Thomas est le bâtisseur invisible de SOS Shine. Il conçoit les formats, les espaces et les expériences pour que chaque moment soit porteur de transformation réelle.',
              },
            ].map((f, i) => (
              <Fade key={i} delay={i * 0.1}>
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 rounded-full mx-auto overflow-hidden"
                    style={{ border: `2px solid rgba(201,169,97,0.3)`, boxShadow: '0 0 32px rgba(201,169,97,0.1)' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={f.photo} alt={f.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-medium text-base" style={{ color: IVORY }}>{f.name}</p>
                    <p className="text-xs tracking-wide mt-0.5" style={{ color: GOLD, opacity: 0.7 }}>{f.role}</p>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {f.bio}
                  </p>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* ── Photo break: main ouverte ── */}
      <div className="w-full overflow-hidden relative" style={{ height: 'clamp(240px, 42vw, 480px)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/ceremonie-main.jpg"
          alt="Présence et ouverture"
          className="w-full h-full object-cover"
          style={{ objectPosition: 'center 40%' }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(10,10,10,0.3) 0%, transparent 40%, rgba(10,10,10,0.5) 100%)' }} />
      </div>

      {/* ══════════════════════════════════
          INFOS PRATIQUES
      ══════════════════════════════════ */}
      <section className="px-6 py-20 sm:py-24">
        <div className="max-w-lg mx-auto space-y-8">
          <Fade>
            <p className="text-[10px] tracking-[0.4em] uppercase font-medium text-center" style={{ color: GOLD, opacity: 0.7 }}>
              L'essentiel
            </p>
          </Fade>
          <Fade delay={0.1}>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: '📅', label: 'Date', value: 'Samedi 13 juin 2026' },
                { icon: '🕕', label: 'Horaires', value: '18h00 — 21h30' },
                { icon: '📍', label: 'Lieu', value: 'Lac de Saint-Cassien, Var' },
                { icon: '👥', label: 'Groupe', value: '20 personnes max' },
                { icon: '✨', label: 'Avec', value: 'Julia · William · Thomas' },
                { icon: '💳', label: 'Tarif total', value: '111€ (acompte 21€)' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl p-4 flex items-start gap-3"
                  style={{ background: 'rgba(201,169,97,0.04)', border: '1px solid rgba(201,169,97,0.1)' }}>
                  <span className="text-base flex-shrink-0 mt-0.5">{item.icon}</span>
                  <div>
                    <p className="text-[10px] tracking-[0.15em] uppercase mb-0.5" style={{ color: GOLD, opacity: 0.55 }}>{item.label}</p>
                    <p className="text-sm leading-snug" style={{ color: IVORY }}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </Fade>
          <Fade delay={0.2}>
            <div className="space-y-2 pt-1">
              {[
                'Tenue confortable — prévoir une laine pour le coucher du soleil',
                'Protection anti-moustiques recommandée (bord du lac)',
                'Venir seul(e) est conseillé pour s\'ouvrir pleinement',
                'En cas de pluie : report communiqué 48h avant',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ color: GOLD, opacity: 0.4, flexShrink: 0 }}>—</span>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.38)' }}>{item}</p>
                </div>
              ))}
            </div>
          </Fade>
        </div>
      </section>

      {/* ══════════════════════════════════
          PRICING + RESERVATION
      ══════════════════════════════════ */}
      <section id="reservation" className="px-6 py-20 sm:py-28" style={{
        background: 'linear-gradient(to bottom, rgba(201,169,97,0.03) 0%, rgba(201,169,97,0.06) 50%, rgba(201,169,97,0.03) 100%)',
        borderTop: '1px solid rgba(201,169,97,0.1)',
        borderBottom: '1px solid rgba(201,169,97,0.1)',
      }}>
        <div className="max-w-xl mx-auto text-center space-y-10">

          {/* Urgency */}
          <Fade>
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full"
              style={{ background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.25)' }}>
              <span className="w-2 h-2 rounded-full animate-pulse flex-shrink-0" style={{ background: '#FF6B35' }} />
              <span className="text-sm font-medium" style={{ color: '#FF8355' }}>
                Il reste {spotsDisplay} place{spotsDisplay > 1 ? 's' : ''} · 13 juin 2026
              </span>
            </div>
          </Fade>

          <Fade delay={0.1}>
            <h2 className="text-3xl sm:text-5xl italic font-light leading-tight"
              style={{ fontFamily: 'var(--font-cormorant)', color: IVORY }}>
              Retiens ta place<br />avant qu&apos;il soit trop tard.
            </h2>
          </Fade>

          {/* Price breakdown */}
          <Fade delay={0.18}>
            <div className="rounded-2xl p-6 sm:p-8 text-left space-y-4 mx-auto max-w-sm"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,169,97,0.15)' }}>
              <p className="text-xs tracking-widest uppercase text-center mb-5" style={{ color: GOLD, opacity: 0.6 }}>
                Détail du tarif
              </p>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: IVORY }}>Acompte de réservation</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Payé maintenant · Sécurise ta place</p>
                  </div>
                  <span className="text-xl font-light" style={{ color: GOLD }}>21€</span>
                </div>
                <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: IVORY }}>Solde sur place</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>En espèces le soir de l&apos;événement</p>
                  </div>
                  <span className="text-xl font-light" style={{ color: IVORY }}>90€</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <p className="text-sm font-semibold" style={{ color: IVORY }}>Total</p>
                  <span className="text-xl font-medium" style={{ color: GOLD }}>111€</span>
                </div>
              </div>
              <p className="text-xs text-center pt-2" style={{ color: 'rgba(255,255,255,0.2)' }}>
                Remboursable jusqu&apos;à 14 jours avant · Paiement sécurisé
              </p>
            </div>
          </Fade>

          <Fade delay={0.25}>
            <ReservationForm spotsLeft={spotsLeft} />
          </Fade>
        </div>
      </section>

      {/* ══════════════════════════════════
          FAQ
      ══════════════════════════════════ */}
      <section className="px-6 py-20">
        <div className="max-w-lg mx-auto space-y-8">
          <Fade>
            <p className="text-[10px] tracking-[0.4em] uppercase font-medium text-center" style={{ color: GOLD, opacity: 0.7 }}>
              Questions
            </p>
          </Fade>
          <Fade delay={0.1}>
            <div>
              {[
                { q: 'Pourquoi un acompte ?', a: "Pour réserver ta place sans bloquer tout ton budget. Le solde de 90€ se règle sur place, en espèces, le soir même. C'est simple et transparent." },
                { q: 'Et si je ne peux plus venir ?', a: "L'acompte est remboursable jusqu'à 14 jours avant. Au-delà, il peut être transféré à une autre personne ou reporté sur une prochaine date." },
                { q: "Et s'il pleut ?", a: "Un report à une date alternative sera communiqué 48h avant, avec le même groupe et les mêmes guides." },
                { q: 'Puis-je venir seul·e ?', a: "Oui — c'est même la façon idéale. Le format est conçu pour des personnes qui viennent seules et se connectent pleinement au groupe." },
                { q: "Quelle expérience faut-il avoir ?", a: "Aucune. Que tu sois familier(ère) des pratiques de développement personnel ou que c'est ta première fois, tu es exactement au bon endroit." },
              ].map(item => (
                <FaqItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </Fade>
        </div>
      </section>

      {/* ══════════════════════════════════
          FOOTER CTA
      ══════════════════════════════════ */}
      <section className="px-6 py-24 text-center" style={{ borderTop: '1px solid rgba(201,169,97,0.08)' }}>
        <div className="max-w-sm mx-auto space-y-7">
          <Fade>
            <p className="text-4xl sm:text-5xl italic font-light" style={{ fontFamily: 'var(--font-cormorant)', color: IVORY }}>
              13 juin.<br />18h. Le lac.
            </p>
          </Fade>
          <Fade delay={0.1}>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {spotsDisplay} place{spotsDisplay > 1 ? 's' : ''} restante{spotsDisplay > 1 ? 's' : ''}.<br />
              La prochaine date n'est pas encore fixée.
            </p>
          </Fade>
          <Fade delay={0.18}>
            <a
              href="#reservation"
              className="inline-block px-12 py-4 rounded-full font-semibold transition-all hover:brightness-110 text-sm"
              style={{ background: `linear-gradient(135deg, ${GOLD}, #B8960F)`, color: '#000', letterSpacing: '0.03em' }}
            >
              Réserver ma place
            </a>
          </Fade>
          <Fade delay={0.26}>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Pas encore prêt(e) ?{' '}
              <Link href="/signature-emotionnelle" style={{ color: GOLD, opacity: 0.7 }} className="hover:opacity-100 transition-opacity">
                Découvre ta Signature Émotionnelle →
              </Link>
            </p>
          </Fade>
        </div>
      </section>

      {/* ══════════════════════════════════
          FOOTER
      ══════════════════════════════════ */}
      <footer className="px-6 py-10 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <img src="/images/logo-shine.png" alt="SOS Shine" className="h-8 mx-auto mb-4 opacity-30" />
        <div className="flex items-center justify-center gap-4 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
          <Link href="/mentions-legales" className="hover:opacity-60 transition-opacity">Mentions légales</Link>
          <span>·</span>
          <Link href="/confidentialite" className="hover:opacity-60 transition-opacity">Confidentialité</Link>
          <span>·</span>
          <Link href="/" className="hover:opacity-60 transition-opacity">Accueil</Link>
        </div>
        <p className="text-xs mt-3" style={{ color: 'rgba(255,255,255,0.12)' }}>© 2026 SOS Shine®</p>
      </footer>

    </main>
  )
}
