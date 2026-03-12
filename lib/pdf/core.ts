/**
 * SOS Shine — PDF Core Library
 * Utilitaires de base pour la génération de PDFs avec le branding SOS Shine.
 */

import { PDFDocument, PDFPage, PDFFont, StandardFonts, rgb, RGB } from 'pdf-lib'

// ─── Couleurs SOS Shine ──────────────────────────────────────────────────────

export const COLORS = {
  dark: rgb(0.07, 0.07, 0.11),        // #121218
  gold: rgb(0.82, 0.68, 0.42),        // #D1AD6B
  goldLight: rgb(0.91, 0.82, 0.63),   // #E8D1A1
  white: rgb(1, 1, 1),
  black: rgb(0, 0, 0),
  gray: rgb(0.45, 0.45, 0.5),         // #737380
  grayLight: rgb(0.85, 0.85, 0.87),   // #D9D9DE
  grayBg: rgb(0.97, 0.97, 0.98),      // #F8F8FA
  green: rgb(0.0, 0.6, 0.35),         // #009959
  red: rgb(0.88, 0.27, 0.33),         // #E14555
  step1: rgb(0.38, 0.59, 0.93),       // #6196EE  Comprendre
  step2: rgb(0.56, 0.27, 0.68),       // #8F45AE  Libérer
  step3: rgb(0.88, 0.44, 0.33),       // #E17055  Agir
} as const

// ─── Constantes de mise en page ──────────────────────────────────────────────

export const PAGE = {
  width: 595.28,    // A4
  height: 841.89,   // A4
  marginLeft: 50,
  marginRight: 50,
  marginTop: 60,
  marginBottom: 60,
} as const

export const CONTENT_WIDTH = PAGE.width - PAGE.marginLeft - PAGE.marginRight

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PDFContext {
  doc: PDFDocument
  page: PDFPage
  fontRegular: PDFFont
  fontBold: PDFFont
  y: number
}

// ─── Création de document ────────────────────────────────────────────────────

export async function createDocument(title: string): Promise<{
  doc: PDFDocument
  fontRegular: PDFFont
  fontBold: PDFFont
}> {
  const doc = await PDFDocument.create()
  doc.setTitle(title)
  doc.setAuthor('SOS Shine')
  doc.setSubject(title)
  doc.setCreator('SOS Shine Platform')

  const fontRegular = await doc.embedFont(StandardFonts.Helvetica)
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold)

  return { doc, fontRegular, fontBold }
}

export function addPage(doc: PDFDocument): PDFPage {
  return doc.addPage([PAGE.width, PAGE.height])
}

// ─── Dessin helpers ──────────────────────────────────────────────────────────

/** Dessine le header SOS Shine sur une page */
export function drawHeader(
  page: PDFPage,
  fontBold: PDFFont,
  subtitle?: string
): number {
  const startY = PAGE.height - PAGE.marginTop

  // Bandeau doré
  page.drawRectangle({
    x: 0,
    y: startY - 5,
    width: PAGE.width,
    height: 45,
    color: COLORS.dark,
  })

  // Titre
  page.drawText('SOS SHINE', {
    x: PAGE.marginLeft,
    y: startY + 8,
    size: 20,
    font: fontBold,
    color: COLORS.gold,
  })

  // Ligne dorée sous le header
  page.drawRectangle({
    x: PAGE.marginLeft,
    y: startY - 8,
    width: CONTENT_WIDTH,
    height: 1.5,
    color: COLORS.gold,
  })

  let y = startY - 30

  if (subtitle) {
    page.drawText(subtitle, {
      x: PAGE.marginLeft,
      y,
      size: 14,
      font: fontBold,
      color: COLORS.dark,
    })
    y -= 25
  }

  return y
}

