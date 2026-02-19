"use client";

import Link from "next/link";
import { useEffect, useState, ReactNode, useCallback } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { CTAButton } from "@/components/ui/CTAButton";
import { LANDING_DEFAULTS, buildSectionMap } from "@/lib/landing-defaults";
import type { LandingSectionDefault, SectionContent, SectionStyles } from "@/lib/landing-defaults";

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

function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] as unknown as [number, number, number, number] }}
      className={className}
    >
      {children}
    </motion.div>
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

/* ─── Sparkling Diamonds Overlay ─── */
const DIAMONDS = [
  { top: '3%', left: '8%', duration: '7s', delay: '0s', size: 5 },
  { top: '7%', left: '85%', duration: '9s', delay: '1.2s', size: 4 },
  { top: '12%', left: '45%', duration: '6s', delay: '2.8s', size: 3 },
  { top: '18%', left: '92%', duration: '8s', delay: '0.5s', size: 5 },
  { top: '22%', left: '15%', duration: '10s', delay: '3.5s', size: 4 },
  { top: '28%', left: '72%', duration: '7s', delay: '1.8s', size: 3 },
  { top: '33%', left: '5%', duration: '9s', delay: '4.2s', size: 5 },
  { top: '38%', left: '55%', duration: '6s', delay: '0.8s', size: 4 },
  { top: '42%', left: '88%', duration: '8s', delay: '2.5s', size: 3 },
  { top: '48%', left: '28%', duration: '7s', delay: '1.5s', size: 5 },
  { top: '52%', left: '68%', duration: '10s', delay: '3.8s', size: 4 },
  { top: '56%', left: '10%', duration: '6s', delay: '0.3s', size: 3 },
  { top: '62%', left: '78%', duration: '9s', delay: '2.1s', size: 5 },
  { top: '67%', left: '38%', duration: '7s', delay: '4.5s', size: 4 },
  { top: '72%', left: '95%', duration: '8s', delay: '1.1s', size: 3 },
  { top: '76%', left: '22%', duration: '6s', delay: '3.2s', size: 5 },
  { top: '82%', left: '62%', duration: '10s', delay: '0.7s', size: 4 },
  { top: '87%', left: '3%', duration: '7s', delay: '2.9s', size: 3 },
  { top: '91%', left: '82%', duration: '9s', delay: '1.6s', size: 5 },
  { top: '96%', left: '48%', duration: '6s', delay: '4.0s', size: 4 },
];

