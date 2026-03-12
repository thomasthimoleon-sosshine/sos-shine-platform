/**
 * SOS Shine — Rapport d'affiliation PDF
 * Génère un relevé détaillé des gains, conversions et clics d'un affilié.
 */

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
  needsNewPage,
  COLORS,
  PAGE,
  CONTENT_WIDTH,
} from './core'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AffiliationReportData {
  affiliate: {
    name: string
    email: string
    referralCode: string
    tier: 'bronze' | 'silver' | 'gold' | 'diamond'
    commissionRate: number
  }
  period: {
    from: Date | string
    to: Date | string
  }
  summary: {
    totalClicks: number
    totalConversions: number
    totalEarnings: number
    pendingEarnings: number
    paidEarnings: number
    conversionRate: number
  }
  conversions: AffiliationConversion[]
  withdrawals: AffiliationWithdrawal[]
}

export interface AffiliationConversion {
  date: Date | string
  memberName: string
  type: 'signup' | 'subscription' | 'renewal'
  plan: string
  amount: number
  commission: number
  status: 'pending' | 'confirmed' | 'paid'
}

export interface AffiliationWithdrawal {
  date: Date | string
  amount: number
  method: 'iban' | 'paypal'
  status: 'pending' | 'processing' | 'completed' | 'rejected'
}

// ─── Génération ──────────────────────────────────────────────────────────────

