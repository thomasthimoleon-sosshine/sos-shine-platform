"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { QUESTIONS, PROFILES, calculateTopTwo, type ProfileKey } from "@/lib/signature-test";
import { getArchetypeForProfiles, BLESSURE_COLORS } from "@/lib/quiz-v2/archetypes";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { createClient } from "@/lib/supabase/client";

type Phase = "intro" | "quiz" | "loading" | "email" | "result";

function ProgressBar({ current, total }: { current: number; total: number }) {
  const { t } = useTranslation();
  const pct = (current / total) * 100;
  return (
    <div className="w-full max-w-xl mx-auto mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs tracking-[0.2em] uppercase text-[var(--text-muted)]">
          {t('signature.question_of')} {current} / {total}
        </span>
        <span className="text-xs font-medium" style={{ color: "var(--gold)" }}>
          {Math.round(pct)}%
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--dark-border)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, var(--gold), var(--gold-light))" }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

function IntroScreen({ onStart }: { onStart: (name: string) => void }) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="mb-6"
      >
        <span className="inline-block px-5 py-2 rounded-full text-xs tracking-[0.25em] uppercase font-medium" style={{ background: "rgba(212,175,55,0.08)", color: "var(--gold)", border: "1px solid rgba(212,175,55,0.15)" }}>
          {t('signature.badge')}
        </span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="font-display text-4xl md:text-6xl font-light mb-6"
        style={{ color: "var(--gold)" }}
      >
        {t('signature.title')}{" "}
        <span className="text-shimmer">{t('signature.title_highlight')}</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
        className="text-lg md:text-xl text-[var(--text-secondary)] font-light max-w-2xl mb-4 leading-relaxed"
      >
        {t('signature.intro')}
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.45 }}
        className="text-sm text-[var(--text-muted)] mb-10 max-w-lg"
      >
        {t('signature.time')}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.55 }}
        className="w-full max-w-sm"
      >
        <label className="block text-sm tracking-[0.15em] uppercase text-[var(--text-muted)] mb-3 text-left">
          {t('signature.name_label')}
        </label>
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) onStart(name.trim()); }}
          placeholder={t('signature.name_placeholder')}
          className="w-full px-5 py-4 rounded-xl text-base font-light outline-none transition-all duration-300 focus:ring-1"
          style={{
            background: "var(--dark-card)",
            border: "1px solid var(--dark-border)",
            color: "var(--text-primary)",
          }}
        />
        <button
          onClick={() => name.trim() && onStart(name.trim())}
          disabled={!name.trim()}
          className="magnetic-btn w-full mt-5 py-4 rounded-full text-base font-semibold tracking-wide transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: name.trim() ? "linear-gradient(135deg, var(--gold), var(--gold-deep))" : "var(--dark-card)",
            color: name.trim() ? "#050505" : "var(--text-muted)",
          }}
        >
          {t('signature.start')}
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-10"
      >
        <Link href="/" className="text-xs tracking-[0.15em] uppercase text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors gold-underline">
          {t('signature.back_home')}
        </Link>
      </motion.div>
    </motion.div>
  );
}

