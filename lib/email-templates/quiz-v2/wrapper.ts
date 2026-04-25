/**
 * SOS Shine — Quiz V2 Email Wrapper
 * Responsive HTML email template with SOS Shine branding
 */

export function wrapEmail(content: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SOS Shine</title>
</head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#e0e0e0;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0A0A0A;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;">

<!-- Header -->
<tr><td style="padding:0 0 24px 0;text-align:center;">
<span style="font-size:20px;font-weight:600;color:#C9A961;letter-spacing:2px;">SOS SHINE</span>
</td></tr>

<!-- Content -->
<tr><td style="padding:0;">
${content}
</td></tr>

<!-- Footer -->
<tr><td style="padding:40px 0 0 0;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
<p style="font-size:11px;color:#52525b;line-height:1.6;margin:0;">
SOS Shine® — La première encyclopédie mondiale du bien-être émotionnel<br>
<a href="https://sosshine.com" style="color:#52525b;">sosshine.com</a><br><br>
Tu reçois cet email parce que tu as fait le test Signature Émotionnelle.<br>
<a href="https://sosshine.com/api/unsubscribe?email={email}" style="color:#52525b;text-decoration:underline;">Se désinscrire</a>
</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

export function ctaButton(text: string, url: string): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0">
<tr><td align="center" style="padding:24px 0;">
<a href="${url}" style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#C9A961,#B8960F);color:#050505;font-size:14px;font-weight:600;text-decoration:none;border-radius:999px;">
${text}
</a>
</td></tr>
</table>`
}

export function paragraph(text: string): string {
  return `<p style="font-size:14px;line-height:1.7;color:#a1a1aa;margin:0 0 16px 0;">${text}</p>`
}

export function heading(text: string): string {
  return `<p style="font-size:14px;line-height:1.7;color:#e0e0e0;font-weight:600;margin:0 0 8px 0;">${text}</p>`
}

export function quote(text: string): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0">
<tr><td style="padding:16px 24px;border-left:2px solid #C9A961;font-style:italic;color:#e0e0e0;font-size:14px;line-height:1.7;">
${text}
</td></tr>
</table>`
}

export function spacer(px: number = 24): string {
  return `<div style="height:${px}px;"></div>`
}
