'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

// ── Charte SOS Meet — « couture après minuit » (indépendante de SOS Shine) ──
const C = {
  ink: '#0A090B',
  velvet: '#120E11',
  card: '#151016',
  garnet: '#9B1B2E',
  garnetSoft: '#7d1723',
  ember: '#C1121F',
  alabaster: '#F2EBE4',
  smoke: '#A99A96',
  smoke2: '#6E6360',
  line: 'rgba(242,235,228,0.12)',
}
const serif = { fontFamily: "var(--sm-serif), Georgia, serif" }
const sans = { fontFamily: "var(--sm-sans), system-ui, sans-serif" }
const ease = [0.16, 1, 0.3, 1] as [number, number, number, number]

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const ETAPES = [
  {
    n: '01', soloTitle: 'Se révéler', coupleTitle: 'Se raconter',
    solo: 'Un profil d’une profondeur rare — tes intentions, tes valeurs, ton monde intérieur, tes non-négociables. On te connaît par cœur avant de te montrer.',
    couple: 'Chacun répond de son côté, en vérité — ce qu’on n’ose plus se dire, ce qui manque, ce qu’on espère encore. Deux regards honnêtes sur le même lien.',
  },
  {
    n: '02', soloTitle: 'Être compris', coupleTitle: 'Se comprendre',
    solo: 'Notre lecture de compatibilité rapproche ce qui compte vraiment. Pas des apparences : des âmes qui cherchent la même chose.',
    couple: 'Notre lecture révèle où vous vous rejoignez encore et où le lien s’est distendu. Pas un verdict : une carte pour se retrouver.',
  },
  {
    n: '03', soloTitle: 'Se rencontrer', coupleTitle: 'Se retrouver',
    solo: 'Quand le désir est réciproque, le visage se dévoile et la conversation s’ouvre. Le trouble d’un vrai commencement.',
    couple: 'Un chemin guidé pour raviver ce qui s’est endormi, rouvrir le dialogue et vous redécouvrir. Le trouble d’un recommencement.',
  },
]

