import type { Profile } from '@/lib/signature-test'

export function generateSignatureResultEmail(
  firstName: string,
  profile: Profile,
  siteUrl: string
): { subject: string; html: string } {
  const subject = `${firstName}, votre Signature Émotionnelle : ${profile.archetype}`

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Votre Signature Émotionnelle - SOS Shine</title>
</head>
<body style="margin:0;padding:0;background-color:#000000;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#e0e0e0;">
  <!-- Wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <img src="https://sosshine.com/images/logo-shine.png" alt="SOS Shine" width="140" style="display:block;margin:0 auto;" />
            </td>
          </tr>

          <!-- Badge -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <span style="display:inline-block;padding:8px 20px;border-radius:50px;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#C9A961;border:1px solid rgba(201,169,97,0.2);background:rgba(201,169,97,0.06);">
                Votre Signature Émotionnelle
              </span>
            </td>
          </tr>

          <!-- Profile Icon -->
          <tr>
            <td align="center" style="padding-bottom:16px;">
              <div style="width:80px;height:80px;line-height:80px;border-radius:50%;font-size:36px;text-align:center;background:${hexToRgba(profile.color, 0.1)};border:2px solid ${hexToRgba(profile.color, 0.3)};">
                ${profile.icon}
              </div>
            </td>
          </tr>

          <!-- Profile Title -->
          <tr>
            <td align="center" style="padding-bottom:8px;">
              <h1 style="margin:0;font-size:32px;font-weight:300;color:${profile.color};font-family:Georgia,'Times New Roman',serif;line-height:1.3;">
                ${profile.archetype}
              </h1>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <p style="margin:0;font-size:16px;color:#a1a1aa;font-weight:300;">
                ${profile.subtitle}
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding-bottom:32px;">
              <p style="margin:0;font-size:16px;color:#e0e0e0;font-weight:300;line-height:1.7;text-align:center;">
                ${firstName}, merci d'avoir pris le temps de découvrir votre signature émotionnelle.
                Voici votre profil complet, à conserver précieusement.
              </p>
            </td>
          </tr>

          <!-- Section: Essence -->
          ${renderSection('Votre Essence', profile.essence, firstName, profile.color)}

          <!-- Section: Lumière -->
          ${renderSection('Votre Lumière', profile.lumiere, firstName, profile.color)}

          <!-- Section: Ombre -->
          ${renderSection('Votre Ombre', profile.ombre, firstName, profile.color)}

          <!-- Section: Protocole -->
          ${renderSection('Votre Protocole', profile.protocole, firstName, profile.color)}

          <!-- CTA -->
          <tr>
            <td align="center" style="padding:40px 0 32px;">
              <div style="width:60px;height:1px;background:linear-gradient(90deg,transparent,#C9A961,transparent);margin-bottom:32px;"></div>
              <p style="margin:0 0 24px;font-size:18px;color:#C9A961;font-weight:300;font-family:Georgia,'Times New Roman',serif;">
                Prêt(e) à transformer votre signature émotionnelle en force&nbsp;?
              </p>
              <a href="${siteUrl}/rejoindre" style="display:inline-block;padding:16px 40px;border-radius:50px;font-size:14px;font-weight:600;letter-spacing:0.05em;text-decoration:none;color:#000000;background:linear-gradient(135deg,#C9A961,#A88248);">
                Rejoindre SOS Shine
              </a>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:16px 0;">
              <div style="height:1px;background:rgba(255,255,255,0.06);"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:24px 0 16px;">
              <p style="margin:0;font-size:12px;color:#52525b;line-height:1.6;">
                Cet email vous a été envoyé suite à votre test de Signature Émotionnelle sur SOS Shine.<br/>
                Vous pouvez consulter vos résultats à tout moment en repassant le test sur notre site.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:16px;">
              <a href="${siteUrl}" style="font-size:12px;color:#C9A961;text-decoration:none;letter-spacing:0.1em;">
                sosshine.com
              </a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <p style="margin:0;font-size:10px;color:#3f3f46;">
                &copy; ${new Date().getFullYear()} SOS Shine. Tous droits réservés.
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

function renderSection(title: string, content: string, firstName: string, color: string): string {
  const injected = content.replace(/\{firstName\}/g, firstName)
  const sectionIcons: Record<string, string> = {
    'Votre Essence': '&#9670;',
    'Votre Lumière': '&#10022;',
    'Votre Ombre': '&#9671;',
    'Votre Protocole': '&#9656;',
  }
  const icon = sectionIcons[title] || '&#9670;'

  return `
          <tr>
            <td style="padding-bottom:20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:16px;">
                <tr>
                  <td style="padding:28px 32px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                      <tr>
                        <td style="font-size:16px;color:${color};padding-right:10px;vertical-align:middle;">
                          ${icon}
                        </td>
                        <td style="font-size:18px;font-weight:500;color:${color};letter-spacing:0.05em;font-family:Georgia,'Times New Roman',serif;vertical-align:middle;">
                          ${title}
                        </td>
                      </tr>
                    </table>
                    <p style="margin:0;font-size:14px;color:#a1a1aa;line-height:1.8;font-weight:300;">
                      ${injected}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}
