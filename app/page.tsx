"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const LAUNCH_DATE = new Date("2026-03-22T00:00:00+02:00");

const DIAMONDS = [
  { top: "8%", left: "12%", duration: "9s", delay: "0s", size: 3 },
  { top: "18%", left: "88%", duration: "11s", delay: "1.5s", size: 4 },
  { top: "40%", left: "5%", duration: "8s", delay: "2.8s", size: 3 },
  { top: "55%", left: "92%", duration: "10s", delay: "0.6s", size: 4 },
  { top: "72%", left: "15%", duration: "9s", delay: "3.5s", size: 3 },
  { top: "85%", left: "78%", duration: "7s", delay: "1.2s", size: 4 },
];

function getTimeLeft() {
  const now = new Date();
  const diff = LAUNCH_DATE.getTime() - now.getTime();
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

const features = [
  "Encyclopédie complète des douleurs (A-Z)",
  "Vidéos de coaching immersif",
  "Soins énergétiques & méditations",
  "Chat dédié par douleur",
  "Communauté & mur de partage",
  "Soins collectifs & événements",
];

export default function PreLaunchPage() {
  const [time, setTime] = useState(getTimeLeft);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "already" | "error">("idle");
  const [waitlistCount, setWaitlistCount] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const interval = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch("/api/waitlist")
      .then((r) => r.json())
      .then((d) => setWaitlistCount(d.count || 0))
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
          <Link href="/" className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center font-display text-lg font-semibold"
              style={{ background: "linear-gradient(135deg, #D4AF37, #B8960F)", color: "#050505" }}
            >
              S
            </div>
            <span className="font-display text-xl tracking-wider" style={{ color: "#D4AF37" }}>
              SOS Shine
            </span>
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
            Lancement exclusif
          </span>
        </motion.div>

        {/* Hero Title */}
        <div className="text-center max-w-3xl mb-10">
          <div className="font-display font-light leading-[1.1] mb-6" style={{ perspective: "1000px", fontSize: "clamp(2.5rem, 6vw, 4rem)", color: "#D4AF37" }}>
            {["Quelque chose", "de", "puissant", "arrive."].map((word, i) => (
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
            L&apos;encyclop&eacute;die compl&egrave;te des douleurs &eacute;motionnelles.
            <br />
            Un espace pour comprendre, apaiser et ne plus jamais &ecirc;tre seul.
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
            Ouverture le 22 mars 2026 &agrave; minuit
          </p>

          {!time.launched ? (
            <div className="flex items-center gap-3 sm:gap-5">
              <CountdownUnit value={time.days} label="Jours" />
              <span className="font-display text-2xl sm:text-3xl font-light mt-[-24px]" style={{ color: "rgba(212,175,55,0.25)" }}>:</span>
              <CountdownUnit value={time.hours} label="Heures" />
              <span className="font-display text-2xl sm:text-3xl font-light mt-[-24px]" style={{ color: "rgba(212,175,55,0.25)" }}>:</span>
              <CountdownUnit value={time.minutes} label="Minutes" />
              <span className="font-display text-2xl sm:text-3xl font-light mt-[-24px]" style={{ color: "rgba(212,175,55,0.25)" }}>:</span>
              <CountdownUnit value={time.seconds} label="Secondes" />
            </div>
          ) : (
            <div className="text-center">
              <span className="font-display text-3xl font-light text-shimmer">
                Les portes sont ouvertes
              </span>
            </div>
          )}
        </motion.div>

        {/* Pricing comparison */}
        <motion.div
          className="w-full max-w-2xl mb-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className="glass p-8 sm:p-10 text-center relative overflow-hidden"
            style={{ borderColor: "rgba(212,175,55,0.12)" }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)" }}
            />

            <p
              className="text-[11px] tracking-[0.35em] uppercase mb-2 font-medium"
              style={{ color: "var(--text-muted)" }}
            >
              Avantage liste d&apos;attente
            </p>

            <p className="text-sm mb-6 font-light" style={{ color: "var(--text-secondary)" }}>
              Rejoignez maintenant et b&eacute;n&eacute;ficiez d&apos;un tarif pr&eacute;f&eacute;rentiel &agrave; vie.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 mb-8">
              {/* Early bird price */}
              <div className="text-center">
                <div className="flex items-baseline justify-center gap-1.5">
                  <span className="font-display text-5xl sm:text-6xl font-light" style={{ color: "#D4AF37" }}>
                    19,90&euro;
                  </span>
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                    /mois
                  </span>
                </div>
                <span
                  className="inline-block mt-2 px-3 py-1 rounded-full text-[10px] tracking-[0.2em] uppercase font-medium"
                  style={{ background: "rgba(212,175,55,0.1)", color: "#D4AF37", border: "1px solid rgba(212,175,55,0.15)" }}
                >
                  Tarif fondateur &mdash; &agrave; vie
                </span>
              </div>

              {/* Separator */}
              <div className="hidden sm:flex flex-col items-center gap-2">
                <span className="block w-px h-12" style={{ background: "rgba(255,255,255,0.06)" }} />
                <span className="text-[10px] tracking-wider uppercase" style={{ color: "var(--text-muted)" }}>
                  au lieu de
                </span>
                <span className="block w-px h-12" style={{ background: "rgba(255,255,255,0.06)" }} />
              </div>
              <div className="sm:hidden">
                <span className="text-[10px] tracking-wider uppercase" style={{ color: "var(--text-muted)" }}>
                  au lieu de
                </span>
              </div>

              {/* Standard price */}
              <div className="text-center opacity-50">
                <div className="flex items-baseline justify-center gap-1.5 relative">
                  <span
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-px rotate-[-8deg]"
                    style={{ background: "rgba(255,100,100,0.5)" }}
                  />
                  <span className="font-display text-4xl sm:text-5xl font-light" style={{ color: "var(--text-secondary)" }}>
                    29,90&euro;
                  </span>
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                    /mois
                  </span>
                </div>
                <p className="mt-2 text-[10px] tracking-wider uppercase" style={{ color: "var(--text-muted)" }}>
                  Tarif standard apr&egrave;s lancement
                </p>
              </div>
            </div>

            <p className="text-sm font-light mb-1" style={{ color: "var(--text-secondary)" }}>
              Sans engagement &mdash; Annulable &agrave; tout instant
            </p>
            <p className="text-xs font-light" style={{ color: "var(--text-muted)" }}>
              10&euro; d&apos;&eacute;conomie/mois, pour toujours.
            </p>
          </div>
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
              <div className="font-display text-2xl font-light mb-3" style={{ color: "#D4AF37" }}>Bienvenue parmi les fondateurs</div>
              <p className="text-sm font-light leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Votre place est r&eacute;serv&eacute;e. Vous recevrez un email le jour de l&apos;ouverture avec votre acc&egrave;s
                prioritaire au tarif de <strong>19,90&euro;/mois &agrave; vie</strong>.
              </p>
            </motion.div>
          ) : (
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Votre pr&eacute;nom (optionnel)"
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
                  placeholder="Votre email"
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
                style={{ background: "linear-gradient(135deg, #D4AF37, #B8960F)", color: "#050505" }}
              >
                {status === "loading" ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#050505] border-t-transparent rounded-full animate-spin" />
                    Inscription...
                  </span>
                ) : (
                  "Rejoindre la liste d\u2019attente \u2014 19,90\u20AC/mois \u00E0 vie"
                )}
              </button>

              {status === "already" && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-sm font-light"
                  style={{ color: "#D4AF37" }}
                >
                  Vous &ecirc;tes d&eacute;j&agrave; inscrit(e). Nous vous contacterons le 22 mars.
                </motion.p>
              )}

              {status === "error" && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-sm font-light"
                  style={{ color: "#ef4444" }}
                >
                  Une erreur est survenue. Veuillez r&eacute;essayer.
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
              <span style={{ color: "#D4AF37" }}>{waitlistCount}</span> personne{waitlistCount > 1 ? "s" : ""} sur la
              liste d&apos;attente
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
            Ce qui vous attend
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
            D&eacute;j&agrave; membre ? Se connecter
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
            &copy; 2026 SOS Shine. Tous droits r&eacute;serv&eacute;s.
          </p>
        </motion.div>
      </div>
    </main>
  );
}
