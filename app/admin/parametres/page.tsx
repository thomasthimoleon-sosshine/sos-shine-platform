'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import FileUpload from '@/components/FileUpload'

interface SelectOption { label: string; value: string }

interface FieldDef {
  label: string
  key: string
  type: 'text' | 'color' | 'textarea' | 'upload' | 'select' | 'separator'
  accept?: string
  folder?: string
  hint?: string
  options?: SelectOption[]
  default: string
}

interface SectionDef { title: string; icon: string; fields: FieldDef[] }

// ── Options partagées ──
const fontOpts: SelectOption[] = [
  { label: 'Cormorant Garamond (Élégant)', value: 'Cormorant Garamond' },
  { label: 'DM Sans (Moderne)', value: 'DM Sans' },
  { label: 'Georgia (Classique)', value: 'Georgia' },
  { label: 'Arial (Simple)', value: 'Arial' },
  { label: 'Times New Roman', value: 'Times New Roman' },
]
const alignOpts: SelectOption[] = [
  { label: 'Gauche', value: 'left' },
  { label: 'Centre', value: 'center' },
  { label: 'Droite', value: 'right' },
]
const sizeOpts: SelectOption[] = [
  { label: 'Petit (30px)', value: 'sm' },
  { label: 'Moyen (36px)', value: 'md' },
  { label: 'Grand (48px)', value: 'lg' },
  { label: 'Très grand (60px)', value: 'xl' },
  { label: 'Immense (72px)', value: '2xl' },
]

function sep(label: string): FieldDef {
  return { label, key: '', type: 'separator', default: '' }
}

