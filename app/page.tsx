"use client";

import Link from "next/link";
import { useEffect, useState, useRef, ReactNode, useCallback, useMemo } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { LANDING_DEFAULTS, buildSectionMap } from "@/lib/landing-defaults";
import type { LandingSectionDefault, SectionContent, SectionStyles } from "@/lib/landing-defaults";

function sanitizeContent(content: SectionContent): SectionContent {
  const replacements: [RegExp, string][] = [
    [/Encyclopédie complète des douleurs/gi, 'Encyclopédie complète des expériences de vie'],
    [/3 étapes par douleur/gi, '3 étapes par challenge émotionnel'],
    [/Chat dédié par douleur/gi, 'Chat dédié par challenge émotionnel'],
    [/chaque douleur/gi, 'chaque challenge émotionnel'],
    [/Chaque douleur/gi, 'Chaque challenge émotionnel'],
    [/une douleur ancienne/gi, 'un challenge émotionnel ancien'],
    [/la douleur/gi, 'le challenge émotionnel'],
    [/nouvelle douleur/gi, 'nouvelle expérience de vie'],
    [/des douleurs/gi, 'des expériences de vie'],
    [/les douleurs/gi, 'les expériences de vie'],
    [/vos douleurs/gi, 'vos expériences de vie'],
    [/douleurs/gi, 'expériences de vie'],
    [/douleur/gi, 'challenge émotionnel'],
  ];

  function sanitizeValue(val: unknown): unknown {
    if (typeof val === 'string') {
      let result = val;
      for (const [pattern, replacement] of replacements) {
        result = result.replace(pattern, replacement);
      }
      return result;
    }
    if (Array.isArray(val)) return val.map(sanitizeValue);
    if (val && typeof val === 'object') {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(val)) out[k] = sanitizeValue(v);
      return out;
    }
    return val;
  }

  return sanitizeValue(content) as SectionContent;
}

function hexToRgb(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return "212,168,67";
  return `${r},${g},${b}`;
}

