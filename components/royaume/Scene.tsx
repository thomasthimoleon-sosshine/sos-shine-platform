"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import {
  RIDGE_FAR,
  RIDGE_MID,
  buildEmbers,
  buildStars,
  buildTreeline,
} from "./scene-geometry";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

const TREELINE = buildTreeline(7, 260);
const STARS = buildStars(21, 120);
const EMBERS = buildEmbers(3, 26);

/**
 * Le paysage vivant.
 *
 * Une seule scène, fixée derrière toute la page. Le scroll ne fait pas
 * défiler des images : il fait passer la vallée de la nuit noire à la braise,
 * puis à la première lumière. On avance sur le chemin — les plans proches
 * glissent plus vite que les crêtes lointaines, le ciel s'ouvre, le sentier
 * s'éclaire. C'est la transformation intérieure, racontée par le décor.
 */
export default function Scene() {
  const { scrollYProgress } = useScroll();
  const reduced = usePrefersReducedMotion();

  /** N'applique la parallaxe que si l'utilisateur accepte le mouvement. */
  const drift = (mv: MotionValue<number>) => (reduced ? undefined : mv);

  // ── Ciel : trois états qui se traversent ──
  const nightOpacity = useTransform(scrollYProgress, [0, 0.42], [1, 0]);
  const emberOpacity = useTransform(scrollYProgress, [0.14, 0.5, 0.86], [0, 1, 0.35]);
  const dawnOpacity = useTransform(scrollYProgress, [0.52, 1], [0, 1]);

  // ── Étoiles : elles se retirent quand la chaleur monte ──
  const starOpacity = useTransform(scrollYProgress, [0, 0.38], [1, 0]);

  // ── Foyer à l'horizon : ce vers quoi on marche ──
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.18, 0.62, 1]);
  const glowScale = useTransform(scrollYProgress, [0, 1], [0.5, 1.15]);

  // ── Parallaxe : plus c'est proche, plus ça bouge ──
  const yFar = useTransform(scrollYProgress, [0, 1], [0, -10]);
  const yMid = useTransform(scrollYProgress, [0, 1], [0, -18]);
  const yTrees = useTransform(scrollYProgress, [0, 1], [0, -38]);

  // ── Brumes : elles se lèvent ──
  const fogFarX = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const fogNearX = useTransform(scrollYProgress, [0, 1], [0, -190]);
  const fogOpacity = useTransform(scrollYProgress, [0, 0.55, 1], [0.5, 0.28, 0.1]);

  // ── Le chemin : invisible au départ, évident à la fin ──
  const trailOpacity = useTransform(scrollYProgress, [0, 0.45, 1], [0.10, 0.34, 0.62]);
  const emberFieldOpacity = useTransform(scrollYProgress, [0.1, 0.6], [0, 1]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* ═══ CIEL ═══ */}
      <motion.div
        className="absolute inset-0"
        style={{
          opacity: nightOpacity,
          background:
            "linear-gradient(180deg, #030202 0%, #060404 26%, #0D0608 44%, #1B0A11 57%, #0A0507 74%, #040202 100%)",
        }}
      />
      <motion.div
        className="absolute inset-0"
        style={{
          opacity: emberOpacity,
          background:
            "linear-gradient(180deg, #070405 0%, #140810 22%, #33101B 40%, #6E1826 53%, #8E2029 58%, #34101A 66%, #0A0506 100%)",
        }}
      />
      <motion.div
        className="absolute inset-0"
        style={{
          opacity: dawnOpacity,
          background:
            "linear-gradient(180deg, #0B0607 0%, #240B14 16%, #571626 32%, #9B2E2B 46%, #C2542E 55%, #D2793C 58%, #8E2029 63%, #3A0E18 72%, #12070A 86%, #050303 100%)",
        }}
      />

      {/* ═══ ÉTOILES ═══ */}
      <motion.svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ opacity: starOpacity }}
      >
        {STARS.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r / 12}
            fill="#F3D9B8"
            opacity={s.o}
            className={reduced ? undefined : "rm-star"}
            style={reduced ? undefined : { animationDelay: `${s.delay}s` }}
          />
        ))}
      </motion.svg>

      {/* ═══ FOYER À L'HORIZON ═══ */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-[57%] h-[52vh] w-[120vw] -translate-x-1/2 -translate-y-1/2"
        style={{
          opacity: glowOpacity,
          scale: glowScale,
          background:
            "radial-gradient(ellipse 34% 46% at 50% 50%, rgba(243,217,184,0.72) 0%, rgba(243,217,184,0.34) 14%, rgba(216,65,47,0.26) 32%, rgba(110,24,38,0.12) 56%, transparent 76%)",
        }}
      />

      {/* ═══ CRÊTE LOINTAINE ═══ */}
      <motion.svg
        className="absolute bottom-[46%] left-0 w-full"
        style={{ y: drift(yFar), height: "20vh" }}
        viewBox="0 0 1440 400"
        preserveAspectRatio="none"
      >
        <path d={RIDGE_FAR} fill="#1E0B12" opacity="0.85" />
      </motion.svg>

      {/* ═══ CRÊTE MÉDIANE ═══ */}
      <motion.svg
        className="absolute bottom-[42%] left-0 w-full"
        style={{ y: drift(yMid), height: "18vh" }}
        viewBox="0 0 1440 400"
        preserveAspectRatio="none"
      >
        <path d={RIDGE_MID} fill="#120709" opacity="0.95" />
      </motion.svg>

      {/* ═══ BRUME LOINTAINE ═══ */}
      <motion.div
        className="absolute bottom-[47%] left-[-20%] h-[12vh] w-[140%]"
        style={{
          x: drift(fogFarX),
          opacity: fogOpacity,
          background:
            "linear-gradient(180deg, transparent, rgba(243,217,184,0.10) 45%, transparent)",
          filter: "blur(22px)",
        }}
      />

      {/* ═══ LIGNE D'ARBRES ═══ */}
      <motion.svg
        className="absolute bottom-[40%] left-0 w-full"
        style={{ y: drift(yTrees), height: "26vh" }}
        viewBox="0 0 1440 260"
        preserveAspectRatio="none"
      >
        <path d={TREELINE} fill="#070405" />
      </motion.svg>

      {/* ═══ SOL & CHEMIN ═══ */}
      <div
        className="absolute left-0 w-full"
        // Le sol déborde sous le cadre et ne bouge jamais : sa ligne
        // haute EST l'horizon, à 58 % de l'écran. Tout le reste s'y
        // accroche.
        style={{ bottom: "-22vh", height: "64vh" }}
      >
        <svg
          className="h-full w-full"
          viewBox="0 0 1440 640"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="rm-ground" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1C0A10" />
              <stop offset="38%" stopColor="#0C0507" />
              <stop offset="100%" stopColor="#040202" />
            </linearGradient>
            <linearGradient id="rm-trail" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F3D9B8" stopOpacity="0.55" />
              <stop offset="22%" stopColor="#C0562F" stopOpacity="0.22" />
              <stop offset="58%" stopColor="#6E1826" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#2A0B12" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          <rect x="0" y="0" width="1440" height="640" fill="url(#rm-ground)" />

          {/* Le sentier — il naît sous les pieds et va se perdre dans la lumière. */}
          <motion.g style={{ opacity: trailOpacity }}>
            <path
              d="M636 640 C 676 420, 704 190, 715 2 L 727 2 C 740 190, 774 420, 822 640 Z"
              fill="url(#rm-trail)"
              style={{ filter: "blur(1.5px)" }}
            />
            <path
              d="M636 640 C 676 420, 704 190, 715 2"
              stroke="#F3D9B8"
              strokeOpacity="0.10"
              strokeWidth="1"
              fill="none"
            />
            <path
              d="M822 640 C 774 420, 740 190, 727 2"
              stroke="#F3D9B8"
              strokeOpacity="0.10"
              strokeWidth="1"
              fill="none"
            />
          </motion.g>
        </svg>
      </div>

      {/* ═══ BRAISES QUI MONTENT ═══ */}
      {!reduced && (
        <motion.div
          className="absolute inset-0"
          style={{ opacity: emberFieldOpacity }}
        >
          {EMBERS.map((e, i) => (
            <span
              key={i}
              className="rm-ember"
              style={
                {
                  left: `${e.x}%`,
                  width: `${e.size}px`,
                  height: `${e.size}px`,
                  opacity: e.o,
                  animationDuration: `${e.duration}s`,
                  animationDelay: `${e.delay}s`,
                  "--rm-drift": `${e.drift}px`,
                } as React.CSSProperties
              }
            />
          ))}
        </motion.div>
      )}

      {/* ═══ BRUME PROCHE ═══ */}
      <motion.div
        className="absolute bottom-[38%] left-[-20%] h-[16vh] w-[150%]"
        style={{
          x: drift(fogNearX),
          opacity: fogOpacity,
          background:
            "linear-gradient(180deg, transparent, rgba(243,217,184,0.07) 50%, transparent)",
          filter: "blur(30px)",
        }}
      />

      <div className="rm-vignette" />
    </div>
  );
}