const sections: SectionDef[] = [
  {
    title: 'Apparence générale', icon: '🎨',
    fields: [
      { label: 'Couleur principale (or)', key: 'color_primary', type: 'color', default: '#C9A961' },
      { label: 'Couleur secondaire (bleu)', key: 'color_secondary', type: 'color', default: '#74C0FC' },
      { label: 'Couleur de fond', key: 'color_bg', type: 'color', default: '#362038' },
      { label: 'Couleur des cartes', key: 'color_card', type: 'color', default: '#442B40' },
      { label: 'Couleur des bordures', key: 'color_border', type: 'color', default: '#5E3E52' },
      { label: 'Couleur du texte principal', key: 'color_text', type: 'color', default: '#F5EDF0' },
      { label: 'Couleur du texte secondaire', key: 'color_text_secondary', type: 'color', default: '#C8A8B8' },
      { label: 'Couleur du texte discret', key: 'color_text_muted', type: 'color', default: '#8E6E7E' },
      { label: 'Couleur des boutons', key: 'color_button', type: 'color', default: '#C9A961' },
      { label: 'Logo du site', key: 'logo_url', type: 'upload', accept: 'image/*', folder: 'site', hint: 'PNG ou SVG, 512x512px', default: '' },
      { label: 'Image de fond hero', key: 'hero_bg_url', type: 'upload', accept: 'image/*', folder: 'site', hint: '1920x1080px', default: '' },
    ],
  },
  {
    title: 'Section Hero', icon: '✏️',
    fields: [
      { label: 'Titre principal', key: 'hero_title', type: 'textarea', default: "L'encyclopédie des schémas émotionnels et des expériences de vie." },
      { label: 'Sous-titre', key: 'hero_subtitle', type: 'textarea', default: 'Un espace ouvert 24h/24, 7j/7, pour comprendre, apaiser et ne plus jamais être seul.' },
      { label: 'Vidéo d\'introduction', key: 'intro_video_url', type: 'upload', accept: 'video/*', folder: 'site', hint: 'MP4 recommandé', default: '' },
      { label: 'Texte bouton encyclopédie', key: 'hero_btn_encyclopedie', type: 'text', default: "Découvrir l'encyclopédie" },
      { label: 'Texte bouton inscription', key: 'hero_btn_signup', type: 'text', default: "Accès illimité" },
      sep('Style & mise en page'),
      { label: 'Police du titre', key: 'hero_title_font', type: 'select', options: fontOpts, default: 'Cormorant Garamond' },
      { label: 'Taille du titre', key: 'hero_title_size', type: 'select', options: sizeOpts, default: '2xl' },
      { label: 'Alignement du titre', key: 'hero_title_align', type: 'select', options: alignOpts, default: 'left' },
      { label: 'Couleur du titre', key: 'hero_title_color', type: 'color', default: '' },
      { label: 'Police du sous-titre', key: 'hero_text_font', type: 'select', options: fontOpts, default: 'DM Sans' },
      { label: 'Alignement du sous-titre', key: 'hero_text_align', type: 'select', options: alignOpts, default: 'left' },
      sep('Médias additionnels'),
      { label: 'Image décorative (hero)', key: 'hero_section_image', type: 'upload', accept: 'image/*', folder: 'site', default: '' },
    ],
  },
  {
    title: 'Section - Le Principe', icon: '💡',
    fields: [
      { label: 'Sous-titre de section', key: 'principe_label', type: 'text', default: 'Le principe SOS Shine' },
      { label: 'Titre', key: 'principe_title', type: 'textarea', default: "On ne change pas votre identité. On apaise le challenge émotionnel pour libérer votre potentiel." },
      { label: 'Description', key: 'principe_desc', type: 'textarea', default: "Chaque expérience de vie - abandon, trahison, burn-out, deuil, peur - possède sa propre page dans notre encyclopédie, avec un protocole en 3 étapes conçu pour vous accompagner de A à Z." },
      sep('Style & mise en page'),
      { label: 'Police du titre', key: 'principe_title_font', type: 'select', options: fontOpts, default: 'Cormorant Garamond' },
      { label: 'Taille du titre', key: 'principe_title_size', type: 'select', options: sizeOpts, default: 'xl' },
      { label: 'Alignement du titre', key: 'principe_title_align', type: 'select', options: alignOpts, default: 'center' },
      { label: 'Couleur du titre', key: 'principe_title_color', type: 'color', default: '' },
      { label: 'Police du texte', key: 'principe_text_font', type: 'select', options: fontOpts, default: 'DM Sans' },
      { label: 'Alignement du texte', key: 'principe_text_align', type: 'select', options: alignOpts, default: 'center' },
      sep('Médias'),
      { label: 'Image de section', key: 'principe_section_image', type: 'upload', accept: 'image/*', folder: 'site', default: '' },
      { label: 'Vidéo de section', key: 'principe_section_video', type: 'upload', accept: 'video/*', folder: 'site', default: '' },
    ],
  },
  {
    title: 'Section - Les 3 Étapes', icon: '🔢',
    fields: [
      { label: 'Sous-titre de section', key: 'steps_label', type: 'text', default: 'Le parcours SOS Shine' },
      { label: 'Titre de section', key: 'steps_title', type: 'text', default: '3 étapes pour chaque challenge émotionnel' },
      { label: 'Étape 1 - Titre', key: 'step1_title', type: 'text', default: 'Comprendre' },
      { label: 'Étape 1 - Description', key: 'step1_desc', type: 'textarea', default: "Vidéo de coaching immersive. Analyse émotionnelle. Explication de votre problème." },
      { label: 'Étape 2 - Titre', key: 'step2_title', type: 'text', default: 'Libération Énergétique' },
      { label: 'Étape 2 - Description', key: 'step2_desc', type: 'textarea', default: "Soin énergétique. Activation émotionnelle. Décharge des tensions." },
      { label: 'Étape 3 - Titre', key: 'step3_title', type: 'text', default: 'Intégration & Méditation' },
      { label: 'Étape 3 - Description', key: 'step3_desc', type: 'textarea', default: "Méditation guidée. Stabilisation intérieure. Reconnexion à soi." },
      sep('Style'),
      { label: 'Police du titre', key: 'steps_title_font', type: 'select', options: fontOpts, default: 'Cormorant Garamond' },
      { label: 'Taille du titre', key: 'steps_title_size', type: 'select', options: sizeOpts, default: 'lg' },
      { label: 'Alignement du titre', key: 'steps_title_align', type: 'select', options: alignOpts, default: 'center' },
      { label: 'Police du texte', key: 'steps_text_font', type: 'select', options: fontOpts, default: 'DM Sans' },
    ],
  },
  {
    title: 'Section - Encyclopédie', icon: '📘',
    fields: [
      { label: 'Titre de section', key: 'encyclo_title', type: 'text', default: 'Chaque challenge émotionnel a sa page dédiée' },
      { label: 'Description', key: 'encyclo_desc', type: 'textarea', default: "Abandon, trahison, burn-out, deuil, dépendance affective, peur, solitude, rejet... Classés de A à Z." },
      { label: 'Challenges affichés (un par ligne)', key: 'encyclo_items', type: 'textarea', default: "Abandon\nAnxiété\nBurn-out\nDépendance affective\nDeuil\nManque de confiance\nPeur\nRejet\nRupture\nSolitude\nTrahison\nEt plus..." },
      sep('Style'),
      { label: 'Police du titre', key: 'encyclo_title_font', type: 'select', options: fontOpts, default: 'Cormorant Garamond' },
      { label: 'Taille du titre', key: 'encyclo_title_size', type: 'select', options: sizeOpts, default: 'lg' },
      { label: 'Alignement du titre', key: 'encyclo_title_align', type: 'select', options: alignOpts, default: 'center' },
      { label: 'Alignement du texte', key: 'encyclo_text_align', type: 'select', options: alignOpts, default: 'center' },
      sep('Médias'),
      { label: 'Image de section', key: 'encyclo_section_image', type: 'upload', accept: 'image/*', folder: 'site', default: '' },
    ],
  },
  {
    title: 'Section - Communauté', icon: '🤝',
    fields: [
      { label: 'Titre de section', key: 'community_title', type: 'textarea', default: "Vous n'êtes plus jamais seul à 3h du matin." },
      { label: 'Description', key: 'community_desc', type: 'textarea', default: "Chat dédié par challenge émotionnel, chat général, mur communautaire, soins collectifs et événements - une vraie famille." },
      { label: 'Bloc 1 - Titre', key: 'community_block1_title', type: 'text', default: 'Le Feu de Camp' },
      { label: 'Bloc 1 - Description', key: 'community_block1_desc', type: 'textarea', default: "Chaque challenge émotionnel a son propre chat. Échangez avec ceux qui comprennent vraiment." },
      { label: 'Bloc 2 - Titre', key: 'community_block2_title', type: 'text', default: 'Le Mur Communautaire' },
      { label: 'Bloc 2 - Description', key: 'community_block2_desc', type: 'textarea', default: "Publications, annonces, partages. Restez informé de chaque avancée collective." },
      { label: 'Bloc 3 - Titre', key: 'community_block3_title', type: 'text', default: 'Les Rencontres Réelles' },
      { label: 'Bloc 3 - Description', key: 'community_block3_desc', type: 'textarea', default: "Soins collectifs, ateliers, lives, Shine Walks - le digital prépare, le physique transforme." },
      sep('Style'),
      { label: 'Police du titre', key: 'community_title_font', type: 'select', options: fontOpts, default: 'Cormorant Garamond' },
      { label: 'Taille du titre', key: 'community_title_size', type: 'select', options: sizeOpts, default: 'xl' },
      { label: 'Alignement du titre', key: 'community_title_align', type: 'select', options: alignOpts, default: 'center' },
      { label: 'Alignement du texte', key: 'community_text_align', type: 'select', options: alignOpts, default: 'center' },
      sep('Médias'),
      { label: 'Image de section', key: 'community_section_image', type: 'upload', accept: 'image/*', folder: 'site', default: '' },
    ],
  },
  {
    title: 'Témoignages', icon: '💬',
    fields: [
      { label: 'Sous-titre de section', key: 'testimonials_label', type: 'text', default: 'Ils ont traversé la tempête' },
      { label: 'Témoignage 1 (texte | prénom | ville)', key: 'testimonial_1', type: 'textarea', default: "Je ne savais même pas que j'avais le droit de ne pas aller bien.|Marie, 34 ans|Lyon" },
      { label: 'Témoignage 2', key: 'testimonial_2', type: 'textarea', default: "La première fois que quelqu'un m'a dit tiens bon - c'était dans le Feu de Camp.|Karim, 41 ans|Bordeaux" },
      { label: 'Témoignage 3', key: 'testimonial_3', type: 'textarea', default: "J'ai fait ma première Shine Walk. Je n'étais plus seule.|Sophie, 28 ans|Bruxelles" },
      { label: 'Témoignage 4', key: 'testimonial_4', type: 'textarea', default: "Grâce aux 4 étapes, j'ai compris mon challenge émotionnel au lieu de le fuir.|Antoine, 37 ans|Genève" },
      sep('Style'),
      { label: 'Police', key: 'testimonials_title_font', type: 'select', options: fontOpts, default: 'DM Sans' },
      { label: 'Alignement', key: 'testimonials_title_align', type: 'select', options: alignOpts, default: 'center' },
    ],
  },
  {
    title: 'Tarification', icon: '💰',
    fields: [
      { label: 'Titre de section', key: 'pricing_section_title', type: 'text', default: 'Choisissez votre accompagnement' },
      { label: 'Sous-titre', key: 'pricing_section_subtitle', type: 'text', default: 'Sans engagement - Annulable à tout instant' },
      { label: 'Prix SOS Shine (EUR/mois)', key: 'price_serenite_display', type: 'text', default: '49.90' },
      
      { label: 'Jours d\'essai gratuit (Sérénité)', key: 'trial_days', type: 'text', default: '7' },
      
      
      { label: 'Texte sous les offres', key: 'pricing_footer', type: 'text', default: "Parce que si on doit vous retenir par un contrat, c'est qu'on n'a pas fait notre travail." },
      sep('Style'),
      { label: 'Police du titre', key: 'pricing_title_font', type: 'select', options: fontOpts, default: 'Cormorant Garamond' },
      { label: 'Taille du titre', key: 'pricing_title_size', type: 'select', options: sizeOpts, default: 'lg' },
      { label: 'Alignement', key: 'pricing_title_align', type: 'select', options: alignOpts, default: 'center' },
    ],
  },
  {
    title: 'Section - CTA Final', icon: '🎯',
    fields: [
      { label: 'Titre CTA', key: 'cta_title', type: 'textarea', default: "Comprenez. Apaisez. Ne soyez plus jamais seul." },
      { label: 'Texte du bouton', key: 'cta_button', type: 'text', default: 'Rejoindre SOS Shine' },
      sep('Style'),
      { label: 'Police du titre', key: 'cta_title_font', type: 'select', options: fontOpts, default: 'Cormorant Garamond' },
      { label: 'Taille du titre', key: 'cta_title_size', type: 'select', options: sizeOpts, default: 'xl' },
      { label: 'Alignement', key: 'cta_title_align', type: 'select', options: alignOpts, default: 'center' },
      sep('Médias'),
      { label: 'Image de fond CTA', key: 'cta_section_image', type: 'upload', accept: 'image/*', folder: 'site', default: '' },
    ],
  },
  {
    title: 'Footer', icon: '🔗',
    fields: [
      { label: 'Nom du site', key: 'footer_name', type: 'text', default: 'SOS Shine' },
      { label: 'Lien Mentions légales', key: 'footer_link_mentions', type: 'text', default: '/mentions-legales' },
      { label: 'Lien CGV', key: 'footer_link_cgv', type: 'text', default: '/cgv' },
      { label: 'Lien Confidentialité', key: 'footer_link_privacy', type: 'text', default: '/confidentialite' },
      { label: 'Lien Contact', key: 'footer_link_contact', type: 'text', default: '/contact' },
    ],
  },
  {
    title: 'Page Connexion', icon: '🔑',
    fields: [
      { label: 'Titre', key: 'login_title', type: 'text', default: 'Se connecter' },
      { label: 'Sous-titre', key: 'login_subtitle', type: 'text', default: 'Bienvenue dans votre sanctuaire' },
      { label: 'Texte bouton', key: 'login_button_text', type: 'text', default: 'Se connecter' },
      { label: 'Texte pied de page', key: 'login_signup_text', type: 'text', default: 'Pas encore membre ?' },
      { label: 'Texte lien inscription', key: 'login_signup_link_text', type: 'text', default: 'Rejoindre le sanctuaire' },
      sep('Style'),
      { label: 'Police du titre', key: 'login_title_font', type: 'select', options: fontOpts, default: 'Cormorant Garamond' },
      { label: 'Taille du titre', key: 'login_title_size', type: 'select', options: sizeOpts, default: 'md' },
      { label: 'Alignement', key: 'login_title_align', type: 'select', options: alignOpts, default: 'center' },
      sep('Médias'),
      { label: 'Image de fond', key: 'login_bg_image', type: 'upload', accept: 'image/*', folder: 'site', hint: '1920x1080', default: '' },
      { label: 'Image au-dessus du formulaire', key: 'login_header_image', type: 'upload', accept: 'image/*', folder: 'site', default: '' },
    ],
  },
  {
    title: 'Page Inscription', icon: '📝',
    fields: [
      { label: 'Titre', key: 'signup_title', type: 'text', default: 'Créer mon compte' },
      { label: 'Sous-titre', key: 'signup_subtitle', type: 'text', default: 'Rejoignez le sanctuaire' },
      { label: 'Texte bouton', key: 'signup_button_text', type: 'text', default: 'Créer mon compte' },
      { label: 'Texte pied de page', key: 'signup_login_text', type: 'text', default: 'Déjà membre ?' },
      { label: 'Texte lien connexion', key: 'signup_login_link_text', type: 'text', default: 'Se connecter' },
      { label: 'Texte essai gratuit', key: 'signup_trial_text', type: 'text', default: '7 jours gratuits - Puis 49,90€/mois - Sans engagement' },
      { label: 'Titre confirmation email', key: 'signup_confirm_title', type: 'text', default: 'Vérifiez votre email' },
      { label: 'Texte confirmation', key: 'signup_confirm_text', type: 'textarea', default: "Un lien de confirmation a été envoyé. Cliquez dessus pour activer votre compte." },
      sep('Style'),
      { label: 'Police du titre', key: 'signup_title_font', type: 'select', options: fontOpts, default: 'Cormorant Garamond' },
      { label: 'Taille du titre', key: 'signup_title_size', type: 'select', options: sizeOpts, default: 'md' },
      { label: 'Alignement', key: 'signup_title_align', type: 'select', options: alignOpts, default: 'center' },
      sep('Médias'),
      { label: 'Image de fond', key: 'signup_bg_image', type: 'upload', accept: 'image/*', folder: 'site', hint: '1920x1080', default: '' },
      { label: 'Image au-dessus du formulaire', key: 'signup_header_image', type: 'upload', accept: 'image/*', folder: 'site', default: '' },
    ],
  },
  {
    title: 'Page - Mentions légales', icon: '⚖️',
    fields: [
      { label: 'Titre de la page', key: 'mentions_title', type: 'text', default: 'Mentions légales' },
      { label: 'Contenu (HTML autorisé)', key: 'mentions_content', type: 'textarea', default: '' },
    ],
  },
  {
    title: 'Page - CGV', icon: '📋',
    fields: [
      { label: 'Titre de la page', key: 'cgv_title', type: 'text', default: 'Conditions Générales de Vente' },
      { label: 'Contenu (HTML autorisé)', key: 'cgv_content', type: 'textarea', default: '' },
    ],
  },
  {
    title: 'Page - Confidentialité', icon: '🔒',
    fields: [
      { label: 'Titre de la page', key: 'privacy_title', type: 'text', default: 'Politique de confidentialité' },
      { label: 'Contenu (HTML autorisé)', key: 'privacy_content', type: 'textarea', default: '' },
    ],
  },
  {
    title: 'Page - Contact', icon: '📬',
    fields: [
      { label: 'Titre de la page', key: 'contact_title', type: 'text', default: 'Contact' },
      { label: 'Email de contact', key: 'contact_email', type: 'text', default: 'julialaureau@sosshine.com' },
      { label: 'Téléphone', key: 'contact_phone', type: 'text', default: '' },
      { label: 'Adresse', key: 'contact_address', type: 'textarea', default: '' },
      { label: 'Texte complémentaire (HTML autorisé)', key: 'contact_content', type: 'textarea', default: '' },
    ],
  },
  {
    title: 'Notifications email', icon: '📧',
    fields: [
      { label: 'Email expéditeur', key: 'email_from', type: 'text', default: 'julialaureau@sosshine.com' },
      { label: 'Nom expéditeur', key: 'email_from_name', type: 'text', default: 'SOS Shine' },
    ],
  },
]

