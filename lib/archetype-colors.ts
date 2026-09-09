/**
 * SOS Shine - Archetype Colors
 * Separated from the design system - used only in the Signature Émotionnelle quiz.
 * All colors pass WCAG AA contrast on --surface (#050505).
 */

export const ARCHETYPE_COLORS = {
  P1:  { hex: '#74C0FC', name: 'Analyste',     label: "L'Analyste" },
  P2:  { hex: '#FF8C42', name: 'Electron',     label: "L'Électron Libre" },
  P3:  { hex: '#E879A8', name: 'Pilier',       label: 'Le Pilier' },
  P4:  { hex: '#8B9DC3', name: 'Citadelle',    label: 'La Citadelle' },
  P5:  { hex: '#A3BE8C', name: 'Gardien',      label: 'Le Gardien du Cadre' },
  P6:  { hex: '#C4A0E8', name: 'Cameleon',     label: 'Le Caméléon' },
  P7:  { hex: '#FFD93D', name: 'Vigie',        label: 'La Vigie' },
  P8:  { hex: '#FF6B9D', name: 'Idealiste',    label: "L'Idéaliste" },
  P9:  { hex: '#88D8B0', name: 'Diplomate',    label: 'Le Diplomate' },
  P10: { hex: '#FF5E5B', name: 'Catalyseur',   label: 'Le Catalyseur' },
} as const

export type ArchetypeKey = keyof typeof ARCHETYPE_COLORS
