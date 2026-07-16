'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

// ── Palette (doré SOS Shine en principal, crème lumineux, touche de violet) ──
const C = {
  cream: '#FAF7F2',
  violet: '#9C7C1E',   // (nom conservé) doré profond, lisible comme texte sur crème
  lavender: '#C9A961', // (nom conservé) doré vif — partenaire de dégradé
  gold: '#C9A961',     // doré SOS Shine
  goldSoft: '#E2CB86',
  ink: '#2B2733',
  dark: '#0A0A0F',     // section "avantage SOS Shine"
  accent: '#9B7EC8',   // la touche de violet (halos)
}
const serif = { fontFamily: 'var(--font-fraunces), Georgia, "Times New Roman", serif' }
const sans = { fontFamily: 'var(--font-figtree), -apple-system, system-ui, sans-serif' }
const ease = [0.16, 1, 0.3, 1] as [number, number, number, number]

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const PILIERS = [
  { icon: '🌱', title: 'Slow dating', body: '3 à 5 profils qualifiés par jour, pas plus. On privilégie la qualité de la rencontre à la quantité des swipes.' },
  { icon: '🤍', title: 'Authenticité radicale', body: 'Vérification manuelle des profils et modération humaine. Ici, on rencontre de vraies personnes, alignées et présentes.' },
  { icon: '🧘', title: 'Profondeur sans dogme', body: 'Une spiritualité inclusive : méditation, yoga, tantra, non-dualité… Chacun son chemin, sans jugement ni prosélytisme.' },
  { icon: '🔥', title: 'Communauté hybride', body: 'Des cercles thématiques, des événements virtuels et en présentiel. Rencontrer devient une expérience vivante.' },
]
const ETAPES = [
  { n: '01', title: 'Créez votre profil en conscience', body: 'Un questionnaire profond et un mini-test émotionnel SOS Shine révèlent qui vous êtes vraiment — au-delà des apparences.' },
  { n: '02', title: 'Recevez des profils vraiment compatibles', body: 'Chaque jour, quelques rencontres réellement alignées sur vos valeurs, votre chemin et vos schémas émotionnels.' },
  { n: '03', title: 'Connectez-vous en profondeur', body: 'Notes vocales, cercles de parole, événements. On se rencontre en présence, pas en performance.' },
]
const FAQ = [
  { q: "Quand l'application sort-elle ?", a: "Nous préparons le lancement de la bêta. En rejoignant la liste d'attente, vous serez parmi les premiers invités, en avant-première." },
  { q: 'Est-ce que c\'est religieux ?', a: "Non. SOS Meet accueille une spiritualité inclusive et sans dogme : méditation, yoga, tantra, non-dualité, développement personnel… Aucune appartenance requise, aucun prosélytisme." },
  { q: 'Quel sera le prix ?', a: "Le modèle sera freemium, avec une version gratuite généreuse. L'idée n'est pas de vous enfermer, mais de vous accompagner." },
  { q: 'Que deviennent mes données ?', a: "RGPD strict, hébergement en Europe, et localisation volontairement floutée. Vos données vous appartiennent, et vous pouvez vous désinscrire en un clic." },
  { q: 'Quel est le lien avec SOS Shine ?', a: "SOS Meet est porté par l'équipe de SOS Shine, plateforme de déconditionnement émotionnel. Vous arrivez déjà en travail sur vous — c'est ce qui change tout." },
  { q: 'Où l\'app sera-t-elle disponible d\'abord ?', a: 'La bêta démarrera à Paris, Lyon et Bordeaux, puis s\'étendra progressivement dans tout l\'espace francophone.' },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b" style={{ borderColor: 'rgba(43,39,51,0.1)' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 py-5 text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4"
        style={{ outlineColor: C.violet }}
      >
        <span className="text-[16px] sm:text-[17px] font-medium pr-2" style={{ ...sans, color: C.ink }}>{q}</span>
        <span className="shrink-0 text-2xl leading-none transition-transform duration-300" style={{ color: C.violet, transform: open ? 'rotate(45deg)' : 'none' }}>+</span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.4, ease }}
        className="overflow-hidden"
      >
        <p className="pb-5 text-[15px] leading-relaxed" style={{ ...sans, color: 'rgba(43,39,51,0.7)' }}>{a}</p>
      </motion.div>
    </div>
  )
}

