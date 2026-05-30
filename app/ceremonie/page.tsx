'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const GOLD = '#C9A961'
const BG   = '#0A0A0A'
const IVORY = '#F5F1E8'

function Fade({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function ReservationForm() {
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/ceremonie/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prenom, nom, email }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Une erreur est survenue.'); setLoading(false); return }
      window.location.href = data.url
    } catch {
      setError('Impossible de traiter la réservation. Réessaie.')
      setLoading(false)
    }
  }

  const inputStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(201,169,97,0.2)',
    borderRadius: '12px',
    color: IVORY,
    padding: '14px 18px',
    fontSize: '14px',
    width: '100%',
    outline: 'none',
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 w-full max-w-md mx-auto">
      <div className="grid grid-cols-2 gap-3">
        <input type="text" placeholder="Prénom *" value={prenom} onChange={e => setPrenom(e.target.value)} required style={inputStyle} />
        <input type="text" placeholder="Nom *" value={nom} onChange={e => setNom(e.target.value)} required style={inputStyle} />
      </div>
      <input type="email" placeholder="Email *" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
      {error && <p className="text-sm text-center" style={{ color: '#ff6b6b' }}>{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 rounded-full text-sm font-semibold transition-all hover:brightness-110 disabled:opacity-60 cursor-pointer"
        style={{ background: `linear-gradient(135deg, ${GOLD}, #B8960F)`, color: '#000' }}
      >
        {loading ? 'Redirection...' : 'Réserver ma place - 21€'}
      </button>
      <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.25)' }}>
        Acompte 21€ · Solde 90€ en espèces sur place · Remboursable jusqu'à J-14
      </p>
    </form>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: `1px solid rgba(201,169,97,0.1)` }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-5 text-left cursor-pointer gap-4">
        <span className="text-sm leading-relaxed" style={{ color: IVORY }}>{q}</span>
        <span className="text-xl flex-shrink-0 transition-transform duration-300" style={{ color: GOLD, transform: open ? 'rotate(45deg)' : 'none', display: 'inline-block' }}>+</span>
      </button>
      {open && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.3 }} className="pb-5 overflow-hidden">
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{a}</p>
        </motion.div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════
