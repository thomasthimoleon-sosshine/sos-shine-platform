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
import type { LandingVariant } from "@/lib/landing-defaults";
import LogoSite from '@/components/LogoSite'

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
    <div className="overflow-hidden py-6 border-y border-[var(--border)]" style={{ background: "rgba(201, 169, 97, 0.02)" }}>
      <div className="ticker-track" style={{ animationDuration: `${speed}s` }}>
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-6 px-6 whitespace-nowrap">
            <span className="text-sm md:text-base tracking-[0.15em] uppercase font-light" style={{ color: "var(--text-secondary)" }}>
              {item}
            </span>
            <span className="block w-1.5 h-1.5 rotate-45" style={{ background: "var(--brand)", opacity: 0.4 }} />
          </span>
        ))}
      </div>
    </div>
  );
}

function GlowingCard({ children, className = "", glowColor = "rgba(201, 169, 97, 0.15)", style }: { children: ReactNode; className?: string; glowColor?: string; style?: React.CSSProperties }) {
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
      <div className="orb" style={{ width: 500, height: 500, top: "10%", left: "-10%", background: "rgba(201, 169, 97, 0.012)" }} />
      <div className="orb" style={{ width: 400, height: 400, top: "60%", right: "-15%", background: "rgba(201, 169, 97, 0.008)", animationDelay: "5s" }} />
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
      <circle cx="12" cy="12" r="4" fill="#C9A961" opacity="0.4" />
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
        <span className="text-sm sm:text-base font-medium pr-4 text-[var(--text-primary)]">{item.q}</span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-lg"
          style={{ color: 'var(--brand)', background: 'rgba(201, 169, 97, 0.08)' }}
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
        <p className="px-5 sm:px-6 pb-5 text-sm sm:text-[15px] font-light leading-relaxed text-[var(--text-secondary)]">
          {item.a}
        </p>
      </motion.div>
    </div>
  );
}

export type SectionMap = Record<string, { content: SectionContent; styles: SectionStyles; is_visible: boolean }>

interface LandingClientProps {
  initialSections?: SectionMap
  initialPositions?: Record<string, number>
  initialPrelaunchEnabled?: boolean
  initialPrelaunchSettings?: PrelaunchSettings
  variant?: LandingVariant
}

