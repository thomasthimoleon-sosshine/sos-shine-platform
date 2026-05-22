/**
 * SOS Shine - Certificat / attestation PDF
 * Certificats de participation aux événements et attestations de parcours.
 */

import {
  createDocument,
  addPage,
  drawFooter,
  formatDateFR,
  COLORS,
  PAGE,
  CONTENT_WIDTH,
} from './core'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CertificateData {
  type: 'event' | 'parcours' | 'signature'
  recipientName: string
  title: string
  description: string
  date: Date | string
  eventType?: string
  signedBy?: string
  certificateId?: string
}

// ─── Génération ──────────────────────────────────────────────────────────────

export async function generateCertificatePDF(data: CertificateData): Promise<Uint8Array> {
  const { doc, fontRegular, fontBold } = await createDocument(
    `Certificat - ${data.recipientName} - SOS Shine`
  )

  // Page en paysage pour le certificat
  const page = doc.addPage([PAGE.height, PAGE.width]) // inversé = paysage
  const W = PAGE.height
  const H = PAGE.width
  const centerX = W / 2

  // ─── Bordure dorée ─────────────────────────────────────────────────

  // Bordure extérieure
  page.drawRectangle({
    x: 20,
    y: 20,
    width: W - 40,
    height: H - 40,
    borderColor: COLORS.gold,
    borderWidth: 2,
    color: COLORS.white,
  })

  // Bordure intérieure
  page.drawRectangle({
    x: 30,
    y: 30,
    width: W - 60,
    height: H - 60,
    borderColor: COLORS.goldLight,
    borderWidth: 0.5,
  })

  // ─── Logo / Titre ─────────────────────────────────────────────────

  let y = H - 80

  const sosText = 'SOS SHINE'
  const sosWidth = fontBold.widthOfTextAtSize(sosText, 28)
  page.drawText(sosText, {
    x: centerX - sosWidth / 2,
    y,
    size: 28,
    font: fontBold,
    color: COLORS.gold,
  })
  y -= 20

  // Ligne décorative
  const lineWidth = 200
  page.drawRectangle({
    x: centerX - lineWidth / 2,
    y,
    width: lineWidth,
    height: 1.5,
    color: COLORS.gold,
  })
  y -= 35

  // ─── Type de certificat ───────────────────────────────────────────

  const typeLabels: Record<string, string> = {
    event: 'CERTIFICAT DE PARTICIPATION',
    parcours: 'ATTESTATION DE PARCOURS',
    signature: 'CERTIFICAT DE SIGNATURE ÉMOTIONNELLE',
  }
  const typeText = typeLabels[data.type] || 'CERTIFICAT'
  const typeWidth = fontBold.widthOfTextAtSize(typeText, 14)
  page.drawText(typeText, {
    x: centerX - typeWidth / 2,
    y,
    size: 14,
    font: fontBold,
    color: COLORS.dark,
  })
  y -= 40

  // ─── "Décerné à" ──────────────────────────────────────────────────

  const awardText = 'Décerné à'
  const awardWidth = fontRegular.widthOfTextAtSize(awardText, 12)
  page.drawText(awardText, {
    x: centerX - awardWidth / 2,
    y,
    size: 12,
    font: fontRegular,
    color: COLORS.gray,
  })
  y -= 35

  // Nom du destinataire
  const nameWidth = fontBold.widthOfTextAtSize(data.recipientName, 26)
  page.drawText(data.recipientName, {
    x: centerX - nameWidth / 2,
    y,
    size: 26,
    font: fontBold,
    color: COLORS.dark,
  })
  y -= 15

  // Ligne sous le nom
  const nameLine = Math.min(nameWidth + 40, W - 200)
  page.drawRectangle({
    x: centerX - nameLine / 2,
    y,
    width: nameLine,
    height: 0.5,
    color: COLORS.goldLight,
  })
  y -= 30

  // ─── Titre de l'événement ─────────────────────────────────────────

  const titleWidth = fontBold.widthOfTextAtSize(data.title, 14)
  page.drawText(data.title, {
    x: centerX - titleWidth / 2,
    y,
    size: 14,
    font: fontBold,
    color: COLORS.gold,
  })
  y -= 25

  // Description (centrée, multi-lignes si nécessaire)
  const maxDescWidth = W - 200
  const descWords = data.description.split(' ')
  let descLine = ''
  const descLines: string[] = []

  for (const word of descWords) {
    const test = descLine ? `${descLine} ${word}` : word
    if (fontRegular.widthOfTextAtSize(test, 10) > maxDescWidth && descLine) {
      descLines.push(descLine)
      descLine = word
    } else {
      descLine = test
    }
  }
  if (descLine) descLines.push(descLine)

  for (const line of descLines) {
    const lw = fontRegular.widthOfTextAtSize(line, 10)
    page.drawText(line, {
      x: centerX - lw / 2,
      y,
      size: 10,
      font: fontRegular,
      color: COLORS.dark,
    })
    y -= 16
  }

  y -= 20

  // ─── Date ──────────────────────────────────────────────────────────

  const dateText = `Le ${formatDateFR(data.date)}`
  const dateWidth = fontRegular.widthOfTextAtSize(dateText, 10)
  page.drawText(dateText, {
    x: centerX - dateWidth / 2,
    y,
    size: 10,
    font: fontRegular,
    color: COLORS.gray,
  })
  y -= 40

  // ─── Signature ─────────────────────────────────────────────────────

  const signee = data.signedBy || 'Julia Laureau'

  // Ligne de signature
  page.drawRectangle({
    x: centerX - 80,
    y: y + 15,
    width: 160,
    height: 0.5,
    color: COLORS.dark,
  })

  const signWidth = fontBold.widthOfTextAtSize(signee, 10)
  page.drawText(signee, {
    x: centerX - signWidth / 2,
    y,
    size: 10,
    font: fontBold,
    color: COLORS.dark,
  })
  y -= 14

  const roleText = 'Fondatrice SOS Shine'
  const roleWidth = fontRegular.widthOfTextAtSize(roleText, 8)
  page.drawText(roleText, {
    x: centerX - roleWidth / 2,
    y,
    size: 8,
    font: fontRegular,
    color: COLORS.gray,
  })

  // ─── ID du certificat ──────────────────────────────────────────────

  if (data.certificateId) {
    page.drawText(`N° ${data.certificateId}`, {
      x: 50,
      y: 40,
      size: 7,
      font: fontRegular,
      color: COLORS.grayLight,
    })
  }

  return doc.save()
}
