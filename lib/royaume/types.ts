/* ═══════════════════════════════════════════════════════════════
   Modèle de données commun aux deux parcours.
   Le narratif fait partie de la donnée, pas de la mise en page :
   une question sans son histoire n’est pas une question ici.
═══════════════════════════════════════════════════════════════ */

export type QuestionKind =
  /** Curseur entre deux pôles nommés. Note de 1 à 7. */
  | "scale"
  /** Choix unique. Chaque option porte une valeur de 1 à 7. */
  | "choice"
  /** Choix multiple, sans score — sert à la lecture, pas au calcul. */
  | "multi"
  /** Écriture libre. Jamais noté, toujours relu. */
  | "text";

export type Option = {
  id: string;
  label: string;
  /** 1 = le plus contracté, 7 = le plus ouvert. Absent pour "multi". */
  value?: number;
};

export type Question = {
  id: string;
  themeId: string;
  /** 2 à 5 phrases. La métaphore qui précède, et qui fait descendre. */
  narrative: string;
  /** La question elle-même, courte, frontale. */
  prompt: string;
  kind: QuestionKind;
  options?: Option[];
  /** Pôles du curseur : [bas, haut]. */
  poles?: [string, string];
  placeholder?: string;
  /**
   * Vrai quand une note haute signale une contraction et non une ressource.
   * Le score est alors retourné avant agrégation.
   */
  reverse?: boolean;
  optional?: boolean;
};

export type Theme = {
  id: string;
  /** Chiffre rituel affiché avant le titre. */
  numeral: string;
  title: string;
  /** Une ligne qui ouvre le chapitre. */
  epigraph: string;
};

export type Answer = {
  questionId: string;
  /** Note normalisée 1–7 pour scale/choice. */
  value?: number;
  /** Identifiants cochés pour multi. */
  selected?: string[];
  /** Texte libre. */
  text?: string;
};

export type AnswerMap = Record<string, Answer>;

/** Résultat d’un thème après agrégation. */
export type ThemeScore = {
  themeId: string;
  /** 0–100. */
  score: number;
  /** Nombre de questions notées ayant reçu une réponse. */
  answered: number;
};