export default function SosMeetClient() {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [city, setCity] = useState('')
  const [stage, setStage] = useState('')
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'already'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [count, setCount] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const hpRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/sosmeet/waitlist')
      .then((r) => r.json())
      .then((d) => setCount(typeof d.count === 'number' ? d.count : null))
      .catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!consent) { setError('Merci de cocher la case de consentement.'); return }
    setStatus('loading')
    try {
      const res = await fetch('/api/sosmeet/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName, city, stage, consent, hp: hpRef.current?.value || '' }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.message === 'already_registered') { setStatus('already'); return }
      if (res.ok) { setStatus('success'); setCount((c) => (c ?? 0) + 1); return }
      setError(data.error || 'Une erreur est survenue. Réessayez.')
      setStatus('idle')
    } catch {
      setError('Connexion impossible. Réessayez.')
      setStatus('idle')
    }
  }

  function share() {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const text = 'Rencontrez en conscience — je rejoins la liste d\'attente de SOS Meet ✨'
    if (typeof navigator !== 'undefined' && (navigator as Navigator).share) {
      ;(navigator as Navigator).share({ title: 'SOS Meet', text, url }).catch(() => {})
    } else {
      navigator.clipboard?.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
    }
  }

  const inputCls = 'w-full px-4 py-3.5 rounded-2xl text-[15px] outline-none transition-all border'
  const inputStyle: React.CSSProperties = { ...sans, background: '#fff', borderColor: 'rgba(43,39,51,0.12)', color: C.ink }

  const done = status === 'success' || status === 'already'

  return (
    <main style={{ ...sans, background: C.cream, color: C.ink }} className="min-h-screen overflow-x-hidden">
      {/* halos lumineux */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-0">
        <div className="absolute rounded-full blur-[120px] opacity-40" style={{ width: 520, height: 520, top: -120, left: -80, background: 'radial-gradient(circle,#9B7EC8,transparent 70%)' }} />
        <div className="absolute rounded-full blur-[130px] opacity-30" style={{ width: 480, height: 480, top: 200, right: -120, background: 'radial-gradient(circle,#C9A96E,transparent 70%)' }} />
      </div>

      <div className="relative z-10">
        {/* NAV */}
        <header className="max-w-6xl mx-auto px-5 sm:px-8 py-5 flex items-center justify-between">
          <span className="text-[19px] font-semibold" style={{ ...serif, color: C.violet }}>SOS Meet</span>
          <a href="#waitlist" className="text-[13px] sm:text-[14px] font-semibold px-5 py-2.5 rounded-full transition-transform hover:scale-[1.03]"
            style={{ background: C.gold, color: '#2b220e' }}>
            Liste d&apos;attente
          </a>
        </header>

        {/* 1. HERO */}
        <section className="max-w-4xl mx-auto px-5 sm:px-8 pt-12 sm:pt-20 pb-16 text-center">
          <Reveal>
            <span className="inline-block text-[11px] tracking-[0.2em] uppercase font-semibold px-4 py-1.5 rounded-full mb-8"
              style={{ background: 'rgba(201,169,97,0.08)', color: C.violet }}>
              Par l&apos;équipe SOS Shine
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="font-normal leading-[1.05] tracking-[-0.02em] mb-6" style={{ ...serif, fontSize: 'clamp(2.6rem,7vw,4.6rem)', color: C.ink }}>
              Rencontrez <span style={{ color: C.violet }}>en conscience.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mx-auto max-w-2xl text-[17px] sm:text-[19px] leading-relaxed mb-9" style={{ color: 'rgba(43,39,51,0.72)' }}>
              SOS Meet — l&apos;app de rencontres pour celles et ceux qui ont déjà commencé le chemin.
              Slow dating, profondeur spirituelle, zéro superficialité.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <a href="#waitlist" className="inline-flex items-center gap-2 text-[16px] font-semibold px-8 py-4 rounded-full transition-transform hover:scale-[1.03] active:scale-[0.98]"
              style={{ background: `linear-gradient(135deg, ${C.violet}, ${C.lavender})`, color: '#2b220e', boxShadow: '0 16px 40px -14px rgba(201,169,97,0.6)' }}>
              Rejoindre la liste d&apos;attente <span aria-hidden>→</span>
            </a>
            {count !== null && count > 0 && (
              <p className="mt-5 text-[13px]" style={{ color: 'rgba(43,39,51,0.5)' }}>
                Déjà <b style={{ color: C.violet }}>{count.toLocaleString('fr-FR')}</b> personne{count > 1 ? 's' : ''} en conscience sur la liste.
              </p>
            )}
          </Reveal>
        </section>

        {/* 2. LE PROBLÈME */}
        <section className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
          <Reveal className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-[11px] tracking-[0.22em] uppercase font-semibold mb-3" style={{ color: C.gold }}>Le constat</p>
            <h2 className="font-normal leading-tight" style={{ ...serif, fontSize: 'clamp(1.8rem,4.5vw,2.6rem)' }}>
              Les apps de rencontre nous ont épuisés.
            </h2>
          </Reveal>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              ['🌀', 'La fatigue du swipe', 'Des heures à faire défiler des visages, pour un vide qui grandit. Le jeu est conçu pour ne jamais s\'arrêter.'],
              ['🪞', 'La superficialité', 'Des profils réduits à trois photos et une punchline. On ne rencontre plus des êtres, mais des vitrines.'],
              ['🧭', "L'absence d'alignement", 'Difficile de croiser des personnes qui cheminent vraiment — sur la présence, le sens, la conscience.'],
            ].map(([ic, t, b], i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="h-full rounded-[26px] p-7" style={{ background: '#fff', border: '1px solid rgba(43,39,51,0.07)' }}>
                  <div className="text-3xl mb-4">{ic}</div>
                  <h3 className="text-[18px] font-semibold mb-2" style={{ color: C.ink }}>{t}</h3>
                  <p className="text-[14.5px] leading-relaxed" style={{ color: 'rgba(43,39,51,0.65)' }}>{b}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* 3. LA SOLUTION */}
        <section className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
          <Reveal className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-[11px] tracking-[0.22em] uppercase font-semibold mb-3" style={{ color: C.violet }}>Notre approche</p>
            <h2 className="font-normal leading-tight" style={{ ...serif, fontSize: 'clamp(1.8rem,4.5vw,2.6rem)' }}>
              Une autre manière de se rencontrer.
            </h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 gap-5">
            {PILIERS.map((p, i) => (
              <Reveal key={i} delay={(i % 2) * 0.08}>
                <div className="h-full rounded-[28px] p-8 transition-transform hover:-translate-y-1"
                  style={{ background: 'linear-gradient(160deg,#fff,#FBF8F3)', border: '1px solid rgba(201,169,97,0.12)' }}>
                  <div className="text-3xl mb-4">{p.icon}</div>
                  <h3 className="text-[20px] font-semibold mb-2.5" style={{ ...serif, color: C.violet }}>{p.title}</h3>
                  <p className="text-[15px] leading-relaxed" style={{ color: 'rgba(43,39,51,0.68)' }}>{p.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* 4. AVANTAGE SOS SHINE */}
        <section className="py-16 sm:py-24" style={{ background: 'linear-gradient(160deg,#0A0A0F,#1a1510)' }}>
          <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center" style={{ color: C.cream }}>
            <Reveal>
              <p className="text-[11px] tracking-[0.22em] uppercase font-semibold mb-4" style={{ color: C.gold }}>L&apos;avantage SOS Shine</p>
              <h2 className="font-normal leading-tight mb-6" style={{ ...serif, fontSize: 'clamp(1.9rem,5vw,3rem)' }}>
                Briller avant de rencontrer.
              </h2>
              <p className="mx-auto max-w-2xl text-[16px] sm:text-[17px] leading-relaxed" style={{ color: 'rgba(250,247,242,0.82)' }}>
                Vous n&apos;arrivez pas de nulle part : vous êtes déjà en travail sur vous. SOS Meet s&apos;appuie sur SOS Shine
                pour aller plus loin qu&apos;aucune app de rencontre.
              </p>
            </Reveal>
            <div className="grid sm:grid-cols-3 gap-5 mt-12 text-left">
              {[
                ['🧠', 'Mini-test émotionnel', 'Intégré à votre profil : il révèle vos schémas, pas seulement vos goûts.'],
                ['🧩', 'Matching en profondeur', 'On tient compte de vos schémas de protection pour des liens plus justes.'],
                ['✨', 'Contenus « Relations Conscientes »', 'Des ressources co-brandées pour aimer mieux, à deux comme seul·e.'],
              ].map(([ic, t, b], i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <div className="h-full rounded-[24px] p-6" style={{ background: 'rgba(250,247,242,0.08)', border: '1px solid rgba(250,247,242,0.14)' }}>
                    <div className="text-2xl mb-3">{ic}</div>
                    <h3 className="text-[16px] font-semibold mb-1.5">{t}</h3>
                    <p className="text-[14px] leading-relaxed" style={{ color: 'rgba(250,247,242,0.72)' }}>{b}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 5. COMMENT ÇA MARCHE */}
        <section className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
          <Reveal className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-[11px] tracking-[0.22em] uppercase font-semibold mb-3" style={{ color: C.gold }}>Comment ça marche</p>
            <h2 className="font-normal leading-tight" style={{ ...serif, fontSize: 'clamp(1.8rem,4.5vw,2.6rem)' }}>
              Trois étapes, en présence.
            </h2>
          </Reveal>
          <div className="grid sm:grid-cols-3 gap-5">
            {ETAPES.map((s, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="h-full rounded-[26px] p-7" style={{ background: '#fff', border: '1px solid rgba(43,39,51,0.07)' }}>
                  <div className="text-[30px] font-semibold mb-3" style={{ ...serif, color: C.lavender }}>{s.n}</div>
                  <h3 className="text-[18px] font-semibold mb-2" style={{ color: C.ink }}>{s.title}</h3>
                  <p className="text-[14.5px] leading-relaxed" style={{ color: 'rgba(43,39,51,0.65)' }}>{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* 6. WAITLIST */}
        <section id="waitlist" className="max-w-xl mx-auto px-5 sm:px-8 py-16 sm:py-24 scroll-mt-8">
          <div className="rounded-[32px] p-7 sm:p-10" style={{ background: '#fff', border: '1px solid rgba(201,169,97,0.15)', boxShadow: '0 40px 90px -50px rgba(201,169,97,0.4)' }}>
            {!done ? (
              <>
                <Reveal>
                  <h2 className="font-normal leading-tight text-center mb-2" style={{ ...serif, fontSize: 'clamp(1.7rem,4.4vw,2.3rem)' }}>
                    Rejoignez la liste d&apos;attente
                  </h2>
                  <p className="text-center text-[15px] leading-relaxed mb-8" style={{ color: 'rgba(43,39,51,0.62)' }}>
                    Soyez parmi les premiers invités à la bêta. Aucune carte bancaire, désinscription en un clic.
                  </p>
                </Reveal>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* honeypot */}
                  <input ref={hpRef} type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

                  <div>
                    <label htmlFor="sm-first" className="block text-[13px] font-medium mb-1.5" style={{ color: C.ink }}>Prénom</label>
                    <input id="sm-first" required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Votre prénom"
                      className={inputCls} style={inputStyle} />
                  </div>
                  <div>
                    <label htmlFor="sm-email" className="block text-[13px] font-medium mb-1.5" style={{ color: C.ink }}>Email</label>
                    <input id="sm-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@email.com"
                      className={inputCls} style={inputStyle} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="sm-city" className="block text-[13px] font-medium mb-1.5" style={{ color: C.ink }}>Ville <span style={{ color: 'rgba(43,39,51,0.4)' }}>(optionnel)</span></label>
                      <select id="sm-city" value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} style={inputStyle}>
                        <option value="">Choisir…</option>
                        <option>Paris</option><option>Lyon</option><option>Bordeaux</option><option>Autre</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="sm-stage" className="block text-[13px] font-medium mb-1.5" style={{ color: C.ink }}>Où en êtes-vous ? <span style={{ color: 'rgba(43,39,51,0.4)' }}>(optionnel)</span></label>
                      <select id="sm-stage" value={stage} onChange={(e) => setStage(e.target.value)} className={inputCls} style={inputStyle}>
                        <option value="">Choisir…</option>
                        <option>Je débute mon chemin</option>
                        <option>Je pratique régulièrement</option>
                        <option>C&apos;est au cœur de ma vie</option>
                      </select>
                    </div>
                  </div>
                  <label className="flex items-start gap-3 pt-1 cursor-pointer">
                    <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required
                      className="mt-1 w-4 h-4 shrink-0" style={{ accentColor: C.violet }} />
                    <span className="text-[13px] leading-relaxed" style={{ color: 'rgba(43,39,51,0.62)' }}>
                      J&apos;accepte de recevoir des nouvelles de SOS Meet. Désinscription en un clic.
                    </span>
                  </label>

                  {error && <p className="text-[13px]" style={{ color: '#c0392b' }}>{error}</p>}

                  <button type="submit" disabled={status === 'loading'} className="w-full py-4 rounded-full text-[15px] font-semibold transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
                    style={{ background: `linear-gradient(135deg, ${C.violet}, ${C.lavender})`, color: '#2b220e', boxShadow: '0 14px 34px -14px rgba(201,169,97,0.6)' }}>
                    {status === 'loading' ? 'Un instant…' : 'Rejoindre la liste d\'attente'}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="text-5xl mb-4">{status === 'already' ? '✨' : '🤍'}</div>
                <h2 className="font-normal leading-tight mb-3" style={{ ...serif, fontSize: 'clamp(1.6rem,4.2vw,2.1rem)' }}>
                  {status === 'already' ? 'Vous êtes déjà sur la liste ✨' : 'Bienvenue sur le chemin.'}
                </h2>
                <p className="text-[15px] leading-relaxed mb-8" style={{ color: 'rgba(43,39,51,0.66)' }}>
                  {status === 'already'
                    ? 'Votre place est bien réservée. Nous vous préviendrons dès l\'ouverture de la bêta.'
                    : 'Votre place est réservée. Vous ferez partie des premiers invités à la bêta.'}
                  <br />Envie de faire venir les bonnes personnes ? Partagez SOS Meet.
                </p>
                <div className="flex flex-col items-center gap-3">
                  <Link
                    href={`/sos-meet/profil?email=${encodeURIComponent(email)}`}
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-[15px] font-semibold transition-transform hover:scale-[1.03]"
                    style={{ background: `linear-gradient(135deg, ${C.violet}, ${C.lavender})`, color: '#2b220e', boxShadow: '0 14px 34px -14px rgba(201,169,97,0.6)' }}
                  >
                    Préparer mon profil de compatibilité <span aria-hidden>→</span>
                  </Link>
                  <span className="text-[12px]" style={{ color: 'rgba(43,39,51,0.45)' }}>~10 min · vous prenez de l&apos;avance sur vos futures rencontres</span>
                  <button onClick={share} className="inline-flex items-center gap-2 mt-2 px-6 py-3 rounded-full text-[14px] font-semibold transition-transform hover:scale-[1.03]"
                    style={{ background: 'transparent', color: C.violet, border: `1px solid rgba(201,169,97,0.3)` }}>
                    {copied ? 'Lien copié ✓' : 'Partager SOS Meet'} <span aria-hidden>↗</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 7. FAQ */}
        <section className="max-w-2xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
          <Reveal className="text-center mb-10">
            <h2 className="font-normal leading-tight" style={{ ...serif, fontSize: 'clamp(1.7rem,4.4vw,2.4rem)' }}>Questions fréquentes</h2>
          </Reveal>
          <div>{FAQ.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}</div>
        </section>

        {/* 8. FOOTER */}
        <footer className="py-12" style={{ borderTop: '1px solid rgba(43,39,51,0.08)' }}>
          <div className="max-w-5xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <span className="text-[18px] font-semibold" style={{ ...serif, color: C.violet }}>SOS Meet</span>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px]" style={{ color: 'rgba(43,39,51,0.6)' }}>
              <a href="https://sosshine.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-70">SOS Shine ↗</a>
              <Link href="/mentions-legales" className="hover:opacity-70">Mentions légales</Link>
              <Link href="/confidentialite" className="hover:opacity-70">Confidentialité</Link>
            </div>
            <span className="text-[12px]" style={{ color: 'rgba(43,39,51,0.4)' }}>© {new Date().getFullYear()} SOS Meet</span>
          </div>
        </footer>
      </div>
    </main>
  )
}
