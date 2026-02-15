"use client";

import Link from "next/link";
import { useEffect, useRef, useState, ReactNode } from "react";

/* ─────────────────────────────────────────────
   SOS SHINE — Landing Page
   Aesthetic: Dark sanctuary, gold accents, 
   emotional typography, slow reveals
───────────────────────────────────────────── */

// ── Intersection Observer hook for scroll reveals ──
function useReveal(threshold: number = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

function Reveal({ children, delay = 0, className = "" }: RevealProps) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: `opacity 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s, transform 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

// ── Gold separator ──
function GoldDivider() {
  return (
    <div className="flex items-center justify-center gap-4 py-2">
      <span className="block w-12 h-px bg-gradient-to-r from-transparent to-[#D4A843]" />
      <span className="block w-1.5 h-1.5 rotate-45 bg-[#D4A843]" />
      <span className="block w-12 h-px bg-gradient-to-l from-transparent to-[#D4A843]" />
    </div>
  );
}

// ── Types ──
interface PillarCard {
  num: string;
  title: string;
  subtitle: string;
  who: string;
  desc: string;
  color: string;
  bg: string;
  borderColor: string;
}

interface CordeeItem {
  title: string;
  desc: string;
}

interface Testimonial {
  quote: string;
  name: string;
  city: string;
}

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const pillars: PillarCard[] = [
    {
      num: "01",
      title: "Apaiser",
      subtitle: "Le corps",
      who: "William",
      desc: "Quand la tension pèse une tonne. Yin Yoga, respiration, acupression — des mouvements doux pour rappeler à votre corps qu'il a le droit de relâcher.",
      color: "#55EFC4",
      bg: "rgba(85, 239, 196, 0.06)",
      borderColor: "rgba(85, 239, 196, 0.15)",
    },
    {
      num: "02",
      title: "Envelopper",
      subtitle: "L'émotion",
      who: "Julia",
      desc: "Quand vous êtes au fond du trou. Audios de réconfort, méditations SOS, soins énergétiques — pas pour « être positif », pour être enveloppé.",
      color: "#A29BFE",
      bg: "rgba(162, 155, 254, 0.06)",
      borderColor: "rgba(162, 155, 254, 0.15)",
    },
    {
      num: "03",
      title: "Reconstruire",
      subtitle: "L'action",
      who: "Thomas",
      desc: "Quand vous allez un peu mieux. Méthodes pour poser des limites, désencombrer, reprendre pied — un seul geste si petit que votre cerveau ne peut pas dire non.",
      color: "#D4A843",
      bg: "rgba(212, 168, 67, 0.06)",
      borderColor: "rgba(212, 168, 67, 0.15)",
    },
  ];

  const cordeeItems: CordeeItem[] = [
    {
      title: "Le Feu de Camp",
      desc: "Un espace où les membres partagent leurs « recettes » de survie. « J'ai mixé l'audio 4 de Julia avec la posture de William — ça m'a sauvé ma journée. » Ce ne sont pas des followers. C'est une cordée.",
    },
    {
      title: "Le système Éclaireur",
      desc: "Au bout de quelques mois, vous allez mieux. Un nouveau membre arrive — brisé, perdu, exactement comme vous l'étiez. Et c'est vous qui lui tendez la main. À cet instant, vous comprenez que votre douleur avait un sens.",
    },
    {
      title: "Les rencontres réelles",
      desc: "Sur la carte de l'app, un Hôte Certifié organise une Shine Walk à 10km de chez vous ce week-end. Vous vous inscrivez. Le digital prépare. Le physique transforme.",
    },
  ];

  const testimonials: Testimonial[] = [
    {
      quote: "Je ne savais même pas que j'avais le droit de ne pas aller bien. SOS Shine m'a donné un espace où ma douleur avait le droit d'exister.",
      name: "Marie, 34 ans",
      city: "Lyon",
    },
    {
      quote: "La première fois que quelqu'un m'a dit « je suis passé par là, tiens bon » — c'était dans la Cordée. J'ai pleuré. Mais c'était la première fois que c'était des larmes de soulagement.",
      name: "Karim, 41 ans",
      city: "Bordeaux",
    },
    {
      quote: "J'ai fait ma première Shine Walk un samedi matin. En rentrant chez moi, j'ai senti quelque chose que j'avais oublié : je n'étais plus seule.",
      name: "Sophie, 28 ans",
      city: "Bruxelles",
    },
    {
      quote: "Je suis devenu Éclaireur il y a 3 mois. Tendre la main à quelqu'un qui est où j'étais il y a un an — c'est la chose la plus puissante que j'ai faite de ma vie.",
      name: "Antoine, 37 ans",
      city: "Genève",
    },
  ];

  const features: string[] = [
    "L'Apothicaire — corps, émotion, action",
    "La Cordée — votre famille de pairs",
    "Le Feu de Camp — partage & recettes",
    "Accès aux événements physiques",
    "Parcours Éclaireur après 4 mois",
  ];

  return (
    <>
      {/* ── Google Fonts ── */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        :root {
          --gold: #D4A843;
          --gold-light: #F5DEB3;
          --gold-deep: #A88532;
          --dark: #0A0A0A;
          --dark-card: #111111;
          --dark-border: #1A1A1A;
          --text-primary: #E8E0D4;
          --text-secondary: #9A9080;
          --text-muted: #5A5347;
        }

        html { scroll-behavior: smooth; }

        body {
          background: var(--dark);
          color: var(--text-primary);
          font-family: 'DM Sans', sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        .font-display {
          font-family: 'Cormorant Garamond', serif;
        }

        /* Grain overlay */
        .grain::after {
          content: '';
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 1;
        }

        /* Glow effect on CTA */
        .cta-glow {
          box-shadow: 0 0 40px rgba(212, 168, 67, 0.15), 0 0 80px rgba(212, 168, 67, 0.05);
          transition: all 0.4s ease;
        }
        .cta-glow:hover {
          box-shadow: 0 0 50px rgba(212, 168, 67, 0.25), 0 0 100px rgba(212, 168, 67, 0.1);
          transform: translateY(-2px);
        }

        /* Selection color */
        ::selection {
          background: rgba(212, 168, 67, 0.3);
          color: #F5DEB3;
        }

        /* Smooth underline animation */
        .gold-underline {
          background-image: linear-gradient(var(--gold), var(--gold));
          background-size: 0% 1px;
          background-position: left bottom;
          background-repeat: no-repeat;
          transition: background-size 0.4s ease;
        }
        .gold-underline:hover {
          background-size: 100% 1px;
        }
      `}</style>

      <main className="grain relative z-0 overflow-hidden">

        {/* ═══════════════════════════════════════
            HERO — Pattern Interrupt
        ═══════════════════════════════════════ */}
        <section className="relative min-h-screen flex items-center">
          {/* Background glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ transform: `translateY(${scrollY * 0.15}px)` }}
          >
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-[#D4A843] opacity-[0.03] blur-[150px]" />
          </div>

          <div className="relative z-10 px-6 md:px-20 py-32 max-w-5xl mx-auto">
            <Reveal>
              <p className="text-[#D4A843] text-sm tracking-[0.3em] uppercase mb-8 font-light">
                Ce texte n&apos;est pas une publicité
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-light leading-[1.1] mb-10">
                Vous n&apos;êtes pas<br />
                en train de lire ceci<br />
                <em className="text-[#D4A843] font-light">par hasard.</em>
              </h1>
            </Reveal>

            <Reveal delay={0.3}>
              <p className="text-xl md:text-2xl text-[var(--text-secondary)] leading-relaxed max-w-2xl font-light">
                Quelque chose vous a amené ici. Un mot. Un lien.
                Peut-être juste l&apos;espoir minuscule que quelqu&apos;un, quelque part,
                comprenne ce que vous traversez.
              </p>
            </Reveal>

            <Reveal delay={0.45}>
              <div className="mt-12">
                <Link href="/signup">
                  <button className="cta-glow px-10 py-4 bg-[#D4A843] text-[#0A0A0A] rounded-full text-base font-medium tracking-wide hover:bg-[#E0B84D] transition-all duration-400">
                    Rejoindre le sanctuaire
                  </button>
                </Link>
                <p className="text-xs text-[var(--text-muted)] mt-4 tracking-wide">
                  7 jours gratuits — Puis 29€/mois — Sans engagement
                </p>
              </div>
            </Reveal>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
            <span className="text-xs tracking-[0.2em] text-[var(--text-muted)]">LIRE</span>
            <span className="block w-px h-8 bg-gradient-to-b from-[var(--text-muted)] to-transparent animate-pulse" />
          </div>
        </section>

        {/* ═══════════════════════════════════════
            LA BLESSURE — Identification émotionnelle
        ═══════════════════════════════════════ */}
        <section className="px-6 md:px-20 py-28 border-t border-[var(--dark-border)]">
          <div className="max-w-3xl mx-auto">

            <Reveal>
              <GoldDivider />
            </Reveal>

            <Reveal delay={0.1}>
              <p className="font-display text-2xl md:text-3xl text-center text-[var(--text-secondary)] leading-relaxed mt-10 mb-16 font-light italic">
                « Il y a des matins où le réveil sonne et votre première pensée
                n&apos;est pas &quot;quelle belle journée&quot;. C&apos;est un poids.
                Sourd. Diffus. Comme un brouillard qui refuse de partir. »
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="space-y-6 text-lg text-[var(--text-secondary)] leading-relaxed font-light">
                <p>
                  Vous souriez quand même. Vous répondez <span className="text-[var(--text-primary)]">« ça va »</span> quand on vous demande.
                  Vous tenez. Parce que des gens comptent sur vous.
                  Parce que s&apos;effondrer n&apos;est pas une option.
                </p>
                <p>
                  Vous avez essayé. Les livres. Les vidéos à 2h du matin.
                  Les formations abandonnées au module 3, écrasé par la culpabilité
                  de ne pas <span className="text-[var(--text-primary)]">« y arriver »</span>.
                </p>
                <p>
                  Et la pensée la plus toxique de toutes s&apos;est installée :
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <p className="font-display text-3xl md:text-4xl text-center text-[#C0392B] leading-snug mt-12 mb-4 font-light italic">
                « Peut-être que la lumière,<br />c&apos;est pour les autres. »
              </p>
            </Reveal>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            LE PIVOT — "Non."
        ═══════════════════════════════════════ */}
        <section className="px-6 md:px-20 py-28 border-t border-[var(--dark-border)]">
          <div className="max-w-3xl mx-auto text-center">

            <Reveal>
              <p className="font-display text-7xl md:text-9xl font-semibold text-[var(--text-primary)] mb-12">
                Non.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <p className="text-xl text-[var(--text-secondary)] leading-relaxed font-light max-w-xl mx-auto mb-8">
                Si c&apos;était vrai, vous ne seriez pas en train de lire ces lignes.
                La partie de vous qui cherche encore, qui clique encore,
                qui espère encore —
              </p>
            </Reveal>

            <Reveal delay={0.25}>
              <p className="font-display text-2xl md:text-3xl text-[#D4A843] font-medium leading-snug">
                c&apos;est votre lumière qui refuse de s&apos;éteindre.
              </p>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="mt-16 space-y-2">
                <p className="font-display text-2xl md:text-3xl text-[var(--text-primary)] font-light leading-snug">
                  Vous n&apos;avez pas besoin d&apos;un sauveur.
                </p>
                <p className="font-display text-2xl md:text-3xl text-[var(--text-primary)] font-light leading-snug">
                  Vous n&apos;avez pas besoin d&apos;un gourou.
                </p>
                <p className="font-display text-2xl md:text-3xl text-[#2D6A4F] font-light leading-snug mt-6">
                  Vous avez besoin de trois choses.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            LES 3 CLÉS — L'Apothicaire
        ═══════════════════════════════════════ */}
        <section className="px-6 md:px-20 py-28 border-t border-[var(--dark-border)]">
          <div className="max-w-5xl mx-auto">

            <Reveal>
              <GoldDivider />
              <p className="text-center text-sm tracking-[0.3em] text-[var(--text-muted)] uppercase mt-6 mb-16">
                L&apos;Apothicaire — Votre sanctuaire en libre-service
              </p>
            </Reveal>

            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              {pillars.map((card, i) => (
                <Reveal key={card.num} delay={i * 0.12}>
                  <div
                    className="relative p-8 rounded-2xl h-full transition-all duration-500 hover:-translate-y-1"
                    style={{
                      background: card.bg,
                      border: `1px solid ${card.borderColor}`,
                    }}
                  >
                    <span
                      className="font-display text-5xl font-light block mb-4"
                      style={{ color: card.color, opacity: 0.4 }}
                    >
                      {card.num}
                    </span>
                    <h3
                      className="font-display text-2xl font-medium mb-1"
                      style={{ color: card.color }}
                    >
                      {card.title}
                    </h3>
                    <p className="text-xs tracking-[0.15em] text-[var(--text-muted)] uppercase mb-4">
                      {card.subtitle} — {card.who}
                    </p>
                    <p className="text-[var(--text-secondary)] leading-relaxed text-[15px] font-light">
                      {card.desc}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.3}>
              <p className="text-center text-[var(--text-muted)] text-sm mt-10 font-light italic">
                Pas d&apos;ordre imposé. Pas de programme linéaire. Vous piochez ce dont vous avez besoin, quand vous en avez besoin.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            LA CORDÉE — Le moteur de rétention
        ═══════════════════════════════════════ */}
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
                La vraie valeur n&apos;est pas dans les vidéos. Elle est dans le rôle
                que vous jouez les uns pour les autres.
              </p>
            </Reveal>

            <div className="space-y-6">
              {cordeeItems.map((item, i) => (
                <Reveal key={item.title} delay={i * 0.1}>
                  <div
                    className="p-6 md:p-8 rounded-xl transition-all duration-300"
                    style={{
                      background: "rgba(212, 168, 67, 0.03)",
                      border: "1px solid rgba(212, 168, 67, 0.08)",
                    }}
                  >
                    <h3 className="font-display text-xl text-[#D4A843] font-medium mb-3">
                      {item.title}
                    </h3>
                    <p className="text-[var(--text-secondary)] leading-relaxed font-light text-[15px]">
                      {item.desc}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            SOCIAL PROOF — Témoignages
        ═══════════════════════════════════════ */}
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
                  <div
                    className="p-6 md:p-8 rounded-xl h-full flex flex-col justify-between"
                    style={{
                      background: "var(--dark-card)",
                      border: "1px solid var(--dark-border)",
                    }}
                  >
                    <p className="font-display text-lg italic text-[var(--text-primary)] leading-relaxed font-light mb-6">
                      « {t.quote} »
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

        {/* ═══════════════════════════════════════
            PRIX — L'offre
        ═══════════════════════════════════════ */}
        <section className="px-6 md:px-20 py-28 border-t border-[var(--dark-border)]">
          <div className="max-w-2xl mx-auto text-center">

            <Reveal>
              <h2 className="font-display text-3xl md:text-4xl font-light mb-4">
                Personne ne peut vous sauver<br />à votre place.
              </h2>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="font-display text-2xl text-[var(--text-secondary)] font-light mb-16">
                Mais vous n&apos;avez plus à le faire seul.
              </p>
            </Reveal>

            <Reveal delay={0.2}>
              <div
                className="p-10 md:p-12 rounded-2xl"
                style={{
                  background: "rgba(212, 168, 67, 0.04)",
                  border: "1px solid rgba(212, 168, 67, 0.12)",
                }}
              >
                <p className="text-sm tracking-[0.2em] text-[var(--text-muted)] uppercase mb-4">
                  Accès complet au sanctuaire
                </p>
                <p className="font-display text-6xl md:text-7xl font-light text-[#D4A843] mb-2">
                  29€
                </p>
                <p className="text-[var(--text-muted)] text-sm mb-8">par mois</p>

                <div className="text-left max-w-sm mx-auto space-y-3 mb-10">
                  {features.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <span className="text-[#D4A843] mt-0.5 text-sm">◆</span>
                      <span className="text-[var(--text-secondary)] text-[15px] font-light">{item}</span>
                    </div>
                  ))}
                </div>

                <Link href="/signup">
                  <button className="cta-glow w-full max-w-xs px-10 py-4 bg-[#D4A843] text-[#0A0A0A] rounded-full text-base font-medium tracking-wide hover:bg-[#E0B84D] transition-all duration-400">
                    Commencer — 7 jours gratuits
                  </button>
                </Link>

                <p className="text-xs text-[var(--text-muted)] mt-4 font-light italic">
                  Sans engagement. Annulable à tout instant.<br />
                  Parce que si on doit vous retenir par un contrat,
                  c&apos;est qu&apos;on n&apos;a pas fait notre travail.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            CTA FINAL — Le close émotionnel
        ═══════════════════════════════════════ */}
        <section className="px-6 md:px-20 py-32 border-t border-[var(--dark-border)] relative">
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[#D4A843] opacity-[0.03] blur-[120px]" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto text-center">

            <Reveal>
              <GoldDivider />
            </Reveal>

            <Reveal delay={0.1}>
              <p className="font-display text-3xl md:text-5xl font-light leading-tight mt-12 mb-8">
                Guérissez.<br />
                Puis devenez la lumière<br />
                <em className="text-[#D4A843] font-light">de quelqu&apos;un d&apos;autre.</em>
              </p>
            </Reveal>

            <Reveal delay={0.2}>
              <Link href="/signup">
                <button className="cta-glow px-12 py-5 bg-[#D4A843] text-[#0A0A0A] rounded-full text-lg font-medium tracking-wide hover:bg-[#E0B84D] transition-all duration-400">
                  Rejoindre le sanctuaire
                </button>
              </Link>
            </Reveal>

            <Reveal delay={0.3}>
              <p className="text-xs text-[var(--text-muted)] mt-6 tracking-wide">
                7 jours gratuits — Puis 29€/mois — Sans engagement
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

        {/* ═══════════════════════════════════════
            FOOTER
        ═══════════════════════════════════════ */}
        <footer className="px-6 md:px-20 py-12 border-t border-[var(--dark-border)]">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <span className="font-display text-xl text-[#D4A843] font-medium">SOS Shine</span>
              <span className="text-[var(--text-muted)] text-xs">© 2025</span>
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
    </>
  );
}