/** Dessine le footer sur une page */
export function drawFooter(
  page: PDFPage,
  fontRegular: PDFFont,
  pageNumber?: number,
  totalPages?: number
) {
  const y = PAGE.marginBottom - 20

  // Ligne
  page.drawRectangle({
    x: PAGE.marginLeft,
    y: y + 15,
    width: CONTENT_WIDTH,
    height: 0.5,
    color: COLORS.grayLight,
  })

  // Texte gauche
  page.drawText('SOS Shine — Briller Comme un Diamant', {
    x: PAGE.marginLeft,
    y,
    size: 7,
    font: fontRegular,
    color: COLORS.gray,
  })

  // Numéro de page
  if (pageNumber !== undefined && totalPages !== undefined) {
    const pageText = `${pageNumber} / ${totalPages}`
    const textWidth = fontRegular.widthOfTextAtSize(pageText, 7)
    page.drawText(pageText, {
      x: PAGE.width - PAGE.marginRight - textWidth,
      y,
      size: 7,
      font: fontRegular,
      color: COLORS.gray,
    })
  }
}

/** Dessine du texte avec retour à la ligne automatique */
export function drawWrappedText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  options: {
    font: PDFFont
    size: number
    color?: RGB
    maxWidth?: number
    lineHeight?: number
  }
): number {
  const {
    font,
    size,
    color = COLORS.black,
    maxWidth = CONTENT_WIDTH,
    lineHeight = size * 1.4,
  } = options

  const words = text.split(' ')
  let currentLine = ''
  let currentY = y

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    const testWidth = font.widthOfTextAtSize(testLine, size)

    if (testWidth > maxWidth && currentLine) {
      page.drawText(currentLine, { x, y: currentY, size, font, color })
      currentY -= lineHeight
      currentLine = word
    } else {
      currentLine = testLine
    }
  }

  if (currentLine) {
    page.drawText(currentLine, { x, y: currentY, size, font, color })
    currentY -= lineHeight
  }

  return currentY
}

/** Dessine un séparateur horizontal */
export function drawSeparator(
  page: PDFPage,
  y: number,
  color: RGB = COLORS.grayLight
): number {
  page.drawRectangle({
    x: PAGE.marginLeft,
    y,
    width: CONTENT_WIDTH,
    height: 0.5,
    color,
  })
  return y - 15
}

/** Dessine une ligne de tableau (clé: valeur) */
export function drawKeyValue(
  page: PDFPage,
  key: string,
  value: string,
  y: number,
  fontRegular: PDFFont,
  fontBold: PDFFont,
  options?: { size?: number; keyColor?: RGB; valueColor?: RGB }
): number {
  const size = options?.size ?? 10
  const keyColor = options?.keyColor ?? COLORS.gray
  const valueColor = options?.valueColor ?? COLORS.dark

  page.drawText(key, {
    x: PAGE.marginLeft,
    y,
    size,
    font: fontRegular,
    color: keyColor,
  })

  page.drawText(value, {
    x: PAGE.marginLeft + 160,
    y,
    size,
    font: fontBold,
    color: valueColor,
  })

  return y - (size * 1.8)
}

/** Dessine un badge/pastille colorée avec texte */
export function drawBadge(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  font: PDFFont,
  options?: { bgColor?: RGB; textColor?: RGB; size?: number }
) {
  const size = options?.size ?? 8
  const bgColor = options?.bgColor ?? COLORS.gold
  const textColor = options?.textColor ?? COLORS.white
  const textWidth = font.widthOfTextAtSize(text, size)
  const padding = 6

  page.drawRectangle({
    x: x - padding,
    y: y - 3,
    width: textWidth + padding * 2,
    height: size + 6,
    color: bgColor,
    borderColor: bgColor,
    borderWidth: 0,
  })

  page.drawText(text, {
    x,
    y,
    size,
    font,
    color: textColor,
  })
}

/** Formate une date en français */
export function formatDateFR(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

/** Formate un montant en euros */
export function formatEUR(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

/** Vérifie si on a besoin d'une nouvelle page */
export function needsNewPage(y: number, minSpace: number = 100): boolean {
  return y < PAGE.marginBottom + minSpace
}
