/**
 * SOS Shine — Typography System
 * Base: 14px | Ratio: 1.25 (Major Third)
 * Font: Cormorant Garamond (display) + DM Sans (body)
 *
 * STRICT RULE: no text size outside this scale.
 * If you need something between two steps, use the smaller one.
 */

export const typeScale = {
  xs:   { size: '0.6875rem', px: 11, use: 'Metadata, timestamps, footnotes' },
  sm:   { size: '0.875rem',  px: 14, use: 'Body text, labels, buttons (base)' },
  base: { size: '1.0625rem', px: 17, use: 'Paragraphs, descriptions' },
  lg:   { size: '1.375rem',  px: 22, use: 'Section headers, card titles' },
  xl:   { size: '1.6875rem', px: 27, use: 'Page titles (mobile)' },
  '2xl': { size: '2.125rem', px: 34, use: 'Page titles (desktop)' },
  '3xl': { size: '2.6875rem', px: 43, use: 'Hero headings (mobile)' },
  '4xl': { size: '3.3125rem', px: 53, use: 'Hero headings (desktop)' },
} as const

/**
 * Tailwind class mapping (for quick reference):
 *
 * | Token | Tailwind         | Pixels |
 * |-------|------------------|--------|
 * | xs    | text-[0.6875rem] | 11px   |
 * | sm    | text-sm          | 14px   |
 * | base  | text-[1.0625rem] | 17px   |
 * | lg    | text-[1.375rem]  | 22px   |
 * | xl    | text-[1.6875rem] | 27px   |
 * | 2xl   | text-[2.125rem]  | 34px   |
 * | 3xl   | text-[2.6875rem] | 43px   |
 * | 4xl   | text-[3.3125rem] | 53px   |
 *
 * DEPRECATED sizes (do not use):
 * text-[10px], text-[11px], text-[13px], text-[15px],
 * text-base (16px — use 'base' 17px instead),
 * text-xs (12px — use 'xs' 11px instead)
 */