export default function ParametresPage() {
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})

  const loadSettings = useCallback(async () => {
    const supabase = createClient()
    const { data, error: fetchError } = await supabase.from('site_settings').select('key, value')
    if (fetchError) { setError(fetchError.message); setLoading(false); return }

    const map: Record<string, string> = {}
    sections.forEach((sec) => sec.fields.forEach((f) => { if (f.key) map[f.key] = f.default }))
    if (data) data.forEach((row: { key: string; value: string }) => { map[row.key] = row.value })
    setValues(map)
    setOpenSections({ [sections[0].title]: true, [sections[1].title]: true })
    setLoading(false)
  }, [])

  useEffect(() => { loadSettings() }, [loadSettings])

  const colorToCssVar: Record<string, string> = {
    color_primary: '--gold', color_secondary: '--accent', color_bg: '--dark',
    color_card: '--dark-card', color_border: '--dark-border', color_text: '--text-primary',
    color_text_secondary: '--text-secondary', color_text_muted: '--text-muted', color_button: '--button-bg',
  }

  function updateValue(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
    if (colorToCssVar[key] && value) document.documentElement.style.setProperty(colorToCssVar[key], value)
  }

  function toggleSection(title: string) {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  async function handleSave() {
    setSaving(true); setError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const now = new Date().toISOString()
      const userId = user?.id || null
      const rows = Object.entries(values).map(([key, value]) => ({ key, value, updated_by: userId, updated_at: now }))
      const { error: upsertErr } = await supabase.from('site_settings').upsert(rows, { onConflict: 'key' })
      if (upsertErr) {
        for (const item of rows) {
          const { data: existing } = await supabase.from('site_settings').select('id').eq('key', item.key).maybeSingle()
          if (existing) {
            const { error: e } = await supabase.from('site_settings').update({ value: item.value, updated_by: item.updated_by, updated_at: item.updated_at }).eq('key', item.key)
            if (e) { setError(`Erreur ${item.key}: ${e.message}`); setSaving(false); return }
          } else {
            const { error: e } = await supabase.from('site_settings').insert(item)
            if (e) { setError(`Erreur ${item.key}: ${e.message}`); setSaving(false); return }
          }
        }
      }
      setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 4000)
    } catch (err) {
      setError(`Erreur: ${err instanceof Error ? err.message : 'Veuillez réessayer'}`); setSaving(false)
    }
  }

 if (loading) return <div className="flex justify-center py-20 w-8 h-8 border-2 border-[#74C0FC] border-t-transparent rounded-full animate-spin" ><div /></div>

  const inputStyle = { background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text-primary)' }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between sticky top-0 z-20 py-4 -mx-4 px-4" style={{ background: 'var(--dark)' }}>
        <div>
          <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>Paramètres</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Polices, alignements, couleurs, images, vidéos - personnalisez tout.</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm font-medium" style={{ color: '#55EFC4' }}>Sauvegardé !</span>}
          <button onClick={handleSave} disabled={saving} className="px-6 py-3 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-50" style={{ background: '#74C0FC', color: '#fff' }}>
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      {error && <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.25)', color: '#FF6B6B' }}>{error}</div>}

      {sections.map((section) => {
        const isOpen = openSections[section.title]
        return (
          <div key={section.title} className="rounded-xl overflow-hidden" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
            <button onClick={() => toggleSection(section.title)} className="w-full flex items-center justify-between p-5 cursor-pointer text-left">
              <h2 className="font-semibold text-base flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <span>{section.icon}</span> {section.title}
              </h2>
              <svg className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: 'var(--text-muted)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {isOpen && (
              <div className="px-5 pb-5 space-y-4">
                {section.title === 'Apparence générale' && (
                  <div className="rounded-xl p-4 space-y-3" style={{ background: values.color_bg || '#362038', border: `1px solid ${values.color_border || '#5E3E52'}` }}>
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: values.color_text_muted || '#8E6E7E' }}>Preview</p>
                    <div className="rounded-lg p-4" style={{ background: values.color_card || '#442B40', border: `1px solid ${values.color_border || '#5E3E52'}` }}>
                      <h3 className="font-display text-lg font-semibold mb-1" style={{ color: values.color_primary || '#C9A961' }}>Titre</h3>
                      <p className="text-sm mb-1" style={{ color: values.color_text || '#F5EDF0' }}>Texte principal</p>
                      <p className="text-xs mb-3" style={{ color: values.color_text_secondary || '#C8A8B8' }}>Texte secondaire</p>
                      <div className="flex gap-2">
                        <span className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: values.color_button || '#C9A961', color: values.color_bg || '#362038' }}>Bouton</span>
                        <span className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: values.color_secondary || '#74C0FC', color: '#fff' }}>Secondaire</span>
                      </div>
                    </div>
                  </div>
                )}

                {section.fields.map((field, fi) => (
                  <div key={field.key || `sep-${fi}`}>
                    {field.type === 'separator' ? (
                      <div className="pt-3 mt-1" style={{ borderTop: '1px solid var(--border)' }}>
                        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{field.label}</p>
                      </div>
                    ) : field.type === 'upload' ? (
                      <FileUpload label={field.label} accept={field.accept || '*'} folder={field.folder || 'site'}
                        currentUrl={values[field.key] || null} hint={field.hint}
                        onUploaded={(url) => updateValue(field.key, url)} onRemoved={() => updateValue(field.key, '')} />
                    ) : field.type === 'color' ? (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="text-sm sm:w-52 flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>{field.label}</label>
                        <div className="flex items-center gap-2 flex-1">
                          <input type="color" value={values[field.key] || field.default || '#000000'} onChange={(e) => updateValue(field.key, e.target.value)}
                            className="w-10 h-10 rounded-lg cursor-pointer border-0" style={{ background: 'transparent' }} />
                          <input type="text" value={values[field.key] || ''} onChange={(e) => updateValue(field.key, e.target.value)}
                            placeholder="Défaut" className="flex-1 rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} />
                        </div>
                      </div>
                    ) : field.type === 'select' ? (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="text-sm sm:w-52 flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>{field.label}</label>
                        <select value={values[field.key] || field.default} onChange={(e) => updateValue(field.key, e.target.value)}
                          className="flex-1 rounded-lg px-3 py-2.5 text-sm outline-none cursor-pointer appearance-none"
                          style={{ ...inputStyle, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238E6E7E' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}>
                          {field.options?.map((opt) => <option key={opt.value} value={opt.value} style={{ background: '#362038', color: '#F5EDF0' }}>{opt.label}</option>)}
                        </select>
                      </div>
                    ) : field.type === 'textarea' ? (
                      <div>
                        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{field.label}</label>
                        <textarea value={values[field.key] || ''} onChange={(e) => updateValue(field.key, e.target.value)}
                          rows={3} className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-y" style={inputStyle} />
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="text-sm sm:w-52 flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>{field.label}</label>
                        <input type="text" value={values[field.key] || ''} onChange={(e) => updateValue(field.key, e.target.value)}
                          className="flex-1 rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      <div className="flex justify-end pb-8">
        <button onClick={handleSave} disabled={saving} className="px-6 py-3 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-50" style={{ background: '#74C0FC', color: '#fff' }}>
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>
    </div>
  )
}
