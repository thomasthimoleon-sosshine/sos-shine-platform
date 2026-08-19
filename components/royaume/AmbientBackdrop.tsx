"use client";

import { buildEmbers } from "./scene-geometry";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

const EMBERS = buildEmbers(11, 14);

/**
 * Décor des pages intérieures.
 *
 * Pas de parallaxe ici : dans le questionnaire, le scroll appartient au
 * texte. On garde seulement la matière — le noir profond, le foyer bas,
 * quelques braises. Le paysage attend dehors.
 */
export default function AmbientBackdrop() {
  const reduced = usePrefersReducedMotion();

  return (
    <div className="fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #040202 0%, #0A0607 42%, #1A0910 74%, #2E0C15 100%)",
        }}
      />
      <div
        className="absolute -bottom-[35vh] left-1/2 h-[80vh] w-[150vw] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(216,65,47,0.20) 0%, rgba(110,24,38,0.12) 34%, transparent 68%)",
        }}
      />

      {!reduced &&
        EMBERS.map((e, i) => (
          <span
            key={i}
            className="rm-ember"
            style={
              {
                left: `${e.x}%`,
                width: `${e.size}px`,
                height: `${e.size}px`,
                opacity: e.o * 0.7,
                animationDuration: `${e.duration}s`,
                animationDelay: `${e.delay}s`,
                "--rm-drift": `${e.drift}px`,
              } as React.CSSProperties
            }
          />
        ))}

      <div className="rm-vignette" />
    </div>
  );
}
