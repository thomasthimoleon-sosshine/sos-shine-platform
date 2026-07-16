/**
 * SOS Meet — banque de questions du profil de compatibilité.
 * Structurée par dimensions. Facile à étendre vers 100+ questions :
 * ajoutez des entrées dans QUESTIONS avec la bonne `dim`.
 *
 * Types de réponse :
 *  - 'scale'  : accord 1→5 (pas du tout → tout à fait) → alimente le score de dimension
 *  - 'choice' : choix unique, chaque option porte une `value` (0→100) pour le score
 */

export type DimensionKey =
  | 'intentions' | 'spiritualite' | 'signature' | 'attachement'
  | 'valeurs' | 'communication' | 'intimite' | 'logistique'
  | 'corps' | 'personnalite' | 'maturite' | 'dealbreakers'

export type Dimension = { key: DimensionKey; label: string; emoji: string; intro: string; sensitive?: boolean }

export const DIMENSIONS: Dimension[] = [
  { key: 'intentions', label: 'Vos intentions', emoji: '🎯', intro: 'Ce que vous cherchez vraiment, aujourd\'hui.' },
  { key: 'spiritualite', label: 'Votre chemin', emoji: '🧘', intro: 'Vos pratiques et votre rapport à la conscience.' },
  { key: 'signature', label: 'Votre monde intérieur', emoji: '🫀', intro: 'Vos schémas émotionnels — l\'empreinte SOS Shine.' },
  { key: 'attachement', label: 'Vos liens', emoji: '🪢', intro: 'Comment vous vous attachez et vous rassurez.' },
  { key: 'valeurs', label: 'Vos valeurs', emoji: '🧭', intro: 'Ce qui compte le plus dans votre vie.' },
  { key: 'communication', label: 'Votre présence', emoji: '💬', intro: 'Votre manière de dire et d\'écouter.' },
  { key: 'intimite', label: 'Votre intimité', emoji: '🔥', intro: 'Votre rapport au corps et à la sensualité consciente.', sensitive: true },
  { key: 'logistique', label: 'Votre vie', emoji: '🏡', intro: 'Le concret : rythme, mobilité, projets.' },
  { key: 'corps', label: 'Votre équilibre', emoji: '🌿', intro: 'Votre hygiène de vie et votre rapport au corps.' },
  { key: 'personnalite', label: 'Votre tempérament', emoji: '✨', intro: 'Votre énergie et votre façon d\'être au monde.' },
  { key: 'maturite', label: 'Votre cheminement', emoji: '🌱', intro: 'Où vous en êtes sur le chemin.' },
  { key: 'dealbreakers', label: 'Vos non-négociables', emoji: '🚧', intro: 'Ce sur quoi vous ne transigez pas.' },
]

export type Choice = { label: string; value: number }
export type Question = {
  id: string
  dim: DimensionKey
  text: string
  type: 'scale' | 'choice'
  choices?: Choice[]
  sensitive?: boolean
}

const S = 'scale' as const
// Échelle d'accord standard réutilisée
export const SCALE: Choice[] = [
  { label: 'Pas du tout', value: 0 },
  { label: 'Un peu', value: 25 },
  { label: 'Moyennement', value: 50 },
  { label: 'Beaucoup', value: 75 },
  { label: 'Tout à fait', value: 100 },
]

