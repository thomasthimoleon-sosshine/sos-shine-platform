/**
 * SOS Meet Couple — la banque de questions.
 * ---------------------------------------------------------------------------
 * PRINCIPE : sur chaque dimension, deux questions jumelles.
 *   « moi »    : comment JE vis cette dimension.
 *   « l'autre » : comment je crois que MON PARTENAIRE la vit.
 * L'écart entre ce que l'un croit et ce que l'autre vit donne le MALENTENDU,
 * la donnée la plus précieuse du diagnostic : un malentendu se répare par une
 * conversation, là où une divergence demande un arbitrage.
 *
 * ANCRAGE. Les dimensions ne sont pas inventées, elles reprennent les
 * construits les plus établis de la recherche sur le couple :
 *   - Gottman : critique, mépris, défensive, retrait ; démarrage doux ;
 *     tentatives de réparation ; admiration. Le mépris est le prédicteur le
 *     plus robuste de la rupture, d'où son poids le plus élevé.
 *   - Reis & Gable : la « réactivité perçue du partenaire », se sentir compris,
 *     validé, pris en compte. Cœur de l'intimité.
 *   - Bowlby, Hazan & Shaver, Johnson : attachement, anxiété d'abandon et
 *     évitement, cycle poursuite/retrait.
 *   - Rusbult : satisfaction, alternatives, investissement.
 *   - Basson, Nagoski : désir spontané contre désir réactif, écart de désir.
 *   - Équité et charge mentale dans la répartition du quotidien.
 *
 * Les items de vigilance (nature 'safety') sont inspirés des dimensions
 * reconnues du contrôle coercitif : isolement, contrôle financier,
 * humiliation, peur, contrainte sexuelle. Ils ne sont JAMAIS scorés dans une
 * dimension, JAMAIS affichés dans le livrable commun. Voir safety.ts.
 *
 * Le texte libre ne sort jamais vers l'autre partenaire, sous aucune forme.
 */

import type { CoupleQuestion, CoupleSection, CoupleChoice } from './types'

// ── Échelles réutilisables. Valeur 0..100, où 100 est toujours le pôle sain. ──
const FREQ: CoupleChoice[] = [
  { label: 'Jamais', value: 0 }, { label: 'Rarement', value: 25 },
  { label: 'Parfois', value: 50 }, { label: 'Souvent', value: 75 },
  { label: 'Presque toujours', value: 100 },
]
/** Pour les formulations négatives : « souvent » y est le mauvais pôle. */
const FREQ_INV: CoupleChoice[] = [
  { label: 'Jamais', value: 100 }, { label: 'Rarement', value: 75 },
  { label: 'Parfois', value: 50 }, { label: 'Souvent', value: 25 },
  { label: 'Presque toujours', value: 0 },
]
const ACCORD: CoupleChoice[] = [
  { label: 'Pas du tout', value: 0 }, { label: 'Un peu', value: 25 },
  { label: 'Moyennement', value: 50 }, { label: 'Beaucoup', value: 75 },
  { label: 'Totalement', value: 100 },
]

export const SECTIONS: CoupleSection[] = [
  { id: 'lien', title: 'Le lien aujourd’hui', intro: 'On commence par le plus simple et le plus difficile : comment tu te sens dans cette relation, maintenant.' },
  { id: 'parler', title: 'Se parler', intro: 'Pas ce que vous vous dites. La façon dont vous vous le dites.' },
  { id: 'disputer', title: 'Se disputer, et revenir', intro: 'Tous les couples se disputent. Ce qui les distingue, c’est ce qui se passe pendant, et surtout après.' },
  { id: 'regard', title: 'Le regard', intro: 'La façon dont vous vous voyez encore l’un l’autre.' },
  { id: 'corps', title: 'Le corps et le désir', intro: 'Des questions intimes. Elles restent entre toi et nous : ton/ta partenaire ne lira jamais tes réponses.', sensitive: true },
  { id: 'quotidien', title: 'Le quotidien', intro: 'Là où l’usure se loge le plus souvent, sans que personne ne l’ait décidé.' },
  { id: 'demain', title: 'Demain', intro: 'Ce vers quoi vous allez, si vous allez au même endroit.' },
  { id: 'poids', title: 'Ce qui pèse', intro: 'Ce qui s’est accumulé. Réponds franchement, personne ne te lira par-dessus l’épaule.', sensitive: true },
  { id: 'non_dits', title: 'Ce qu’on n’ose plus se dire', intro: 'Écris librement. Ces réponses ne seront jamais montrées à ton/ta partenaire, sous aucune forme.', sensitive: true },
]

