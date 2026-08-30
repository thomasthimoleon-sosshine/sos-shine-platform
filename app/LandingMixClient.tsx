'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import type { NextEvent } from './quiz/page'
import LogoSite from '@/components/LogoSite'

const QUIZ_URL = '/signature-emotionnelle?start=1'

// ── Tracking ──
function trackCta(position: string) {
  fetch('/api/quiz-v2/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: `landing_mix_${Date.now()}`,
      eventType: 'landing_quiz_cta_clicked',
      eventData: { cta_position: position, page: 'mix' },
    }),
  }).catch(() => {})
}

// ── Ticker événement ──
function buildTickerItems(event: NextEvent | null): string[] {
  if (!event) return ['✨ Prochain événement SOS Shine', '→ Voir les événements']
  const dateLabel = event.event_date
    ? new Date(event.event_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null
  const timeStart = event.event_date
    ? new Date(event.event_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : null
  const items: string[] = ['✨ ' + event.title]
  if (event.location_name) items.push('📍 ' + event.location_name)
  if (dateLabel) items.push('📅 ' + dateLabel)
  if (timeStart) items.push('🕕 ' + (event.end_time ? `${timeStart} - ${event.end_time}` : timeStart))
  items.push('→ Réserver ma place')
  return items
}

function EventTicker({ nextEvent }: { nextEvent: NextEvent | null }) {
  const tickerItems = buildTickerItems(nextEvent)
  const eventUrl = nextEvent ? `/event/${nextEvent.id}` : '/event'
  const items = [...tickerItems, ...tickerItems, ...tickerItems]
  return (
    <Link href={eventUrl} className="fixed top-0 left-0 right-0 z-[60] block overflow-hidden cursor-pointer" style={{ background: '#C9A961', height: '36px' }}>
      <style>{`@keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-33.333%)}}`}</style>
      <div className="flex items-center h-full whitespace-nowrap" style={{ animation: 'ticker 26s linear infinite' }}>
        {items.map((item, i) => (
          <span key={i} className="text-xs font-semibold px-4 mx-3 flex-shrink-0" style={{ color: '#000' }}>{item}</span>
        ))}
      </div>
    </Link>
  )
}

// ── Nav ──
function TopNav() {
  return (
    <nav className="fixed left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
      style={{ top: '36px', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <Link href="/">
        <LogoSite className="h-8" />
      </Link>
      <div className="flex items-center gap-3">
        <Link href="/login" className="text-sm font-medium px-4 py-2 rounded-full transition-colors hover:bg-white/5" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Se connecter
        </Link>
        <Link href={QUIZ_URL} onClick={() => trackCta('nav')}
          className="text-sm font-semibold px-5 py-2 rounded-full transition-all hover:brightness-110"
          style={{ background: 'linear-gradient(135deg, #C9A961, #A88248)', color: '#000' }}>
          Commencer →
        </Link>
      </div>
    </nav>
  )
}

// ── Reveal animation ──
function Reveal({ children, delay = 0, className = '', direction = 'up' }: { children: React.ReactNode; delay?: number; className?: string; direction?: 'up' | 'left' | 'right' }) {
  const initial = direction === 'left' ? { opacity: 0, x: -24 } : direction === 'right' ? { opacity: 0, x: 24 } : { opacity: 0, y: 24 }
  const animate = direction === 'up' ? { opacity: 1, y: 0 } : { opacity: 1, x: 0 }
  return (
    <motion.div initial={initial} whileInView={animate} viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.65, delay, ease: [0.25, 0.46, 0.45, 0.94] }} className={className}>
      {children}
    </motion.div>
  )
}

// ── CTA Button ──
function CtaButton({ position, label = 'DÉCOUVRIR MA SIGNATURE →', large = false, ghost = false }: { position: string; label?: string; large?: boolean; ghost?: boolean }) {
  return (
    <Link href={QUIZ_URL} onClick={() => trackCta(position)}
      className={`inline-block text-center font-semibold rounded-full transition-all hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] ${large ? 'w-full px-10 py-4 text-sm' : 'px-8 py-4 text-sm'}`}
      style={ghost
        ? { background: 'transparent', color: '#C9A961', border: '1px solid rgba(201,169,97,0.4)' }
        : { background: 'linear-gradient(135deg, #C9A961, #A88248)', color: '#000000' }}>
      {label}
    </Link>
  )
}

// ── FAQ Item ──
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-5 text-left cursor-pointer">
        <span className="text-sm font-medium pr-4" style={{ color: 'var(--text-primary)' }}>{question}</span>
        <span className="text-lg flex-shrink-0 transition-transform" style={{ color: '#C9A961', transform: open ? 'rotate(45deg)' : 'rotate(0)', display: 'inline-block' }}>+</span>
      </button>
      {open && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pb-5">
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{answer}</p>
        </motion.div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════
export default function LandingMixClient({ nextEvent }: { nextEvent: NextEvent | null }) {
  const [videoStarted, setVideoStarted] = useState(false)

  return (
    <main className="min-h-screen" style={{ background: '#000000', color: '#F5F0E8' }}>
      <EventTicker nextEvent={nextEvent} />
      <TopNav />

      {/* ══ HERO ══ */}
      <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden text-center" style={{
        paddingTop: '100px',
        backgroundImage: "linear-gradient(180deg, rgba(10,7,4,0.72) 0%, rgba(10,7,4,0.84) 100%), url('/fond-hero.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-[0.06] blur-[120px]" style={{ background: '#C9A961' }} />
        </div>

        <div className="relative z-10 max-w-sm lg:max-w-3xl w-full space-y-10">
          <Reveal>
            <a
              href="https://julialaureau.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all hover:scale-[1.03]"
              style={{ border: '1px solid rgba(201,169,97,0.4)', color: '#C9A961', background: 'rgba(201,169,97,0.04)' }}
            >
              Prendre rendez-vous avec Julia Laureau
              <span aria-hidden>↗</span>
            </a>
          </Reveal>

          <Reveal>
            <Link href="/">
              <LogoSite className="h-24 lg:h-32 mx-auto" />
            </Link>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="text-[11px] tracking-[0.35em] uppercase font-medium" style={{ color: '#C9A961', opacity: 0.7 }}>
              Plateforme de déconditionnement émotionnel
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <h1 className="font-sans text-[24px] sm:text-3xl lg:text-5xl font-bold leading-tight lg:leading-[1.1]" style={{ color: '#F5F0E8' }}>
              Il y a une phrase qui résume comment tu te protèges émotionnellement depuis toujours.
            </h1>
          </Reveal>

          <Reveal delay={0.35}>
            <p className="text-base lg:text-xl leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Tu ne l&apos;as jamais entendue.<br />
              Mais elle dirige ta vie.
            </p>
          </Reveal>

          <Reveal delay={0.5}>
            <div className="space-y-3">
              <CtaButton position="hero" label="Découvrir ma Signature →" large />
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.22)' }}>
                Gratuit · 3 minutes · Résultat immédiat
              </p>
            </div>
          </Reveal>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}
            style={{ width: '1px', height: '40px', background: 'linear-gradient(to bottom, rgba(201,169,97,0.5), transparent)', margin: '0 auto' }} />
        </div>
      </section>

      {/* ══ MIROIR — PAIN POINTS ══ */}
      <section className="px-6 py-24 sm:py-32">
        <div className="max-w-lg lg:max-w-2xl mx-auto space-y-14">
          <Reveal>
            <p className="text-[11px] tracking-[0.3em] uppercase font-medium text-center" style={{ color: '#C9A961', opacity: 0.6 }}>
              Est-ce que ça te parle ?
            </p>
          </Reveal>

          <div className="space-y-8">
            {[
              { phrase: 'Tu souris.', suite: "À l’intérieur, tu hurles." },
              { phrase: 'Tu sais.', suite: "Tu n’arrives pas à faire." },
              { phrase: 'Tu donnes.', suite: "Personne ne voit que tu t’épuises." },
              { phrase: 'Tu contrôles.', suite: "Parce que lâcher, c’est tomber." },
              { phrase: 'Tu recommences.', suite: 'La même histoire. Le même mur.' },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="border-l-2 pl-5" style={{ borderColor: 'rgba(201,169,97,0.25)' }}>
                  <p className="text-base lg:text-lg font-semibold" style={{ color: '#F5F0E8' }}>{item.phrase}</p>
                  <p className="text-base lg:text-lg" style={{ color: 'rgba(255,255,255,0.35)' }}>{item.suite}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.5}>
            <div className="pt-4 space-y-3">
              <p className="text-sm leading-relaxed text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>
                SOS Shine décode les schémas émotionnels qui pilotent ta vie.<br />
                Et te donne les outils pour reprendre les commandes.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.6}>
            <div className="text-center">
              <CtaButton position="miroir" label="Je veux comprendre →" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ LA PLATEFORME — 4 PILIERS ══ */}
      <section className="px-6 py-24 sm:py-32" style={{ background: 'rgba(201,169,97,0.025)', borderTop: '1px solid rgba(201,169,97,0.08)', borderBottom: '1px solid rgba(201,169,97,0.08)' }}>
        <div className="max-w-lg lg:max-w-5xl mx-auto space-y-14">
          <Reveal>
            <div className="text-center space-y-3">
              <p className="text-[11px] tracking-[0.3em] uppercase font-medium" style={{ color: '#C9A961', opacity: 0.6 }}>
                La plateforme
              </p>
              <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-bold" style={{ color: '#F5F0E8' }}>
                Tout ce dont tu as besoin.<br />
                <span style={{ color: '#C9A961' }}>Rien de superflu.</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: '📚',
                title: 'Encyclopédie',
                desc: 'De A à Z, chaque expérience émotionnelle décodée. des protocoles guidés.',
                badge: 'Encyclopédie complète',
                color: '#C9A961',
              },
              {
                icon: '🔥',
                title: 'Communauté',
                desc: 'Un Feu de Camp permanent. Des membres qui comprennent vraiment. 24h/24.',
                badge: '24/7',
                color: '#FF7675',
              },
              {
                icon: '✉️',
                title: 'Courrier Anonyme',
                desc: 'Exprime ce que tu ne peux dire à personne. Reçois une réponse bienveillante.',
                badge: 'Anonyme',
                color: '#74C0FC',
              },
              {
                icon: '🎬',
                title: 'Contenu Exclusif',
                desc: "Shine TV, Interviews, Podcasts, Audible, Livres. Un accès illimité à l'essentiel.",
                badge: 'Exclusif',
                color: '#C9A961',
              },
            ].map((pilier, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="rounded-2xl p-6 h-full flex flex-col gap-4 relative overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${pilier.color}22` }}>
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10" style={{ background: pilier.color }} />
                  <span className="text-3xl">{pilier.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-sans font-bold text-base mb-2" style={{ color: '#F5F0E8' }}>{pilier.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{pilier.desc}</p>
                  </div>
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full self-start"
                    style={{ background: `${pilier.color}18`, color: pilier.color, border: `1px solid ${pilier.color}30` }}>
                    {pilier.badge}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.5}>
            <div className="text-center">
              <CtaButton position="piliers" label="Accéder à la plateforme →" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ VIDÉO ══ */}
      <section className="px-6 py-24 sm:py-32">
        <div className="max-w-lg lg:max-w-3xl mx-auto space-y-10">
          <Reveal>
            <div className="text-center space-y-3">
              <p className="text-[11px] tracking-[0.3em] uppercase font-medium" style={{ color: '#C9A961', opacity: 0.6 }}>
                En vidéo
              </p>
              <h2 className="font-sans text-2xl sm:text-3xl font-bold" style={{ color: '#F5F0E8' }}>
                Découvre SOS Shine en 2 minutes.
              </h2>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video cursor-pointer group"
              onClick={() => setVideoStarted(true)}
              style={{ border: '1px solid rgba(201,169,97,0.15)' }}>
              {videoStarted ? (
                <video
                  src="https://www.sosshine.com/videos/presentation.mp4"
                  autoPlay
                  controls
                  controlsList="nodownload"
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <LogoSite alt="SOS Shine présentation"
                    className="absolute inset-0 w-full h-full object-contain p-16 opacity-20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                      style={{ background: 'rgba(201,169,97,0.9)' }}>
                      <svg width="30" height="30" viewBox="0 0 24 24" fill="#000"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[12px] font-semibold"
                    style={{ background: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.6)' }}>
                    Regarder la présentation
                  </div>
                </>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.3}>
            <p className="text-center text-sm italic" style={{ color: 'rgba(255,255,255,0.3)' }}>
              &laquo;&nbsp;Et si ce qui te fait souffrir était exactement ce qui doit briller&nbsp;?&nbsp;&raquo;
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══ PROTOCOLE TRANSFORMATION — 3 ÉTAPES ══ */}
      <section className="px-6 py-24 sm:py-32" style={{ background: 'rgba(201,169,97,0.025)', borderTop: '1px solid rgba(201,169,97,0.08)', borderBottom: '1px solid rgba(201,169,97,0.08)' }}>
        <div className="max-w-lg lg:max-w-5xl mx-auto space-y-14">
          <Reveal>
            <div className="text-center space-y-3">
              <p className="text-[11px] tracking-[0.3em] uppercase font-medium" style={{ color: '#C9A961', opacity: 0.6 }}>
                Protocole transformation unity
              </p>
              <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-bold" style={{ color: '#F5F0E8' }}>
                En 3 étapes.
              </h2>
            </div>
          </Reveal>

          <div className="space-y-10 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-10">
            {[
              {
                num: '01',
                title: 'COMPRENDRE',
                subtitle: 'Tu réponds à 12 questions.',
                desc: "Identifier le schéma inconscient qui pilote tes réactions. Pas de jugement, pas de bonne ou mauvaise réponse. Certaines questions vont te toucher, c'est normal.",
                color: '#C9A961',
              },
              {
                num: '02',
                title: 'LIBÉRER',
                subtitle: 'On analyse ton profil sur 10 dimensions.',
                desc: "Décharger l'émotion stockée dans le corps. Pas un seul résultat parmi 10 : une combinaison unique qui te ressemble vraiment.",
                color: '#74C0FC',
              },
              {
                num: '03',
                title: 'AGIR',
                subtitle: 'Tu reçois ta Signature.',
                desc: "Reprogrammer l'automatisme. Un texte personnalisé qui décode ce que tu portes, d'où ça vient, et comment t'en libérer.",
                color: '#55EFC4',
              },
            ].map((step, i) => (
              <Reveal key={step.num} delay={i * 0.12}>
                <div className="rounded-2xl p-7 h-full" style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${step.color}20` }}>
                  <div className="flex items-baseline gap-3 mb-5">
                    <span className="font-sans text-4xl font-bold" style={{ color: step.color, opacity: 0.4 }}>{step.num}</span>
                    <span className="text-[10px] font-bold tracking-[0.25em]" style={{ color: step.color }}>{step.title}</span>
                  </div>
                  <h3 className="font-sans font-bold text-base mb-3" style={{ color: '#F5F0E8' }}>{step.subtitle}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.4}>
            <div className="text-center">
              <CtaButton position="etapes" label="Commencer le protocole →" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ TÉMOIGNAGES ══ */}
      <section className="px-6 py-24 sm:py-32">
        <div className="max-w-lg lg:max-w-4xl mx-auto space-y-12">
          <Reveal>
            <p className="text-[11px] tracking-[0.3em] uppercase font-medium text-center" style={{ color: '#C9A961', opacity: 0.6 }}>
              Ils et elles ont transformé leur vie
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 gap-4 lg:gap-6">
            {[
              { text: "J'ai pleuré en lisant ma Signature. Pas de tristesse. De soulagement. Quelqu'un voyait enfin ce que je portais.", author: 'Camille', age: '41 ans', city: 'Lyon' },
              { text: "10 ans en thérapie. Et en 3 minutes sur SOS Shine, j'ai compris un truc que personne n'avait réussi à me dire.", author: 'Sophie', age: '34 ans', city: 'Paris' },
              { text: "Mon couple a changé. Pas parce que lui a changé. Parce que j'ai arrêté de rejouer le même film.", author: 'Nadia', age: '29 ans', city: 'Marseille' },
              { text: "Mon mari et moi avons fait le test séparément. On a compris nos 12 ans de conflit en 10 minutes.", author: 'Marc', age: '45 ans', city: 'Bordeaux' },
              { text: "Je recommençais tout, tout le temps. Les relations, les jobs, les amitiés. Maintenant je le vois venir.", author: 'Marie', age: '38 ans', city: 'Bordeaux' },
              { text: "Le Courrier Anonyme m'a sauvée un dimanche soir à 23h. Quelqu'un a répondu. Quelqu'un comprenait.", author: 'Léa', age: '26 ans', city: 'Nantes' },
            ].map((t, i) => (
              <Reveal key={i} delay={i * 0.07}>
                <div className="rounded-2xl p-6 h-full flex flex-col justify-between gap-4"
                  style={{ background: 'rgba(201,169,97,0.04)', border: '1px solid rgba(201,169,97,0.12)' }}>
                  <p className="text-sm italic leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    &laquo;&nbsp;{t.text}&nbsp;&raquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: 'rgba(201,169,97,0.15)', color: '#C9A961' }}>
                      {t.author.charAt(0)}
                    </div>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {t.author}, {t.age} · {t.city}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.4}>
            <div className="text-center">
              <CtaButton position="temoignages" label="Commencer gratuitement →" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ LA TRINITÉ ══ */}
      <section className="px-6 py-24 sm:py-32" style={{ background: 'rgba(201,169,97,0.025)', borderTop: '1px solid rgba(201,169,97,0.08)', borderBottom: '1px solid rgba(201,169,97,0.08)' }}>
        <div className="max-w-lg lg:max-w-4xl mx-auto space-y-14">
          <Reveal>
            <div className="text-center space-y-3">
              <p className="text-[11px] tracking-[0.3em] uppercase font-medium" style={{ color: '#C9A961', opacity: 0.6 }}>
                Âme · Corps · Esprit
              </p>
              <h2 className="font-sans text-2xl sm:text-3xl font-bold" style={{ color: '#F5F0E8' }}>
                Créé par ceux qui le vivent.
              </h2>
              <p className="text-sm max-w-md mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Nous ne guérissons pas. Nous révélons. Ce que tu cherches est déjà en toi, enfoui sous des années de conditionnements.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { name: 'Julia', role: 'Le Pilier Énergétique', desc: "Auteure du livre fondateur de SOS Shine. Elle canalise l'énergie invisible qui nous traverse.", color: '#FBCFE8', avatar: '/images/julia.jpeg' },
              { name: 'William', role: 'Le Pilier Corporel', desc: 'Hypnothérapeute, diplômé en médecine chinoise. Il déconstruit les blocages ancrés dans le corps.', color: '#A78BFA', avatar: null },
              { name: 'Thomas', role: 'Le Pilier Pratique', desc: "Protocoles d'action concrets. Il transforme la prise de conscience en résultats tangibles.", color: '#7DD3FC', avatar: null },
            ].map((person, i) => (
              <Reveal key={i} delay={i * 0.12}>
                <div className="rounded-2xl p-6 text-center"
                  style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${person.color}20` }}>
                  <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center overflow-hidden"
                    style={{ background: `${person.color}18`, border: `1px solid ${person.color}30` }}>
                    {person.avatar
                      ? <img src={person.avatar} alt={person.name} className="w-full h-full object-cover" />
                      : <span className="text-2xl font-bold" style={{ color: person.color }}>{person.name.charAt(0)}</span>}
                  </div>
                  <h3 className="font-sans font-bold text-sm mb-1" style={{ color: '#F5F0E8' }}>{person.name}</h3>
                  <p className="text-[11px] mb-3 font-medium" style={{ color: person.color }}>{person.role}</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>{person.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.4}>
            <div className="text-center">
              <a href="https://amzn.eu/d/01oUKWRG" target="_blank" rel="noopener noreferrer"
                className="text-xs hover:opacity-80 transition-opacity" style={{ color: '#C9A961' }}>
                ⭐⭐⭐⭐⭐ Découvrir le livre sur Amazon →
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ TARIFS ══ */}
      <section className="px-6 py-24 sm:py-32">
        <div className="max-w-lg lg:max-w-3xl mx-auto space-y-12">
          <Reveal>
            <div className="text-center space-y-3">
              <p className="text-[11px] tracking-[0.3em] uppercase font-medium" style={{ color: '#C9A961', opacity: 0.6 }}>
                Tarifs
              </p>
              <h2 className="font-sans text-2xl sm:text-3xl font-bold" style={{ color: '#F5F0E8' }}>
                Commence par ton test gratuit.
              </h2>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 gap-5">
            {/* Abonnement */}
            <Reveal delay={0.1}>
              <div className="rounded-2xl p-7 relative overflow-hidden h-full flex flex-col gap-6"
                style={{ background: 'rgba(201,169,97,0.06)', border: '1px solid rgba(201,169,97,0.25)' }}>
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10" style={{ background: '#C9A961' }} />
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] font-bold tracking-[0.2em] px-2.5 py-1 rounded-full"
                      style={{ background: 'rgba(201,169,97,0.2)', color: '#C9A961' }}>RECOMMANDÉ</span>
                  </div>
                  <h3 className="font-sans font-bold text-lg mb-1" style={{ color: '#F5F0E8' }}>Abonnement</h3>
                  <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.4)' }}>Accès illimité à toute la plateforme</p>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-4xl font-bold" style={{ color: '#C9A961' }}>49,90€</span>
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>/mois</span>
                  </div>
                </div>
                <ul className="space-y-2 flex-1">
                  {['Encyclopédie complète', 'Communauté & Feu de Camp 24/7', 'Shine TV, Audible, Librairie', 'Courrier Anonyme', 'Événements & sessions live'].map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      <span style={{ color: '#55EFC4', flexShrink: 0 }}>◆</span> {f}
                    </li>
                  ))}
                </ul>
                <CtaButton position="pricing_abo" label="Commencer le test gratuit →" large />
              </div>
            </Reveal>

            {/* À la carte */}
            <Reveal delay={0.2}>
              <div className="rounded-2xl p-7 h-full flex flex-col gap-6"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div>
                  <h3 className="font-sans font-bold text-lg mb-1" style={{ color: '#F5F0E8' }}>À la carte</h3>
                  <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.4)' }}>Étapes 2 & 3 du protocole recommandé</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold" style={{ color: '#F5F0E8' }}>33€</span>
                  </div>
                </div>
                <ul className="space-y-2 flex-1">
                  {['Étape 2 : Libérer (déconditionner les schémas', 'Étape 3 : Agir) ancrer les nouveaux comportements', 'Protocoles téléchargeables', 'Accès à vie au module'].map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      <span style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>◆</span> {f}
                    </li>
                  ))}
                </ul>
                <CtaButton position="pricing_carte" label="Voir les modules →" large ghost />
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.4}>
            <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Le test est 100% gratuit. Aucune carte bancaire nécessaire pour commencer.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section className="px-6 py-24 sm:py-32" style={{ background: 'rgba(201,169,97,0.025)', borderTop: '1px solid rgba(201,169,97,0.08)', borderBottom: '1px solid rgba(201,169,97,0.08)' }}>
        <div className="max-w-lg lg:max-w-2xl mx-auto space-y-10">
          <Reveal>
            <p className="text-[11px] tracking-[0.3em] uppercase font-medium text-center" style={{ color: '#C9A961', opacity: 0.6 }}>
              Questions fréquentes
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div>
              <FaqItem question="C'est vraiment gratuit ?" answer="Oui. 100% gratuit. Aucune carte bancaire demandée pour faire le test et recevoir ta Signature." />
              <FaqItem question="Combien de temps ça prend ?" answer="Entre 3 et 5 minutes selon ton rythme. Tu reçois ton résultat immédiatement." />
              <FaqItem question="Je dois m'inscrire pour commencer ?" answer="Non. Tu peux commencer immédiatement. On te demandera ton email à mi-test pour t'envoyer ton résultat par mail." />
              <FaqItem question="Mes réponses sont confidentielles ?" answer="Oui, totalement. Aucune réponse n'est partagée avec qui que ce soit." />
              <FaqItem question="C'est de la psychologie sérieuse ?" answer="C'est basé sur des années d'accompagnements et de recherche sur les schémas émotionnels. Ce n'est pas un test scientifique validé, c'est un outil de prise de conscience profonde." />
              <FaqItem question="Que se passe-t-il après le test ?" answer="Tu reçois ta Signature Émotionnelle personnalisée. Elle t'ouvre l'accès à la plateforme SOS Shine et à tous les protocoles adaptés à ton profil." />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ CTA FINAL ══ */}
      <section className="relative px-6 py-32 sm:py-40 overflow-hidden text-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full opacity-[0.05] blur-[120px]" style={{ background: '#C9A961' }} />
        </div>
        <div className="relative z-10 max-w-sm lg:max-w-2xl mx-auto space-y-8">
          <Reveal>
            <h2 className="font-sans text-[26px] sm:text-4xl lg:text-5xl font-bold leading-tight" style={{ color: '#F5F0E8' }}>
              Prêt(e) à te voir,<br />
              <span style={{ color: '#C9A961' }}>vraiment ?</span>
            </h2>
          </Reveal>

          <Reveal delay={0.15}>
            <p className="text-sm lg:text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
              3 minutes pour découvrir une phrase qui pourrait changer<br />
              la lecture que tu as de toi-même.
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="space-y-3">
              <CtaButton position="cta_final" label="Découvrir ma Signature →" large />
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
                Gratuit · 3 minutes · Sans engagement
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="px-6 py-10 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <LogoSite className="h-8 opacity-40" />
          <div className="flex items-center gap-6 flex-wrap justify-center">
            <Link href="/contact" className="text-xs hover:opacity-70 transition-opacity" style={{ color: 'rgba(255,255,255,0.25)' }}>Contact</Link>
            <Link href="/notre-histoire" className="text-xs hover:opacity-70 transition-opacity" style={{ color: 'rgba(255,255,255,0.25)' }}>Notre histoire</Link>
            <Link href="/event" className="text-xs hover:opacity-70 transition-opacity" style={{ color: 'rgba(255,255,255,0.25)' }}>Événements</Link>
            <Link href="/login" className="text-xs hover:opacity-70 transition-opacity" style={{ color: 'rgba(255,255,255,0.25)' }}>Se connecter</Link>
          </div>
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.15)' }}>© 2025 SOS Shine®</p>
        </div>
      </footer>
    </main>
  )
}
