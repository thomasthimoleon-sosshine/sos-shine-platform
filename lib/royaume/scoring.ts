import type { AnswerMap, Question, ThemeScore } from "./types";

/* ═══════════════════════════════════════════════════════════════
   Notation
   Une note ne juge personne. Elle situe une température : ce qui
   est contracté, ce qui est en chemin, ce qui est disponible.
   Les questions "text" et "multi" ne sont jamais notées — elles
   sont relues telles quelles dans la lecture finale.
═══════════════════════════════════════════════════════════════ */

export const SCALE_MIN = 1;
export const SCALE_MAX = 7;

/** Renvoie la note 1–7 d’une réponse, `null` si la question n’est pas notée. */
export function rawValue(q: Question, answers: AnswerMap): number | null {
  if (q.kind !== "scale" && q.kind !== "choice") return null;
  const v = answers[q.id]?.value;
  if (typeof v !== "number") return null;
  const clamped = Math.min(SCALE_MAX, Math.max(SCALE_MIN, v));
  // Une note haute sur une question inversée signale une contraction.
  return q.reverse ? SCALE_MAX + SCALE_MIN - clamped : clamped;
}

/** Moyenne d’un thème ramenée sur 0–100. */
export function scoreTheme(
  themeId: string,
  questions: Question[],
  answers: AnswerMap
): ThemeScore {
  const values = questions
    .filter((q) => q.themeId === themeId)
    .map((q) => rawValue(q, answers))
    .filter((v): v is number => v !== null);

  if (values.length === 0) return { themeId, score: 0, answered: 0 };

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const score = ((mean - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;

  return { themeId, score: Math.round(score), answered: values.length };
}

export function scoreAll(
  themeIds: string[],
  questions: Question[],
  answers: AnswerMap
): ThemeScore[] {
  return themeIds.map((id) => scoreTheme(id, questions, answers));
}

export type Band = "contracte" | "en-chemin" | "disponible";

export function bandOf(score: number): Band {
  if (score < 42) return "contracte";
  if (score < 68) return "en-chemin";
  return "disponible";
}

export const BAND_LABEL: Record<Band, string> = {
  contracte: "Contracté",
  "en-chemin": "En chemin",
  disponible: "Disponible",
};

/** Part des questions obligatoires effectivement répondues, 0–1. */
export function completion(questions: Question[], answers: AnswerMap): number {
  const required = questions.filter((q) => !q.optional);
  if (required.length === 0) return 1;

  const done = required.filter((q) => {
    const a = answers[q.id];
    if (!a) return false;
    if (q.kind === "text") return Boolean(a.text?.trim());
    if (q.kind === "multi") return Boolean(a.selected?.length);
    return typeof a.value === "number";
  }).length;

  return done / required.length;
}
