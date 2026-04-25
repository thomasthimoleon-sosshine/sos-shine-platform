/**
 * Email 2 — Résultat complet
 * Envoyé 1 min après completion du quiz (Q15 répondue)
 * Le plus riche visuellement — sert de référence pour les 15 autres
 */

import { wrapEmail, h2, h3, p, pMuted, goldDivider, quoteBlock, ctaButton, ctaLink, signature, spacer } from './wrapper'
import { DIMENSION_TEXTS, generateActe4 } from '@/lib/quiz-v2/result-texts'
import { DIMENSIONS } from '@/lib/quiz-v2/dimensions'

const BRAND = '#C9A961'
const SERIF = "Georgia, 'Times New Roman', serif"
const URL_RESULTAT = 'https://sosshine.com/signature-emotionnelle'
const URL_SERENITE = 'https://buy.stripe.com/3cI5kvai06p51oJbgK5ZC0f'
const URL_ESSENTIELLE = 'https://buy.stripe.com/3cIcMXducdRx3wResW5ZC0e'

type Vars = {
  firstName: string
  email: string
  dominant: string
  q15Response: string
}

export function generateEmail02(vars: Vars): { subject: string; html: string } {
  const { firstName, email, dominant, q15Response } = vars
  const dimInfo = DIMENSIONS[parseInt(dominant) as keyof typeof DIMENSIONS]
  const texts = DIMENSION_TEXTS[dominant]

  const displayName = firstName || 'Toi'
  const subject = `${firstName ? firstName + ', v' : 'V'}oilà ce que tes 15 réponses ont dit`

  const content = [
    // ── Opening ──
    firstName ? p(`${firstName},`) : '',
    p(`On vient de finir ensemble.`),
    p(`Avant toute chose, merci d'avoir répondu honnêtement. Tu n'imagines pas à quel point la plupart des gens se mentent à eux-mêmes en répondant à ce genre de test.`),
    p(`Pas toi.`),

    goldDivider(),

    // ── Pattern (Acte 2) ──
    h2(`${dimInfo?.icon || '✨'} Il y a un pattern dans tes réponses.`),
    texts ? `<div style="font-size:15px;line-height:1.75;color:#d4d4d4;white-space:pre-line;margin:0 0 16px 0;">${texts.acte2}</div>` : '',

    goldDivider(),

    // ── Q15 Response (Acte 5) ──
    q15Response ? [
      h2(`Ta phrase à l'enfant en toi`),
      quoteBlock(q15Response),
      spacer(16),
      p(`Cette phrase n'était pas un hasard.`),
      p(`C'est exactement ce que cet(te) enfant attendait d'entendre il y a 20, 30 ans.`),
      p(`Et c'est exactement ce que SOS Shine va t'aider à lui dire vraiment.`),
    ].join('') : '',

    goldDivider(),

    // ── Origin (Acte 3 — preview) ──
    h2(`D'où ça vient ?`),
    texts ? p(texts.acte3.split('\n')[0] + '...') : '',
    pMuted(`La suite de ton analyse complète t'attend :`,),

    // ── CTA principal ──
    ctaButton('Voir mon résultat complet', URL_RESULTAT),

    goldDivider(),

    // ── What's next ──
    h2(`Et maintenant ?`),
    p(`Ton profil a identifié des protocoles qui correspondent à ce que tu traverses. Ils sont prêts pour toi.`),

    spacer(8),

    // ── Protocol matching teaser ──
    `<table role="presentation" width="100%" cellspacing="0" cellpadding="0">
<tr><td style="padding:16px 20px;background:rgba(201,169,97,0.06);border:1px solid rgba(201,169,97,0.12);border-radius:12px;">
<p style="font-size:13px;color:${BRAND};font-weight:600;margin:0 0 8px 0;">Tes protocoles personnalisés</p>
<p style="font-size:13px;color:#a1a1aa;line-height:1.6;margin:0;">
Basés sur tes réponses, nous avons identifié les chemins qui vont vraiment te parler. 3 étapes par protocole : Comprendre · Libérer · Agir.
</p>
</td></tr>
</table>`,

    spacer(16),

    ctaButton('COMMENCER SÉRÉNITÉ · 🎁 7 jours offerts', URL_SERENITE),
    ctaLink('Voir la formule Essentielle (9,90€/mois) →', URL_ESSENTIELLE),

    goldDivider(),

    // ── Closing ──
    p(`Prends ton temps pour relire ton résultat. Ce n'est pas anodin.`),
    p(`À très vite.`),

    signature(),
  ].join('')

  return {
    subject,
    html: wrapEmail(content, { email }),
  }
}
