'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

// ── Couleurs fondateurs ──
const C = {
  julia:   '#8B4F6F',
  william: '#C9A961',
  thomas:  '#3A5A4A',
  tous:    '#5A5A5A',
  gold:    '#C9A961',
  bg:      '#0A0A0A',
  ivory:   '#F5F1E8',
}

function Fade({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function Divider() {
  return <div className="w-16 h-px mx-auto my-14" style={{ background: C.gold, opacity: 0.3 }} />
}

// ── FAQ accordéon ──
const FAQ_ITEMS = [
  {
    q: 'Pourquoi un acompte et pas le paiement complet ?',
    a: 'Pour réserver ta place sans bloquer ton budget. Le solde de 90€ se règle sur place le jour de la cérémonie, en espèces.',
  },
  {
    q: 'Et si je ne peux plus venir ?',
    a: "L'acompte est remboursable jusqu'à 14 jours avant la date. Au-delà, il peut être transféré sur une autre date ou cédé à une autre personne.",
  },
  {
    q: "Et s'il pleut ?",
    a: 'Report à une date alternative communiquée 48h avant, en concertation avec le groupe.',
  },
  {
    q: 'Le lieu est-il accessible PMR ?',
    a: 'Le bord du lac demande une courte marche sur terrain naturel. Nous contacter pour adapter si besoin.',
  },
  {
    q: 'Puis-je venir seul·e ?',
    a: "Oui, c'est même conseillé. Le format est pensé pour des personnes qui viennent seules et se connectent au groupe.",
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: `1px solid rgba(201,169,97,0.12)` }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left cursor-pointer gap-4"
      >
        <span className="text-sm leading-relaxed" style={{ color: C.ivory, fontFamily: 'var(--font-cormorant)', fontSize: '1.05rem' }}>{q}</span>
        <span className="text-lg flex-shrink-0 transition-transform duration-300" style={{ color: C.gold, transform: open ? 'rotate(45deg)' : 'none' }}>+</span>
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="pb-5 overflow-hidden"
        >
          <p className="text-sm leading-relaxed" style={{ color: '#a1a1aa' }}>{a}</p>
        </motion.div>
      )}
    </div>
  )
}

// ── Timeline step ──
const TIMELINE = [
  { time: '18h00', title: 'Marche méditative en conscience', duration: '20 min', founder: 'thomas' as const, who: 'Thomas', desc: 'Déconnexion de l\'environnement, sas de décompression. Marche silencieuse depuis le parking jusqu\'au cercle.' },
  { time: '18h20', title: 'Cercle d\'ouverture & écriture des intentions', duration: '30 min', founder: 'tous' as const, who: 'Tous', desc: 'Tour de présentation, écriture des intentions déposées dans la coupe centrale.' },
  { time: '18h50', title: 'Décryptage : la mécanique de nos blocages', duration: '15 min', founder: 'william' as const, who: 'William', desc: 'Pre-talk court et incisif sur les conditionnements du mental.' },
  { time: '19h05', title: 'Test d\'ancrage & toucher conscient', duration: '35 min', founder: 'julia' as const, who: 'Julia', desc: 'Phase corps : test binôme, respiration ventrale, toucher conscient à trois, retest.' },
  { time: '19h40', title: 'Sound healing aux bols', duration: '50 min', founder: 'julia' as const, who: 'Julia', desc: 'Bain sonore tibétains et cristal, tambour. Coucher de soleil pendant cette séquence.' },
  { time: '20h30', title: 'Pause infusions & re-test d\'ancrage', duration: '20 min', founder: 'tous' as const, who: 'Tous', desc: 'Retour au corps en douceur, preuve factuelle du changement d\'état.' },
  { time: '20h50', title: 'Pont hypnotique & rituel du feu', duration: '20 min', founder: 'william' as const, who: 'William → Tous', desc: 'Induction hypnotique légère puis mouvement vers le brasero pour brûler les intentions.' },
  { time: '21h10', title: 'Signature Émotionnelle & cercle de clôture', duration: '20 min', founder: 'tous' as const, who: 'William / Tous', desc: 'Atterrissage. QR code pour découvrir leur profil émotionnel et le parcours qui leur correspond.' },
]

