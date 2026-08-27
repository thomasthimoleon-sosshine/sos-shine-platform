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
  { key: 'signature', label: 'Votre monde intérieur', emoji: '🫀', intro: 'Vos schémas émotionnels, l\'empreinte SOS Shine.' },
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

const RAW_QUESTIONS: Question[] = [
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

  // ══ Compléments (jusqu'à 100 questions) — triées par dimension à l'export ══

  // Intentions
  { id: 'int6', dim: 'intentions', type: S, text: 'Vous êtes prêt·e à faire évoluer vos habitudes de célibataire pour construire à deux.' },
  { id: 'int7', dim: 'intentions', type: 'choice', text: 'Votre horizon pour une relation sérieuse…', choices: [
    { label: 'Le plus tôt possible', value: 100 },
    { label: 'Dans l\'année', value: 75 },
    { label: 'Quand la bonne personne arrive', value: 50 },
    { label: 'Aucune urgence, je laisse venir', value: 30 },
  ] },
  { id: 'int8', dim: 'intentions', type: S, text: 'Vous cherchez un·e partenaire de vie, pas seulement une belle rencontre.' },
  { id: 'int9', dim: 'intentions', type: S, text: 'Vous êtes prêt·e à traverser des inconforts pour faire grandir un lien qui compte.' },

  // Spiritualité
  { id: 'spi7', dim: 'spiritualite', type: S, text: 'Vous participez à des retraites, cercles ou stages (yoga, méditation, chamanisme…).' },
  { id: 'spi8', dim: 'spiritualite', type: S, text: 'Votre développement personnel est un engagement quotidien, pas une phase.' },
  { id: 'spi9', dim: 'spiritualite', type: S, text: 'Vous ressentez une quête de sens plus grande que la simple réussite matérielle.' },
  { id: 'spi10', dim: 'spiritualite', type: S, text: 'La présence à l\'instant compte plus, pour vous, que les projections dans le futur.' },

  // Signature émotionnelle
  { id: 'sig6', dim: 'signature', type: S, text: 'Vous repérez quand vous "rejouez" un ancien schéma dans une relation.' },
  { id: 'sig7', dim: 'signature', type: S, text: 'Vous êtes à l\'aise pour demander de l\'aide ou du soutien émotionnel.' },
  { id: 'sig8', dim: 'signature', type: S, text: 'Vous savez poser des limites claires sans culpabiliser.' },
  { id: 'sig9', dim: 'signature', type: S, text: 'Vous restez présent·e quand l\'autre traverse une émotion forte.' },

  // Attachement
  { id: 'att6', dim: 'attachement', type: S, text: 'Quand un lien devient sérieux, vous restez serein·e plutôt qu\'inquiet·e.' },
  { id: 'att7', dim: 'attachement', type: S, text: 'Vous avez tendance à vous fondre dans la relation au point de vous oublier.' },
  { id: 'att8', dim: 'attachement', type: S, text: 'La solitude ne vous fait pas peur : vous savez être bien seul·e.' },
  { id: 'att9', dim: 'attachement', type: S, text: 'Vous exprimez vos besoins d\'affection sans crainte du rejet.' },

  // Valeurs
  { id: 'val7', dim: 'valeurs', type: S, text: 'L\'engagement social ou spirituel donne du sens à votre vie.' },
  { id: 'val8', dim: 'valeurs', type: S, text: 'La croissance personnelle passe avant le confort et la stabilité.' },
  { id: 'val9', dim: 'valeurs', type: S, text: 'La simplicité volontaire (moins de possessions, plus d\'essentiel) vous attire.' },

  // Communication
  { id: 'com6', dim: 'communication', type: S, text: 'Vous exprimez vos besoins clairement plutôt que d\'attendre qu\'on devine.' },
  { id: 'com7', dim: 'communication', type: S, text: 'Vous accueillez un retour sur vous-même sans vous braquer.' },
  { id: 'com8', dim: 'communication', type: S, text: 'Vous préférez régler un désaccord tout de suite plutôt que de laisser traîner.' },
  { id: 'com9', dim: 'communication', type: S, text: 'Vous savez dire non sans vous justifier à l\'excès.' },

  // Intimité (sensible)
  { id: 'itm6', dim: 'intimite', type: S, sensitive: true, text: 'Vous voyez la sexualité comme un lieu de connexion, pas seulement de plaisir.' },
  { id: 'itm7', dim: 'intimite', type: S, sensitive: true, text: 'Vous êtes ouvert·e à explorer des pratiques conscientes du corps (souffle, présence, lenteur).' },
  { id: 'itm8', dim: 'intimite', type: S, sensitive: true, text: 'La confiance et la sécurité émotionnelle précèdent l\'abandon physique, pour vous.' },
  { id: 'itm9', dim: 'intimite', type: S, sensitive: true, text: 'Parler de sexualité de façon ouverte et saine vous semble naturel.' },

  // Logistique
  { id: 'log5', dim: 'logistique', type: 'choice', text: 'Votre situation affective actuelle…', choices: [
    { label: 'Pleinement disponible', value: 100 },
    { label: 'En transition', value: 60 },
    { label: 'C\'est encore un peu compliqué', value: 25 },
  ] },
  { id: 'log6', dim: 'logistique', type: S, text: 'Vous êtes émotionnellement disponible pour une nouvelle relation, maintenant.' },
  { id: 'log7', dim: 'logistique', type: 'choice', text: 'Vous vivez plutôt…', choices: [
    { label: 'En pleine nature / campagne', value: 100 },
    { label: 'Périurbain, au calme', value: 65 },
    { label: 'En ville', value: 30 },
    { label: 'Nomade / en voyage', value: 50 },
  ] },
  { id: 'log8', dim: 'logistique', type: S, text: 'Une relation à distance au début ne vous fait pas peur si le lien est juste.' },

  // Corps & équilibre
  { id: 'crp5', dim: 'corps', type: S, text: 'Vous pratiquez une activité corporelle régulière (yoga, danse, sport, marche).' },
  { id: 'crp6', dim: 'corps', type: S, text: 'Le sommeil et le repos sont sacrés pour vous.' },
  { id: 'crp7', dim: 'corps', type: S, text: 'Vous êtes attentif·ve à ce qui vous épuise ou vous nourrit en énergie.' },
  { id: 'crp8', dim: 'corps', type: 'choice', text: 'Votre rapport aux substances (alcool, tabac…)…', choices: [
    { label: 'Rien du tout', value: 100 },
    { label: 'Occasionnel et conscient', value: 60 },
    { label: 'Assez festif', value: 25 },
  ] },

  // Personnalité
  { id: 'per6', dim: 'personnalite', type: S, text: 'Vous êtes plutôt introspectif·ve, tourné·e vers l\'intérieur.' },
  { id: 'per7', dim: 'personnalite', type: S, text: 'Vous vous adaptez facilement à l\'imprévu.' },
  { id: 'per8', dim: 'personnalite', type: S, text: 'La curiosité et l\'envie d\'apprendre vous animent.' },
  { id: 'per9', dim: 'personnalite', type: S, text: 'Vous êtes sensible à la beauté (art, nature, musique) au quotidien.' },

  // Maturité du cheminement
  { id: 'mat5', dim: 'maturite', type: S, text: 'Vous avez fait un travail thérapeutique ou de développement (thérapie, coaching, cercles).' },
  { id: 'mat6', dim: 'maturite', type: S, text: 'Vous savez reconnaître vos torts et présenter des excuses sincères.' },
  { id: 'mat7', dim: 'maturite', type: S, text: 'Vous ne cherchez pas l\'autre pour vous "compléter", mais pour partager.' },
  { id: 'mat8', dim: 'maturite', type: S, text: 'Vous êtes au clair avec vos relations passées : deuils faits, leçons intégrées.' },
  { id: 'mat9', dim: 'maturite', type: S, text: 'Vous savez précisément ce que vous ne voulez plus revivre en relation.' },

  // Non-négociables
  { id: 'deal5', dim: 'dealbreakers', type: S, text: 'La fermeture au dialogue serait un non catégorique pour vous.' },
  { id: 'deal6', dim: 'dealbreakers', type: S, text: 'Un manque de respect envers le vivant (nature, animaux) serait rédhibitoire.' },
  { id: 'deal7', dim: 'dealbreakers', type: S, text: 'Une incompatibilité sur le désir d\'enfant serait bloquante.' },
  { id: 'deal8', dim: 'dealbreakers', type: S, text: 'La jalousie ou le besoin de contrôle seraient des signaux d\'alarme absolus.' },
]

// Triées par dimension pour un parcours fluide, quel que soit l'ordre de saisie.
const DIM_ORDER = DIMENSIONS.map((d) => d.key)
export const QUESTIONS: Question[] = [...RAW_QUESTIONS].sort(
  (a, b) => DIM_ORDER.indexOf(a.dim) - DIM_ORDER.indexOf(b.dim)
)

export const TOTAL_QUESTIONS = QUESTIONS.length
