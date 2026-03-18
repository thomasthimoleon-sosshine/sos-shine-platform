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
      title: "Vous n\u2019avez plus\n\u00e0 traverser vos temp\u00eates\nseul(e).",
      subtitle: "L\u2019encyclop\u00e9die qui transforme vos blessures \u00e9motionnelles en force \u2014 avec des protocoles en 3 \u00e9tapes, une communaut\u00e9 bienveillante et un accompagnement 24h/24.",
      video_url: '',
      image_url: '',
      buttons: [
        { label: "Explorer l\u2019encyclop\u00e9die", href: '/encyclopedie', variant: 'outline' },
        { label: "Commencer ma transformation", href: '/rejoindre', variant: 'primary' },
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
      description: "Abandon, trahison, burn-out, deuil, peur\u2026 Chaque blessure \u00e9motionnelle poss\u00e8de sa propre page dans notre encyclop\u00e9die, avec un protocole en 3 \u00e9tapes cr\u00e9\u00e9 par des th\u00e9rapeutes pour vous accompagner de la compr\u00e9hension \u00e0 la transformation.",
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
      label: 'Le parcours SOS Shine',
      title: 'Un protocole en 3 \u00e9tapes qui transforme des vies',
      items: [
        { num: '01', title: 'Comprendre', description: "Une vid\u00e9o de coaching immersive pour enfin mettre des mots sur ce que vous ressentez. Vous comprendrez l\u2019origine de votre blocage, et ce simple \u00e9clairage commence d\u00e9j\u00e0 \u00e0 lib\u00e9rer.", color: '#55EFC4' },
        { num: '02', title: 'Lib\u00e9rer & Int\u00e9grer', description: "Une s\u00e9ance guid\u00e9e pour d\u00e9charger les tensions, nettoyer les empreintes \u00e9motionnelles et retrouver votre stabilit\u00e9 int\u00e9rieure. Le moment o\u00f9 tout bascule.", color: '#74C0FC' },
        { num: '03', title: 'Agir', description: "Des exercices concrets et un audio guid\u00e9 pour ancrer votre transformation dans le quotidien. Vous repartez avec des outils que vous utiliserez toute votre vie.", color: '#E17055' },
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
      title: "Trouvez votre challenge.\nCommencez votre transformation.",
      description: "Plus de 50 exp\u00e9riences de vie r\u00e9pertori\u00e9es de A \u00e0 Z. Chacune avec son protocole complet en 3 \u00e9tapes. Trouvez la v\u00f4tre en un clic.",
      image_url: '',
      items: ['Abus', 'Amour propre', 'Burn-out', 'Confiance en soi', 'Dépendance affective', 'Deuil', 'Rupture'],
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
      title: "Vous n\u2019\u00eates plus jamais seul(e)\n\u00e0 3h du matin.",
      description: "Un chat d\u00e9di\u00e9 pour chaque challenge \u00e9motionnel, un mur communautaire vivant, des soins collectifs et des \u00e9v\u00e9nements r\u00e9els \u2014 ici, on ne fait pas semblant. On s\u2019entraide vraiment.",
      image_url: '',
      blocks: [
        { title: 'Le Feu de Camp', description: "\u00c9changez avec des personnes qui traversent exactement la m\u00eame \u00e9preuve que vous. Pas de jugement. Pas de conseils g\u00e9n\u00e9riques. Juste des \u00eatres humains qui comprennent." },
        { title: 'Le Mur Communautaire', description: "Partagez vos avanc\u00e9es, vos victoires, vos questionnements. Chaque publication est un pas de plus vers la gu\u00e9rison collective." },
        { title: 'Les Rencontres R\u00e9elles', description: "Soins collectifs, ateliers en pr\u00e9sentiel, lives exclusifs, Shine Walks \u2014 le digital pr\u00e9pare, le physique transforme. C\u2019est l\u00e0 que la magie op\u00e8re." },
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
      label: "Ils ont transform\u00e9 leur vie",
      items: [
        { quote: "Apr\u00e8s 15 ans de d\u00e9pendance affective, j\u2019ai enfin compris le sch\u00e9ma qui me pi\u00e9geait. Le protocole m\u2019a lib\u00e9r\u00e9e en 3 semaines. Aujourd\u2019hui, je suis en couple — avec moi-m\u00eame d\u2019abord.", name: 'Marie, 34 ans', city: 'Lyon' },
        { quote: "La premi\u00e8re fois que quelqu\u2019un m\u2019a dit \u00ab je suis pass\u00e9 par l\u00e0, tiens bon \u00bb — c\u2019\u00e9tait dans le Feu de Camp \u00e0 3h du matin. J\u2019ai pleur\u00e9. C\u2019\u00e9tait la premi\u00e8re fois que je ne me sentais plus seul.", name: 'Karim, 41 ans', city: 'Bordeaux' },
        { quote: "Burn-out total. Je ne reconnaissais plus la personne dans le miroir. En 2 mois avec SOS Shine, j\u2019ai retrouv\u00e9 mon \u00e9nergie et quitt\u00e9 un job qui me d\u00e9truisait. Meilleure d\u00e9cision de ma vie.", name: 'Sophie, 28 ans', city: 'Bruxelles' },
        { quote: "Gr\u00e2ce aux 3 \u00e9tapes sur le deuil, j\u2019ai enfin pu faire la paix avec la perte de mon p\u00e8re. Aujourd\u2019hui je suis \u00c9claireur sur la plateforme et j\u2019aide d\u2019autres personnes \u00e0 traverser cette \u00e9preuve.", name: 'Antoine, 37 ans', city: 'Gen\u00e8ve' },
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
    is_visible: true,
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
      title: "Trois forces. Une mission.",
      description: "Une thérapeute holistique, un spécialiste en hypnose et médecine chinoise, un architecte de la transformation pratique. Ensemble, ils couvrent les trois dimensions de l'être : âme, corps et esprit.",
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
      title: "Investissez dans votre transformation",
      subtitle: "Sans engagement. Annulable en un clic. 7 jours gratuits pour tout essayer.",
      footer: "Parce que si on doit vous retenir par un contrat, c\u2019est qu\u2019on n\u2019a pas fait notre travail.",
      plans: [
        {
          name: 'Essentielle',
          price: '9,90',
          period: '/mois',
          button_label: "Commencer maintenant",
          button_href: '/rejoindre',
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
          button_href: '/rejoindre',
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
          button_href: '/rejoindre',
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
      title: "Votre transformation\ncommence maintenant.",
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
    is_visible: true,
    content: {
      description: "Que ce soit une blessure ancienne, une crise que vous traversez maintenant, ou simplement le besoin d'\u00eatre compris(e) \u2014 tout commence par un premier pas. Le v\u00f4tre est ici.",
      button_label: 'Commencer ma transformation',
      button_href: '/rejoindre',
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
      items: ['Abus', 'Amour propre', 'Burn-out', 'Confiance en soi', 'Dépendance affective', 'Deuil', 'Rupture'],
      speed: 35,
    },
    styles: {},
  },
  {
    section_key: 'ticker_2',
    label: 'Bandeau défilant 2',
    position: 13,
    is_visible: true,
    content: {
      items: ['Soutien 24/7', 'Communauté bienveillante', 'Protocoles exclusifs', 'Soins collectifs', 'Chat dédié', 'Événements live', 'Méditation guidée', 'Coaching immersif'],
      speed: 40,
    },
    styles: {},
  },
  {
    section_key: 'legal_mentions',
    label: 'Page — Mentions légales',
    position: 14,
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
    position: 15,
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
    position: 16,
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
    position: 17,
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