function SparklingDiamonds() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      {DIAMONDS.map((d, i) => (
        <div key={i} className="diamond-sparkle" style={{
          top: d.top,
          left: d.left,
          width: d.size + 'px',
          height: d.size + 'px',
          ['--duration' as string]: d.duration,
          ['--delay' as string]: d.delay,
        }} />
      ))}
    </div>
  );
}

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
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
          if (row) {
            merged[d.section_key] = { content: row.content, styles: row.styles, is_visible: row.is_visible };
          } else {
            merged[d.section_key] = { content: d.content, styles: d.styles, is_visible: d.is_visible };
          }
        }
        // Include any extra sections from DB not in defaults
        for (const row of rows) {
          if (!merged[row.section_key]) {
            merged[row.section_key] = { content: row.content, styles: row.styles, is_visible: row.is_visible };
          }
        }
        setSections(merged);
      } else {
        // Empty result — use defaults
        const fallbackMap = buildSectionMap(LANDING_DEFAULTS);
        const map: Record<string, { content: SectionContent; styles: SectionStyles; is_visible: boolean }> = {};
        for (const key of Object.keys(fallbackMap)) {
          const d = fallbackMap[key];
          map[key] = { content: d.content, styles: d.styles, is_visible: d.is_visible };
        }
        setSections(map);
      }
    } catch {
      // Use defaults if sections can't be loaded
      const fallbackMap = buildSectionMap(LANDING_DEFAULTS);
      const map: Record<string, { content: SectionContent; styles: SectionStyles; is_visible: boolean }> = {};
      for (const key of Object.keys(fallbackMap)) {
        const d = fallbackMap[key];
        map[key] = { content: d.content, styles: d.styles, is_visible: d.is_visible };
      }
      setSections(map);
    }
  }, []);

  useEffect(() => {
    loadSections();
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [loadSections]);

  // ── Section helpers ──
  function sec(key: string): SectionContent { return sections[key]?.content || {}; }
  function sty(key: string): SectionStyles { return sections[key]?.styles || {}; }
  function vis(key: string): boolean { return sections[key]?.is_visible !== false; }

  // ── Dynamic colors from global section ──
  const g = sty('_global');
  const gold = g.color_primary || '#D4AF37';
  const accent = g.color_secondary || '#74C0FC';
  const bg = g.color_bg || '#362038';
  const buttonBg = g.color_button || gold;
  const goldRgb = hexToRgb(gold);
  const accentRgb = hexToRgb(accent);

  // Derive a deeper version of gold for gradient
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

  // ── Style helpers ──
  const fontMap: Record<string, string> = {
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

  // ── Extract section data ──
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

  // CSS custom properties set from admin colors
  const cssVars = {
    "--gold": gold,
    "--gold-deep": goldDeep,
    "--gold-light": goldHover,
    "--accent": accent,
    "--bg": bg,
    "--dark": bg,
    "--button-bg": buttonBg,
  } as React.CSSProperties;

  return (
    <main className="grain relative z-0 overflow-hidden" style={cssVars}>

      {/* Sparkling Diamonds */}
      <SparklingDiamonds />

      {/* HERO */}
      {vis('hero') && (
        <section className="relative min-h-screen flex items-center">
          <div className="absolute inset-0 pointer-events-none" style={{ transform: `translateY(${scrollY * 0.15}px)` }}>
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-[0.03] blur-[150px]" style={{ background: gold }} />
          </div>

          <div className="relative z-10 px-6 md:px-20 py-24 max-w-5xl mx-auto w-full">
            {/* Logo */}
            <Reveal>
              <div className="flex items-center gap-3 mb-12">
                {logoUrl ? (
                  <img src={logoUrl} alt="SOS Shine" className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center font-display text-xl font-semibold" style={{ background: `linear-gradient(135deg, ${gold}, ${goldDeep})`, color: bg }}>S</div>
                )}
                <span className="font-display text-2xl font-medium" style={{ color: gold }}>{globalContent.site_name || 'SOS Shine'}</span>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <h1 className="font-display font-light leading-[1.1] mb-6" style={tStyle("hero")}>
                {(hero.title || '').split("\n").map((line: string, i: number) => (
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
              <p className="text-xl md:text-2xl text-[var(--text-secondary)] leading-relaxed max-w-2xl font-light mb-8" style={{
                fontFamily: fontMap[heroSty.text_font] || undefined,
                textAlign: (heroSty.text_align as "left" | "center" | "right") || undefined,
              }}>
                {hero.subtitle || ''}
              </p>
            </Reveal>

            {/* Video */}
            <Reveal delay={0.3}>
              <div className="glass overflow-hidden mb-10 max-w-3xl">
                {hero.video_url ? (
                  <video src={hero.video_url} controls className="w-full aspect-video" poster="" />
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
                {(hero.buttons || []).map((btn: { label: string; href: string; variant: string }, i: number) => (
                  <Link key={i} href={btn.href}>
                    <CTAButton
                      variant={btn.variant === 'outline' ? 'outline' : 'primary'}
                      style={btn.variant === 'outline'
                        ? { border: `1px solid rgba(${goldRgb},0.4)`, color: gold }
                        : { background: buttonBg, color: bg }}
                    >
                      {btn.label}{btn.variant === 'primary' ? ` \u2014 ${trialDays} jours d\u2019essai` : ''}
                    </CTAButton>
                  </Link>
                ))}
              </div>
            </Reveal>
          </div>

          {hero.image_url && (
            <Reveal delay={0.5}><div className="relative z-10 px-6 md:px-20 max-w-5xl mx-auto w-full mt-4">
              <img src={hero.image_url} alt="" className="w-full rounded-2xl object-cover max-h-96" style={{ border: '1px solid var(--dark-border)' }} />
            </div></Reveal>
          )}

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
            <span className="block w-px h-8 bg-gradient-to-b from-[var(--text-muted)] to-transparent animate-pulse" />
          </div>
        </section>
      )}

      {/* LE PRINCIPE */}
      {vis('principe') && (
        <section className="px-6 md:px-20 py-28 border-t border-[var(--dark-border)]">
          <div className="max-w-3xl mx-auto text-center">
            <Reveal><GoldDivider /><p className="text-sm tracking-[0.3em] text-[var(--text-muted)] uppercase mt-6 mb-8">{principe.label || ''}</p></Reveal>
            {principe.image_url && <Reveal delay={0.05}><img src={principe.image_url} alt="" className="w-full rounded-2xl object-cover max-h-72 mb-8" style={{ border: '1px solid var(--dark-border)' }} /></Reveal>}
            {principe.video_url && <Reveal delay={0.05}><video src={principe.video_url} controls className="w-full rounded-2xl max-h-72 mb-8 bg-black" /></Reveal>}
            <Reveal delay={0.1}>
              <h2 className="font-display font-light leading-tight mb-8" style={tStyle("principe")}>
                {(principe.title || '').split("\n").map((line: string, i: number) => (
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
              <p className="text-lg text-[var(--text-secondary)] leading-relaxed font-light max-w-xl mx-auto" style={{
                fontFamily: fontMap[sty('principe').text_font] || undefined,
                textAlign: (sty('principe').text_align as "left" | "center" | "right") || undefined,
              }}>
                {principe.description || ''}
              </p>
            </Reveal>
          </div>
        </section>
      )}

      {/* LES ETAPES */}
      {vis('steps') && (
        <section className="px-6 md:px-20 py-28 border-t border-[var(--dark-border)]">
          <div className="max-w-5xl mx-auto">
            <Reveal>
              <GoldDivider />
              <p className="text-center text-sm tracking-[0.3em] text-[var(--text-muted)] uppercase mt-6 mb-4">{stepsData.label || ''}</p>
              <h2 className="font-display font-light mb-16" style={tStyle("steps")}>{stepsData.title || ''}</h2>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-6">
              {(stepsData.items || []).map((step: { num: string; title: string; description: string; color: string }, i: number) => (
                <Reveal key={step.num} delay={i * 0.1}>
                  <div className="glass glass-hover relative p-8 h-full"
                    style={{ borderColor: `${step.color}20` }}>
                    <div className="mb-4">
                      <span className="font-display text-sm font-light block" style={{ color: step.color, opacity: 0.6 }}>{"\u00c9tape "}{step.num}</span>
                      <h3 className="font-display text-xl font-medium" style={{ color: step.color }}>{step.title}</h3>
                    </div>
                    <p className="text-[var(--text-secondary)] leading-relaxed text-[15px] font-light">{step.description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* L'ENCYCLOPEDIE */}
      {vis('encyclopedie') && (
        <section className="px-6 md:px-20 py-28 border-t border-[var(--dark-border)]">
          <div className="max-w-4xl mx-auto">
            <Reveal>
              <GoldDivider />
              <p className="text-center text-sm tracking-[0.3em] text-[var(--text-muted)] uppercase mt-6 mb-4">{encyclo.label || "L\u2019encyclop\u00e9die"}</p>
              <h2 className="font-display font-light mb-6" style={tStyle("encyclopedie")}>
                {encyclo.title || ''}
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-lg text-[var(--text-secondary)] font-light leading-relaxed mb-12 max-w-2xl mx-auto" style={{ textAlign: (sty('encyclopedie').text_align as "left" | "center" | "right") || "center" }}>
                {encyclo.description || ''}
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {(encyclo.items || []).map((d: string, i: number) => (
                  <div key={d} className="glass glass-hover px-4 py-3 text-center text-sm cursor-default"
                    style={{
                      borderColor: i === (encyclo.items || []).length - 1 ? `rgba(${goldRgb},0.2)` : undefined,
                      color: i === (encyclo.items || []).length - 1 ? gold : 'var(--text-secondary)',
                    }}>
                    {d}
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* COMMUNAUTE */}
      {vis('communaute') && (
        <section className="px-6 md:px-20 py-28 border-t border-[var(--dark-border)]">
          <div className="max-w-3xl mx-auto">
            {comm.image_url && <Reveal><img src={comm.image_url} alt="" className="w-full rounded-2xl object-cover max-h-72 mb-8" style={{ border: '1px solid var(--dark-border)' }} /></Reveal>}
            <Reveal>
              <h2 className="font-display font-light leading-tight mb-6" style={tStyle("communaute")}>
                {comm.title || ''}
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-lg text-[var(--text-secondary)] font-light leading-relaxed mb-16 max-w-xl mx-auto" style={{ textAlign: (sty('communaute').text_align as "left" | "center" | "right") || "center" }}>
                {comm.description || ''}
              </p>
            </Reveal>
            <div className="space-y-5">
              {(comm.blocks || []).filter((b: { title: string; description: string }) => b.title).map((item: { title: string; description: string }, i: number) => (
                <Reveal key={item.title} delay={i * 0.1}>
                  <div className="glass glass-hover p-6 md:p-8" style={{ borderColor: `rgba(${goldRgb},0.1)` }}>
                    <h3 className="font-display text-xl font-medium mb-3" style={{ color: gold }}>{item.title}</h3>
                    <p className="text-[var(--text-secondary)] leading-relaxed text-[15px] font-light">{item.description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TEMOIGNAGES */}
      {vis('temoignages') && (
        <section className="px-6 md:px-20 py-28 border-t border-[var(--dark-border)]">
          <div className="max-w-4xl mx-auto">
            <Reveal>
              <GoldDivider />
              <p className="text-center text-sm tracking-[0.3em] text-[var(--text-muted)] uppercase mt-6 mb-16">{temos.label || ''}</p>
            </Reveal>
            <div className="grid md:grid-cols-2 gap-8">
              {(temos.items || []).filter((t: { quote: string; name: string; city: string }) => t.quote).map((t: { quote: string; name: string; city: string }, i: number) => (
                <Reveal key={i} delay={i * 0.1}>
                  <div className="glass glass-hover p-6 md:p-8 h-full flex flex-col justify-between">
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
      )}

      {/* OFFRES */}
      {vis('pricing') && (
        <section className="px-6 md:px-20 py-28 border-t border-[var(--dark-border)]">
          <div className="max-w-4xl mx-auto">
            <Reveal>
              <GoldDivider />
              <h2 className="font-display font-light mt-6 mb-4" style={tStyle("pricing")}>{pricing.title || ''}</h2>
              <p className="text-[var(--text-secondary)] font-light mb-16" style={{ textAlign: (sty('pricing').title_align as "left" | "center" | "right") || "center" }}>
                {pricing.subtitle || ''}
              </p>
            </Reveal>

            <div className="grid md:grid-cols-2 gap-6">
              {(pricing.plans || []).map((plan: { name: string; price: string; period: string; button_label: string; button_href: string; highlight: boolean; badge: string; features: string[] }, idx: number) => (
                <Reveal key={plan.name} delay={(idx + 1) * 0.1}>
                  <div className="glass glass-hover p-8 md:p-10 h-full flex flex-col relative overflow-hidden"
                    style={{ borderColor: plan.highlight ? `rgba(${accentRgb},0.15)` : `rgba(${goldRgb},0.12)` }}>
                    {plan.badge && (
                      <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium" style={{ background: `rgba(${accentRgb},0.15)`, color: accent }}>
                        {plan.badge}
                      </div>
                    )}
                    <p className="text-sm tracking-[0.2em] text-[var(--text-muted)] uppercase mb-4">{plan.name}</p>
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="font-display text-5xl font-light" style={{ color: plan.highlight ? accent : gold }}>{plan.price}{"\u20ac"}</span>
                      <span className="text-[var(--text-muted)] text-sm">{plan.period}</span>
                    </div>
                    <div className="space-y-3 flex-1 mb-8">
                      {(plan.features || []).map((f: string) => (
                        <div key={f} className="flex items-start gap-3">
                          <span className="mt-0.5 text-sm" style={{ color: plan.highlight ? accent : gold }}>{"\u25c6"}</span>
                          <span className="text-[var(--text-secondary)] text-[15px] font-light">{f}</span>
                        </div>
                      ))}
                    </div>
                    <Link href={plan.button_href || '/signup'}>
                      <CTAButton
                        variant={plan.highlight ? 'accent' : 'primary'}
                        fullWidth
                        style={{ background: plan.highlight ? accent : buttonBg, color: bg }}
                      >
                        {plan.button_label}
                      </CTAButton>
                    </Link>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.3}>
              <p className="text-center text-xs text-[var(--text-muted)] mt-6 font-light italic">
                {pricing.footer || ''}
              </p>
            </Reveal>
          </div>
        </section>
      )}

      {/* CTA FINAL — Section 1 : Titre sombre */}
      {vis('cta_dark') && (
        <section className="px-6 md:px-20 py-32 border-t border-[var(--dark-border)] relative">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-[0.03] blur-[120px]" style={{ background: gold }} />
          </div>
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <Reveal><GoldDivider /></Reveal>
            {ctaDark.image_url && <Reveal delay={0.05}><img src={ctaDark.image_url} alt="" className="w-48 h-48 rounded-2xl object-cover mx-auto mt-8 mb-4" /></Reveal>}
            <Reveal delay={0.1}>
              <p className="font-display font-light leading-tight mt-12 mb-8" style={tStyle("cta_dark")}>
                {(ctaDark.title || '').split("\n").map((line: string, i: number) => (
                  <span key={i}>
                    {i > 0 && <br />}
                    {line.includes("seul") || line.includes("jamais") || line.includes("temp\u00eates") ? (
                      <em className="font-light" style={{ color: gold }}>{line}</em>
                    ) : line}
                  </span>
                ))}
              </p>
            </Reveal>
          </div>
        </section>
      )}

      {/* CTA FINAL — Section 2 : Description fond blanc */}
      {vis('cta_light') && (
        <section className="px-6 md:px-20 py-24" style={{ background: sty('cta_light').bg || '#ffffff' }}>
          <div className="max-w-3xl mx-auto text-center">
            <Reveal>
              <p className="text-lg md:text-xl leading-relaxed font-light" style={{ color: sty('cta_light').text_color || '#1a1a1a', fontFamily: "'DM Sans', sans-serif" }}>
                {ctaLight.description || ''}
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-10">
                <Link href={ctaLight.button_href || '/signup'}>
                  <CTAButton size="lg" style={{ background: buttonBg, color: '#ffffff' }}>
                    {ctaLight.button_label || ''}
                  </CTAButton>
                </Link>
              </div>
            </Reveal>
            <Reveal delay={0.25}>
              <p className="text-xs mt-6 tracking-wide" style={{ color: sty('cta_light').muted_color || '#6b7280' }}>
                {trialDays}{" jours gratuits (Essentiel) \u2014 Puis "}{(pricing.plans || [])[0]?.price || '29,90'}{"\u20ac/mois \u2014 Sans engagement"}
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="mt-8">
                <Link href="/login" className="text-sm transition-colors duration-300 underline underline-offset-4" style={{ color: sty('cta_light').muted_color || '#6b7280' }}>
                  {ctaLight.login_text || "D\u00e9j\u00e0 membre ? Se connecter"}
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* FOOTER */}
      {vis('footer') && (
        <footer className="px-6 md:px-20 py-12 border-t border-[var(--dark-border)]">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img src={logoUrl} alt="SOS Shine" className="w-8 h-8 rounded-lg object-cover" />
              ) : null}
              <span className="font-display text-xl font-medium" style={{ color: gold }}>{foot.name || 'SOS Shine'}</span>
              <span className="text-[var(--text-muted)] text-xs">{"\u00a9 "}{foot.copyright_year || '2026'}</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-[var(--text-muted)]">
              {(foot.links || []).map((link: { label: string; href: string }) => (
                <Link key={link.href} href={link.href} className="gold-underline transition-colors">{link.label}</Link>
              ))}
            </div>
          </div>
        </footer>
      )}
    </main>
  );
}
