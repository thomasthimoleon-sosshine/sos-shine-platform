"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import type { Answer, AnswerMap, Question, Theme } from "@/lib/royaume/types";
import {
  answersServerSnapshot,
  answersSnapshot,
  putAnswer,
  subscribeAnswers,
} from "@/lib/royaume/storage";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

type Props = {
  themes: Theme[];
  questions: Question[];
  /** Ordre de traversée (ids de questions). */
  order: string[];
  /** Clé de sauvegarde locale. */
  storageKey: string;
  /** Où l’on va une fois la descente finie. */
  doneHref: string;
};

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * La traversée.
 *
 * Une question par écran. Le récit arrive d’abord, seul, pendant une
 * seconde et demie ; la question ensuite ; les réponses en dernier.
 * Ce délai n’est pas décoratif : il empêche de répondre vite, et
 * répondre vite est exactement ce qu’on veut éviter ici.
 */
export default function QuestionnaireRunner({
  themes,
  questions,
  order,
  storageKey,
  doneHref,
}: Props) {
  const router = useRouter();
  const reduced = usePrefersReducedMotion();

  const answers: AnswerMap = useSyncExternalStore(
    useMemo(() => subscribeAnswers(storageKey), [storageKey]),
    useMemo(() => answersSnapshot(storageKey), [storageKey]),
    answersServerSnapshot
  );

  /**
   * Tant que rien n’a été touché, la position est déduite des réponses
   * déjà données : on reprend la descente là où elle s’est arrêtée.
   * Dès la première interaction, le curseur devient explicite.
   */
  const [cursor, setCursor] = useState<number | null>(null);

  const resumeAt = useMemo(() => {
    const firstUnanswered = order.findIndex((id) => !answers[id]);
    return firstUnanswered === -1 ? order.length - 1 : firstUnanswered;
  }, [answers, order]);

  const index = cursor ?? resumeAt;

  const byId = useMemo(
    () => new Map(questions.map((q) => [q.id, q])),
    [questions]
  );

  const question = byId.get(order[index]);
  const theme = themes.find((t) => t.id === question?.themeId);
  const progress = order.length ? ((index + 1) / order.length) * 100 : 0;

  /** Vrai quand cette question ouvre un nouveau chapitre. */
  const opensChapter =
    index === 0 || byId.get(order[index - 1])?.themeId !== question?.themeId;

  const commit = useCallback(
    (patch: Answer) => {
      // Répondre fige la position : la reprise automatique s’arrête ici.
      setCursor((c) => c ?? index);
      putAnswer(storageKey, patch);
    },
    [storageKey, index]
  );

  const goNext = useCallback(() => {
    if (index >= order.length - 1) {
      router.push(doneHref);
      return;
    }
    setCursor(index + 1);
  }, [index, order.length, router, doneHref]);

  const goBack = useCallback(() => setCursor(Math.max(0, index - 1)), [index]);

  if (!question) {
    return <div className="min-h-[100svh]" aria-hidden="true" />;
  }

  const answer = answers[question.id];
  const canAdvance =
    question.optional ||
    (question.kind === "text"
      ? Boolean(answer?.text?.trim())
      : question.kind === "multi"
        ? Boolean(answer?.selected?.length)
        : typeof answer?.value === "number");

  return (
    <div className="relative z-10 flex min-h-[100svh] flex-col">
      {/* ── Jauge : une braise qui avance ── */}
      <div className="fixed inset-x-0 top-0 z-20 px-6 pt-6">
        <div className="mx-auto max-w-[46rem]">
          <div className="rm-progress">
            <div className="rm-progress__fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="rm-kicker text-[0.58rem]">
              {theme ? `${theme.numeral} — ${theme.title}` : ""}
            </span>
            <span className="text-[0.58rem] tracking-[0.3em] text-[var(--rm-text-mute)]">
              {index + 1} / {order.length}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center px-6 py-32">
        <div className="mx-auto w-full max-w-[46rem]">
          <AnimatePresence mode="wait">
            <motion.div
              key={question.id}
              initial={reduced ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -14 }}
              transition={{ duration: 0.9, ease: EASE }}
            >
              {/* ── Ouverture de chapitre ── */}
              {opensChapter && theme && (
                <motion.div
                  initial={reduced ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.2, ease: EASE }}
                  className="mb-14"
                >
                  <p className="rm-kicker">{`Chapitre ${theme.numeral}`}</p>
                  <h2 className="rm-serif mt-4 text-[clamp(1.7rem,4vw,2.5rem)]">
                    {theme.title}
                  </h2>
                  <p className="rm-whisper mt-3 text-[1.05rem]">
                    {theme.epigraph}
                  </p>
                  <hr className="rm-rule mt-8 max-w-32" />
                </motion.div>
              )}

              {/* ── Le récit, d’abord ── */}
              <motion.p
                initial={reduced ? false : { opacity: 0, filter: "blur(5px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 1.4, ease: EASE }}
                className="rm-prose max-w-[52ch] text-[var(--rm-text-soft)]"
              >
                {question.narrative}
              </motion.p>

              {/* ── La question ── */}
              <motion.h3
                initial={reduced ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.1, delay: reduced ? 0 : 0.75, ease: EASE }}
                className="rm-serif mt-10 text-[clamp(1.5rem,3.4vw,2.15rem)] text-[var(--rm-text)]"
              >
                {question.prompt}
              </motion.h3>

              {/* ── La réponse, en dernier ── */}
              <motion.div
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: reduced ? 0 : 1.35, ease: EASE }}
                className="mt-10"
              >
                <AnswerInput
                  question={question}
                  answer={answer}
                  onChange={commit}
                />
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* ── Navigation ── */}
          <div className="mt-14 flex items-center justify-between gap-6">
            <button
              type="button"
              onClick={goBack}
              disabled={index === 0}
              className="text-[0.62rem] uppercase tracking-[0.34em] text-[var(--rm-text-mute)] transition-colors duration-500 hover:text-[var(--rm-text-soft)] disabled:pointer-events-none disabled:opacity-25"
            >
              Revenir
            </button>

            <button
              type="button"
              onClick={goNext}
              disabled={!canAdvance}
              className="group flex items-center gap-3 text-[0.62rem] uppercase tracking-[0.34em] text-[var(--rm-gold-dim)] transition-colors duration-500 hover:text-[var(--rm-gold-soft)] disabled:pointer-events-none disabled:opacity-25"
            >
              {index === order.length - 1 ? "Refermer" : "Continuer"}
              <span className="h-px w-8 bg-current transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-14" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Les quatre formes de réponse ───────────────────────────── */

