"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * Le mouvement est une matière ici : quand l’utilisateur le refuse,
 * on ne dégrade pas l’ambiance, on la fige. Le paysage reste beau, immobile.
 *
 * On s’abonne à la media query plutôt que de la lire dans un effet :
 * pas de rendu en cascade, et le rendu serveur suppose « mouvement accepté ».
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  );
}
