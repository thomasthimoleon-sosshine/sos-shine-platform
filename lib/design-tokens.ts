/**
 * SOS Shine - Design Tokens v4
 * Premium Sanctuary Design System
 *
 * Direction : noir profond · bleu nuit · ivoire · or subtil
 * Références : Apple, Calm, Linear, MasterClass
 *
 * IMPORTANT: Ces valeurs DOIVENT correspondre aux CSS variables dans /app/globals.css.
 * Les composants utilisent var(--xxx) via Tailwind, pas ces valeurs JS directement.
 * Ce fichier existe pour la documentation, le type-safety, et les contextes non-CSS.
 */

// ── Palette ──

export const palette = {
  // Noir profond - pas un noir plat, un noir avec de la profondeur
  black:      '#08090A',
  blackPure:  '#000000',
  blackWarm:  '#0C0D0F',

  // Bleu nuit - la couleur signature de l'immersion
  night:       '#0F1624',
  nightDeep:   '#0A0F1A',
  nightLight:  '#162038',
  nightMuted:  '#1A2540',

  // Ivoire - chaleur, humanité, respiration
  ivory:       '#F5F0E8',
  ivoryMuted:  '#E8E2D6',
  ivoryWarm:   '#FBF8F3',

  // Or subtil - pas brillant, patiné, vécu
  gold:        '#B8A472',
  goldLight:   '#D4C99A',
  goldDeep:    '#96845A',
  goldMuted:   '#A69768',

  // Blanc - texte et accents
  white:       '#FAFAF8',
  whiteMuted:  '#E8E6E1',
} as const

// ── Couleurs sémantiques ──

export const colors = {
  // Brand
  brand:       '#B8A472',
  brandLight:  '#D4C99A',
  brandDeep:   '#96845A',
  brandMuted:  '#A69768',

  // Status
  success:     '#6BCFA0',
  danger:      '#D46A6A',
  warning:     '#D4A054',
  info:        '#6B9FD4',

  // Surfaces
  surface:         '#08090A',
  surfaceRaised:   '#0F1624',
  surfaceCard:     '#131A2B',
  surfaceOverlay:  'rgba(8, 9, 10, 0.85)',

  // Borders
  border:         'rgba(184, 164, 114, 0.08)',
  borderSubtle:   'rgba(255, 255, 255, 0.04)',
  borderMedium:   'rgba(184, 164, 114, 0.15)',
  borderStrong:   'rgba(184, 164, 114, 0.25)',

  // Text
  textPrimary:    '#F5F0E8',
  textSecondary:  '#A8A29E',
  textMuted:      '#64605A',
  textInverse:    '#08090A',

  // Accents
  accentBlue:    '#6B9FD4',
  accentPurple:  '#9B8FD4',
  accentTeal:    '#6BBFB5',
  accentRose:    '#D48FA0',

  // Steps (encyclopédie)
  step1: '#6BCFA0',
  step2: '#6B9FD4',
  step3: '#D4A054',
} as const

// ── Alpha variants ──

export const alpha = {
  brandWeak:     'rgba(184, 164, 114, 0.06)',
  brandMedium:   'rgba(184, 164, 114, 0.12)',
  brandStrong:   'rgba(184, 164, 114, 0.24)',

  successWeak:   'rgba(107, 207, 160, 0.08)',
  successMedium: 'rgba(107, 207, 160, 0.16)',
  successStrong: 'rgba(107, 207, 160, 0.32)',

  dangerWeak:    'rgba(212, 106, 106, 0.08)',
  dangerMedium:  'rgba(212, 106, 106, 0.16)',
  dangerStrong:  'rgba(212, 106, 106, 0.32)',

  nightWeak:     'rgba(15, 22, 36, 0.40)',
  nightMedium:   'rgba(15, 22, 36, 0.60)',
  nightStrong:   'rgba(15, 22, 36, 0.80)',
} as const

// ── Typographie ──

export const fontFamily = {
  display: "'Cormorant Garamond', 'Georgia', serif",
  body:    "'DM Sans', 'system-ui', sans-serif",
  mono:    "'JetBrains Mono', 'Fira Code', monospace",
} as const

