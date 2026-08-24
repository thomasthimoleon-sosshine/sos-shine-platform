/**
 * Email 2 - Résultat complet
 * Envoyé 1 min après completion du quiz (Q15 répondue)
 */

import { wrapEmail, h2, p, goldDivider, ctaButton, ctaLink, signature, spacer } from './wrapper'
import { DIMENSIONS } from '@/lib/quiz-v2/dimensions'
import type { DimensionScores } from '@/lib/quiz-v2/dimensions'

const BRAND = '#C9A961'
const SERIF = "Georgia, 'Times New Roman', serif"
const URL_PLATEFORME = 'https://buy.stripe.com/14AbIT89ScNtffz84y5ZC0t'

type Vars = {
  firstName: string
  email: string
  dominant: string
  secondary: string
  scores: DimensionScores
  q15Response: string
  protocols: Array<{ title: string; matchScore: number; status: string; duration_days: number }>
  protocolSlug?: string | null
}

export function generateEmail02(vars: Vars): { subject: string; html: string } {
  const { firstName, email, dominant, secondary, scores, protocols, protocolSlug } = vars
  const protocoleUrl = protocolSlug
    ? `https://sosshine.com/protocole/${protocolSlug}?email=${encodeURIComponent(email)}`
    : `https://sosshine.com/signup?source=quiz&email=${encodeURIComponent(email)}`
  const dimInfo = DIMENSIONS[parseInt(dominant) as keyof typeof DIMENSIONS]
  const secInfo = DIMENSIONS[parseInt(secondary) as keyof typeof DIMENSIONS]

  const subject = `${firstName ? firstName + ', v' : 'V'}oilà ce que tes 15 réponses ont révélé`

  const dominantScore = scores[dominant] || 0
  const secondaryScore = scores[secondary] || 0

  const content = [
    // ── Opening ──
    p(`On vient de finir ensemble et avant tout, merci. Je te remercie et remercie ton âme vraiment.`),
    p(`Parce que répondre honnêtement à ce genre de questions, ce n'est pas anodin. Beaucoup de personnes passent leur vie à éviter de regarder ce qu'elles ressentent. À fonctionner, à sourire, à avancer, sans jamais s'arrêter pour se poser la vraie question.`),
    p(`Toi, tu viens de le faire, maintenant, quelque chose d'important commence.`),

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
<div style="background:linear-gradient(90deg,${BRAND},#A88248);height:8px;border-radius:99px;width:${dominantScore}%;"></div>
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

    // ── Acte 2 - Il y a un pattern ──
    h2(`Il y a un pattern dans tes réponses.`),
    p(`Je vais être directe avec toi.`),
    p(`Ce que tu viens de lire, ce n'est pas "un résultat de test", c'est un pattern émotionnel. Une manière que ton cerveau, ton système nerveux et ton corps ont développée pour survivre, s'adapter, se protéger, ou simplement avancer malgré certaines blessures, certains conditionnements, certaines expériences que personne ne t'a appris à nommer.`),
    p(`Ce pattern, tu ne l'as pas choisi. Il s'est installé pendant que tu étais trop petit(e) pour comprendre ce qui se passait.`),

    goldDivider(),

    // ── Acte 3 - D'où ça vient ──
    h2(`D'où ça vient ?`),
    p(`La plupart de nos automatismes émotionnels se forment entre 0 et 7 ans. À une époque où ton cerveau enregistrait tout sans filtre. Les mots qu'on te disait. Les silences. Les regards. Les absences. L'amour qu'on te donnait, et la forme exacte sous laquelle on te le donnait.`),
    p(`Aujourd'hui, ton subconscient continue de répondre au monde avec ces vieux codes. Même quand ils ne te servent plus.`),
    p(`C'est pour ça que tu peux comprendre intellectuellement ce qui te bloque, et continuer pourtant à répéter les mêmes scénarios. Ce n'est pas un manque de volonté. C'est une question de niveau. Le mental ne guérit pas le subconscient.`),

    goldDivider(),

    // ── Acte 4 - Ce qui change ──
    h2(`Ce qui change quand on prend le bon chemin.`),
    p(`Un pattern compris peut se dissoudre. Un mécanisme nommé perd une grande partie de son pouvoir. Et un corps qui retrouve la sécurité intérieure cesse de répéter les mêmes scénarios.`),
    p(`C'est exactement pour ça que SOS Shine existe.`),
    p(`Pas pour faire du développement personnel "instagrammable". Pas pour t'offrir des phrases lumineuses qui s'évaporent au bout de trois jours.`),
    p(`Mais pour te donner une vraie méthode, structurée en trois étapes : Comprendre. Libérer. Agir.`),
    p(`J'ai 22 ans d'expérience que je peux te transmettre. Pour que tu n'aies pas à perdre le temps que j'ai perdu, moi.`),

    goldDivider(),

    // ── Acte 5 - Protocoles intro ──
    h2(`Tes protocoles personnalisés`),
    p(`Sur la plateforme, ton parcours s'adapte à ton profil. Les protocoles, les exercices, les méditations et les audios que tu vas recevoir ne sont pas les mêmes selon la Signature Émotionnelle qui ressort de tes réponses. Chaque profil reçoit ses propres clés.`),
    p(`Tu y retrouveras des protocoles guidés étape par étape, des exercices neuro-émotionnels, des outils cognitifs, des méditations, des respirations, des audios à fréquences spécifiques (432 Hz, binauraux, bilatéraux), des lives mensuels, une encyclopédie complète des défis émotionnels, et une communauté de personnes qui traversent souvent les mêmes choses que toi.`),
    p(`Pas un programme de plus. Un chemin.`),

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

    // ── CTA - étape 1 gratuite ──
    h2(`Commence par l'étape 1 — c'est gratuit`),

    p(`Ton protocole est prêt. L'étape 1 — Comprendre — t'est offerte. Elle seule peut déjà changer quelque chose dans ta façon de te voir.`),

    `<table role="presentation" width="100%" cellspacing="0" cellpadding="0">
<tr><td align="center" style="padding:4px 0 8px 0;">
<span style="display:inline-block;padding:4px 14px;border-radius:99px;font-size:11px;font-weight:600;color:#55EFC4;background:rgba(85,239,196,0.1);border:1px solid rgba(85,239,196,0.2);">✓ Inscription gratuite · Étape 1 offerte</span>
</td></tr>
</table>`,

    ctaButton('Accéder à mon étape 1 gratuite →', protocoleUrl, { email }),

    `<p style="text-align:center;font-size:12px;color:#737373;margin:8px 0 0 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
Les étapes 2 &amp; 3 sont accessibles à partir de 49,90€/mois ou 33€ en accès unique.
</p>`,

    goldDivider(),

    // ── Closing ──
    p(`Conserve précieusement cette Signature Émotionnelle.`),
    p(`Relis-la dans quelques jours. Puis dans quelques semaines.`),
    p(`Tu verras déjà les choses différemment.`),
    p(`À très vite.`),

    signature(),

    p(`<br><em style="font-size:12px;color:#737373;">P.S. : Je t'écris depuis le sud de la France, en pleine nature. Entre la mère, la thérapeute, l'autrice, la fondatrice. Et ce paradoxe d'une femme qui ne s'arrête jamais, justement parce qu'elle sait à quel point ce qu'elle bâtit peut éviter à d'autres des années d'errance. Si tu as ouvert ce mail jusqu'à la fin, c'est que quelque chose en toi est prêt. Fais-toi confiance.</em>`),
  ].join('')

  return {
    subject,
    html: wrapEmail(content, { email }),
  }
}