function QuizScreen({ onComplete }: { onComplete: (answers: Record<number, number>) => void }) {
  const { t } = useTranslation();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [direction, setDirection] = useState(1);
  const [microTension, setMicroTension] = useState<string | null>(null);

  const question = QUESTIONS[currentQ];

  const handleSelect = useCallback((answerIdx: number) => {
    if (selectedIdx !== null) return;
    setSelectedIdx(answerIdx);

    setTimeout(() => {
      const newAnswers = { ...answers, [question.id]: answerIdx };
      setAnswers(newAnswers);

      if (currentQ < QUESTIONS.length - 1) {
        setDirection(1);

        const advanceToNext = () => {
          setCurrentQ((prev) => prev + 1);
          setSelectedIdx(null);
        };

        if (question.id === 5) {
          setMicroTension(t('signature.micro_tension_1'));
          setTimeout(() => {
            setMicroTension(null);
            advanceToNext();
          }, 2200);
        } else if (question.id === 10) {
          setMicroTension(t('signature.micro_tension_2'));
          setTimeout(() => {
            setMicroTension(null);
            advanceToNext();
          }, 2200);
        } else {
          advanceToNext();
        }
      } else {
        onComplete(newAnswers);
      }
    }, 400);
  }, [selectedIdx, answers, question.id, currentQ, onComplete, t]);

  const goBack = useCallback(() => {
    if (currentQ > 0) {
      setDirection(-1);
      setCurrentQ((prev) => prev - 1);
      setSelectedIdx(null);
    }
  }, [currentQ]);

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-[80vh] px-6"
    >
      <ProgressBar current={currentQ + 1} total={QUESTIONS.length} />

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={question.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-xl"
        >
          <h2 className="font-display text-2xl md:text-3xl font-light text-center mb-10 leading-relaxed" style={{ color: "var(--text-primary)" }}>
            {question.question}
          </h2>

          <div className="space-y-3">
            {question.answers.map((answer, idx) => {
              const isSelected = selectedIdx === idx;
              const isPrevAnswer = answers[question.id] === idx && selectedIdx === null;
              return (
                <motion.button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.06 }}
                  className="w-full text-left p-5 rounded-xl transition-all duration-300 group relative overflow-hidden"
                  style={{
                    background: isSelected
                      ? "rgba(212,175,55,0.12)"
                      : isPrevAnswer
                      ? "rgba(212,175,55,0.06)"
                      : "var(--dark-card)",
                    border: isSelected
                      ? "1px solid rgba(212,175,55,0.4)"
                      : isPrevAnswer
                      ? "1px solid rgba(212,175,55,0.15)"
                      : "1px solid var(--dark-border)",
                  }}
                >
                  <div className="flex items-start gap-4">
                    <span
                      className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mt-0.5 transition-all duration-300"
                      style={{
                        background: isSelected ? "var(--gold)" : "var(--dark-card)",
                        color: isSelected ? "#050505" : "var(--text-muted)",
                        border: isSelected ? "none" : "1px solid var(--dark-border)",
                      }}
                    >
                      {isSelected ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        String.fromCharCode(65 + idx)
                      )}
                    </span>
                    <span className="text-[15px] font-light leading-relaxed" style={{ color: isSelected ? "var(--gold)" : "var(--text-secondary)" }}>
                      {answer.text}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {currentQ > 0 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={goBack}
          className="mt-8 text-sm tracking-[0.1em] uppercase text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {t('signature.previous')}
        </motion.button>
      )}

      <AnimatePresence>
        {microTension && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-50 px-6"
            style={{ background: "var(--dark)" }}
          >
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="font-display text-xl md:text-2xl font-light text-center max-w-sm leading-relaxed"
              style={{ color: "var(--gold)" }}
            >
              {microTension}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function LoadingScreen() {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 mb-8"
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="var(--gold)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
        </svg>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="font-display text-2xl font-light mb-3"
        style={{ color: "var(--gold)" }}
      >
        {t('signature.loading')}
      </motion.h2>

      <motion.div className="space-y-3 mt-6 max-w-xs mx-auto">
        {[t('signature.loading_1'), t('signature.loading_2'), t('signature.loading_3')].map((text, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.6 }}
            className="flex items-center gap-3"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8 + i * 0.6, type: "spring" }}
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(212,175,55,0.15)" }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="3" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </motion.span>
            <span className="text-sm text-[var(--text-secondary)]">{text}</span>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

function EmailScreen({ onSubmit, firstName }: { onSubmit: (email: string) => void; firstName: string }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@") || !trimmed.includes(".")) {
      setError(t("signature.email_error"));
      return;
    }
    setSaving(true);
    setError("");
    onSubmit(trimmed);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="w-20 h-20 rounded-full mx-auto mb-8 flex items-center justify-center"
        style={{ background: "rgba(212,175,55,0.1)", border: "2px solid rgba(212,175,55,0.25)" }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="font-display text-3xl md:text-4xl font-light mb-4"
        style={{ color: "var(--gold)" }}
      >
        {t("signature.email_title")}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="text-lg text-[var(--text-secondary)] font-light max-w-lg mb-6 leading-relaxed"
      >
        {t("signature.email_subtitle").replace("{firstName}", firstName)}
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="text-sm font-light italic mb-8 max-w-sm"
        style={{ color: "var(--gold)", opacity: 0.75 }}
      >
        {t("signature.email_pre_field")}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.45 }}
        className="w-full max-w-sm"
      >
        <label className="block text-sm tracking-[0.15em] uppercase text-[var(--text-muted)] mb-3 text-left">
          {t("signature.email_label")}
        </label>
        <input
          ref={inputRef}
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(""); }}
          onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
          placeholder={t("signature.email_placeholder")}
          className="w-full px-5 py-4 rounded-xl text-base font-light outline-none transition-all duration-300 focus:ring-1"
          style={{
            background: "var(--dark-card)",
            border: error ? "1px solid #ef4444" : "1px solid var(--dark-border)",
            color: "var(--text-primary)",
          }}
        />
        {error && (
          <p className="text-sm text-red-400 mt-2 text-left">{error}</p>
        )}
        <button
          onClick={handleSubmit}
          disabled={saving || !email.trim()}
          className="magnetic-btn w-full mt-5 py-4 rounded-full text-base font-semibold tracking-wide transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: email.trim() ? "linear-gradient(135deg, var(--gold), var(--gold-deep))" : "var(--dark-card)",
            color: email.trim() ? "#050505" : "var(--text-muted)",
          }}
        >
          {saving ? t("signature.email_saving") : t("signature.email_submit")}
        </button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-xs text-[var(--text-muted)] flex items-center justify-center gap-2"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          {t("signature.email_privacy")}
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

