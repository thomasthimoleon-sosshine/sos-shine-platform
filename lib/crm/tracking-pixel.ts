// ============================================================
// SOS SHINE — Pixel de tracking d'ouverture pour TOUS les emails
// Un <img> 1x1 invisible qui appelle /api/crm/track/open au chargement.
// L'ouverture est loggée dans crm_campaign_events (event_type = 'open'),
// visible dans le BackOffice — indépendamment du dashboard Resend.
// ============================================================

function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL
    || (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : null)
    || 'https://sosshine.com'
}

/**
 * Génère le pixel de tracking.
 * @param email  destinataire (encodé en base64url dans l'URL)
 * @param key    identifiant du mail (ex: 'quiz_v2_email_02', 'registration_welcome')
 */
export function trackingPixel(email: string, key: string): string {
  if (!email) return ''
  const e = Buffer.from(email.toLowerCase().trim()).toString('base64url')
  const k = encodeURIComponent(key)
  return `<img src="${getSiteUrl()}/api/crm/track/open?e=${e}&k=${k}" width="1" height="1" alt="" style="display:none;width:1px;height:1px;opacity:0;" />`
}

/**
 * Insère le pixel dans un HTML d'email (juste avant </body>, sinon à la fin).
 */
export function withTrackingPixel(html: string, email: string, key: string): string {
  const px = trackingPixel(email, key)
  if (!px) return html
  if (html.includes('</body>')) return html.replace('</body>', `${px}</body>`)
  return html + px
}
