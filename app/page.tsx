"use client";

import Link from "next/link";
import { useEffect, useRef, useState, ReactNode, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

/* ─────────────────────────────────────────────
   SOS SHINE — Landing Page Dynamique
───────────────────────────────────────────── */

function hexToRgb(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return "212,168,67";
  return `${r},${g},${b}`;
}

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
      <span className="block w-12 h-px" style={{ background: `linear-gradient(to right, transparent, var(--gold))` }} />
      <span className="block w-1.5 h-1.5 rotate-45" style={{ background: 'var(--gold)' }} />
      <span className="block w-12 h-px" style={{ background: `linear-gradient(to left, transparent, var(--gold))` }} />
    </div>
  );
}

// Default values (used when no settings in DB)
const DEFAULTS: Record<string, string> = {
  color_primary: "#D4AF37",
  color_secondary: "#74C0FC",
  color_bg: "#1E0F17",
  hero_title: "L\u2019encyclop\u00e9die des sch\u00e9mas\n\u00e9motionnels et des\nexp\u00e9riences de vie.",
  hero_subtitle: "Un espace ouvert 24h/24, 7j/7, pour comprendre, apaiser et ne plus jamais \u00eatre seul.",
  hero_btn_encyclopedie: "D\u00e9couvrir l\u2019encyclop\u00e9die",
  hero_btn_signup: "Acc\u00e8s illimit\u00e9",
  principe_label: "Le principe SOS Shine",
  principe_title: "On ne change pas votre identit\u00e9.\nOn \u00e9teint la douleur\npour lib\u00e9rer votre potentiel.",
  principe_desc: "Chaque douleur \u2014 abandon, trahison, burn-out, deuil, peur \u2014 poss\u00e8de sa propre page dans notre encyclop\u00e9die, avec un protocole en 4 \u00e9tapes con\u00e7u pour vous accompagner de A \u00e0 Z.",
  steps_label: "Le parcours SOS Shine",
  steps_title: "4 \u00e9tapes pour chaque douleur",
  step1_title: "Comprendre",
  step1_desc: "Vid\u00e9o de coaching immersive. Analyse \u00e9motionnelle. Explication de votre probl\u00e8me. Apaisement mental. Une approche humaine et directe.",
  step2_title: "Lib\u00e9ration \u00c9nerg\u00e9tique",
  step2_desc: "Soin \u00e9nerg\u00e9tique. Activation \u00e9motionnelle. D\u00e9charge des tensions. Nettoyage des empreintes qui vous bloquent.",
  step3_title: "Int\u00e9gration & M\u00e9ditation",
  step3_desc: "M\u00e9ditation guid\u00e9e. Stabilisation int\u00e9rieure. Reconnexion \u00e0 soi. Nouvelle fr\u00e9quence \u00e9motionnelle.",
  step4_title: "Action & Reprogrammation",
  step4_desc: "Exercices pratiques. Carnets de bord. PDF. Habitudes positives. Plan d\u2019action concret.",
  encyclo_title: "Chaque douleur a sa page d\u00e9di\u00e9e",
  encyclo_desc: "Abandon, trahison, burn-out, deuil, d\u00e9pendance affective, peur, solitude, rejet... Class\u00e9es de A \u00e0 Z, accessibles en un clic.",
  encyclo_items: "Abandon\nAnxi\u00e9t\u00e9\nBurn-out\nD\u00e9pendance affective\nDeuil\nManque de confiance\nPeur\nRejet\nRupture\nSolitude\nTrahison\nEt plus...",
  community_title: "Vous n\u2019\u00eates plus jamais seul \u00e0 3h du matin.",
  community_desc: "Chat d\u00e9di\u00e9 par douleur, chat g\u00e9n\u00e9ral, mur communautaire, soins collectifs et \u00e9v\u00e9nements \u2014 une vraie famille.",
  community_block1_title: "Le Feu de Camp",
  community_block1_desc: "Chaque douleur a son propre chat. \u00c9changez avec ceux qui comprennent vraiment. Un espace d\u2019entraide cibl\u00e9 et bienveillant.",
  community_block2_title: "Le Mur Communautaire",
  community_block2_desc: "Publications, annonces, partages. Restez inform\u00e9 de chaque nouvelle douleur, chaque \u00e9v\u00e9nement, chaque avanc\u00e9e collective.",
  community_block3_title: "Les Rencontres R\u00e9elles",
  community_block3_desc: "Soins collectifs, ateliers, lives, Shine Walks \u2014 le digital pr\u00e9pare, le physique transforme.",
  testimonials_label: "Ils ont travers\u00e9 la temp\u00eate",
  cta_title: "Comprenez. Apaisez.\nNe soyez plus jamais seul.",
  cta_button: "Rejoindre SOS Shine",
  price_essential: "29,90",
  price_premium: "99,90",
  trial_days: "7",
  features_essential: "Encyclop\u00e9die compl\u00e8te des douleurs\n4 \u00e9tapes par douleur (vid\u00e9o, soin, m\u00e9ditation, exercices)\nChat d\u00e9di\u00e9 par douleur + Chat g\u00e9n\u00e9ral\nMur communautaire\nSoins collectifs & \u00e9v\u00e9nements\nEssai gratuit 7 jours",
  features_premium: "Tout l\u2019Essentiel inclus\nPermanences experts 24/7\nAccompagnement prioritaire\nSupport direct Julia, William & Thomas",
  pricing_footer: "Parce que si on doit vous retenir par un contrat, c\u2019est qu\u2019on n\u2019a pas fait notre travail.",
  testimonial_1: "Je ne savais m\u00eame pas que j\u2019avais le droit de ne pas aller bien. SOS Shine m\u2019a donn\u00e9 un espace o\u00f9 ma douleur avait le droit d\u2019exister.|Marie, 34 ans|Lyon",
  testimonial_2: "La premi\u00e8re fois que quelqu\u2019un m\u2019a dit \u00ab je suis pass\u00e9 par l\u00e0, tiens bon \u00bb \u2014 c\u2019\u00e9tait dans le Feu de Camp. J\u2019ai pleur\u00e9. Des larmes de soulagement.|Karim, 41 ans|Bordeaux",
  testimonial_3: "J\u2019ai fait ma premi\u00e8re Shine Walk un samedi matin. En rentrant, j\u2019ai senti quelque chose que j\u2019avais oubli\u00e9 : je n\u2019\u00e9tais plus seule.|Sophie, 28 ans|Bruxelles",
  testimonial_4: "Gr\u00e2ce aux 4 \u00e9tapes, j\u2019ai compris ma douleur au lieu de la fuir. Aujourd\u2019hui, je suis \u00c9claireur et j\u2019aide les autres.|Antoine, 37 ans|Gen\u00e8ve",
  footer_name: "SOS Shine",
  footer_link_mentions: "/mentions-legales",
  footer_link_cgv: "/cgv",
  footer_link_privacy: "/confidentialite",
  footer_link_contact: "/contact",
  logo_url: "",
  intro_video_url: "",
}

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [settings, setSettings] = useState<Record<string, string>>(DEFAULTS);

  const loadSettings = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase.from("site_settings").select("key, value");
      if (data && data.length > 0) {
        const map = { ...DEFAULTS };
        data.forEach((row: { key: string; value: string }) => {
          if (row.value) map[row.key] = row.value;
        });
        setSettings(map);
      }
    } catch {
      // Use defaults if settings can't be loaded
    }
  }, []);

  useEffect(() => {
    loadSettings();
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [loadSettings]);

  function s(key: string): string {
    return settings[key] || DEFAULTS[key] || "";
  }

  function parseTestimonial(key: string) {
    const raw = s(key);
    const parts = raw.split("|");
    return { quote: parts[0] || "", name: parts[1] || "", city: parts[2] || "" };
  }

  // Dynamic colors from admin settings
  const gold = s("color_primary") || "#D4AF37";
  const accent = s("color_secondary") || "#74C0FC";
  const bg = s("color_bg") || "#1E0F17";
  const goldRgb = hexToRgb(gold);
  const accentRgb = hexToRgb(accent);

  // Derive a lighter version of gold for gradient
  const goldDeep = (() => {
    const h = gold.replace("#", "");
    const r = Math.max(0, parseInt(h.substring(0, 2), 16) - 44);
    const g = Math.max(0, parseInt(h.substring(2, 4), 16) - 35);
    const b = Math.max(0, parseInt(h.substring(4, 6), 16) - 17);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  })();

  const goldHover = (() => {
    const h = gold.replace("#", "");
    const r = Math.min(255, parseInt(h.substring(0, 2), 16) + 12);
    const g = Math.min(255, parseInt(h.substring(2, 4), 16) + 16);
    const b = Math.min(255, parseInt(h.substring(4, 6), 16) + 10);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  })();

  const steps = [
    { num: "01", title: s("step1_title"), desc: s("step1_desc"), color: "#55EFC4", icon: "\uD83C\uDFAC" },
    { num: "02", title: s("step2_title"), desc: s("step2_desc"), color: accent, icon: "\u2728" },
    { num: "03", title: s("step3_title"), desc: s("step3_desc"), color: "#E17055", icon: "\uD83E\uDDD8" },
    { num: "04", title: s("step4_title"), desc: s("step4_desc"), color: gold, icon: "\u26A1" },
  ];

  const encyclopediaItems = s("encyclo_items") ? s("encyclo_items").split("\n").filter(Boolean) : ["Abandon", "Anxi\u00e9t\u00e9", "Burn-out", "D\u00e9pendance affective", "Deuil", "Manque de confiance", "Peur", "Rejet", "Rupture", "Solitude", "Trahison", "Et plus..."];

  const communityBlocks = [
    { title: s("community_block1_title"), desc: s("community_block1_desc") },
    { title: s("community_block2_title"), desc: s("community_block2_desc") },
    { title: s("community_block3_title"), desc: s("community_block3_desc") },
  ];

  const testimonials = [1, 2, 3, 4].map((i) => parseTestimonial(`testimonial_${i}`));
  const essentialFeatures = s("features_essential").split("\n").filter(Boolean);
  const premiumFeatures = s("features_premium").split("\n").filter(Boolean);
  const priceEssential = s("price_essential").replace(".", ",");
  const pricePremium = s("price_premium").replace(".", ",");
  const trialDays = s("trial_days");

  // CSS custom properties set from admin colors
  const cssVars = {
    "--gold": gold,
    "--gold-deep": goldDeep,
    "--gold-light": goldHover,
    "--accent": accent,
    "--bg": bg,
    "--dark": bg,
  } as React.CSSProperties;

  return (
    <main className="grain relative z-0 overflow-hidden" style={cssVars}>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center">
        <div className="absolute inset-0 pointer-events-none" style={{ transform: `translateY(${scrollY * 0.15}px)` }}>
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-[0.03] blur-[150px]" style={{ background: gold }} />
        </div>

        <div className="relative z-10 px-6 md:px-20 py-24 max-w-5xl mx-auto w-full">
          {/* Logo */}
          <Reveal>
            <div className="flex items-center gap-3 mb-12">
              {s("logo_url") ? (
                <img src={s("logo_url")} alt="SOS Shine" className="w-12 h-12 rounded-xl object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-display text-xl font-semibold" style={{ background: `linear-gradient(135deg, ${gold}, ${goldDeep})`, color: bg }}>S</div>
              )}
              <span className="font-display text-2xl font-medium" style={{ color: gold }}>SOS Shine</span>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-light leading-[1.1] mb-6">
              {s("hero_title").split("\n").map((line, i) => (
                <span key={i}>
                  {i > 0 && <br />}
                  {line.includes("exp\u00e9riences") || line.includes("douleur") || line.includes("potentiel") ? (
                    <em className="font-light" style={{ color: gold }}>{line}</em>
                  ) : line}
                </span>
              ))}
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="text-xl md:text-2xl text-[var(--text-secondary)] leading-relaxed max-w-2xl font-light mb-8">
              {s("hero_subtitle")}
            </p>
          </Reveal>

          {/* Video */}
          <Reveal delay={0.3}>
            <div className="rounded-2xl overflow-hidden mb-10 max-w-3xl" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
              {s("intro_video_url") ? (
                <video src={s("intro_video_url")} controls className="w-full aspect-video" poster="" />
              ) : (
                <div className="relative aspect-video flex items-center justify-center cursor-pointer group">
                  <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom right, rgba(${goldRgb},0.08), transparent)` }} />
                  <div className="relative z-10 text-center">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110" style={{ background: `rgba(${goldRgb},0.15)`, border: `2px solid rgba(${goldRgb},0.3)` }}>
                      <svg className="w-8 h-8 ml-1" fill="none" viewBox="0 0 24 24" stroke={gold} strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                      </svg>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">{"D\u00e9couvrir SOS Shine en 2 minutes"}</p>
                  </div>
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.4}>
            <div className="flex flex-wrap gap-4">
              <Link href="/dashboard/encyclopedie">
                <button className="px-8 py-4 rounded-full text-base font-medium tracking-wide transition-all duration-300 cursor-pointer" style={{ background: 'transparent', border: `1px solid rgba(${goldRgb},0.4)`, color: gold }}>
                  {s("hero_btn_encyclopedie")}
                </button>
              </Link>
              <Link href="/signup">
                <button className="cta-glow px-8 py-4 rounded-full text-base font-medium tracking-wide transition-all duration-300 cursor-pointer" style={{ background: gold, color: bg }}>
                  {s("hero_btn_signup")}{" \u2014 "}{trialDays}{" jours d\u2019essai"}
                </button>
              </Link>
            </div>
          </Reveal>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="text-xs tracking-[0.2em] text-[var(--text-muted)]">{"D\u00c9COUVRIR"}</span>
          <span className="block w-px h-8 bg-gradient-to-b from-[var(--text-muted)] to-transparent animate-pulse" />
        </div>
      </section>

      {/* LE PRINCIPE */}
      <section className="px-6 md:px-20 py-28 border-t border-[var(--dark-border)]">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal><GoldDivider /><p className="text-sm tracking-[0.3em] text-[var(--text-muted)] uppercase mt-6 mb-8">{s("principe_label")}</p></Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display text-3xl md:text-5xl font-light leading-tight mb-8">
              {s("principe_title").split("\n").map((line, i) => (
                <span key={i}>
                  {i > 0 && <br />}
                  {line.includes("douleur") || line.includes("potentiel") ? (
                    <span style={{ color: gold }}>{line}</span>
                  ) : line}
                </span>
              ))}
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-lg text-[var(--text-secondary)] leading-relaxed font-light max-w-xl mx-auto">
              {s("principe_desc")}
            </p>
          </Reveal>
        </div>
      </section>

      {/* LES 4 ETAPES */}
      <section className="px-6 md:px-20 py-28 border-t border-[var(--dark-border)]">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <GoldDivider />
            <p className="text-center text-sm tracking-[0.3em] text-[var(--text-muted)] uppercase mt-6 mb-4">{s("steps_label")}</p>
            <h2 className="font-display text-3xl md:text-4xl font-light text-center mb-16">{s("steps_title")}</h2>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-6">
            {steps.map((step, i) => (
              <Reveal key={step.num} delay={i * 0.1}>
                <div className="relative p-8 rounded-2xl h-full transition-all duration-500 hover:-translate-y-1"
                  style={{ background: `${step.color}08`, border: `1px solid ${step.color}20` }}>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-3xl">{step.icon}</span>
                    <div>
                      <span className="font-display text-sm font-light block" style={{ color: step.color, opacity: 0.6 }}>{"\u00c9tape "}{step.num}</span>
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

      {/* L'ENCYCLOPEDIE */}
      <section className="px-6 md:px-20 py-28 border-t border-[var(--dark-border)]">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <GoldDivider />
            <p className="text-center text-sm tracking-[0.3em] text-[var(--text-muted)] uppercase mt-6 mb-4">{"L\u2019encyclop\u00e9die"}</p>
            <h2 className="font-display text-3xl md:text-4xl font-light text-center mb-6">
              {s("encyclo_title")}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-center text-lg text-[var(--text-secondary)] font-light leading-relaxed mb-12 max-w-2xl mx-auto">
              {s("encyclo_desc")}
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {encyclopediaItems.map((d, i) => (
                <div key={d} className="px-4 py-3 rounded-xl text-center text-sm transition-all duration-200 cursor-default"
                  style={{
                    background: i === encyclopediaItems.length - 1 ? `rgba(${goldRgb},0.08)` : 'var(--dark-card)',
                    border: i === encyclopediaItems.length - 1 ? `1px solid rgba(${goldRgb},0.2)` : '1px solid var(--dark-border)',
                    color: i === encyclopediaItems.length - 1 ? gold : 'var(--text-secondary)',
                  }}>
                  {d}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* COMMUNAUTE */}
      <section className="px-6 md:px-20 py-28 border-t border-[var(--dark-border)]">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <h2 className="font-display text-3xl md:text-5xl font-light leading-tight text-center mb-6">
              {s("community_title")}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-center text-lg text-[var(--text-secondary)] font-light leading-relaxed mb-16 max-w-xl mx-auto">
              {s("community_desc")}
            </p>
          </Reveal>
          <div className="space-y-5">
            {communityBlocks.filter(b => b.title).map((item, i) => (
              <Reveal key={item.title} delay={i * 0.1}>
                <div className="p-6 md:p-8 rounded-xl" style={{ background: `rgba(${goldRgb},0.03)`, border: `1px solid rgba(${goldRgb},0.08)` }}>
                  <h3 className="font-display text-xl font-medium mb-3" style={{ color: gold }}>{item.title}</h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed text-[15px] font-light">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TEMOIGNAGES */}
      <section className="px-6 md:px-20 py-28 border-t border-[var(--dark-border)]">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <GoldDivider />
            <p className="text-center text-sm tracking-[0.3em] text-[var(--text-muted)] uppercase mt-6 mb-16">{s("testimonials_label")}</p>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.filter(t => t.quote).map((t, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="p-6 md:p-8 rounded-xl h-full flex flex-col justify-between"
                  style={{ background: "var(--dark-card)", border: "1px solid var(--dark-border)" }}>
                  <p className="font-display text-lg italic text-[var(--text-primary)] leading-relaxed font-light mb-6">
                    {"\u00ab"} {t.quote} {"\u00bb"}
                  </p>
                  <div>
                    <p className="text-sm font-medium" style={{ color: gold }}>{t.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{t.city}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* OFFRES */}
      <section className="px-6 md:px-20 py-28 border-t border-[var(--dark-border)]">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <GoldDivider />
            <h2 className="font-display text-3xl md:text-4xl font-light text-center mt-6 mb-4">Choisissez votre accompagnement</h2>
            <p className="text-center text-[var(--text-secondary)] font-light mb-16">
              {"Sans engagement \u2014 Annulable \u00e0 tout instant"}
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Essentiel */}
            <Reveal delay={0.1}>
              <div className="p-8 md:p-10 rounded-2xl h-full flex flex-col" style={{ background: `rgba(${goldRgb},0.04)`, border: `1px solid rgba(${goldRgb},0.12)` }}>
                <p className="text-sm tracking-[0.2em] text-[var(--text-muted)] uppercase mb-4">Essentiel</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="font-display text-5xl font-light" style={{ color: gold }}>{priceEssential}{"\u20ac"}</span>
                  <span className="text-[var(--text-muted)] text-sm">/mois</span>
                </div>
                <div className="space-y-3 flex-1 mb-8">
                  {essentialFeatures.map((f) => (
                    <div key={f} className="flex items-start gap-3">
                      <span className="mt-0.5 text-sm" style={{ color: gold }}>{"\u25c6"}</span>
                      <span className="text-[var(--text-secondary)] text-[15px] font-light">{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/signup">
                  <button className="cta-glow w-full px-8 py-4 rounded-full text-base font-medium transition-all duration-300 cursor-pointer" style={{ background: gold, color: bg }}>
                    {"Commencer \u2014 "}{trialDays}{" jours gratuits"}
                  </button>
                </Link>
              </div>
            </Reveal>

            {/* Premium */}
            <Reveal delay={0.2}>
              <div className="p-8 md:p-10 rounded-2xl h-full flex flex-col relative overflow-hidden" style={{ background: `rgba(${accentRgb},0.04)`, border: `1px solid rgba(${accentRgb},0.15)` }}>
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium" style={{ background: `rgba(${accentRgb},0.15)`, color: accent }}>
                  {"Recommand\u00e9"}
                </div>
                <p className="text-sm tracking-[0.2em] text-[var(--text-muted)] uppercase mb-4">Premium</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="font-display text-5xl font-light" style={{ color: accent }}>{pricePremium}{"\u20ac"}</span>
                  <span className="text-[var(--text-muted)] text-sm">/mois</span>
                </div>
                <div className="space-y-3 flex-1 mb-8">
                  {premiumFeatures.map((f) => (
                    <div key={f} className="flex items-start gap-3">
                      <span className="mt-0.5 text-sm" style={{ color: accent }}>{"\u25c6"}</span>
                      <span className="text-[var(--text-secondary)] text-[15px] font-light">{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/signup">
                  <button className="w-full px-8 py-4 rounded-full text-base font-medium transition-all duration-300 cursor-pointer" style={{ background: accent, color: bg }}>
                    {"Commencer maintenant"}
                  </button>
                </Link>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.3}>
            <p className="text-center text-xs text-[var(--text-muted)] mt-6 font-light italic">
              {s("pricing_footer")}
            </p>
          </Reveal>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="px-6 md:px-20 py-32 border-t border-[var(--dark-border)] relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-[0.03] blur-[120px]" style={{ background: gold }} />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <Reveal><GoldDivider /></Reveal>
          <Reveal delay={0.1}>
            <p className="font-display text-3xl md:text-5xl font-light leading-tight mt-12 mb-8">
              {s("cta_title").split("\n").map((line, i) => (
                <span key={i}>
                  {i > 0 && <br />}
                  {line.includes("seul") || line.includes("jamais") ? (
                    <em className="font-light" style={{ color: gold }}>{line}</em>
                  ) : line}
                </span>
              ))}
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <Link href="/signup">
              <button className="cta-glow px-12 py-5 rounded-full text-lg font-medium tracking-wide transition-all duration-300 cursor-pointer" style={{ background: gold, color: bg }}>
                {s("cta_button")}
              </button>
            </Link>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="text-xs text-[var(--text-muted)] mt-6 tracking-wide">
              {trialDays}{" jours gratuits (Essentiel) \u2014 Puis "}{priceEssential}{"\u20ac/mois \u2014 Sans engagement"}
            </p>
          </Reveal>
          <Reveal delay={0.35}>
            <div className="mt-8">
              <Link href="/login" className="gold-underline text-sm text-[var(--text-muted)] transition-colors duration-300" style={{ ["--gold" as string]: gold }}>
                {"D\u00e9j\u00e0 membre ? Se connecter"}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 md:px-20 py-12 border-t border-[var(--dark-border)]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            {s("logo_url") ? (
              <img src={s("logo_url")} alt="SOS Shine" className="w-8 h-8 rounded-lg object-cover" />
            ) : null}
            <span className="font-display text-xl font-medium" style={{ color: gold }}>{s("footer_name")}</span>
            <span className="text-[var(--text-muted)] text-xs">{"\u00a9 2026"}</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-[var(--text-muted)]">
            <Link href={s("footer_link_mentions") || "/mentions-legales"} className="gold-underline transition-colors">{"Mentions l\u00e9gales"}</Link>
            <Link href={s("footer_link_cgv") || "/cgv"} className="gold-underline transition-colors">CGV</Link>
            <Link href={s("footer_link_privacy") || "/confidentialite"} className="gold-underline transition-colors">{"Confidentialit\u00e9"}</Link>
            <Link href={s("footer_link_contact") || "/contact"} className="gold-underline transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
