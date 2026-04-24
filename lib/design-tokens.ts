/**
 * SOS Shine — Design Tokens
 * Single source of truth for all visual constants.
 *
 * IMPORTANT: These values MUST match the CSS variables in /app/globals.css.
 * Components use var(--xxx) via Tailwind arbitrary values, not these JS values directly.
 * This file exists for documentation, type-safety, and non-CSS contexts (charts, canvas, etc.)
 */

// ── Colors ──

export const colors = {
  brand:       '#C9A961',
  brandLight:  '#E8CC6E',
  brandDeep:   '#B8960F',

  success:     '#55EFC4',
  danger:      '#E85D5D',
  warning:     '#E17055',

  accentBlue:   '#74C0FC',
  accentPurple: '#A29BFE',

  surface:     '#050505',
  surfaceCard: 'rgba(255, 255, 255, 0.05)',
  border:      'rgba(255, 255, 255, 0.08)',

  textPrimary:   '#e0e0e0',
  textSecondary: '#a1a1aa',
  textMuted:     '#52525b',
  textBold:      '#ffffff',

  step1: '#6BD9B4',
  step2: '#7BA7CC',
  step3: '#D4945A',
} as const

// ── Alpha variants (CSS var references) ──

export const alphaVars = {
  brandWeak:         'var(--brand-alpha-weak)',
  brandMedium:       'var(--brand-alpha-medium)',
  brandStrong:       'var(--brand-alpha-strong)',
  successWeak:       'var(--success-alpha-weak)',
  successMedium:     'var(--success-alpha-medium)',
  successStrong:     'var(--success-alpha-strong)',
  dangerWeak:        'var(--danger-alpha-weak)',
  dangerMedium:      'var(--danger-alpha-medium)',
  dangerStrong:      'var(--danger-alpha-strong)',
  accentBlueWeak:    'var(--accent-blue-alpha-weak)',
  accentBlueMedium:  'var(--accent-blue-alpha-medium)',
  accentBlueStrong:  'var(--accent-blue-alpha-strong)',
} as const

// ── Typography ──

export const fontFamily = {
  display: "'Cormorant Garamond', serif",
  body:    "'DM Sans', sans-serif",
} as const

export const fontSize = {
  xs:   '0.6875rem',   // 11px
  sm:   '0.875rem',    // 14px (base)
  base: '1.0625rem',   // 17px
  lg:   '1.375rem',    // 22px
  xl:   '1.6875rem',   // 27px
  '2xl': '2.125rem',   // 34px
  '3xl': '2.6875rem',  // 43px
  '4xl': '3.3125rem',  // 53px
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
  sm:       'var(--shadow-sm)',
  md:       'var(--shadow-md)',
  lg:       'var(--shadow-lg)',
  brand:    'var(--shadow-brand)',
  goldGlow: 'var(--glow-gold)',
} as const

// ── Transitions ──

export const transitions = {
  fast: 'var(--transition-fast)',
  base: 'var(--transition-base)',
  slow: 'var(--transition-slow)',
} as const

// ── Z-Index ──

export const zIndex = {
  dropdown: 50,
  modal:    100,
  toast:    150,
  tooltip:  200,
} as const