export const fontSize = {
  '2xs':  '0.625rem',    // 10px - micro labels
  xs:     '0.6875rem',   // 11px - captions, metadata
  sm:     '0.8125rem',   // 13px - secondary text
  base:   '0.9375rem',   // 15px - body
  md:     '1.0625rem',   // 17px - emphasized body
  lg:     '1.25rem',     // 20px - section titles
  xl:     '1.5rem',      // 24px - page subtitles
  '2xl':  '1.875rem',    // 30px - page titles
  '3xl':  '2.5rem',      // 40px - hero subtitles
  '4xl':  '3.25rem',     // 52px - hero titles
  '5xl':  '4rem',        // 64px - display
} as const

export const fontWeight = {
  light:    300,
  regular:  400,
  medium:   500,
  semibold: 600,
  bold:     700,
} as const

export const lineHeight = {
  none:    1,
  tight:   1.15,
  snug:    1.3,
  normal:  1.5,
  relaxed: 1.65,
  loose:   1.8,
} as const

export const letterSpacing = {
  tight:   '-0.02em',
  normal:  '0',
  wide:    '0.02em',
  wider:   '0.05em',
  widest:  '0.12em',
} as const

// ── Spacing (8px base grid) ──

export const spacing = {
  0:   '0',
  px:  '1px',
  0.5: '2px',
  1:   '4px',
  1.5: '6px',
  2:   '8px',
  3:   '12px',
  4:   '16px',
  5:   '20px',
  6:   '24px',
  8:   '32px',
  10:  '40px',
  12:  '48px',
  16:  '64px',
  20:  '80px',
  24:  '96px',
  32:  '128px',
} as const

// ── Border Radius ──

export const radii = {
  none: '0',
  sm:   '6px',
  md:   '10px',
  lg:   '14px',
  xl:   '20px',
  '2xl': '28px',
  full: '9999px',
} as const

// ── Shadows ──

export const shadows = {
  none:  'none',
  xs:    '0 1px 2px rgba(0, 0, 0, 0.2)',
  sm:    '0 2px 8px rgba(0, 0, 0, 0.2)',
  md:    '0 4px 16px rgba(0, 0, 0, 0.25)',
  lg:    '0 8px 32px rgba(0, 0, 0, 0.3)',
  xl:    '0 16px 48px rgba(0, 0, 0, 0.35)',
  '2xl': '0 24px 64px rgba(0, 0, 0, 0.4)',

  // Brand glow - subtil, pas criard
  glow:      '0 0 24px rgba(184, 164, 114, 0.08)',
  glowHover: '0 0 40px rgba(184, 164, 114, 0.12)',
  glowStrong:'0 0 60px rgba(184, 164, 114, 0.18)',

  // Inner shadows pour profondeur
  inner:     'inset 0 1px 2px rgba(0, 0, 0, 0.3)',
  innerLg:   'inset 0 2px 8px rgba(0, 0, 0, 0.4)',
} as const

// ── Transitions ──

export const transitions = {
  fast:    '120ms cubic-bezier(0.25, 0.1, 0.25, 1)',
  base:    '220ms cubic-bezier(0.25, 0.1, 0.25, 1)',
  slow:    '400ms cubic-bezier(0.25, 0.1, 0.25, 1)',
  slower:  '600ms cubic-bezier(0.16, 1, 0.3, 1)',
  spring:  '500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const

export const easings = {
  default:  'cubic-bezier(0.25, 0.1, 0.25, 1)',
  smooth:   'cubic-bezier(0.16, 1, 0.3, 1)',
  spring:   'cubic-bezier(0.34, 1.56, 0.64, 1)',
  gentle:   'cubic-bezier(0.4, 0, 0.2, 1)',
} as const

// ── Z-Index ──

export const zIndex = {
  hide:     -1,
  base:     0,
  raised:   1,
  dropdown: 50,
  sticky:   60,
  overlay:  70,
  modal:    80,
  toast:    90,
  tooltip:  100,
  max:      999,
} as const

// ── Breakpoints ──

export const breakpoints = {
  sm:  '640px',
  md:  '768px',
  lg:  '1024px',
  xl:  '1280px',
  '2xl': '1536px',
} as const

// ── Animation Durations ──

export const durations = {
  instant:  '0ms',
  fast:     '120ms',
  base:     '220ms',
  slow:     '400ms',
  slower:   '600ms',
  slowest:  '1000ms',
  entrance: '500ms',
  exit:     '300ms',
} as const
