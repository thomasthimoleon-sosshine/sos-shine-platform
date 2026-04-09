"use client";

import Link from "next/link";
import { useEffect, useState, useRef, ReactNode, useCallback, useMemo, memo } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { LANDING_DEFAULTS, buildSectionMap } from "@/lib/landing-defaults";
import type { LandingSectionDefault, SectionContent, SectionStyles } from "@/lib/landing-defaults";
import ThemeToggle from "@/components/ThemeToggle";
import PreLaunchPage from "./page-prelaunch";
import type { PrelaunchSettings } from "./page-prelaunch";

import { useTranslation } from "@/lib/i18n/useTranslation";

function matchCase(original: string, replacement: string): string {
  if (original === original.toUpperCase()) return replacement.toUpperCase();
  if (original[0] === original[0].toUpperCase()) return replacement[0].toUpperCase() + replacement.slice(1);
  return replacement;
}

function sanitizeContent(content: SectionContent): SectionContent {
  function sanitizeStr(str: string): string {
    let r = str;
    r = r.replace(/Encyclopédie complète des douleurs/gi, (m) => {
      const isUpper = m[0] === m[0].toUpperCase();
      return isUpper ? 'Encyclopédie complète des expériences de vie' : 'encyclopédie complète des expériences de vie';
    });
    r = r.replace(/(\d+)\s+étapes?\s+par\s+douleur/gi, '$1 étapes par challenge émotionnel');
    r = r.replace(/Chat dédié par douleur/gi, (m) => matchCase(m[0], 'C') === 'C' ? 'Chat dédié par challenge émotionnel' : 'chat dédié par challenge émotionnel');
    r = r.replace(/une\s+douleur\s+ancienne/gi, (m) => matchCase(m[0], 'u') + 'n challenge émotionnel ancien');
    r = r.replace(/(chaque)\s+douleur/gi, (_m, p1: string) => p1 + ' challenge émotionnel');
    r = r.replace(/(la)\s+douleur/gi, (_m, p1: string) => matchCase(p1, 'le') + ' challenge émotionnel');
    r = r.replace(/(nouvelle)\s+douleur/gi, (_m, p1: string) => p1 + ' expérience de vie');
    r = r.replace(/(des|les|vos)\s+douleurs/gi, (_m, p1: string) => p1 + ' expériences de vie');
    r = r.replace(/douleurs/gi, (m) => matchCase(m[0], 'e') === 'E' ? 'Expériences de vie' : 'expériences de vie');
    r = r.replace(/douleur/gi, (m) => m[0] === m[0].toUpperCase() ? 'Challenge émotionnel' : 'challenge émotionnel');
    return r;
  }

  function sanitizeValue(val: unknown): unknown {
    if (typeof val === 'string') return sanitizeStr(val);
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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function hexToRgb(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return "212,168,67";
  return `${r},${g},${b}`;
}

const REVEAL_VARIANTS = {
  up: { hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0 } },
  left: { hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: 40 }, visible: { opacity: 1, x: 0 } },
  scale: { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } },
};

