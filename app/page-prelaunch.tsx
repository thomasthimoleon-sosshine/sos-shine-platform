"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { PRICES, TOTAL_PRICES, ORIGINAL_PRICES, formatPrice } from "@/lib/stripe";

const DEFAULT_LAUNCH_DATE = "2026-03-22T00:00:00+02:00";

const DIAMONDS = [
  { top: "8%", left: "12%", duration: "9s", delay: "0s", size: 3 },
  { top: "18%", left: "88%", duration: "11s", delay: "1.5s", size: 4 },
  { top: "40%", left: "5%", duration: "8s", delay: "2.8s", size: 3 },
  { top: "55%", left: "92%", duration: "10s", delay: "0.6s", size: 4 },
  { top: "72%", left: "15%", duration: "9s", delay: "3.5s", size: 3 },
  { top: "85%", left: "78%", duration: "7s", delay: "1.2s", size: 4 },
];

function getTimeLeft(launchDate: Date) {
  const now = new Date();
  const diff = launchDate.getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, launched: true };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    launched: false,
  };
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="relative w-[72px] h-[88px] sm:w-[90px] sm:h-[108px] flex items-center justify-center rounded-2xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(212,175,55,0.12)",
          boxShadow: "0 0 40px rgba(212,175,55,0.04), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: -20, opacity: 0, filter: "blur(4px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: 20, opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-4xl sm:text-5xl font-light tabular-nums"
            style={{ color: "#D4AF37" }}
          >
            {String(value).padStart(2, "0")}
          </motion.span>
        </AnimatePresence>
      </div>
      <span
        className="mt-3 text-[10px] sm:text-xs tracking-[0.3em] uppercase font-light"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </span>
    </div>
  );
}

function FloatingOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      <div
        className="orb"
        style={{ width: 600, height: 600, top: "5%", left: "-15%", background: "rgba(212,175,55,0.015)" }}
      />
      <div
        className="orb"
        style={{
          width: 500,
          height: 500,
          bottom: "10%",
          right: "-20%",
          background: "rgba(212,175,55,0.01)",
          animationDelay: "7s",
        }}
      />
      <div
        className="orb"
        style={{
          width: 300,
          height: 300,
          top: "50%",
          left: "40%",
          background: "rgba(212,175,55,0.008)",
          animationDelay: "12s",
        }}
      />
    </div>
  );
}

function SparklingDiamonds() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      {DIAMONDS.map((d, i) => (
        <div
          key={i}
          className="diamond-sparkle"
          style={{
            top: d.top,
            left: d.left,
            width: d.size + "px",
            height: d.size + "px",
            ["--duration" as string]: d.duration,
            ["--delay" as string]: d.delay,
          }}
        />
      ))}
    </div>
  );
}

const DEFAULT_FEATURES = [
  "Encyclop\u00e9die compl\u00e8te des exp\u00e9riences de vie (A-Z)",
  "Vid\u00e9os de coaching immersif",
  "Soins \u00e9nerg\u00e9tiques & m\u00e9ditations",
  "Chat d\u00e9di\u00e9 par challenge \u00e9motionnel",
  "Communaut\u00e9 & mur de partage",
  "Soins collectifs & \u00e9v\u00e9nements",
];

export interface PrelaunchSettings {
  prelaunch_launch_date?: string
  prelaunch_badge?: string
  prelaunch_title_1?: string
  prelaunch_title_2?: string
  prelaunch_title_3?: string
  prelaunch_title_4?: string
  prelaunch_subtitle_1?: string
  prelaunch_subtitle_2?: string
  prelaunch_countdown_label?: string
  prelaunch_launched_text?: string
  prelaunch_countdown_days?: string
  prelaunch_countdown_hours?: string
  prelaunch_countdown_minutes?: string
  prelaunch_countdown_seconds?: string
  prelaunch_pricing_label?: string
  prelaunch_pricing_desc?: string
  prelaunch_price_early?: string
  prelaunch_price_early_label?: string
  prelaunch_price_standard?: string
  prelaunch_price_standard_label?: string
  prelaunch_price_suffix?: string
  prelaunch_price_separator?: string
  prelaunch_no_commitment?: string
  prelaunch_savings_text?: string
  prelaunch_form_name_placeholder?: string
  prelaunch_form_email_placeholder?: string
  prelaunch_form_button?: string
  prelaunch_form_loading?: string
  prelaunch_error_message?: string
  prelaunch_success_title?: string
  prelaunch_success_message?: string
  prelaunch_already_message?: string
  prelaunch_social_proof?: string
  prelaunch_features_label?: string
  prelaunch_feature_1?: string
  prelaunch_feature_2?: string
  prelaunch_feature_3?: string
  prelaunch_feature_4?: string
  prelaunch_feature_5?: string
  prelaunch_feature_6?: string
  prelaunch_login_link?: string
  prelaunch_copyright?: string
  prelaunch_logo?: string
}

