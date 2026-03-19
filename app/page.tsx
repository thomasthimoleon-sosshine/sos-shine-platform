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

const FAQ_ITEMS = [
  {
    q: "Est-ce que SOS Shine remplace un thérapeute ?",
    a: "Non. SOS Shine est un complément, pas un substitut. Nos protocoles sont créés par des thérapeutes certifiés, mais nous recommandons de consulter un professionnel de santé si nécessaire.",
  },
  {
    q: "Comment fonctionne l'essai gratuit ?",
    a: "Vous accédez à tout le contenu de votre formule pendant 7 jours. Si ça ne vous convient pas, annulez en un clic — zéro prélèvement, zéro question.",
  },
  {
    q: "C'est quoi exactement un protocole en 3 étapes ?",
    a: "Pour chaque blessure émotionnelle, nos thérapeutes ont créé : une vidéo pour comprendre l'origine du blocage, une séance guidée pour libérer l'émotion, et des exercices concrets pour ancrer la transformation. Vous avancez à votre rythme.",
  },
  {
    q: "Mes données sont-elles protégées ?",
    a: "Vos données ne sont jamais vendues ni partagées. Vous pouvez utiliser un pseudo dans la communauté. Tout est chiffré et confidentiel.",
  },
  {
    q: "Qui crée les contenus ?",
    a: "Julia (thérapeute holistique), William (hypnose et médecine chinoise) et Thomas (protocoles pratiques). Chaque protocole combine leurs trois expertises : âme, corps et esprit.",
  },
  {
    q: "Je peux annuler quand je veux ?",
    a: "Oui. Aucun engagement, aucune condition cachée. Annulation en un clic depuis votre espace membre. Si on doit vous retenir par un contrat, c'est qu'on n'a pas fait notre travail.",
  },
];

