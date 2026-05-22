/**
 * SOS Shine - Génération de factures / reçus PDF
 * Factures pour les abonnements Stripe et reçus de paiement.
 */

import { rgb } from 'pdf-lib'
import {
  createDocument,
  addPage,
  drawHeader,
  drawFooter,
  drawKeyValue,
  drawSeparator,
  drawWrappedText,
  drawBadge,
  formatDateFR,
  formatEUR,
  COLORS,
  PAGE,
  CONTENT_WIDTH,
} from './core'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface InvoiceData {
  invoiceNumber: string
  date: Date | string
  dueDate?: Date | string
  status: 'paid' | 'pending' | 'overdue' | 'refunded'
  customer: {
    name: string
    email: string
    address?: string
  }
  items: InvoiceItem[]
  subtotal: number
  tax?: number
  taxRate?: number
  total: number
  paymentMethod?: string
  stripeInvoiceId?: string
  notes?: string
}

export interface InvoiceItem {
  description: string
  plan?: string
  period?: string
  quantity: number
  unitPrice: number
  total: number
}

// ─── Génération ──────────────────────────────────────────────────────────────

export async function generateInvoicePDF(data: InvoiceData): Promise<Uint8Array> {
  const { doc, fontRegular, fontBold } = await createDocument(
    `Facture ${data.invoiceNumber} - SOS Shine`
  )

  const page = addPage(doc)
  let y = drawHeader(page, fontBold, 'FACTURE')

  // ─── Numéro et statut ─────────────────────────────────────────────

  y -= 5
  page.drawText(`N° ${data.invoiceNumber}`, {
    x: PAGE.marginLeft,
    y,
    size: 12,
    font: fontBold,
    color: COLORS.dark,
  })

  const statusLabels: Record<string, string> = {
    paid: 'PAYÉE',
    pending: 'EN ATTENTE',
    overdue: 'EN RETARD',
    refunded: 'REMBOURSÉE',
  }
  const statusColors: Record<string, typeof COLORS.green> = {
    paid: COLORS.green,
    pending: COLORS.gold,
    overdue: COLORS.red,
    refunded: COLORS.gray,
  }

  drawBadge(
    page,
    statusLabels[data.status] || data.status.toUpperCase(),
    PAGE.width - PAGE.marginRight - 80,
    y,
    fontBold,
    {
      bgColor: statusColors[data.status] || COLORS.gray,
      textColor: COLORS.white,
      size: 9,
    }
  )

  y -= 30

  // ─── Infos émetteur / client ───────────────────────────────────────

  // Émetteur (gauche)
  page.drawText('Émetteur', {
    x: PAGE.marginLeft,
    y,
    size: 8,
    font: fontBold,
    color: COLORS.gray,
  })
  y -= 14
  page.drawText('SOS Shine SAS', {
    x: PAGE.marginLeft,
    y,
    size: 10,
    font: fontBold,
    color: COLORS.dark,
  })
  y -= 14
  page.drawText('contact@sosshine.com', {
    x: PAGE.marginLeft,
    y,
    size: 9,
    font: fontRegular,
    color: COLORS.gray,
  })

  // Client (droite)
  const rightX = PAGE.width - PAGE.marginRight - 200
  let rightY = y + 28
  page.drawText('Client', {
    x: rightX,
    y: rightY,
    size: 8,
    font: fontBold,
    color: COLORS.gray,
  })
  rightY -= 14
  page.drawText(data.customer.name, {
    x: rightX,
    y: rightY,
    size: 10,
    font: fontBold,
    color: COLORS.dark,
  })
  rightY -= 14
  page.drawText(data.customer.email, {
    x: rightX,
    y: rightY,
    size: 9,
    font: fontRegular,
    color: COLORS.gray,
  })
  if (data.customer.address) {
    rightY -= 14
    page.drawText(data.customer.address, {
      x: rightX,
      y: rightY,
      size: 9,
      font: fontRegular,
      color: COLORS.gray,
    })
  }

  y -= 20

  // ─── Dates ─────────────────────────────────────────────────────────

  y = drawKeyValue(page, 'Date de facturation', formatDateFR(data.date), y, fontRegular, fontBold)
  if (data.dueDate) {
    y = drawKeyValue(page, 'Date d\'échéance', formatDateFR(data.dueDate), y, fontRegular, fontBold)
  }
  if (data.paymentMethod) {
    y = drawKeyValue(page, 'Moyen de paiement', data.paymentMethod, y, fontRegular, fontBold)
  }

  y -= 10
  y = drawSeparator(page, y)

  // ─── Tableau des lignes ────────────────────────────────────────────

  // En-tête du tableau
  const colDesc = PAGE.marginLeft
  const colQty = PAGE.marginLeft + 280
  const colUnit = PAGE.marginLeft + 340
  const colTotal = PAGE.marginLeft + 420

  page.drawRectangle({
    x: PAGE.marginLeft,
    y: y - 3,
    width: CONTENT_WIDTH,
    height: 20,
    color: COLORS.grayBg,
  })

  page.drawText('Description', { x: colDesc + 5, y: y + 2, size: 8, font: fontBold, color: COLORS.gray })
  page.drawText('Qté', { x: colQty, y: y + 2, size: 8, font: fontBold, color: COLORS.gray })
  page.drawText('Prix unit.', { x: colUnit, y: y + 2, size: 8, font: fontBold, color: COLORS.gray })
  page.drawText('Total', { x: colTotal, y: y + 2, size: 8, font: fontBold, color: COLORS.gray })

  y -= 25

  // Lignes
  for (const item of data.items) {
    page.drawText(item.description, {
      x: colDesc + 5,
      y,
      size: 9,
      font: fontRegular,
      color: COLORS.dark,
    })
    if (item.period) {
      y -= 12
      page.drawText(item.period, {
        x: colDesc + 5,
        y,
        size: 8,
        font: fontRegular,
        color: COLORS.gray,
      })
      y += 12
    }
    page.drawText(String(item.quantity), { x: colQty, y, size: 9, font: fontRegular, color: COLORS.dark })
    page.drawText(formatEUR(item.unitPrice), { x: colUnit, y, size: 9, font: fontRegular, color: COLORS.dark })
    page.drawText(formatEUR(item.total), { x: colTotal, y, size: 9, font: fontBold, color: COLORS.dark })

    y -= item.period ? 28 : 20
  }

  y -= 5
  y = drawSeparator(page, y)

  // ─── Totaux ────────────────────────────────────────────────────────

  const totalX = colUnit - 30

  page.drawText('Sous-total HT', { x: totalX, y, size: 9, font: fontRegular, color: COLORS.gray })
  page.drawText(formatEUR(data.subtotal), { x: colTotal, y, size: 9, font: fontRegular, color: COLORS.dark })
  y -= 18

  if (data.tax !== undefined) {
    const taxLabel = data.taxRate ? `TVA (${data.taxRate}%)` : 'TVA'
    page.drawText(taxLabel, { x: totalX, y, size: 9, font: fontRegular, color: COLORS.gray })
    page.drawText(formatEUR(data.tax), { x: colTotal, y, size: 9, font: fontRegular, color: COLORS.dark })
    y -= 18
  }

  // Total TTC
  page.drawRectangle({
    x: totalX - 10,
    y: y - 5,
    width: CONTENT_WIDTH - (totalX - PAGE.marginLeft) + 10,
    height: 25,
    color: COLORS.dark,
  })

  page.drawText('TOTAL TTC', { x: totalX, y: y + 2, size: 10, font: fontBold, color: COLORS.gold })
  page.drawText(formatEUR(data.total), { x: colTotal, y: y + 2, size: 11, font: fontBold, color: COLORS.gold })

  y -= 40

  // ─── Notes ─────────────────────────────────────────────────────────

  if (data.notes) {
    page.drawText('Notes', { x: PAGE.marginLeft, y, size: 8, font: fontBold, color: COLORS.gray })
    y -= 14
    y = drawWrappedText(page, data.notes, PAGE.marginLeft, y, {
      font: fontRegular,
      size: 9,
      color: COLORS.gray,
    })
  }

  // ─── Référence Stripe ──────────────────────────────────────────────

  if (data.stripeInvoiceId) {
    y -= 10
    page.drawText(`Réf. Stripe : ${data.stripeInvoiceId}`, {
      x: PAGE.marginLeft,
      y,
      size: 7,
      font: fontRegular,
      color: COLORS.grayLight,
    })
  }

  // ─── Footer ────────────────────────────────────────────────────────

  drawFooter(page, fontRegular, 1, 1)

  return doc.save()
}
