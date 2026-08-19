/**
 * Géométrie du paysage — entièrement déterministe.
 *
 * Aucun Math.random() : les silhouettes sont générées à partir d'un PRNG
 * à graine fixe, donc le rendu serveur et le rendu client sont identiques
 * (pas d'écart d'hydratation, pas de scintillement au premier paint).
 */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const SCENE_W = 1440;

/** Crête lointaine — molle, presque une rumeur. */
export const RIDGE_FAR =
  "M0 400 L0 268 L96 232 L188 258 L286 196 L372 240 L470 202 L578 254 " +
  "L672 214 L784 252 L888 200 L992 246 L1108 208 L1216 250 L1320 216 " +
  "L1440 244 L1440 400 Z";

/** Crête médiane — plus haute, plus présente. */
export const RIDGE_MID =
  "M0 400 L0 300 L118 258 L226 288 L332 226 L438 276 L556 232 L668 284 " +
  "L790 238 L902 282 L1024 234 L1142 280 L1268 240 L1360 278 L1440 252 " +
  "L1440 400 Z";

/**
 * Ligne d'arbres : sapins serrés, hauteurs irrégulières.
 * @param seed graine — change la forêt sans changer le code
 */
export function buildTreeline(seed = 7, height = 260): string {
  const rand = mulberry32(seed);
  const parts: string[] = [`M0 ${height}`];
  let x = -20;

  while (x < SCENE_W + 20) {
    const w = 9 + rand() * 16;
    const h = 42 + rand() * 96;
    const base = height - 4 - rand() * 14;
    parts.push(`L${(x - w).toFixed(1)} ${base.toFixed(1)}`);
    parts.push(`L${x.toFixed(1)} ${(base - h).toFixed(1)}`);
    parts.push(`L${(x + w).toFixed(1)} ${base.toFixed(1)}`);
    x += w * (1.05 + rand() * 0.75);
  }

  parts.push(`L${SCENE_W} ${height}`, "Z");
  return parts.join(" ");
}

export type Star = { x: number; y: number; r: number; o: number; delay: number };

export function buildStars(seed = 21, count = 120): Star[] {
  const rand = mulberry32(seed);
  return Array.from({ length: count }, (_, i) => ({
    x: rand() * 100,
    // Concentrées dans la moitié haute : le ciel, pas le sol.
    y: rand() * 58,
    r: 0.4 + rand() * 1.1,
    o: 0.18 + rand() * 0.62,
    delay: (i % 17) * 0.41,
  }));
}

export type Ember = {
  x: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  o: number;
};

/** Braises qui montent du sol — lentes, jamais festives. */
export function buildEmbers(seed = 3, count = 26): Ember[] {
  const rand = mulberry32(seed);
  return Array.from({ length: count }, () => ({
    x: rand() * 100,
    size: 1.2 + rand() * 2.6,
    duration: 13 + rand() * 16,
    delay: -rand() * 24,
    drift: (rand() - 0.5) * 90,
    o: 0.25 + rand() * 0.5,
  }));
}