// Utility: reveals in view once (scroll-triggered for sections below the fold)
function Beat({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

type Protocol = { id: string; title: string; slug: string; status: string; duration_days: number }

function ResultScreen({ profileKey, secondaryKey, firstName, email }: { profileKey: ProfileKey; secondaryKey: ProfileKey; firstName: string; email: string }) {
  const { t } = useTranslation();
  const profile = PROFILES[profileKey];
  const archetype = getArchetypeForProfiles(profileKey, secondaryKey);
  const bc = BLESSURE_COLORS[archetype.blessure];
  const inject = (text: string) => text.replace(/\{firstName\}/g, firstName);

  const [protocols, setProtocols] = useState<Protocol[]>([]);
  useEffect(() => {
    const supabase = createClient();
    (supabase as any).from('protocols').select('id,title,slug,status,duration_days').then(({ data }: { data: Protocol[] | null }) => {
      if (data) {
        const sorted = [...data].sort((a, b) => {
          const aAvail = a.status === 'available' ? 0 : 1;
          const bAvail = b.status === 'available' ? 0 : 1;
          return aAvail - bAvail;
        });
        setProtocols(sorted);
      }
    });
  }, []);

  const topProtocol = protocols[0] ?? null;
  const otherProtocols = protocols.slice(1, 3);

  function handleCta() {
    if (topProtocol) {
      try {
        sessionStorage.setItem('sos_protocol_slug', topProtocol.slug);
        if (email) sessionStorage.setItem('sos_quiz_email', email);
      } catch {}
    }
  }

  const signupUrl = topProtocol
    ? `/signup?source=quiz&protocol=${topProtocol.slug}${email ? `&email=${encodeURIComponent(email)}` : ''}`
    : `/signup?source=quiz`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
    >
      {/* ════ ACTE 1 — IDENTITÉ ════ */}
      <div className="flex flex-col items-center justify-center min-h-[90vh] px-6 text-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="inline-block px-4 py-1.5 rounded-full text-[11px] tracking-[0.22em] uppercase font-medium mb-10"
          style={{ background: bc.bg, color: bc.text, border: `1px solid ${bc.border}` }}
        >
          {archetype.blessure}
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-[2.6rem] sm:text-6xl font-light leading-[1.1] mb-8"
          style={{ color: "var(--gold)", letterSpacing: "-0.01em" }}
        >
          {archetype.name}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="text-[11px] tracking-[0.22em] uppercase"
          style={{ color: bc.text, opacity: 0.6 }}
        >
          {archetype.emotion}&nbsp;&nbsp;·&nbsp;&nbsp;{archetype.mode}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="mt-20 flex flex-col items-center gap-1"
          style={{ color: "var(--text-muted)" }}
        >
          <span className="text-xs tracking-[0.15em] uppercase">Continue</span>
          <motion.span
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="text-lg"
          >
            ↓
          </motion.span>
        </motion.div>
      </div>

      {/* ════ ACTE 2 — RECONNAISSANCE ════ */}
      <div className="px-6 pb-24 max-w-lg mx-auto">
        <Beat>
          <p className="text-[11px] tracking-[0.22em] uppercase mb-8" style={{ color: bc.text, opacity: 0.55 }}>
            Ce que tu vis
          </p>
          <p
            className="text-[1.35rem] sm:text-2xl font-light leading-[1.75] whitespace-pre-line"
            style={{ color: "var(--text-primary)" }}
          >
            {archetype.reconnaissance}
          </p>
        </Beat>

        {/* ── Divider ── */}
        <div className="my-20 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

        {/* ════ ACTE 3 — VÉRITÉ CACHÉE ════ */}
        <Beat>
          <p className="text-[11px] tracking-[0.22em] uppercase mb-8" style={{ color: bc.text, opacity: 0.55 }}>
            La vérité cachée
          </p>
          <p
            className="text-[1.15rem] sm:text-xl font-light leading-[1.85] whitespace-pre-line"
            style={{ color: "var(--text-secondary)" }}
          >
            {archetype.verite}
          </p>
        </Beat>

        <div className="my-20 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

        {/* ════ ACTE 4 — MÉCANIQUE PROFONDE ════ */}
        <Beat>
          <p className="text-[11px] tracking-[0.22em] uppercase mb-8" style={{ color: bc.text, opacity: 0.55 }}>
            D&apos;où ça vient
          </p>
          <p
            className="text-[1.05rem] sm:text-lg font-light leading-[1.95] whitespace-pre-line"
            style={{ color: "var(--text-secondary)" }}
          >
            {archetype.mecanique}
          </p>
        </Beat>

        <div className="my-20 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

        {/* ════ ACTE 5 — CONSÉQUENCE ════ */}
        <Beat>
          <p className="text-[11px] tracking-[0.22em] uppercase mb-8" style={{ color: bc.text, opacity: 0.55 }}>
            Ce qui va se passer
          </p>
          <p
            className="text-[1.15rem] sm:text-xl font-light leading-[1.85] whitespace-pre-line"
            style={{ color: "var(--text-secondary)" }}
          >
            {archetype.consequence}
          </p>
        </Beat>

        <div className="my-20 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

        {/* ════ ACTE 6 — TRANSITION ════ */}
        <Beat>
          <p
            className="text-[1.2rem] sm:text-xl font-light leading-[1.85] whitespace-pre-line"
            style={{ color: "var(--gold)" }}
          >
            {archetype.transition}
          </p>
        </Beat>

        {/* ════ PROTOCOLES RECOMMANDÉS ════ */}
        {topProtocol && (
          <Beat delay={0.05} className="mt-20">
            <p className="text-[11px] tracking-[0.22em] uppercase mb-6 text-center" style={{ color: 'var(--gold)', opacity: 0.6 }}>
              Ton protocole recommandé
            </p>
            <div
              className="rounded-2xl p-6 mb-4"
              style={{ background: 'linear-gradient(160deg, rgba(201,169,97,0.10), rgba(201,169,97,0.03))', border: '1px solid rgba(201,169,97,0.25)' }}
            >
              <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--gold)', opacity: 0.7 }}>
                Protocole principal
              </p>
              <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {topProtocol.title}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {topProtocol.duration_days} jours · 3 étapes
              </p>
            </div>
            {otherProtocols.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] tracking-[0.18em] uppercase mb-3" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
                  Également compatibles
                </p>
                {otherProtocols.map((p) => (
                  <div key={p.id} className="rounded-xl px-4 py-3 flex items-center gap-3"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{p.title}</p>
                    <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>{p.duration_days}j</span>
                  </div>
                ))}
              </div>
            )}
          </Beat>
        )}

        {/* ════ CTA ════ */}
        <Beat delay={0.1} className="mt-12 text-center">
          <Link href={signupUrl} onClick={handleCta}>
            <button
              className="magnetic-btn pulse-ring w-full max-w-sm py-5 rounded-full text-base font-semibold tracking-wide transition-all hover:brightness-110"
              style={{ background: "linear-gradient(135deg, var(--gold), var(--gold-deep))", color: "#050505" }}
            >
              Commencer mon protocole →
            </button>
          </Link>
          <p className="mt-4 text-xs" style={{ color: "var(--text-muted)" }}>
            Étape 1 gratuite · Sans engagement
          </p>
        </Beat>

        {/* ════ PROFILE DEEPER DIVE ════ */}
        <div className="mt-28">
          <Beat>
            <div className="flex items-center gap-4 mb-16">
              <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
              <span className="text-[11px] tracking-[0.2em] uppercase" style={{ color: "var(--text-muted)" }}>
                Ton profil complet
              </span>
              <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
            </div>
          </Beat>

          <Beat className="text-center mb-14">
            <div
              className="w-14 h-14 rounded-full mx-auto mb-5 flex items-center justify-center text-2xl"
              style={{ background: `${profile.color}12`, border: `1px solid ${profile.color}30` }}
            >
              {profile.icon}
            </div>
            <p className="text-sm font-medium tracking-[0.12em] uppercase" style={{ color: profile.color }}>
              {profile.archetype}
            </p>
          </Beat>

          {[
            { label: t('signature.section_essence'), text: inject(profile.essence) },
            { label: t('signature.section_light'),   text: inject(profile.lumiere) },
            { label: t('signature.section_shadow'),  text: inject(profile.ombre) },
            { label: t('signature.section_protocol'), text: inject(profile.protocole) },
          ].map((section, i) => (
            <Beat key={section.label} delay={i * 0.05} className="mb-14">
              <p className="text-[11px] tracking-[0.2em] uppercase mb-5" style={{ color: profile.color, opacity: 0.7 }}>
                {section.label}
              </p>
              <p className="text-[15px] font-light leading-[1.9]" style={{ color: "var(--text-secondary)" }}>
                {section.text}
              </p>
            </Beat>
          ))}
        </div>

        {/* ════ FOOTER ════ */}
        <Beat className="mt-16 pb-12 text-center">
          <div className="flex justify-center gap-8">
            <button
              onClick={() => window.location.reload()}
              className="text-xs tracking-[0.12em] uppercase transition-colors"
              style={{ color: "var(--text-muted)" }}
            >
              {t('signature.retake')}
            </button>
            <Link
              href="/"
              className="text-xs tracking-[0.12em] uppercase transition-colors"
              style={{ color: "var(--text-muted)" }}
            >
              {t('signature.back_home')}
            </Link>
          </div>
        </Beat>
      </div>
    </motion.div>
  );
}