export async function generateAffiliationReportPDF(
  data: AffiliationReportData
): Promise<Uint8Array> {
  const { doc, fontRegular, fontBold } = await createDocument(
    `Rapport Affiliation — ${data.affiliate.name} — SOS Shine`
  )

  let page = addPage(doc)
  let y = drawHeader(page, fontBold, 'RAPPORT D\'AFFILIATION')
  let pageNum = 1

  // ─── Infos affilié ────────────────────────────────────────────────

  y -= 5
  const tierLabels: Record<string, string> = {
    bronze: 'BRONZE (10%)',
    silver: 'SILVER (15%)',
    gold: 'GOLD (20%)',
    diamond: 'DIAMOND (25%)',
  }
  const tierColors = {
    bronze: COLORS.step3,
    silver: COLORS.gray,
    gold: COLORS.gold,
    diamond: COLORS.step1,
  }

  y = drawKeyValue(page, 'Affilié', data.affiliate.name, y, fontRegular, fontBold)
  y = drawKeyValue(page, 'Email', data.affiliate.email, y, fontRegular, fontBold)
  y = drawKeyValue(page, 'Code parrainage', data.affiliate.referralCode, y, fontRegular, fontBold)

  drawBadge(
    page,
    tierLabels[data.affiliate.tier],
    PAGE.width - PAGE.marginRight - 120,
    y + 50,
    fontBold,
    {
      bgColor: tierColors[data.affiliate.tier],
      textColor: COLORS.white,
    }
  )

  y = drawKeyValue(
    page,
    'Période',
    `${formatDateFR(data.period.from)} → ${formatDateFR(data.period.to)}`,
    y,
    fontRegular,
    fontBold
  )

  y -= 10
  y = drawSeparator(page, y)

  // ─── Résumé ────────────────────────────────────────────────────────

  page.drawText('RÉSUMÉ', {
    x: PAGE.marginLeft,
    y,
    size: 12,
    font: fontBold,
    color: COLORS.dark,
  })
  y -= 25

  // Cartes de stats (3 colonnes)
  const cardWidth = (CONTENT_WIDTH - 20) / 3
  const cards = [
    { label: 'Clics', value: String(data.summary.totalClicks), color: COLORS.step1 },
    { label: 'Conversions', value: String(data.summary.totalConversions), color: COLORS.step2 },
    { label: 'Taux conversion', value: `${data.summary.conversionRate.toFixed(1)}%`, color: COLORS.step3 },
  ]

  for (let i = 0; i < cards.length; i++) {
    const cardX = PAGE.marginLeft + i * (cardWidth + 10)
    page.drawRectangle({
      x: cardX,
      y: y - 10,
      width: cardWidth,
      height: 50,
      color: COLORS.grayBg,
      borderColor: cards[i].color,
      borderWidth: 1.5,
    })
    page.drawText(cards[i].value, {
      x: cardX + 15,
      y: y + 15,
      size: 18,
      font: fontBold,
      color: cards[i].color,
    })
    page.drawText(cards[i].label, {
      x: cardX + 15,
      y: y - 2,
      size: 8,
      font: fontRegular,
      color: COLORS.gray,
    })
  }
  y -= 70

  // Gains
  y = drawKeyValue(page, 'Gains totaux', formatEUR(data.summary.totalEarnings), y, fontRegular, fontBold, {
    valueColor: COLORS.green,
  })
  y = drawKeyValue(page, 'Gains en attente', formatEUR(data.summary.pendingEarnings), y, fontRegular, fontBold, {
    valueColor: COLORS.gold,
  })
  y = drawKeyValue(page, 'Gains versés', formatEUR(data.summary.paidEarnings), y, fontRegular, fontBold)

  y -= 10
  y = drawSeparator(page, y)

  // ─── Tableau des conversions ───────────────────────────────────────

  if (data.conversions.length > 0) {
    page.drawText('DÉTAIL DES CONVERSIONS', {
      x: PAGE.marginLeft,
      y,
      size: 11,
      font: fontBold,
      color: COLORS.dark,
    })
    y -= 20

    // En-tête
    const cols = {
      date: PAGE.marginLeft,
      member: PAGE.marginLeft + 80,
      type: PAGE.marginLeft + 200,
      amount: PAGE.marginLeft + 290,
      commission: PAGE.marginLeft + 370,
      status: PAGE.marginLeft + 440,
    }

    page.drawRectangle({
      x: PAGE.marginLeft,
      y: y - 3,
      width: CONTENT_WIDTH,
      height: 18,
      color: COLORS.grayBg,
    })

    const headers = [
      { text: 'Date', x: cols.date },
      { text: 'Membre', x: cols.member },
      { text: 'Type', x: cols.type },
      { text: 'Montant', x: cols.amount },
      { text: 'Commission', x: cols.commission },
      { text: 'Statut', x: cols.status },
    ]
    for (const h of headers) {
      page.drawText(h.text, { x: h.x + 5, y: y + 1, size: 7, font: fontBold, color: COLORS.gray })
    }
    y -= 22

    const typeLabels: Record<string, string> = {
      signup: 'Inscription',
      subscription: 'Abonnement',
      renewal: 'Renouvellement',
    }

    for (const conv of data.conversions) {
      if (needsNewPage(y, 40)) {
        drawFooter(page, fontRegular, pageNum, undefined)
        page = addPage(doc)
        pageNum++
        y = drawHeader(page, fontBold, 'RAPPORT D\'AFFILIATION (suite)')
        y -= 10
      }

      page.drawText(formatDateFR(conv.date), { x: cols.date + 5, y, size: 8, font: fontRegular, color: COLORS.dark })
      page.drawText(conv.memberName, { x: cols.member + 5, y, size: 8, font: fontRegular, color: COLORS.dark })
      page.drawText(typeLabels[conv.type] || conv.type, { x: cols.type + 5, y, size: 8, font: fontRegular, color: COLORS.dark })
      page.drawText(formatEUR(conv.amount), { x: cols.amount + 5, y, size: 8, font: fontRegular, color: COLORS.dark })
      page.drawText(formatEUR(conv.commission), { x: cols.commission + 5, y, size: 8, font: fontBold, color: COLORS.green })
      page.drawText(conv.status, { x: cols.status + 5, y, size: 8, font: fontRegular, color: COLORS.gray })

      y -= 16
    }

    y -= 10
    y = drawSeparator(page, y)
  }

  // ─── Retraits ──────────────────────────────────────────────────────

  if (data.withdrawals.length > 0) {
    if (needsNewPage(y, 80)) {
      drawFooter(page, fontRegular, pageNum, undefined)
      page = addPage(doc)
      pageNum++
      y = drawHeader(page, fontBold, 'RAPPORT D\'AFFILIATION (suite)')
      y -= 10
    }

    page.drawText('HISTORIQUE DES RETRAITS', {
      x: PAGE.marginLeft,
      y,
      size: 11,
      font: fontBold,
      color: COLORS.dark,
    })
    y -= 20

    for (const w of data.withdrawals) {
      const statusLabel: Record<string, string> = {
        pending: 'En attente',
        processing: 'En cours',
        completed: 'Versé',
        rejected: 'Rejeté',
      }

      y = drawKeyValue(
        page,
        formatDateFR(w.date),
        `${formatEUR(w.amount)} — ${w.method.toUpperCase()} — ${statusLabel[w.status]}`,
        y,
        fontRegular,
        fontBold,
        { size: 9 }
      )
    }
  }

  // ─── Footer ────────────────────────────────────────────────────────

  drawFooter(page, fontRegular, pageNum, pageNum)

  return doc.save()
}