function RevealOnScroll({ children, delay = 0, className = "", direction = "up" }: { children: ReactNode; delay?: number; className?: string; direction?: "up" | "left" | "right" | "scale" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  const variants = {
    up: { hidden: { opacity: 0, y: 80 }, visible: { opacity: 1, y: 0 } },
    left: { hidden: { opacity: 0, x: -60 }, visible: { opacity: 1, x: 0 } },
    right: { hidden: { opacity: 0, x: 60 }, visible: { opacity: 1, x: 0 } },
    scale: { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants[direction]}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function WordByWordReveal({ text, className = "", style = {} }: { text: string; className?: string; style?: React.CSSProperties }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const words = text.split(/\s+/);

  return (
    <span ref={ref} className={className} style={style}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-[0.3em]"
          initial={{ opacity: 0, y: 40, rotateX: -15, filter: "blur(8px)" }}
          animate={isInView ? { opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" } : {}}
          transition={{
            duration: 0.7,
            delay: i * 0.08,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

function InfiniteTickerBand({ items, speed = 30 }: { items: string[]; speed?: number }) {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden py-6 border-y border-[var(--dark-border)]" style={{ background: "rgba(212, 175, 55, 0.02)" }}>
      <div className="ticker-track" style={{ animationDuration: `${speed}s` }}>
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-6 px-6 whitespace-nowrap">
            <span className="text-sm md:text-base tracking-[0.15em] uppercase font-light" style={{ color: "var(--text-secondary)" }}>
              {item}
            </span>
            <span className="block w-1.5 h-1.5 rotate-45" style={{ background: "var(--gold)", opacity: 0.4 }} />
          </span>
        ))}
      </div>
    </div>
  );
}

function GlowingCard({ children, className = "", glowColor = "rgba(212, 175, 55, 0.15)", style }: { children: ReactNode; className?: string; glowColor?: string; style?: React.CSSProperties }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const rafRef = useRef<number>(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current || !glowRef.current) return;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (!cardRef.current || !glowRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      glowRef.current.style.left = `${x - 150}px`;
      glowRef.current.style.top = `${y - 150}px`;
    });
  };

  return (
    <div
      ref={cardRef}
      className={`glow-card relative ${className}`}
      style={style}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        ref={glowRef}
        className="absolute pointer-events-none transition-opacity duration-500"
        style={{
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${glowColor}, transparent 70%)`,
          opacity: isHovered ? 0.6 : 0,
          zIndex: 0,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const width = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return <motion.div className="scroll-progress" style={{ width }} />;
}

function FloatingOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      <div className="orb" style={{ width: 500, height: 500, top: "10%", left: "-10%", background: "rgba(212, 175, 55, 0.012)" }} />
      <div className="orb" style={{ width: 400, height: 400, top: "60%", right: "-15%", background: "rgba(212, 175, 55, 0.008)", animationDelay: "5s" }} />
    </div>
  );
}

const DIAMONDS = [
  { top: '5%', left: '10%', duration: '8s', delay: '0s', size: 4 },
  { top: '15%', left: '85%', duration: '10s', delay: '1.5s', size: 3 },
  { top: '35%', left: '50%', duration: '7s', delay: '3s', size: 4 },
  { top: '50%', left: '20%', duration: '9s', delay: '0.8s', size: 3 },
  { top: '65%', left: '75%', duration: '8s', delay: '2.2s', size: 4 },
  { top: '80%', left: '40%', duration: '10s', delay: '4s', size: 3 },
  { top: '25%', left: '65%', duration: '9s', delay: '1s', size: 3 },
  { top: '90%', left: '90%', duration: '7s', delay: '3.5s', size: 4 },
];

function SparklingDiamonds() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      {DIAMONDS.map((d, i) => (
        <div key={i} className="diamond-sparkle" style={{
          top: d.top, left: d.left,
          width: d.size + 'px', height: d.size + 'px',
          ['--duration' as string]: d.duration,
          ['--delay' as string]: d.delay,
        }} />
      ))}
    </div>
  );
}

function AnimatedCounter({ value, suffix = "" }: { value: string; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="inline-block"
    >
      {value}{suffix}
    </motion.span>
  );
}

export default function Home() {
  const [headerVisible, setHeaderVisible] = useState(true);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [encyclopediaSearch, setEncyclopediaSearch] = useState('');
  const lastScrollYRef = useRef(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  const [sections, setSections] = useState<Record<string, { content: SectionContent; styles: SectionStyles; is_visible: boolean }>>(() => {
    const map: Record<string, { content: SectionContent; styles: SectionStyles; is_visible: boolean }> = {};
    for (const d of LANDING_DEFAULTS) {
      map[d.section_key] = { content: d.content, styles: d.styles, is_visible: d.is_visible };
    }
    return map;
  });

  const loadSections = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase.from("landing_sections").select("*").order("position");
      if (data && data.length > 0) {
        const rows = data as unknown as LandingSectionDefault[];
        const dbMap = buildSectionMap(rows);
        const merged: Record<string, { content: SectionContent; styles: SectionStyles; is_visible: boolean }> = {};
        for (const d of LANDING_DEFAULTS) {
          const row = dbMap[d.section_key];
          merged[d.section_key] = row
            ? { content: sanitizeContent(row.content), styles: row.styles, is_visible: row.is_visible }
            : { content: d.content, styles: d.styles, is_visible: d.is_visible };
        }
        for (const row of rows) {
          if (!merged[row.section_key]) {
            merged[row.section_key] = { content: sanitizeContent(row.content), styles: row.styles, is_visible: row.is_visible };
          }
        }
        setSections(merged);
      }
    } catch {
      // defaults already set
    }
  }, []);

  useEffect(() => {
    loadSections();
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setHeaderVisible(y < 100 || y < lastScrollYRef.current);
        setHeaderScrolled(y > 50);
        lastScrollYRef.current = y;
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [loadSections]);

  function sec(key: string): SectionContent { return sections[key]?.content || {}; }
  function sty(key: string): SectionStyles { return sections[key]?.styles || {}; }
  function vis(key: string): boolean { return sections[key]?.is_visible !== false; }

  const g = sty('_global');
  const gold = g.color_primary || '#D4AF37';
  const accent = g.color_secondary || '#74C0FC';
  const bg = g.color_bg || '#362038';
  const buttonBg = g.color_button || gold;
  const goldRgb = hexToRgb(gold);
  const accentRgb = hexToRgb(accent);

  const goldDeep = (() => {
    const h = gold.replace("#", "");
    const r = Math.max(0, parseInt(h.substring(0, 2), 16) - 44);
    const gv = Math.max(0, parseInt(h.substring(2, 4), 16) - 35);
    const b = Math.max(0, parseInt(h.substring(4, 6), 16) - 17);
    return `#${r.toString(16).padStart(2, "0")}${gv.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  })();

  const goldHover = (() => {
    const h = gold.replace("#", "");
    const r = Math.min(255, parseInt(h.substring(0, 2), 16) + 12);
    const gv = Math.min(255, parseInt(h.substring(2, 4), 16) + 16);
    const b = Math.min(255, parseInt(h.substring(4, 6), 16) + 10);
    return `#${r.toString(16).padStart(2, "0")}${gv.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  })();

  const fontMap: Record<string, string> = {
    "Cinzel": "'Cinzel', serif",
    "Montserrat": "'Montserrat', sans-serif",
    "Cormorant Garamond": "'Cormorant Garamond', serif",
    "DM Sans": "'DM Sans', sans-serif",
    "Georgia": "Georgia, serif",
    "Arial": "Arial, sans-serif",
    "Times New Roman": "'Times New Roman', serif",
  };
  const sizeMap: Record<string, string> = {
    sm: "clamp(1.5rem, 3vw, 1.875rem)", md: "clamp(1.875rem, 4vw, 2.25rem)",
    lg: "clamp(2.25rem, 5vw, 3rem)", xl: "clamp(2.5rem, 6vw, 3.75rem)", "2xl": "clamp(3rem, 7vw, 4.5rem)",
  };

  function tStyle(sectionKey: string): React.CSSProperties {
    const st = sty(sectionKey);
    return {
      fontFamily: fontMap[st.title_font] || undefined,
      fontSize: sizeMap[st.title_size] || undefined,
      textAlign: (st.title_align as "left" | "center" | "right") || undefined,
      color: st.title_color || undefined,
    };
  }

  const globalContent = sec('_global');
  const hero = sec('hero');
  const heroSty = sty('hero');
  const principe = sec('principe');
  const stepsData = sec('steps');
  const encyclo = sec('encyclopedie');
  const comm = sec('communaute');
  const temos = sec('temoignages');
  const pricing = sec('pricing');
  const ctaDark = sec('cta_dark');
  const ctaLight = sec('cta_light');
  const foot = sec('footer');

  const trialDays = globalContent.trial_days || 7;
  const logoUrl = globalContent.logo_url || '';

  const cssVars = {
    "--gold": gold,
    "--gold-deep": goldDeep,
    "--gold-light": goldHover,
    "--accent": accent,
    "--bg": bg,
    "--dark": bg,
    "--button-bg": buttonBg,
  } as React.CSSProperties;

  const tickerItems = [
    "Abandon", "Burn-out", "Deuil", "Trahison", "Anxiete", "Rejet",
    "Solitude", "Rupture", "Dependance affective", "Peur", "Confiance en soi",
  ];

  return (
    <main className="grain relative z-0 overflow-hidden" style={cssVars}>
      <ScrollProgress />
      <SparklingDiamonds />
      <FloatingOrbs />

      {/* ═══ FIXED HEADER ═══ */}
      {headerVisible && (
          <header
            className={`fixed top-0 left-0 right-0 z-50 py-4 header-animate ${headerScrolled ? 'header-scrolled' : ''}`}
          >
            <div className="flex items-center justify-center">
              <Link href="/" className="flex items-center gap-3">
                <img src={logoUrl || '/images/logo.png'} alt="SOS Shine" className="h-10 w-auto object-contain" />
              </Link>
            </div>
          </header>
        )}

      {/* ═══ HERO — Word by word reveal ═══ */}
      {vis('hero') && (
        <motion.section ref={heroRef} className="relative min-h-screen flex items-center pt-24" style={{ opacity: heroOpacity, scale: heroScale }}>
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-[0.04] blur-[150px]" style={{ background: gold }} />
          </div>

          <div className="relative z-10 px-6 md:px-20 py-24 max-w-6xl mx-auto w-full text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="mb-8"
            >
              <span className="inline-block px-4 py-1.5 rounded-full text-xs tracking-[0.25em] uppercase font-medium" style={{ background: `rgba(${goldRgb}, 0.08)`, color: gold, border: `1px solid rgba(${goldRgb}, 0.15)` }}>
                Espace de soutien premium
              </span>
            </motion.div>

            <h1 className="font-display font-light leading-[1.08] mb-8" style={{ ...tStyle("hero"), perspective: "1000px" }}>
              {(hero.title || '').split("\n").map((line: string, i: number) => {
                const isHighlight = line.includes("expériences") || line.includes("schémas") || line.includes("potentiel") || line.includes("émotionnels");
                const lineWords = line.split(/\s+/);
                const baseDelay = i * 0.2 + 0.15;
                return (
                  <span key={i} className="block">
                    {i > 0 && <span className="block h-2" />}
                    {lineWords.map((word, wi) => (
                      <motion.span
                        key={wi}
                        className={`inline-block mr-[0.3em] ${isHighlight ? 'text-shimmer' : ''}`}
                        initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{
                          duration: 0.7,
                          delay: baseDelay + wi * 0.08,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                      >
                        {word}
                      </motion.span>
                    ))}
                  </span>
                );
              })}
            </h1>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-xl md:text-2xl text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto font-light mb-10" style={{
                fontFamily: fontMap[heroSty.text_font] || undefined,
                textAlign: (heroSty.text_align as "left" | "center" | "right") || undefined,
              }}>
                {hero.subtitle || ''}
              </p>
            </motion.div>

            {hero.video_url && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}>
                <div className="glass overflow-hidden mb-10 max-w-3xl mx-auto">
                  <video src={hero.video_url} controls className="w-full aspect-video" />
                </div>
              </motion.div>
            )}

            {!hero.video_url && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}>
                <div className="glass overflow-hidden mb-10 max-w-3xl mx-auto">
                  <div className="relative aspect-video flex items-center justify-center cursor-pointer group">
                    <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom right, rgba(${goldRgb},0.08), transparent)` }} />
                    <div className="relative z-10 text-center">
                      <motion.div
                        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                        style={{ background: `rgba(${goldRgb},0.15)`, border: `2px solid rgba(${goldRgb},0.3)` }}
                        whileHover={{ scale: 1.15 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <svg className="w-8 h-8 ml-1" fill="none" viewBox="0 0 24 24" stroke={gold} strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                        </svg>
                      </motion.div>
                      <p className="text-sm text-[var(--text-secondary)]">Decouvrir SOS Shine en 2 minutes</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}>
              <div className="flex flex-wrap gap-5 justify-center">
                {(hero.buttons || []).map((btn: { label: string; href: string; variant: string }, i: number) => (
                  <Link key={i} href={btn.href === '/signup' || btn.href === '/login' ? '/rejoindre' : btn.href}>
                    {btn.variant === 'primary' ? (
                      <button className="magnetic-btn pulse-ring px-8 py-4 rounded-full text-base font-semibold tracking-wide" style={{ background: `linear-gradient(135deg, ${gold}, ${goldDeep})`, color: '#050505' }}>
                        {btn.label} — {trialDays} jours d&apos;essai
                      </button>
                    ) : (
                      <button className="magnetic-btn px-8 py-4 rounded-full text-base font-medium tracking-wide" style={{ border: `1px solid rgba(${goldRgb},0.3)`, color: gold, background: `rgba(${goldRgb},0.04)` }}>
                        {btn.label}
                      </button>
                    )}
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="text-xs tracking-[0.3em] uppercase text-[var(--text-muted)]">Scroll</span>
            <span className="block w-px h-10 bg-gradient-to-b from-[var(--text-muted)] to-transparent" />
          </motion.div>
        </motion.section>
      )}

      {/* ═══ TICKER BAND ═══ */}
      <InfiniteTickerBand items={tickerItems} speed={35} />

      {/* ═══ LE PRINCIPE ═══ */}
      {vis('principe') && (
        <section className="px-6 md:px-20 py-32 relative">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.02] blur-[120px]" style={{ background: gold }} />
          </div>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <RevealOnScroll>
              <p className="luxury-title text-sm tracking-[0.4em] text-[var(--text-muted)] mb-10">{principe.label || ''}</p>
            </RevealOnScroll>

            {principe.image_url && (
              <RevealOnScroll delay={0.1} direction="scale">
                <img src={principe.image_url} alt="" className="w-full rounded-2xl object-cover max-h-72 mb-10" style={{ border: '1px solid var(--dark-border)' }} />
              </RevealOnScroll>
            )}

            <RevealOnScroll delay={0.15}>
              <h2 className="font-display font-light leading-[1.15] mb-10" style={tStyle("principe")}>
                {(principe.title || '').split("\n").map((line: string, i: number) => (
                  <span key={i} className="block">
                    {i > 0 && <span className="block h-1" />}
                    {line.includes("schémas") || line.includes("challenge") || line.includes("potentiel") ? (
                      <span className="text-shimmer">{line}</span>
                    ) : line}
                  </span>
                ))}
              </h2>
            </RevealOnScroll>

            <RevealOnScroll delay={0.25}>
              <p className="text-lg md:text-xl text-[var(--text-secondary)] leading-relaxed font-light max-w-2xl mx-auto">
                {principe.description || ''}
              </p>
            </RevealOnScroll>

            <RevealOnScroll delay={0.35}>
              <div className="mt-10 flex items-center justify-center gap-4">
                <span className="block w-20 h-px" style={{ background: `linear-gradient(to right, transparent, rgba(${goldRgb}, 0.3))` }} />
                <span className="block w-2 h-2 rotate-45" style={{ background: gold, opacity: 0.5 }} />
                <span className="block w-20 h-px" style={{ background: `linear-gradient(to left, transparent, rgba(${goldRgb}, 0.3))` }} />
              </div>
            </RevealOnScroll>
          </div>
        </section>
      )}

      {/* ═══ LES ETAPES — Glowing Cards ═══ */}
      {vis('steps') && (
        <section className="px-6 md:px-20 py-32 relative">
          <div className="max-w-6xl mx-auto">
            <RevealOnScroll>
              <p className="luxury-title text-center text-sm tracking-[0.4em] text-[var(--text-muted)] mb-4">{stepsData.label || ''}</p>
            </RevealOnScroll>
            <RevealOnScroll delay={0.1}>
              <h2 className="font-display font-light text-center mb-20" style={tStyle("steps")}>
                <WordByWordReveal text={stepsData.title || ''} />
              </h2>
            </RevealOnScroll>

            <div className="grid md:grid-cols-3 gap-8">
              {(stepsData.items || []).map((step: { num: string; title: string; description: string; color: string }, i: number) => (
                <RevealOnScroll key={step.num} delay={i * 0.15} direction={i === 0 ? "left" : i === 2 ? "right" : "up"}>
                  <GlowingCard className="p-8 md:p-10 h-full" glowColor={`${step.color}25`}>
                    <div className="mb-6">
                      <span className="font-display text-6xl font-extralight block mb-2" style={{ color: step.color, opacity: 0.15 }}>{step.num}</span>
                      <span className="luxury-title text-xs tracking-[0.3em] block mb-3" style={{ color: step.color, opacity: 0.6 }}>Etape {step.num}</span>
                      <h3 className="font-display text-2xl font-medium">{step.title}</h3>
                    </div>
                    <p className="text-[var(--text-secondary)] leading-relaxed text-[15px] font-light">{step.description}</p>
                    <div className="mt-6 h-px w-full" style={{ background: `linear-gradient(to right, ${step.color}30, transparent)` }} />
                  </GlowingCard>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ L'ENCYCLOPEDIE ═══ */}
      {vis('encyclopedie') && (
        <section className="px-6 md:px-20 py-32 relative">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-[0.02] blur-[150px]" style={{ background: gold }} />
          </div>

          <div className="max-w-5xl mx-auto relative z-10">
            <RevealOnScroll>
              <p className="luxury-title text-center text-sm tracking-[0.4em] text-[var(--text-muted)] mb-4">{encyclo.label || "L'encyclopedie"}</p>
            </RevealOnScroll>
            <RevealOnScroll delay={0.1}>
              <h2 className="font-display font-light text-center mb-6" style={tStyle("encyclopedie")}>
                <WordByWordReveal text={encyclo.title || ''} />
              </h2>
            </RevealOnScroll>
            <RevealOnScroll delay={0.2}>
              <p className="text-lg text-[var(--text-secondary)] font-light leading-relaxed mb-16 max-w-2xl mx-auto text-center">
                {encyclo.description || ''}
              </p>
            </RevealOnScroll>

            <RevealOnScroll delay={0.25}>
              <div className="max-w-md mx-auto mb-12">
                <input
                  type="text"
                  value={encyclopediaSearch}
                  onChange={(e) => setEncyclopediaSearch(e.target.value)}
                  placeholder="Rechercher un challenge (ex: burn-out)..."
                  className="w-full px-5 py-3 rounded-full text-sm font-light"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid rgba(${goldRgb}, 0.25)`,
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                />
              </div>
            </RevealOnScroll>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {(encyclo.items || []).filter((d: string) => !encyclopediaSearch || d.toLowerCase().includes(encyclopediaSearch.toLowerCase())).map((d: string, i: number) => (
                <RevealOnScroll key={d} delay={i * 0.05} direction="scale">
                  <GlowingCard className="px-5 py-4 text-center cursor-pointer group">
                    <span className="text-sm font-light transition-colors duration-300 group-hover:text-[var(--gold)]" style={{
                      color: i === (encyclo.items || []).length - 1 ? gold : 'var(--text-secondary)',
                    }}>
                      {d}
                    </span>
                  </GlowingCard>
                </RevealOnScroll>
              ))}
            </div>

            <RevealOnScroll delay={0.3}>
              <div className="text-center mt-12">
                <Link href="/encyclopedie">
                  <button className="magnetic-btn px-8 py-3.5 rounded-full text-sm font-medium tracking-wide" style={{ border: `1px solid rgba(${goldRgb},0.25)`, color: gold, background: `rgba(${goldRgb},0.04)` }}>
                    Explorer l&apos;encyclopedie
                  </button>
                </Link>
              </div>
            </RevealOnScroll>
          </div>
        </section>
      )}

      {/* ═══ TICKER BAND 2 ═══ */}
      <InfiniteTickerBand items={["Soutien 24/7", "Communaute bienveillante", "Protocoles exclusifs", "Soins collectifs", "Chat dedie", "Evenements live", "Meditation guidee", "Coaching immersif"]} speed={40} />

      {/* ═══ COMMUNAUTE ═══ */}
      {vis('communaute') && (
        <section className="px-6 md:px-20 py-32 relative">
          <div className="max-w-5xl mx-auto">
            <RevealOnScroll>
              <h2 className="font-display font-light leading-[1.1] text-center mb-6" style={tStyle("communaute")}>
                <WordByWordReveal text={comm.title || ''} />
              </h2>
            </RevealOnScroll>
            <RevealOnScroll delay={0.15}>
              <p className="text-lg md:text-xl text-[var(--text-secondary)] font-light leading-relaxed mb-20 max-w-2xl mx-auto text-center">
                {comm.description || ''}
              </p>
            </RevealOnScroll>

            <div className="space-y-6">
              {(comm.blocks || []).filter((b: { title: string; description: string }) => b.title).map((item: { title: string; description: string }, i: number) => (
                <RevealOnScroll key={item.title} delay={i * 0.12} direction={i % 2 === 0 ? "left" : "right"}>
                  <GlowingCard className="p-8 md:p-10">
                    <div className="flex items-start gap-6">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `rgba(${goldRgb}, 0.08)`, border: `1px solid rgba(${goldRgb}, 0.12)` }}>
                        <span className="font-display text-lg" style={{ color: gold }}>
                          {i === 0 ? "🔥" : i === 1 ? "📢" : "🤝"}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-medium mb-3">{item.title}</h3>
                        <p className="text-[var(--text-secondary)] leading-relaxed text-[15px] font-light">{item.description}</p>
                      </div>
                    </div>
                  </GlowingCard>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ TEMOIGNAGES ═══ */}
      {vis('temoignages') && (
        <section className="px-6 md:px-20 py-32 relative">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute bottom-0 left-1/3 w-[700px] h-[500px] rounded-full opacity-[0.02] blur-[150px]" style={{ background: gold }} />
          </div>

          <div className="max-w-5xl mx-auto relative z-10">
            <RevealOnScroll>
              <p className="luxury-title text-center text-sm tracking-[0.4em] text-[var(--text-muted)] mb-20">
                <WordByWordReveal text={temos.label || ''} />
              </p>
            </RevealOnScroll>

            <div className="grid md:grid-cols-2 gap-8">
              {(temos.items || []).filter((t: { quote: string; name: string; city: string }) => t.quote).map((t: { quote: string; name: string; city: string }, i: number) => (
                <RevealOnScroll key={i} delay={i * 0.12} direction={i % 2 === 0 ? "left" : "right"}>
                  <GlowingCard className="p-8 md:p-10 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex gap-1 mb-6">
                        {[1,2,3,4,5].map(s => (
                          <span key={s} className="text-sm" style={{ color: gold }}>★</span>
                        ))}
                      </div>
                      <p className="font-display text-lg italic text-[var(--text-primary)] font-light leading-relaxed mb-8">
                        &laquo; {t.quote} &raquo;
                      </p>
                    </div>
                    <div className="flex items-center gap-3 pt-4" style={{ borderTop: `1px solid rgba(${goldRgb}, 0.08)` }}>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-display text-sm" style={{ background: `linear-gradient(135deg, rgba(${goldRgb},0.15), rgba(${goldRgb},0.05))`, color: gold }}>
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: gold }}>{t.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">{t.city}</p>
                      </div>
                    </div>
                  </GlowingCard>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ OFFRES / PRICING ═══ */}
      {vis('pricing') && (
        <section className="px-6 md:px-20 py-32 relative">
          <div className="max-w-5xl mx-auto">
            <RevealOnScroll>
              <p className="luxury-title text-center text-sm tracking-[0.4em] text-[var(--text-muted)] mb-4">Tarification</p>
            </RevealOnScroll>
            <RevealOnScroll delay={0.1}>
              <h2 className="font-display font-light text-center mb-4" style={tStyle("pricing")}>
                <WordByWordReveal text={pricing.title || ''} />
              </h2>
            </RevealOnScroll>
            <RevealOnScroll delay={0.2}>
              <p className="text-[var(--text-secondary)] font-light text-center mb-20">{pricing.subtitle || ''}</p>
            </RevealOnScroll>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {(pricing.plans || []).map((plan: { name: string; price: string; period: string; button_label: string; button_href: string; highlight: boolean; badge: string; features: string[] }, idx: number) => (
                <RevealOnScroll key={plan.name} delay={(idx + 1) * 0.15} direction={(["left", "up", "scale", "right"] as const)[idx % 4]}>
                  <GlowingCard className={`p-8 md:p-10 h-full flex flex-col relative ${plan.highlight ? 'ring-1' : ''}`} glowColor={plan.highlight ? `rgba(${accentRgb},0.15)` : `rgba(${goldRgb},0.15)`} style={plan.highlight ? { '--tw-ring-color': `rgba(${accentRgb},0.15)` } as React.CSSProperties : undefined}>
                    {plan.badge && (
                      <motion.div
                        className="absolute -top-3 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase"
                        style={{ background: `linear-gradient(135deg, ${accent}, rgba(${accentRgb},0.7))`, color: '#050505' }}
                        initial={{ y: -10, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 }}
                      >
                        {plan.badge}
                      </motion.div>
                    )}

                    <p className="luxury-title text-sm tracking-[0.25em] text-[var(--text-muted)] mb-6">{plan.name}</p>

                    <div className="flex items-baseline gap-1 mb-8">
                      <span className="font-display text-6xl font-extralight" style={{ color: plan.highlight ? accent : gold }}>
                        <AnimatedCounter value={plan.price} suffix="€" />
                      </span>
                      <span className="text-[var(--text-muted)] text-sm">{plan.period}</span>
                    </div>

                    <div className="space-y-4 flex-1 mb-10">
                      {(plan.features || []).map((f: string, fi: number) => (
                        <motion.div
                          key={f}
                          className="flex items-start gap-3"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + fi * 0.05 }}
                        >
                          <span className="mt-0.5 text-sm" style={{ color: plan.highlight ? accent : gold }}>◆</span>
                          <span className="text-[var(--text-secondary)] text-[15px] font-light">{f}</span>
                        </motion.div>
                      ))}
                    </div>

                    <Link href="/rejoindre">
                      <button className={`magnetic-btn w-full py-4 rounded-full text-base font-semibold tracking-wide ${plan.highlight ? 'pulse-ring' : ''}`} style={{
                        background: plan.highlight ? `linear-gradient(135deg, ${accent}, rgba(${accentRgb},0.7))` : `linear-gradient(135deg, ${gold}, ${goldDeep})`,
                        color: '#050505'
                      }}>
                        {plan.button_label}
                      </button>
                    </Link>
                  </GlowingCard>
                </RevealOnScroll>
              ))}
            </div>

            <RevealOnScroll delay={0.4}>
              <p className="text-center text-xs text-[var(--text-muted)] mt-8 font-light italic">{pricing.footer || ''}</p>
            </RevealOnScroll>
          </div>
        </section>
      )}

      {/* ═══ CTA FINAL DARK ═══ */}
      {vis('cta_dark') && (
        <section className="px-6 md:px-20 py-40 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-[0.04] blur-[150px]" style={{ background: gold }} />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            {ctaDark.image_url && (
              <RevealOnScroll direction="scale">
                <img src={ctaDark.image_url} alt="" className="w-48 h-48 rounded-2xl object-cover mx-auto mb-8" />
              </RevealOnScroll>
            )}
            <RevealOnScroll>
              <h2 className="font-display font-light leading-[1.12] mb-12" style={tStyle("cta_dark")}>
                <WordByWordReveal text={ctaDark.title || ''} />
              </h2>
            </RevealOnScroll>
            <RevealOnScroll delay={0.3}>
              <Link href="/rejoindre">
                <button className="magnetic-btn pulse-ring px-10 py-5 rounded-full text-lg font-semibold tracking-wide" style={{ background: `linear-gradient(135deg, ${gold}, ${goldDeep})`, color: '#050505' }}>
                  Rejoindre SOS Shine
                </button>
              </Link>
            </RevealOnScroll>
          </div>
        </section>
      )}

      {/* ═══ CTA LIGHT ═══ */}
      {vis('cta_light') && (
        <section className="px-6 md:px-20 py-32 relative overflow-hidden" style={{ background: sty('cta_light').bg || '#ffffff' }}>
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <RevealOnScroll>
              <p className="text-xl md:text-2xl font-light leading-relaxed mb-12" style={{ color: sty('cta_light').text_color || '#1a1a1a' }}>
                {ctaLight.description || ''}
              </p>
            </RevealOnScroll>
            <RevealOnScroll delay={0.15}>
              <Link href="/rejoindre">
                <button className="magnetic-btn px-10 py-5 rounded-full text-lg font-semibold tracking-wide" style={{ background: `linear-gradient(135deg, ${gold}, ${goldDeep})`, color: '#050505' }}>
                  {ctaLight.button_label || 'Rejoindre SOS Shine'}
                </button>
              </Link>
              <div className="mt-8">
                <Link href="/login" className="text-sm transition-colors duration-300 underline underline-offset-4" style={{ color: sty('cta_light').muted_color || '#6b7280' }}>
                  {ctaLight.login_text || 'Deja membre ? Se connecter'}
                </Link>
              </div>
            </RevealOnScroll>
          </div>
        </section>
      )}

      {/* ═══ FOOTER ═══ */}
      {vis('footer') && (
        <footer className="px-6 md:px-20 py-16 border-t border-[var(--dark-border)] relative" style={{ background: "rgba(0,0,0,0.3)" }}>
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-10">
              <div className="flex items-center gap-3">
                <img src={logoUrl || '/images/logo.png'} alt="SOS Shine" className="h-8 w-auto object-contain" />
              </div>

              <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
                {(foot.links || []).map((link: { label: string; href: string }) => (
                  <Link key={link.label} href={link.href} className="text-xs tracking-[0.15em] uppercase text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors duration-300 gold-underline">
                    {link.label}
                  </Link>
                ))}
              </div>

              <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--text-muted)]">
                &copy; {foot.copyright_year || '2026'} {foot.name || 'SOS Shine'}
              </p>
            </div>
          </div>
        </footer>
      )}

    </main>
  );
}