function s(settings: PrelaunchSettings, key: keyof PrelaunchSettings, fallback: string): string {
  return settings[key] || fallback;
}

export default function PreLaunchPage({ settings = {} }: { settings?: PrelaunchSettings }) {
  const launchDate = new Date(s(settings, 'prelaunch_launch_date', DEFAULT_LAUNCH_DATE));
  const [time, setTime] = useState(() => getTimeLeft(launchDate));
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "already" | "error">("idle");
  const [waitlistCount, setWaitlistCount] = useState(34);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const interval = setInterval(() => setTime(getTimeLeft(launchDate)), 1000);
    return () => clearInterval(interval);
  }, [launchDate]);

  useEffect(() => {
    fetch("/api/waitlist")
      .then((r) => r.json())
      .then((d) => setWaitlistCount(Math.max(34, d.count || 0)))
      .catch(() => {});
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email || status === "loading") return;

      setStatus("loading");
      try {
        const res = await fetch("/api/waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name }),
        });
        const data = await res.json();

        if (data.message === "already_registered") {
          setStatus("already");
        } else if (res.ok) {
          setStatus("success");
          setWaitlistCount((c) => c + 1);
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    },
    [email, name, status]
  );

  const titleWords = [
    s(settings, 'prelaunch_title_1', 'Quelque chose'),
    s(settings, 'prelaunch_title_2', 'de'),
    s(settings, 'prelaunch_title_3', 'puissant'),
    s(settings, 'prelaunch_title_4', 'arrive.'),
  ];

  const features = [
    s(settings, 'prelaunch_feature_1', DEFAULT_FEATURES[0]),
    s(settings, 'prelaunch_feature_2', DEFAULT_FEATURES[1]),
    s(settings, 'prelaunch_feature_3', DEFAULT_FEATURES[2]),
    s(settings, 'prelaunch_feature_4', DEFAULT_FEATURES[3]),
    s(settings, 'prelaunch_feature_5', DEFAULT_FEATURES[4]),
    s(settings, 'prelaunch_feature_6', DEFAULT_FEATURES[5]),
  ].filter(Boolean);

  const logoUrl = settings.prelaunch_logo || '/images/logo-shine.png';

  return (
    <main className="grain relative z-0 min-h-screen overflow-hidden">
      <FloatingOrbs />
      <SparklingDiamonds />

      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] rounded-full opacity-[0.03] blur-[200px]"
          style={{ background: "#D4AF37" }}
        />
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full opacity-[0.02] blur-[150px]"
          style={{ background: "#D4AF37" }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center min-h-screen px-6">
        {/* Logo */}
        <motion.div
          className="pt-10 sm:pt-16 mb-12 sm:mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link href="/" className="inline-block">
            <img src={logoUrl} alt="SOS Shine" className="h-16 sm:h-20 w-auto" />
          </Link>
        </motion.div>

        {/* Pre-launch badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <span
            className="inline-block px-5 py-2 rounded-full text-[11px] tracking-[0.3em] uppercase font-medium"
            style={{
              background: "rgba(212,175,55,0.08)",
              color: "#D4AF37",
              border: "1px solid rgba(212,175,55,0.15)",
            }}
          >
            {s(settings, 'prelaunch_badge', 'Lancement exclusif')}
          </span>
        </motion.div>

        {/* Hero Title */}
        <div className="text-center max-w-3xl mb-10">
          <div className="font-display font-light leading-[1.1] mb-6" style={{ perspective: "1000px", fontSize: "clamp(2.5rem, 6vw, 4rem)", color: "#D4AF37" }}>
            {titleWords.map((word, i) => (
              <motion.span
                key={i}
                className={`inline-block mr-[0.35em] ${i === 2 ? "text-shimmer" : ""}`}
                initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.7, delay: 0.3 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                {word}
              </motion.span>
            ))}
          </div>

          <motion.p
            className="text-lg sm:text-xl font-light leading-relaxed max-w-xl mx-auto"
            style={{ color: "var(--text-secondary)" }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {s(settings, 'prelaunch_subtitle_1', "L\u2019encyclop\u00e9die compl\u00e8te des challenges \u00e9motionnels.")}
            <br />
            {s(settings, 'prelaunch_subtitle_2', "Un espace pour comprendre, apaiser et ne plus jamais \u00eatre seul.")}
          </motion.p>
        </div>

        {/* Countdown */}
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
        >
          <p
            className="text-center text-[11px] tracking-[0.35em] uppercase mb-6 font-light"
            style={{ color: "var(--text-muted)" }}
          >
            {s(settings, 'prelaunch_countdown_label', 'Ouverture le 22 mars 2026 \u00e0 minuit')}
          </p>

          {!time.launched ? (
            <div className="flex items-center gap-3 sm:gap-5">
              <CountdownUnit value={time.days} label={s(settings, 'prelaunch_countdown_days', 'Jours')} />
              <span className="font-display text-2xl sm:text-3xl font-light mt-[-24px]" style={{ color: "rgba(212,175,55,0.25)" }}>:</span>
              <CountdownUnit value={time.hours} label={s(settings, 'prelaunch_countdown_hours', 'Heures')} />
              <span className="font-display text-2xl sm:text-3xl font-light mt-[-24px]" style={{ color: "rgba(212,175,55,0.25)" }}>:</span>
              <CountdownUnit value={time.minutes} label={s(settings, 'prelaunch_countdown_minutes', 'Minutes')} />
              <span className="font-display text-2xl sm:text-3xl font-light mt-[-24px]" style={{ color: "rgba(212,175,55,0.25)" }}>:</span>
              <CountdownUnit value={time.seconds} label={s(settings, 'prelaunch_countdown_seconds', 'Secondes')} />
            </div>
          ) : (
            <div className="text-center">
              <span className="font-display text-3xl font-light text-shimmer">
                {s(settings, 'prelaunch_launched_text', 'Les portes sont ouvertes')}
              </span>
            </div>
          )}
        </motion.div>

        {/* Pricing plans */}
        <motion.div
          className="w-full max-w-5xl mb-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <p
            className="text-center text-[11px] tracking-[0.35em] uppercase mb-8 font-medium"
            style={{ color: "var(--text-muted)" }}
          >
            Nos offres
          </p>

          {/* Monthly plans */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {/* Essentiel */}
            <div
              className="glass p-6 sm:p-8 text-center relative overflow-hidden rounded-2xl"
              style={{ borderColor: "rgba(212,175,55,0.08)" }}
            >
              <p className="text-[11px] tracking-[0.25em] uppercase font-medium mb-4" style={{ color: "var(--text-muted)" }}>
                Essentiel
              </p>
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="font-display text-4xl sm:text-5xl font-light" style={{ color: "#D4AF37" }}>
                  {formatPrice(PRICES.essential.monthly)}
                </span>
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>/mois</span>
              </div>
              <p className="text-xs font-light" style={{ color: "var(--text-secondary)" }}>
                Sans engagement
              </p>
            </div>

            {/* Sérénité */}
            <div
              className="glass p-6 sm:p-8 text-center relative overflow-hidden rounded-2xl"
              style={{ borderColor: "rgba(212,175,55,0.2)" }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)" }}
              />
              <span
                className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] tracking-wider uppercase font-medium"
                style={{ background: "rgba(212,175,55,0.12)", color: "#D4AF37", border: "1px solid rgba(212,175,55,0.2)" }}
              >
                Populaire
              </span>
              <p className="text-[11px] tracking-[0.25em] uppercase font-medium mb-4" style={{ color: "#D4AF37" }}>
                S&eacute;r&eacute;nit&eacute;
              </p>
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="font-display text-4xl sm:text-5xl font-light" style={{ color: "#D4AF37" }}>
                  {formatPrice(PRICES.serenite.monthly)}
                </span>
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>/mois</span>
              </div>
              <p className="text-xs font-light mb-4" style={{ color: "var(--text-secondary)" }}>
                Sans engagement
              </p>
              <div className="space-y-1.5 text-left">
                <div className="flex justify-between text-[11px]" style={{ color: "var(--text-secondary)" }}>
                  <span>3 mois <span style={{ color: "#D4AF37" }}>-10%</span></span>
                  <span><span className="font-medium" style={{ color: "#D4AF37" }}>{formatPrice(TOTAL_PRICES.serenite.quarterly)}</span> <span className="line-through opacity-50">{formatPrice(ORIGINAL_PRICES.serenite.quarterly)}</span></span>
                </div>
                <div className="flex justify-between text-[11px]" style={{ color: "var(--text-secondary)" }}>
                  <span>6 mois <span style={{ color: "#D4AF37" }}>-20%</span></span>
                  <span><span className="font-medium" style={{ color: "#D4AF37" }}>{formatPrice(TOTAL_PRICES.serenite.semiannual)}</span> <span className="line-through opacity-50">{formatPrice(ORIGINAL_PRICES.serenite.semiannual)}</span></span>
                </div>
                <div className="flex justify-between text-[11px]" style={{ color: "var(--text-secondary)" }}>
                  <span>12 mois <span style={{ color: "#D4AF37" }}>-30%</span></span>
                  <span><span className="font-medium" style={{ color: "#D4AF37" }}>{formatPrice(TOTAL_PRICES.serenite.annual)}</span> <span className="line-through opacity-50">{formatPrice(ORIGINAL_PRICES.serenite.annual)}</span></span>
                </div>
              </div>
            </div>

            {/* Premium */}
            <div
              className="glass p-6 sm:p-8 text-center relative overflow-hidden rounded-2xl"
              style={{ borderColor: "rgba(212,175,55,0.08)" }}
            >
              <p className="text-[11px] tracking-[0.25em] uppercase font-medium mb-4" style={{ color: "var(--text-muted)" }}>
                Premium
              </p>
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="font-display text-4xl sm:text-5xl font-light" style={{ color: "#D4AF37" }}>
                  {formatPrice(PRICES.premium.monthly)}
                </span>
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>/mois</span>
              </div>
              <p className="text-xs font-light mb-4" style={{ color: "var(--text-secondary)" }}>
                Sans engagement
              </p>
              <div className="space-y-1.5 text-left">
                <div className="flex justify-between text-[11px]" style={{ color: "var(--text-secondary)" }}>
                  <span>3 mois <span style={{ color: "#D4AF37" }}>-10%</span></span>
                  <span><span className="font-medium" style={{ color: "#D4AF37" }}>{formatPrice(TOTAL_PRICES.premium.quarterly)}</span> <span className="line-through opacity-50">{formatPrice(ORIGINAL_PRICES.premium.quarterly)}</span></span>
                </div>
                <div className="flex justify-between text-[11px]" style={{ color: "var(--text-secondary)" }}>
                  <span>6 mois <span style={{ color: "#D4AF37" }}>-20%</span></span>
                  <span><span className="font-medium" style={{ color: "#D4AF37" }}>{formatPrice(TOTAL_PRICES.premium.semiannual)}</span> <span className="line-through opacity-50">{formatPrice(ORIGINAL_PRICES.premium.semiannual)}</span></span>
                </div>
                <div className="flex justify-between text-[11px]" style={{ color: "var(--text-secondary)" }}>
                  <span>12 mois <span style={{ color: "#D4AF37" }}>-30%</span></span>
                  <span><span className="font-medium" style={{ color: "#D4AF37" }}>{formatPrice(TOTAL_PRICES.premium.annual)}</span> <span className="line-through opacity-50">{formatPrice(ORIGINAL_PRICES.premium.annual)}</span></span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-sm font-light" style={{ color: "var(--text-secondary)" }}>
            Sans engagement &mdash; Annulable &agrave; tout instant
          </p>
        </motion.div>

        {/* Waitlist Form */}
        <motion.div
          className="w-full max-w-lg mb-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {status === "success" ? (
            <motion.div
              className="glass p-8 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              style={{ borderColor: "rgba(212,175,55,0.15)" }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.2)" }}
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="#D4AF37" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <div className="font-display text-2xl font-light mb-3" style={{ color: "#D4AF37" }}>
                {s(settings, 'prelaunch_success_title', 'Bienvenue parmi les fondateurs')}
              </div>
              <p className="text-sm font-light leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {s(settings, 'prelaunch_success_message', "Votre place est r\u00e9serv\u00e9e. Vous recevrez un email le jour de l\u2019ouverture avec votre acc\u00e8s prioritaire.")}
              </p>
            </motion.div>
          ) : (
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder={s(settings, 'prelaunch_form_name_placeholder', 'Votre pr\u00e9nom (optionnel)')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 px-5 py-4 rounded-xl text-sm font-light outline-none transition-all duration-300 placeholder:text-[var(--text-muted)]"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(212,175,55,0.3)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                />
                <input
                  type="email"
                  required
                  placeholder={s(settings, 'prelaunch_form_email_placeholder', 'Votre email')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-[1.5] px-5 py-4 rounded-xl text-sm font-light outline-none transition-all duration-300 placeholder:text-[var(--text-muted)]"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(212,175,55,0.3)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                />
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="magnetic-btn pulse-ring w-full py-4 rounded-full text-sm font-semibold tracking-wide transition-all disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #D4AF37, #B8960F)", color: "#000000" }}
              >
                {status === "loading" ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#000000] border-t-transparent rounded-full animate-spin" />
                    {s(settings, 'prelaunch_form_loading', 'Inscription...')}
                  </span>
                ) : (
                  s(settings, 'prelaunch_form_button', "Rejoindre la liste d\u2019attente")
                )}
              </button>

              {status === "already" && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-sm font-light"
                  style={{ color: "#D4AF37" }}
                >
                  {s(settings, 'prelaunch_already_message', 'Vous \u00eates d\u00e9j\u00e0 inscrit(e). Nous vous contacterons le 22 mars.')}
                </motion.p>
              )}

              {status === "error" && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-sm font-light"
                  style={{ color: "#ef4444" }}
                >
                  {s(settings, 'prelaunch_error_message', 'Une erreur est survenue. Veuillez r\u00e9essayer.')}
                </motion.p>
              )}
            </form>
          )}

          {/* Social proof */}
          {waitlistCount > 0 && (
            <motion.p
              className="text-center mt-4 text-xs font-light"
              style={{ color: "var(--text-muted)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {s(settings, 'prelaunch_social_proof', '{count} personne(s) sur la liste d\'attente').split('{count}').map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && <span style={{ color: "#D4AF37" }}>{waitlistCount}</span>}
                </span>
              ))}
            </motion.p>
          )}
        </motion.div>

        {/* Features teaser */}
        <motion.div
          className="w-full max-w-2xl mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <p
            className="text-center text-[11px] tracking-[0.35em] uppercase mb-6 font-light"
            style={{ color: "var(--text-muted)" }}
          >
            {s(settings, 'prelaunch_features_label', 'Ce qui vous attend')}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature}
                className="glass p-4 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.7 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                style={{ borderColor: "rgba(212,175,55,0.06)" }}
              >
                <span className="block w-1.5 h-1.5 rotate-45 mx-auto mb-3" style={{ background: "#D4AF37", opacity: 0.5 }} />
                <span className="text-xs font-light leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {feature}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer links */}
        <motion.div
          className="pb-10 text-center space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 2.1 }}
        >
          <Link
            href="/login"
            className="text-xs gold-underline transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            {s(settings, 'prelaunch_login_link', 'D\u00e9j\u00e0 membre ? Se connecter')}
          </Link>

          <div className="flex items-center justify-center gap-6 mt-3">
            {[
              { label: "Mentions l\u00E9gales", href: "/mentions-legales" },
              { label: "CGV", href: "/cgv" },
              { label: "Confidentialit\u00E9", href: "/confidentialite" },
              { label: "Contact", href: "/contact" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[10px] tracking-wider uppercase transition-colors"
                style={{ color: "var(--text-muted)" }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <p className="text-[10px] mt-4" style={{ color: "var(--text-muted)", opacity: 0.5 }}>
            {s(settings, 'prelaunch_copyright', '\u00a9 2026 SOS Shine. Tous droits r\u00e9serv\u00e9s.')}
          </p>
        </motion.div>
      </div>
    </main>
  );
}