export const COUPLE_QUESTIONS: CoupleQuestion[] = [
  // ══ LE LIEN ══════════════════════════════════════════════════════════════
  // Réactivité perçue du partenaire (Reis) : le cœur de l'intimité.
  { id: 'c_resp_self', section: 'lien', nature: 'self', dimension: 'responsivite', pair: 'resp', type: 'choice', weight: 1.4,
    text: 'Quand tu racontes quelque chose d’important pour toi, te sens-tu vraiment écouté·e ?', choices: FREQ },
  { id: 'c_resp_other', section: 'lien', nature: 'perceived', dimension: 'responsivite', pair: 'resp', type: 'choice',
    text: 'Et ton/ta partenaire, à ton avis : se sent-il·elle vraiment écouté·e par toi ?', choices: FREQ },

  { id: 'c_resp2_self', section: 'lien', nature: 'self', dimension: 'responsivite', type: 'choice',
    text: 'As-tu l’impression que ton/ta partenaire comprend ce que tu traverses en ce moment ?', choices: FREQ },

  { id: 'c_intim_self', section: 'lien', nature: 'self', dimension: 'intimite', pair: 'intim', type: 'choice',
    text: 'Te confies-tu à ton/ta partenaire sur ce qui te touche vraiment ?', choices: FREQ },
  { id: 'c_intim_other', section: 'lien', nature: 'perceived', dimension: 'intimite', pair: 'intim', type: 'choice',
    text: 'À ton avis, ton/ta partenaire se confie-t-il·elle vraiment à toi ?', choices: FREQ },

  // Attachement : anxiété d'abandon et évitement.
  { id: 'c_secu_self', section: 'lien', nature: 'self', dimension: 'securite', pair: 'secu', type: 'choice', weight: 1.3,
    text: 'Te sens-tu en sécurité dans ce lien, sans craindre qu’il se dérobe ?', choices: FREQ },
  { id: 'c_secu_other', section: 'lien', nature: 'perceived', dimension: 'securite', pair: 'secu', type: 'choice',
    text: 'À ton avis, ton/ta partenaire se sent-il·elle en sécurité avec toi ?', choices: FREQ },

  // ══ SE PARLER ════════════════════════════════════════════════════════════
  // Démarrage doux contre démarrage dur (Gottman).
  { id: 'c_comm_self', section: 'parler', nature: 'self', dimension: 'communication', pair: 'comm', type: 'choice', weight: 1.2,
    text: 'Quand quelque chose ne va pas, arrives-tu à le dire calmement, sans reproche ?', choices: FREQ },
  { id: 'c_comm_other', section: 'parler', nature: 'perceived', dimension: 'communication', pair: 'comm', type: 'choice',
    text: 'Et ton/ta partenaire : arrive-t-il·elle à te dire les choses calmement ?', choices: FREQ },

  { id: 'c_comm2_self', section: 'parler', nature: 'self', dimension: 'communication', type: 'choice',
    text: 'Oses-tu demander ce dont tu as besoin, plutôt que d’attendre qu’on le devine ?', choices: FREQ },

  { id: 'c_comm3_self', section: 'parler', nature: 'self', dimension: 'communication', type: 'choice',
    text: 'Y a-t-il des sujets que vous évitez soigneusement tous les deux ?', choices: FREQ_INV },

  // ══ SE DISPUTER ══════════════════════════════════════════════════════════
  // Les quatre comportements les plus prédictifs de rupture (Gottman).
  { id: 'c_conf_self', section: 'disputer', nature: 'self', dimension: 'conflit', pair: 'conf', type: 'choice', weight: 1.4,
    text: 'Pendant une dispute, te fermes-tu ou quittes-tu la pièce ?', choices: FREQ_INV },
  { id: 'c_conf_other', section: 'disputer', nature: 'perceived', dimension: 'conflit', pair: 'conf', type: 'choice',
    text: 'À ton avis, ton/ta partenaire se ferme-t-il·elle ou quitte-t-il·elle la pièce ?', choices: FREQ_INV },

  { id: 'c_conf2_self', section: 'disputer', nature: 'self', dimension: 'conflit', type: 'choice',
    text: 'Quand on te fait un reproche, ton premier réflexe est-il de te défendre ?', choices: FREQ_INV },

  { id: 'c_conf3_self', section: 'disputer', nature: 'self', dimension: 'conflit', type: 'choice',
    text: 'Les disputes reviennent-elles toujours sur les mêmes sujets, sans jamais se résoudre ?', choices: FREQ_INV },

  // Tentatives de réparation : ce qui distingue les couples qui durent.
  { id: 'c_rep_self', section: 'disputer', nature: 'self', dimension: 'reparation', pair: 'rep', type: 'choice', weight: 1.5,
    text: 'Après une dispute, fais-tu un geste pour revenir vers l’autre ?', choices: FREQ },
  { id: 'c_rep_other', section: 'disputer', nature: 'perceived', dimension: 'reparation', pair: 'rep', type: 'choice',
    text: 'À ton avis, ton/ta partenaire fait-il·elle un geste pour revenir vers toi ?', choices: FREQ },

  { id: 'c_rep2_self', section: 'disputer', nature: 'self', dimension: 'reparation', type: 'choice',
    text: 'Quand ton/ta partenaire tente d’apaiser, arrives-tu à le recevoir ?', choices: FREQ },

  { id: 'c_rep3_self', section: 'disputer', nature: 'self', dimension: 'reparation', type: 'choice',
    text: 'Combien de temps le froid dure-t-il, en général ?',
    choices: [{ label: 'Quelques minutes', value: 100 }, { label: 'Quelques heures', value: 75 },
              { label: 'Un jour', value: 50 }, { label: 'Plusieurs jours', value: 20 }, { label: 'Ça ne se referme jamais vraiment', value: 0 }] },

  // ══ LE REGARD ════════════════════════════════════════════════════════════
  // Admiration contre mépris. Poids le plus élevé du questionnaire.
  { id: 'c_adm_self', section: 'regard', nature: 'self', dimension: 'admiration', pair: 'adm', type: 'choice', weight: 1.6,
    text: 'Es-tu encore fier·e de la personne que ton/ta partenaire est ?', choices: ACCORD },
  { id: 'c_adm_other', section: 'regard', nature: 'perceived', dimension: 'admiration', pair: 'adm', type: 'choice',
    text: 'À ton avis, ton/ta partenaire est-il·elle encore fier·e de toi ?', choices: ACCORD },

  { id: 'c_adm2_self', section: 'regard', nature: 'self', dimension: 'admiration', type: 'choice', weight: 1.4,
    text: 'T’arrive-t-il de le·la rabaisser, même en plaisantant, ou de lever les yeux au ciel ?', choices: FREQ_INV },

  { id: 'c_resp_r_self', section: 'regard', nature: 'self', dimension: 'respect', pair: 'resp_r', type: 'choice', weight: 1.3,
    text: 'Tes opinions et tes choix sont-ils respectés, même quand ils dérangent ?', choices: FREQ },
  { id: 'c_resp_r_other', section: 'regard', nature: 'perceived', dimension: 'respect', pair: 'resp_r', type: 'choice',
    text: 'À ton avis, ton/ta partenaire se sent-il·elle respecté·e dans ses choix ?', choices: FREQ },

  // ══ LE CORPS ET LE DÉSIR ═════════════════════════════════════════════════
  { id: 'c_des_self', section: 'corps', nature: 'self', dimension: 'desir', pair: 'des', type: 'choice', sensitive: true,
    text: 'Le désir est-il encore présent, de ton côté ?', choices: FREQ },
  { id: 'c_des_other', section: 'corps', nature: 'perceived', dimension: 'desir', pair: 'des', type: 'choice', sensitive: true,
    text: 'À ton avis, le désir est-il encore présent du côté de ton/ta partenaire ?', choices: FREQ },

  { id: 'c_des2_self', section: 'corps', nature: 'self', dimension: 'desir', type: 'choice', sensitive: true,
    text: 'La fréquence de vos moments intimes te convient-elle ?', choices: ACCORD },

  { id: 'c_des3_self', section: 'corps', nature: 'self', dimension: 'desir', type: 'choice', sensitive: true,
    text: 'Peux-tu parler de sexualité avec ton/ta partenaire sans gêne ?', choices: FREQ },

  { id: 'c_des4_self', section: 'corps', nature: 'self', dimension: 'intimite', type: 'choice', sensitive: true,
    text: 'Et la tendresse hors sexualité, les gestes gratuits : sont-ils encore là ?', choices: FREQ },

  // ══ LE QUOTIDIEN ═════════════════════════════════════════════════════════
  { id: 'c_equi_self', section: 'quotidien', nature: 'self', dimension: 'equite', pair: 'equi', type: 'choice',
    text: 'La répartition des tâches et de l’organisation te semble-t-elle juste ?', choices: ACCORD },
  { id: 'c_equi_other', section: 'quotidien', nature: 'perceived', dimension: 'equite', pair: 'equi', type: 'choice',
    text: 'À ton avis, ton/ta partenaire trouve-t-il·elle cette répartition juste ?', choices: ACCORD },

  { id: 'c_equi2_self', section: 'quotidien', nature: 'self', dimension: 'equite', type: 'choice',
    text: 'As-tu l’impression d’être seul·e à penser à tout ?', choices: FREQ_INV },

  { id: 'c_auto_self', section: 'quotidien', nature: 'self', dimension: 'autonomie', pair: 'auto', type: 'choice',
    text: 'As-tu assez d’espace à toi : tes amis, tes activités, ton temps ?', choices: ACCORD },
  { id: 'c_auto_other', section: 'quotidien', nature: 'perceived', dimension: 'autonomie', pair: 'auto', type: 'choice',
    text: 'À ton avis, ton/ta partenaire a-t-il·elle assez d’espace à lui·elle ?', choices: ACCORD },

  // ══ DEMAIN ═══════════════════════════════════════════════════════════════
  { id: 'c_proj_self', section: 'demain', nature: 'self', dimension: 'projet', pair: 'proj', type: 'choice',
    text: 'Te projettes-tu encore avec ton/ta partenaire dans cinq ans ?', choices: ACCORD },
  { id: 'c_proj_other', section: 'demain', nature: 'perceived', dimension: 'projet', pair: 'proj', type: 'choice',
    text: 'À ton avis, ton/ta partenaire se projette-t-il·elle encore avec toi ?', choices: ACCORD },

  { id: 'c_val_self', section: 'demain', nature: 'self', dimension: 'valeurs', pair: 'val', type: 'choice',
    text: 'Sur ce qui compte vraiment pour toi, vous sentez-vous alignés ?', choices: ACCORD },
  { id: 'c_val_other', section: 'demain', nature: 'perceived', dimension: 'valeurs', pair: 'val', type: 'choice',
    text: 'À ton avis, ton/ta partenaire vous sent-il·elle alignés là-dessus ?', choices: ACCORD },

  // ══ CE QUI PÈSE ══════════════════════════════════════════════════════════
  { id: 'c_ranc_self', section: 'poids', nature: 'self', dimension: 'rancoeur', pair: 'ranc', type: 'choice', weight: 1.2, sensitive: true,
    text: 'Y a-t-il des choses que tu n’as jamais vraiment pardonnées ?', choices: FREQ_INV },
  { id: 'c_ranc_other', section: 'poids', nature: 'perceived', dimension: 'rancoeur', pair: 'ranc', type: 'choice', sensitive: true,
    text: 'À ton avis, ton/ta partenaire garde-t-il·elle des choses qu’il·elle ne t’a pas pardonnées ?', choices: FREQ_INV },

  { id: 'c_ranc2_self', section: 'poids', nature: 'self', dimension: 'rancoeur', type: 'choice', sensitive: true,
    text: 'T’arrive-t-il de penser à partir ?', choices: FREQ_INV },

  // ── Items de vigilance. Jamais scorés, jamais dans le livrable commun. ──
  { id: 'v_peur', section: 'poids', nature: 'safety', type: 'choice', sensitive: true,
    text: 'T’arrive-t-il d’avoir peur de la réaction de ton/ta partenaire ?', choices: FREQ_INV },
  { id: 'v_isolement', section: 'poids', nature: 'safety', type: 'choice', sensitive: true,
    text: 'Ton/ta partenaire cherche-t-il·elle à limiter qui tu vois ?', choices: FREQ_INV },
  { id: 'v_argent', section: 'poids', nature: 'safety', type: 'choice', sensitive: true,
    text: 'Ton accès à l’argent est-il contrôlé ou conditionné ?', choices: FREQ_INV },
  { id: 'v_humiliation', section: 'poids', nature: 'safety', type: 'choice', sensitive: true,
    text: 'Es-tu humilié·e, devant les autres ou en privé ?', choices: FREQ_INV },
  { id: 'v_surveillance', section: 'poids', nature: 'safety', type: 'choice', sensitive: true,
    text: 'Tes messages, ton téléphone ou tes déplacements sont-ils surveillés ?', choices: FREQ_INV },
  { id: 'v_contrainte', section: 'poids', nature: 'safety', type: 'choice', sensitive: true,
    text: 'T’est-il arrivé de céder à un rapport intime pour éviter un conflit ?', choices: FREQ_INV },

  // ══ CE QU'ON N'OSE PLUS SE DIRE ══════════════════════════════════════════
  // Texte libre : ne sort JAMAIS vers l'autre partenaire (invariant I1).
  { id: 'o_non_dit', section: 'non_dits', nature: 'open', type: 'text', sensitive: true,
    text: 'Qu’est-ce que tu n’oses plus lui dire ?',
    placeholder: 'Personne d’autre que l’équipe SOS Shine ne lira ceci.' },
  { id: 'o_manque', section: 'non_dits', nature: 'open', type: 'text', sensitive: true,
    text: 'Qu’est-ce qui te manque le plus, aujourd’hui ?', placeholder: 'Prends le temps.' },
  { id: 'o_bascule', section: 'non_dits', nature: 'open', type: 'text', sensitive: true,
    text: 'S’il y a eu un moment où quelque chose a basculé, lequel ?', placeholder: 'Si tu vois lequel.' },
  { id: 'o_garde', section: 'non_dits', nature: 'open', type: 'text', sensitive: true,
    text: 'Qu’est-ce qui vous tient encore ensemble ?', placeholder: 'Ce qui reste, même petit.' },
  { id: 'o_espoir', section: 'non_dits', nature: 'open', type: 'text', sensitive: true,
    text: 'Si une seule chose changeait, laquelle choisirais-tu ?', placeholder: 'Une seule.' },
]

export const QUESTIONS_BY_ID: Record<string, CoupleQuestion> =
  Object.fromEntries(COUPLE_QUESTIONS.map(q => [q.id, q]))

export const SCORED_QUESTIONS = COUPLE_QUESTIONS.filter(
  q => q.nature === 'self' || q.nature === 'perceived')
export const SAFETY_QUESTIONS = COUPLE_QUESTIONS.filter(q => q.nature === 'safety')
export const OPEN_QUESTIONS = COUPLE_QUESTIONS.filter(q => q.nature === 'open')

export const COUPLE_QUESTION_COUNT = COUPLE_QUESTIONS.length

/** Les questions d'une section, dans l'ordre de la banque. */
export function questionsOfSection(sectionId: string): CoupleQuestion[] {
  return COUPLE_QUESTIONS.filter(q => q.section === sectionId)
}

/** La valeur 0..100 d'une réponse fermée, ou null si non répondue. */
export function valueOf(qid: string, answers: Record<string, number>): number | null {
  const q = QUESTIONS_BY_ID[qid]
  if (!q || !q.choices) return null
  const idx = answers[qid]
  if (idx == null) return null
  const c = q.choices[idx]
  return typeof c?.value === 'number' ? c.value : null
}