function AnswerInput({
  question,
  answer,
  onChange,
}: {
  question: Question;
  answer?: Answer;
  onChange: (a: Answer) => void;
}) {
  if (question.kind === "scale") {
    const poles = question.poles ?? ["", ""];
    return (
      <div>
        <div className="flex justify-between text-[0.72rem] italic text-[var(--rm-text-mute)]">
          <span>{poles[0]}</span>
          <span>{poles[1]}</span>
        </div>
        <div className="mt-5 grid grid-cols-7 gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map((v) => {
            const selected = answer?.value === v;
            return (
              <button
                key={v}
                type="button"
                aria-label={`${v} sur 7`}
                aria-pressed={selected}
                data-selected={selected}
                onClick={() => onChange({ questionId: question.id, value: v })}
                className="rm-choice rm-choice--dot"
              >
                <span className="rm-serif text-lg">{v}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (question.kind === "choice") {
    return (
      <div className="space-y-3">
        {question.options?.map((o) => {
          const selected = answer?.selected?.[0] === o.id;
          return (
            <button
              key={o.id}
              type="button"
              data-selected={selected}
              aria-pressed={selected}
              onClick={() =>
                onChange({
                  questionId: question.id,
                  value: o.value,
                  selected: [o.id],
                })
              }
              className="rm-choice"
            >
              {o.label}
            </button>
          );
        })}
      </div>
    );
  }

  if (question.kind === "multi") {
    const current = answer?.selected ?? [];
    return (
      <div className="space-y-3">
        {question.options?.map((o) => {
          const selected = current.includes(o.id);
          return (
            <button
              key={o.id}
              type="button"
              data-selected={selected}
              aria-pressed={selected}
              onClick={() =>
                onChange({
                  questionId: question.id,
                  selected: selected
                    ? current.filter((id) => id !== o.id)
                    : [...current, o.id],
                })
              }
              className="rm-choice"
            >
              {o.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <textarea
      className="rm-field min-h-44"
      placeholder={question.placeholder}
      value={answer?.text ?? ""}
      onChange={(e) =>
        onChange({ questionId: question.id, text: e.target.value })
      }
    />
  );
}