// ── Formulaire de réservation ──
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
      if (!res.ok) {
        setError(data.error || 'Une erreur est survenue.')
        setLoading(false)
        return
      }
      window.location.href = data.url
    } catch {
      setError('Impossible de traiter la réservation. Réessaie.')
      setLoading(false)
    }
  }

  const inputStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(201,169,97,0.2)',
    borderRadius: '10px',
    color: C.ivory,
    padding: '14px 16px',
    fontSize: '14px',
    width: '100%',
    outline: 'none',
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md mx-auto">
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Prénom *"
          value={prenom}
          onChange={e => setPrenom(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Nom *"
          value={nom}
          onChange={e => setNom(e.target.value)}
          required
          style={inputStyle}
        />
      </div>
      <input
        type="email"
        placeholder="Email *"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        style={inputStyle}
      />
      {error && <p className="text-sm text-center" style={{ color: '#ff6b6b' }}>{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 rounded-xl text-sm font-semibold transition-all hover:brightness-110 disabled:opacity-60"
        style={{ background: `linear-gradient(135deg, ${C.gold}, #B8960F)`, color: '#000' }}
      >
        {loading ? 'Redirection...' : 'Réserver ma place — 21€ d\'acompte'}
      </button>
      <p className="text-xs text-center" style={{ color: '#737373' }}>
        Acompte 21€ · Solde de 90€ en espèces sur place · Remboursable jusqu'à J-14
      </p>
    </form>
  )
}

// ═══════════════════════════════════════════
// PAGE PRINCIPALE
// ═══════════════════════════════════════════
export default function CeremoniePage() {
  return (
    <main style={{ background: C.bg, color: C.ivory, fontFamily: 'var(--font-inter, sans-serif)' }}>

      {/* ══════ HERO ══════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden">
        {/* Photo de fond */}
        <div className="absolute inset-0">
          <img
            src="/images/ceremonie-hero.png"
            alt="Cérémonie SOS Shine au bord du lac"
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center 40%' }}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(10,10,10,0.72) 0%, rgba(10,10,10,0.55) 40%, rgba(10,10,10,0.75) 80%, rgba(10,10,10,0.95) 100%)' }} />
        </div>

        <div className="relative z-10 max-w-2xl space-y-8">
          <Fade>
            <p className="text-[10px] tracking-[0.3em] uppercase font-medium" style={{ color: C.gold }}>
              Premier événement physique SOS Shine · Été 2026
            </p>
          </Fade>

          <Fade delay={0.1}>
            <h1
              className="text-5xl sm:text-6xl md:text-7xl font-light leading-[1.1] italic"
              style={{ fontFamily: 'var(--font-cormorant)', color: C.ivory }}
            >
              Une cérémonie<br />en pleine nature
            </h1>
          </Fade>

          <Fade delay={0.2}>
            <p className="text-base sm:text-lg leading-relaxed" style={{ color: '#a1a1aa' }}>
              Trois heures trente au coucher du soleil,<br />au bord du lac de Saint-Cassien
            </p>
          </Fade>

          <Fade delay={0.35}>
            <div className="w-8 h-px mx-auto" style={{ background: C.gold, opacity: 0.4 }} />
            <p
              className="text-xl sm:text-2xl italic mt-6"
              style={{ fontFamily: 'var(--font-cormorant)', color: C.gold, opacity: 0.85 }}
            >
              « Nous ne guérissons pas. Nous révélons. »
            </p>
          </Fade>

          <Fade delay={0.5}>
            <a
              href="#reservation"
              className="inline-block px-8 py-4 rounded-xl text-sm font-semibold transition-all hover:brightness-110"
              style={{ background: `linear-gradient(135deg, ${C.gold}, #B8960F)`, color: '#000' }}
            >
              Réserver ma place — 21€ d'acompte
            </a>
          </Fade>

          <Fade delay={0.6}>
            <p className="text-xs" style={{ color: '#525252' }}>
              20 places uniquement · 13 juin 2026 · 18h00 – 21h30
            </p>
          </Fade>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-10 flex flex-col items-center gap-1"
          style={{ color: '#525252' }}
        >
          <span className="text-[10px] tracking-[0.2em] uppercase">Découvrir</span>
          <motion.span
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            ↓
          </motion.span>
        </motion.div>
      </section>

      {/* ══════ INFOS CLÉS ══════ */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto">
          <Fade>
            <p className="text-[10px] tracking-[0.3em] uppercase font-medium text-center mb-14" style={{ color: C.gold }}>
              Informations
            </p>
          </Fade>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: 'Date', value: '13 juin 2026' },
              { label: 'Horaires', value: '18h00 – 21h30' },
              { label: 'Durée', value: '3h30' },
              { label: 'Lieu', value: 'Lac de Saint-Cassien, Var' },
              { label: 'Places', value: '20 personnes uniquement' },
              { label: 'Tarif', value: '111€ par personne' },
              { label: 'Acompte', value: '21€ · solde 90€ en espèces sur place' },
              { label: 'La trinité', value: 'Julia · William · Thomas' },
              { label: 'Restauration', value: 'Eau infusée & infusions chaudes' },
            ].map((item, i) => (
              <Fade key={item.label} delay={i * 0.05}>
                <div
                  className="rounded-xl p-5 space-y-1"
                  style={{ background: 'rgba(201,169,97,0.04)', border: '1px solid rgba(201,169,97,0.12)' }}
                >
                  <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: C.gold, opacity: 0.6 }}>{item.label}</p>
                  <p className="text-sm leading-snug" style={{ color: C.ivory }}>{item.value}</p>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ══════ TIMELINE ══════ */}
      <section className="px-6 py-10">
        <div className="max-w-2xl mx-auto">
          <Fade>
            <p className="text-[10px] tracking-[0.3em] uppercase font-medium text-center mb-14" style={{ color: C.gold }}>
              Le déroulé
            </p>
          </Fade>

          <div className="relative">
            {/* Ligne verticale */}
            <div className="absolute left-[19px] top-0 bottom-0 w-px" style={{ background: 'rgba(201,169,97,0.1)' }} />

            <div className="space-y-10">
              {TIMELINE.map((step, i) => {
                const color = C[step.founder]
                return (
                  <Fade key={step.time} delay={i * 0.06}>
                    <div className="flex gap-5">
                      {/* Dot */}
                      <div className="flex-shrink-0 w-10 flex flex-col items-center pt-1">
                        <div className="w-4 h-4 rounded-full border-2 z-10" style={{ borderColor: color, background: C.bg }} />
                      </div>

                      <div className="pb-2">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <span
                            className="text-xs font-semibold tabular-nums"
                            style={{ fontFamily: 'var(--font-cormorant)', fontSize: '0.95rem', color }}
                          >
                            {step.time}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${color}18`, color }}>
                            {step.who}
                          </span>
                          <span className="text-[10px]" style={{ color: '#525252' }}>{step.duration}</span>
                        </div>
                        <p
                          className="text-base mb-1"
                          style={{ fontFamily: 'var(--font-cormorant)', color: C.ivory, fontSize: '1.1rem' }}
                        >
                          {step.title}
                        </p>
                        <p className="text-xs leading-relaxed" style={{ color: '#737373' }}>
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  </Fade>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <Divider />

      {/* ══════ CE QUE TU VAS VIVRE ══════ */}
      <section className="px-6 py-10">
        <div className="max-w-3xl mx-auto">
          <Fade>
            <p className="text-[10px] tracking-[0.3em] uppercase font-medium text-center mb-14" style={{ color: C.gold }}>
              Ce que tu vas vivre
            </p>
          </Fade>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                title: 'Le corps qui se réveille',
                color: C.thomas,
                items: ['Marche méditative silencieuse', 'Respiration ventrale guidée', 'Toucher conscient à trois', 'Sound healing aux bols tibétains et cristal'],
              },
              {
                title: 'Le mental qui se libère',
                color: C.william,
                items: ['Décryptage des conditionnements', 'Hypnose conversationnelle légère', 'Rituel du feu — brûler les intentions', 'Test d\'ancrage avant/après'],
              },
              {
                title: 'L\'âme qui se révèle',
                color: C.julia,
                items: ['Cercle d\'intentions en groupe', 'Signature Émotionnelle personnalisée', 'PDF souvenir personnalisé à J+2', '1 mois d\'accès offert à SOS Shine'],
              },
            ].map((col, i) => (
              <Fade key={col.title} delay={i * 0.1}>
                <div
                  className="rounded-2xl p-6 h-full space-y-5"
                  style={{ background: `${col.color}0A`, border: `1px solid ${col.color}30` }}
                >
                  <div className="w-8 h-px" style={{ background: col.color }} />
                  <p
                    className="text-lg italic leading-tight"
                    style={{ fontFamily: 'var(--font-cormorant)', color: col.color }}
                  >
                    {col.title}
                  </p>
                  <ul className="space-y-2">
                    {col.items.map(item => (
                      <li key={item} className="flex items-start gap-2 text-xs leading-relaxed" style={{ color: '#a1a1aa' }}>
                        <span className="mt-1 flex-shrink-0 w-1 h-1 rounded-full" style={{ background: col.color }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ══════ CE QUI EST INCLUS ══════ */}
      <section className="px-6 py-10">
        <div className="max-w-2xl mx-auto">
          <Fade>
            <p className="text-[10px] tracking-[0.3em] uppercase font-medium text-center mb-14" style={{ color: C.gold }}>
              Ce qui est inclus dans les 111€
            </p>
          </Fade>

          <div className="space-y-4">
            {[
              "L'expérience complète de 3h30 avec les trois fondateurs",
              'Le lieu installé — toiles dans les arbres, cercle de coussins, lampes solaires, table centrale',
              'Eau infusée et infusions chaudes pendant toute la cérémonie',
              'Le rituel du feu de libération',
              "L'accès au quiz Signature Émotionnelle sur place",
              'Un PDF souvenir personnalisé envoyé à J+2 : profil émotionnel complet, photos de la cérémonie, analyse signée William, protocole recommandé',
              'Un mois d\'accès offert à la plateforme SOS Shine',
            ].map((item, i) => (
              <Fade key={i} delay={i * 0.05}>
                <div className="flex items-start gap-4">
                  <div className="w-px h-full min-h-[20px] mt-1 flex-shrink-0" style={{ background: C.gold, opacity: 0.4, width: '2px', alignSelf: 'stretch' }} />
                  <p className="text-sm leading-relaxed" style={{ color: '#c0c0c0' }}>{item}</p>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ══════ FORMULAIRE ══════ */}
      <section id="reservation" className="px-6 py-16">
        <div className="max-w-xl mx-auto text-center space-y-10">
          <Fade>
            <p className="text-[10px] tracking-[0.3em] uppercase font-medium" style={{ color: C.gold }}>
              Réserver ma place
            </p>
            <h2
              className="text-3xl sm:text-4xl italic font-light mt-4 leading-snug"
              style={{ fontFamily: 'var(--font-cormorant)', color: C.ivory }}
            >
              20 places. Pas une de plus.
            </h2>
            <p className="text-sm mt-4 leading-relaxed" style={{ color: '#a1a1aa' }}>
              Un acompte de 21€ confirme ta place. Le solde de 90€ se règle en espèces sur place.
            </p>
          </Fade>

          <Fade delay={0.15}>
            <ReservationForm />
          </Fade>
        </div>
      </section>

      <Divider />

      {/* ══════ IMPORTANT ══════ */}
      <section className="px-6 py-10">
        <div className="max-w-2xl mx-auto">
          <Fade>
            <p className="text-[10px] tracking-[0.3em] uppercase font-medium text-center mb-10" style={{ color: C.gold }}>
              Important à savoir
            </p>
          </Fade>

          <div className="space-y-3">
            {[
              'Tenue confortable, prévoir un plaid ou châle pour le coucher du soleil',
              'Pieds nus pendant le test d\'ancrage et le sound healing',
              'Pas de repas prévu sur place (cérémonie de 3h30 sans dîner)',
              'Arrivée 10 min avant pour le stationnement',
              'En cas de pluie : report à une date alternative avec mêmes inscrits',
            ].map((item, i) => (
              <Fade key={i} delay={i * 0.05}>
                <div className="flex items-start gap-3 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ color: C.gold, opacity: 0.5, flexShrink: 0 }}>—</span>
                  <p className="text-sm leading-relaxed" style={{ color: '#a1a1aa' }}>{item}</p>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ══════ FAQ ══════ */}
      <section className="px-6 py-10">
        <div className="max-w-2xl mx-auto">
          <Fade>
            <p className="text-[10px] tracking-[0.3em] uppercase font-medium text-center mb-10" style={{ color: C.gold }}>
              Questions fréquentes
            </p>
          </Fade>

          <Fade delay={0.1}>
            <div>
              {FAQ_ITEMS.map(item => (
                <FaqItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </Fade>
        </div>
      </section>

      <Divider />

      {/* ══════ FOOTER CTA ══════ */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-lg mx-auto space-y-6">
          <Fade>
            <p
              className="text-3xl sm:text-4xl italic font-light"
              style={{ fontFamily: 'var(--font-cormorant)', color: C.ivory }}
            >
              20 places. 13 juin. 18h00.
            </p>
            <p className="text-sm mt-4" style={{ color: '#737373' }}>
              Lac de Saint-Cassien, Var — 111€ par personne — acompte 21€
            </p>
          </Fade>

          <Fade delay={0.1}>
            <a
              href="#reservation"
              className="inline-block px-10 py-4 rounded-xl text-sm font-semibold transition-all hover:brightness-110"
              style={{ background: `linear-gradient(135deg, ${C.gold}, #B8960F)`, color: '#000' }}
            >
              Réserver ma place — 21€ d'acompte
            </a>
          </Fade>

          <Fade delay={0.2}>
            <p className="text-xs" style={{ color: '#525252' }}>
              Pas encore prêt(e) ?{' '}
              <Link href="/signature-emotionnelle" className="underline hover:opacity-80" style={{ color: C.gold }}>
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
        <div className="flex items-center justify-center gap-4 text-xs" style={{ color: '#525252' }}>
          <Link href="/mentions-legales" className="hover:underline">Mentions légales</Link>
          <span>·</span>
          <Link href="/confidentialite" className="hover:underline">Confidentialité</Link>
          <span>·</span>
          <Link href="/" className="hover:underline">Retour à l'accueil</Link>
        </div>
        <p className="text-xs mt-3" style={{ color: '#525252' }}>© 2026 SOS Shine®</p>
      </footer>

    </main>
  )
}