function FAQItem({ item, isOpen, onToggle }: { item: { q: string; a: string }; isOpen: boolean; onToggle: () => void }) {
  return (
    <div
      className="glow-card mb-3"
      style={{ borderRadius: '1rem' }}
    >
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

export default function Home() {
  const { t } = useTranslation();
  const [headerVisible, setHeaderVisible] = useState(true);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showMobileCta, setShowMobileCta] = useState(false);
  const [encyclopediaSearch, setEncyclopediaSearch] = useState('');
  const [allDouleurs, setAllDouleurs] = useState<{ title: string; slug: string; category?: string | null; is_published?: boolean; is_original?: boolean }[]>([]);
  const lastScrollYRef = useRef(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const [videoMuted, setVideoMuted] = useState(true);

  const [prelaunchEnabled, setPrelaunchEnabled] = useState<boolean | null>(null);
  const [prelaunchSettings, setPrelaunchSettings] = useState<PrelaunchSettings>({});

  // Early access emails that bypass the pre-launch page (for real-condition testing)
  const EARLY_ACCESS_EMAILS = ['cabritjulia@gmail.com'];

  const [sections, setSections] = useState<Record<string, { content: SectionContent; styles: SectionStyles; is_visible: boolean }>>(() => {
    const map: Record<string, { content: SectionContent; styles: SectionStyles; is_visible: boolean }> = {};
    for (const d of LANDING_DEFAULTS) {
      map[d.section_key] = { content: d.content, styles: d.styles, is_visible: d.is_visible };
    }
    return map;
  });

  const loadPrelaunchSettings = useCallback(async () => {
    try {
      const supabase = createClient();

      // Check if current user has early access
      const { data: { user } } = await supabase.auth.getUser();
      const hasEarlyAccess = user?.email && EARLY_ACCESS_EMAILS.includes(user.email.toLowerCase());

      // Also check for early access token in URL/localStorage
      const params = new URLSearchParams(window.location.search);
      const earlyAccessToken = params.get('early_access');
      if (earlyAccessToken === 'SHINE2026') {
        localStorage.setItem('sos_early_access', 'true');
      }
      const hasLocalEarlyAccess = localStorage.getItem('sos_early_access') === 'true';

      const { data: settingsData } = await supabase.from("site_settings").select("key, value").like("key", "prelaunch_%");
      if (settingsData && settingsData.length > 0) {
        const map: PrelaunchSettings = {};
        settingsData.forEach((row: { key: string; value: string }) => {
          (map as Record<string, string>)[row.key] = row.value;
        });
        setPrelaunchSettings(map);
        const isPrelaunchOn = (map as Record<string, string>).prelaunch_enabled === 'true';
        // Bypass prelaunch for early access users
        setPrelaunchEnabled(isPrelaunchOn && !hasEarlyAccess && !hasLocalEarlyAccess);
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
      const { data } = await supabase.from("landing_sections").select("*").order("position");
      if (data && data.length > 0) {
        const rows = data as unknown as LandingSectionDefault[];
        const dbMap = buildSectionMap(rows);
        const merged: Record<string, { content: SectionContent; styles: SectionStyles; is_visible: boolean }> = {};
        for (const d of LANDING_DEFAULTS) {
          const row = dbMap[d.section_key];
          merged[d.section_key] = row
            ? { content: { ...d.content, ...row.content }, styles: { ...d.styles, ...row.styles }, is_visible: row.is_visible }
            : { content: d.content, styles: d.styles, is_visible: d.is_visible };
        }
        for (const row of rows) {
          if (!merged[row.section_key]) {
            merged[row.section_key] = { content: row.content, styles: row.styles, is_visible: row.is_visible };
          }
        }
        setSections(merged);
      }

      // Fetch all douleurs for the encyclopedie preview
      const { data: douleursData } = await supabase
        .from('douleurs')
        .select('title, slug, category, is_published, is_original')
        .eq('is_active', true)
        .order('title', { ascending: true });
      if (douleursData && douleursData.length > 0) {
        setAllDouleurs(douleursData);
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

    // Show mobile CTA after scrolling past hero
    const onScrollMobileCta = () => {
      setShowMobileCta(window.scrollY > 600);
    };
    window.addEventListener("scroll", onScrollMobileCta, { passive: true });

    // Re-fetch prelaunch settings when tab becomes visible (after admin edits in another tab)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadPrelaunchSettings();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", onScrollMobileCta);
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

  const ticker1Data = sec('ticker_1');
  const ticker2Data = sec('ticker_2');
  const tickerItems = (Array.isArray(ticker1Data.items) && ticker1Data.items.length > 0)
    ? ticker1Data.items
    : [t('ticker.abuse'), t('ticker.self_love'), t('ticker.burnout'), t('ticker.confidence'), t('ticker.dependency'), t('ticker.grief'), t('ticker.breakup')];
  const ticker1Speed = ticker1Data.speed || 35;
  const ticker2Items = (Array.isArray(ticker2Data.items) && ticker2Data.items.length > 0)
    ? ticker2Data.items
    : [t('ticker.support'), t('ticker.community'), t('ticker.protocols'), t('ticker.collective'), t('ticker.dedicated_chat'), t('ticker.live_events'), t('ticker.meditation'), t('ticker.coaching')];
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
            <div className="flex items-center justify-between relative px-4 md:px-6 max-w-7xl mx-auto">
              <Link href="/" className="flex items-center gap-3 flex-shrink-0">
                <img src={logoUrl || '/images/logo-shine.png'} alt="SOS Shine" className="h-14 sm:h-18 md:h-24 w-auto object-contain" />
              </Link>

              {/* ── Desktop nav anchors ── */}
              <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
                {[
                  { label: 'Le Principe', id: 'principe' },
                  { label: 'Encyclopédie', id: 'encyclopedie' },
                  { label: 'Témoignages', id: 'temoignages' },
                  { label: 'Communauté', id: 'communaute' },
                  { label: 'Tarifs', id: 'pricing' },
                  { label: 'FAQ', id: 'faq' },
                ].map(nav => (
                  <a
                    key={nav.id}
                    href={`#${nav.id}`}
                    className="text-xs tracking-[0.12em] uppercase font-light transition-colors duration-300 hover:text-[var(--gold)]"
                    style={{ color: 'var(--text-secondary)' }}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(nav.id)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    {nav.label}
                  </a>
                ))}
              </nav>

              <div className="flex items-center gap-3">
                <Link href="/rejoindre" className="hidden sm:inline-flex px-5 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-all duration-300 hover:scale-105" style={{ background: `linear-gradient(135deg, ${gold}, ${goldDeep})`, color: '#050505' }}>
                  Commencer
                </Link>
                <Link href="/login" className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:opacity-90" style={{ border: `1px solid rgba(${goldRgb}, 0.3)`, color: gold }}>
                  Connexion
                </Link>
                <ThemeToggle />
              </div>
            </div>
          </header>
        )}

      {/* ═══ STICKY MOBILE CTA ═══ */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
        initial={{ y: 100 }}
        animate={{ y: showMobileCta ? 0 : 100 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="px-4 py-3 glass-dense" style={{ borderTop: `1px solid rgba(${goldRgb}, 0.15)` }}>
          <Link href="/rejoindre" className="block">
            <button className="magnetic-btn pulse-ring w-full py-3.5 rounded-full text-sm font-semibold tracking-wide" style={{ background: `linear-gradient(135deg, ${gold}, ${goldDeep})`, color: '#050505' }}>
              Essayer gratuitement — {trialDays} jours
            </button>
          </Link>
        </div>
      </motion.div>

      {/* ═══ HERO — Word by word reveal ═══ */}
      {vis('hero') && (
        <motion.section ref={heroRef} className="relative min-h-screen flex items-center pt-20 md:pt-24" style={{ opacity: heroOpacity, scale: heroScale }}>
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] rounded-full opacity-[0.03] blur-[60px] md:blur-[80px]" style={{ background: gold }} />
          </div>

          <div className="relative z-10 px-5 md:px-20 py-12 md:py-24 max-w-6xl mx-auto w-full text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="mb-8"
            >
              <span className="inline-block px-4 py-1.5 rounded-full text-xs tracking-[0.25em] uppercase font-medium" style={{ background: `rgba(${goldRgb}, 0.08)`, color: gold, border: `1px solid rgba(${goldRgb}, 0.15)` }}>
                {t('landing.premium_badge')}
              </span>
            </motion.div>

            <h1 className="font-display font-light leading-[1.08] mb-8" style={{ ...tStyle("hero"), perspective: "1000px" }}>
              {(hero.title || '').split("\n").map((line: string, i: number) => {
                const isHighlight = line.includes("expériences") || line.includes("schémas") || line.includes("potentiel") || line.includes("émotionnels") || line.includes("tempêtes") || line.includes("seul");
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
                <style>{`
                  @keyframes blink-gold {
                    0%, 100% { background: rgba(${goldRgb}, 0.25); box-shadow: 0 0 12px rgba(${goldRgb}, 0.3), inset 0 0 8px rgba(${goldRgb}, 0.1); border-color: rgba(${goldRgb}, 0.5); }
                    50% { background: rgba(${goldRgb}, 0.08); box-shadow: 0 0 4px rgba(${goldRgb}, 0.1); border-color: rgba(${goldRgb}, 0.2); }
                  }
                  .sound-btn-blink {
                    animation: blink-gold 2s ease-in-out infinite;
                    border: 1px solid rgba(${goldRgb}, 0.4) !important;
                    backdrop-filter: blur(16px) saturate(1.2);
                    -webkit-backdrop-filter: blur(16px) saturate(1.2);
                  }
                  .sound-btn-active {
                    animation: none;
                    background: rgba(255, 255, 255, 0.03) !important;
                    border: 1px solid rgba(255, 255, 255, 0.06) !important;
                    backdrop-filter: blur(16px) saturate(1.2);
                    -webkit-backdrop-filter: blur(16px) saturate(1.2);
                    opacity: 0.4;
                    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                  }
                  .sound-btn-active:hover { opacity: 0.85; background: rgba(255, 255, 255, 0.06) !important; }
                  .video-ctrl-btn {
                    backdrop-filter: blur(16px) saturate(1.2);
                    -webkit-backdrop-filter: blur(16px) saturate(1.2);
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                  }
                  .video-ctrl-btn:hover { background: rgba(255, 255, 255, 0.08); border-color: rgba(${goldRgb}, 0.2); }
                `}</style>
                <div className="glass overflow-hidden mb-8 md:mb-10 max-w-3xl mx-auto relative group">
                  <video
                    id="hero-video"
                    ref={(el) => {
                      (heroVideoRef as React.MutableRefObject<HTMLVideoElement | null>).current = el;
                      if (el && !el.dataset.delaySet) {
                        el.dataset.delaySet = '1';
                        setTimeout(() => { el.play().catch(() => {}); }, 5000);
                      }
                    }}
                    src={hero.video_url}
                    muted={videoMuted}
                    loop
                    playsInline
                    preload="auto"
                    className="w-full aspect-video cursor-pointer"
                    onClick={(e) => {
                      const v = e.currentTarget;
                      v.paused ? v.play() : v.pause();
                    }}
                  />
                  {/* Sound toggle – blinks gold when muted, glass when active */}
                  <button
                    type="button"
                    aria-label="Toggle sound"
                    className={`${videoMuted ? 'sound-btn-blink' : 'sound-btn-active'} absolute bottom-3 right-14 z-10 w-8 h-8 rounded-xl flex items-center justify-center transition-all`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setVideoMuted(prev => !prev);
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.85)" strokeWidth={1.5}>
                      {videoMuted ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-3.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-3.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-3.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-3.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                      )}
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
                      e.preventDefault();
                      const video = heroVideoRef.current;
                      if (video) {
                        if (document.fullscreenElement) {
                          document.exitFullscreen();
                        } else if (video.requestFullscreen) {
                          video.requestFullscreen().catch(() => {});
                        } else if ((video as unknown as Record<string, () => void>).webkitEnterFullscreen) {
                          (video as unknown as Record<string, () => void>).webkitEnterFullscreen();
                        } else if ((video as unknown as Record<string, () => void>).webkitRequestFullScreen) {
                          (video as unknown as Record<string, () => void>).webkitRequestFullScreen();
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
                      <p className="text-sm text-[var(--text-secondary)]">{t('landing.discover_video')}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-5 justify-center items-center">
                {(hero.buttons || []).map((btn: { label: string; href: string; variant: string }, i: number) => (
                  <Link key={i} href={btn.href === '/signup' || btn.href === '/login' ? '/rejoindre' : btn.href} className="w-full sm:w-auto">
                    {btn.variant === 'primary' ? (
                      <button className="magnetic-btn pulse-ring w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-full text-sm sm:text-base font-semibold tracking-wide" style={{ background: `linear-gradient(135deg, ${gold}, ${goldDeep})`, color: '#050505' }}>
                        {btn.label} — {trialDays} {t('landing.trial_days')}
                      </button>
                    ) : (
                      <button className="magnetic-btn w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-full text-sm sm:text-base font-medium tracking-wide" style={{ border: `1px solid rgba(${goldRgb},0.3)`, color: gold, background: `rgba(${goldRgb},0.04)` }}>
                        {btn.label}
                      </button>
                    )}
                  </Link>
                ))}
              </div>

              {/* ── Trust signal ── */}
              <div className="flex items-center justify-center gap-4 mt-6 text-xs font-light" style={{ color: 'var(--text-muted)' }}>
                <span className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  Paiement sécurisé
                </span>
                <span className="w-px h-3 bg-[var(--dark-border)]" />
                <span className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  Sans engagement
                </span>
                <span className="w-px h-3 bg-[var(--dark-border)]" />
                <span className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                  Annulation en 1 clic
                </span>
              </div>
            </motion.div>
          </div>

        </motion.section>
      )}

      {/* ═══ SOCIAL PROOF STATS ═══ */}
      <section className="relative py-8 md:py-12 border-y border-[var(--dark-border)]" style={{ background: `rgba(${goldRgb}, 0.015)` }}>
        <div className="max-w-5xl mx-auto px-5 md:px-20">
          <div className="grid grid-cols-3 gap-6 md:gap-8">
            {[
              { value: '50+', label: 'Protocoles thérapeutiques' },
              { value: '3', label: 'Thérapeutes créateurs' },
              { value: '24/7', label: 'Communauté disponible' },
            ].map((stat, i) => (
              <RevealOnScroll key={stat.label} delay={i * 0.1}>
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl md:text-4xl font-display font-light mb-1" style={{ color: gold }}>
                    <AnimatedCounter value={stat.value} />
                  </p>
                  <p className="text-[10px] sm:text-xs tracking-[0.1em] uppercase font-light" style={{ color: 'var(--text-muted)' }}>
                    {stat.label}
                  </p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TICKER BAND ═══ */}
      <InfiniteTickerBand items={tickerItems} speed={ticker1Speed} />

      {/* ═══ LE PRINCIPE ═══ */}
      {vis('principe') && (
        <section id="principe" className="px-5 md:px-20 py-16 md:py-32 relative cv-auto scroll-mt-24">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/4 w-[250px] h-[250px] md:w-[400px] md:h-[400px] rounded-full opacity-[0.02] blur-[40px] md:blur-[60px]" style={{ background: gold }} />
          </div>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <RevealOnScroll>
              <p className="luxury-title text-xs sm:text-sm tracking-[0.3em] sm:tracking-[0.4em] text-[var(--text-muted)] mb-6 md:mb-10">{principe.label || ''}</p>
            </RevealOnScroll>

            {principe.image_url && (
              <RevealOnScroll delay={0.1} direction="scale">
                <img src={principe.image_url} alt="" className="w-full rounded-xl md:rounded-2xl object-cover max-h-48 md:max-h-72 mb-6 md:mb-10" style={{ border: '1px solid var(--dark-border)' }} />
              </RevealOnScroll>
            )}

            <RevealOnScroll delay={0.15}>
              <h2 className="font-display font-light leading-[1.15] mb-6 md:mb-10" style={tStyle("principe")}>
                {(principe.title || '').split("\n").map((line: string, i: number) => (
                  <span key={i} className="block">
                    {i > 0 && <span className="block h-1" />}
                    {line.includes("schémas") || line.includes("challenge") || line.includes("potentiel") || line.includes("libère") || line.includes("blessures") ? (
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
              {(stepsData.items || []).map((step: { num: string; title: string; description: string; color: string }, i: number) => (
                <RevealOnScroll key={step.num} delay={i * 0.15} direction={i === 0 ? "left" : i === 2 ? "right" : "up"}>
                  <GlowingCard className="p-6 md:p-10 h-full" glowColor={`${step.color}25`}>
                    <div className="mb-4 md:mb-6">
                      <span className="step-number-large font-display text-5xl md:text-6xl font-extralight block mb-2" style={{ color: step.color, opacity: 0.15 }}>{step.num}</span>
                      <span className="step-number-label luxury-title text-xs tracking-[0.3em] block mb-2 md:mb-3" style={{ color: step.color, opacity: 0.6 }}>{t('landing.step')} {step.num}</span>
                      <h3 className="font-display text-xl md:text-2xl font-medium">{step.title}</h3>
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

      {/* ═══ TEMOIGNAGES ═══ */}
      {vis('temoignages') && (
        <section id="temoignages" className="px-5 md:px-20 py-16 md:py-32 relative cv-auto scroll-mt-24">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute bottom-0 left-1/3 w-[250px] h-[250px] md:w-[400px] md:h-[400px] rounded-full opacity-[0.02] blur-[40px] md:blur-[60px]" style={{ background: gold }} />
          </div>

          <div className="max-w-5xl mx-auto relative z-10">
            <RevealOnScroll>
              <p className="luxury-title text-center text-xs sm:text-sm tracking-[0.3em] sm:tracking-[0.4em] text-[var(--text-muted)] mb-10 md:mb-20">
                <WordByWordReveal text={temos.label || ''} />
              </p>
            </RevealOnScroll>

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

      {/* ═══ L'ENCYCLOPEDIE ═══ */}
      {vis('encyclopedie') && (
        <section id="encyclopedie" className="px-5 md:px-20 py-16 md:py-32 relative cv-auto scroll-mt-24">
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
                  placeholder={t('landing.search_challenge')}
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

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4">
              {(() => {
                const maxShow = encyclo.show_max || 15;
                // Show only published/original items from DB, or fallback to curated defaults
                const curatedItems = allDouleurs.length > 0
                  ? allDouleurs
                      .filter((d) => d.is_original || d.is_published)
                      .filter((d) => !encyclopediaSearch || d.title.toLowerCase().includes(encyclopediaSearch.toLowerCase()))
                      .slice(0, encyclopediaSearch ? 20 : maxShow)
                  : (encyclo.items || []).map((item: string) => ({ title: item, slug: slugify(item), is_published: true, is_original: true }));
                return curatedItems.map((d: { title: string; slug: string; is_published?: boolean; is_original?: boolean }, i: number) => (
                  <RevealOnScroll key={d.slug} delay={Math.min(i * 0.03, 0.8)} direction="scale">
                    <Link href={`/encyclopedie/${d.slug}`}>
                      <GlowingCard className="px-3 sm:px-5 py-3 sm:py-4 text-center cursor-pointer group relative">
                        <span className="encyclo-item text-xs sm:text-sm font-light transition-colors duration-300 group-hover:text-[var(--gold)]" style={{
                          color: 'var(--text-secondary)',
                        }}>
                          {d.title}
                        </span>
                      </GlowingCard>
                    </Link>
                  </RevealOnScroll>
                ));
              })()}
            </div>

            <RevealOnScroll delay={0.3}>
              <div className="text-center mt-8 md:mt-12">
                <p className="text-sm font-light mb-4" style={{ color: 'var(--text-muted)' }}>
                  {allDouleurs.length > 0 ? `+ ${allDouleurs.length - (encyclo.show_max || 15)} autres protocoles disponibles` : 'Et bien d\u2019autres\u2026'}
                </p>
                <Link href="/encyclopedie">
                  <button className="magnetic-btn px-6 sm:px-8 py-3 sm:py-3.5 rounded-full text-sm font-medium tracking-wide" style={{ border: `1px solid rgba(${goldRgb},0.25)`, color: gold, background: `rgba(${goldRgb},0.04)` }}>
                    {t('landing.explore_encyclopedia')}
                  </button>
                </Link>
              </div>
            </RevealOnScroll>
          </div>
        </section>
      )}

      {/* ═══ COMMUNAUTE ═══ */}
      {vis('communaute') && (
        <section id="communaute" className="px-5 md:px-20 py-16 md:py-32 relative cv-auto scroll-mt-24">
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

      {/* ═══ FONDATEURS ═══ */}
      {vis('fondateurs') && (() => {
        const fond = sec('fondateurs');
        const members = fond.members || [];
        return (
          <section id="fondateurs" className="px-5 md:px-20 py-16 md:py-32 relative cv-auto scroll-mt-24">
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
                {members.map((founder: { name: string; image: string; role: string }, i: number) => (
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
                    </div>
                  </RevealOnScroll>
                ))}
              </div>
            </div>
          </section>
        );
      })()}

      {/* Section livre retirée de la page d'accueil */}

      {/* ═══ OFFRES / PRICING ═══ */}
      {vis('pricing') && (
        <section id="pricing" className="px-5 md:px-20 py-16 md:py-32 relative cv-auto scroll-mt-24">
          <div className="max-w-5xl mx-auto">
            <RevealOnScroll>
              <p className="luxury-title text-center text-xs sm:text-sm tracking-[0.3em] sm:tracking-[0.4em] text-[var(--text-muted)] mb-3 md:mb-4">{t('landing.pricing_label')}</p>
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
              {(pricing.plans || []).map((plan: { name: string; price: string; period: string; button_label: string; button_href: string; highlight: boolean; badge: string; features: string[] }, idx: number) => {
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
                    <p className="luxury-title text-xs sm:text-sm tracking-[0.2em] sm:tracking-[0.25em] mb-4 md:mb-6" style={{ color: tc.main }}>{plan.name}</p>

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

                    <Link href="/rejoindre">
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

            {/* ── Guarantee Badge ── */}
            <RevealOnScroll delay={0.35}>
              <div className="mt-10 md:mt-16 flex flex-col items-center text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-4" style={{ background: `rgba(${goldRgb}, 0.08)`, border: `2px solid rgba(${goldRgb}, 0.2)` }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path d="M9 12l2 2 4-4"/>
                  </svg>
                </div>
                <h3 className="font-display text-lg md:text-xl font-light mb-2" style={{ color: gold }}>Garantie sérénité</h3>
                <p className="text-sm font-light max-w-md" style={{ color: 'var(--text-secondary)' }}>
                  {trialDays} jours d&apos;essai gratuit. Aucun prélèvement pendant la période d&apos;essai. Annulation en un clic, sans justification.
                </p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={0.4}>
              <p className="text-center text-xs text-[var(--text-muted)] mt-6 md:mt-8 font-light italic">{pricing.footer || ''}</p>
            </RevealOnScroll>
          </div>
        </section>
      )}

      {/* ═══ FAQ ═══ */}
      <section id="faq" className="px-5 md:px-20 py-16 md:py-32 relative cv-auto scroll-mt-24">
        <div className="max-w-3xl mx-auto">
          <RevealOnScroll>
            <p className="luxury-title text-center text-xs sm:text-sm tracking-[0.3em] sm:tracking-[0.4em] text-[var(--text-muted)] mb-3 md:mb-4">FAQ</p>
          </RevealOnScroll>
          <RevealOnScroll delay={0.1}>
            <h2 className="font-display font-light text-center mb-4 md:mb-6" style={{ fontSize: 'clamp(2.25rem, 5vw, 3rem)' }}>
              <WordByWordReveal text="Vos questions, nos r\u00e9ponses" />
            </h2>
          </RevealOnScroll>
          <RevealOnScroll delay={0.15}>
            <p className="text-center text-[var(--text-secondary)] font-light mb-10 md:mb-14 text-sm md:text-base max-w-lg mx-auto">
              Une question qui n&apos;est pas ici ? &Eacute;crivez-nous, on r&eacute;pond toujours.
            </p>
          </RevealOnScroll>

          <div>
            {FAQ_ITEMS.map((item, i) => (
              <RevealOnScroll key={i} delay={Math.min(i * 0.05, 0.3)}>
                <FAQItem
                  item={item}
                  isOpen={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                />
              </RevealOnScroll>
            ))}
          </div>

          <RevealOnScroll delay={0.3}>
            <div className="mt-8 md:mt-12 text-center">
              <p className="text-sm font-light mb-4" style={{ color: 'var(--text-muted)' }}>Encore des doutes ?</p>
              <Link href="/contact">
                <button className="magnetic-btn px-6 sm:px-8 py-3 sm:py-3.5 rounded-full text-sm font-medium tracking-wide" style={{ border: `1px solid rgba(${goldRgb},0.25)`, color: gold, background: `rgba(${goldRgb},0.04)` }}>
                  Contactez-nous
                </button>
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </section>

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
              <Link href="/rejoindre">
                <button className="magnetic-btn pulse-ring px-8 sm:px-10 py-4 sm:py-5 rounded-full text-base sm:text-lg font-semibold tracking-wide" style={{ background: `linear-gradient(135deg, ${gold}, ${goldDeep})`, color: '#050505' }}>
                  {t('landing.join_cta')}
                </button>
              </Link>
            </RevealOnScroll>
          </div>
        </section>
      )}

      {/* ═══ CTA LIGHT ═══ */}
      {vis('cta_light') && (
        <section className="px-5 md:px-20 py-16 md:py-32 relative overflow-hidden cv-auto" style={{ background: sty('cta_light').bg || '#ffffff' }}>
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <RevealOnScroll>
              <p className="text-base sm:text-xl md:text-2xl font-light leading-relaxed mb-8 md:mb-12" style={{ color: sty('cta_light').text_color || '#1a1a1a' }}>
                {ctaLight.description || ''}
              </p>
            </RevealOnScroll>
            <RevealOnScroll delay={0.15}>
              <Link href="/rejoindre">
                <button className="magnetic-btn px-8 sm:px-10 py-4 sm:py-5 rounded-full text-base sm:text-lg font-semibold tracking-wide" style={{ background: `linear-gradient(135deg, ${gold}, ${goldDeep})`, color: '#050505' }}>
                  {ctaLight.button_label || t('landing.join_cta')}
                </button>
              </Link>
              <div className="mt-6 md:mt-8">
                <Link href="/login" className="text-sm transition-colors duration-300 underline underline-offset-4" style={{ color: sty('cta_light').muted_color || '#6b7280' }}>
                  {ctaLight.login_text || t('landing.already_member')}
                </Link>
              </div>
            </RevealOnScroll>
          </div>
        </section>
      )}

      {/* ═══ FOOTER — WORLD-CLASS ═══ */}
      {vis('footer') && (
        <footer className="relative overflow-hidden" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%)" }}>

          {/* ── Ambient background elements ── */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[900px] md:h-[900px] rounded-full opacity-[0.015]" style={{ background: 'radial-gradient(circle, var(--gold) 0%, transparent 70%)' }} />
          </div>

          {/* ── Section 1: Manifeste ── */}
          <div className="border-t border-[var(--dark-border)]">
            <div className="max-w-5xl mx-auto px-5 md:px-20 py-12 md:py-20">
              <RevealOnScroll>
                <blockquote className="text-center">
                  <p className="font-display font-light text-lg sm:text-xl md:text-2xl lg:text-3xl italic leading-relaxed" style={{ color: 'var(--gold)' }}>
                    &ldquo;Nous ne guérissons pas. Nous révélons. Ce que vous cherchez est déjà en vous — enfoui sous des années de conditionnements. Notre mission est de vous aider à le retrouver.&rdquo;
                  </p>
                  <footer className="mt-6 md:mt-8">
                    <p className="luxury-title text-[10px] sm:text-xs tracking-[0.3em] text-[var(--text-muted)]">— Julia, William & Thomas</p>
                  </footer>
                </blockquote>
              </RevealOnScroll>
            </div>
          </div>

          {/* ── Section 3: Links & Legal ── */}
          <div className="border-t border-[var(--dark-border)]">
            <div className="max-w-7xl mx-auto px-5 md:px-20 py-10 md:py-14">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-center">

                {/* Logo */}
                <div className="flex justify-center md:justify-start">
                  <img src={logoUrl || '/images/logo-shine.png'} alt="SOS Shine" className="h-14 sm:h-16 md:h-20 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Links */}
                <div className="flex flex-wrap justify-center gap-x-5 sm:gap-x-8 gap-y-3">
                  {(() => {
                    const links: { label: string; href: string }[] = foot.links || [];
                    const hasNotreHistoire = links.some((l: { href: string }) => l.href === '/notre-histoire');
                    const allLinks = hasNotreHistoire ? links : [{ label: 'Notre Histoire', href: '/notre-histoire' }, ...links];
                    return allLinks.map((link: { label: string; href: string }) => (
                      <Link key={link.label} href={link.href} className="text-[10px] sm:text-xs tracking-[0.1em] sm:tracking-[0.15em] uppercase text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors duration-300 gold-underline">
                        {link.label}
                      </Link>
                    ));
                  })()}
                </div>

                {/* Copyright & Social */}
                <div className="text-center md:text-right">
                  <div className="flex items-center justify-center md:justify-end gap-4 mb-3">
                    {[
                      { label: 'Instagram', href: 'https://instagram.com/sosshine', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg> },
                      { label: 'TikTok', href: 'https://tiktok.com/@sosshine', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg> },
                      { label: 'YouTube', href: 'https://youtube.com/@sosshine', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.4 19.6C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 001.94-2A29 29 0 0023 12a29 29 0 00-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none"/></svg> },
                    ].map(social => (
                      <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label} className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110" style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--dark-border)' }}>
                        {social.icon}
                      </a>
                    ))}
                  </div>
                  <p className="text-[10px] tracking-[0.15em] sm:tracking-[0.2em] uppercase text-[var(--text-muted)]">
                    &copy; {foot.copyright_year || '2026'} {foot.name || 'SOS Shine'}
                  </p>
                  <p className="text-[9px] tracking-[0.1em] uppercase text-[var(--text-muted)] mt-1 opacity-50">
                    Votre transformation commence ici
                  </p>
                </div>

              </div>
            </div>
          </div>

        </footer>
      )}

    </main>
  );
}
