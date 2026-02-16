"use client";

import Link from "next/link";
import { useEffect, useRef, useState, ReactNode } from "react";

/* ─────────────────────────────────────────────
   SOS SHINE — Landing Page V2
   Cahier des charges Julia
───────────────────────────────────────────── */

function useReveal(threshold: number = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(30px)",
      transition: `opacity 0.9s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}s, transform 0.9s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}s`,
    }}>{children}</div>
  );
}

function GoldDivider() {
  return (
    <div className="flex items-center justify-center gap-4 py-2">
      <span className="block w-12 h-px bg-gradient-to-r from-transparent to-[#D4A843]" />
      <span className="block w-1.5 h-1.5 rotate-45 bg-[#D4A843]" />
      <span className="block w-12 h-px bg-gradient-to-l from-transparent to-[#D4A843]" />
    </div>
  );
}

interface StepCard { num: string; title: string; desc: string; color: string; icon: string }
interface Testimonial { quote: string; name: string; city: string }

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const steps: StepCard[] = [
    { num: "01", title: "Comprendre", desc: "Vidéo de coaching immersive. Analyse émotionnelle. Explication de votre problème. Apaisement mental. Une approche humaine et directe.", color: "#55EFC4", icon: "🎬" },
    { num: "02", title: "Libération Énergétique", desc: "Soin énergétique. Activation émotionnelle. Décharge des tensions. Nettoyage des empreintes qui vous bloquent.", color: "#A29BFE", icon: "✨" },
    { num: "03", title: "Intégration & Méditation", desc: "Méditation guidée. Stabilisation intérieure. Reconnexion à soi. Nouvelle fréquence émotionnelle.", color: "#E17055", icon: "🧘" },
    { num: "04", title: "Action & Reprogrammation", desc: "Exercices pratiques. Carnets de bord. PDF. Habitudes positives. Plan d'action concret.", color: "#D4A843", icon: "⚡" },
  ];

  const testimonials: Testimonial[] = [
    { quote: "Je ne savais même pas que j'avais le droit de ne pas aller bien. SOS Shine m'a donné un espace où ma douleur avait le droit d'exister.", name: "Marie, 34 ans", city: "Lyon" },
    { quote: "La première fois que quelqu'un m'a dit « je suis passé par là, tiens bon » — c'était dans le Feu de Camp. J'ai pleuré. Des larmes de soulagement.", name: "Karim, 41 ans", city: "Bordeaux" },
    { quote: "J'ai fait ma première Shine Walk un samedi matin. En rentrant, j'ai senti quelque chose que j'avais oublié : je n'étais plus seule.", name: "Sophie, 28 ans", city: "Bruxelles" },
    { quote: "Grâce aux 4 étapes, j'ai compris ma douleur au lieu de la fuir. Aujourd'hui, je suis Éclaireur et j'aide les autres.", name: "Antoine, 37 ans", city: "Genève" },
  ];

  const essentialFeatures = [
    "Encyclopédie complète des douleurs",
    "4 étapes par douleur (vidéo, soin, méditation, exercices)",
    "Chat dédié par douleur + Chat général",
    "Mur communautaire",
    "Soins collectifs & événements",
    "Essai gratuit 7 jours",
  ];

  const premiumFeatures = [
    "Tout l'Essentiel inclus",
    "Permanences experts 24/7",
    "Accompagnement prioritaire",
    "Support direct Julia, William & Thomas",
  ];

  return (
    <main className="grain relative z-0 overflow-hidden">

      {/* ═══ HERO — Vidéo + Accroche ═══ */}
      <section className="relative min-h-screen flex items-center">
        <div className="absolute inset-0 pointer-events-none" style={{ transform: `translateY(${scrollY * 0.15}px)` }}>
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-[#D4A843] opacity-[0.03] blur-[150px]" />
        </div>

        <div className="relative z-10 px-6 md:px-20 py-24 max-w-5xl mx-auto w-full">
          {/* Logo */}
          <Reveal>
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center font-display text-xl font-semibold" style={{ background: 'linear-gradient(135deg, #D4A843, #A88532)', color: '#0A0A0A' }}>S</div>
              <span className="font-display text-2xl font-medium text-[#D4A843]">SOS Shine</span>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-light leading-[1.1] mb-6">
              L&apos;encyclopédie des schémas<br />
              émotionnels et des<br />
              <em className="text-[#D4A843] font-light">expériences de vie.</em>
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="text-xl md:text-2xl text-[var(--text-secondary)] leading-relaxed max-w-2xl font-light mb-8">
              Un espace ouvert 24h/24, 7j/7, pour comprendre, apaiser
              et ne plus jamais être seul.
            </p>
          </Reveal>

          {/* Video placeholder */}
          <Reveal delay={0.3}>
            <div className="rounded-2xl overflow-hidden mb-10 max-w-3xl" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
              <div className="relative aspect-video flex items-center justify-center cursor-pointer group">
                <div className="absolute inset-0 bg-gradient-to-br from-[rgba(212,168,67,0.08)] to-transparent" />
                <div className="relative z-10 text-center">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110" style={{ background: 'rgba(212,168,67,0.15)', border: '2px solid rgba(212,168,67,0.3)' }}>
                    <svg className="w-8 h-8 ml-1" fill="none" viewBox="0 0 24 24" stroke="#D4A843" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                    </svg>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">Découvrir SOS Shine en 2 minutes</p>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.4}>
            <div className="flex flex-wrap gap-4">
              <Link href="/dashboard/encyclopedie">
                <button className="px-8 py-4 rounded-full text-base font-medium tracking-wide transition-all duration-300 cursor-pointer" style={{ background: 'transparent', border: '1px solid rgba(212,168,67,0.4)', color: '#D4A843' }}>
                  Découvrir l&apos;encyclopédie
                </button>
              </Link>
              <Link href="/signup">
                <button className="cta-glow px-8 py-4 bg-[#D4A843] text-[#0A0A0A] rounded-full text-base font-medium tracking-wide hover:bg-[#E0B84D] transition-all duration-300 cursor-pointer">
                  Accès illimité — 7 jours d&apos;essai
                </button>
              </Link>
            </div>
          </Reveal>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="text-xs tracking-[0.2em] text-[var(--text-muted)]">DÉCOUVRIR</span>
          <span className="block w-px h-8 bg-gradient-to-b from-[var(--text-muted)] to-transparent animate-pulse" />
        </div>
      </section>

      {/* ═══ LE PRINCIPE — On éteint la douleur ═══ */}
      <section className="px-6 md:px-20 py-28 border-t border-[var(--dark-border)]">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal>
            <GoldDivider />
            <p className="text-sm tracking-[0.3em] text-[var(--text-muted)] uppercase mt-6 mb-8">Le principe SOS Shine</p>
          </Reveal>

          <Reveal delay={0.1}>
            <h2 className="font-display text-3xl md:text-5xl font-light leading-tight mb-8">
              On ne change pas votre identité.<br />
              <span className="text-[#D4A843]">On éteint la douleur</span><br />
              pour libérer votre potentiel.
            </h2>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="text-lg text-[var(--text-secondary)] leading-relaxed font-light max-w-xl mx-auto">
              Chaque douleur — abandon, trahison, burn-out, deuil, peur —
              possède sa propre page dans notre encyclopédie, avec un protocole
              en 4 étapes conçu pour vous accompagner de A à Z.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ LES 4 ÉTAPES ═══ */}
      <section className="px-6 md:px-20 py-28 border-t border-[var(--dark-border)]">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <GoldDivider />
            <p className="text-center text-sm tracking-[0.3em] text-[var(--text-muted)] uppercase mt-6 mb-4">
              Le parcours SOS Shine
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-light text-center mb-16">
              4 étapes pour chaque douleur
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-6">
            {steps.map((step, i) => (
              <Reveal key={step.num} delay={i * 0.1}>
                <div className="relative p-8 rounded-2xl h-full transition-all duration-500 hover:-translate-y-1"
                  style={{ background: `${step.color}08`, border: `1px solid ${step.color}20` }}>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-3xl">{step.icon}</span>
                    <div>
                      <span className="font-display text-sm font-light block" style={{ color: step.color, opacity: 0.6 }}>Étape {step.num}</span>
                      <h3 className="font-display text-xl font-medium" style={{ color: step.color }}>{step.title}</h3>
                    </div>
                  </div>
                  <p className="text-[var(--text-secondary)] leading-relaxed text-[15px] font-light">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ L'ENCYCLOPÉDIE ═══ */}
      <section className="px-6 md:px-20 py-28 border-t border-[var(--dark-border)]">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <GoldDivider />
            <p className="text-center text-sm tracking-[0.3em] text-[var(--text-muted)] uppercase mt-6 mb-4">
              L&apos;encyclopédie
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-light text-center mb-6">
              Chaque douleur a sa <span className="text-[#D4A843]">page dédiée</span>
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="text-center text-lg text-[var(--text-secondary)] font-light leading-relaxed mb-12 max-w-2xl mx-auto">
              Abandon, trahison, burn-out, deuil, dépendance affective, peur,
              solitude, rejet... Classées de A à Z, accessibles en un clic.
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {["Abandon", "Anxiété", "Burn-out", "Dépendance affective", "Deuil", "Manque de confiance", "Peur", "Rejet", "Rupture", "Solitude", "Trahison", "Et plus..."].map((d, i) => (
                <div key={d} className="px-4 py-3 rounded-xl text-center text-sm transition-all duration-200 cursor-default"
                  style={{
                    background: i === 11 ? 'rgba(212,168,67,0.08)' : 'var(--dark-card)',
                    border: i === 11 ? '1px solid rgba(212,168,67,0.2)' : '1px solid var(--dark-border)',
                    color: i === 11 ? '#D4A843' : 'var(--text-secondary)',
                  }}>
                  {d}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ COMMUNAUTÉ ═══ */}
      <section className="px-6 md:px-20 py-28 border-t border-[var(--dark-border)]">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <h2 className="font-display text-3xl md:text-5xl font-light leading-tight text-center mb-6">
              Vous n&apos;êtes plus jamais seul<br />
              <span className="text-[#D4A843]">à 3h du matin.</span>
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="text-center text-lg text-[var(--text-secondary)] font-light leading-relaxed mb-16 max-w-xl mx-auto">
              Chat dédié par douleur, chat général, mur communautaire,
              soins collectifs et événements — une vraie famille.
            </p>
          </Reveal>

          <div className="space-y-5">
            {[
              { title: "Le Feu de Camp", desc: "Chaque douleur a son propre chat. Échangez avec ceux qui comprennent vraiment. Un espace d'entraide ciblé et bienveillant." },
              { title: "Le Mur Communautaire", desc: "Publications, annonces, partages. Restez informé de chaque nouvelle douleur, chaque événement, chaque avancée collective." },
              { title: "Les Rencontres Réelles", desc: "Soins collectifs, ateliers, lives, Shine Walks — le digital prépare, le physique transforme." },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.1}>
                <div className="p-6 md:p-8 rounded-xl" style={{ background: "rgba(212,168,67,0.03)", border: "1px solid rgba(212,168,67,0.08)" }}>
                  <h3 className="font-display text-xl text-[#D4A843] font-medium mb-3">{item.title}</h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed text-[15px] font-light">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TÉMOIGNAGES ═══ */}
      <section className="px-6 md:px-20 py-28 border-t border-[var(--dark-border)]">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <GoldDivider />
            <p className="text-center text-sm tracking-[0.3em] text-[var(--text-muted)] uppercase mt-6 mb-16">
              Ils ont traversé la tempête
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.1}>
                <div className="p-6 md:p-8 rounded-xl h-full flex flex-col justify-between"
                  style={{ background: "var(--dark-card)", border: "1px solid var(--dark-border)" }}>
                  <p className="font-display text-lg italic text-[var(--text-primary)] leading-relaxed font-light mb-6">
                    &laquo; {t.quote} &raquo;
                  </p>
                  <div>
                    <p className="text-sm text-[#D4A843] font-medium">{t.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{t.city}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ OFFRES — 2 plans ═══ */}
      <section className="px-6 md:px-20 py-28 border-t border-[var(--dark-border)]">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <GoldDivider />
            <h2 className="font-display text-3xl md:text-4xl font-light text-center mt-6 mb-4">
              Choisissez votre accompagnement
            </h2>
            <p className="text-center text-[var(--text-secondary)] font-light mb-16">
              7 jours d&apos;essai gratuit — Sans engagement — Annulable à tout instant
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Essentiel */}
            <Reveal delay={0.1}>
              <div className="p-8 md:p-10 rounded-2xl h-full flex flex-col"
                style={{ background: "rgba(212,168,67,0.04)", border: "1px solid rgba(212,168,67,0.12)" }}>
                <p className="text-sm tracking-[0.2em] text-[var(--text-muted)] uppercase mb-4">Essentiel</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="font-display text-5xl font-light text-[#D4A843]">29,90€</span>
                  <span className="text-[var(--text-muted)] text-sm">/mois</span>
                </div>
                <div className="space-y-3 flex-1 mb-8">
                  {essentialFeatures.map((f) => (
                    <div key={f} className="flex items-start gap-3">
                      <span className="text-[#D4A843] mt-0.5 text-sm">◆</span>
                      <span className="text-[var(--text-secondary)] text-[15px] font-light">{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/signup">
                  <button className="cta-glow w-full px-8 py-4 bg-[#D4A843] text-[#0A0A0A] rounded-full text-base font-medium hover:bg-[#E0B84D] transition-all duration-300 cursor-pointer">
                    Commencer — 7 jours gratuits
                  </button>
                </Link>
              </div>
            </Reveal>

            {/* Premium */}
            <Reveal delay={0.2}>
              <div className="p-8 md:p-10 rounded-2xl h-full flex flex-col relative overflow-hidden"
                style={{ background: "rgba(162,155,254,0.04)", border: "1px solid rgba(162,155,254,0.15)" }}>
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(162,155,254,0.15)', color: '#A29BFE' }}>
                  Recommandé
                </div>
                <p className="text-sm tracking-[0.2em] text-[var(--text-muted)] uppercase mb-4">Premium</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="font-display text-5xl font-light text-[#A29BFE]">99,90€</span>
                  <span className="text-[var(--text-muted)] text-sm">/mois</span>
                </div>
                <div className="space-y-3 flex-1 mb-8">
                  {premiumFeatures.map((f) => (
                    <div key={f} className="flex items-start gap-3">
                      <span className="text-[#A29BFE] mt-0.5 text-sm">◆</span>
                      <span className="text-[var(--text-secondary)] text-[15px] font-light">{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/signup">
                  <button className="w-full px-8 py-4 rounded-full text-base font-medium transition-all duration-300 cursor-pointer" style={{ background: '#A29BFE', color: '#0A0A0A' }}>
                    Commencer — 7 jours gratuits
                  </button>
                </Link>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.3}>
            <p className="text-center text-xs text-[var(--text-muted)] mt-6 font-light italic">
              Parce que si on doit vous retenir par un contrat, c&apos;est qu&apos;on n&apos;a pas fait notre travail.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <section className="px-6 md:px-20 py-32 border-t border-[var(--dark-border)] relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[#D4A843] opacity-[0.03] blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <Reveal><GoldDivider /></Reveal>

          <Reveal delay={0.1}>
            <p className="font-display text-3xl md:text-5xl font-light leading-tight mt-12 mb-8">
              Comprenez. Apaisez.<br />
              <em className="text-[#D4A843] font-light">Ne soyez plus jamais seul.</em>
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <Link href="/signup">
              <button className="cta-glow px-12 py-5 bg-[#D4A843] text-[#0A0A0A] rounded-full text-lg font-medium tracking-wide hover:bg-[#E0B84D] transition-all duration-300 cursor-pointer">
                Rejoindre SOS Shine
              </button>
            </Link>
          </Reveal>

          <Reveal delay={0.3}>
            <p className="text-xs text-[var(--text-muted)] mt-6 tracking-wide">
              7 jours gratuits — Puis 29,90€/mois — Sans engagement
            </p>
          </Reveal>

          <Reveal delay={0.35}>
            <div className="mt-8">
              <Link href="/login" className="gold-underline text-sm text-[var(--text-muted)] hover:text-[#D4A843] transition-colors duration-300">
                Déjà membre ? Se connecter
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="px-6 md:px-20 py-12 border-t border-[var(--dark-border)]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="font-display text-xl text-[#D4A843] font-medium">SOS Shine</span>
            <span className="text-[var(--text-muted)] text-xs">© 2026</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-[var(--text-muted)]">
            <Link href="/mentions-legales" className="gold-underline hover:text-[#D4A843] transition-colors">Mentions légales</Link>
            <Link href="/cgv" className="gold-underline hover:text-[#D4A843] transition-colors">CGV</Link>
            <Link href="/confidentialite" className="gold-underline hover:text-[#D4A843] transition-colors">Confidentialité</Link>
            <Link href="/contact" className="gold-underline hover:text-[#D4A843] transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
