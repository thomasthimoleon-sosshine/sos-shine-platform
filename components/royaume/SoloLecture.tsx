"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import Reveal from "./Reveal";
import { ROUTES, STORAGE_KEYS } from "@/lib/royaume/brand";
import {
  answersServerSnapshot,
  answersSnapshot,
  subscribeAnswers,
} from "@/lib/royaume/storage";
import { BAND_LABEL, bandOf, scoreAll } from "@/lib/royaume/scoring";
import { SOLO_QUESTIONS, SOLO_THEMES } from "@/lib/royaume/solo-questions";
import { SOLO_READINGS } from "@/lib/royaume/solo-readings";
import type { AnswerMap, ThemeScore } from "@/lib/royaume/types";

/**
 * La lecture.
 *
 * Pas un score, pas un profil, pas un « type ». Une température par
 * chapitre, une phrase qui décrit, un geste à faire. Et surtout : les
 * mots que la personne a écrits elle-même, rendus tels quels — c’est
 * la partie qui travaille longtemps après la fermeture de l’onglet.
 */
export default function SoloLecture() {
  const answers: AnswerMap = useSyncExternalStore(
    useMemo(() => subscribeAnswers(STORAGE_KEYS.solo), []),
    useMemo(() => answersSnapshot(STORAGE_KEYS.solo), []),
    answersServerSnapshot
  );

  const scores: ThemeScore[] = scoreAll(
    SOLO_THEMES.map((t) => t.id),
    SOLO_QUESTIONS,
    answers
  );

  const answered = scores.reduce((n, s) => n + s.answered, 0);

  if (answered === 0) {
    return (
      <section className="relative z-10 flex min-h-[100svh] items-center px-6">
        <div className="mx-auto max-w-[36rem] text-center">
          <p className="rm-kicker">Rien à lire</p>
          <p className="rm-serif mt-8 text-[clamp(1.6rem,3.6vw,2.3rem)]">
            La descente n’a pas encore eu lieu.
          </p>
          <Link
            href={ROUTES.solo}
            className="mt-12 inline-block text-[0.64rem] uppercase tracking-[0.36em] text-[var(--rm-gold-dim)] transition-colors duration-700 hover:text-[var(--rm-gold-soft)]"
          >
            Commencer
          </Link>
        </div>
      </section>
    );
  }

  const sorted = [...scores].sort((a, b) => a.score - b.score);
  const weakest = SOLO_THEMES.find((t) => t.id === sorted[0]?.themeId);
  const strongest = SOLO_THEMES.find(
    (t) => t.id === sorted[sorted.length - 1]?.themeId
  );

  /** Les textes libres sont rendus intacts : on ne les interprète pas. */
  const written = SOLO_QUESTIONS.filter(
    (q) => q.kind === "text" && answers[q.id]?.text?.trim()
  );

  return (
    <div className="relative z-10 px-6 py-32">
      <div className="mx-auto w-full max-w-[48rem]">
        {/* ── Ouverture ── */}
        <Reveal>
          <p className="rm-kicker">Ta lecture</p>
          <h1 className="rm-serif mt-8 text-[clamp(2rem,5vw,3.2rem)] max-w-[18ch]">
            Voilà où tu en es.
          </h1>
          <p className="rm-prose mt-8 max-w-[48ch]">
            Ce n’est pas un verdict. C’est une température, prise un jour
            précis. Elle bougera — c’est même tout l’intérêt de l’avoir écrite.
          </p>
        </Reveal>

        {strongest && weakest && (
          <Reveal delay={0.2}>
            <div className="mt-14 grid gap-6 sm:grid-cols-2">
              <div className="border border-[var(--rm-line)] p-6">
                <p className="rm-kicker text-[0.56rem]">Ta ressource</p>
                <p className="rm-serif mt-3 text-[1.5rem]">{strongest.title}</p>
              </div>
              <div className="border border-[var(--rm-line)] p-6">
                <p className="rm-kicker text-[0.56rem]">Ton chantier</p>
                <p className="rm-serif mt-3 text-[1.5rem]">{weakest.title}</p>
              </div>
            </div>
          </Reveal>
        )}

        {/* ── Chapitre par chapitre ── */}
        <div className="mt-24 space-y-20">
          {SOLO_THEMES.map((theme, i) => {
            const score = scores.find((s) => s.themeId === theme.id);
            if (!score || score.answered === 0) return null;
            const band = bandOf(score.score);
            const reading = SOLO_READINGS[theme.id]?.[band];
            if (!reading) return null;

            return (
              <Reveal key={theme.id} delay={i === 0 ? 0 : 0.05}>
                <article>
                  <div className="flex items-baseline justify-between gap-6">
                    <p className="rm-kicker">
                      {theme.numeral} — {theme.title}
                    </p>
                    <p className="text-[0.6rem] uppercase tracking-[0.3em] text-[var(--rm-text-mute)]">
                      {BAND_LABEL[band]}
                    </p>
                  </div>

                  <div className="rm-progress mt-5">
                    <div
                      className="rm-progress__fill"
                      style={{ width: `${score.score}%` }}
                    />
                  </div>

                  <p className="rm-prose mt-8 max-w-[52ch]">{reading.verdict}</p>

                  <div className="mt-7 border-l border-[var(--rm-line-strong)] pl-5">
                    <p className="rm-kicker text-[0.55rem]">Le geste</p>
                    <p className="rm-whisper mt-2 text-[1.05rem] leading-relaxed">
                      {reading.geste}
                    </p>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>

        {/* ── Ce que tu as écrit ── */}
        {written.length > 0 && (
          <Reveal>
            <section className="mt-28">
              <hr className="rm-rule" />
              <p className="rm-kicker mt-14">Tes mots</p>
              <p className="rm-prose mt-5 max-w-[48ch]">
                Relis-les dans trente jours. C’est là que le chemin devient
                visible.
              </p>

              <div className="mt-12 space-y-12">
                {written.map((q) => (
                  <div key={q.id}>
                    <p className="rm-whisper text-[1.02rem]">{q.prompt}</p>
                    <p className="rm-serif mt-4 text-[1.35rem] leading-relaxed text-[var(--rm-text)]">
                      « {answers[q.id]?.text?.trim()} »
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>
        )}

        <Reveal>
          <div className="mt-28 flex flex-col items-center gap-8 text-center">
            <hr className="rm-rule w-40" />
            <Link
              href={ROUTES.home}
              className="text-[0.62rem] uppercase tracking-[0.36em] text-[var(--rm-text-mute)] transition-colors duration-700 hover:text-[var(--rm-gold-soft)]"
            >
              Revenir au seuil
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
