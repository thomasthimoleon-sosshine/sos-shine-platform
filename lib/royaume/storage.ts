"use client";

import type { Answer, AnswerMap } from "./types";

/* ═══════════════════════════════════════════════════════════════
   Persistance locale, exposée comme un store externe.

   Le parcours Solo n’exige pas de compte : ce qu’on écrit ici est
   intime, et ça reste sur l’appareil. Le store sert deux besoins :
   partager les réponses entre la traversée et la lecture, et laisser
   React s’y abonner via useSyncExternalStore — donc aucun setState
   dans un effet, aucune cascade de rendus.

   La bascule vers Supabase se fait en remplaçant `read` et `persist`.
═══════════════════════════════════════════════════════════════ */

/** Instantané du rendu serveur : toujours la même référence. */
const EMPTY: AnswerMap = Object.freeze({});

const cache = new Map<string, AnswerMap>();
const listeners = new Map<string, Set<() => void>>();

function persist(key: string, answers: AnswerMap): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(answers));
  } catch {
    // Mode privé, quota plein : on ne casse pas la traversée pour ça.
  }
}

/** Lit une fois, puis sert toujours la même référence — snapshot stable. */
function read(key: string): AnswerMap {
  const hit = cache.get(key);
  if (hit) return hit;

  let value: AnswerMap = EMPTY;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw) value = JSON.parse(raw) as AnswerMap;
  } catch {
    value = EMPTY;
  }

  cache.set(key, value);
  return value;
}

function emit(key: string): void {
  listeners.get(key)?.forEach((fn) => fn());
}

export function subscribeAnswers(key: string) {
  return (onChange: () => void) => {
    const set = listeners.get(key) ?? new Set<() => void>();
    set.add(onChange);
    listeners.set(key, set);
    return () => {
      set.delete(onChange);
    };
  };
}

export function answersSnapshot(key: string) {
  return () => (typeof window === "undefined" ? EMPTY : read(key));
}

export function answersServerSnapshot() {
  return EMPTY;
}

export function putAnswer(key: string, answer: Answer): void {
  const next = { ...read(key), [answer.questionId]: answer };
  cache.set(key, next);
  persist(key, next);
  emit(key);
}

export function clearAnswers(key: string): void {
  cache.set(key, EMPTY);
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* idem */
  }
  emit(key);
}
