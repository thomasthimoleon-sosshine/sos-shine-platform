/* ─────────────────────────────────────────────
   Landing Page — Section defaults & types
   Source unique de vérité pour le contenu initial
───────────────────────────────────────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SectionContent = Record<string, any>
export type SectionStyles = Record<string, string>

export interface LandingSectionRow {
  id: string
  section_key: string
  label: string
  position: number
  is_visible: boolean
  content: SectionContent
  styles: SectionStyles
  updated_by: string | null
  updated_at: string
}

export interface LandingSectionDefault {
  section_key: string
  label: string
  position: number
  is_visible: boolean
  content: SectionContent
  styles: SectionStyles
}

export const LANDING_DEFAULTS: LandingSectionDefault[] = [
  {
    section_key: '_global',
    label: 'Configuration globale',
    position: -1,
    is_visible: true,
    content: {
      site_name: 'SOS Shine',
      logo_url: '',
      trial_days: 7,
    },
    styles: {
      color_primary: '#D4AF37',
      color_secondary: '#74C0FC',
      color_bg: '#362038',
      color_card: '#442B40',
      color_border: '#5E3E52',
      color_text: '#F5EDF0',
      color_text_secondary: '#C8A8B8',
      color_text_muted: '#8E6E7E',
      color_button: '#D4AF37',
      font_display: 'Cormorant Garamond',
      font_body: 'DM Sans',
    },
  },
  {
    section_key: 'hero',
    label: 'Hero (en-tête)',
    position: 0,
    is_visible: true,
    content: {
      title: "Ce que vous ressentez\nn\u2019est pas le probl\u00e8me.\nC\u2019est la sortie.",
      subtitle: "Un protocole th\u00e9rapeutique en 3 \u00e9tapes pour chaque blessure \u00e9motionnelle. Cr\u00e9\u00e9 par des th\u00e9rapeutes. Accessible \u00e0 tout moment. Vous n\u2019\u00eates plus seul(e).",
      video_url: '',
      image_url: '',
      buttons: [
        { label: "D\u00e9couvrir les protocoles", href: '/encyclopedie', variant: 'outline' },
        { label: "Cr\u00e9er mon compte gratuitement", href: '/signup', variant: 'primary' },
      ],
    },
    styles: {
      title_font: 'Cormorant Garamond',
      title_size: '2xl',
      title_align: 'center',
      title_color: '',
      text_font: 'DM Sans',
      text_align: 'center',
    },
  },
  {
    section_key: 'principe',
    label: 'Le Principe',
    position: 1,
    is_visible: true,
    content: {
      label: 'Le principe SOS Shine',
      title: "On ne change pas qui vous \u00eates.\nOn lib\u00e8re qui vous \u00e9tiez\navant les blessures.",
      description: "Abandon, trahison, burn-out, deuil, rupture\u2026 Chaque blessure a une origine, un m\u00e9canisme et une cl\u00e9 de lib\u00e9ration. Nos th\u00e9rapeutes ont cr\u00e9\u00e9 un protocole pr\u00e9cis en 3 \u00e9tapes pour chacune. Comprendre. Lib\u00e9rer. Agir.",
      image_url: '',
      video_url: '',
    },
    styles: {
      title_font: 'Cormorant Garamond',
      title_size: 'xl',
      title_align: 'center',
      title_color: '',
      text_font: 'DM Sans',
      text_align: 'center',
    },
  },
  {
    section_key: 'steps',
    label: 'Les \u00c9tapes',
    position: 2,
    is_visible: true,
    content: {
      label: 'Comment \u00e7a marche',
      title: '3 \u00e9tapes. Un protocole. Votre lib\u00e9ration.',
      items: [
        { num: '01', title: 'Comprendre', description: "Une vid\u00e9o cr\u00e9\u00e9e par nos th\u00e9rapeutes pour mettre des mots sur ce que vous vivez. Vous identifiez l\u2019origine du blocage. Ce simple \u00e9clairage change d\u00e9j\u00e0 tout.", color: '#55EFC4' },
        { num: '02', title: 'Lib\u00e9rer', description: "S\u00e9ance guid\u00e9e d\u2019hypnose, de m\u00e9ditation ou de soin \u00e9nerg\u00e9tique pour d\u00e9charger ce qui est ancr\u00e9 dans le corps. Le moment o\u00f9 l\u2019\u00e9motion se dissout.", color: '#74C0FC' },
        { num: '03', title: 'Ancrer', description: "Exercices pratiques et audio guid\u00e9 pour transformer la prise de conscience en habitude de vie. Vous repartez transform\u00e9(e), pas juste inform\u00e9(e).", color: '#E17055' },
      ],
    },
    styles: {
      title_font: 'Cormorant Garamond',
      title_size: 'lg',
      title_align: 'center',
      text_font: 'DM Sans',
    },
  },
  {
    section_key: 'encyclopedie',
    label: "L\u2019Encyclop\u00e9die",
    position: 3,
    is_visible: true,
    content: {
      label: "L\u2019encyclop\u00e9die",
      title: "Trouvez ce que vous traversez.\nOn s\u2019occupe du reste.",
      description: "Chaque blessure \u00e9motionnelle a son protocole d\u00e9di\u00e9, cr\u00e9\u00e9 par nos th\u00e9rapeutes. Vid\u00e9o, s\u00e9ance guid\u00e9e, exercices concrets \u2014 tout est l\u00e0.",
      image_url: '',
      items: ['Abandon', 'Anxi\u00e9t\u00e9', 'Burn-out', 'Confiance en soi', 'D\u00e9pendance affective', 'D\u00e9pression', 'Deuil', 'Intuition', 'Mission de vie', 'Pardon', 'R\u00e9silience', 'Relations toxiques', 'Stress', 'Trauma', 'Violence'],
      show_max: 15,
    },
    styles: {
      title_font: 'Cormorant Garamond',
      title_size: 'lg',
      title_align: 'center',
      text_align: 'center',
    },
  },
  {
    section_key: 'communaute',
    label: 'Communaut\u00e9',
    position: 4,
    is_visible: true,
    content: {
      title: "3h du matin.\nVous n\u2019\u00eates plus seul(e).",
      description: "Une communaut\u00e9 de personnes qui comprennent ce que vous vivez \u2014 parce qu\u2019elles le vivent aussi. Pas de jugement. Pas de platitudes. Du vrai.",
      image_url: '',
      blocks: [
        { title: 'Le Feu de Camp', description: "Un chat d\u00e9di\u00e9 \u00e0 chaque blessure \u00e9motionnelle. Vous \u00e9changez avec des personnes qui traversent la m\u00eame \u00e9preuve. Quelqu\u2019un r\u00e9pond toujours, m\u00eame \u00e0 3h du matin." },
        { title: 'Le Mur Communautaire', description: "Partagez vos avanc\u00e9es, vos prises de conscience, vos victoires. Chaque t\u00e9moignage inspire quelqu\u2019un d\u2019autre \u00e0 avancer." },
        { title: 'Les Rencontres', description: "Soins collectifs en live, ateliers en pr\u00e9sentiel, Shine Walks. Le digital pr\u00e9pare, le r\u00e9el transforme." },
      ],
    },
    styles: {
      title_font: 'Cormorant Garamond',
      title_size: 'xl',
      title_align: 'center',
      text_align: 'center',
    },
  },
  {
    section_key: 'temoignages',
    label: 'T\u00e9moignages',
    position: 5,
    is_visible: true,
    content: {
      label: "Ce qu\u2019ils en disent",
      items: [
        { quote: "15 ans de d\u00e9pendance affective. J\u2019ai compris le sch\u00e9ma d\u00e8s la premi\u00e8re vid\u00e9o. Le protocole m\u2019a lib\u00e9r\u00e9e en 3 semaines.", name: 'Marie, 34 ans', city: 'Lyon' },
        { quote: "3h du matin, seul, au fond du trou. J\u2019ai ouvert le Feu de Camp. Quelqu\u2019un m\u2019a dit \u00ab tiens bon, je suis pass\u00e9 par l\u00e0 \u00bb. Cette nuit-l\u00e0 a tout chang\u00e9.", name: 'Karim, 41 ans', city: 'Bordeaux' },
        { quote: "Burn-out total. En 2 mois, j\u2019ai retrouv\u00e9 mon \u00e9nergie et quitt\u00e9 le job qui me d\u00e9truisait. SOS Shine m\u2019a redonn\u00e9 l\u2019\u00e9lan que j\u2019avais perdu.", name: 'Sophie, 28 ans', city: 'Bruxelles' },
        { quote: "Le protocole sur le deuil m\u2019a permis de faire la paix avec la perte de mon p\u00e8re. Aujourd\u2019hui j\u2019aide d\u2019autres personnes \u00e0 traverser \u00e7a.", name: 'Antoine, 37 ans', city: 'Gen\u00e8ve' },
      ],
    },
    styles: {
      title_font: 'DM Sans',
      title_align: 'center',
    },
  },
  {
    section_key: 'histoire',
    label: "L'Histoire / Le Livre",
    position: 6,
    is_visible: false,
    content: {
      label: "L'Histoire",
      title: "N\u00e9 d\u2019un livre.\nDevenu un mouvement.",
      paragraph1: "Tout a commencé avec un livre. Julia Laureau, thérapeute holistique, a créé \"SOS Shine — Briller Comme un Diamant\" — bien plus qu'un ouvrage de développement personnel, une véritable bible de transformation qui combine coaching vidéo, méditations guidées et séances énergétiques.",
      paragraph2: "Ce programme interactif a déjà aidé des dizaines de personnes à se libérer de leurs blocages et à accéder à leur véritable potentiel. Face à cet élan, la plateforme SOS Shine est née — la continuité naturelle du livre, transformée en une communauté vivante d'accompagnement et de reconstruction.",
      quote: "Vous avez en vous le pouvoir de tout changer, de tout transmuter, et d'évoluer vers une nouvelle version de vous-même.",
      book_url: "https://www.amazon.fr/SOS-Shine-Briller-Comme-Diamant/dp/2959566807",
      book_image: "/images/book-cover.jpeg",
      button_label: "Découvrir le livre",
      // Trinité / Fondateurs (page Notre Histoire)
      trinite_title: "Trois forces. Une seule mission.",
      trinite_intro: "Tout a commencé par un livre. Julia, portée par une conviction profonde, a écrit pour libérer ceux qui se sentaient prisonniers d'eux-mêmes. Puis William et Thomas l'ont rejointe. Trois visions. Trois piliers. Une trinité indissociable pour déconditionner l'être humain dans sa totalité.",
      julia_pilier: "Le Pilier Énergétique",
      julia_desc: "Auteure du livre fondateur de SOS Shine, Julia canalise l'énergie invisible qui nous traverse. Sa vision : reconnecter chaque individu à sa vibration authentique, celle qu'il a oubliée sous des couches de conditionnements.",
      william_pilier: "Le Pilier Corporel",
      william_desc: "Spécialiste en hypnose et diplômé en médecine chinoise internationale, William apporte les solutions physiques concrètes pour déconstruire les croyances et les blocages ancrés dans le corps. Sa maîtrise du lien corps-esprit permet de libérer ce que les mots seuls ne peuvent atteindre.",
      thomas_pilier: "Le Pilier Pratique",
      thomas_desc: "Thomas intervient sur le côté pratique et concret du déconditionnement. À travers des cahiers d'exercices et des protocoles d'action, il transforme la prise de conscience en résultats tangibles. Son approche : vous donner les outils pour devenir l'architecte de votre propre transformation.",
      trinite_tagline: "Âme · Corps · Esprit",
      trinite_conclusion: "Trois triangles à côtés égaux. Trois dimensions de l'être. Un seul objectif : vous aider à devenir la personne que vous auriez toujours dû être. Le déconditionnement total commence ici.",
      manifeste: "Nous ne guérissons pas. Nous révélons. Ce que vous cherchez est déjà en vous — enfoui sous des années de conditionnements. Notre mission est de vous aider à le retrouver.",
    },
    styles: {
      title_font: 'Cormorant Garamond',
      title_size: 'lg',
      title_align: 'center',
    },
  },
  {
    section_key: 'fondateurs',
    label: 'Les Fondateurs',
    position: 7,
    is_visible: true,
    content: {
      label: 'Les Fondateurs',
      title: "Trois forces.\nUne seule mission.",
      description: "Julia, th\u00e9rapeute holistique. William, sp\u00e9cialiste en hypnose et m\u00e9decine chinoise. Thomas, architecte de la transformation. Ensemble, ils couvrent les trois dimensions de l\u2019\u00eatre : \u00e2me, corps et esprit.",
      members: [
        { name: 'Julia', role: 'Fondatrice', image: '/images/julia.jpeg' },
        { name: 'Wiliam', role: 'Co-fondateur', image: '/images/wiliam.png' },
        { name: 'Thomas', role: 'Co-fondateur', image: '/images/thomas.jpeg' },
      ],
    },
    styles: {
      title_font: 'Cormorant Garamond',
      title_size: 'lg',
      title_align: 'center',
    },
  },
  {
    section_key: 'pricing',
    label: 'Tarification',
    position: 8,
    is_visible: true,
    content: {
      title: "Choisissez votre rythme",
      subtitle: "7 jours gratuits. Sans engagement. Annulation en un clic.",
      footer: "Si on doit vous retenir par un contrat, c\u2019est qu\u2019on n\u2019a pas fait notre travail.",
      plans: [
        {
          name: 'Essentielle',
          price: '9,90',
          period: '/mois',
          button_label: "Commencer maintenant",
          button_href: '/signup',
          highlight: false,
          badge: '',
          features: [
            'Acc\u00e8s illimit\u00e9 \u00e0 toute l\u2019encyclop\u00e9die',
            'Protocoles complets en 3 \u00e9tapes',
            'Chats communautaires 24h/24',
            'Acc\u00e8s imm\u00e9diat d\u00e8s l\u2019inscription',
          ],
        },
        {
          name: 'S\u00e9r\u00e9nit\u00e9',
          price: '49,90',
          period: '/mois',
          button_label: 'Essayer gratuitement — 7 jours',
          button_href: '/signup',
          highlight: true,
          badge: 'Le plus choisi',
          features: [
            "Tout le contenu de l\u2019Essentielle",
            'Soin collectif mensuel en direct',
            'Acc\u00e8s prioritaire aux nouveaut\u00e9s',
            '7 jours d\u2019essai gratuit — 0\u20ac',
          ],
        },
        {
          name: 'Premium',
          price: '99,90',
          period: '/mois',
          button_label: 'Essayer gratuitement — 7 jours',
          button_href: '/signup',
          highlight: false,
          badge: 'Exp\u00e9rience compl\u00e8te',
          features: [
            "Tout le contenu de la S\u00e9r\u00e9nit\u00e9",
            'Live th\u00e9matique chaque semaine',
            'Canal priv\u00e9 Telegram avec les fondateurs',
            'Acc\u00e8s \u00e0 tous les \u00e9v\u00e9nements physiques',
            '7 jours d\u2019essai gratuit — 0\u20ac',
          ],
        },
      ],
    },
    styles: {
      title_font: 'Cormorant Garamond',
      title_size: 'lg',
      title_align: 'center',
    },
  },
  {
    section_key: 'cta_dark',
    label: 'CTA (fond sombre)',
    position: 9,
    is_visible: true,
    content: {
      title: "Le premier pas\nest toujours le plus dur.\nOn le fait ensemble.",
      image_url: '',
    },
    styles: {
      title_font: 'Cormorant Garamond',
      title_size: 'xl',
      title_align: 'center',
    },
  },
  {
    section_key: 'cta_light',
    label: 'CTA (fond clair)',
    position: 10,
    is_visible: false,
    content: {
      description: "Blessure ancienne ou crise en cours \u2014 on a cr\u00e9\u00e9 un protocole pour ce que vous vivez. Il vous attend.",
      button_label: 'Commencer gratuitement',
      button_href: '/signup',
      login_text: "Déjà membre ? Se connecter",
    },
    styles: {
      bg: '#ffffff',
      text_color: '#1a1a1a',
      muted_color: '#6b7280',
    },
  },
  {
    section_key: 'footer',
    label: 'Pied de page',
    position: 11,
    is_visible: true,
    content: {
      name: 'SOS Shine',
      copyright_year: '2026',
      links: [
        { label: 'Notre Histoire', href: '/notre-histoire' },
        { label: 'Blog', href: '/blog' },
        { label: 'Mentions l\u00e9gales', href: '/mentions-legales' },
        { label: 'CGV', href: '/cgv' },
        { label: 'Confidentialit\u00e9', href: '/confidentialite' },
        { label: 'Contact', href: '/contact' },
      ],
    },
    styles: {},
  },
  {
    section_key: 'ticker_1',
    label: 'Bandeau défilant 1',
    position: 12,
    is_visible: true,
    content: {
      items: ['Abandon', 'Anxiété', 'Burn-out', 'Confiance en soi', 'Dépendance', 'Deuil', 'Trauma', 'Résilience', 'Pardon'],
      speed: 35,
    },
    styles: {},
  },
  {
    section_key: 'ticker_2',
    label: 'Bandeau défilant 2',
    position: 13,
    is_visible: false,
    content: {
      items: ['Soutien 24/7', 'Communauté bienveillante', 'Protocoles exclusifs', 'Soins collectifs', 'Chat dédié', 'Événements live', 'Méditation guidée', 'Coaching immersif'],
      speed: 40,
    },
    styles: {},
  },
  {
    section_key: 'faq',
    label: 'FAQ',
    position: 14,
    is_visible: true,
    content: {
      label: 'FAQ',
      title: 'Vos questions, nos réponses',
      subtitle: "Une question qui n'est pas ici ? Écrivez-nous, on répond toujours.",
      cta_text: 'Encore des doutes ?',
      cta_button_label: 'Contactez-nous',
      cta_button_href: '/contact',
      items: [
        {
          q: "Est-ce que SOS Shine remplace un thérapeute ?",
          a: "Non. SOS Shine est un complément, pas un substitut. Nos protocoles sont créés par nos trois fondateurs, chacun expert dans son domaine, mais nous recommandons de consulter un professionnel de santé si nécessaire.",
        },
        {
          q: "Comment fonctionne l'essai gratuit ?",
          a: "Vous accédez à tout le contenu de votre formule pendant 7 jours. Si ça ne vous convient pas, annulez en un clic — zéro prélèvement, zéro question.",
        },
        {
          q: "C'est quoi exactement un protocole en 3 étapes ?",
          a: "Pour chaque blessure émotionnelle, nos fondateurs ont créé : une vidéo pour comprendre l'origine du blocage, une séance guidée pour libérer l'émotion, et des exercices concrets pour ancrer la transformation. Vous avancez à votre rythme.",
        },
        {
          q: "Mes données sont-elles protégées ?",
          a: "Vos données ne sont jamais vendues ni partagées. Vous pouvez utiliser un pseudo dans la communauté. Tout est chiffré et confidentiel.",
        },
        {
          q: "Qui crée les contenus ?",
          a: "Julia (thérapeute holistique), William (hypnose et médecine chinoise) et Thomas (protocoles pratiques). Chaque protocole combine leurs trois expertises : âme, corps et esprit.",
        },
        {
          q: "Je peux annuler quand je veux ?",
          a: "Oui. Aucun engagement, aucune condition cachée. Annulation en un clic depuis votre espace membre. Si on doit vous retenir par un contrat, c'est qu'on n'a pas fait notre travail.",
        },
      ],
    },
    styles: {
      title_font: 'Cormorant Garamond',
      title_size: 'lg',
      title_align: 'center',
    },
  },
  {
    section_key: 'legal_mentions',
    label: 'Page — Mentions légales',
    position: 15,
    is_visible: true,
    content: {
      title: 'Mentions légales',
      html_content: '',
    },
    styles: {},
  },
  {
    section_key: 'legal_cgv',
    label: 'Page — CGV',
    position: 16,
    is_visible: true,
    content: {
      title: 'Conditions Générales de Vente',
      html_content: '',
    },
    styles: {},
  },
  {
    section_key: 'legal_privacy',
    label: 'Page — Confidentialité',
    position: 17,
    is_visible: true,
    content: {
      title: 'Politique de confidentialité',
      html_content: '',
    },
    styles: {},
  },
  {
    section_key: 'legal_contact',
    label: 'Page — Contact',
    position: 18,
    is_visible: true,
    content: {
      title: 'Contact',
      email: 'julialaureau@sosshine.com',
      phone: '',
      address: '',
      html_content: '',
    },
    styles: {},
  },
]

/** Get default for a specific section_key */
export function getDefaultSection(key: string): LandingSectionDefault | undefined {
  return LANDING_DEFAULTS.find((s) => s.section_key === key)
}

/** Build a map from an array of sections (DB rows or defaults) */
export function buildSectionMap<T extends { section_key: string }>(
  sections: T[]
): Record<string, T> {
  const map: Record<string, T> = {}
  for (const s of sections) map[s.section_key] = s
  return map
}