export default function SignatureEmotionnellePage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [firstName, setFirstName] = useState("");
  const [quizEmail, setQuizEmail] = useState("");
  const [resultProfile, setResultProfile] = useState<ProfileKey | null>(null);
  const [secondaryProfile, setSecondaryProfile] = useState<ProfileKey>('P2');

  const handleStart = useCallback((name: string) => {
    setFirstName(name);
    setPhase("quiz");
  }, []);

  const handleComplete = useCallback((answers: Record<number, number>) => {
    setPhase("loading");
    const { dominant, secondary } = calculateTopTwo(answers);

    setTimeout(() => {
      setResultProfile(dominant);
      setSecondaryProfile(secondary);
      setPhase("email");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 2800);
  }, []);

  const handleEmailSubmit = useCallback(async (email: string) => {
    const profileKey = resultProfile;
    const profileName = profileKey ? PROFILES[profileKey]?.archetype : null;
    setQuizEmail(email);
    try {
      await fetch("/api/signature-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName, profileKey, profileName }),
      });
    } catch {}
    setPhase("result");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [firstName, resultProfile]);

  return (
    <main className="relative z-0 min-h-screen" style={{ background: "var(--dark)" }}>
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-[0.03] blur-[60px]" style={{ background: "var(--gold)" }} />
      </div>

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {phase === "intro" && <IntroScreen key="intro" onStart={handleStart} />}
          {phase === "quiz" && <QuizScreen key="quiz" onComplete={handleComplete} />}
          {phase === "loading" && <LoadingScreen key="loading" />}
          {phase === "email" && (
            <EmailScreen key="email" onSubmit={handleEmailSubmit} firstName={firstName} />
          )}
          {phase === "result" && resultProfile && (
            <ResultScreen key="result" profileKey={resultProfile} secondaryKey={secondaryProfile} firstName={firstName} email={quizEmail} />
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
