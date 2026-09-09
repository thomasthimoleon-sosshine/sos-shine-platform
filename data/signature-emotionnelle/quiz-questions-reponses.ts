/**
 * ============================================================
 * SOS SHINE - QUIZ SIGNATURE EMOTIONNELLE
 * 15 QUESTIONS — 4 REPONSES PAR QUESTION
 * ============================================================
 *
 * Chaque reponse attribue des points a un ou deux profils.
 * Le profil avec le score le plus eleve a la fin du quiz
 * determine la "Signature Emotionnelle" de l'utilisateur.
 *
 * Profils (P1-P10) :
 *   P1  = L'Analyste
 *   P2  = L'Electron Libre
 *   P3  = Le Pilier
 *   P4  = La Citadelle
 *   P5  = Le Gardien du Cadre
 *   P6  = Le Cameleon
 *   P7  = La Vigie
 *   P8  = L'Idealiste
 *   P9  = Le Diplomate
 *   P10 = Le Catalyseur
 */

export interface ReponseQuiz {
  lettre: string;
  texte: string;
  profilsPrincipaux: string;  // Ex: "P1 (+3), P7 (+1)"
}

export interface QuestionQuiz {
  numero: number;
  question: string;
  reponses: ReponseQuiz[];
}

export const QUIZ_COMPLET: QuestionQuiz[] = [
  // ──────────────────────────────────────
  // QUESTION 1
  // ──────────────────────────────────────
  {
    numero: 1,
    question: "Lorsque vous traversez une periode difficile, quel est votre premier reflexe ?",
    reponses: [
      {
        lettre: "A",
        texte: "J'analyse la situation sous tous les angles pour comprendre ce qui se passe",
        profilsPrincipaux: "L'Analyste (P1 +3), La Vigie (P7 +1)",
      },
      {
        lettre: "B",
        texte: "Je me lance dans une activite ou un projet pour ne pas rester immobile",
        profilsPrincipaux: "L'Electron Libre (P2 +3), Le Catalyseur (P10 +1)",
      },
      {
        lettre: "C",
        texte: "Je m'assure que mes proches vont bien avant de penser a moi",
        profilsPrincipaux: "Le Pilier (P3 +3), Le Diplomate (P9 +1)",
      },
      {
        lettre: "D",
        texte: "Je prends de la distance et je gere seul(e)",
        profilsPrincipaux: "La Citadelle (P4 +3), Le Gardien du Cadre (P5 +1)",
      },
    ],
  },

  // ──────────────────────────────────────
  // QUESTION 2
  // ──────────────────────────────────────
  {
    numero: 2,
    question: "Face a un conflit avec un proche, quelle est votre reaction instinctive ?",
    reponses: [
      {
        lettre: "A",
        texte: "Je cherche a comprendre la logique derriere le desaccord",
        profilsPrincipaux: "L'Analyste (P1 +3), Le Gardien du Cadre (P5 +1)",
      },
      {
        lettre: "B",
        texte: "Je fais tout pour apaiser les tensions et retrouver l'harmonie",
        profilsPrincipaux: "Le Diplomate (P9 +3), Le Cameleon (P6 +1)",
      },
      {
        lettre: "C",
        texte: "Je m'adapte a l'autre pour eviter que la situation ne degenere",
        profilsPrincipaux: "Le Cameleon (P6 +3), Le Pilier (P3 +1)",
      },
      {
        lettre: "D",
        texte: "Je ressens une montee d'energie intense et j'ai besoin de m'exprimer",
        profilsPrincipaux: "Le Catalyseur (P10 +3), L'Idealiste (P8 +1)",
      },
    ],
  },

  // ──────────────────────────────────────
  // QUESTION 3
  // ──────────────────────────────────────
  {
    numero: 3,
    question: "Qu'est-ce qui vous epuise le plus au quotidien ?",
    reponses: [
      {
        lettre: "A",
        texte: "Ne pas comprendre pourquoi les choses arrivent",
        profilsPrincipaux: "L'Analyste (P1 +3), La Vigie (P7 +1)",
      },
      {
        lettre: "B",
        texte: "Etre oblige(e) de rester immobile ou dans la routine",
        profilsPrincipaux: "L'Electron Libre (P2 +3), Le Catalyseur (P10 +1)",
      },
      {
        lettre: "C",
        texte: "Sentir que les gens autour de moi ne vont pas bien",
        profilsPrincipaux: "Le Pilier (P3 +3), L'Idealiste (P8 +1)",
      },
      {
        lettre: "D",
        texte: "Devoir dependre de quelqu'un d'autre",
        profilsPrincipaux: "La Citadelle (P4 +3), Le Gardien du Cadre (P5 +1)",
      },
    ],
  },

  // ──────────────────────────────────────
  // QUESTION 4
  // ──────────────────────────────────────
  {
    numero: 4,
    question: "Comment gerez-vous l'incertitude dans votre vie ?",
    reponses: [
      {
        lettre: "A",
        texte: "Je planifie et j'anticipe tous les scenarios possibles",
        profilsPrincipaux: "La Vigie (P7 +3), Le Gardien du Cadre (P5 +1)",
      },
      {
        lettre: "B",
        texte: "Je m'adapte en temps reel, en me fondant dans le contexte",
        profilsPrincipaux: "Le Cameleon (P6 +3), L'Electron Libre (P2 +1)",
      },
      {
        lettre: "C",
        texte: "Je cherche du sens profond dans ce qui m'arrive",
        profilsPrincipaux: "L'Idealiste (P8 +3), L'Analyste (P1 +1)",
      },
      {
        lettre: "D",
        texte: "Je provoque un changement radical pour reprendre le controle",
        profilsPrincipaux: "Le Catalyseur (P10 +3), La Citadelle (P4 +1)",
      },
    ],
  },

  // ──────────────────────────────────────
  // QUESTION 5
  // ──────────────────────────────────────
  {
    numero: 5,
    question: "Dans vos relations, quel role endossez-vous le plus souvent ?",
    reponses: [
      {
        lettre: "A",
        texte: "Le conseiller ou la conseillere : on vient me voir pour ma lucidite",
        profilsPrincipaux: "L'Analyste (P1 +3), Le Diplomate (P9 +1)",
      },
      {
        lettre: "B",
        texte: "Le pilier : je suis celui ou celle sur qui tout le monde s'appuie",
        profilsPrincipaux: "Le Pilier (P3 +3), Le Gardien du Cadre (P5 +1)",
      },
      {
        lettre: "C",
        texte: "Le mediateur : je fais le lien entre les gens et j'apaise les tensions",
        profilsPrincipaux: "Le Diplomate (P9 +3), Le Cameleon (P6 +1)",
      },
      {
        lettre: "D",
        texte: "L'electron libre : je suis le moteur qui entraine les autres",
        profilsPrincipaux: "L'Electron Libre (P2 +3), Le Catalyseur (P10 +1)",
      },
    ],
  },

  // ──────────────────────────────────────
  // QUESTION 6
  // ──────────────────────────────────────
  {
    numero: 6,
    question: "Quelle est votre plus grande peur inconsciente ?",
    reponses: [
      {
        lettre: "A",
        texte: "Perdre le controle de la situation ou de moi-meme",
        profilsPrincipaux: "Le Gardien du Cadre (P5 +3), La Vigie (P7 +1)",
      },
      {
        lettre: "B",
        texte: "Etre abandonne(e) ou devenir invisible aux yeux des autres",
        profilsPrincipaux: "Le Pilier (P3 +3), Le Cameleon (P6 +1)",
      },
      {
        lettre: "C",
        texte: "Ne jamais trouver quelqu'un qui me comprenne vraiment",
        profilsPrincipaux: "L'Idealiste (P8 +3), La Citadelle (P4 +1)",
      },
      {
        lettre: "D",
        texte: "Etre trahi(e) et regretter d'avoir fait confiance",
        profilsPrincipaux: "La Citadelle (P4 +3), La Vigie (P7 +1)",
      },
    ],
  },

  // ──────────────────────────────────────
  // QUESTION 7
  // ──────────────────────────────────────
  {
    numero: 7,
    question: "Quand une emotion forte vous submerge, que faites-vous ?",
    reponses: [
      {
        lettre: "A",
        texte: "J'essaie de la decortiquer mentalement pour la comprendre",
        profilsPrincipaux: "L'Analyste (P1 +3), La Vigie (P7 +1)",
      },
      {
        lettre: "B",
        texte: "Je la canalise dans une action concrete ou un mouvement",
        profilsPrincipaux: "L'Electron Libre (P2 +3), Le Catalyseur (P10 +1)",
      },
      {
        lettre: "C",
        texte: "Je la garde pour moi et je me referme",
        profilsPrincipaux: "La Citadelle (P4 +3), Le Diplomate (P9 +1)",
      },
      {
        lettre: "D",
        texte: "Je la vis intensement, quitte a etre submerge(e)",
        profilsPrincipaux: "L'Idealiste (P8 +3), Le Catalyseur (P10 +1)",
      },
    ],
  },

  // ──────────────────────────────────────
  // QUESTION 8
  // ──────────────────────────────────────
  {
    numero: 8,
    question: "Qu'est-ce qui vous redonne de l'energie quand vous etes a plat ?",
    reponses: [
      {
        lettre: "A",
        texte: "Avoir un nouveau projet ou une nouvelle direction a explorer",
        profilsPrincipaux: "L'Electron Libre (P2 +3), Le Catalyseur (P10 +2)",
      },
      {
        lettre: "B",
        texte: "Une conversation profonde et authentique avec quelqu'un",
        profilsPrincipaux: "L'Idealiste (P8 +3), Le Pilier (P3 +1)",
      },
      {
        lettre: "C",
        texte: "Un moment de solitude ou je peux tout remettre en ordre",
        profilsPrincipaux: "Le Gardien du Cadre (P5 +3), La Citadelle (P4 +1)",
      },
      {
        lettre: "D",
        texte: "Sentir que je suis utile et que mes proches vont bien",
        profilsPrincipaux: "Le Pilier (P3 +3), Le Diplomate (P9 +1)",
      },
    ],
  },

  // ──────────────────────────────────────
  // QUESTION 9
  // ──────────────────────────────────────
  {
    numero: 9,
    question: "Comment reagissez-vous lorsque quelqu'un vous decoit profondement ?",
    reponses: [
      {
        lettre: "A",
        texte: "Je coupe le lien et je me protege immediatement",
        profilsPrincipaux: "La Citadelle (P4 +3), Le Catalyseur (P10 +1)",
      },
      {
        lettre: "B",
        texte: "Je cherche a comprendre ses raisons avant de juger",
        profilsPrincipaux: "L'Analyste (P1 +2), Le Diplomate (P9 +2)",
      },
      {
        lettre: "C",
        texte: "Je fais comme si de rien n'etait pour preserver la relation",
        profilsPrincipaux: "Le Cameleon (P6 +3), Le Diplomate (P9 +1)",
      },
      {
        lettre: "D",
        texte: "Je ressens une blessure intense et je remets tout en question",
        profilsPrincipaux: "L'Idealiste (P8 +3), Le Pilier (P3 +1)",
      },
    ],
  },

  // ──────────────────────────────────────
  // QUESTION 10
  // ──────────────────────────────────────
  {
    numero: 10,
    question: "Dans un groupe, quelle posture adoptez-vous naturellement ?",
    reponses: [
      {
        lettre: "A",
        texte: "J'observe et j'analyse les dynamiques avant de m'impliquer",
        profilsPrincipaux: "La Vigie (P7 +3), L'Analyste (P1 +1)",
      },
      {
        lettre: "B",
        texte: "Je m'ajuste au ton du groupe pour que tout se passe bien",
        profilsPrincipaux: "Le Cameleon (P6 +3), Le Diplomate (P9 +1)",
      },
      {
        lettre: "C",
        texte: "Je prends les renes si personne ne le fait",
        profilsPrincipaux: "Le Gardien du Cadre (P5 +3), L'Electron Libre (P2 +1)",
      },
      {
        lettre: "D",
        texte: "Je recherche les echanges vrais et profonds, pas le superficiel",
        profilsPrincipaux: "L'Idealiste (P8 +3), La Citadelle (P4 +1)",
      },
    ],
  },

  // ──────────────────────────────────────
  // QUESTION 11
  // ──────────────────────────────────────
  {
    numero: 11,
    question: "Quel type de silence vous met le plus mal a l'aise ?",
    reponses: [
      {
        lettre: "A",
        texte: "Le silence apres un conflit non resolu",
        profilsPrincipaux: "Le Diplomate (P9 +3), Le Pilier (P3 +1)",
      },
      {
        lettre: "B",
        texte: "Le silence de l'inactivite, quand rien ne se passe",
        profilsPrincipaux: "L'Electron Libre (P2 +3), Le Catalyseur (P10 +1)",
      },
      {
        lettre: "C",
        texte: "Le silence interieur, quand je n'ai pas de reponse a mes questions",
        profilsPrincipaux: "L'Analyste (P1 +3), L'Idealiste (P8 +1)",
      },
      {
        lettre: "D",
        texte: "Le silence des autres, quand je ne sais pas ce qu'ils pensent",
        profilsPrincipaux: "La Vigie (P7 +3), Le Cameleon (P6 +1)",
      },
    ],
  },

  // ──────────────────────────────────────
  // QUESTION 12
  // ──────────────────────────────────────
  {
    numero: 12,
    question: "Que pensez-vous de la vulnerabilite ?",
    reponses: [
      {
        lettre: "A",
        texte: "C'est une force, mais je prefere la montrer uniquement a ceux qui la meritent",
        profilsPrincipaux: "La Citadelle (P4 +3), L'Idealiste (P8 +1)",
      },
      {
        lettre: "B",
        texte: "J'y aspire mais j'ai peur de perdre le controle si je m'y abandonne",
        profilsPrincipaux: "Le Gardien du Cadre (P5 +3), L'Analyste (P1 +1)",
      },
      {
        lettre: "C",
        texte: "Je la montre surtout quand l'autre en a besoin, rarement pour moi",
        profilsPrincipaux: "Le Pilier (P3 +3), Le Cameleon (P6 +1)",
      },
      {
        lettre: "D",
        texte: "Je la contourne en passant a l'action ou au changement",
        profilsPrincipaux: "L'Electron Libre (P2 +3), Le Catalyseur (P10 +1)",
      },
    ],
  },

  // ──────────────────────────────────────
  // QUESTION 13
  // ──────────────────────────────────────
  {
    numero: 13,
    question: "Face a un changement majeur et imprevu dans votre vie, vous avez tendance a :",
    reponses: [
      {
        lettre: "A",
        texte: "Anticiper toutes les consequences et preparer un plan B",
        profilsPrincipaux: "La Vigie (P7 +3), Le Gardien du Cadre (P5 +2)",
      },
      {
        lettre: "B",
        texte: "Voir ca comme une opportunite de tout reinventer",
        profilsPrincipaux: "Le Catalyseur (P10 +3), L'Electron Libre (P2 +1)",
      },
      {
        lettre: "C",
        texte: "M'adapter rapidement pour rassurer mon entourage",
        profilsPrincipaux: "Le Cameleon (P6 +2), Le Pilier (P3 +2)",
      },
      {
        lettre: "D",
        texte: "Me replier pour digerer le choc a mon rythme",
        profilsPrincipaux: "La Citadelle (P4 +3), L'Analyste (P1 +1)",
      },
    ],
  },

  // ──────────────────────────────────────
  // QUESTION 14
  // ──────────────────────────────────────
  {
    numero: 14,
    question: "Quelle phrase resonne le plus en vous ?",
    reponses: [
      {
        lettre: "A",
        texte: "\"Si je comprends pourquoi, je peux tout supporter\"",
        profilsPrincipaux: "L'Analyste (P1 +3), La Vigie (P7 +1)",
      },
      {
        lettre: "B",
        texte: "\"Je prefere plier que de demander de l'aide\"",
        profilsPrincipaux: "La Citadelle (P4 +2), Le Gardien du Cadre (P5 +2)",
      },
      {
        lettre: "C",
        texte: "\"Si les gens autour de moi vont bien, alors je vais bien\"",
        profilsPrincipaux: "Le Pilier (P3 +3), Le Cameleon (P6 +1)",
      },
      {
        lettre: "D",
        texte: "\"La vie est trop courte pour la mediocrite\"",
        profilsPrincipaux: "L'Idealiste (P8 +3), Le Catalyseur (P10 +1)",
      },
    ],
  },

  // ──────────────────────────────────────
  // QUESTION 15
  // ──────────────────────────────────────
  {
    numero: 15,
    question: "Si vous deviez decrire votre mode de survie en un mot, ce serait :",
    reponses: [
      {
        lettre: "A",
        texte: "La comprehension — tout analyser pour ne plus souffrir",
        profilsPrincipaux: "L'Analyste (P1 +3), La Vigie (P7 +1)",
      },
      {
        lettre: "B",
        texte: "L'harmonie — tout apaiser pour que personne ne souffre",
        profilsPrincipaux: "Le Diplomate (P9 +3), Le Pilier (P3 +1)",
      },
      {
        lettre: "C",
        texte: "Le mouvement — avancer pour ne pas sombrer",
        profilsPrincipaux: "L'Electron Libre (P2 +3), Le Catalyseur (P10 +1)",
      },
      {
        lettre: "D",
        texte: "L'adaptation — me transformer pour ne pas etre rejete(e)",
        profilsPrincipaux: "Le Cameleon (P6 +3), Le Diplomate (P9 +1)",
      },
    ],
  },
];

