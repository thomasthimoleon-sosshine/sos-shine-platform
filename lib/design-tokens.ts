/**
 * SOS Shine — Design Tokens
 * Single source of truth for all visual constants.
 * Import this file instead of using hardcoded values.
 */

// ── Colors ──

export const colors = {
  // Brand
  brand:       '#D4AF37',
  brandAlt:    '#C9A961', // or patiné (alternative — choose one)
  brandLight:  '#E8CC6E',
  brandDeep:   '#B8960F',

  // Status
  success:     '#55EFC4',
  danger:      '#E85D5D',
  warning:     '#E17055',

  // Accents
  accentBlue:   '#74C0FC',
  accentPurple: '#A29BFE',

  // Surfaces
  surface:     '#050505',
  surfaceCard: 'rgba(255, 255, 255, 0.05)',
  border:      'rgba(255, 255, 255, 0.08)',

  // Text
  textPrimary:   '#e0e0e0',
  textSecondary: '#a1a1aa',
  textMuted:     '#52525b',
  textBold:      '#ffffff',

  // Steps (encyclopedia)
  step1: '#6BD9B4', // Comprendre — vert-menthe
  step2: '#7BA7CC', // Libérer — bleu-ardoise
  step3: '#D4945A', // Agir — ambre-chaud
} as const

// ── Alpha variants (3 levels: weak 8%, medium 16%, strong 32%) ──

export const alpha = {
  brandWeak:       'rgba(212, 175, 55, 0.08)',
  brandMedium:     'rgba(212, 175, 55, 0.16)',
  brandStrong:     'rgba(212, 175, 55, 0.32)',

  successWeak:     'rgba(85, 239, 196, 0.08)',
  successMedium:   'rgba(85, 239, 196, 0.16)',
  successStrong:   'rgba(85, 239, 196, 0.32)',

  dangerWeak:      'rgba(232, 93, 93, 0.08)',
  dangerMedium:    'rgba(232, 93, 93, 0.16)',
  dangerStrong:    'rgba(232, 93, 93, 0.32)',

  accentBlueWeak:   'rgba(116, 192, 252, 0.08)',
  accentBlueMedium: 'rgba(116, 192, 252, 0.16)',
  accentBlueStrong: 'rgba(116, 192, 252, 0.32)',
} as const

// ── Typography ──

export const fontFamily = {
  display: "'Cormorant Garamond', serif",
  body:    "'DM Sans', sans-serif",
} as const

// Type scale: base 14px, ratio 1.25 (major third)
export const fontSize = {
  xs:   '0.6875rem',  // 11px
  sm:   '0.875rem',   // 14px (base)
  base: '1.0625rem',  // 17px
  lg:   '1.375rem',   // 22px
  xl:   '1.6875rem',  // 27px
  '2xl': '2.125rem',  // 34px
  '3xl': '2.6875rem', // 43px
  '4xl': '3.3125rem', // 53px
} as const

export const fontWeight = {
  light:    300,
  regular:  400,
  medium:   500,
  semibold: 600,
} as const

export const lineHeight = {
  tight:   1.2,
  snug:    1.35,
  normal:  1.5,
  relaxed: 1.65,
} as const

// ── Spacing ──

export const spacing = {
  0:  '0px',
  1:  '4px',
  2:  '8px',
  3:  '12px',
  4:  '16px',
  6:  '24px',
  8:  '32px',
  12: '48px',
  16: '64px',
  24: '96px',
} as const

// ── Border Radius ──

export const radii = {
  sm:   '6px',
  md:   '10px',
  lg:   '16px',
  xl:   '24px',
  full: '9999px',
} as const

// ── Shadows ──

export const shadows = {
  sm:       '0 2px 8px rgba(0, 0, 0, 0.15)',
  md:       '0 8px 24px rgba(0, 0, 0, 0.25)',
  lg:       '0 20px 48px rgba(0, 0, 0, 0.35)',
  goldGlow: '0 0 32px rgba(212, 175, 55, 0.12)',
} as const

// ── Transitions ──

export const transitions = {
  fast: '150ms ease',
  base: '250ms ease',
  slow: '400ms ease',
} as const

// ── Z-Index ──

export const zIndex = {
  dropdown: 50,
  modal:    100,
  toast:    150,
  tooltip:  200,
} as const
