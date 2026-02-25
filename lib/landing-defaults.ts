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
      title: "L’encyclopédie des schémas\némotionnels et des\nexpériences de vie.",
      subtitle: "Un espace ouvert 24h/24, 7j/7, pour comprendre, apaiser et ne plus jamais être seul.",
      video_url: '',
      image_url: '',
      buttons: [
        { label: "Découvrir", href: '/encyclopedie', variant: 'outline' },
        { label: "Accès illimité", href: '/rejoindre', variant: 'primary' },
      ],
    },
    styles: {
      title_font: 'Cormorant Garamond',
      title_size: '2xl',
      title_align: 'left',
      title_color: '',
      text_font: 'DM Sans',
      text_align: 'left',
    },
  },
  {
    section_key: 'principe',
    label: 'Le Principe',
    position: 1,
    is_visible: true,
    content: {
      label: 'Le principe SOS Shine',
      title: "On ne change pas votre identit\u00e9.\nOn apaise le challenge \u00e9motionnel\npour lib\u00e9rer votre potentiel.",
      description: "Chaque exp\u00e9rience de vie \u2014 abandon, trahison, burn-out, deuil, peur \u2014 poss\u00e8de sa propre page dans notre encyclop\u00e9die, avec un protocole en 3 \u00e9tapes con\u00e7u pour vous accompagner de A \u00e0 Z.",
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
      title: '3 \u00e9tapes pour chaque challenge \u00e9motionnel',
      items: [
        { num: '01', title: 'Comprendre', description: "Vid\u00e9o de coaching immersive. Analyse \u00e9motionnelle. Explication de votre probl\u00e8me. Apaisement mental. Une approche humaine et directe.", color: '#55EFC4' },
        { num: '02', title: 'Lib\u00e9rer & Int\u00e9grer', description: "Vid\u00e9o de lib\u00e9ration \u00e9nerg\u00e9tique et d\u2019int\u00e9gration. Activation \u00e9motionnelle. D\u00e9charge des tensions. Nettoyage des empreintes qui vous bloquent. Stabilisation int\u00e9rieure et reconnexion \u00e0 soi.", color: '#74C0FC' },
        { num: '03', title: 'Agir', description: "PDF d\u2019exercices pratiques et audio guid\u00e9. Passez \u00e0 l\u2019action concr\u00e8te. Reprogrammation \u00e9motionnelle. Ancrez vos transformations dans le quotidien.", color: '#E17055' },
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
      title: "Chaque challenge \u00e9motionnel a sa page d\u00e9di\u00e9e",
      description: "Abus, amour propre, burn-out, confiance en soi, dépendance affective, deuil, rupture... Classées de A à Z, accessibles en un clic.",
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
      title: "Vous n\u2019\u00eates plus jamais seul \u00e0 3h du matin.",
      description: "Chat d\u00e9di\u00e9 par challenge \u00e9motionnel, chat g\u00e9n\u00e9ral, mur communautaire, soins collectifs et \u00e9v\u00e9nements \u2014 une vraie famille.",
      image_url: '',
      blocks: [
        { title: 'Le Feu de Camp', description: "Chaque challenge \u00e9motionnel a son propre chat. \u00c9changez avec ceux qui comprennent vraiment. Un espace d\u2019entraide cibl\u00e9 et bienveillant." },
        { title: 'Le Mur Communautaire', description: "Publications, annonces, partages. Restez inform\u00e9 de chaque nouvelle exp\u00e9rience de vie, chaque \u00e9v\u00e9nement, chaque avanc\u00e9e collective." },
        { title: 'Les Rencontres R\u00e9elles', description: "Soins collectifs, ateliers, lives, Shine Walks \u2014 le digital pr\u00e9pare, le physique transforme." },
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
      label: "Ils ont travers\u00e9 la temp\u00eate",
      items: [
        { quote: "Je ne savais m\u00eame pas que j\u2019avais le droit de ne pas aller bien. SOS Shine m\u2019a donn\u00e9 un espace o\u00f9 mon v\u00e9cu avait le droit d\u2019exister.", name: 'Marie, 34 ans', city: 'Lyon' },
        { quote: "La premi\u00e8re fois que quelqu\u2019un m\u2019a dit \u00ab je suis pass\u00e9 par l\u00e0, tiens bon \u00bb \u2014 c\u2019\u00e9tait dans le Feu de Camp. J\u2019ai pleur\u00e9. Des larmes de soulagement.", name: 'Karim, 41 ans', city: 'Bordeaux' },
        { quote: "J\u2019ai fait ma premi\u00e8re Shine Walk un samedi matin. En rentrant, j\u2019ai senti quelque chose que j\u2019avais oubli\u00e9 : je n\u2019\u00e9tais plus seule.", name: 'Sophie, 28 ans', city: 'Bruxelles' },
        { quote: "Gr\u00e2ce aux 3 \u00e9tapes, j\u2019ai compris mon challenge \u00e9motionnel au lieu de le fuir. Aujourd\u2019hui, je suis \u00c9claireur et j\u2019aide les autres.", name: 'Antoine, 37 ans', city: 'Gen\u00e8ve' },
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
      title: "Né d'un livre, devenu une communauté",
      paragraph1: "Tout a commencé avec un livre. Julia Laureau, thérapeute holistique, a créé \"SOS Shine — Briller Comme un Diamant\" — bien plus qu'un ouvrage de développement personnel, une véritable bible de transformation qui combine coaching vidéo, méditations guidées et séances énergétiques.",
      paragraph2: "Ce programme interactif a déjà aidé des dizaines de personnes à se libérer de leurs blocages et à accéder à leur véritable potentiel. Face à cet élan, la plateforme SOS Shine est née — la continuité naturelle du livre, transformée en une communauté vivante d'accompagnement et de reconstruction.",
      quote: "Vous avez en vous le pouvoir de tout changer, de tout transmuter, et d'évoluer vers une nouvelle version de vous-même.",
      book_url: "https://www.amazon.fr/SOS-Shine-Briller-Comme-Diamant/dp/2959566807",
      book_image: "/images/book-cover.jpeg",
      button_label: "Découvrir le livre",
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
      title: "L'équipe derrière SOS Shine",
      description: "Trois passionnés unis par une vision commune : créer un espace où chacun peut traverser ses épreuves avec dignité et bienveillance.",
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
      title: "Choisissez votre accompagnement",
      subtitle: "Sans engagement \u2014 Annulable \u00e0 tout instant",
      footer: "Parce que si on doit vous retenir par un contrat, c\u2019est qu\u2019on n\u2019a pas fait notre travail.",
      plans: [
        {
          name: 'Essentiel',
          price: '29,90',
          period: '/mois',
          button_label: 'Commencer — 7 jours gratuits',
          button_href: '/rejoindre',
          highlight: true,
          badge: '',
          features: [
            'Encyclopédie complète des expériences de vie',
            '3 étapes par challenge émotionnel (vidéo, libération, action)',
            'Chat dédié par challenge émotionnel + Chat général',
            'Mur communautaire',
            'Soins collectifs & événements',
            'Essai gratuit 7 jours',
          ],
        },
        {
          name: 'Premium',
          price: '99,90',
          period: '/mois',
          button_label: 'Commencer maintenant',
          button_href: 'https://buy.stripe.com/28EeV5gGoeVBffz70u5ZC0d',
          highlight: false,
          badge: 'VIP',
          features: [
            "Tout l'Essentiel inclus",
            'Permanences experts 24/7',
            'Accompagnement prioritaire',
            'Support direct Julia, William & Thomas',
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
      title: "Rejoignez-nous.\nNe soyez plus jamais seul(e) face \u00e0 vos temp\u00eates.",
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
      description: "Que vous cherchiez un challenge émotionnel ancien, une crise, ou simplement un espace où être compris(e) — SOS Shine est là, 24h/24, 7j/7. Vous n’avez pas à tout porter seul(e). On est là pour comprendre, accompagner et avancer ensemble.",
      button_label: 'Rejoindre SOS Shine',
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
      email: 'contact@sosshine.fr',
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
