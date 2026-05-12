import { NextResponse } from 'next/server'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

// No auth required — linked from email, must work without session
export async function GET() {
  try {
    const doc = await PDFDocument.create()
    doc.setTitle('5 minutes pour réaligner ta journée')
    doc.setAuthor('Julia Laureau — SOS Shine')
    doc.setCreator('SOS Shine Platform')

    const fontRegular = await doc.embedFont(StandardFonts.TimesRoman)
    const fontBold    = await doc.embedFont(StandardFonts.TimesRomanBold)
    const fontItalic  = await doc.embedFont(StandardFonts.TimesRomanItalic)
    const fontSans    = await doc.embedFont(StandardFonts.Helvetica)
    const fontSansBold = await doc.embedFont(StandardFonts.HelveticaBold)

    const GOLD  = rgb(0.788, 0.663, 0.38)   // #C9A961
    const BLACK = rgb(0.039, 0.039, 0.039)  // #0A0A0A
    const GRAY  = rgb(0.45, 0.45, 0.45)
    const BG    = rgb(0.961, 0.945, 0.91)   // #F5F1E8

    const W = 595.28
    const H = 841.89
    const ML = 60
    const MR = 60
    const CW = W - ML - MR

    function wrapText(text: string, font: ReturnType<typeof doc.embedFont> extends Promise<infer F> ? F : never, size: number, maxWidth: number): string[] {
      const words = text.split(' ')
      const lines: string[] = []
      let current = ''
      for (const word of words) {
        const test = current ? `${current} ${word}` : word
        if ((font as any).widthOfTextAtSize(test, size) > maxWidth && current) {
          lines.push(current)
          current = word
        } else {
          current = test
        }
      }
      if (current) lines.push(current)
      return lines
    }

    function drawWrapped(
      page: Awaited<ReturnType<typeof doc.addPage>>,
      text: string,
      font: any,
      size: number,
      x: number,
      y: number,
      color = BLACK,
      maxWidth = CW,
      lineHeight?: number
    ): number {
      const lh = lineHeight ?? size * 1.55
      const lines = wrapText(text, font, size, maxWidth)
      for (const line of lines) {
        page.drawText(line, { x, y, size, font, color })
        y -= lh
      }
      return y
    }

    // ─── PAGE 1 — COUVERTURE ────────────────────────────────────────────────
    const page1 = doc.addPage([W, H])

    // Fond crème
    page1.drawRectangle({ x: 0, y: 0, width: W, height: H, color: BG })

    // Bande dorée haut
    page1.drawRectangle({ x: 0, y: H - 8, width: W, height: 8, color: GOLD })
    // Bande dorée bas
    page1.drawRectangle({ x: 0, y: 0, width: W, height: 8, color: GOLD })

    // Titre principal
    const title = '5 minutes pour réaligner ta journée'
    const titleSize = 28
    const titleWidth = fontBold.widthOfTextAtSize(title, titleSize)
    page1.drawText(title, {
      x: (W - titleWidth) / 2,
      y: H - 180,
      size: titleSize,
      font: fontBold,
      color: GOLD,
    })

    // Ligne décorative sous titre
    page1.drawRectangle({ x: ML, y: H - 200, width: CW, height: 1, color: GOLD })

    // Sous-titre
    const subtitle = 'Un cadeau de Julia — SOS Shine'
    const subtitleSize = 14
    const subtitleWidth = fontItalic.widthOfTextAtSize(subtitle, subtitleSize)
    page1.drawText(subtitle, {
      x: (W - subtitleWidth) / 2,
      y: H - 230,
      size: subtitleSize,
      font: fontItalic,
      color: GRAY,
    })

    // Intro
    const intro = 'Voici une pratique simple à faire chaque matin, ou à tout moment de la journée quand tu sens que tu perds le fil. Elle te prend 5 minutes. Pas plus.'
    drawWrapped(page1, intro, fontSans, 11, ML, H - 310, BLACK, CW, 18)

    // Footer page 1
    page1.drawText('sosshine.com', {
      x: W / 2 - fontSans.widthOfTextAtSize('sosshine.com', 9) / 2,
      y: 25,
      size: 9, font: fontSans, color: GRAY,
    })

    // ─── PAGES 2-6 — LES 5 ÉTAPES ───────────────────────────────────────────
    const steps = [
      {
        num: '1',
        label: 'Pose.',
        time: 'Minute 1',
        body: 'Assieds-toi confortablement. Pose une main sur ta poitrine. Respire 5 fois lentement par le nez. Sens ton ventre se gonfler à l\'inspir, se vider à l\'expir.',
      },
      {
        num: '2',
        label: 'Écoute.',
        time: 'Minute 2',
        body: 'Sans bouger, scanne ton corps de la tête aux pieds. Identifie une zone de tension. Ne la juge pas. Juste reconnais-la.',
      },
      {
        num: '3',
        label: 'Reçois.',
        time: 'Minute 3',
        body: 'Dis intérieurement, ou à voix basse : "Je n\'ai pas à porter ça seule. Pas aujourd\'hui." Laisse cette phrase faire son chemin en toi.',
      },
      {
        num: '4',
        label: 'Lumière.',
        time: 'Minute 4',
        body: 'Visualise une lumière dorée qui descend lentement par le sommet de ta tête. Elle traverse ta poitrine, ton ventre, jusque dans tes pieds. Elle te traverse tout entière.',
      },
      {
        num: '5',
        label: 'Intention.',
        time: 'Minute 5',
        body: 'Note mentalement (ou écris sur un carnet) une seule intention pour les prochaines heures. Pas un objectif. Une qualité de présence.',
      },
    ]

    for (const step of steps) {
      const page = doc.addPage([W, H])
      page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: BG })
      page.drawRectangle({ x: 0, y: H - 8, width: W, height: 8, color: GOLD })
      page.drawRectangle({ x: 0, y: 0, width: W, height: 8, color: GOLD })

      // Numéro centré grand
      const numSize = 80
      const numW = fontBold.widthOfTextAtSize(step.num, numSize)
      page.drawText(step.num, {
        x: (W - numW) / 2,
        y: H - 180,
        size: numSize,
        font: fontBold,
        color: rgb(0.788, 0.663, 0.38),
        opacity: 0.18,
      })

      // Badge minute
      const badgeText = step.time
      const badgeSize = 10
      const badgeW = fontSansBold.widthOfTextAtSize(badgeText, badgeSize) + 20
      page.drawRectangle({ x: ML, y: H - 160, width: badgeW, height: 22, color: GOLD })
      page.drawText(badgeText, {
        x: ML + 10,
        y: H - 153,
        size: badgeSize, font: fontSansBold, color: rgb(1, 1, 1),
      })

      // Titre étape
      page.drawText(`${step.label}`, {
        x: ML,
        y: H - 220,
        size: 32,
        font: fontBold,
        color: BLACK,
      })

      // Ligne dorée
      page.drawRectangle({ x: ML, y: H - 242, width: CW, height: 1.5, color: GOLD })

      // Corps texte
      drawWrapped(page, step.body, fontSans, 13, ML, H - 290, BLACK, CW, 22)

      // Footer
      page.drawText(`SOS Shine — sosshine.com`, {
        x: W / 2 - fontSans.widthOfTextAtSize('SOS Shine — sosshine.com', 9) / 2,
        y: 25,
        size: 9, font: fontSans, color: GRAY,
      })
    }

    // ─── PAGE FINALE — CITATION + SIGNATURE ─────────────────────────────────
    const pageFinal = doc.addPage([W, H])
    pageFinal.drawRectangle({ x: 0, y: 0, width: W, height: H, color: BG })
    pageFinal.drawRectangle({ x: 0, y: H - 8, width: W, height: 8, color: GOLD })
    pageFinal.drawRectangle({ x: 0, y: 0, width: W, height: 8, color: GOLD })

    // Guillemets décoratifs
    pageFinal.drawText('“', {
      x: ML,
      y: H - 200,
      size: 80, font: fontBold, color: GOLD, opacity: 0.3,
    })

    // Citation
    const citation = 'Tu n\'es pas obligée de tout comprendre pour commencer à changer.'
    const citLines = wrapText(citation, fontItalic, 20, CW - 30)
    let cy = H - 260
    for (const line of citLines) {
      const lw = fontItalic.widthOfTextAtSize(line, 20)
      pageFinal.drawText(line, {
        x: (W - lw) / 2,
        y: cy,
        size: 20, font: fontItalic, color: BLACK,
      })
      cy -= 32
    }

    // Signature
    cy -= 20
    const sig = '— Julia'
    const sigW = fontRegular.widthOfTextAtSize(sig, 16)
    pageFinal.drawText(sig, {
      x: (W - sigW) / 2,
      y: cy,
      size: 16, font: fontRegular, color: GOLD,
    })

    // Ligne séparatrice bas
    pageFinal.drawRectangle({ x: ML, y: 80, width: CW, height: 0.5, color: GOLD })

    // Footer final
    const footerText = 'SOS Shine — sosshine.com — © 2026'
    const footerW = fontSans.widthOfTextAtSize(footerText, 9)
    pageFinal.drawText(footerText, {
      x: (W - footerW) / 2,
      y: 55,
      size: 9, font: fontSans, color: GRAY,
    })

    const pdfBytes = await doc.save()
    const buffer = Buffer.from(pdfBytes)

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="5_minutes_pour_realigner_ta_journee.pdf"',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (e) {
    console.error('[PDF 5min] Generation error:', e)
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 })
  }
}
