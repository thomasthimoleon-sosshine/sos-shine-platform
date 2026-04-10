"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { QUESTIONS, PROFILES, calculateResult, type ProfileKey } from "@/lib/signature-test";
import { useTranslation } from "@/lib/i18n/useTranslation";

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

  const question = QUESTIONS[currentQ];

  const handleSelect = useCallback((answerIdx: number) => {
    if (selectedIdx !== null) return;
    setSelectedIdx(answerIdx);

    setTimeout(() => {
      const newAnswers = { ...answers, [question.id]: answerIdx };
      setAnswers(newAnswers);

      if (currentQ < QUESTIONS.length - 1) {
        setDirection(1);
        setCurrentQ((prev) => prev + 1);
        setSelectedIdx(null);
      } else {
        onComplete(newAnswers);
      }
    }, 400);
  }, [selectedIdx, answers, question.id, currentQ, onComplete]);

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
        className="text-lg text-[var(--text-secondary)] font-light max-w-lg mb-10 leading-relaxed"
      >
        {t("signature.email_subtitle").replace("{firstName}", firstName)}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
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

function ResultScreen({ profileKey, firstName, emailSent }: { profileKey: ProfileKey; firstName: string; emailSent: boolean }) {
  const { t } = useTranslation();
  const profile = PROFILES[profileKey];
  const inject = (text: string) => text.replace(/\{firstName\}/g, firstName);

  const sections = [
    { label: t('signature.section_essence'), icon: "◆", text: inject(profile.essence) },
    { label: t('signature.section_light'), icon: "✦", text: inject(profile.lumiere) },
    { label: t('signature.section_shadow'), icon: "◇", text: inject(profile.ombre) },
    { label: t('signature.section_protocol'), icon: "▸", text: inject(profile.protocole) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-6 py-16 md:py-24"
    >
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-5 py-2 rounded-full text-xs tracking-[0.25em] uppercase font-medium mb-6" style={{ background: "rgba(212,175,55,0.08)", color: "var(--gold)", border: "1px solid rgba(212,175,55,0.15)" }}>
            {t('signature.result_badge')}
          </span>

          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
            className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl"
            style={{ background: `${profile.color}15`, border: `2px solid ${profile.color}40` }}
          >
            {profile.icon}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-display text-3xl md:text-5xl font-light mb-3"
            style={{ color: profile.color }}
          >
            {profile.archetype}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-[var(--text-secondary)] font-light"
          >
            {profile.subtitle}
          </motion.p>

          {emailSent && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm"
              style={{ background: "rgba(80,200,120,0.1)", border: "1px solid rgba(80,200,120,0.2)", color: "#50C878" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {t('signature.email_confirmed')}
            </motion.div>
          )}
        </motion.div>

        <div className="space-y-6">
          {sections.map((section, i) => (
            <motion.div
              key={section.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.12 }}
              className="glow-card p-8 md:p-10"
            >
              <div className="flex items-center gap-3 mb-5">
                <span className="text-lg" style={{ color: profile.color }}>{section.icon}</span>
                <h3 className="font-display text-xl font-medium tracking-wide" style={{ color: profile.color }}>
                  {section.label}
                </h3>
              </div>
              <p className="text-[var(--text-secondary)] leading-[1.8] text-[15px] font-light">
                {section.text}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-12 text-center space-y-4"
        >
          <Link href="/signup">
            <button
              className="magnetic-btn pulse-ring px-10 py-5 rounded-full text-base font-semibold tracking-wide"
              style={{ background: "linear-gradient(135deg, var(--gold), var(--gold-deep))", color: "#050505" }}
            >
              {t('signature.join_cta')}
            </button>
          </Link>

          <div className="flex justify-center gap-6 pt-4">
            <button
              onClick={() => window.location.reload()}
              className="text-sm tracking-[0.1em] uppercase text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors gold-underline"
            >
              {t('signature.retake')}
            </button>
            <Link href="/" className="text-sm tracking-[0.1em] uppercase text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors gold-underline">
              {t('signature.back_home')}
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function SignatureEmotionnellePage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [firstName, setFirstName] = useState("");
  const [resultProfile, setResultProfile] = useState<ProfileKey | null>(null);

  const handleStart = useCallback((name: string) => {
    setFirstName(name);
    setPhase("quiz");
  }, []);

  const handleComplete = useCallback((answers: Record<number, number>) => {
    setPhase("loading");
    const result = calculateResult(answers);

    setTimeout(() => {
      setResultProfile(result);
      setPhase("email");
      window.scrollTo({ top: 0, behavior: "smooth" });

    }, 2800);
  }, []);

  const [emailSent, setEmailSent] = useState(false);

  const handleEmailSubmit = useCallback(async (email: string) => {
    const profileKey = resultProfile;
    const profileName = profileKey ? PROFILES[profileKey]?.archetype : null;
    try {
      const res = await fetch("/api/signature-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName, profileKey, profileName }),
      });
      const data = await res.json();
      if (data.emailSent) setEmailSent(true);
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
            <ResultScreen key="result" profileKey={resultProfile} firstName={firstName} emailSent={emailSent} />
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
