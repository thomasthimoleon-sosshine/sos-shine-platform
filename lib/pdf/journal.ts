/**
 * SOS Shine - Export du journal intime en PDF
 * Permet aux membres d'exporter leur journal personnel.
 */

import {
  createDocument,
  addPage,
  drawHeader,
  drawFooter,
  drawSeparator,
  drawWrappedText,
  formatDateFR,
  needsNewPage,
  COLORS,
  PAGE,
  CONTENT_WIDTH,
} from './core'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface JournalExportData {
  memberName: string
  exportDate: Date | string
  entries: JournalEntry[]
}

export interface JournalEntry {
  date: Date | string
  title?: string
  content: string
  mood?: string
}

// ─── Génération ──────────────────────────────────────────────────────────────

export async function generateJournalPDF(data: JournalExportData): Promise<Uint8Array> {
  const { doc, fontRegular, fontBold } = await createDocument(
    `Journal Intime - ${data.memberName} - SOS Shine`
  )

  let page = addPage(doc)
  let pageNum = 1
  let y = drawHeader(page, fontBold, 'MON JOURNAL INTIME')

  // ─── Intro ─────────────────────────────────────────────────────────

  y -= 5
  page.drawText(data.memberName, {
    x: PAGE.marginLeft,
    y,
    size: 11,
    font: fontBold,
    color: COLORS.dark,
  })
  y -= 16

  page.drawText(`Exporté le ${formatDateFR(data.exportDate)}`, {
    x: PAGE.marginLeft,
    y,
    size: 9,
    font: fontRegular,
    color: COLORS.gray,
  })
  y -= 10

  page.drawText(`${data.entries.length} entrée${data.entries.length > 1 ? 's' : ''}`, {
    x: PAGE.marginLeft,
    y,
    size: 9,
    font: fontRegular,
    color: COLORS.gray,
  })
  y -= 15

  y = drawSeparator(page, y, COLORS.gold)
  y -= 5

  // ─── Entrées ───────────────────────────────────────────────────────

  for (let i = 0; i < data.entries.length; i++) {
    const entry = data.entries[i]

    // Vérifier si on a besoin d'une nouvelle page
    if (needsNewPage(y, 120)) {
      drawFooter(page, fontRegular, pageNum, undefined)
      page = addPage(doc)
      pageNum++
      y = drawHeader(page, fontBold, 'MON JOURNAL INTIME (suite)')
      y -= 10
    }

    // Date
    const dateStr = formatDateFR(entry.date)
    page.drawRectangle({
      x: PAGE.marginLeft,
      y: y - 3,
      width: CONTENT_WIDTH,
      height: 20,
      color: COLORS.grayBg,
    })

    page.drawText(dateStr, {
      x: PAGE.marginLeft + 10,
      y: y + 2,
      size: 9,
      font: fontBold,
      color: COLORS.gold,
    })

    // Mood emoji si présent
    if (entry.mood) {
      page.drawText(entry.mood, {
        x: PAGE.width - PAGE.marginRight - 30,
        y: y + 2,
        size: 10,
        font: fontRegular,
        color: COLORS.dark,
      })
    }

    y -= 25

    // Titre
    if (entry.title) {
      page.drawText(entry.title, {
        x: PAGE.marginLeft + 10,
        y,
        size: 10,
        font: fontBold,
        color: COLORS.dark,
      })
      y -= 16
    }

    // Contenu
    y = drawWrappedText(
      page,
      entry.content,
      PAGE.marginLeft + 10,
      y,
      {
        font: fontRegular,
        size: 9,
        color: COLORS.dark,
        maxWidth: CONTENT_WIDTH - 20,
        lineHeight: 14,
      }
    )

    y -= 15

    // Séparateur léger entre les entrées (sauf la dernière)
    if (i < data.entries.length - 1) {
      // Petite décoration
      const dotX = PAGE.width / 2
      page.drawText('· · ·', {
        x: dotX - 15,
        y: y + 5,
        size: 10,
        font: fontRegular,
        color: COLORS.goldLight,
      })
      y -= 10
    }
  }

  // ─── Message de fin ────────────────────────────────────────────────

  y -= 20
  if (needsNewPage(y, 60)) {
    drawFooter(page, fontRegular, pageNum, undefined)
    page = addPage(doc)
    pageNum++
    y = PAGE.height - PAGE.marginTop - 60
  }

  y = drawSeparator(page, y, COLORS.gold)

  page.drawText('« Chaque mot écrit est un pas vers la lumière. »', {
    x: PAGE.marginLeft + 60,
    y,
    size: 10,
    font: fontBold,
    color: COLORS.gold,
  })
  y -= 14
  page.drawText('- Julia Laureau, SOS Shine', {
    x: PAGE.marginLeft + 140,
    y,
    size: 8,
    font: fontRegular,
    color: COLORS.gray,
  })

  // ─── Footers ───────────────────────────────────────────────────────

  drawFooter(page, fontRegular, pageNum, pageNum)

  return doc.save()
}