export default function LandingClient({ initialSections, initialPositions, initialPrelaunchEnabled, initialPrelaunchSettings, variant = 'julia' }: LandingClientProps) {
  const { t } = useTranslation();
  const [headerVisible, setHeaderVisible] = useState(true);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [encyclopediaSearch, setEncyclopediaSearch] = useState('');
  const lastScrollYRef = useRef(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.25], [1, 0.97]);

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
  const [sectionPositions, setSectionPositions] = useState<Record<string, number>>(initialPositions ?? {});

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

      const { data } = await supabase.from("landing_sections").select("*").eq("variant", variant).order("position");
      if (data && data.length > 0) {
        const rows = data as unknown as LandingSectionDefault[];
        const dbMap = buildSectionMap(rows);
        const merged: Record<string, { content: SectionContent; styles: SectionStyles; is_visible: boolean }> = {};
        const posMap: Record<string, number> = {};
        for (const d of LANDING_DEFAULTS) {
          const row = dbMap[d.section_key];
          merged[d.section_key] = row
            ? { content: sanitizeContent(row.content), styles: row.styles, is_visible: row.is_visible }
            : { content: d.content, styles: d.styles, is_visible: d.is_visible };
          if (row) posMap[row.section_key] = row.position;
        }
        for (const row of rows) {
          if (!merged[row.section_key]) {
            merged[row.section_key] = { content: sanitizeContent(row.content), styles: row.styles, is_visible: row.is_visible };
          }
          if (!(row.section_key in posMap)) posMap[row.section_key] = row.position;
        }
        setSections(merged);
        setSectionPositions(posMap);
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

  // ─── A/B Test Tracking ───
  useEffect(() => {
    if (!variant) return;

    // Set cookie so user always sees same variant
    document.cookie = `ab_variant=${variant};path=/;max-age=${60 * 60 * 24 * 30};SameSite=Lax`;

    // Track the visit
    const visitorId = (() => {
      let vid = localStorage.getItem('ab_visitor_id');
      if (!vid) {
        vid = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        localStorage.setItem('ab_visitor_id', vid);
      }
      return vid;
    })();

    fetch('/api/track/ab-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitor_id: visitorId,
        variant,
        referrer: document.referrer || null,
      }),
    }).catch(() => {});
  }, [variant]);

  /** Track A/B conversion when user clicks a signup/rejoindre CTA */
  function trackConversion(conversionType = 'signup') {
    const visitorId = typeof localStorage !== 'undefined' ? localStorage.getItem('ab_visitor_id') : null
    if (!visitorId) return
    fetch('/api/track/ab-convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitor_id: visitorId, conversion_type: conversionType }),
    }).catch(() => {})
  }

  function sec(key: string): SectionContent { return sections[key]?.content || {}; }
  function sty(key: string): SectionStyles { return sections[key]?.styles || {}; }
  function vis(key: string): boolean { return sections[key]?.is_visible !== false; }

  // Default section order (matches hardcoded JSX order as fallback)
  const DEFAULT_ORDER: Record<string, number> = {
    hero: 0, probleme: 1, histoire: 2, temoignages: 3, encyclopedie: 4,
    steps: 5, communaute: 6, produit: 7, manifeste: 8, pricing: 9,
    pour_qui: 10, cta_dark: 11,
    landing_v2: 0,
    // Hidden sections
    stats: 50, signature_cta: 51, principe: 52, fondateurs: 53, transformation: 54,
    garantie: 55, cta_light: 56, ticker_1: 57, ticker_2: 58, faq: 59, custom: 99,
  };
  const hasDynamicOrder = Object.keys(sectionPositions).length > 0;
  function ord(key: string): number { return sectionPositions[key] ?? DEFAULT_ORDER[key] ?? 999; }

  const g = sty('_global');
  const gold = g.color_primary || '#C9A961';
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
    : ['Accessible 24/7', 'Communauté bienveillante', 'Encyclopédie complète', 'Sessions collectives', 'Chat dédié', 'Événements live', 'Séances guidées', "Cahiers d'exercices"];
  const ticker2Speed = ticker2Data.speed || 40;

  // Show loading while checking prelaunch, then prelaunch page if enabled
  if (prelaunchEnabled === null) {
    return <div className="min-h-screen" style={{ background: 'var(--dark, #000000)' }} />;
  }
  if (prelaunchEnabled) {
    return <PreLaunchPage settings={prelaunchSettings} />;
  }

  return (
    <main className="grain relative z-0 overflow-hidden" style={cssVars}>
      {/* ── Atmospheric overlays ── */}
      <div className="fixed inset-0 pointer-events-none z-[1]"
        style={{ background: `radial-gradient(ellipse 900px 600px at 50% 0%, rgba(${goldRgb},0.05), transparent 55%)` }}
      />
      <ScrollProgress />
      <SparklingDiamonds />
      <FloatingOrbs />

      {/* ═══ FIXED HEADER - Le Club 10 style ═══ */}
      {headerVisible && (
          <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${headerScrolled ? 'py-3 bg-[#050505]/80 backdrop-blur-2xl border-b border-[rgba(201, 169, 97,0.06)]' : 'py-5 md:py-6'}`}
          >
            <div className="flex items-center justify-between max-w-7xl mx-auto px-5 md:px-10">
              <Link href="/" className="flex items-center gap-3">
                <LogoSite className={`transition-all duration-700 w-auto object-contain ${headerScrolled ? 'h-10 md:h-12' : 'h-12 md:h-16'}`} />
              </Link>
              <div className="flex items-center gap-4 sm:gap-6">
                <Link
                  href={g.header_login_href || '/login'}
                  className="text-[13px] tracking-[0.02em] text-[#9B9590] hover:text-[#F5F0E8] transition-colors duration-300"
                >
                  {g.header_login_label || 'Se connecter'}
                </Link>
                <Link
                  href={globalContent.header_cta_href || '/signup'}
                  onClick={() => trackConversion('signup')}
                  className="hidden sm:inline-flex items-center px-5 py-2.5 rounded-full text-[13px] font-medium tracking-[0.02em] text-[#050505] active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{ backgroundColor: gold, boxShadow: `0 0 30px rgba(${goldRgb},0.18)` }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 0 45px rgba(${goldRgb},0.28)`)}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = `0 0 30px rgba(${goldRgb},0.18)`)}
                >
                  {globalContent.header_cta_label || 'Commencer'}
                </Link>
                <ThemeToggle />
              </div>
            </div>
          </header>
        )}

      {/* Flex wrapper for dynamic section ordering - always active so CSS order works */}
      <div style={{ display: "flex", flexDirection: "column" }}>

      <div style={{ order: ord("hero") }}>
      {/* ═══ HERO - Word by word reveal ═══ */}
      {vis('hero') && (
        <motion.section ref={heroRef} className="relative min-h-[100vh] flex items-center pt-28 md:pt-32 pb-20" style={{ opacity: heroOpacity, scale: heroScale }}>
          {/* Ambient layers */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[500px] md:w-[900px] md:h-[700px] rounded-full opacity-20" style={{ background: 'radial-gradient(ellipse, rgba(15,22,36,0.8) 0%, transparent 70%)' }} />
            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[300px] h-[250px] md:w-[500px] md:h-[400px] rounded-full opacity-[0.03]" style={{ background: `radial-gradient(circle, ${gold} 0%, transparent 60%)` }} />
          </div>

          <div className="relative z-10 px-5 md:px-10 py-16 md:py-28 max-w-5xl mx-auto w-full text-center">
            {/* Surtitle - ultra-discret, Le Club 10 style */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="mb-10 md:mb-12"
            >
              <span className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase font-medium text-[#9B9590]">
                {hero.surtitle || 'Plateforme de déconditionnement émotionnel'}
              </span>
            </motion.div>

            <h1 className="font-display font-light text-[2.2rem] sm:text-[3rem] md:text-[3.8rem] lg:text-[4.5rem] leading-[1.06] tracking-[-0.02em] text-[#F5F0E8] mb-10 md:mb-14" style={{ perspective: "1000px" }}>
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
              <p className="text-[15px] sm:text-[17px] md:text-[19px] text-[#9B9590] leading-[1.7] max-w-xl mx-auto font-light mb-12 md:mb-16">
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
                    controlsList="nodownload noplaybackrate"
                    disablePictureInPicture
                    onContextMenu={(e) => e.preventDefault()}
                    className="w-full aspect-video cursor-pointer"
                    onClick={(e) => {
                      const v = e.currentTarget;
                      v.paused ? v.play() : v.pause();
                    }}
                  />
                  {/* Sound toggle - gold blink, transparent once clicked */}
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
                {/* Primary CTA */}
                <Link href={hero.cta_primary_href || '/signature-emotionnelle'} className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-8 sm:px-10 py-4 rounded-full text-[14px] font-medium tracking-[0.02em] text-[#050505] active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer"
                    style={{ backgroundColor: gold, boxShadow: `0 0 40px rgba(${goldRgb},0.2)` }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 0 60px rgba(${goldRgb},0.32)`)}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = `0 0 40px rgba(${goldRgb},0.2)`)}>

                    {hero.cta_primary_label || 'Découvrir ma Signature Émotionnelle'}
                  </button>
                </Link>
                {/* Secondary CTA */}
                <Link href={hero.cta_secondary_href || '/signature-emotionnelle'} className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-8 py-4 rounded-full text-[14px] font-light tracking-[0.02em] text-[#a1a1aa] hover:text-[#e0e0e0] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer"
                    style={{ border: `1px solid rgba(${goldRgb},0.15)` }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = `rgba(${goldRgb},0.3)`)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = `rgba(${goldRgb},0.15)`)}>

                    {hero.cta_secondary_label || 'Découvrir les protocoles'}
                  </button>
                </Link>
              </div>

              {/* CTA Subtext */}
              {hero.cta_primary_subtext && (
                <p className="text-[12px] text-[#6B6560] mt-5 text-center font-light tracking-wide">
                  {hero.cta_primary_subtext}
                </p>
              )}

            </motion.div>
          </div>

        </motion.section>
      )}
      </div>

      <div style={{ order: ord("stats") }}>
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
                      <p className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display italic font-light mb-3 md:mb-4 text-[var(--brand)]">
                        <AnimatedCounter value={stat.value} />
                      </p>
                      <p className="text-[10px] sm:text-xs md:text-sm tracking-[0.15em] sm:tracking-[0.2em] uppercase font-medium text-[var(--text-muted)]">
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

      </div>

      <div style={{ order: ord("ticker_1") }}>
      {/* ═══ TICKER BAND ═══ */}
      {vis('ticker_1') && <InfiniteTickerBand items={tickerItems} speed={ticker1Speed} />}
      </div>

      <div style={{ order: ord("signature_cta") }}>
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
                    <h3 className="font-display text-xl sm:text-2xl md:text-4xl font-light mb-3 md:mb-4 text-[var(--brand)]">
                      {sigCta.title || 'Découvrez votre'}{' '}
                      <span className="text-shimmer">{sigCta.title_highlight || 'Signature Émotionnelle'}</span>
                    </h3>
                    <p className="text-[var(--text-secondary)] font-light mb-5 md:mb-6 text-sm md:text-[15px]">
                      {sigCta.description || '15 questions pour révéler votre architecture émotionnelle profonde. Un diagnostic premium et hyper-personnalisé.'}
                    </p>
                    <span className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-semibold tracking-wide group-hover:scale-105 transition-transform" style={{ background: `linear-gradient(135deg, ${gold}, ${goldDeep})`, color: '#000000' }}>
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

      </div>

      <div style={{ order: ord("probleme") }}>
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
                  <p className="text-base md:text-lg font-light text-center max-w-2xl mx-auto mb-10 md:mb-14 text-[var(--brand)]">
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
                        <span className="text-xs sm:text-sm font-light text-[var(--text-secondary)]">
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
                    <Link href={prob.cta_href || '/signature-emotionnelle'} className="inline-flex items-center gap-2 text-sm font-medium transition-colors duration-300 hover:opacity-80 text-[var(--brand)]">
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
      </div>

      <div style={{ order: ord("principe") }}>
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
                <img src={principe.image_url} alt="" className="w-full rounded-xl md:rounded-2xl object-contain max-h-64 md:max-h-96 mb-6 md:mb-10" style={{ border: '1px solid var(--border)' }} />
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
      </div>

      <div style={{ order: ord("steps") }}>
      {/* ═══ LES ETAPES - Glowing Cards ═══ */}
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
      </div>

      <div style={{ order: ord("encyclopedie") }}>
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
                  <Link href="/signature-emotionnelle">
                    <GlowingCard className="px-3 sm:px-5 py-3 sm:py-4 text-center cursor-pointer group">
                      <span className="encyclo-item text-xs sm:text-sm font-light transition-colors duration-300 group-hover:text-[var(--brand)]" style={{
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
                <Link href="/signature-emotionnelle">
                  <button className="magnetic-btn px-6 sm:px-8 py-3 sm:py-3.5 rounded-full text-sm font-medium tracking-wide" style={{ border: `1px solid rgba(${goldRgb},0.25)`, color: gold, background: `rgba(${goldRgb},0.04)` }}>
                    {encyclo.button_label || "Découvrir mon protocole"}
                  </button>
                </Link>
              </div>
            </RevealOnScroll>
          </div>
        </section>
      )}
      </div>

      <div style={{ order: ord("produit") }}>
      {/* ═══ CE QUE VOUS RECEVEZ DÈS J1 ═══ */}
      {vis('produit') && (() => {
        const prod = sec('produit');
        const features = prod.features || [];
        const checklist: string[] = prod.checklist || [];
        return (
          <section className="px-5 md:px-20 py-16 md:py-32 relative cv-auto">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/3 right-0 w-[250px] h-[250px] md:w-[500px] md:h-[500px] rounded-full opacity-[0.02] blur-[60px]" style={{ background: gold }} />
            </div>

            <div className="max-w-5xl mx-auto relative z-10">
              <RevealOnScroll>
                <p className="luxury-title text-center text-xs sm:text-sm tracking-[0.3em] sm:tracking-[0.4em] text-[var(--text-muted)] mb-3 md:mb-4">{prod.label || ''}</p>
              </RevealOnScroll>
              <RevealOnScroll delay={0.1}>
                <h2 className="font-display font-light text-center mb-10 md:mb-16" style={tStyle("produit")}>
                  {(prod.title || '').split("\n").map((line: string, i: number) => (
                    <span key={i} className="block">
                      {i > 0 && <span className="block h-1" />}
                      {line.includes("Ce soir") || line.includes("24/7") || line.includes("poche") ? (
                        <span className="text-shimmer">{line}</span>
                      ) : line}
                    </span>
                  ))}
                </h2>
              </RevealOnScroll>

              {/* Checklist format */}
              {checklist.length > 0 && (
                <div className="max-w-3xl mx-auto">
                  <GlowingCard className="p-6 sm:p-8 md:p-10">
                    <div className="space-y-4 md:space-y-5">
                      {checklist.map((item: string, i: number) => (
                        <motion.div
                          key={i}
                          className="flex items-start gap-3 sm:gap-4"
                          initial={{ opacity: 0, x: -15 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.15 + i * 0.08 }}
                        >
                          <span className="mt-0.5 text-sm sm:text-base flex-shrink-0 text-[var(--brand)]">&#10022;</span>
                          <span className="text-[var(--text-secondary)] text-sm sm:text-base font-light leading-relaxed">{item}</span>
                        </motion.div>
                      ))}
                    </div>
                  </GlowingCard>
                </div>
              )}

              {/* Feature Cards (legacy format) */}
              {features.length > 0 && checklist.length === 0 && (
                <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
                  {features.map((feature: { icon: string; title: string; description: string }, i: number) => (
                    <RevealOnScroll key={feature.title || i} delay={0.2 + i * 0.1} direction={i % 2 === 0 ? 'left' : 'right'}>
                      <GlowingCard className="p-5 sm:p-8 h-full">
                        <div className="flex items-start gap-4 sm:gap-5">
                          <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center" style={{ background: `rgba(${goldRgb}, 0.08)`, border: `1px solid rgba(${goldRgb}, 0.12)` }}>
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.5"><path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-display text-lg sm:text-xl font-medium mb-2">{feature.title}</h3>
                            <p className="text-[var(--text-secondary)] leading-relaxed text-sm sm:text-[15px] font-light">{feature.description}</p>
                          </div>
                        </div>
                      </GlowingCard>
                    </RevealOnScroll>
                  ))}
                </div>
              )}

              {/* CTA */}
              {prod.cta_label && (
                <RevealOnScroll delay={0.5}>
                  <div className="text-center mt-8 md:mt-12">
                    <Link href={prod.cta_href || '/signup'} onClick={() => trackConversion('produit_cta')}>
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
      </div>

      <div style={{ order: ord("ticker_2") }}>
      {/* ═══ TICKER BAND 2 ═══ */}
      {vis('ticker_2') && <InfiniteTickerBand items={ticker2Items} speed={ticker2Speed} />}
      </div>

      <div style={{ order: ord("communaute") }}>
      {/* ═══ COMMUNAUTE ═══ */}
      {vis('communaute') && (() => {
        const commLabel = comm.label || 'VOTRE RÉSEAU DE SOUTIEN PRIVÉ';
        const communityIcons: Record<string, string> = { fire: '\uD83D\uDD25', sparkle: '\u2728', journal: '\uD83D\uDCDD', live: '\uD83C\uDFA5' };
        return (
        <section className="px-5 md:px-20 py-16 md:py-32 relative cv-auto">
          <div className="max-w-5xl mx-auto">
            <RevealOnScroll>
              <p className="luxury-title text-center text-xs sm:text-sm tracking-[0.3em] sm:tracking-[0.4em] text-[var(--text-muted)] mb-3 md:mb-4">{commLabel}</p>
            </RevealOnScroll>
            <RevealOnScroll>
              <h2 className="font-display font-light leading-[1.1] text-center mb-4 md:mb-6" style={tStyle("communaute")}>
                <WordByWordReveal text={comm.title || ''} />
              </h2>
            </RevealOnScroll>
            <RevealOnScroll delay={0.15}>
              <p className="text-base md:text-lg text-[var(--text-secondary)] font-light leading-relaxed mb-10 md:mb-20 max-w-2xl mx-auto text-center whitespace-pre-line">
                {comm.description || ''}
              </p>
            </RevealOnScroll>

            <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
              {(comm.blocks || []).filter((b: { title: string; description: string }) => b.title).map((item: { icon?: string; title: string; description: string }, i: number) => (
                <RevealOnScroll key={item.title} delay={i * 0.1} direction={i % 2 === 0 ? "left" : "right"}>
                  <GlowingCard className="p-5 sm:p-8 h-full">
                    <div className="flex items-start gap-4 sm:gap-5">
                      <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl" style={{ background: `rgba(${goldRgb}, 0.08)`, border: `1px solid rgba(${goldRgb}, 0.12)` }}>
                        {item.icon && communityIcons[item.icon] ? communityIcons[item.icon] : (
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            {i === 0 && <><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><circle cx="9" cy="10" r="1" fill={gold}/><circle cx="15" cy="10" r="1" fill={gold}/></>}
                            {i === 1 && <><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 8h8M8 12h6M8 16h4"/></>}
                            {i === 2 && <><path d="M17 21v-2a4 4 0 0 0-4-4H5" /><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>}
                            {i >= 3 && <><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></>}
                          </svg>
                        )}
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
        );
      })()}
      </div>

      <div style={{ order: ord("temoignages") }}>
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
                <p className="text-center text-xs sm:text-sm font-light mb-10 md:mb-16 flex items-center justify-center gap-2 text-[var(--text-muted)]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#55EFC4' }}>
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {temos.verified_badge}
                </p>
              </RevealOnScroll>
            )}

            <div className="grid md:grid-cols-2 gap-4 md:gap-8">
              {(temos.items || []).filter((t: { quote: string; name: string; city: string }) => t.quote).map((t: { quote: string; name: string; city: string; avatar_url?: string; video_url?: string; verified?: boolean; transformation?: string }, i: number) => (
                <RevealOnScroll key={i} delay={i * 0.12} direction={i % 2 === 0 ? "left" : "right"}>
                  <GlowingCard className="overflow-hidden h-full flex flex-col justify-between">
                    {/* Video preview (optional) */}
                    {t.video_url && (
                      <div className="aspect-video overflow-hidden" style={{ background: 'rgba(0,0,0,0.3)' }}>
                        <video
                          src={t.video_url}
                          controls
                          controlsList="nodownload"
                          onContextMenu={(e) => e.preventDefault()}
                          preload="metadata"
                          poster={t.avatar_url || undefined}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-5 sm:p-8 md:p-10 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-4 md:mb-6">
                          <div className="flex gap-1">
                            {[1,2,3,4,5].map(s => (
                              <span key={s} className="text-sm text-[var(--brand)]">★</span>
                            ))}
                          </div>
                          {t.verified && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                              style={{ background: 'rgba(85,239,196,0.1)', color: '#55EFC4', border: '1px solid rgba(85,239,196,0.25)' }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <path d="M9 12l2 2 4-4" />
                              </svg>
                              Vérifié
                            </span>
                          )}
                        </div>
                        <p className="font-display text-base sm:text-lg italic text-[var(--text-primary)] font-light leading-relaxed mb-6 md:mb-8">
                          &laquo; {t.quote} &raquo;
                        </p>
                        {t.transformation && (
                          <p className="text-xs italic mb-4" style={{ color: '#55EFC4' }}>
                            ✦ {t.transformation}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 pt-3 md:pt-4" style={{ borderTop: `1px solid rgba(${goldRgb}, 0.08)` }}>
                        {t.avatar_url ? (
                          <img
                            src={t.avatar_url}
                            alt={t.name}
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                            style={{ border: `1px solid rgba(${goldRgb}, 0.25)` }}
                          />
                        ) : (
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-display text-sm flex-shrink-0" style={{ background: `linear-gradient(135deg, rgba(${goldRgb},0.15), rgba(${goldRgb},0.05))`, color: gold }}>
                            {t.name.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate text-[var(--brand)]">{t.name}</p>
                          <p className="text-xs truncate text-[var(--text-muted)]">{t.city}</p>
                        </div>
                      </div>
                    </div>
                  </GlowingCard>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>
      )}
      </div>

      <div style={{ order: ord("histoire") }}>
      {/* ═══ JULIA ET LE LIVRE ═══ */}
      {vis('histoire') && (() => {
        const hist = sec('histoire');
        return (
          <section className="px-5 md:px-20 py-16 md:py-32 relative cv-auto">
            <div className="max-w-4xl mx-auto">
              <RevealOnScroll>
                <p className="luxury-title text-center text-xs sm:text-sm tracking-[0.3em] sm:tracking-[0.4em] text-[var(--text-muted)] mb-3 md:mb-4">{hist.label || "L'origine"}</p>
              </RevealOnScroll>
              <RevealOnScroll delay={0.1}>
                <h2 className="font-display font-light text-center text-2xl sm:text-3xl md:text-5xl mb-8 md:mb-12" style={{ color: 'var(--brand)' }}>
                  <WordByWordReveal text={hist.title || ''} />
                </h2>
              </RevealOnScroll>

              {/* Julia's bio paragraphs */}
              <div className="max-w-3xl mx-auto space-y-6 md:space-y-8 mb-8 md:mb-12">
                {hist.paragraph1 && (
                  <RevealOnScroll delay={0.15}>
                    <p className="text-base md:text-lg text-[var(--text-secondary)] leading-relaxed font-light">
                      {hist.paragraph1}
                    </p>
                  </RevealOnScroll>
                )}
                {hist.paragraph2 && (
                  <RevealOnScroll delay={0.2}>
                    <p className="text-base md:text-lg text-[var(--text-secondary)] leading-relaxed font-light">
                      {hist.paragraph2}
                    </p>
                  </RevealOnScroll>
                )}
                {hist.paragraph3 && (
                  <RevealOnScroll delay={0.25}>
                    <p className="text-base md:text-lg text-[var(--text-secondary)] leading-relaxed font-light">
                      {hist.paragraph3}
                    </p>
                  </RevealOnScroll>
                )}
                {hist.paragraph4 && (
                  <RevealOnScroll delay={0.3}>
                    <p className="text-base md:text-lg font-light italic text-[var(--brand)]">
                      {hist.paragraph4}
                    </p>
                  </RevealOnScroll>
                )}
              </div>

              {/* Julia signature */}
              {hist.signature && (
                <RevealOnScroll delay={0.35}>
                  <div className="text-center mb-10 md:mb-16">
                    <p className="font-display text-lg md:text-xl italic text-[var(--brand)]">
                      - {hist.signature}
                    </p>
                    {hist.signature_subtitle && (
                      <p className="text-xs sm:text-sm mt-1 font-light text-[var(--text-muted)]">
                        {hist.signature_subtitle}
                      </p>
                    )}
                  </div>
                </RevealOnScroll>
              )}

              {/* Team section */}
              {hist.team_title && (
                <RevealOnScroll delay={0.4}>
                  <div className="max-w-3xl mx-auto text-center">
                    <div className="flex items-center justify-center gap-4 mb-6">
                      <span className="block w-16 h-px" style={{ background: `linear-gradient(to right, transparent, rgba(${goldRgb}, 0.3))` }} />
                      <span className="block w-2 h-2 rotate-45" style={{ background: gold, opacity: 0.5 }} />
                      <span className="block w-16 h-px" style={{ background: `linear-gradient(to left, transparent, rgba(${goldRgb}, 0.3))` }} />
                    </div>
                    <h3 className="font-display text-xl sm:text-2xl md:text-3xl font-light mb-4 md:mb-6 text-[var(--text-primary)]">
                      {hist.team_title}
                    </h3>
                    {hist.team_description && (
                      <p className="text-base md:text-lg text-[var(--text-secondary)] leading-relaxed font-light">
                        {hist.team_description}
                      </p>
                    )}
                  </div>
                </RevealOnScroll>
              )}
            </div>
          </section>
        );
      })()}
      </div>

      <div style={{ order: ord("fondateurs") }}>
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
                <h2 className="font-display font-light text-center text-2xl sm:text-3xl md:text-5xl mb-4 md:mb-6" style={{ color: 'var(--brand)' }}>
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
                        <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-52 md:h-52 rounded-full overflow-hidden border-2 border-[var(--brand)]/30 group-hover:border-[var(--brand)] transition-all duration-500 relative">
                          {founder.image && (
                            <img
                              src={founder.image}
                              alt={founder.name}
                              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                            />
                          )}
                        </div>
                        <div className="absolute -inset-1 rounded-full bg-[var(--brand)]/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                      </div>
                      <h3 className="font-display text-lg sm:text-xl md:text-2xl text-[var(--brand)] mb-1 text-center">{founder.name}</h3>
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
      </div>

      <div style={{ order: ord("transformation") }}>
      {/* ═══ AVANT / APRÈS (Transformation) ═══ */}
      {vis('transformation') && (() => {
        const tr = sec('transformation');
        const trItems = tr.items || [];
        if (!tr.title && trItems.length === 0) return null;
        return (
          <section className="px-5 md:px-20 py-16 md:py-32 relative cv-auto">
            <div className="max-w-5xl mx-auto">
              <RevealOnScroll>
                <div className="text-center mb-12 md:mb-16">
                  {tr.label && <p className="text-xs tracking-[0.2em] uppercase mb-4 text-[var(--brand)]">{tr.label}</p>}
                  {tr.title && (
                    <h2 className="font-display font-light leading-[1.15] mb-6" style={tStyle("transformation")}>
                      <WordByWordReveal text={tr.title} />
                    </h2>
                  )}
                  {tr.description && <p className="text-base md:text-lg max-w-3xl mx-auto text-[var(--text-secondary)]">{tr.description}</p>}
                </div>
              </RevealOnScroll>
              <div className="space-y-8 md:space-y-12">
                {trItems.map((item: { before: string; after: string; timeframe?: string; challenge?: string }, i: number) => (
                  <RevealOnScroll key={i} delay={i * 0.1}>
                    <div className="rounded-2xl p-6 md:p-8" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                      {item.challenge && <p className="text-xs tracking-[0.15em] uppercase mb-4 font-medium text-[var(--brand)]">{item.challenge}{item.timeframe ? ` - ${item.timeframe}` : ''}</p>}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-xs uppercase tracking-wider mb-2 font-semibold" style={{ color: '#FF6B6B' }}>Avant</p>
                          <p className="text-sm md:text-base leading-relaxed text-[var(--text-secondary)]">{item.before}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wider mb-2 font-semibold" style={{ color: '#55EFC4' }}>Après</p>
                          <p className="text-sm md:text-base leading-relaxed text-[var(--text-secondary)]">{item.after}</p>
                        </div>
                      </div>
                    </div>
                  </RevealOnScroll>
                ))}
              </div>
            </div>
          </section>
        );
      })()}
      </div>

      <div style={{ order: ord("manifeste") }}>
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
                  <h2 className="font-display font-light italic text-2xl sm:text-3xl md:text-5xl leading-[1.2] text-[var(--brand)]">
                    <WordByWordReveal text={manif.title || ''} />
                  </h2>
                  <span className="block w-16 h-px mx-auto mt-6" style={{ background: gold }} />
                </div>
              </RevealOnScroll>

              <div className="space-y-6 md:space-y-8">
                {paragraphs.map((p: string, i: number) => (
                  <RevealOnScroll key={i} delay={0.15 + i * 0.1}>
                    <p className="text-base md:text-xl font-light leading-relaxed text-[var(--text-secondary)]">
                      {p}
                    </p>
                  </RevealOnScroll>
                ))}
              </div>

              {manif.signature && (
                <RevealOnScroll delay={0.5}>
                  <p className="mt-10 md:mt-14 font-display text-lg md:text-xl italic text-[var(--brand)]">
                    - {manif.signature}
                  </p>
                </RevealOnScroll>
              )}
            </div>
          </section>
        );
      })()}
      </div>

      <div style={{ order: ord("pricing") }}>
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

            {(() => {
              const activePlans = (pricing.plans || []).filter((p: { name: string; price: string; features?: string[] }) =>
                !p.name.toLowerCase().includes('premium') &&
                !p.name.toLowerCase().includes('archiv') &&
                !(p.features && p.features.length === 1 && p.features[0].toLowerCase().includes('archiv'))
              );
              const colClass = activePlans.length <= 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3';
              return (
            <div className={`grid grid-cols-1 ${colClass} gap-4 md:gap-6 max-w-5xl mx-auto`}>
              {activePlans.map((plan: { name: string; tagline?: string; price: string; period: string; button_label: string; button_href: string; highlight: boolean; badge: string; features: string[] }, idx: number) => {
                const tierColors = [
                  { main: '#F0A68C', deep: '#D4825E', rgb: '240,166,140' },
                  { main: '#55EFC4', deep: '#00B894', rgb: '85,239,196' },
                  { main: '#A78BFA', deep: '#7C3AED', rgb: '167,139,250' },
                ] as const
                const tc = tierColors[idx] || tierColors[0]
                const btnTextColor = idx === 2 ? '#fff' : '#000000'

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
                      <p className="text-xs font-light mb-4 md:mb-6 text-[var(--text-muted)]">{plan.tagline}</p>
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

                    <Link href={plan.button_href || '/signup'} onClick={() => trackConversion('signup')}>
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
              );
            })()}

            {/* Guarantee within pricing */}
            {pricing.guarantee_title && (
              <RevealOnScroll delay={0.35}>
                <div className="mt-10 md:mt-16 text-center max-w-2xl mx-auto">
                  <div className="glow-card p-6 sm:p-8 md:p-10">
                    <h3 className="font-display text-lg sm:text-xl md:text-2xl font-light mb-4 text-[var(--text-primary)]">
                      {pricing.guarantee_title}
                    </h3>
                    {pricing.guarantee_description && (
                      <p className="text-sm md:text-base text-[var(--text-secondary)] font-light leading-relaxed whitespace-pre-line">
                        {pricing.guarantee_description}
                      </p>
                    )}
                  </div>
                </div>
              </RevealOnScroll>
            )}

            <RevealOnScroll delay={0.4}>
              <p className="text-center text-xs text-[var(--text-muted)] mt-6 md:mt-8 font-light italic">{pricing.footer || ''}</p>
            </RevealOnScroll>

            {/* Trust Badges */}
            {pricing.trust_badges && Array.isArray(pricing.trust_badges) && pricing.trust_badges.length > 0 && (
              <RevealOnScroll delay={0.5}>
                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mt-6 md:mt-10">
                  {pricing.trust_badges.map((badge: string, i: number) => (
                    <span key={i} className="flex items-center gap-2 text-xs font-light text-[var(--text-muted)]">
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
      </div>

      <div style={{ order: ord("garantie") }}>
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
                    <h2 className="font-display font-light text-2xl sm:text-3xl md:text-4xl mb-4 md:mb-6 text-[var(--text-primary)]">
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
      </div>

      <div style={{ order: ord("faq") }}>
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
                    {faq.cta_text && <p className="text-sm font-light mb-4 text-[var(--text-muted)]">{faq.cta_text}</p>}
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
      </div>

      <div style={{ order: ord("pour_qui") }}>
      {/* ═══ POUR QUI / PAS POUR QUI ═══ */}
      {vis('pour_qui') && (() => {
        const pq = sec('pour_qui');
        const forItems: string[] = pq.for_items || [];
        const notItems: string[] = pq.not_items || [];
        if (!pq.title && forItems.length === 0) return null;
        return (
          <section className="px-5 md:px-20 py-16 md:py-32 relative cv-auto">
            <div className="max-w-4xl mx-auto">
              <RevealOnScroll>
                <h2 className="font-display font-light text-center mb-10 md:mb-16" style={tStyle("pour_qui")}>
                  <WordByWordReveal text={pq.title || ''} />
                </h2>
              </RevealOnScroll>

              <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                {/* Pour vous */}
                {forItems.length > 0 && (
                  <RevealOnScroll delay={0.1} direction="left">
                    <GlowingCard className="p-6 sm:p-8 h-full">
                      <div className="space-y-4">
                        {forItems.map((item: string, i: number) => (
                          <motion.div
                            key={i}
                            className="flex items-start gap-3"
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 + i * 0.08 }}
                          >
                            <span className="mt-0.5 text-sm flex-shrink-0" style={{ color: '#55EFC4' }}>&#10022;</span>
                            <span className="text-[var(--text-secondary)] text-sm sm:text-[15px] font-light leading-relaxed">{item}</span>
                          </motion.div>
                        ))}
                      </div>
                    </GlowingCard>
                  </RevealOnScroll>
                )}

                {/* Pas pour vous */}
                {notItems.length > 0 && (
                  <RevealOnScroll delay={0.2} direction="right">
                    <div className="h-full">
                      {pq.not_title && (
                        <h3 className="font-display text-xl sm:text-2xl font-light mb-6 text-[var(--text-primary)]">
                          {pq.not_title}
                        </h3>
                      )}
                      <div className="glow-card p-6 sm:p-8 h-full" style={{ border: '1px solid rgba(255,100,100,0.1)' }}>
                        <div className="space-y-4">
                          {notItems.map((item: string, i: number) => (
                            <motion.div
                              key={i}
                              className="flex items-start gap-3"
                              initial={{ opacity: 0, x: 10 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.3 + i * 0.08 }}
                            >
                              <span className="mt-0.5 text-sm flex-shrink-0" style={{ color: '#FF6B6B' }}>&#10007;</span>
                              <span className="text-[var(--text-secondary)] text-sm sm:text-[15px] font-light leading-relaxed">{item}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </RevealOnScroll>
                )}
              </div>
            </div>
          </section>
        );
      })()}
      </div>

      <div style={{ order: ord("cta_dark") }}>
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
              <h2 className="font-display font-light leading-[1.12] mb-4 md:mb-6" style={tStyle("cta_dark")}>
                <WordByWordReveal text={ctaDark.title || ''} />
              </h2>
            </RevealOnScroll>
            {ctaDark.subtitle && (
              <RevealOnScroll delay={0.15}>
                <p className="text-base sm:text-xl md:text-2xl text-[var(--text-secondary)] font-light leading-relaxed mb-8 md:mb-12 max-w-2xl mx-auto">
                  {ctaDark.subtitle}
                </p>
              </RevealOnScroll>
            )}
            <RevealOnScroll delay={0.3}>
              <Link href={ctaDark.button_href || '/signup'} onClick={() => trackConversion('signup')}>
                <button className="magnetic-btn pulse-ring px-8 sm:px-10 py-4 sm:py-5 rounded-full text-base sm:text-lg font-semibold tracking-wide" style={{ background: `linear-gradient(135deg, ${gold}, ${goldDeep})`, color: '#000000' }}>
                  {ctaDark.button_label || 'Rejoindre SOS Shine'}
                </button>
              </Link>
            </RevealOnScroll>
            {ctaDark.trust_line && (
              <RevealOnScroll delay={0.4}>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-4 md:mt-6 font-light tracking-wide">
                  {ctaDark.trust_line}
                </p>
              </RevealOnScroll>
            )}
          </div>
        </section>
      )}

      </div>

      <div style={{ order: ord("cta_light") }}>
      {/* ═══ CTA LIGHT ═══ */}
      {vis('cta_light') && (() => {
        const ctaL = sec('cta_light');
        return (
          <section className="px-5 md:px-20 py-20 md:py-32 relative cv-auto" style={{ background: ctaL.bg || '#ffffff' }}>
            <div className="max-w-3xl mx-auto text-center">
              <RevealOnScroll>
                {ctaL.description && (
                  <p className="text-base md:text-xl leading-relaxed mb-8 md:mb-10" style={{ color: ctaL.muted_color || '#6b7280' }}>
                    {ctaL.description}
                  </p>
                )}
              </RevealOnScroll>
              <RevealOnScroll delay={0.2}>
                {ctaL.button_label && (
                  <Link href={ctaL.button_href || '/signup'} onClick={() => trackConversion('cta_light')}>
                    <button className="magnetic-btn px-8 sm:px-10 py-4 sm:py-5 rounded-full text-base sm:text-lg font-semibold tracking-wide" style={{ background: `linear-gradient(135deg, ${gold}, ${goldDeep})`, color: '#000000' }}>
                      {ctaL.button_label}
                    </button>
                  </Link>
                )}
                {ctaL.login_text && (
                  <p className="mt-4 text-sm">
                    <Link href="/login" className="transition-colors duration-300" style={{ color: ctaL.muted_color || '#6b7280' }}>
                      {ctaL.login_text}
                    </Link>
                  </p>
                )}
              </RevealOnScroll>
            </div>
          </section>
        );
      })()}
      </div>

      {/* ═══ LANDING V2 - Complete 12-section landing page ═══ */}
      {vis('landing_v2') && (() => {
        const v2 = sec('landing_v2')
        return (
          <div style={{ order: ord('landing_v2') }}>

            {/* ── V2 HERO ── */}
            <section className="relative min-h-screen flex items-center pt-20 md:pt-24">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] rounded-full opacity-[0.03] blur-[60px] md:blur-[80px]" style={{ background: gold }} />
              </div>
              <div className="relative z-10 px-5 md:px-20 py-12 md:py-24 max-w-5xl mx-auto w-full text-center">
                <RevealOnScroll>
                  <span className="inline-block px-4 py-1.5 rounded-full text-[10px] tracking-[0.25em] uppercase font-medium mb-8"
                    style={{ background: `rgba(${goldRgb}, 0.08)`, color: gold, border: `1px solid rgba(${goldRgb}, 0.15)` }}>
                    {v2.hero_badge || 'PLATEFORME DE DÉCONDITIONNEMENT ÉMOTIONNEL'}
                  </span>
                </RevealOnScroll>
                <RevealOnScroll delay={0.1}>
                  <h1 className="font-display font-light text-3xl sm:text-4xl md:text-6xl leading-[1.1] mb-6 md:mb-8 text-[var(--brand)]">
                    {(v2.hero_title || '').split('\n').map((line: string, i: number) => <span key={i} className="block">{line}</span>)}
                  </h1>
                </RevealOnScroll>
                <RevealOnScroll delay={0.2}>
                  <p className="text-base sm:text-lg md:text-xl text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto font-light mb-8 md:mb-12">
                    {v2.hero_description || ''}
                  </p>
                </RevealOnScroll>
                <RevealOnScroll delay={0.3}>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link href={v2.hero_cta_primary_href || '/signup'} onClick={() => trackConversion('signup')}>
                      <button className="magnetic-btn pulse-ring px-8 py-4 rounded-full text-base font-semibold tracking-wide"
                        style={{ background: `linear-gradient(135deg, ${gold}, ${goldDeep})`, color: '#000000' }}>
                        {v2.hero_cta_primary || 'Rejoindre SOS Shine'}
                      </button>
                    </Link>
                    <Link href={v2.hero_cta_secondary_href || '#parcours-v2'}
                      className="px-8 py-4 rounded-full text-base font-medium tracking-wide"
                      style={{ border: `1px solid rgba(${goldRgb},0.3)`, color: gold }}>
                      {v2.hero_cta_secondary || "Découvrir comment ça fonctionne"}
                    </Link>
                  </div>
                </RevealOnScroll>
              </div>
            </section>

            {/* ── V2 TICKER 1 (après Hero) ── */}
            <InfiniteTickerBand items={tickerItems} speed={ticker1Speed} />

            {/* ── V2 SOCIAL PROOF / CHIFFRES CLÉS ── */}
            <section className="px-5 md:px-20 py-10 md:py-16">
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-3 gap-4 md:gap-8">
                  {[
                    { value: "A → Z", label: 'PROTOCOLES DE DÉCONDITIONNEMENT' },
                    { value: '5', label: 'UNIVERS DE CONTENU' },
                    { value: '24/7', label: 'ACCESSIBLE À TOUT MOMENT' },
                  ].map((stat, i) => (
                    <RevealOnScroll key={i} delay={i * 0.1}>
                      <div className="text-center py-4 md:py-6">
                        <p className="font-display text-3xl sm:text-4xl md:text-5xl font-light mb-2 text-[var(--brand)]">{stat.value}</p>
                        <p className="text-[9px] sm:text-[10px] tracking-[0.15em] uppercase text-[var(--text-muted)]">{stat.label}</p>
                      </div>
                    </RevealOnScroll>
                  ))}
                </div>
              </div>
            </section>

            {/* ── V2 S02: LA VÉRITÉ ── */}
            <section className="px-5 md:px-20 py-16 md:py-28">
              <div className="max-w-3xl mx-auto text-center">
                <RevealOnScroll>
                  <h2 className="font-display font-light text-2xl sm:text-3xl md:text-5xl leading-[1.12] mb-8 md:mb-12 text-[var(--brand)]">
                    {(v2.truth_title || '').split('\n').map((line: string, i: number) => <span key={i} className="block">{line}</span>)}
                  </h2>
                </RevealOnScroll>
                <RevealOnScroll delay={0.1}>
                  <p className="text-base md:text-lg text-[var(--text-secondary)] leading-relaxed mb-6">{v2.truth_p1 || ''}</p>
                </RevealOnScroll>
                <RevealOnScroll delay={0.15}>
                  <p className="text-base md:text-lg text-[var(--text-secondary)] leading-relaxed mb-10">{v2.truth_p2 || ''}</p>
                </RevealOnScroll>
                <RevealOnScroll delay={0.2}>
                  <p className="font-display text-xl md:text-2xl font-light italic text-[var(--brand)]">{v2.truth_closing || ''}</p>
                </RevealOnScroll>
              </div>
            </section>

            {/* ── V2 S03: JULIA ET LE LIVRE ── */}
            <section className="px-5 md:px-20 py-16 md:py-28 relative">
              <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{ background: `radial-gradient(circle at 30% 50%, ${gold}, transparent 60%)` }} />
              <div className="max-w-4xl mx-auto relative z-10">
                <RevealOnScroll>
                  <h2 className="font-display font-light text-2xl sm:text-3xl md:text-5xl leading-[1.12] text-center mb-12 md:mb-16 text-[var(--brand)]">
                    {(v2.julia_title || '').split('\n').map((line: string, i: number) => <span key={i} className="block">{line}</span>)}
                  </h2>
                </RevealOnScroll>
                <div className="space-y-6 text-base md:text-lg text-[var(--text-secondary)] leading-relaxed">
                  <RevealOnScroll delay={0.05}><p>{v2.julia_p1 || ''}</p></RevealOnScroll>
                  <RevealOnScroll delay={0.1}><p>{v2.julia_p2 || ''}</p></RevealOnScroll>
                  <RevealOnScroll delay={0.15}><p>{v2.julia_p3 || ''}</p></RevealOnScroll>
                  <RevealOnScroll delay={0.2}>
                    <p className="font-display text-xl md:text-2xl font-light italic pt-4 text-[var(--brand)]">{v2.julia_promise || ''}</p>
                  </RevealOnScroll>
                </div>
                <RevealOnScroll delay={0.25}>
                  <div className="mt-10 pt-8" style={{ borderTop: `1px solid rgba(${goldRgb}, 0.1)` }}>
                    <p className="font-display text-lg font-semibold text-[var(--brand)]">{v2.julia_signature || ''}</p>
                    <p className="text-sm text-[var(--text-muted)] mt-1">{v2.julia_signature_sub || ''}</p>
                  </div>
                </RevealOnScroll>
                <RevealOnScroll delay={0.3}>
                  <div className="mt-14 md:mt-20 text-center">
                    <p className="font-display text-xl md:text-2xl font-light mb-4 text-[var(--brand)]">{v2.julia_team_intro || ''}</p>
                    <p className="text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto">{v2.julia_team_text || ''}</p>
                  </div>
                </RevealOnScroll>
              </div>
            </section>

            {/* ── V2 S04: TÉMOIGNAGES ── */}
            <section className="px-5 md:px-20 py-16 md:py-28">
              <div className="max-w-4xl mx-auto">
                <RevealOnScroll>
                  <h2 className="font-display font-light text-2xl sm:text-3xl md:text-5xl leading-[1.12] text-center mb-4 md:mb-6 text-[var(--brand)]">
                    {(v2.temoignages_title || '').split('\n').map((line: string, i: number) => <span key={i} className="block">{line}</span>)}
                  </h2>
                </RevealOnScroll>
                <RevealOnScroll delay={0.05}>
                  <p className="text-center text-sm text-[var(--text-muted)] mb-10 md:mb-14">{v2.temoignages_subtitle || ''}</p>
                </RevealOnScroll>
                <div className="space-y-6">
                  {(v2.temoignages || []).map((quote: string, i: number) => (
                    <RevealOnScroll key={i} delay={0.1 + i * 0.08}>
                      <blockquote className="rounded-2xl p-6 md:p-8" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                        <p className="text-base md:text-lg text-[var(--text-secondary)] leading-relaxed italic font-light">&ldquo;{quote}&rdquo;</p>
                      </blockquote>
                    </RevealOnScroll>
                  ))}
                </div>
              </div>
            </section>

            {/* ── V2 S05: ENCYCLOPÉDIE ── */}
            <section className="px-5 md:px-20 py-16 md:py-28">
              <div className="max-w-4xl mx-auto text-center">
                <RevealOnScroll>
                  <span className="inline-block px-4 py-1.5 rounded-full text-[10px] tracking-[0.25em] uppercase font-medium mb-6"
                    style={{ background: `rgba(${goldRgb}, 0.08)`, color: gold, border: `1px solid rgba(${goldRgb}, 0.15)` }}>
                    {v2.encyclo_badge || ''}
                  </span>
                </RevealOnScroll>
                <RevealOnScroll delay={0.05}>
                  <h2 className="font-display font-light text-2xl sm:text-3xl md:text-5xl leading-[1.12] mb-6 text-[var(--brand)]">
                    {(v2.encyclo_title || '').split('\n').map((line: string, i: number) => <span key={i} className="block">{line}</span>)}
                  </h2>
                </RevealOnScroll>
                <RevealOnScroll delay={0.1}>
                  <p className="text-base md:text-lg text-[var(--text-secondary)] mb-8">{v2.encyclo_description || ''}</p>
                </RevealOnScroll>
                <RevealOnScroll delay={0.15}>
                  <div className="max-w-xl mx-auto mb-8">
                    <input type="text" readOnly placeholder={v2.encyclo_search_placeholder || 'Rechercher...'}
                      className="w-full rounded-full px-6 py-4 text-sm outline-none cursor-pointer"
                      style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(${goldRgb}, 0.15)`, color: 'var(--text-secondary)' }}
                      onClick={() => { window.location.href = v2.encyclo_cta_href || '/signature-emotionnelle' }} />
                  </div>
                </RevealOnScroll>
                <RevealOnScroll delay={0.2}>
                  <div className="flex flex-wrap justify-center gap-2 mb-10">
                    {(v2.encyclo_tags || []).map((tag: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 rounded-full text-xs"
                        style={{ background: `rgba(${goldRgb}, 0.06)`, color: 'var(--text-secondary)', border: `1px solid rgba(${goldRgb}, 0.1)` }}>
                        {tag}
                      </span>
                    ))}
                    <span className="px-3 py-1.5 text-xs text-[var(--text-muted)]">Et plus...</span>
                  </div>
                </RevealOnScroll>
                <RevealOnScroll delay={0.25}>
                  <Link href={v2.encyclo_cta_href || '/signature-emotionnelle'}>
                    <button className="magnetic-btn px-8 py-4 rounded-full text-base font-medium tracking-wide"
                      style={{ border: `1px solid rgba(${goldRgb},0.3)`, color: gold }}>
                      {v2.encyclo_cta || "Découvrir ma Signature Émotionnelle"}
                    </button>
                  </Link>
                </RevealOnScroll>
              </div>
            </section>

            {/* ── V2 S06: LE PARCOURS ── */}
            <section id="parcours-v2" className="px-5 md:px-20 py-16 md:py-28">
              <div className="max-w-5xl mx-auto">
                <RevealOnScroll>
                  <span className="block text-center text-[10px] tracking-[0.25em] uppercase font-medium mb-6 text-[var(--brand)]">
                    {v2.parcours_badge || ''}
                  </span>
                  <h2 className="font-display font-light text-2xl sm:text-3xl md:text-5xl leading-[1.12] text-center mb-12 md:mb-16 text-[var(--brand)]">
                    {(v2.parcours_title || '').split('\n').map((line: string, i: number) => <span key={i} className="block">{line}</span>)}
                  </h2>
                </RevealOnScroll>
                <div className="space-y-8 md:space-y-12">
                  {(v2.parcours_steps || []).map((step: { num: string; title: string; description: string; color: string }, i: number) => (
                    <RevealOnScroll key={i} delay={i * 0.1} direction={i % 2 === 0 ? 'left' : 'right'}>
                      <div className="rounded-2xl p-6 md:p-10" style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${step.color}20` }}>
                        <div className="flex items-start gap-4 md:gap-6">
                          <span className="font-display text-4xl md:text-5xl font-light flex-shrink-0" style={{ color: step.color }}>{step.num}</span>
                          <div>
                            <h3 className="text-lg md:text-xl font-semibold tracking-wide mb-3" style={{ color: step.color }}>{step.title}</h3>
                            <p className="text-base text-[var(--text-secondary)] leading-relaxed">{step.description}</p>
                          </div>
                        </div>
                      </div>
                    </RevealOnScroll>
                  ))}
                </div>
              </div>
            </section>

            {/* ── V2 S07: COMMUNAUTÉ ── */}
            <section className="px-5 md:px-20 py-16 md:py-28">
              <div className="max-w-5xl mx-auto">
                <RevealOnScroll>
                  <span className="block text-center text-[10px] tracking-[0.25em] uppercase font-medium mb-6 text-[var(--brand)]">
                    {v2.community_badge || ''}
                  </span>
                  <h2 className="font-display font-light text-2xl sm:text-3xl md:text-5xl leading-[1.12] text-center mb-6 text-[var(--brand)]">
                    {(v2.community_title || '').split('\n').map((line: string, i: number) => <span key={i} className="block">{line}</span>)}
                  </h2>
                </RevealOnScroll>
                <RevealOnScroll delay={0.05}>
                  <p className="text-center text-base md:text-lg text-[var(--text-secondary)] leading-relaxed max-w-3xl mx-auto mb-4">{v2.community_description || ''}</p>
                </RevealOnScroll>
                <RevealOnScroll delay={0.1}>
                  <p className="text-center text-base text-[var(--text-secondary)] mb-4">{v2.community_paragraph || ''}</p>
                </RevealOnScroll>
                <RevealOnScroll delay={0.12}>
                  <p className="text-center font-display text-lg italic mb-12 md:mb-16 text-[var(--brand)]">{v2.community_closing || ''}</p>
                </RevealOnScroll>
                <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
                  {(v2.community_blocks || []).map((block: { icon: string; title: string; description: string }, i: number) => (
                    <RevealOnScroll key={i} delay={0.15 + i * 0.06}>
                      <div className="rounded-2xl p-6 md:p-8 h-full" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                        <span className="text-2xl md:text-3xl block mb-3">{block.icon}</span>
                        <h3 className="font-semibold text-base mb-2 text-[var(--brand)]">{block.title}</h3>
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{block.description}</p>
                      </div>
                    </RevealOnScroll>
                  ))}
                </div>
              </div>
            </section>

            {/* ── V2 TICKER 2 (après Communauté) ── */}
            <InfiniteTickerBand items={ticker2Items} speed={ticker2Speed} />

            {/* ── V2 S08: DÈS JOUR 1 ── */}
            <section className="px-5 md:px-20 py-16 md:py-28">
              <div className="max-w-3xl mx-auto text-center">
                <RevealOnScroll>
                  <h2 className="font-display font-light text-2xl sm:text-3xl md:text-5xl leading-[1.12] mb-10 md:mb-14 text-[var(--brand)]">
                    {(v2.day1_title || '').split('\n').map((line: string, i: number) => <span key={i} className="block">{line}</span>)}
                  </h2>
                </RevealOnScroll>
                <ul className="space-y-4 text-left max-w-xl mx-auto">
                  {(v2.day1_items || []).map((item: string, i: number) => (
                    <RevealOnScroll key={i} delay={0.05 + i * 0.05}>
                      <li className="flex items-start gap-3">
                        <span className="mt-1 text-sm flex-shrink-0 text-[var(--brand)]">&#10022;</span>
                        <span className="text-base text-[var(--text-secondary)] leading-relaxed">{item}</span>
                      </li>
                    </RevealOnScroll>
                  ))}
                </ul>
              </div>
            </section>

            {/* ── V2 S09: CE QUE NOUS NE SOMMES PAS ── */}
            <section className="px-5 md:px-20 py-16 md:py-28 relative">
              <div className="max-w-3xl mx-auto">
                <RevealOnScroll>
                  <h2 className="font-display font-light text-xl sm:text-2xl md:text-4xl leading-[1.15] text-center mb-10 md:mb-14 text-[var(--brand)]">
                    {(v2.notus_title || '').split('\n').map((line: string, i: number) => <span key={i} className="block">{line}</span>)}
                  </h2>
                </RevealOnScroll>
                <RevealOnScroll delay={0.1}>
                  <blockquote className="rounded-2xl p-6 md:p-10 mb-8 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid rgba(${goldRgb}, 0.1)` }}>
                    {(v2.notus_quote || '').split('\n').map((line: string, i: number) => (
                      <p key={i} className="text-base md:text-lg text-[var(--text-secondary)] leading-relaxed font-light italic">{line}</p>
                    ))}
                    <p className="mt-4 text-sm font-semibold text-[var(--brand)]">{v2.notus_author || ''}</p>
                  </blockquote>
                </RevealOnScroll>
                <RevealOnScroll delay={0.15}>
                  <p className="text-xs text-[var(--text-muted)] text-center mb-6">{v2.notus_disclaimer || ''}</p>
                </RevealOnScroll>
                <RevealOnScroll delay={0.2}>
                  <p className="text-base text-[var(--text-secondary)] leading-relaxed text-center mb-6">{v2.notus_description || ''}</p>
                </RevealOnScroll>
                <RevealOnScroll delay={0.25}>
                  <p className="font-display text-lg font-light italic text-center text-[var(--brand)]">{v2.notus_closing || ''}</p>
                </RevealOnScroll>
              </div>
            </section>

            {/* ── V2 S10: TARIFICATION ── */}
            <section className="px-5 md:px-20 py-16 md:py-28">
              <div className="max-w-5xl mx-auto">
                <RevealOnScroll>
                  <span className="block text-center text-[10px] tracking-[0.25em] uppercase font-medium mb-4 text-[var(--brand)]">
                    {v2.pricing_badge || ''}
                  </span>
                  <h2 className="font-display font-light text-2xl sm:text-3xl md:text-5xl leading-[1.12] text-center mb-2 text-[var(--brand)]">
                    {v2.pricing_title || ''}
                  </h2>
                  <p className="text-center text-sm text-[var(--text-muted)] mb-12 md:mb-16">{v2.pricing_subtitle || ''}</p>
                </RevealOnScroll>
                <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-3xl mx-auto">
                  {(v2.pricing_plans || []).map((plan: { name: string; price: string; period: string; description: string; features: string[]; button_label: string; button_href: string; highlight: boolean; badge: string }, i: number) => (
                    <RevealOnScroll key={i} delay={i * 0.1}>
                      <div className="rounded-2xl p-6 md:p-8 flex flex-col h-full relative"
                        style={{
                          background: plan.highlight ? `rgba(${goldRgb}, 0.04)` : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${plan.highlight ? `rgba(${goldRgb}, 0.25)` : 'var(--border)'}`,
                        }}>
                        {plan.badge && (
                          <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] tracking-wider uppercase font-semibold"
                            style={{ background: `rgba(${goldRgb}, 0.12)`, color: gold }}>
                            {plan.badge}
                          </span>
                        )}
                        <h3 className="text-sm font-semibold tracking-wider uppercase mb-4 text-[var(--text-muted)]">{plan.name}</h3>
                        <div className="flex items-baseline gap-1 mb-2">
                          <span className="font-display text-4xl md:text-5xl font-light text-[var(--brand)]">{plan.price}€</span>
                          <span className="text-sm text-[var(--text-muted)]">{plan.period}</span>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] mb-6">{plan.description}</p>
                        <ul className="space-y-3 flex-1 mb-8">
                          {plan.features.map((f: string, fi: number) => (
                            <li key={fi} className="flex items-start gap-2">
                              <span className="mt-0.5 text-xs text-[var(--brand)]">&#10022;</span>
                              <span className="text-sm text-[var(--text-secondary)]">{f}</span>
                            </li>
                          ))}
                        </ul>
                        <Link href={plan.button_href || '/signup'} onClick={() => trackConversion('signup')}>
                          <button className={`magnetic-btn w-full py-3.5 rounded-full text-sm font-semibold tracking-wide ${plan.highlight ? 'pulse-ring' : ''}`}
                            style={{ background: `linear-gradient(135deg, ${gold}, ${goldDeep})`, color: '#000000' }}>
                            {plan.button_label}
                          </button>
                        </Link>
                      </div>
                    </RevealOnScroll>
                  ))}
                </div>
                <RevealOnScroll delay={0.3}>
                  <div className="mt-10 md:mt-14 text-center max-w-2xl mx-auto">
                    <p className="text-base font-medium text-[var(--text-secondary)] mb-2">{v2.pricing_footer_title || ''}</p>
                    <p className="text-sm text-[var(--text-muted)] mb-4">{v2.pricing_footer_text || ''}</p>
                    <p className="text-sm text-[var(--text-muted)] italic leading-relaxed">
                      {(v2.pricing_footer_quote || '').split('\n').map((line: string, i: number) => <span key={i} className="block">{line}</span>)}
                    </p>
                  </div>
                </RevealOnScroll>
              </div>
            </section>

            {/* ── V2 S11: POUR QUI ── */}
            <section className="px-5 md:px-20 py-16 md:py-28">
              <div className="max-w-3xl mx-auto">
                <RevealOnScroll>
                  <h2 className="font-display font-light text-2xl sm:text-3xl md:text-4xl leading-[1.12] text-center mb-10 md:mb-14 text-[var(--brand)]">
                    {v2.pourqui_title || ''}
                  </h2>
                </RevealOnScroll>
                <div className="grid md:grid-cols-2 gap-8">
                  <RevealOnScroll delay={0.05}>
                    <ul className="space-y-4">
                      {(v2.pourqui_positive || []).map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="mt-0.5 text-sm flex-shrink-0" style={{ color: '#55EFC4' }}>&#10022;</span>
                          <span className="text-base text-[var(--text-secondary)] leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </RevealOnScroll>
                  <RevealOnScroll delay={0.1}>
                    <div>
                      <p className="font-semibold text-sm mb-4" style={{ color: '#FF6B6B' }}>{v2.pourqui_negative_title || ''}</p>
                      <ul className="space-y-4">
                        {(v2.pourqui_negative || []).map((item: string, i: number) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="mt-0.5 text-sm flex-shrink-0" style={{ color: '#FF6B6B' }}>&#10007;</span>
                            <span className="text-base text-[var(--text-secondary)] leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </RevealOnScroll>
                </div>
              </div>
            </section>

            {/* ── V2 S12: CTA FINAL ── */}
            <section className="px-5 md:px-20 py-20 md:py-36 relative">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] rounded-full opacity-[0.04] blur-[80px]" style={{ background: gold }} />
              </div>
              <div className="relative z-10 max-w-3xl mx-auto text-center">
                <RevealOnScroll>
                  <h2 className="font-display font-light text-2xl sm:text-3xl md:text-5xl leading-[1.12] mb-8 md:mb-12 text-[var(--brand)]">
                    {(v2.cta_title || '').split('\n').map((line: string, i: number) => <span key={i} className="block">{line}</span>)}
                  </h2>
                </RevealOnScroll>
                <RevealOnScroll delay={0.1}>
                  <Link href={v2.cta_button_href || '/signup'} onClick={() => trackConversion('signup')}>
                    <button className="magnetic-btn pulse-ring px-10 py-5 rounded-full text-lg font-semibold tracking-wide"
                      style={{ background: `linear-gradient(135deg, ${gold}, ${goldDeep})`, color: '#000000' }}>
                      {v2.cta_button || 'Rejoindre SOS Shine'}
                    </button>
                  </Link>
                </RevealOnScroll>
                <RevealOnScroll delay={0.15}>
                  <p className="text-sm text-[var(--text-muted)] mt-6 tracking-wide">{v2.cta_details || ''}</p>
                </RevealOnScroll>
              </div>
            </section>

          </div>
        )
      })()}

      {/* ═══ CUSTOM SECTIONS (all types) - each wrapped with its own order ═══ */}
      {Object.entries(sections).filter(([key, s]) => key.startsWith('custom_') && s.is_visible).map(([key, s]) => {
        const c = s.content
        const sType = c.section_type || (c.html_content ? 'html' : 'text')
        const titleStyle = s.styles?.title_font ? { fontFamily: s.styles.title_font } : {}

        // HTML type
        if (sType === 'html' && c.html_content) {
          return (
            <div key={key} style={{ order: ord(key) }}>
            <section className="relative cv-auto" style={{ background: c.bg_color || 'transparent', padding: c.padding || '4rem 1.5rem' }}>
              <RevealOnScroll>
                <div className="max-w-5xl mx-auto">
                  {c.title && (
                    <h2 className="font-display font-light text-center text-3xl md:text-5xl mb-8" style={{ color: 'var(--brand)', ...titleStyle }}>
                      <WordByWordReveal text={c.title} />
                    </h2>
                  )}
                  <div className="prose prose-invert prose-lg max-w-none text-[var(--text-secondary)]" dangerouslySetInnerHTML={{ __html: c.html_content }} />
                </div>
              </RevealOnScroll>
            </section>
            </div>
          )
        }

        // Text type
        if (sType === 'text') {
          return (
            <div key={key} style={{ order: ord(key) }}>
            <section className="relative cv-auto px-5 md:px-20 py-16 md:py-24">
              <RevealOnScroll>
                <div className="max-w-5xl mx-auto text-center">
                  {c.subtitle && <p className="text-xs tracking-[0.2em] uppercase mb-4" style={{ color: 'var(--brand)' }}>{c.subtitle}</p>}
                  {c.title && (
                    <h2 className="font-display font-light text-3xl md:text-5xl mb-6" style={{ color: 'var(--brand)', ...titleStyle }}>
                      <WordByWordReveal text={c.title} />
                    </h2>
                  )}
                  {c.image_url && <img src={c.image_url} alt="" className="w-full max-w-2xl mx-auto rounded-2xl mb-8 object-cover" />}
                  {c.video_url && (
                    <video
                      src={c.video_url}
                      controls
                      controlsList="nodownload noplaybackrate"
                      disablePictureInPicture
                      onContextMenu={(e) => e.preventDefault()}
                      className="w-full max-w-2xl mx-auto rounded-2xl mb-8"
                    />
                  )}
                  {c.description && <p className="text-base md:text-lg leading-relaxed max-w-3xl mx-auto mb-8 text-[var(--text-secondary)]">{c.description}</p>}
                  {c.button_label && (
                    <Link href={c.button_href || '/signup'} onClick={() => trackConversion('custom_cta')}>
                      <button className="magnetic-btn px-8 py-4 rounded-full text-base font-semibold tracking-wide" style={{ background: `linear-gradient(135deg, var(--brand), var(--brand-deep))`, color: '#000000' }}>
                        {c.button_label}
                      </button>
                    </Link>
                  )}
                  {c.html_content && <div className="prose prose-invert prose-lg max-w-none mt-8 text-[var(--text-secondary)]" dangerouslySetInnerHTML={{ __html: c.html_content }} />}
                </div>
              </RevealOnScroll>
            </section>
            </div>
          )
        }

        // Cards type
        if (sType === 'cards') {
          const cards = (c.cards || []) as { title?: string; description?: string; icon?: string; image_url?: string }[]
          return (
            <div key={key} style={{ order: ord(key) }}>
            <section className="relative cv-auto px-5 md:px-20 py-16 md:py-24">
              <RevealOnScroll>
                <div className="max-w-6xl mx-auto text-center">
                  {c.title && (
                    <h2 className="font-display font-light text-3xl md:text-5xl mb-4" style={{ color: 'var(--brand)', ...titleStyle }}>
                      <WordByWordReveal text={c.title} />
                    </h2>
                  )}
                  {c.description && <p className="text-base md:text-lg max-w-3xl mx-auto mb-12 text-[var(--text-secondary)]">{c.description}</p>}
                  <div className={`grid gap-6 ${cards.length <= 2 ? 'md:grid-cols-2' : cards.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
                    {cards.map((card, i) => (
                      <RevealOnScroll key={i} delay={i * 0.1}>
                        <div className="rounded-2xl p-6 md:p-8 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                          {card.image_url && <img src={card.image_url} alt="" className="w-16 h-16 mx-auto mb-4 rounded-xl object-cover" />}
                          {card.icon && !card.image_url && <span className="text-3xl mb-4 block">{card.icon}</span>}
                          {card.title && <h3 className="font-display text-lg md:text-xl font-semibold mb-3 text-[var(--text-primary)]">{card.title}</h3>}
                          {card.description && <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{card.description}</p>}
                        </div>
                      </RevealOnScroll>
                    ))}
                  </div>
                  {c.html_content && <div className="prose prose-invert prose-lg max-w-none mt-8 text-[var(--text-secondary)]" dangerouslySetInnerHTML={{ __html: c.html_content }} />}
                </div>
              </RevealOnScroll>
            </section>
            </div>
          )
        }

        // CTA type
        if (sType === 'cta') {
          return (
            <div key={key} style={{ order: ord(key) }}>
            <section className="relative cv-auto px-5 md:px-20 py-16 md:py-24">
              <RevealOnScroll>
                <div className="max-w-3xl mx-auto text-center">
                  {c.image_url && <img src={c.image_url} alt="" className="w-32 h-32 mx-auto mb-8 rounded-2xl object-cover" />}
                  {c.title && (
                    <h2 className="font-display font-light text-3xl md:text-5xl mb-6" style={{ color: 'var(--brand)', ...titleStyle }}>
                      <WordByWordReveal text={c.title} />
                    </h2>
                  )}
                  {c.description && <p className="text-base md:text-lg leading-relaxed mb-10 text-[var(--text-secondary)]">{c.description}</p>}
                  {c.button_label && (
                    <Link href={c.button_href || '/signup'}>
                      <button className="magnetic-btn pulse-ring px-10 py-5 rounded-full text-lg font-semibold tracking-wide" style={{ background: `linear-gradient(135deg, var(--brand), var(--brand-deep))`, color: '#000000' }}>
                        {c.button_label}
                      </button>
                    </Link>
                  )}
                  {c.html_content && <div className="prose prose-invert prose-lg max-w-none mt-8 text-[var(--text-secondary)]" dangerouslySetInnerHTML={{ __html: c.html_content }} />}
                </div>
              </RevealOnScroll>
            </section>
            </div>
          )
        }

        // Gallery type
        if (sType === 'gallery') {
          const images = (c.images || []) as { url?: string; caption?: string }[]
          return (
            <div key={key} style={{ order: ord(key) }}>
            <section className="relative cv-auto px-5 md:px-20 py-16 md:py-24">
              <RevealOnScroll>
                <div className="max-w-6xl mx-auto text-center">
                  {c.title && (
                    <h2 className="font-display font-light text-3xl md:text-5xl mb-4" style={{ color: 'var(--brand)', ...titleStyle }}>
                      <WordByWordReveal text={c.title} />
                    </h2>
                  )}
                  {c.description && <p className="text-base md:text-lg max-w-3xl mx-auto mb-12 text-[var(--text-secondary)]">{c.description}</p>}
                  <div className={`grid gap-4 ${images.length <= 2 ? 'md:grid-cols-2' : images.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
                    {images.map((img, i) => (
                      <RevealOnScroll key={i} delay={i * 0.08}>
                        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                          {img.url && <img src={img.url} alt={img.caption || ''} className="w-full aspect-square object-cover" />}
                          {img.caption && <p className="px-4 py-3 text-sm text-[var(--text-secondary)]">{img.caption}</p>}
                        </div>
                      </RevealOnScroll>
                    ))}
                  </div>
                  {c.html_content && <div className="prose prose-invert prose-lg max-w-none mt-8 text-[var(--text-secondary)]" dangerouslySetInnerHTML={{ __html: c.html_content }} />}
                </div>
              </RevealOnScroll>
            </section>
            </div>
          )
        }

        // Fallback: render any content with html_content or title+description
        return (
          <div key={key} style={{ order: ord(key) }}>
          <section className="relative cv-auto px-5 md:px-20 py-16 md:py-24" style={{ background: c.bg_color || 'transparent' }}>
            <RevealOnScroll>
              <div className="max-w-5xl mx-auto text-center">
                {c.title && (
                  <h2 className="font-display font-light text-3xl md:text-5xl mb-6" style={{ color: 'var(--brand)', ...titleStyle }}>
                    <WordByWordReveal text={c.title} />
                  </h2>
                )}
                {c.description && <p className="text-base md:text-lg leading-relaxed max-w-3xl mx-auto mb-8 text-[var(--text-secondary)]">{c.description}</p>}
                {c.image_url && <img src={c.image_url} alt="" className="w-full max-w-2xl mx-auto rounded-2xl mb-8 object-cover" />}
                {c.html_content && <div className="prose prose-invert prose-lg max-w-none text-[var(--text-secondary)]" dangerouslySetInnerHTML={{ __html: c.html_content }} />}
              </div>
            </RevealOnScroll>
          </section>
          </div>
        )
      })}

      </div>{/* /flex wrapper */}

      {/* ═══ FOOTER ═══ */}
      {vis('footer') && (
        <footer className="px-5 md:px-20 py-10 md:py-16 border-t border-[var(--border)] relative" style={{ background: "rgba(0,0,0,0.3)" }}>
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col items-center gap-8 md:gap-10">
              <div className="flex items-center gap-3">
                <LogoSite className="h-12 sm:h-14 md:h-16 w-auto object-contain" />
              </div>

              <div className="flex flex-wrap justify-center gap-x-5 sm:gap-x-8 gap-y-3">
                {(foot.links || []).map((link: { label: string; href: string }) => (
                  <Link key={link.label} href={link.href} className="text-[10px] sm:text-xs tracking-[0.1em] sm:tracking-[0.15em] uppercase text-[var(--text-muted)] hover:text-[var(--brand)] transition-colors duration-300 gold-underline">
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
                &copy; {foot.copyright_year || '2026'} {foot.name || 'SOS Shine\u00ae'}{foot.copyright_suffix || ' - Tous droits réservés'}
              </p>
            </div>
          </div>
        </footer>
      )}

    </main>
  );
}
