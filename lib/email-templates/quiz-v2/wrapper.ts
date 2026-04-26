/**
 * SOS Shine — Quiz V2 Email Premium Wrapper
 * Dark luxury design matching the platform identity
 */

const BRAND = '#C9A961'
const BRAND_DEEP = '#B8960F'
const BG = '#0A0A0A'
const CARD_BG = '#111111'
const BORDER = 'rgba(201,169,97,0.15)'
const TEXT = '#d4d4d4'
const TEXT_MUTED = '#737373'
const SERIF = "Georgia, 'Times New Roman', serif"
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif"

export function wrapEmail(content: string, vars: { email?: string; trackingId?: string } = {}): string {
  const unsubUrl = `https://sosshine.com/api/unsubscribe?email=${encodeURIComponent(vars.email || '')}`
  const trackingPixel = vars.trackingId
    ? `<img src="https://sosshine.com/api/crm/track/open?cid=${vars.trackingId}&uid=${encodeURIComponent(vars.email || '')}" width="1" height="1" style="display:none" alt="" />`
    : ''

  return `<!DOCTYPE html>
<html lang="fr" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>SOS Shine</title>
<style>
  body, table, td { font-family: ${SANS}; }
  a { color: ${BRAND}; }
  @media (max-width: 600px) {
    .email-container { padding: 16px !important; }
    .email-content { padding: 24px 20px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${BG};-webkit-text-size-adjust:100%;">

<!-- Background wrapper -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BG};">
<tr><td align="center" class="email-container" style="padding:40px 24px;">

<!-- Main container -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:580px;">

<!-- Logo -->
<tr><td align="center" style="padding:0 0 32px 0;">
<table role="presentation" cellspacing="0" cellpadding="0">
<tr>
<td style="width:36px;height:36px;background:linear-gradient(135deg,${BRAND},${BRAND_DEEP});border-radius:10px;text-align:center;vertical-align:middle;">
<span style="color:${BG};font-size:18px;font-weight:700;font-family:${SERIF};">S</span>
</td>
<td style="padding-left:12px;">
<span style="font-family:${SERIF};font-size:18px;color:${BRAND};letter-spacing:1px;">SOS Shine</span>
</td>
</tr>
</table>
</td></tr>

<!-- Content card -->
<tr><td>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${CARD_BG};border:1px solid ${BORDER};border-radius:16px;overflow:hidden;">
<tr><td class="email-content" style="padding:40px 36px;">
${content}
</td></tr>
</table>
</td></tr>

<!-- Footer -->
<tr><td style="padding:32px 0 0 0;text-align:center;">
<p style="font-size:11px;color:${TEXT_MUTED};line-height:1.8;margin:0;font-family:${SANS};">
SOS Shine® — La première encyclopédie mondiale du bien-être émotionnel<br>
<a href="https://sosshine.com" style="color:${TEXT_MUTED};">sosshine.com</a>
</p>
<p style="font-size:11px;color:${TEXT_MUTED};line-height:1.8;margin:12px 0 0 0;">
Tu reçois cet email parce que tu as fait le test Signature Émotionnelle.<br>
<a href="${unsubUrl}" style="color:${TEXT_MUTED};text-decoration:underline;">Se désinscrire</a>
</p>
</td></tr>

</table>
</td></tr>
</table>

${trackingPixel}
</body>
</html>`
}

/* ── HTML sanitization ── */

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/* ── Reusable email components ── */

export function goldDivider(): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0">
<tr><td style="padding:24px 0;">
<div style="height:1px;background:linear-gradient(to right, transparent, ${BRAND}, transparent);"></div>
</td></tr>
</table>`
}

export function trackUrl(url: string, email?: string, label?: string): string {
  return `https://sosshine.com/api/crm/track/click?url=${encodeURIComponent(url)}&uid=${encodeURIComponent(email || '')}&label=${encodeURIComponent(label || '')}`
}

export function ctaButton(text: string, url: string, opts?: { email?: string }): string {
  const trackedUrl = trackUrl(url, opts?.email, text)
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0">
<tr><td align="center" style="padding:28px 0;">
<a href="${trackedUrl}" style="display:inline-block;padding:16px 44px;background:linear-gradient(135deg,${BRAND},${BRAND_DEEP});color:${BG};font-size:14px;font-weight:700;text-decoration:none;border-radius:999px;font-family:${SANS};letter-spacing:0.5px;">
${text}
</a>
</td></tr>
</table>`
}

export function ctaLink(text: string, url: string): string {
  return `<p style="text-align:center;margin:0;">
<a href="${url}" style="font-size:13px;color:${TEXT_MUTED};text-decoration:underline;font-family:${SANS};">${text}</a>
</p>`
}

export function p(text: string): string {
  return `<p style="font-size:15px;line-height:1.75;color:${TEXT};margin:0 0 16px 0;font-family:${SANS};">${text}</p>`
}

export function pMuted(text: string): string {
  return `<p style="font-size:13px;line-height:1.7;color:${TEXT_MUTED};margin:0 0 12px 0;font-family:${SANS};">${text}</p>`
}

export function h2(text: string): string {
  return `<h2 style="font-family:${SERIF};font-size:22px;color:${BRAND};font-weight:400;margin:0 0 16px 0;line-height:1.3;">${text}</h2>`
}

export function h3(text: string): string {
  return `<h3 style="font-family:${SERIF};font-size:17px;color:#e0e0e0;font-weight:600;margin:0 0 8px 0;line-height:1.4;">${text}</h3>`
}

export function quoteBlock(text: string): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0">
<tr><td style="padding:20px 28px;border-left:3px solid ${BRAND};background:rgba(201,169,97,0.04);border-radius:0 8px 8px 0;">
<p style="font-family:${SERIF};font-size:18px;font-style:italic;color:${BRAND};line-height:1.6;margin:0;">
${text}
</p>
</td></tr>
</table>`
}

export function testimonialBlock(text: string, author: string): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0">
<tr><td style="padding:20px 24px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;">
<p style="font-family:${SERIF};font-size:14px;font-style:italic;color:${TEXT};line-height:1.7;margin:0 0 8px 0;">
"${text}"
</p>
<p style="font-size:12px;color:${TEXT_MUTED};margin:0;">— ${author}</p>
</td></tr>
</table>`
}

export function signature(): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:24px;">
<tr>
<td style="padding-right:12px;vertical-align:top;">
<div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,${BRAND},${BRAND_DEEP});text-align:center;line-height:40px;">
<span style="color:${BG};font-size:16px;font-weight:700;font-family:${SERIF};">J</span>
</div>
</td>
<td style="vertical-align:top;">
<p style="margin:0;font-size:14px;color:#e0e0e0;font-weight:600;">Julia</p>
<p style="margin:2px 0 0 0;font-size:12px;color:${TEXT_MUTED};">Fondatrice de SOS Shine</p>
</td>
</tr>
</table>`
}

export function spacer(px: number = 24): string {
  return `<div style="height:${px}px;"></div>`
}