export const QUESTIONS: Question[] = [
  // ── Intentions ──
  { id: 'int1', dim: 'intentions', type: 'choice', text: 'Aujourd\'hui, vous cherchez avant tout…', choices: [
    { label: 'Une relation profonde et durable', value: 100 },
    { label: 'Une connexion sincère, sans pression sur la durée', value: 60 },
    { label: 'Rencontrer et voir ce qui émerge', value: 40 },
    { label: 'De l\'amitié consciente, d\'abord', value: 20 },
  ] },
  { id: 'int2', dim: 'intentions', type: S, text: 'Fonder un foyer / une vie à deux fait partie de vos aspirations.' },
  { id: 'int3', dim: 'intentions', type: 'choice', text: 'Votre vision de l\'engagement…', choices: [
    { label: 'Exclusivité et monogamie', value: 100 },
    { label: 'Monogamie, mais j\'en parle ouvertement', value: 70 },
    { label: 'Je reste ouvert·e à d\'autres formes de relation', value: 40 },
    { label: 'Relations libres / non-monogamie consciente', value: 15 },
  ] },
  { id: 'int4', dim: 'intentions', type: S, text: 'Vous êtes prêt·e à investir du temps réel dans une rencontre qui en vaut la peine.' },
  { id: 'int5', dim: 'intentions', type: S, text: 'Vous préférez la profondeur d\'un lien à la nouveauté permanente.' },

  // ── Spiritualité ──
  { id: 'spi1', dim: 'spiritualite', type: S, text: 'La méditation ou la pleine présence font partie de votre quotidien.' },
  { id: 'spi2', dim: 'spiritualite', type: S, text: 'Le yoga, le souffle ou le mouvement conscient vous nourrissent.' },
  { id: 'spi3', dim: 'spiritualite', type: S, text: 'Vous vous intéressez au tantra ou à la sexualité sacrée.', sensitive: true },
  { id: 'spi4', dim: 'spiritualite', type: S, text: 'La non-dualité, l\'éveil ou la quête de sens vous parlent profondément.' },
  { id: 'spi5', dim: 'spiritualite', type: 'choice', text: 'Votre rapport à la spiritualité…', choices: [
    { label: 'C\'est le centre de ma vie', value: 100 },
    { label: 'Une pratique régulière et importante', value: 75 },
    { label: 'Une exploration en cours', value: 45 },
    { label: 'Une curiosité, sans pratique fixe', value: 20 },
  ] },
  { id: 'spi6', dim: 'spiritualite', type: S, text: 'Vous souhaitez un·e partenaire qui chemine spirituellement, lui/elle aussi.' },

  // ── Signature émotionnelle (SOS Shine) ──
  { id: 'sig1', dim: 'signature', type: S, text: 'Vous avez déjà fait un vrai travail sur vos blessures émotionnelles.' },
  { id: 'sig2', dim: 'signature', type: S, text: 'Vous connaissez vos schémas de protection (fuite, contrôle, sur-adaptation…).' },
  { id: 'sig3', dim: 'signature', type: S, text: 'Face au conflit, vous savez rester présent·e plutôt que fuir ou attaquer.' },
  { id: 'sig4', dim: 'signature', type: S, text: 'Vous savez accueillir vos émotions sans vous laisser submerger.' },
  { id: 'sig5', dim: 'signature', type: S, text: 'Vous êtes capable de reconnaître et de nommer vos besoins.' },

  // ── Attachement ──
  { id: 'att1', dim: 'attachement', type: S, text: 'Vous vous sentez à l\'aise avec la proximité et l\'intimité émotionnelle.' },
  { id: 'att2', dim: 'attachement', type: S, text: "Vous avez besoin d'être beaucoup rassuré·e dans une relation." },
  { id: 'att3', dim: 'attachement', type: S, text: "Vous avez besoin de beaucoup d'espace et d'indépendance." },
  { id: 'att4', dim: 'attachement', type: S, text: 'Vous faites confiance assez facilement quand la personne est sincère.' },
  { id: 'att5', dim: 'attachement', type: S, text: "L'incertitude dans une relation vous angoisse rapidement." },

  // ── Valeurs ──
  { id: 'val1', dim: 'valeurs', type: S, text: "L'écologie et le respect du vivant guident vos choix." },
  { id: 'val2', dim: 'valeurs', type: S, text: 'La liberté et l\'autonomie priment sur la sécurité matérielle.' },
  { id: 'val3', dim: 'valeurs', type: S, text: 'La famille et les liens durables sont au cœur de votre vie.' },
  { id: 'val4', dim: 'valeurs', type: S, text: "L'authenticité vaut mieux que la diplomatie de façade." },
  { id: 'val5', dim: 'valeurs', type: S, text: 'La créativité et l\'expression de soi sont essentielles pour vous.' },
  { id: 'val6', dim: 'valeurs', type: S, text: 'Vous accordez de l\'importance au service, au don, à l\'utilité.' },

  // ── Communication ──
  { id: 'com1', dim: 'communication', type: S, text: 'Vous exprimez ce que vous ressentez, même quand c\'est inconfortable.' },
  { id: 'com2', dim: 'communication', type: S, text: 'Vous savez écouter sans immédiatement vouloir résoudre ou conseiller.' },
  { id: 'com3', dim: 'communication', type: S, text: 'Vous pratiquez (ou aimez) la communication non-violente.' },
  { id: 'com4', dim: 'communication', type: S, text: 'Après une tension, vous revenez vers l\'autre pour réparer.' },
  { id: 'com5', dim: 'communication', type: S, text: 'Le silence partagé vous est confortable, pas gênant.' },

  // ── Intimité (sensible) ──
  { id: 'itm1', dim: 'intimite', type: S, sensitive: true, text: 'La connexion émotionnelle est indispensable à votre désir.' },
  { id: 'itm2', dim: 'intimite', type: S, sensitive: true, text: 'Vous vivez la sensualité comme un espace de présence, pas de performance.' },
  { id: 'itm3', dim: 'intimite', type: S, sensitive: true, text: 'Vous aimez ralentir et explorer plutôt que d\'aller vite.' },
  { id: 'itm4', dim: 'intimite', type: S, sensitive: true, text: 'Le corps et le toucher conscient tiennent une place importante pour vous.' },
  { id: 'itm5', dim: 'intimite', type: S, sensitive: true, text: 'Vous parlez de vos désirs et de vos limites avec aisance.' },

  // ── Logistique ──
  { id: 'log1', dim: 'logistique', type: 'choice', text: 'Vous avez (ou souhaitez) des enfants…', choices: [
    { label: 'J\'ai des enfants', value: 50 },
    { label: 'J\'en désire', value: 80 },
    { label: 'Je ne sais pas encore', value: 50 },
    { label: 'Je n\'en souhaite pas', value: 20 },
  ] },
  { id: 'log2', dim: 'logistique', type: S, text: 'Vous êtes prêt·e à vous déplacer / bouger pour une belle rencontre.' },
  { id: 'log3', dim: 'logistique', type: S, text: 'Votre travail vous laisse du temps et de la disponibilité de cœur.' },
  { id: 'log4', dim: 'logistique', type: 'choice', text: 'Votre rythme de vie idéal…', choices: [
    { label: 'Nature, calme, lenteur', value: 100 },
    { label: 'Équilibre ville / nature', value: 65 },
    { label: 'Ville, stimulation, mouvement', value: 30 },
    { label: 'Nomade / en voyage', value: 50 },
  ] },

  // ── Corps & équilibre ──
  { id: 'crp1', dim: 'corps', type: S, text: 'Prendre soin de votre corps (mouvement, sommeil) est une priorité.' },
  { id: 'crp2', dim: 'corps', type: S, text: 'Votre alimentation est consciente (bio, végé, jeûne, sobriété…).' },
  { id: 'crp3', dim: 'corps', type: S, text: 'Vous vivez sans (ou avec très peu de) substances : alcool, tabac…' },
  { id: 'crp4', dim: 'corps', type: S, text: 'La nature est un besoin, pas un luxe.' },

  // ── Personnalité ──
  { id: 'per1', dim: 'personnalite', type: S, text: 'Vous vous ressourcez plutôt seul·e qu\'en groupe.' },
  { id: 'per2', dim: 'personnalite', type: S, text: 'Vous êtes ouvert·e à la nouveauté et à l\'inconnu.' },
  { id: 'per3', dim: 'personnalite', type: S, text: 'Vous êtes plutôt sensible et à fleur de peau.' },
  { id: 'per4', dim: 'personnalite', type: S, text: 'Vous avez besoin de sens et de profondeur dans vos échanges.' },
  { id: 'per5', dim: 'personnalite', type: S, text: 'L\'humour et la légèreté font partie de votre équilibre.' },

  // ── Maturité du cheminement ──
  { id: 'mat1', dim: 'maturite', type: 'choice', text: 'Sur le chemin, vous diriez que…', choices: [
    { label: 'Je débute mon exploration', value: 30 },
    { label: 'Je pratique depuis quelques années', value: 65 },
    { label: 'C\'est au cœur de ma vie depuis longtemps', value: 100 },
  ] },
  { id: 'mat2', dim: 'maturite', type: S, text: 'Vous assumez la responsabilité de vos émotions, sans blâmer l\'autre.' },
  { id: 'mat3', dim: 'maturite', type: S, text: 'Vous avez déjà traversé (et intégré) des épreuves qui vous ont transformé·e.' },
  { id: 'mat4', dim: 'maturite', type: S, text: 'Vous cherchez un·e partenaire au même niveau de travail intérieur que vous.' },

  // ── Non-négociables ──
  { id: 'deal1', dim: 'dealbreakers', type: S, text: 'Un désalignement spirituel serait un frein majeur pour vous.' },
  { id: 'deal2', dim: 'dealbreakers', type: S, text: 'Le manque de travail émotionnel chez l\'autre serait rédhibitoire.' },
  { id: 'deal3', dim: 'dealbreakers', type: S, text: 'Un mode de vie très différent du vôtre (rythme, valeurs) serait bloquant.' },
  { id: 'deal4', dim: 'dealbreakers', type: S, text: 'L\'honnêteté est pour vous la condition absolue de tout lien.' },
]

export const TOTAL_QUESTIONS = QUESTIONS.length
