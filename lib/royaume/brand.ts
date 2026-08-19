/**
 * Identité de marque — point de vérité unique.
 * Changer le nom de l'application se fait ici, nulle part ailleurs.
 */
export const BRAND = {
  name: "Braise",
  /** Utilisé en <title>, en OG, et dans les e-mails. */
  fullName: "Braise",
  baseline: "Le feu ne s’éteint pas. Il attend.",
  /** Route racine de l'univers. */
  root: "/royaume",
} as const;

export const ROUTES = {
  home: BRAND.root,
  solo: `${BRAND.root}/solo`,
  duo: `${BRAND.root}/duo`,
  soloResult: `${BRAND.root}/solo/lecture`,
  duoResult: `${BRAND.root}/duo/lecture`,
} as const;

/** Clés de persistance locale — versionnées pour pouvoir migrer sans casser. */
export const STORAGE_KEYS = {
  solo: "royaume:solo:v1",
  duo: "royaume:duo:v1",
} as const;
