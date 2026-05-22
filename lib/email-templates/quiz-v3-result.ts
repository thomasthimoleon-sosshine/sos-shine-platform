const SECTION_TITLES = [
  'Ce que je perçois de vous',
  'Ce qui s\'est construit',
  'Ce qui se rejoue',
  'Le chemin qui s\'ouvre',
  'Votre protocole de départ',
]

function parseSections(text: string): { title: string; body: string }[] {
  const sections: { title: string; body: string }[] = []
  let remaining = text

  for (let i = 0; i < SECTION_TITLES.length; i++) {
    const title = SECTION_TITLES[i]
    const idx = remaining.indexOf(title)
    if (idx === -1) continue
    const afterTitle = remaining.slice(idx + title.length).replace(/^\s*\n?/, '')
    const nextIdx = i < SECTION_TITLES.length - 1
      ? (() => { const ni = afterTitle.indexOf(SECTION_TITLES[i + 1]); return ni === -1 ? afterTitle.length : ni })()
      : afterTitle.length
    sections.push({ title, body: afterTitle.slice(0, nextIdx).trim() })
    remaining = afterTitle.slice(nextIdx)
  }

  return sections
}

export function generateQuizV3ResultEmail(
  firstName: string,
  resultText: string,
  protocolTitle?: string,
  protocolSlug?: string,
  siteUrl = 'https://sosshine.com',
): { subject: string; html: string } {
  const subject = `${firstName}, votre lecture personnalisée SOS Shine`
  const sections = parseSections(resultText)
  const ctaUrl = protocolSlug
    ? `${siteUrl}/signup?source=quiz-v3&protocol=${protocolSlug}`
    : `${siteUrl}/signup?source=quiz-v3`
  const ctaLabel = protocolTitle ? `Commencer : ${protocolTitle}` : 'Créer mon espace et commencer'

  const sectionsHtml = sections.map((s, i) => `
    <tr>
      <td style="padding-bottom:16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
          style="background:${i === 4 ? 'rgba(201,169,97,0.06)' : 'rgba(255,255,255,0.03)'};border:1px solid ${i === 4 ? 'rgba(201,169,97,0.2)' : 'rgba(255,255,255,0.06)'};border-radius:16px;">
          <tr>
            <td style="padding:24px 28px;">
              <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#C9A961;font-family:Helvetica,Arial,sans-serif;">
                0${i + 1}
              </p>
              <p style="margin:0 0 14px;font-size:17px;font-weight:500;color:#f0e6d0;font-family:Georgia,'Times New Roman',serif;">
                ${s.title}
              </p>
              <p style="margin:0;font-size:14px;color:#a1a1aa;line-height:1.8;font-family:Helvetica,Arial,sans-serif;white-space:pre-wrap;">
                ${s.body.replace(/\n/g, '<br/>')}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`).join('')

  const fallbackHtml = sections.length === 0 ? `
    <tr>
      <td style="padding-bottom:24px;">
        <p style="margin:0;font-size:14px;color:#a1a1aa;line-height:1.8;white-space:pre-wrap;font-family:Helvetica,Arial,sans-serif;">
          ${resultText.replace(/\n/g, '<br/>')}
        </p>
      </td>
    </tr>` : ''

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Votre lecture personnalisée - SOS Shine</title>
</head>
<body style="margin:0;padding:0;background:#000000;font-family:Helvetica,Arial,sans-serif;color:#e0e0e0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#000000;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:36px;">
              <img src="${siteUrl}/images/logo-shine.png" alt="SOS Shine" width="130"
                style="display:block;margin:0 auto;"/>
            </td>
          </tr>

          <!-- Badge -->
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <span style="display:inline-block;padding:7px 18px;border-radius:50px;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#C9A961;border:1px solid rgba(201,169,97,0.2);background:rgba(201,169,97,0.06);">
                Lecture personnalisée · Scanner approfondi
              </span>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td align="center" style="padding-bottom:8px;">
              <h1 style="margin:0;font-size:28px;font-weight:300;color:#f0e6d0;font-family:Georgia,'Times New Roman',serif;line-height:1.3;">
                ${firstName}, voici ce que je perçois
              </h1>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:40px;">
              <p style="margin:0;font-size:13px;color:#52525b;">
                Fiche générée le ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} · Réservée à vous
              </p>
            </td>
          </tr>

          <!-- Sections -->
          ${sectionsHtml}
          ${fallbackHtml}

          <!-- Separator -->
          <tr><td style="padding:8px 0 32px;"><div style="height:1px;background:rgba(201,169,97,0.15);"></div></td></tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding-bottom:12px;">
              <a href="${ctaUrl}"
                style="display:inline-block;padding:16px 40px;border-radius:50px;font-size:14px;font-weight:600;letter-spacing:0.05em;text-decoration:none;color:#000000;background:linear-gradient(135deg,#C9A961,#B8960F);">
                ${ctaLabel}
              </a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:36px;">
              <p style="margin:0;font-size:12px;color:#52525b;">
                Gratuit · accès immédiat · upgrade possible ensuite
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr><td style="padding:16px 0;"><div style="height:1px;background:rgba(255,255,255,0.05);"></div></td></tr>
          <tr>
            <td align="center" style="padding:20px 0 8px;">
              <p style="margin:0;font-size:11px;color:#3f3f46;line-height:1.6;">
                Vous recevez cet email suite à votre test approfondi SOS Shine.<br/>
                <a href="${siteUrl}" style="color:#C9A961;text-decoration:none;">sosshine.com</a>
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <p style="margin:0;font-size:10px;color:#27272a;">
                &copy; ${new Date().getFullYear()} SOS Shine · Tous droits réservés
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  return { subject, html }
}
