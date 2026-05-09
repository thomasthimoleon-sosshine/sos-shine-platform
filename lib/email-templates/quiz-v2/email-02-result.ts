/**
 * Email 2 — Résultat complet
 * Envoyé 1 min après completion du quiz (Q15 répondue)
 * Contient le résultat COMPLET (pas de lien "voir résultat" qui relance le quiz)
 */

import { wrapEmail, h2, p, goldDivider, ctaButton, ctaLink, signature, spacer } from './wrapper'
import { DIMENSION_TEXTS, generateActe4 } from '@/lib/quiz-v2/result-texts'
import { DIMENSIONS } from '@/lib/quiz-v2/dimensions'
import type { DimensionScores } from '@/lib/quiz-v2/dimensions'

const BRAND = '#C9A961'
const SERIF = "Georgia, 'Times New Roman', serif"
const URL_REJOINDRE = 'https://sosshine.com/rejoindre'

type Vars = {
  firstName: string
  email: string
  dominant: string
  secondary: string
  scores: DimensionScores
  q15Response: string
  protocols: Array<{ title: string; matchScore: number; status: string; duration_days: number }>
}

export function generateEmail02(vars: Vars): { subject: string; html: string } {
  const { firstName, email, dominant, secondary, scores, protocols } = vars
  const dimInfo = DIMENSIONS[parseInt(dominant) as keyof typeof DIMENSIONS]
  const secInfo = DIMENSIONS[parseInt(secondary) as keyof typeof DIMENSIONS]
  const texts = DIMENSION_TEXTS[dominant]

  const displayName = firstName || 'Toi'
  const subject = `${firstName ? firstName + ', v' : 'V'}oilà ce que tes 15 réponses ont révélé`

  const dominantScore = scores[dominant] || 0
  const secondaryScore = scores[secondary] || 0

  const content = [
    // ── Opening ──
    firstName ? p(`${firstName},`) : '',
    p(`On vient de finir ensemble.`),
    p(`Avant toute chose, merci d'avoir répondu honnêtement. Tu n'imagines pas à quel point la plupart des gens se mentent à eux-mêmes en répondant à ce genre de test.`),
    p(`Pas toi.`),

    goldDivider(),

    // ── Signature scores ──
    h2(`${dimInfo?.icon || '✨'} Ta Signature Émotionnelle`),

    // Dominant dimension
    `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:12px;">
<tr><td style="padding:16px 20px;background:rgba(201,169,97,0.08);border:1px solid rgba(201,169,97,0.15);border-radius:12px;">
<p style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:${BRAND};font-weight:600;margin:0 0 6px 0;">Dimension dominante</p>
<p style="font-family:${SERIF};font-size:20px;color:#e0e0e0;font-weight:400;margin:0 0 8px 0;">
${dimInfo?.icon || ''} ${dimInfo?.name || 'Dimension ' + dominant}
</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0">
<tr><td style="background:rgba(255,255,255,0.06);border-radius:99px;height:8px;width:100%;">
<div style="background:linear-gradient(90deg,${BRAND},#B8960F);height:8px;border-radius:99px;width:${dominantScore}%;"></div>
</td><td style="padding-left:8px;white-space:nowrap;font-size:13px;color:${BRAND};font-weight:600;">${dominantScore}%</td></tr>
</table>
</td></tr>
</table>`,

    // Secondary dimension
    `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:16px;">
<tr><td style="padding:14px 20px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;">
<p style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#a1a1aa;font-weight:600;margin:0 0 6px 0;">Dimension secondaire</p>
<p style="font-size:15px;color:#d4d4d4;margin:0 0 8px 0;">
${secInfo?.icon || ''} ${secInfo?.name || 'Dimension ' + secondary}
</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0">
<tr><td style="background:rgba(255,255,255,0.06);border-radius:99px;height:6px;width:100%;">
<div style="background:#a1a1aa;height:6px;border-radius:99px;width:${secondaryScore}%;"></div>
</td><td style="padding-left:8px;white-space:nowrap;font-size:12px;color:#a1a1aa;">${secondaryScore}%</td></tr>
</table>
</td></tr>
</table>`,

    goldDivider(),

    // ── Pattern (Acte 2 — COMPLET) ──
    h2(`Il y a un pattern dans tes réponses.`),
    texts ? `<div style="font-size:15px;line-height:1.75;color:#d4d4d4;white-space:pre-line;margin:0 0 16px 0;">${texts.acte2}</div>` : '',

    goldDivider(),

    // ── Origin (Acte 3 — COMPLET) ──
    h2(`D'où ça vient ?`),
    texts ? `<div style="font-size:15px;line-height:1.75;color:#d4d4d4;white-space:pre-line;margin:0 0 16px 0;">${texts.acte3}</div>` : '',

    goldDivider(),

    // ── Cost (Acte 4 — COMPLET) ──
    h2(`Ce qui va se passer si rien ne change.`),
    `<div style="font-size:15px;line-height:1.75;color:#d4d4d4;white-space:pre-line;margin:0 0 16px 0;">${generateActe4(dominant)}</div>`,

    goldDivider(),

    // ── Acte 5 — La promesse ──
    h2(`Mais tu peux changer.`),
    p(`Les schémas qui te freinent aujourd'hui se sont formés pour te protéger. Ils ont eu leur utilité. Mais ils ne te servent plus.`),
    p(`Ce n'est pas une question de volonté. C'est une question de méthode.`),
    spacer(8),
    goldDivider(),

    // ── Protocols (Acte 6) ──
    h2(`Tes protocoles personnalisés`),
    p(`À partir de tes 15 réponses, voici les protocoles qui correspondent à ce que tu traverses :`),

    spacer(8),

    protocols.length > 0
      ? protocols.map(proto => {
          const isAvailable = proto.status === 'available'
          const borderColor = isAvailable ? 'rgba(85,239,196,0.2)' : 'rgba(201,169,97,0.15)'
          const bgColor = isAvailable ? 'rgba(85,239,196,0.06)' : 'rgba(201,169,97,0.06)'
          const statusColor = isAvailable ? '#55EFC4' : BRAND
          const statusIcon = isAvailable ? '✓' : '⏳'
          const statusLabel = isAvailable ? 'Disponible' : 'Bientôt'

          return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:10px;">
<tr><td style="padding:16px 20px;background:${bgColor};border:1px solid ${borderColor};border-radius:12px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0">
<tr>
<td style="vertical-align:top;">
<p style="font-size:14px;color:#e0e0e0;font-weight:600;margin:0 0 4px 0;">
<span style="color:${statusColor};margin-right:6px;">${statusIcon}</span>${proto.title}
</p>
<p style="font-size:12px;color:#737373;margin:0;">${proto.duration_days} jours · Match : ${proto.matchScore}%</p>
</td>
<td style="vertical-align:middle;text-align:right;white-space:nowrap;">
<span style="display:inline-block;padding:4px 12px;border-radius:99px;font-size:11px;font-weight:600;color:${statusColor};background:${isAvailable ? 'rgba(85,239,196,0.12)' : 'rgba(201,169,97,0.12)'};">${statusLabel}</span>
</td>
</tr>
</table>
</td></tr>
</table>`
        }).join('')
      : `<table role="presentation" width="100%" cellspacing="0" cellpadding="0">
<tr><td style="padding:16px 20px;background:rgba(201,169,97,0.06);border:1px solid rgba(201,169,97,0.12);border-radius:12px;">
<p style="font-size:13px;color:#a1a1aa;line-height:1.6;margin:0;">
Tes protocoles personnalisés sont en préparation. Tu seras notifié(e) dès qu'ils seront disponibles.
</p>
</td></tr>
</table>`,

    spacer(16),

    goldDivider(),

    // ── CTA — prix promo vers /rejoindre ──
    h2(`Rejoindre SOS Shine`),
    p(`Accède à tous tes protocoles personnalisés, à ta communauté, aux lives, et à tout ce qui viendra pour toi.`),

    // Prix promo
    `<table role="presentation" width="100%" cellspacing="0" cellpadding="0">
<tr><td align="center" style="padding:8px 0 4px 0;">
<span style="font-size:16px;color:#737373;text-decoration:line-through;">49,90€</span>
<span style="font-family:${SERIF};font-size:28px;color:#55EFC4;font-weight:400;margin-left:8px;">29,90€</span>
<span style="font-size:14px;color:#737373;">/mois</span>
</td></tr>
<tr><td align="center" style="padding:4px 0 16px 0;">
<span style="font-size:12px;color:#55EFC4;font-weight:600;">code SHINE2026 · 7 jours d'essai gratuit</span>
</td></tr>
</table>`,

    ctaButton('REJOINDRE SÉRÉNITÉ — 7 jours offerts', `${URL_REJOINDRE}?source=quiz&email=${encodeURIComponent(email)}`, { email }),

    ctaLink('Formule Essentielle (9,90€/mois) →', `${URL_REJOINDRE}?source=quiz&plan=essential&email=${encodeURIComponent(email)}`),

    goldDivider(),

    // ── Closing ──
    p(`Prends ton temps pour relire ce résultat. Ce n'est pas anodin.`),
    p(`Conserve cet email précieusement — c'est ta Signature Émotionnelle complète.`),
    p(`À très vite.`),

    signature(),
  ].join('')

  return {
    subject,
    html: wrapEmail(content, { email }),
  }
}