/**
 * ============================================================
 * RESUME : CORRESPONDANCE PROFILS ↔ REPONSES
 * ============================================================
 *
 * Ce tableau resume les questions ou chaque profil est le profil principal (+3 pts) :
 *
 * P1  L'Analyste          → Q1-A, Q2-A, Q3-A, Q5-A, Q7-A, Q11-C, Q14-A, Q15-A
 * P2  L'Electron Libre    → Q1-B, Q3-B, Q5-D, Q7-B, Q8-A, Q11-B, Q12-D, Q15-C
 * P3  Le Pilier           → Q1-C, Q3-C, Q6-B, Q8-D, Q12-C, Q14-C
 * P4  La Citadelle        → Q1-D, Q6-D, Q7-C, Q9-A, Q12-A, Q13-D
 * P5  Le Gardien du Cadre → Q6-A, Q8-C, Q10-C, Q12-B
 * P6  Le Cameleon         → Q2-C, Q4-B, Q9-C, Q10-B, Q15-D
 * P7  La Vigie            → Q4-A, Q10-A, Q11-D, Q13-A
 * P8  L'Idealiste         → Q4-C, Q7-D, Q8-B, Q9-D, Q10-D, Q14-D
 * P9  Le Diplomate        → Q2-B, Q5-C, Q11-A, Q15-B
 * P10 Le Catalyseur       → Q2-D, Q4-D, Q13-B
 */
