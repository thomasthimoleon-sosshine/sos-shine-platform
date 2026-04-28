/**
 * SOS Shine — Shared Animation Variants (Framer Motion)
 * Cinématographiques, lentes, naturelles.
 */

import type { Variants, Transition } from 'framer-motion'

// ── Easings ──

export const ease = {
  default: [0.25, 0.1, 0.25, 1] as const,
  smooth:  [0.16, 1, 0.3, 1] as const,
  spring:  [0.34, 1.56, 0.64, 1] as const,
  gentle:  [0.4, 0, 0.2, 1] as const,
}

// ── Base Transitions ──

export const transition = {
  fast:    { duration: 0.15, ease: ease.default } satisfies Transition,
  base:    { duration: 0.25, ease: ease.default } satisfies Transition,
  slow:    { duration: 0.45, ease: ease.smooth } satisfies Transition,
  slower:  { duration: 0.65, ease: ease.smooth } satisfies Transition,
  spring:  { duration: 0.5, ease: ease.spring } satisfies Transition,
}

// ── Entrance Variants ──

export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: transition.slow },
}

export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: transition.slow },
}

export const fadeDown: Variants = {
  hidden:  { opacity: 0, y: -12 },
  visible: { opacity: 1, y: 0, transition: transition.slow },
}

export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.96, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.35, ease: ease.smooth } },
  exit:    { opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.2, ease: ease.default } },
}

export const slideFromRight: Variants = {
  hidden:  { x: '100%', opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.4, ease: ease.smooth } },
  exit:    { x: '100%', opacity: 0, transition: { duration: 0.3, ease: ease.default } },
}

export const slideFromBottom: Variants = {
  hidden:  { y: '100%', opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: ease.smooth } },
  exit:    { y: '100%', opacity: 0, transition: { duration: 0.3, ease: ease.default } },
}

// ── Stagger Containers ──

export const staggerContainer: Variants = {
  hidden:  {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

export const staggerContainerSlow: Variants = {
  hidden:  {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
}

// ── Stagger Items ──

export const staggerItem: Variants = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: ease.smooth } },
}

// ── Hover/Tap for interactive elements ──

export const cardHover = {
  scale: 1.01,
  transition: { duration: 0.4, ease: ease.smooth },
}

export const buttonTap = {
  scale: 0.98,
}