export default function CeremoniePage() {
  return (
    <main style={{ background: BG, color: IVORY }}>

      {/* ══════ HERO ══════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/ceremonie-hero.png"
            alt="L'Éveil - SOS Shine"
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center 40%' }}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(10,10,10,0.6) 0%, rgba(10,10,10,0.45) 40%, rgba(10,10,10,0.8) 80%, rgba(10,10,10,1) 100%)' }} />
        </div>

        <div className="relative z-10 max-w-xl space-y-8">
          <Fade>
            <img src="/images/logo-shine.png" alt="SOS Shine" className="h-28 mx-auto" />
          </Fade>

          <Fade delay={0.08}>
            <p className="text-[10px] tracking-[0.35em] uppercase font-medium" style={{ color: GOLD, opacity: 0.8 }}>
              Premier événement physique<br />SOS Shine · Été 2026
            </p>
          </Fade>

          <Fade delay={0.1}>
            <h1
              className="text-6xl sm:text-7xl md:text-8xl font-light italic leading-none"
              style={{ fontFamily: 'var(--font-cormorant)', color: IVORY }}
            >
              L'Éveil
            </h1>
          </Fade>

          <Fade delay={0.25}>
            <p className="text-base sm:text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Une soirée au bord du lac.<br />
              Quelque chose va changer en toi.
            </p>
          </Fade>

          <Fade delay={0.4}>
            <a
              href="#reservation"
              className="inline-block px-10 py-4 rounded-full text-sm font-semibold transition-all hover:brightness-110"
              style={{ background: `linear-gradient(135deg, ${GOLD}, #B8960F)`, color: '#000' }}
            >
              Réserver ma place
            </a>
          </Fade>

          <Fade delay={0.5}>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
              13 juin 2026 · 18h - 21h30 · Lac de Saint-Cassien · 20 places
            </p>
          </Fade>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="absolute bottom-10 flex flex-col items-center gap-1"
          style={{ color: 'rgba(255,255,255,0.2)' }}
        >
          <span className="text-[10px] tracking-[0.2em] uppercase">Découvrir</span>
          <motion.span animate={{ y: [0, 5, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}>↓</motion.span>
        </motion.div>
      </section>

      {/* ══════ CE QUE C'EST ══════ */}
      <section className="px-6 py-24 sm:py-32">
        <div className="max-w-lg mx-auto text-center space-y-10">
          <Fade>
            <p className="text-[10px] tracking-[0.35em] uppercase font-medium" style={{ color: GOLD, opacity: 0.7 }}>
              Ce qui t'attend
            </p>
          </Fade>

          <Fade delay={0.1}>
            <p
              className="text-2xl sm:text-3xl italic font-light leading-relaxed"
              style={{ fontFamily: 'var(--font-cormorant)', color: IVORY }}
            >
              « Nous ne guérissons pas.<br />Nous révélons. »
            </p>
          </Fade>

          <Fade delay={0.2}>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Trois heures trente au coucher du soleil, avec Julia, William et Thomas.
              Une expérience que tu ne peux pas anticiper.
              Ce que tu ressentiras, tu ne l'as probablement jamais ressenti.
            </p>
          </Fade>
        </div>
      </section>

      {/* ══════ LES 3 PHASES ══════ */}
      <section className="px-6 py-10 pb-28" style={{ borderTop: '1px solid rgba(201,169,97,0.08)', borderBottom: '1px solid rgba(201,169,97,0.08)', background: 'rgba(201,169,97,0.02)' }}>
        <div className="max-w-2xl mx-auto space-y-12">
          <Fade>
            <p className="text-[10px] tracking-[0.35em] uppercase font-medium text-center pt-16" style={{ color: GOLD, opacity: 0.7 }}>
              Le déroulement
            </p>
          </Fade>

          {[
            {
              num: '01',
              title: 'Le Corps',
              color: '#3A5A4A',
              desc: 'On commence par là où tout commence. Une marche. Un souffle. Un contact que tu n\'as probablement jamais exploré.',
            },
            {
              num: '02',
              title: 'Le Mental',
              color: GOLD,
              desc: 'Ce que tu portes a un mécanisme précis. On le démonte ensemble - puis on le brûle.',
            },
            {
              num: '03',
              title: 'L\'Âme',
              color: '#8B4F6F',
              desc: 'Les bols tibétains. Le coucher de soleil sur le lac. Ce que tu vas découvrir sur toi-même t\'appartient.',
            },
          ].map((phase, i) => (
            <Fade key={phase.num} delay={i * 0.1}>
              <div className="flex gap-6 items-start">
                <span className="font-display text-3xl font-light flex-shrink-0 mt-1" style={{ color: phase.color, opacity: 0.5 }}>
                  {phase.num}
                </span>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-px" style={{ background: phase.color, opacity: 0.6 }} />
                    <p className="text-lg italic" style={{ fontFamily: 'var(--font-cormorant)', color: phase.color }}>
                      {phase.title}
                    </p>
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

      {/* ══════ INFOS ESSENTIELLES ══════ */}
      <section className="px-6 py-24">
        <div className="max-w-lg mx-auto space-y-10">
          <Fade>
            <p className="text-[10px] tracking-[0.35em] uppercase font-medium text-center" style={{ color: GOLD, opacity: 0.7 }}>
              L'essentiel
            </p>
          </Fade>

          <Fade delay={0.1}>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Date', value: '13 juin 2026' },
                { label: 'Horaires', value: '18h00 - 21h30' },
                { label: 'Lieu', value: 'Lac de Saint-Cassien, Var' },
                { label: 'Places', value: '20 personnes max' },
                { label: 'Avec', value: 'Julia · William · Thomas' },
                { label: 'Tarif', value: '111€ · acompte 21€' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl p-4 space-y-1"
                  style={{ background: 'rgba(201,169,97,0.04)', border: '1px solid rgba(201,169,97,0.1)' }}
                >
                  <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: GOLD, opacity: 0.55 }}>{item.label}</p>
                  <p className="text-sm" style={{ color: IVORY }}>{item.value}</p>
                </div>
              ))}
            </div>
          </Fade>

          <Fade delay={0.2}>
            <div className="space-y-2 pt-2">
              {[
                'Tenue confortable - prévoir un plaid pour le coucher du soleil',
                'En cas de pluie : report communiqué 48h avant',
                'Venir seul(e) est conseillé',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ color: GOLD, opacity: 0.4, flexShrink: 0 }}>-</span>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{item}</p>
                </div>
              ))}
            </div>
          </Fade>
        </div>
      </section>

      {/* ══════ FORMULAIRE ══════ */}
      <section id="reservation" className="px-6 py-16" style={{ background: 'rgba(201,169,97,0.02)', borderTop: '1px solid rgba(201,169,97,0.08)' }}>
        <div className="max-w-xl mx-auto text-center space-y-10">
          <Fade>
            <h2
              className="text-3xl sm:text-4xl italic font-light leading-snug"
              style={{ fontFamily: 'var(--font-cormorant)', color: IVORY }}
            >
              20 places.<br />Pas une de plus.
            </h2>
            <p className="text-sm mt-5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Un acompte de 21€ confirme ta place.<br />Le solde de 90€ se règle en espèces sur place.
            </p>
          </Fade>

          <Fade delay={0.15}>
            <ReservationForm />
          </Fade>
        </div>
      </section>

      {/* ══════ FAQ ══════ */}
      <section className="px-6 py-20">
        <div className="max-w-lg mx-auto space-y-8">
          <Fade>
            <p className="text-[10px] tracking-[0.35em] uppercase font-medium text-center" style={{ color: GOLD, opacity: 0.7 }}>
              Questions
            </p>
          </Fade>
          <Fade delay={0.1}>
            <div>
              {[
                { q: 'Pourquoi un acompte ?', a: "Pour réserver ta place sans bloquer tout ton budget. Le solde de 90€ se règle sur place, en espèces, le soir même." },
                { q: 'Et si je ne peux plus venir ?', a: "L'acompte est remboursable jusqu'à 14 jours avant. Au-delà, il peut être transféré à une autre personne ou sur une prochaine date." },
                { q: "Et s'il pleut ?", a: 'Report à une date alternative communiquée 48h avant, avec le même groupe.' },
                { q: 'Puis-je venir seul·e ?', a: "Oui - c'est même la façon idéale. Le format est conçu pour des personnes qui viennent seules et se connectent au groupe." },
              ].map(item => (
                <FaqItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </Fade>
        </div>
      </section>

      {/* ══════ FOOTER CTA ══════ */}
      <section className="px-6 py-20 text-center" style={{ borderTop: '1px solid rgba(201,169,97,0.08)' }}>
        <div className="max-w-sm mx-auto space-y-6">
          <Fade>
            <p className="text-3xl sm:text-4xl italic font-light" style={{ fontFamily: 'var(--font-cormorant)', color: IVORY }}>
              13 juin. 18h. Le lac.
            </p>
          </Fade>
          <Fade delay={0.1}>
            <a
              href="#reservation"
              className="inline-block px-10 py-4 rounded-full text-sm font-semibold transition-all hover:brightness-110"
              style={{ background: `linear-gradient(135deg, ${GOLD}, #B8960F)`, color: '#000' }}
            >
              Réserver ma place
            </a>
          </Fade>
          <Fade delay={0.2}>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Pas encore prêt(e) ?{' '}
              <Link href="/signature-emotionnelle" style={{ color: GOLD, opacity: 0.7 }} className="hover:opacity-100 transition-opacity">
                Découvre ta Signature Émotionnelle →
              </Link>
            </p>
          </Fade>
        </div>
      </section>

      {/* ══════ FOOTER ══════ */}
      <footer className="px-6 py-10 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center justify-center mb-4">
          <img src="/images/logo-shine.png" alt="SOS Shine" className="h-8 opacity-40" />
        </div>
        <div className="flex items-center justify-center gap-4 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
          <Link href="/mentions-legales" className="hover:opacity-60 transition-opacity">Mentions légales</Link>
          <span>·</span>
          <Link href="/confidentialite" className="hover:opacity-60 transition-opacity">Confidentialité</Link>
          <span>·</span>
          <Link href="/" className="hover:opacity-60 transition-opacity">Accueil</Link>
        </div>
        <p className="text-xs mt-3" style={{ color: 'rgba(255,255,255,0.15)' }}>© 2026 SOS Shine®</p>
      </footer>

    </main>
  )
}