function RevealOnScroll({ children, delay = 0, className = "", direction = "up" }: { children: ReactNode; delay?: number; className?: string; direction?: "up" | "left" | "right" | "scale" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={REVEAL_VARIANTS[direction]}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
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
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: 0.5,
            delay: i * 0.06,
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
  { top: '10%', left: '15%', duration: '9s', delay: '0s', size: 10 },
  { top: '25%', left: '80%', duration: '11s', delay: '2s', size: 8 },
  { top: '55%', left: '45%', duration: '10s', delay: '1s', size: 10 },
  { top: '75%', left: '70%', duration: '8s', delay: '3s', size: 8 },
  { top: '85%', left: '25%', duration: '12s', delay: '4s', size: 10 },
];

const DiamondSvg = memo(function DiamondSvg({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="4" fill="#D4AF37" opacity="0.4" />
      <circle cx="12" cy="12" r="2" fill="#FFFBE6" opacity="0.9" />
    </svg>
  );
});

function SparklingDiamonds() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      {DIAMONDS.map((d, i) => (
        <div key={i} className="diamond-sparkle" style={{
          top: d.top, left: d.left,
          width: d.size + 'px', height: d.size + 'px',
          ['--duration' as string]: d.duration,
          ['--delay' as string]: d.delay,
        }}>
          <DiamondSvg size={d.size} />
        </div>
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

function FAQItem({ item, isOpen, onToggle }: { item: { q: string; a: string }; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="glow-card mb-3" style={{ borderRadius: '1rem' }}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 text-left"
      >
        <span className="text-sm sm:text-base font-medium pr-4" style={{ color: 'var(--text-primary)' }}>{item.q}</span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-lg"
          style={{ color: 'var(--gold)', background: 'rgba(212, 175, 55, 0.08)' }}
        >
          +
        </motion.span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden"
      >
        <p className="px-5 sm:px-6 pb-5 text-sm sm:text-[15px] font-light leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {item.a}
        </p>
      </motion.div>
    </div>
  );
}

export type SectionMap = Record<string, { content: SectionContent; styles: SectionStyles; is_visible: boolean }>

interface LandingClientProps {
  initialSections?: SectionMap
  initialPrelaunchEnabled?: boolean
  initialPrelaunchSettings?: PrelaunchSettings
}

export default function LandingClient({ initialSections, initialPrelaunchEnabled, initialPrelaunchSettings }: LandingClientProps) {
  const { t } = useTranslation();
  const [headerVisible, setHeaderVisible] = useState(true);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [encyclopediaSearch, setEncyclopediaSearch] = useState('');
  const lastScrollYRef = useRef(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  const [prelaunchEnabled, setPrelaunchEnabled] = useState<boolean | null>(initialPrelaunchEnabled ?? null);
  const [prelaunchSettings, setPrelaunchSettings] = useState<PrelaunchSettings>(initialPrelaunchSettings ?? {});

  const [sections, setSections] = useState<SectionMap>(() => {
    if (initialSections && Object.keys(initialSections).length > 0) return initialSections;
    const map: SectionMap = {};
    for (const d of LANDING_DEFAULTS) {
      map[d.section_key] = { content: d.content, styles: d.styles, is_visible: d.is_visible };
    }
    return map;
  });

  const loadPrelaunchSettings = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: settingsData } = await supabase.from("site_settings").select("key, value").like("key", "prelaunch_%");
      if (settingsData && settingsData.length > 0) {
        const map: PrelaunchSettings = {};
        settingsData.forEach((row: { key: string; value: string }) => {
          (map as Record<string, string>)[row.key] = row.value;
        });
        setPrelaunchSettings(map);
        setPrelaunchEnabled((map as Record<string, string>).prelaunch_enabled === 'true');
      } else {
        setPrelaunchEnabled(false);
      }
    } catch {
      setPrelaunchEnabled(false);
    }
  }, []);

  const loadSections = useCallback(async () => {
    await loadPrelaunchSettings();

    try {
      const supabase = createClient();

      // Preview mode: ?preview=julia force l'affichage de la variante Julia
      const urlParams = new URLSearchParams(window.location.search);
      const previewVariant = urlParams.get('preview');

      // A/B Testing: vérifier si le visiteur doit voir la variante B
      let useVariantB = false;
      let abVariantId: string | null = null;

      if (previewVariant === 'julia') {
        // Mode preview: charger directement la variante Julia
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: variant } = await (supabase as any)
          .from('landing_page_variants')
          .select('id')
          .eq('name', 'julia')
          .single();
        if (variant) {
          useVariantB = true;
          abVariantId = variant.id;
        }
      } else {
        try {
          const abRes = await fetch('/api/ab-test');
          if (abRes.ok) {
            const abData = await abRes.json();
            // Stocker le variant_id pour le tracking de conversion
            if (abData.variant_id) {
              sessionStorage.setItem('ab_variant_id', abData.variant_id);
              sessionStorage.setItem('ab_variant_name', abData.variant || 'default');
            }
            if (abData.variant === 'julia' && abData.variant_id) {
              useVariantB = true;
              abVariantId = abData.variant_id;
            }
          }
        } catch {
          // Pas de A/B test, utiliser la landing par défaut
        }
      }

      if (useVariantB && abVariantId) {
        // Charger les sections de la variante Julia
        const { data: variantData } = await supabase
          .from('landing_variant_sections')
          .select('*')
          .eq('variant_id', abVariantId)
          .order('position');

        if (variantData && variantData.length > 0) {
          const rows = variantData as unknown as LandingSectionDefault[];
          const merged: Record<string, { content: SectionContent; styles: SectionStyles; is_visible: boolean }> = {};
          for (const row of rows) {
            merged[row.section_key] = { content: sanitizeContent(row.content), styles: row.styles, is_visible: row.is_visible };
          }
          setSections(merged);
          return;
        }
      }

      // Landing par défaut (variante A)
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
      // landing defaults already set
    }
  }, [loadPrelaunchSettings]);

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

    // Re-fetch prelaunch settings when tab becomes visible (after admin edits in another tab)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadPrelaunchSettings();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [loadSections, loadPrelaunchSettings]);

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

  const ticker1Data = sec('ticker_1');
  const ticker2Data = sec('ticker_2');
  const tickerItems = (Array.isArray(ticker1Data.items) && ticker1Data.items.length > 0)
    ? ticker1Data.items
    : ['Abandon', 'Anxiété', 'Burn-out', 'Confiance en soi', 'Dépendance', 'Deuil', 'Trauma', 'Résilience', 'Pardon'];
  const ticker1Speed = ticker1Data.speed || 35;
  const ticker2Items = (Array.isArray(ticker2Data.items) && ticker2Data.items.length > 0)
    ? ticker2Data.items
    : ['Accessible 24/7', 'Communauté bienveillante', '200+ protocoles', 'Sessions collectives', 'Chat dédié', 'Événements live', 'Séances guidées', "Cahiers d'exercices"];
  const ticker2Speed = ticker2Data.speed || 40;

  // Show loading while checking prelaunch, then prelaunch page if enabled
  if (prelaunchEnabled === null) {
    return <div className="min-h-screen" style={{ background: 'var(--dark, #0A0A0A)' }} />;
  }
  if (prelaunchEnabled) {
    return <PreLaunchPage settings={prelaunchSettings} />;
  }

  return (
    <main className="grain relative z-0 overflow-hidden" style={cssVars}>
      <ScrollProgress />
      <SparklingDiamonds />
      <FloatingOrbs />

      {/* ═══ FIXED HEADER ═══ */}
      {headerVisible && (
          <header
            className={`fixed top-0 left-0 right-0 z-50 py-3 md:py-4 header-animate ${headerScrolled ? 'header-scrolled' : ''}`}
          >
            <div className="flex items-center justify-center relative px-4 md:px-6">
              <Link href="/" className="flex items-center gap-3">
                <img src={logoUrl || '/images/logo-shine.png'} alt="SOS Shine" className="h-14 sm:h-18 md:h-24 w-auto object-contain" />
              </Link>
              <div className="absolute right-4 md:right-6 flex items-center gap-2">
                <Link
                  href={g.header_login_href || '/login'}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  title={g.header_login_label || 'Connexion'}
                  aria-label={g.header_login_label || 'Connexion'}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    style={{ color: 'var(--gold)' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </Link>
                <ThemeToggle />
              </div>
            </div>
          </header>
        )}

      {/* ═══ HERO — Word by word reveal ═══ */}
      {vis('hero') && (
        <motion.section ref={heroRef} className="relative min-h-screen flex items-center pt-20 md:pt-24" style={{ opacity: heroOpacity, scale: heroScale }}>
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] rounded-full opacity-[0.03] blur-[60px] md:blur-[80px]" style={{ background: gold }} />
          </div>

          <div className="relative z-10 px-5 md:px-20 py-12 md:py-24 max-w-6xl mx-auto w-full text-center">
            {/* Surtitle / Micro-copy */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="mb-8"
            >
              <span className="inline-block px-4 py-1.5 rounded-full text-xs tracking-[0.25em] uppercase font-medium" style={{ background: `rgba(${goldRgb}, 0.08)`, color: gold, border: `1px solid rgba(${goldRgb}, 0.15)` }}>
                {hero.surtitle || 'Espace de soutien premium'}
              </span>
            </motion.div>

            <h1 className="font-display font-light leading-[1.08] mb-8" style={{ ...tStyle("hero"), perspective: "1000px" }}>
              {(hero.title || '').split("\n").map((line: string, i: number) => {
                const isHighlight = line.includes("chaos") || line.includes("Reprogrammez") || line.includes("expériences") || line.includes("schémas") || line.includes("potentiel") || line.includes("émotionnels");
                const lineWords = line.split(/\s+/);
                const baseDelay = i * 0.2 + 0.15;
                return (
                  <span key={i} className="block">
                    {i > 0 && <span className="block h-2" />}
                    {lineWords.map((word, wi) => (
                      <motion.span
                        key={wi}
                        className={`inline-block mr-[0.3em] ${isHighlight ? 'text-shimmer' : ''}`}
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.5,
                          delay: baseDelay + wi * 0.06,
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
              <p className="text-base sm:text-xl md:text-2xl text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto font-light mb-8 md:mb-10" style={{
                fontFamily: fontMap[heroSty.text_font] || undefined,
                textAlign: (heroSty.text_align as "left" | "center" | "right") || undefined,
              }}>
                {hero.subtitle || ''}
              </p>
            </motion.div>

            {hero.video_url && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}>
                <div className="glass overflow-hidden mb-8 md:mb-10 max-w-3xl mx-auto relative group">
                  <video
                    src={hero.video_url}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full aspect-video cursor-pointer"
                    onClick={(e) => {
                      const v = e.currentTarget;
                      v.paused ? v.play() : v.pause();
                    }}
                  />
                  {/* Sound toggle — gold blink, transparent once clicked */}
                  <button
                    type="button"
                    aria-label="Toggle sound"
                    className="video-sound-btn video-sound-blink absolute bottom-3 right-14 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      const btn = e.currentTarget;
                      const video = btn.parentElement?.querySelector('video');
                      if (video) {
                        video.muted = !video.muted;
                        if (!video.muted) {
                          btn.classList.remove('video-sound-blink');
                          btn.style.background = 'rgba(0,0,0,0.3)';
                          btn.style.borderColor = 'rgba(255,255,255,0.15)';
                        } else {
                          btn.classList.add('video-sound-blink');
                          btn.style.background = '';
                          btn.style.borderColor = '';
                        }
                        const icon = btn.querySelector('svg');
                        if (icon) {
                          if (video.muted) {
                            icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-3.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-3.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />';
                          } else {
                            icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-3.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-3.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />';
                          }
                        }
                      }
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-3.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-3.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                    </svg>
                  </button>
                  {/* Fullscreen button */}
                  <button
                    type="button"
                    aria-label="Fullscreen"
                    className="absolute bottom-3 right-3 z-10 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all opacity-70 hover:opacity-100"
                    style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      const video = e.currentTarget.parentElement?.querySelector('video');
                      if (video) {
                        if (video.requestFullscreen) {
                          video.requestFullscreen();
                        } else if ((video as unknown as { webkitEnterFullscreen?: () => void }).webkitEnterFullscreen) {
                          (video as unknown as { webkitEnterFullscreen: () => void }).webkitEnterFullscreen();
                        }
                      }
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            )}

            {!hero.video_url && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}>
                <div className="glass overflow-hidden mb-8 md:mb-10 max-w-3xl mx-auto">
                  <div className="relative aspect-video flex items-center justify-center cursor-pointer group">
                    <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom right, rgba(${goldRgb},0.08), transparent)` }} />
                    <div className="relative z-10 text-center">
                      <motion.div
                        className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4"
                        style={{ background: `rgba(${goldRgb},0.15)`, border: `2px solid rgba(${goldRgb},0.3)` }}
                        whileHover={{ scale: 1.15 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <svg className="w-8 h-8 ml-1" fill="none" viewBox="0 0 24 24" stroke={gold} strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                        </svg>
                      </motion.div>
                      <p className="text-sm text-[var(--text-secondary)]">{hero.video_label || 'Découvrir SOS Shine en 2 minutes'}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-5 justify-center items-center">
                {/* Primary CTA — Signature Émotionnelle */}
                <Link href={hero.cta_primary_href || '/signature-emotionnelle'} className="w-full sm:w-auto">
                  <button className="magnetic-btn pulse-ring w-full sm:w-auto px-6 sm:px-10 py-3.5 sm:py-4.5 rounded-full text-sm sm:text-base font-semibold tracking-wide" style={{ background: `linear-gradient(135deg, ${gold}, ${goldDeep})`, color: '#050505' }}>
                    {hero.cta_primary_label || 'Découvrir ma Signature Émotionnelle'}
                  </button>
                </Link>
                {/* Secondary CTA */}
                <Link href={hero.cta_secondary_href || '/encyclopedie'} className="w-full sm:w-auto">
                  <button className="magnetic-btn w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-full text-sm sm:text-base font-medium tracking-wide" style={{ border: `1px solid rgba(${goldRgb},0.3)`, color: gold, background: `rgba(${goldRgb},0.04)` }}>
                    {hero.cta_secondary_label || 'Découvrir les protocoles'}
                  </button>
                </Link>
              </div>

              {/* CTA Subtext */}
              {hero.cta_primary_subtext && (
                <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-3 text-center font-light">
                  {hero.cta_primary_subtext}
                </p>
              )}

            </motion.div>
          </div>

        </motion.section>
      )}

      {/* ═══ SOCIAL PROOF STATS ═══ */}
      {vis('stats') && (() => {
        const statsData = sec('stats');
        const statsItems = statsData.items || [];
        return (
          <section className="relative py-16 md:py-24" style={{ background: 'linear-gradient(180deg, rgba(15,12,8,0.95) 0%, rgba(20,16,10,0.98) 100%)' }}>
            <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at center, rgba(${goldRgb}, 0.04) 0%, transparent 70%)` }} />
            <div className="max-w-5xl mx-auto px-5 md:px-20 relative z-10">
              <div className={`grid gap-8 md:gap-12`} style={{ gridTemplateColumns: `repeat(${statsItems.length || 3}, minmax(0, 1fr))` }}>
                {statsItems.map((stat: { value: string; label: string }, i: number) => (
                  <RevealOnScroll key={stat.label || i} delay={i * 0.15}>
                    <div className="text-center">
                      <p className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display italic font-light mb-3 md:mb-4" style={{ color: gold }}>
                        <AnimatedCounter value={stat.value} />
                      </p>
                      <p className="text-[10px] sm:text-xs md:text-sm tracking-[0.15em] sm:tracking-[0.2em] uppercase font-medium" style={{ color: 'var(--text-muted)' }}>
                        {stat.label}
                      </p>
                    </div>
                  </RevealOnScroll>
                ))}
              </div>
            </div>
          </section>
        );
      })()}

      {/* ═══ TICKER BAND ═══ */}
      <InfiniteTickerBand items={tickerItems} speed={ticker1Speed} />

      {/* ═══ SIGNATURE EMOTIONNELLE CTA ═══ */}
      {vis('signature_cta') && (() => {
        const sigCta = sec('signature_cta');
        return (
          <section className="px-5 md:px-20 py-12 md:py-20 relative cv-auto">
            <RevealOnScroll>
              <div className="max-w-3xl mx-auto text-center">
                <Link href={sigCta.button_href || '/signature-emotionnelle'}>
                  <div className="glow-card p-6 sm:p-8 md:p-12 cursor-pointer group">
                    <p className="luxury-title text-[10px] sm:text-xs tracking-[0.3em] sm:tracking-[0.4em] text-[var(--text-muted)] mb-3 md:mb-4">{sigCta.label || 'Test exclusif'}</p>
                    <h3 className="font-display text-xl sm:text-2xl md:text-4xl font-light mb-3 md:mb-4" style={{ color: gold }}>
                      {sigCta.title || 'Découvrez votre'}{' '}
                      <span className="text-shimmer">{sigCta.title_highlight || 'Signature Émotionnelle'}</span>
                    </h3>
                    <p className="text-[var(--text-secondary)] font-light mb-5 md:mb-6 text-sm md:text-[15px]">
                      {sigCta.description || '15 questions pour révéler votre architecture émotionnelle profonde. Un diagnostic premium et hyper-personnalisé.'}
                    </p>
                    <span className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-semibold tracking-wide group-hover:scale-105 transition-transform" style={{ background: `linear-gradient(135deg, ${gold}, ${goldDeep})`, color: '#050505' }}>
                      {sigCta.button_label || 'Faire le test gratuit'}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              </div>
            </RevealOnScroll>
          </section>
        );
      })()}

      {/* ═══ PROBLÈME & AGITATION (PAS Framework) ═══ */}
      {vis('probleme') && (() => {
        const prob = sec('probleme');
        const symptoms = prob.symptoms || [];
        return (
          <section className="relative py-16 md:py-32 cv-auto" style={{ background: 'linear-gradient(180deg, rgba(250,250,249,0.02) 0%, rgba(250,250,249,0.04) 50%, transparent 100%)' }}>
            <div className="max-w-4xl mx-auto px-5 md:px-20 relative z-10">
              <RevealOnScroll>
                <p className="luxury-title text-center text-xs sm:text-sm tracking-[0.3em] sm:tracking-[0.4em] text-[var(--text-muted)] mb-3 md:mb-4">{prob.label || 'Le vrai problème'}</p>
              </RevealOnScroll>

              <RevealOnScroll delay={0.1}>
                <h2 className="font-display font-light leading-[1.15] text-center mb-6 md:mb-10" style={tStyle("probleme")}>
                  {(prob.title || '').split("\n").map((line: string, i: number) => (
                    <span key={i} className="block">
                      {i > 0 && <span className="block h-1" />}
                      {line.includes("seul(e)") || line.includes("3h du matin") ? (
                        <span className="text-shimmer">{line}</span>
                      ) : line}
                    </span>
                  ))}
                </h2>
              </RevealOnScroll>

              <RevealOnScroll delay={0.2}>
                <p className="text-base md:text-xl text-[var(--text-secondary)] leading-relaxed font-light max-w-2xl mx-auto text-center mb-6 md:mb-8">
                  {prob.description || ''}
                </p>
              </RevealOnScroll>

              {prob.closing && (
                <RevealOnScroll delay={0.25}>
                  <p className="text-base md:text-lg font-light text-center max-w-2xl mx-auto mb-10 md:mb-14" style={{ color: gold }}>
                    {prob.closing}
                  </p>
                </RevealOnScroll>
              )}

              {/* Symptom Grid */}
              {symptoms.length > 0 && (
                <RevealOnScroll delay={0.3}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 max-w-2xl mx-auto mb-8 md:mb-12">
                    {symptoms.map((symptom: { icon: string; label: string }, i: number) => (
                      <motion.div
                        key={symptom.label}
                        className="glow-card px-4 py-3 text-center"
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + i * 0.08 }}
                      >
                        <span className="text-xs sm:text-sm font-light" style={{ color: 'var(--text-secondary)' }}>
                          {symptom.label}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </RevealOnScroll>
              )}

              {/* CTA Link */}
              {prob.cta_text && (
                <RevealOnScroll delay={0.35}>
                  <div className="text-center">
                    <Link href={prob.cta_href || '/encyclopedie'} className="inline-flex items-center gap-2 text-sm font-medium transition-colors duration-300 hover:opacity-80" style={{ color: gold }}>
                      {prob.cta_text}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </Link>
                  </div>
                </RevealOnScroll>
              )}
            </div>
          </section>
        );
      })()}

      {/* ═══ LE PRINCIPE ═══ */}
      {vis('principe') && (
        <section className="px-5 md:px-20 py-16 md:py-32 relative cv-auto">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/4 w-[250px] h-[250px] md:w-[400px] md:h-[400px] rounded-full opacity-[0.02] blur-[40px] md:blur-[60px]" style={{ background: gold }} />
          </div>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <RevealOnScroll>
              <p className="luxury-title text-xs sm:text-sm tracking-[0.3em] sm:tracking-[0.4em] text-[var(--text-muted)] mb-6 md:mb-10">{principe.label || ''}</p>
            </RevealOnScroll>

            {principe.image_url && (
              <RevealOnScroll delay={0.1} direction="scale">
                <img src={principe.image_url} alt="" className="w-full rounded-xl md:rounded-2xl object-contain max-h-64 md:max-h-96 mb-6 md:mb-10" style={{ border: '1px solid var(--dark-border)' }} />
              </RevealOnScroll>
            )}

            <RevealOnScroll delay={0.15}>
              <h2 className="font-display font-light leading-[1.15] mb-6 md:mb-10" style={tStyle("principe")}>
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
              <p className="text-base md:text-xl text-[var(--text-secondary)] leading-relaxed font-light max-w-2xl mx-auto">
                {principe.description || ''}
              </p>
            </RevealOnScroll>

            <RevealOnScroll delay={0.35}>
              <div className="mt-6 md:mt-10 flex items-center justify-center gap-4">
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
        <section className="px-5 md:px-20 py-16 md:py-32 relative cv-auto">
          <div className="max-w-6xl mx-auto">
            <RevealOnScroll>
              <p className="luxury-title text-center text-xs sm:text-sm tracking-[0.3em] sm:tracking-[0.4em] text-[var(--text-muted)] mb-3 md:mb-4">{stepsData.label || ''}</p>
            </RevealOnScroll>
            <RevealOnScroll delay={0.1}>
              <h2 className="font-display font-light text-center mb-10 md:mb-20" style={tStyle("steps")}>
                <WordByWordReveal text={stepsData.title || ''} />
              </h2>
            </RevealOnScroll>

            <div className="grid md:grid-cols-3 gap-4 md:gap-8">
              {(stepsData.items || []).map((step: { num: string; title: string; subtitle?: string; description: string; color: string }, i: number) => (
                <RevealOnScroll key={step.num} delay={i * 0.15} direction={i === 0 ? "left" : i === 2 ? "right" : "up"}>
                  <GlowingCard className="p-6 md:p-10 h-full" glowColor={`${step.color}25`}>
                    <div className="mb-4 md:mb-6">
                      <span className="step-number-large font-display text-5xl md:text-6xl font-extralight block mb-2" style={{ color: step.color, opacity: 0.15 }}>{step.num}</span>
                      <span className="step-number-label luxury-title text-xs tracking-[0.3em] block mb-2 md:mb-3" style={{ color: step.color, opacity: 0.6 }}>{stepsData.step_label || 'Étape'} {step.num}</span>
                      <h3 className="font-display text-xl md:text-2xl font-medium">{step.title}</h3>
                      {step.subtitle && (
                        <p className="text-xs sm:text-sm mt-1 font-light italic" style={{ color: step.color, opacity: 0.7 }}>{step.subtitle}</p>
                      )}
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
        <section className="px-5 md:px-20 py-16 md:py-32 relative cv-auto">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[250px] h-[250px] md:w-[400px] md:h-[400px] rounded-full opacity-[0.02] blur-[40px] md:blur-[60px]" style={{ background: gold }} />
          </div>

          <div className="max-w-5xl mx-auto relative z-10">
            <RevealOnScroll>
              <p className="luxury-title text-center text-xs sm:text-sm tracking-[0.3em] sm:tracking-[0.4em] text-[var(--text-muted)] mb-3 md:mb-4">{encyclo.label || "L'encyclopedie"}</p>
            </RevealOnScroll>
            <RevealOnScroll delay={0.1}>
              <h2 className="font-display font-light text-center mb-4 md:mb-6" style={tStyle("encyclopedie")}>
                <WordByWordReveal text={encyclo.title || ''} />
              </h2>
            </RevealOnScroll>
            <RevealOnScroll delay={0.2}>
              <p className="text-base md:text-lg text-[var(--text-secondary)] font-light leading-relaxed mb-10 md:mb-16 max-w-2xl mx-auto text-center">
                {encyclo.description || ''}
              </p>
            </RevealOnScroll>

            <RevealOnScroll delay={0.25}>
              <div className="max-w-md mx-auto mb-8 md:mb-12">
                <input
                  type="text"
                  value={encyclopediaSearch}
                  onChange={(e) => setEncyclopediaSearch(e.target.value)}
                  placeholder={encyclo.search_placeholder || 'Rechercher un challenge (ex: burn-out)...'}
                  className="w-full px-4 md:px-5 py-2.5 md:py-3 rounded-full text-sm font-light"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid rgba(${goldRgb}, 0.25)`,
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                />
              </div>
            </RevealOnScroll>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4">
              {(encyclo.items || []).filter((d: string) => !encyclopediaSearch || d.toLowerCase().includes(encyclopediaSearch.toLowerCase())).map((d: string, i: number) => (
                <RevealOnScroll key={d} delay={i * 0.05} direction="scale">
                  <Link href={`/encyclopedie/${slugify(d)}`}>
                    <GlowingCard className="px-3 sm:px-5 py-3 sm:py-4 text-center cursor-pointer group">
                      <span className="encyclo-item text-xs sm:text-sm font-light transition-colors duration-300 group-hover:text-[var(--gold)]" style={{
                        color: i === (encyclo.items || []).length - 1 ? gold : 'var(--text-secondary)',
                      }}>
                        {d}
                      </span>
                    </GlowingCard>
                  </Link>
                </RevealOnScroll>
              ))}
            </div>

            <RevealOnScroll delay={0.3}>
              <div className="text-center mt-8 md:mt-12">
                <Link href="/encyclopedie">
                  <button className="magnetic-btn px-6 sm:px-8 py-3 sm:py-3.5 rounded-full text-sm font-medium tracking-wide" style={{ border: `1px solid rgba(${goldRgb},0.25)`, color: gold, background: `rgba(${goldRgb},0.04)` }}>
                    {encyclo.button_label || "Explorer l'encyclopédie"}
                  </button>
                </Link>
              </div>
            </RevealOnScroll>
          </div>
        </section>
      )}

      {/* ═══ L'ÉCOSYSTÈME / PRODUIT ═══ */}
      {vis('produit') && (() => {
        const prod = sec('produit');
        const features = prod.features || [];
        return (
          <section className="px-5 md:px-20 py-16 md:py-32 relative cv-auto">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/3 right-0 w-[250px] h-[250px] md:w-[500px] md:h-[500px] rounded-full opacity-[0.02] blur-[60px]" style={{ background: gold }} />
            </div>

            <div className="max-w-5xl mx-auto relative z-10">
              <RevealOnScroll>
                <p className="luxury-title text-center text-xs sm:text-sm tracking-[0.3em] sm:tracking-[0.4em] text-[var(--text-muted)] mb-3 md:mb-4">{prod.label || 'Votre sanctuaire privé'}</p>
              </RevealOnScroll>
              <RevealOnScroll delay={0.1}>
                <h2 className="font-display font-light text-center mb-10 md:mb-16" style={tStyle("produit")}>
                  {(prod.title || '').split("\n").map((line: string, i: number) => (
                    <span key={i} className="block">
                      {i > 0 && <span className="block h-1" />}
                      {line.includes("24/7") || line.includes("poche") ? (
                        <span className="text-shimmer">{line}</span>
                      ) : line}
                    </span>
                  ))}
                </h2>
              </RevealOnScroll>

              {/* Platform Mockup */}
              {prod.mockup_image && (
                <RevealOnScroll delay={0.15} direction="scale">
                  <div className="mb-10 md:mb-16 max-w-3xl mx-auto">
                    <div className="glass overflow-hidden rounded-xl md:rounded-2xl" style={{ border: `1px solid rgba(${goldRgb}, 0.1)` }}>
                      <img src={prod.mockup_image} alt="Plateforme SOS Shine" className="w-full object-cover" />
                    </div>
                  </div>
                </RevealOnScroll>
              )}

              {/* Feature Cards */}
              <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
                {features.map((feature: { icon: string; title: string; description: string }, i: number) => {
                  const featureIcons: Record<string, React.ReactElement> = {
                    encyclopedia: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.5"><path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" strokeLinecap="round" strokeLinejoin="round" /></svg>,
                    community: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.5"><path d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" strokeLinecap="round" strokeLinejoin="round" /></svg>,
                    events: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.5"><path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
                    media: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.5"><path d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-2.625 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5m14.25 0h1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
                  };
                  return (
                    <RevealOnScroll key={feature.title || i} delay={0.2 + i * 0.1} direction={i % 2 === 0 ? 'left' : 'right'}>
                      <GlowingCard className="p-5 sm:p-8 h-full">
                        <div className="flex items-start gap-4 sm:gap-5">
                          <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center" style={{ background: `rgba(${goldRgb}, 0.08)`, border: `1px solid rgba(${goldRgb}, 0.12)` }}>
                            {featureIcons[feature.icon] || featureIcons.encyclopedia}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-display text-lg sm:text-xl font-medium mb-2">{feature.title}</h3>
                            <p className="text-[var(--text-secondary)] leading-relaxed text-sm sm:text-[15px] font-light">{feature.description}</p>
                          </div>
                        </div>
                      </GlowingCard>
                    </RevealOnScroll>
                  );
                })}
              </div>

              {/* CTA */}
              {prod.cta_label && (
                <RevealOnScroll delay={0.5}>
                  <div className="text-center mt-8 md:mt-12">
                    <Link href={prod.cta_href || '/signup'}>
                      <button className="magnetic-btn px-6 sm:px-8 py-3 sm:py-3.5 rounded-full text-sm font-medium tracking-wide" style={{ border: `1px solid rgba(${goldRgb},0.25)`, color: gold, background: `rgba(${goldRgb},0.04)` }}>
                        {prod.cta_label}
                      </button>
                    </Link>
                  </div>
                </RevealOnScroll>
              )}
            </div>
          </section>
        );
      })()}

      {/* ═══ TICKER BAND 2 ═══ */}
      <InfiniteTickerBand items={ticker2Items} speed={ticker2Speed} />

      {/* ═══ COMMUNAUTE ═══ */}
      {vis('communaute') && (
        <section className="px-5 md:px-20 py-16 md:py-32 relative cv-auto">
          <div className="max-w-5xl mx-auto">
            <RevealOnScroll>
              <h2 className="font-display font-light leading-[1.1] text-center mb-4 md:mb-6" style={tStyle("communaute")}>
                <WordByWordReveal text={comm.title || ''} />
              </h2>
            </RevealOnScroll>
            <RevealOnScroll delay={0.15}>
              <p className="text-base md:text-xl text-[var(--text-secondary)] font-light leading-relaxed mb-10 md:mb-20 max-w-2xl mx-auto text-center">
                {comm.description || ''}
              </p>
            </RevealOnScroll>

            <div className="space-y-4 md:space-y-6">
              {(comm.blocks || []).filter((b: { title: string; description: string }) => b.title).map((item: { title: string; description: string }, i: number) => (
                <RevealOnScroll key={item.title} delay={i * 0.12} direction={i % 2 === 0 ? "left" : "right"}>
                  <GlowingCard className="p-5 sm:p-8 md:p-10">
                    <div className="flex items-start gap-4 sm:gap-6">
                      <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center" style={{ background: `rgba(${goldRgb}, 0.08)`, border: `1px solid rgba(${goldRgb}, 0.12)` }}>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          {i === 0 && <><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><circle cx="9" cy="10" r="1" fill={gold}/><circle cx="15" cy="10" r="1" fill={gold}/></>}
                          {i === 1 && <><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 8h8M8 12h6M8 16h4"/></>}
                          {i === 2 && <><path d="M17 21v-2a4 4 0 0 0-4-4H5" /><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>}
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-display text-lg sm:text-xl font-medium mb-2 sm:mb-3">{item.title}</h3>
                        <p className="text-[var(--text-secondary)] leading-relaxed text-sm sm:text-[15px] font-light">{item.description}</p>
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
        <section className="px-5 md:px-20 py-16 md:py-32 relative cv-auto">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute bottom-0 left-1/3 w-[250px] h-[250px] md:w-[400px] md:h-[400px] rounded-full opacity-[0.02] blur-[40px] md:blur-[60px]" style={{ background: gold }} />
          </div>

          <div className="max-w-5xl mx-auto relative z-10">
            <RevealOnScroll>
              <p className="luxury-title text-center text-xs sm:text-sm tracking-[0.3em] sm:tracking-[0.4em] text-[var(--text-muted)] mb-3 md:mb-4">
                {temos.label || 'Preuve sociale'}
              </p>
            </RevealOnScroll>
            {temos.title && (
              <RevealOnScroll delay={0.1}>
                <h2 className="font-display font-light text-center mb-4 md:mb-6" style={tStyle("temoignages")}>
                  {(temos.title || '').split("\n").map((line: string, i: number) => (
                    <span key={i} className="block">
                      {i > 0 && <span className="block h-1" />}
                      {line.includes("contrôle") || line.includes("tempête") ? (
                        <span className="text-shimmer">{line}</span>
                      ) : line}
                    </span>
                  ))}
                </h2>
              </RevealOnScroll>
            )}
            {temos.verified_badge && (
              <RevealOnScroll delay={0.15}>
                <p className="text-center text-xs sm:text-sm font-light mb-10 md:mb-16 flex items-center justify-center gap-2" style={{ color: 'var(--text-muted)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#55EFC4' }}>
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {temos.verified_badge}
                </p>
              </RevealOnScroll>
            )}

            <div className="grid md:grid-cols-2 gap-4 md:gap-8">
              {(temos.items || []).filter((t: { quote: string; name: string; city: string }) => t.quote).map((t: { quote: string; name: string; city: string }, i: number) => (
                <RevealOnScroll key={i} delay={i * 0.12} direction={i % 2 === 0 ? "left" : "right"}>
                  <GlowingCard className="p-5 sm:p-8 md:p-10 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex gap-1 mb-4 md:mb-6">
                        {[1,2,3,4,5].map(s => (
                          <span key={s} className="text-sm" style={{ color: gold }}>★</span>
                        ))}
                      </div>
                      <p className="font-display text-base sm:text-lg italic text-[var(--text-primary)] font-light leading-relaxed mb-6 md:mb-8">
                        &laquo; {t.quote} &raquo;
                      </p>
                    </div>
                    <div className="flex items-center gap-3 pt-3 md:pt-4" style={{ borderTop: `1px solid rgba(${goldRgb}, 0.08)` }}>
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-display text-sm" style={{ background: `linear-gradient(135deg, rgba(${goldRgb},0.15), rgba(${goldRgb},0.05))`, color: gold }}>
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

      {/* ═══ L'HISTOIRE / LE LIVRE ═══ */}
      {vis('histoire') && (() => {
        const hist = sec('histoire');
        return (
          <section className="px-5 md:px-20 py-16 md:py-32 relative cv-auto">
            <div className="max-w-5xl mx-auto">
              <RevealOnScroll>
                <p className="luxury-title text-center text-xs sm:text-sm tracking-[0.3em] sm:tracking-[0.4em] text-[var(--text-muted)] mb-3 md:mb-4">{hist.label || "L'Histoire"}</p>
              </RevealOnScroll>
              <RevealOnScroll delay={0.1}>
                <h2 className="font-display font-light text-center text-2xl sm:text-3xl md:text-5xl mb-4 md:mb-6" style={{ color: 'var(--gold)' }}>
                  <WordByWordReveal text={hist.title || ''} />
                </h2>
              </RevealOnScroll>
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 mt-8 md:mt-12">
                <RevealOnScroll delay={0.15}>
                  <div className="flex-shrink-0 group">
                    <a href={hist.book_url || '#'} target="_blank" rel="noopener noreferrer" className="block relative">
                      <div className="w-44 sm:w-56 md:w-64 rounded-lg overflow-hidden border border-[var(--gold)]/20 group-hover:border-[var(--gold)]/60 transition-all duration-500 shadow-lg group-hover:shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                        <img
                          src={hist.book_image || '/images/book-cover.jpeg'}
                          alt="SOS Shine — Briller Comme un Diamant"
                          className="w-full aspect-[3/4] object-contain"
                        />
                      </div>
                      <div className="absolute -inset-2 rounded-xl bg-[var(--gold)]/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                    </a>
                  </div>
                </RevealOnScroll>
                <RevealOnScroll delay={0.25}>
                  <div className="flex-1 text-center md:text-left">
                    <p className="text-base md:text-xl text-[var(--text-body)] leading-relaxed mb-4 md:mb-6">
                      {hist.paragraph1 || ''}
                    </p>
                    <p className="text-base md:text-xl text-[var(--text-body)] leading-relaxed mb-4 md:mb-6">
                      {hist.paragraph2 || ''}
                    </p>
                    {hist.quote && (
                      <p className="text-sm md:text-base text-[var(--text-muted)] leading-relaxed mb-6 md:mb-8 italic">
                        &ldquo;{hist.quote}&rdquo;
                      </p>
                    )}
                    <a
                      href={hist.book_url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 border border-[var(--gold)]/40 rounded-full text-[var(--gold)] text-xs sm:text-sm tracking-[0.15em] uppercase hover:bg-[var(--gold)]/10 hover:border-[var(--gold)] transition-all duration-300"
                    >
                      {hist.button_label || 'Découvrir le livre'}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    </a>
                  </div>
                </RevealOnScroll>
              </div>
            </div>
          </section>
        );
      })()}

      {/* ═══ FONDATEURS ═══ */}
      {vis('fondateurs') && (() => {
        const fond = sec('fondateurs');
        const members = fond.members || [];
        return (
          <section className="px-5 md:px-20 py-16 md:py-32 relative cv-auto">
            <div className="max-w-5xl mx-auto">
              <RevealOnScroll>
                <p className="luxury-title text-center text-xs sm:text-sm tracking-[0.3em] sm:tracking-[0.4em] text-[var(--text-muted)] mb-3 md:mb-4">{fond.label || 'Les Fondateurs'}</p>
              </RevealOnScroll>
              <RevealOnScroll delay={0.1}>
                <h2 className="font-display font-light text-center text-2xl sm:text-3xl md:text-5xl mb-4 md:mb-6" style={{ color: 'var(--gold)' }}>
                  <WordByWordReveal text={fond.title || ''} />
                </h2>
              </RevealOnScroll>
              {fond.description && (
                <RevealOnScroll delay={0.15}>
                  <p className="text-center text-[var(--text-muted)] max-w-2xl mx-auto mb-10 md:mb-16 text-base md:text-lg leading-relaxed">
                    {fond.description}
                  </p>
                </RevealOnScroll>
              )}
              <div className="flex flex-wrap justify-center gap-6 md:gap-10">
                {members.map((founder: { name: string; image: string; role: string; expertise?: string }, i: number) => (
                  <RevealOnScroll key={founder.name || i} delay={0.2 + i * 0.15}>
                    <div className="flex flex-col items-center group">
                      <div className="relative mb-4 md:mb-6">
                        <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-52 md:h-52 rounded-full overflow-hidden border-2 border-[var(--gold)]/30 group-hover:border-[var(--gold)] transition-all duration-500 relative">
                          {founder.image && (
                            <img
                              src={founder.image}
                              alt={founder.name}
                              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                            />
                          )}
                        </div>
                        <div className="absolute -inset-1 rounded-full bg-[var(--gold)]/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                      </div>
                      <h3 className="font-display text-lg sm:text-xl md:text-2xl text-[var(--gold)] mb-1 text-center">{founder.name}</h3>
                      <p className="text-[10px] sm:text-xs md:text-sm tracking-[0.15em] sm:tracking-[0.2em] uppercase text-[var(--text-muted)] text-center">{founder.role}</p>
                      {founder.expertise && (
                        <p className="text-xs sm:text-sm font-light text-[var(--text-secondary)] text-center mt-1">{founder.expertise}</p>
                      )}
                    </div>
                  </RevealOnScroll>
                ))}
              </div>
            </div>
          </section>
        );
      })()}

      {/* ═══ MANIFESTE ═══ */}
      {vis('manifeste') && (() => {
        const manif = sec('manifeste');
        const paragraphs: string[] = manif.paragraphs || [];
        if (!manif.title && paragraphs.length === 0) return null;
        return (
          <section className="px-5 md:px-20 py-20 md:py-40 relative cv-auto overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full" style={{ background: `radial-gradient(ellipse 50% 50% at 50% 50%, rgba(${goldRgb}, 0.04), transparent)` }} />
            </div>
            <div className="max-w-3xl mx-auto relative z-10 text-center">
              <RevealOnScroll>
                <div className="mb-8 md:mb-12">
                  <span className="block w-16 h-px mx-auto mb-6" style={{ background: gold }} />
                  <h2 className="font-display font-light italic text-2xl sm:text-3xl md:text-5xl leading-[1.2]" style={{ color: gold }}>
                    <WordByWordReveal text={manif.title || ''} />
                  </h2>
                  <span className="block w-16 h-px mx-auto mt-6" style={{ background: gold }} />
                </div>
              </RevealOnScroll>

              <div className="space-y-6 md:space-y-8">
                {paragraphs.map((p: string, i: number) => (
                  <RevealOnScroll key={i} delay={0.15 + i * 0.1}>
                    <p className="text-base md:text-xl font-light leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {p}
                    </p>
                  </RevealOnScroll>
                ))}
              </div>

              {manif.signature && (
                <RevealOnScroll delay={0.5}>
                  <p className="mt-10 md:mt-14 font-display text-lg md:text-xl italic" style={{ color: gold }}>
                    — {manif.signature}
                  </p>
                </RevealOnScroll>
              )}
            </div>
          </section>
        );
      })()}

      {/* ═══ OFFRES / PRICING ═══ */}
      {vis('pricing') && (
        <section className="px-5 md:px-20 py-16 md:py-32 relative cv-auto">
          <div className="max-w-5xl mx-auto">
            <RevealOnScroll>
              <p className="luxury-title text-center text-xs sm:text-sm tracking-[0.3em] sm:tracking-[0.4em] text-[var(--text-muted)] mb-3 md:mb-4">{pricing.label || 'Tarification'}</p>
            </RevealOnScroll>
            <RevealOnScroll delay={0.1}>
              <h2 className="font-display font-light text-center mb-3 md:mb-4" style={tStyle("pricing")}>
                <WordByWordReveal text={pricing.title || ''} />
              </h2>
            </RevealOnScroll>
            <RevealOnScroll delay={0.2}>
              <p className="text-[var(--text-secondary)] font-light text-center text-sm md:text-base mb-10 md:mb-20">{pricing.subtitle || ''}</p>
            </RevealOnScroll>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
              {(pricing.plans || []).map((plan: { name: string; tagline?: string; price: string; period: string; button_label: string; button_href: string; highlight: boolean; badge: string; features: string[] }, idx: number) => {
                const tierColors = [
                  { main: '#F0A68C', deep: '#D4825E', rgb: '240,166,140' },
                  { main: '#55EFC4', deep: '#00B894', rgb: '85,239,196' },
                  { main: '#A78BFA', deep: '#7C3AED', rgb: '167,139,250' },
                ] as const
                const tc = tierColors[idx] || tierColors[0]
                const btnTextColor = idx === 2 ? '#fff' : '#050505'

                return (
                <RevealOnScroll key={plan.name} delay={(idx + 1) * 0.15} direction={(["left", "up", "scale", "right"] as const)[idx % 4]}>
                  <div className="relative h-full">
                    {plan.badge && (
                      <motion.div
                        className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 px-4 sm:px-5 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold tracking-wider uppercase whitespace-nowrap"
                        style={{ background: `linear-gradient(135deg, ${tc.main}, ${tc.deep})`, color: btnTextColor }}
                        initial={{ y: -10, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 }}
                      >
                        {plan.badge}
                      </motion.div>
                    )}
                  <GlowingCard className={`p-6 sm:p-8 md:p-10 h-full flex flex-col relative ${plan.highlight ? 'ring-1' : ''}`} glowColor={`rgba(${tc.rgb},0.15)`} style={plan.highlight ? { '--tw-ring-color': `rgba(${tc.rgb},0.15)` } as React.CSSProperties : undefined}>
                    <p className="luxury-title text-xs sm:text-sm tracking-[0.2em] sm:tracking-[0.25em] mb-1" style={{ color: tc.main }}>{plan.name}</p>
                    {plan.tagline && (
                      <p className="text-xs font-light mb-4 md:mb-6" style={{ color: 'var(--text-muted)' }}>{plan.tagline}</p>
                    )}
                    {!plan.tagline && <div className="mb-4 md:mb-6" />}

                    <div className="flex items-baseline gap-1 mb-6 md:mb-8">
                      <span className="font-display text-4xl sm:text-5xl md:text-6xl font-extralight" style={{ color: tc.main }}>
                        <AnimatedCounter value={plan.price} suffix="€" />
                      </span>
                      <span className="text-[var(--text-muted)] text-xs sm:text-sm">{plan.period}</span>
                    </div>

                    <div className="space-y-3 md:space-y-4 flex-1 mb-6 md:mb-10">
                      {(plan.features || []).map((f: string, fi: number) => (
                        <motion.div
                          key={f}
                          className="flex items-start gap-2 sm:gap-3"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + fi * 0.05 }}
                        >
                          <span className="mt-0.5 text-xs sm:text-sm" style={{ color: tc.main }}>◆</span>
                          <span className="text-[var(--text-secondary)] text-sm sm:text-[15px] font-light">{f}</span>
                        </motion.div>
                      ))}
                    </div>

                    <Link href={plan.button_href || '/signup'}>
                      <button className={`magnetic-btn w-full py-3 sm:py-4 rounded-full text-sm sm:text-base font-semibold tracking-wide ${plan.highlight ? 'pulse-ring' : ''}`} style={{
                        background: `linear-gradient(135deg, ${tc.main}, ${tc.deep})`,
                        color: btnTextColor
                      }}>
                        {plan.button_label}
                      </button>
                    </Link>
                  </GlowingCard>
                  </div>
                </RevealOnScroll>
              )})}
            </div>

            <RevealOnScroll delay={0.4}>
              <p className="text-center text-xs text-[var(--text-muted)] mt-6 md:mt-8 font-light italic">{pricing.footer || ''}</p>
            </RevealOnScroll>

            {/* Trust Badges */}
            {pricing.trust_badges && Array.isArray(pricing.trust_badges) && pricing.trust_badges.length > 0 && (
              <RevealOnScroll delay={0.5}>
                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mt-6 md:mt-10">
                  {pricing.trust_badges.map((badge: string, i: number) => (
                    <span key={i} className="flex items-center gap-2 text-xs font-light" style={{ color: 'var(--text-muted)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: gold, opacity: 0.5 }}>
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                      {badge}
                    </span>
                  ))}
                </div>
              </RevealOnScroll>
            )}
          </div>
        </section>
      )}

      {/* ═══ GARANTIE ═══ */}
      {vis('garantie') && (() => {
        const gar = sec('garantie');
        if (!gar.title && !gar.description) return null;
        return (
          <section className="px-5 md:px-20 py-16 md:py-32 relative cv-auto">
            <div className="max-w-3xl mx-auto text-center">
              <RevealOnScroll direction="scale">
                <div className="glow-card p-8 sm:p-10 md:p-14">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8" style={{ background: `rgba(85, 239, 196, 0.08)`, border: `2px solid rgba(85, 239, 196, 0.2)` }}>
                    <svg className="w-10 h-10 md:w-12 md:h-12" fill="none" viewBox="0 0 24 24" stroke="#55EFC4" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                  </div>
                  <RevealOnScroll delay={0.1}>
                    <p className="luxury-title text-xs sm:text-sm tracking-[0.3em] sm:tracking-[0.4em] text-[var(--text-muted)] mb-3 md:mb-4">{gar.label || 'Notre engagement'}</p>
                  </RevealOnScroll>
                  <RevealOnScroll delay={0.15}>
                    <h2 className="font-display font-light text-2xl sm:text-3xl md:text-4xl mb-4 md:mb-6" style={{ color: 'var(--text-primary)' }}>
                      {gar.title || ''}
                    </h2>
                  </RevealOnScroll>
                  <RevealOnScroll delay={0.2}>
                    <p className="text-base md:text-lg text-[var(--text-secondary)] font-light leading-relaxed max-w-xl mx-auto">
                      {gar.description || ''}
                    </p>
                  </RevealOnScroll>
                </div>
              </RevealOnScroll>
            </div>
          </section>
        );
      })()}

      {/* ═══ FAQ ═══ */}
      {vis('faq') && (() => {
        const faq = sec('faq');
        const faqItems: { q: string; a: string }[] = faq.items || [];
        return (
          <section id="faq" className="px-5 md:px-20 py-16 md:py-32 relative cv-auto scroll-mt-24">
            <div className="max-w-3xl mx-auto">
              <RevealOnScroll>
                <p className="luxury-title text-center text-xs sm:text-sm tracking-[0.3em] sm:tracking-[0.4em] text-[var(--text-muted)] mb-3 md:mb-4">{faq.label || 'FAQ'}</p>
              </RevealOnScroll>
              <RevealOnScroll delay={0.1}>
                <h2 className="font-display font-light text-center mb-4 md:mb-6" style={{ fontSize: 'clamp(2.25rem, 5vw, 3rem)' }}>
                  <WordByWordReveal text={faq.title || 'Vos questions, nos réponses'} />
                </h2>
              </RevealOnScroll>
              {faq.subtitle && (
                <RevealOnScroll delay={0.15}>
                  <p className="text-center text-[var(--text-secondary)] font-light mb-10 md:mb-14 text-sm md:text-base max-w-lg mx-auto">
                    {faq.subtitle}
                  </p>
                </RevealOnScroll>
              )}

              <div>
                {faqItems.map((item, i) => (
                  <RevealOnScroll key={i} delay={Math.min(i * 0.05, 0.3)}>
                    <FAQItem
                      item={item}
                      isOpen={openFaq === i}
                      onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                    />
                  </RevealOnScroll>
                ))}
              </div>

              {(faq.cta_text || faq.cta_button_label) && (
                <RevealOnScroll delay={0.3}>
                  <div className="mt-8 md:mt-12 text-center">
                    {faq.cta_text && <p className="text-sm font-light mb-4" style={{ color: 'var(--text-muted)' }}>{faq.cta_text}</p>}
                    {faq.cta_button_label && (
                      <Link href={faq.cta_button_href || '/contact'}>
                        <button className="magnetic-btn px-6 sm:px-8 py-3 sm:py-3.5 rounded-full text-sm font-medium tracking-wide" style={{ border: `1px solid rgba(${goldRgb},0.25)`, color: gold, background: `rgba(${goldRgb},0.04)` }}>
                          {faq.cta_button_label}
                        </button>
                      </Link>
                    )}
                  </div>
                </RevealOnScroll>
              )}
            </div>
          </section>
        );
      })()}

      {/* ═══ CTA FINAL DARK ═══ */}
      {vis('cta_dark') && (
        <section className="px-5 md:px-20 py-20 md:py-40 relative overflow-hidden cv-auto">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] h-[250px] md:w-[500px] md:h-[400px] rounded-full opacity-[0.03] blur-[40px] md:blur-[60px]" style={{ background: gold }} />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            {ctaDark.image_url && (
              <RevealOnScroll direction="scale">
                <img src={ctaDark.image_url} alt="" className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-xl md:rounded-2xl object-cover mx-auto mb-6 md:mb-8" />
              </RevealOnScroll>
            )}
            <RevealOnScroll>
              <h2 className="font-display font-light leading-[1.12] mb-8 md:mb-12" style={tStyle("cta_dark")}>
                <WordByWordReveal text={ctaDark.title || ''} />
              </h2>
            </RevealOnScroll>
            <RevealOnScroll delay={0.3}>
              <Link href={ctaDark.button_href || '/signup'}>
                <button className="magnetic-btn pulse-ring px-8 sm:px-10 py-4 sm:py-5 rounded-full text-base sm:text-lg font-semibold tracking-wide" style={{ background: `linear-gradient(135deg, ${gold}, ${goldDeep})`, color: '#050505' }}>
                  {ctaDark.button_label || 'Rejoindre SOS Shine'}
                </button>
              </Link>
            </RevealOnScroll>
          </div>
        </section>
      )}

      {/* ═══ CUSTOM SECTIONS (all types) ═══ */}
      {Object.entries(sections).filter(([key, s]) => key.startsWith('custom_') && s.is_visible).map(([key, s]) => {
        const c = s.content
        const sType = c.section_type || (c.html_content ? 'html' : 'text')
        const titleStyle = s.styles?.title_font ? { fontFamily: s.styles.title_font } : {}

        // HTML type
        if (sType === 'html' && c.html_content) {
          return (
            <section key={key} className="relative cv-auto" style={{ background: c.bg_color || 'transparent', padding: c.padding || '4rem 1.5rem' }}>
              <RevealOnScroll>
                <div className="max-w-5xl mx-auto">
                  {c.title && (
                    <h2 className="font-display font-light text-center text-3xl md:text-5xl mb-8" style={{ color: 'var(--gold)', ...titleStyle }}>
                      <WordByWordReveal text={c.title} />
                    </h2>
                  )}
                  <div className="prose prose-invert prose-lg max-w-none" style={{ color: 'var(--text-secondary)' }} dangerouslySetInnerHTML={{ __html: c.html_content }} />
                </div>
              </RevealOnScroll>
            </section>
          )
        }

        // Text type
        if (sType === 'text') {
          return (
            <section key={key} className="relative cv-auto px-5 md:px-20 py-16 md:py-24">
              <RevealOnScroll>
                <div className="max-w-5xl mx-auto text-center">
                  {c.subtitle && <p className="text-xs tracking-[0.2em] uppercase mb-4" style={{ color: 'var(--gold)' }}>{c.subtitle}</p>}
                  {c.title && (
                    <h2 className="font-display font-light text-3xl md:text-5xl mb-6" style={{ color: 'var(--gold)', ...titleStyle }}>
                      <WordByWordReveal text={c.title} />
                    </h2>
                  )}
                  {c.image_url && <img src={c.image_url} alt="" className="w-full max-w-2xl mx-auto rounded-2xl mb-8 object-cover" />}
                  {c.video_url && (
                    <video src={c.video_url} controls className="w-full max-w-2xl mx-auto rounded-2xl mb-8" />
                  )}
                  {c.description && <p className="text-base md:text-lg leading-relaxed max-w-3xl mx-auto mb-8" style={{ color: 'var(--text-secondary)' }}>{c.description}</p>}
                  {c.button_label && (
                    <Link href={c.button_href || '/signup'}>
                      <button className="magnetic-btn px-8 py-4 rounded-full text-base font-semibold tracking-wide" style={{ background: `linear-gradient(135deg, var(--gold), var(--gold-deep))`, color: '#050505' }}>
                        {c.button_label}
                      </button>
                    </Link>
                  )}
                  {c.html_content && <div className="prose prose-invert prose-lg max-w-none mt-8" style={{ color: 'var(--text-secondary)' }} dangerouslySetInnerHTML={{ __html: c.html_content }} />}
                </div>
              </RevealOnScroll>
            </section>
          )
        }

        // Cards type
        if (sType === 'cards') {
          const cards = (c.cards || []) as { title?: string; description?: string; icon?: string; image_url?: string }[]
          return (
            <section key={key} className="relative cv-auto px-5 md:px-20 py-16 md:py-24">
              <RevealOnScroll>
                <div className="max-w-6xl mx-auto text-center">
                  {c.title && (
                    <h2 className="font-display font-light text-3xl md:text-5xl mb-4" style={{ color: 'var(--gold)', ...titleStyle }}>
                      <WordByWordReveal text={c.title} />
                    </h2>
                  )}
                  {c.description && <p className="text-base md:text-lg max-w-3xl mx-auto mb-12" style={{ color: 'var(--text-secondary)' }}>{c.description}</p>}
                  <div className={`grid gap-6 ${cards.length <= 2 ? 'md:grid-cols-2' : cards.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
                    {cards.map((card, i) => (
                      <RevealOnScroll key={i} delay={i * 0.1}>
                        <div className="rounded-2xl p-6 md:p-8 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)' }}>
                          {card.image_url && <img src={card.image_url} alt="" className="w-16 h-16 mx-auto mb-4 rounded-xl object-cover" />}
                          {card.icon && !card.image_url && <span className="text-3xl mb-4 block">{card.icon}</span>}
                          {card.title && <h3 className="font-display text-lg md:text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{card.title}</h3>}
                          {card.description && <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{card.description}</p>}
                        </div>
                      </RevealOnScroll>
                    ))}
                  </div>
                  {c.html_content && <div className="prose prose-invert prose-lg max-w-none mt-8" style={{ color: 'var(--text-secondary)' }} dangerouslySetInnerHTML={{ __html: c.html_content }} />}
                </div>
              </RevealOnScroll>
            </section>
          )
        }

        // CTA type
        if (sType === 'cta') {
          return (
            <section key={key} className="relative cv-auto px-5 md:px-20 py-16 md:py-24">
              <RevealOnScroll>
                <div className="max-w-3xl mx-auto text-center">
                  {c.image_url && <img src={c.image_url} alt="" className="w-32 h-32 mx-auto mb-8 rounded-2xl object-cover" />}
                  {c.title && (
                    <h2 className="font-display font-light text-3xl md:text-5xl mb-6" style={{ color: 'var(--gold)', ...titleStyle }}>
                      <WordByWordReveal text={c.title} />
                    </h2>
                  )}
                  {c.description && <p className="text-base md:text-lg leading-relaxed mb-10" style={{ color: 'var(--text-secondary)' }}>{c.description}</p>}
                  {c.button_label && (
                    <Link href={c.button_href || '/signup'}>
                      <button className="magnetic-btn pulse-ring px-10 py-5 rounded-full text-lg font-semibold tracking-wide" style={{ background: `linear-gradient(135deg, var(--gold), var(--gold-deep))`, color: '#050505' }}>
                        {c.button_label}
                      </button>
                    </Link>
                  )}
                  {c.html_content && <div className="prose prose-invert prose-lg max-w-none mt-8" style={{ color: 'var(--text-secondary)' }} dangerouslySetInnerHTML={{ __html: c.html_content }} />}
                </div>
              </RevealOnScroll>
            </section>
          )
        }

        // Gallery type
        if (sType === 'gallery') {
          const images = (c.images || []) as { url?: string; caption?: string }[]
          return (
            <section key={key} className="relative cv-auto px-5 md:px-20 py-16 md:py-24">
              <RevealOnScroll>
                <div className="max-w-6xl mx-auto text-center">
                  {c.title && (
                    <h2 className="font-display font-light text-3xl md:text-5xl mb-4" style={{ color: 'var(--gold)', ...titleStyle }}>
                      <WordByWordReveal text={c.title} />
                    </h2>
                  )}
                  {c.description && <p className="text-base md:text-lg max-w-3xl mx-auto mb-12" style={{ color: 'var(--text-secondary)' }}>{c.description}</p>}
                  <div className={`grid gap-4 ${images.length <= 2 ? 'md:grid-cols-2' : images.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
                    {images.map((img, i) => (
                      <RevealOnScroll key={i} delay={i * 0.08}>
                        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--dark-border)' }}>
                          {img.url && <img src={img.url} alt={img.caption || ''} className="w-full aspect-square object-cover" />}
                          {img.caption && <p className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{img.caption}</p>}
                        </div>
                      </RevealOnScroll>
                    ))}
                  </div>
                  {c.html_content && <div className="prose prose-invert prose-lg max-w-none mt-8" style={{ color: 'var(--text-secondary)' }} dangerouslySetInnerHTML={{ __html: c.html_content }} />}
                </div>
              </RevealOnScroll>
            </section>
          )
        }

        // Fallback: render any content with html_content or title+description
        return (
          <section key={key} className="relative cv-auto px-5 md:px-20 py-16 md:py-24" style={{ background: c.bg_color || 'transparent' }}>
            <RevealOnScroll>
              <div className="max-w-5xl mx-auto text-center">
                {c.title && (
                  <h2 className="font-display font-light text-3xl md:text-5xl mb-6" style={{ color: 'var(--gold)', ...titleStyle }}>
                    <WordByWordReveal text={c.title} />
                  </h2>
                )}
                {c.description && <p className="text-base md:text-lg leading-relaxed max-w-3xl mx-auto mb-8" style={{ color: 'var(--text-secondary)' }}>{c.description}</p>}
                {c.image_url && <img src={c.image_url} alt="" className="w-full max-w-2xl mx-auto rounded-2xl mb-8 object-cover" />}
                {c.html_content && <div className="prose prose-invert prose-lg max-w-none" style={{ color: 'var(--text-secondary)' }} dangerouslySetInnerHTML={{ __html: c.html_content }} />}
              </div>
            </RevealOnScroll>
          </section>
        )
      })}

      {/* ═══ FOOTER ═══ */}
      {vis('footer') && (
        <footer className="px-5 md:px-20 py-10 md:py-16 border-t border-[var(--dark-border)] relative" style={{ background: "rgba(0,0,0,0.3)" }}>
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col items-center gap-8 md:gap-10">
              <div className="flex items-center gap-3">
                <img src={logoUrl || '/images/logo-shine.png'} alt="SOS Shine" className="h-12 sm:h-14 md:h-16 w-auto object-contain" />
              </div>

              <div className="flex flex-wrap justify-center gap-x-5 sm:gap-x-8 gap-y-3">
                {(foot.links || []).map((link: { label: string; href: string }) => (
                  <Link key={link.label} href={link.href} className="text-[10px] sm:text-xs tracking-[0.1em] sm:tracking-[0.15em] uppercase text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors duration-300 gold-underline">
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Social Media Links */}
              <div className="flex items-center gap-4">
                {foot.social_youtube && (
                  <a
                    href={foot.social_youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                    style={{ background: `rgba(${goldRgb}, 0.08)`, border: `1px solid rgba(${goldRgb}, 0.15)` }}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill={gold}>
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                )}
                {foot.social_instagram && (
                  <a
                    href={foot.social_instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                    style={{ background: `rgba(${goldRgb}, 0.08)`, border: `1px solid rgba(${goldRgb}, 0.15)` }}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill={gold}>
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                    </svg>
                  </a>
                )}
                {foot.social_facebook && (
                  <a
                    href={foot.social_facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                    style={{ background: `rgba(${goldRgb}, 0.08)`, border: `1px solid rgba(${goldRgb}, 0.15)` }}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill={gold}>
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                )}
              </div>

              <p className="text-[10px] tracking-[0.15em] sm:tracking-[0.2em] uppercase text-[var(--text-muted)]">
                &copy; {foot.copyright_year || '2026'} {foot.name || 'SOS Shine'}
              </p>
            </div>
          </div>
        </footer>
      )}

    </main>
  );
}