const FAQ = [
  { q: 'Pourquoi on ne voit pas les photos tout de suite ?', a: 'Parce qu’ici, l’émotionnel passe avant l’apparence. Tu découvres qui est la personne — ses valeurs, son monde intérieur — et la photo se dévoile seulement quand l’intérêt est réciproque. Le trouble d’un vrai commencement.' },
  { q: 'Comment savez-vous si quelqu’un est sincère ?', a: 'Notre lecture analyse la cohérence des réponses entre elles. Les profils incohérents sont mis en retrait ; les plus sincères reçoivent un badge « Profil cohérent ». On protège la qualité des rencontres.' },
  { q: 'Je suis en couple — c’est aussi pour nous ?', a: 'Oui. À côté du chemin solo « Rencontrer », il y a la porte « Se retrouver » : un parcours pensé pour les couples qui veulent se redécouvrir l’un l’autre et raviver ce qui s’est endormi. Même exigence de vérité, à deux cette fois — et bien moins cher qu’une rupture.' },
  { q: 'Quel est le lien avec SOS Shine ?', a: 'SOS Meet est porté par l’équipe de SOS Shine, plateforme de déconditionnement émotionnel. Le travail intérieur que tu y accomplis — les protocoles traversés — apparaît sur ton profil. Ici, avoir fait le chemin, c’est ce qui rend attirant.' },
  { q: 'Combien ça coûte ?', a: 'Gratuit au lancement. On veut d’abord réunir les bonnes personnes.' },
  { q: 'Que deviennent mes données ?', a: 'RGPD strict, hébergement en Europe, consentement explicite pour les questions sensibles, et localisation volontairement floutée. Tes données t’appartiennent, désinscription en un clic.' },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b" style={{ borderColor: C.line }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 py-5 text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4"
        style={{ outlineColor: C.garnet }}
      >
        <span className="text-[16px] sm:text-[17px] font-normal pr-2" style={{ ...sans, color: C.alabaster }}>{q}</span>
        <span className="shrink-0 text-2xl leading-none transition-transform duration-300" style={{ color: C.garnet, transform: open ? 'rotate(45deg)' : 'none' }}>+</span>
      </button>
      <motion.div initial={false} animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }} transition={{ duration: 0.4, ease }} className="overflow-hidden">
        <p className="pb-5 text-[15px] leading-relaxed" style={{ ...sans, color: C.smoke }}>{a}</p>
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
    fetch('/api/sosmeet/waitlist').then((r) => r.json()).then((d) => setCount(typeof d.count === 'number' ? d.count : null)).catch(() => {})
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
    const text = 'La rencontre en conscience — je rejoins SOS Meet.'
    if (typeof navigator !== 'undefined' && (navigator as Navigator).share) {
      ;(navigator as Navigator).share({ title: 'SOS Meet', text, url }).catch(() => {})
    } else {
      navigator.clipboard?.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
    }
  }

  const inputCls = 'w-full px-4 py-3.5 rounded-xl text-[15px] outline-none transition-all border'
  const inputStyle: React.CSSProperties = { ...sans, background: 'rgba(255,255,255,0.03)', borderColor: C.line, color: C.alabaster }
  const done = status === 'success' || status === 'already'

  return (
    <main style={{ ...sans, background: C.ink, color: C.alabaster }} className="min-h-screen overflow-x-hidden">
      {/* grain + halo grenat ambiant */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0" style={{
        background: 'radial-gradient(120% 70% at 50% -10%, rgba(155,27,46,0.20), transparent 55%), radial-gradient(70% 50% at 90% 108%, rgba(155,27,46,0.10), transparent 60%)',
      }} />

      <div className="relative z-10">
        {/* NAV */}
        <header className="max-w-6xl mx-auto px-5 sm:px-8 py-6 flex items-center justify-between">
          <span className="text-[22px]" style={{ ...serif, fontWeight: 500 }}>SOS Meet<span style={{ color: C.garnet }}>.</span></span>
          <a href="#waitlist" className="text-[12px] tracking-[0.16em] uppercase px-5 py-2.5 rounded-full transition-colors"
            style={{ border: `1px solid ${C.line}`, color: C.alabaster }}>
            Créer mon profil
          </a>
        </header>

        {/* 1. HERO — deux portes */}
        <section className="relative overflow-hidden" style={{ minHeight: '100vh' }}>
          {/* Fond statique et chic — profondeur par un dégradé grenat doux (aucune animation) */}
          <div aria-hidden className="absolute inset-0" style={{ zIndex: 0, background: 'radial-gradient(75% 50% at 50% 0%, rgba(155,27,46,0.16), transparent 62%), radial-gradient(55% 45% at 88% 104%, rgba(155,27,46,0.08), transparent 60%)' }} />

          <div className="relative max-w-5xl mx-auto px-5 sm:px-8 min-h-screen flex flex-col justify-center py-24 text-center" style={{ zIndex: 2 }}>
            <Reveal>
              <span className="text-[11px] tracking-[0.42em] uppercase" style={{ color: C.ember }}>La rencontre en conscience</span>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mt-4 mb-5" style={{ ...serif, fontWeight: 400, fontSize: 'clamp(2.6rem,7.5vw,5rem)', lineHeight: 1, letterSpacing: '-0.01em' }}>
                Deux chemins<br />vers l’amour <em style={{ color: C.garnet, fontStyle: 'italic' }}>vrai</em>.
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mx-auto max-w-md text-[16px] sm:text-[18px] leading-relaxed" style={{ color: C.smoke, fontWeight: 300 }}>
                Que tu cherches à rencontrer, ou à te retrouver — ici, tout commence par la vérité de qui vous êtes.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="grid sm:grid-cols-2 gap-5 mt-12 text-left">
                {/* Porte 1 — Solo */}
                <Link href="/sos-meet/profil" className="group relative rounded-2xl overflow-hidden flex flex-col justify-end min-h-[300px] transition-transform hover:-translate-y-1" style={{ border: `1px solid ${C.line}` }}>
                  <img src="/sosmeet/hero-silhouettes.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-55 transition-opacity duration-500 group-hover:opacity-75" style={{ objectPosition: 'center 12%' }} />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(10,9,11,.2), rgba(10,9,11,.55) 55%, rgba(10,9,11,.92))' }} />
                  <div className="relative p-7">
                    <div className="text-[11px] tracking-[0.3em] uppercase" style={{ color: C.ember }}>Seul·e</div>
                    <h3 className="mt-2 mb-2" style={{ ...serif, fontWeight: 400, fontSize: 'clamp(1.6rem,3.4vw,2.2rem)' }}>Rencontrer</h3>
                    <p className="text-[14px] mb-4" style={{ color: C.smoke }}>Je me découvre, et je m’ouvre à une rencontre juste — en conscience.</p>
                    <span className="inline-flex items-center gap-2 text-[13px] tracking-[0.12em] uppercase px-6 py-3 rounded-full" style={{ background: `linear-gradient(135deg, ${C.garnet}, ${C.garnetSoft})`, color: '#F7EEE9' }}>Créer mon profil <span aria-hidden>→</span></span>
                  </div>
                </Link>
                {/* Porte 2 — Couple */}
                <Link href="/sos-meet/couple" className="group relative rounded-2xl overflow-hidden flex flex-col justify-end min-h-[300px] transition-transform hover:-translate-y-1" style={{ border: `1px solid ${C.line}` }}>
                  <img src="/sosmeet/couple.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-55 transition-opacity duration-500 group-hover:opacity-75" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(10,9,11,.2), rgba(10,9,11,.55) 55%, rgba(10,9,11,.92))' }} />
                  <div className="relative p-7">
                    <div className="text-[11px] tracking-[0.3em] uppercase" style={{ color: C.ember }}>À deux</div>
                    <h3 className="mt-2 mb-2" style={{ ...serif, fontWeight: 400, fontSize: 'clamp(1.6rem,3.4vw,2.2rem)' }}>Se retrouver</h3>
                    <p className="text-[14px] mb-4" style={{ color: C.smoke }}>Nous sommes deux, et nous voulons nous re-rencontrer. Raviver ce qui s’est endormi.</p>
                    <span className="inline-flex items-center gap-2 text-[13px] tracking-[0.12em] uppercase px-6 py-3 rounded-full" style={{ border: `1px solid rgba(242,235,228,.28)`, color: C.alabaster }}>Commencer à deux <span aria-hidden>→</span></span>
                  </div>
                </Link>
              </div>
              <p className="mt-7 text-[12.5px]" style={{ color: C.smoke2 }}>
                Gratuit au lancement · <b style={{ color: C.smoke }}>Se retrouver coûte bien moins qu’une rupture.</b>
                {count !== null && count > 0 && <> · déjà <b style={{ color: C.smoke }}>{count.toLocaleString('fr-FR')}</b> inscrit{count > 1 ? 's' : ''}</>}
              </p>
            </Reveal>
          </div>
        </section>

        {/* 1bis. LES DEUX CHEMINS — comparatif */}
        <section className="max-w-5xl mx-auto px-5 sm:px-8 py-24">
          <Reveal className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-[11px] tracking-[0.34em] uppercase mb-3" style={{ color: C.smoke2 }}>Deux portes, une même exigence</p>
            <h2 style={{ ...serif, fontWeight: 400, fontSize: 'clamp(2rem,5vw,3.2rem)' }}>Selon là où vous en êtes</h2>
            <p className="mt-4 text-[15.5px] leading-relaxed" style={{ color: C.smoke }}>
              La même conviction traverse les deux chemins : l’amour vrai commence par la vérité de qui l’on est. À vous de choisir votre porte.
            </p>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-5">
            {/* Chemin solo */}
            <Reveal>
              <div className="h-full rounded-2xl p-8 flex flex-col" style={{ background: C.velvet, border: `1px solid ${C.line}` }}>
                <div className="text-[11px] tracking-[0.3em] uppercase" style={{ color: C.ember }}>Seul·e — Rencontrer</div>
                <h3 className="mt-3 mb-3" style={{ ...serif, fontWeight: 500, fontSize: 'clamp(1.5rem,3.4vw,2rem)' }}>Se découvrir, puis rencontrer</h3>
                <p className="text-[14.5px] leading-relaxed mb-5" style={{ color: C.smoke }}>
                  Un profil d’une profondeur rare, une lecture de compatibilité qui va au-delà des visages, et la rencontre qui se dévoile quand le désir devient réciproque.
                </p>
                <Link href="/sos-meet/profil" className="mt-auto inline-flex items-center gap-2 text-[13px] tracking-[0.12em] uppercase px-6 py-3 rounded-full self-start" style={{ background: `linear-gradient(135deg, ${C.garnet}, ${C.garnetSoft})`, color: '#F7EEE9' }}>Créer mon profil <span aria-hidden>→</span></Link>
              </div>
            </Reveal>
            {/* Chemin couple */}
            <Reveal delay={0.08}>
              <div className="h-full rounded-2xl p-8 flex flex-col" style={{ background: C.velvet, border: `1px solid ${C.line}` }}>
                <div className="text-[11px] tracking-[0.3em] uppercase" style={{ color: C.ember }}>À deux — Se retrouver</div>
                <h3 className="mt-3 mb-3" style={{ ...serif, fontWeight: 500, fontSize: 'clamp(1.5rem,3.4vw,2rem)' }}>Se re-rencontrer, vraiment</h3>
                <p className="text-[14.5px] leading-relaxed mb-5" style={{ color: C.smoke }}>
                  Pour les couples qui sentent la routine s’installer : un parcours pour se redécouvrir l’un l’autre et raviver ce qui s’est endormi. <b style={{ color: C.smoke }}>Bien moins cher qu’une rupture.</b>
                </p>
                <Link href="/sos-meet/couple" className="mt-auto inline-flex items-center gap-2 text-[13px] tracking-[0.12em] uppercase px-6 py-3 rounded-full self-start" style={{ border: `1px solid rgba(242,235,228,.28)`, color: C.alabaster }}>Commencer à deux <span aria-hidden>→</span></Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* 2. LE PRINCIPE — les deux parcours, temps par temps */}
        <section className="max-w-5xl mx-auto px-5 sm:px-8 py-24">
          <Reveal className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-[11px] tracking-[0.34em] uppercase mb-3" style={{ color: C.smoke2 }}>Le principe</p>
            <h2 style={{ ...serif, fontWeight: 400, fontSize: 'clamp(2rem,5vw,3.2rem)' }}>Trois temps, une vérité</h2>
            <p className="mt-4 text-[14.5px]" style={{ color: C.smoke2 }}>Le même mouvement pour les deux portes — que vous veniez rencontrer, ou vous retrouver.</p>
          </Reveal>
          <div className="grid sm:grid-cols-3" style={{ gap: 1, background: C.line, border: `1px solid ${C.line}`, borderRadius: 6, overflow: 'hidden' }}>
            {ETAPES.map((s, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="h-full p-9 flex flex-col" style={{ background: C.velvet }}>
                  <div style={{ ...serif, fontStyle: 'italic', fontSize: 34, color: C.garnet }}>{s.n}</div>
                  <div className="mt-5">
                    <div className="text-[10px] tracking-[0.28em] uppercase mb-1.5" style={{ color: C.ember }}>Seul·e</div>
                    <h3 className="mb-2 text-[20px]" style={{ ...serif, fontWeight: 500 }}>{s.soloTitle}</h3>
                    <p className="text-[13.5px] leading-relaxed" style={{ color: C.smoke }}>{s.solo}</p>
                  </div>
                  <div className="mt-6 pt-5" style={{ borderTop: `1px solid ${C.line}` }}>
                    <div className="text-[10px] tracking-[0.28em] uppercase mb-1.5" style={{ color: C.ember }}>À deux</div>
                    <h3 className="mb-2 text-[20px]" style={{ ...serif, fontWeight: 500 }}>{s.coupleTitle}</h3>
                    <p className="text-[13.5px] leading-relaxed" style={{ color: C.smoke }}>{s.couple}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* 3. RÉVÉLATION PROGRESSIVE */}
        <section className="max-w-5xl mx-auto px-5 sm:px-8 py-20">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <Reveal className="flex gap-4">
              <img src="/sosmeet/masked-she.png" alt="" className="w-1/2 rounded-2xl object-cover aspect-square" style={{ border: `1px solid ${C.line}` }} />
              <img src="/sosmeet/masked-he.png" alt="" className="w-1/2 rounded-2xl object-cover aspect-square mt-8" style={{ border: `1px solid ${C.line}` }} />
            </Reveal>
            <Reveal delay={0.1}>
              <span className="text-[11px] tracking-[0.3em] uppercase" style={{ color: C.ember }}>La vérité d’abord</span>
              <h2 className="mt-3 mb-4" style={{ ...serif, fontWeight: 400, fontSize: 'clamp(1.9rem,4.6vw,2.8rem)', lineHeight: 1.05 }}>
                On commence par ce qui ne ment pas
              </h2>
              <p className="text-[15.5px] leading-relaxed" style={{ color: C.smoke }}>
                <b style={{ color: C.alabaster }}>Pour rencontrer :</b> on découvre d’abord les valeurs, les intentions, le monde intérieur. La photo reste voilée et ne se dévoile qu’au moment où le désir devient réciproque. On ne swipe pas des visages, on rencontre des présences.
              </p>
              <p className="text-[15.5px] leading-relaxed mt-4" style={{ color: C.smoke }}>
                <b style={{ color: C.alabaster }}>Pour se retrouver :</b> chacun répond en vérité, sans masque et sans jugement. Ce qu’on n’ose plus se dire trouve enfin un espace — et redevient un point de départ.
              </p>
            </Reveal>
          </div>
        </section>

        {/* 4. COMPATIBILITÉ + SINCÉRITÉ */}
        <section className="max-w-5xl mx-auto px-5 sm:px-8 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <Reveal className="flex items-center justify-center">
              <div className="relative aspect-square w-full max-w-[320px] flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(242,235,228,0.08)" strokeWidth="1.5" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="url(#smg)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="282.7" strokeDashoffset="17" />
                  <defs><linearGradient id="smg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={C.garnet} /><stop offset="1" stopColor={C.ember} /></linearGradient></defs>
                </svg>
                <div className="text-center">
                  <div style={{ ...serif, fontSize: 'clamp(3.4rem,9vw,5rem)', lineHeight: 1 }}>94<span style={{ fontSize: '1.4rem', color: C.smoke }}>%</span></div>
                  <span className="text-[11px] tracking-[0.34em] uppercase" style={{ color: C.smoke2 }}>Compatibilité</span>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <span className="text-[11px] tracking-[0.3em] uppercase" style={{ color: C.ember }}>La lecture de compatibilité</span>
              <h2 className="mt-3 mb-4" style={{ ...serif, fontWeight: 400, fontSize: 'clamp(1.9rem,4.6vw,2.8rem)', lineHeight: 1.05 }}>
                Une lecture juste, question après question
              </h2>
              <p className="text-[15.5px] leading-relaxed" style={{ color: C.smoke }}>
                <b style={{ color: C.alabaster }}>Seul·e :</b> on commence par l’essentiel — assez pour présenter tes premières rencontres — puis ton profil s’approfondit à ton rythme, et chaque réponse affine ce que la vie t’envoie.
              </p>
              <p className="text-[15.5px] leading-relaxed mt-4" style={{ color: C.smoke }}>
                <b style={{ color: C.alabaster }}>À deux :</b> la même lecture révèle où vous vous rejoignez encore et où le lien s’est distendu — une carte claire pour rouvrir le dialogue et vous retrouver.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px]"
                style={{ background: 'rgba(155,27,46,0.12)', color: C.ember, border: '1px solid rgba(155,27,46,0.25)' }}>
                <span aria-hidden>✦</span> Les réponses incohérentes sont repérées — les profils sincères, mis en avant
              </div>
            </Reveal>
          </div>
        </section>

        {/* 5. AVANTAGE SOS SHINE — velours */}
        <section className="relative py-24 my-8 overflow-hidden">
          <img src="/sosmeet/velvet.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-45" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(10,9,11,0.85), rgba(10,9,11,0.5))' }} />
          <div className="relative max-w-3xl mx-auto px-5 sm:px-8 text-center">
            <Reveal>
              <p className="text-[11px] tracking-[0.34em] uppercase mb-4" style={{ color: C.ember }}>Le chemin accompli</p>
              <h2 className="mb-5" style={{ ...serif, fontWeight: 400, fontStyle: 'italic', fontSize: 'clamp(2rem,5.5vw,3.4rem)', lineHeight: 1.05 }}>
                Ici, avoir fait le travail rend attirant
              </h2>
              <p className="mx-auto max-w-xl text-[16px] leading-relaxed" style={{ color: C.smoke }}>
                SOS Meet est relié à SOS Shine. Les protocoles émotionnels que tu traverses apparaissent sur ton profil — un signal rare de sincérité et de maturité. Pas une bio : un chemin réel.
              </p>
            </Reveal>
          </div>
        </section>

        {/* 6. WAITLIST */}
        <section id="waitlist" className="max-w-xl mx-auto px-5 sm:px-8 py-24 scroll-mt-8">
          <div className="rounded-3xl p-7 sm:p-10" style={{ background: C.card, border: `1px solid ${C.line}`, boxShadow: '0 50px 100px -60px rgba(155,27,46,0.5)' }}>
            {!done ? (
              <>
                <Reveal>
                  <h2 className="text-center mb-2" style={{ ...serif, fontWeight: 400, fontSize: 'clamp(1.7rem,4.4vw,2.3rem)' }}>Rejoindre SOS Meet</h2>
                  <p className="text-center text-[15px] leading-relaxed mb-8" style={{ color: C.smoke }}>
                    Gratuit au lancement. Aucune carte bancaire, désinscription en un clic.
                  </p>
                </Reveal>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input ref={hpRef} type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
                  <div>
                    <label htmlFor="sm-first" className="block text-[13px] mb-1.5" style={{ color: C.smoke }}>Prénom</label>
                    <input id="sm-first" required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Votre prénom" className={inputCls} style={inputStyle} />
                  </div>
                  <div>
                    <label htmlFor="sm-email" className="block text-[13px] mb-1.5" style={{ color: C.smoke }}>Email</label>
                    <input id="sm-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@email.com" className={inputCls} style={inputStyle} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="sm-city" className="block text-[13px] mb-1.5" style={{ color: C.smoke }}>Ville <span style={{ color: C.smoke2 }}>(optionnel)</span></label>
                      <select id="sm-city" value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} style={inputStyle}>
                        <option value="" style={{ color: '#111' }}>Choisir…</option>
                        <option style={{ color: '#111' }}>Paris</option><option style={{ color: '#111' }}>Lyon</option><option style={{ color: '#111' }}>Bordeaux</option><option style={{ color: '#111' }}>Autre</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="sm-stage" className="block text-[13px] mb-1.5" style={{ color: C.smoke }}>Où en êtes-vous ? <span style={{ color: C.smoke2 }}>(optionnel)</span></label>
                      <select id="sm-stage" value={stage} onChange={(e) => setStage(e.target.value)} className={inputCls} style={inputStyle}>
                        <option value="" style={{ color: '#111' }}>Choisir…</option>
                        <option style={{ color: '#111' }}>Je débute mon chemin</option>
                        <option style={{ color: '#111' }}>Je pratique régulièrement</option>
                        <option style={{ color: '#111' }}>C&apos;est au cœur de ma vie</option>
                      </select>
                    </div>
                  </div>
                  <label className="flex items-start gap-3 pt-1 cursor-pointer">
                    <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required className="mt-1 w-4 h-4 shrink-0" style={{ accentColor: C.garnet }} />
                    <span className="text-[13px] leading-relaxed" style={{ color: C.smoke }}>J&apos;accepte de recevoir des nouvelles de SOS Meet. Désinscription en un clic.</span>
                  </label>
                  {error && <p className="text-[13px]" style={{ color: C.ember }}>{error}</p>}
                  <button type="submit" disabled={status === 'loading'} className="w-full py-4 rounded-full text-[14px] tracking-[0.12em] uppercase transition-transform hover:-translate-y-0.5 disabled:opacity-60"
                    style={{ background: `linear-gradient(135deg, ${C.garnet}, ${C.garnetSoft})`, color: '#F7EEE9', boxShadow: '0 14px 34px -14px rgba(155,27,46,0.6)' }}>
                    {status === 'loading' ? 'Un instant…' : 'Rejoindre SOS Meet'}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-4">
                <div style={{ ...serif, fontSize: 44, color: C.garnet }}>{status === 'already' ? '✦' : '♥'}</div>
                <h2 className="mt-2 mb-3" style={{ ...serif, fontWeight: 400, fontSize: 'clamp(1.6rem,4.2vw,2.1rem)' }}>
                  {status === 'already' ? 'Tu es déjà des nôtres' : 'Bienvenue.'}
                </h2>
                <p className="text-[15px] leading-relaxed mb-8" style={{ color: C.smoke }}>
                  {status === 'already'
                    ? 'Ta place est réservée. On te prévient dès l’ouverture.'
                    : 'Ta place est réservée. Tu feras partie des premiers.'}
                  <br />Prends de l’avance : commence ton profil.
                </p>
                <div className="flex flex-col items-center gap-3">
                  <Link href={`/sos-meet/profil?email=${encodeURIComponent(email)}`}
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-[14px] tracking-[0.1em] uppercase transition-transform hover:-translate-y-0.5"
                    style={{ background: `linear-gradient(135deg, ${C.garnet}, ${C.garnetSoft})`, color: '#F7EEE9', boxShadow: '0 14px 34px -14px rgba(155,27,46,0.6)' }}>
                    Commencer mon profil <span aria-hidden>→</span>
                  </Link>
                  <span className="text-[12px]" style={{ color: C.smoke2 }}>~10 min · tu prends de l’avance sur tes futures rencontres</span>
                  <button onClick={share} className="inline-flex items-center gap-2 mt-2 px-6 py-3 rounded-full text-[13px] tracking-[0.08em] uppercase transition-colors"
                    style={{ background: 'transparent', color: C.alabaster, border: `1px solid ${C.line}` }}>
                    {copied ? 'Lien copié ✓' : 'Partager SOS Meet'} <span aria-hidden>↗</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 7. FAQ */}
        <section className="max-w-2xl mx-auto px-5 sm:px-8 py-20">
          <Reveal className="text-center mb-10">
            <h2 style={{ ...serif, fontWeight: 400, fontSize: 'clamp(1.7rem,4.4vw,2.4rem)' }}>Questions fréquentes</h2>
          </Reveal>
          <div>{FAQ.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}</div>
        </section>

        {/* 8. FOOTER */}
        <footer className="py-12" style={{ borderTop: `1px solid ${C.line}` }}>
          <div className="max-w-5xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <span className="text-[20px]" style={{ ...serif, fontWeight: 500 }}>SOS Meet<span style={{ color: C.garnet }}>.</span></span>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px]" style={{ color: C.smoke }}>
              <a href="https://sosshine.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-70">SOS Shine ↗</a>
              <Link href="/mentions-legales" className="hover:opacity-70">Mentions légales</Link>
              <Link href="/confidentialite" className="hover:opacity-70">Confidentialité</Link>
            </div>
            <span className="text-[12px]" style={{ color: C.smoke2 }}>© {new Date().getFullYear()} SOS Meet</span>
          </div>
        </footer>
      </div>
    </main>
  )
}
