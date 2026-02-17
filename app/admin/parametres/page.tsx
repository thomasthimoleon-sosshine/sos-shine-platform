'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import FileUpload from '@/components/FileUpload'

interface FieldDef {
  label: string
  key: string
  type: 'text' | 'color' | 'textarea' | 'upload'
  accept?: string
  folder?: string
  hint?: string
  default: string
}

interface SectionDef {
  title: string
  icon: string
  fields: FieldDef[]
}

const sections: SectionDef[] = [
  {
    title: 'Apparence',
    icon: '🎨',
    fields: [
      { label: 'Couleur principale (or)', key: 'color_primary', type: 'color', default: '#D4A843' },
      { label: 'Couleur secondaire', key: 'color_secondary', type: 'color', default: '#A29BFE' },
      { label: 'Couleur de fond', key: 'color_bg', type: 'color', default: '#0A0A0A' },
      { label: 'Logo du site', key: 'logo_url', type: 'upload', accept: 'image/*', folder: 'site', hint: 'PNG ou SVG recommande, 512x512px', default: '' },
      { label: 'Image de fond hero', key: 'hero_bg_url', type: 'upload', accept: 'image/*', folder: 'site', hint: 'Image plein ecran, 1920x1080px', default: '' },
    ],
  },
  {
    title: 'Textes de la landing page — Hero',
    icon: '✏️',
    fields: [
      { label: 'Titre principal', key: 'hero_title', type: 'textarea', default: "L'encyclopedie des schemas emotionnels et des experiences de vie." },
      { label: 'Sous-titre', key: 'hero_subtitle', type: 'textarea', default: 'Un espace ouvert 24h/24, 7j/7, pour comprendre, apaiser et ne plus jamais etre seul.' },
      { label: 'Video d\'introduction', key: 'intro_video_url', type: 'upload', accept: 'video/*', folder: 'site', hint: 'MP4 recommande', default: '' },
      { label: 'Texte bouton encyclopedie', key: 'hero_btn_encyclopedie', type: 'text', default: "Decouvrir l'encyclopedie" },
      { label: 'Texte bouton inscription', key: 'hero_btn_signup', type: 'text', default: "Acces illimite" },
    ],
  },
  {
    title: 'Section — Le principe SOS Shine',
    icon: '💡',
    fields: [
      { label: 'Sous-titre de section', key: 'principe_label', type: 'text', default: 'Le principe SOS Shine' },
      { label: 'Titre', key: 'principe_title', type: 'textarea', default: "On ne change pas votre identite. On eteint la douleur pour liberer votre potentiel." },
      { label: 'Description', key: 'principe_desc', type: 'textarea', default: "Chaque douleur — abandon, trahison, burn-out, deuil, peur — possede sa propre page dans notre encyclopedie, avec un protocole en 4 etapes concu pour vous accompagner de A a Z." },
    ],
  },
  {
    title: 'Section — Les 4 etapes',
    icon: '🔢',
    fields: [
      { label: 'Sous-titre de section', key: 'steps_label', type: 'text', default: 'Le parcours SOS Shine' },
      { label: 'Titre de section', key: 'steps_title', type: 'text', default: '4 etapes pour chaque douleur' },
      { label: 'Etape 1 — Titre', key: 'step1_title', type: 'text', default: 'Comprendre' },
      { label: 'Etape 1 — Description', key: 'step1_desc', type: 'textarea', default: "Video de coaching immersive. Analyse emotionnelle. Explication de votre probleme. Apaisement mental. Une approche humaine et directe." },
      { label: 'Etape 2 — Titre', key: 'step2_title', type: 'text', default: 'Liberation Energetique' },
      { label: 'Etape 2 — Description', key: 'step2_desc', type: 'textarea', default: "Soin energetique. Activation emotionnelle. Decharge des tensions. Nettoyage des empreintes qui vous bloquent." },
      { label: 'Etape 3 — Titre', key: 'step3_title', type: 'text', default: 'Integration & Meditation' },
      { label: 'Etape 3 — Description', key: 'step3_desc', type: 'textarea', default: "Meditation guidee. Stabilisation interieure. Reconnexion a soi. Nouvelle frequence emotionnelle." },
      { label: 'Etape 4 — Titre', key: 'step4_title', type: 'text', default: 'Action & Reprogrammation' },
      { label: 'Etape 4 — Description', key: 'step4_desc', type: 'textarea', default: "Exercices pratiques. Carnets de bord. PDF. Habitudes positives. Plan d'action concret." },
    ],
  },
  {
    title: 'Section — Encyclopedie (apercu)',
    icon: '📘',
    fields: [
      { label: 'Titre de section', key: 'encyclo_title', type: 'text', default: 'Chaque douleur a sa page dediee' },
      { label: 'Description', key: 'encyclo_desc', type: 'textarea', default: "Abandon, trahison, burn-out, deuil, dependance affective, peur, solitude, rejet... Classees de A a Z, accessibles en un clic." },
      { label: 'Douleurs affichees (une par ligne)', key: 'encyclo_items', type: 'textarea', default: "Abandon\nAnxiete\nBurn-out\nDependance affective\nDeuil\nManque de confiance\nPeur\nRejet\nRupture\nSolitude\nTrahison\nEt plus..." },
    ],
  },
  {
    title: 'Section — Communaute',
    icon: '🤝',
    fields: [
      { label: 'Titre de section', key: 'community_title', type: 'textarea', default: "Vous n'etes plus jamais seul a 3h du matin." },
      { label: 'Description', key: 'community_desc', type: 'textarea', default: "Chat dedie par douleur, chat general, mur communautaire, soins collectifs et evenements — une vraie famille." },
      { label: 'Bloc 1 — Titre', key: 'community_block1_title', type: 'text', default: 'Le Feu de Camp' },
      { label: 'Bloc 1 — Description', key: 'community_block1_desc', type: 'textarea', default: "Chaque douleur a son propre chat. Echangez avec ceux qui comprennent vraiment. Un espace d'entraide cible et bienveillant." },
      { label: 'Bloc 2 — Titre', key: 'community_block2_title', type: 'text', default: 'Le Mur Communautaire' },
      { label: 'Bloc 2 — Description', key: 'community_block2_desc', type: 'textarea', default: "Publications, annonces, partages. Restez informe de chaque nouvelle douleur, chaque evenement, chaque avancee collective." },
      { label: 'Bloc 3 — Titre', key: 'community_block3_title', type: 'text', default: 'Les Rencontres Reelles' },
      { label: 'Bloc 3 — Description', key: 'community_block3_desc', type: 'textarea', default: "Soins collectifs, ateliers, lives, Shine Walks — le digital prepare, le physique transforme." },
    ],
  },
  {
    title: 'Temoignages',
    icon: '💬',
    fields: [
      { label: 'Sous-titre de section', key: 'testimonials_label', type: 'text', default: 'Ils ont traverse la tempete' },
      { label: 'Temoignage 1 (texte | prenom | ville)', key: 'testimonial_1', type: 'textarea', default: "Je ne savais meme pas que j'avais le droit de ne pas aller bien. SOS Shine m'a donne un espace ou ma douleur avait le droit d'exister.|Marie, 34 ans|Lyon" },
      { label: 'Temoignage 2 (texte | prenom | ville)', key: 'testimonial_2', type: 'textarea', default: "La premiere fois que quelqu'un m'a dit je suis passe par la, tiens bon — c'etait dans le Feu de Camp. J'ai pleure. Des larmes de soulagement.|Karim, 41 ans|Bordeaux" },
      { label: 'Temoignage 3 (texte | prenom | ville)', key: 'testimonial_3', type: 'textarea', default: "J'ai fait ma premiere Shine Walk un samedi matin. En rentrant, j'ai senti quelque chose que j'avais oublie : je n'etais plus seule.|Sophie, 28 ans|Bruxelles" },
      { label: 'Temoignage 4 (texte | prenom | ville)', key: 'testimonial_4', type: 'textarea', default: "Grace aux 4 etapes, j'ai compris ma douleur au lieu de la fuir. Aujourd'hui, je suis Eclaireur et j'aide les autres.|Antoine, 37 ans|Geneve" },
    ],
  },
  {
    title: 'Tarification',
    icon: '💰',
    fields: [
      { label: 'Prix Essentiel (EUR/mois)', key: 'price_essential', type: 'text', default: '29.90' },
      { label: 'Prix Premium (EUR/mois)', key: 'price_premium', type: 'text', default: '99.90' },
      { label: 'Jours d\'essai gratuit', key: 'trial_days', type: 'text', default: '7' },
      { label: 'Features Essentiel (une par ligne)', key: 'features_essential', type: 'textarea', default: "Encyclopedie complete des douleurs\n4 etapes par douleur (video, soin, meditation, exercices)\nChat dedie par douleur + Chat general\nMur communautaire\nSoins collectifs & evenements\nEssai gratuit 7 jours" },
      { label: 'Features Premium (une par ligne)', key: 'features_premium', type: 'textarea', default: "Tout l'Essentiel inclus\nPermanences experts 24/7\nAccompagnement prioritaire\nSupport direct Julia, William & Thomas" },
      { label: 'Texte sous les offres (italique)', key: 'pricing_footer', type: 'text', default: "Parce que si on doit vous retenir par un contrat, c'est qu'on n'a pas fait notre travail." },
    ],
  },
  {
    title: 'Section — CTA final',
    icon: '🎯',
    fields: [
      { label: 'Titre CTA final', key: 'cta_title', type: 'textarea', default: "Comprenez. Apaisez. Ne soyez plus jamais seul." },
      { label: 'Texte du bouton', key: 'cta_button', type: 'text', default: 'Rejoindre SOS Shine' },
    ],
  },
  {
    title: 'Footer',
    icon: '🔗',
    fields: [
      { label: 'Nom du site (footer)', key: 'footer_name', type: 'text', default: 'SOS Shine' },
      { label: 'Lien Mentions legales', key: 'footer_link_mentions', type: 'text', default: '/mentions-legales' },
      { label: 'Lien CGV', key: 'footer_link_cgv', type: 'text', default: '/cgv' },
      { label: 'Lien Confidentialite', key: 'footer_link_privacy', type: 'text', default: '/confidentialite' },
      { label: 'Lien Contact', key: 'footer_link_contact', type: 'text', default: '/contact' },
    ],
  },
  {
    title: 'Notifications email',
    icon: '📧',
    fields: [
      { label: 'Email expediteur', key: 'email_from', type: 'text', default: 'contact@sosshine.fr' },
      { label: 'Nom expediteur', key: 'email_from_name', type: 'text', default: 'SOS Shine' },
    ],
  },
]

export default function ParametresPage() {
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadSettings = useCallback(async () => {
    const supabase = createClient()
    const { data, error: fetchError } = await supabase
      .from('site_settings')
      .select('key, value')

    if (fetchError) {
      setError(fetchError.message)
      setLoading(false)
      return
    }

    const map: Record<string, string> = {}
    // Set defaults first
    sections.forEach((s) => s.fields.forEach((f) => { map[f.key] = f.default }))
    // Override with DB values
    if (data) {
      data.forEach((row: { key: string; value: string }) => { map[row.key] = row.value })
    }
    setValues(map)
    setLoading(false)
  }, [])

  useEffect(() => { loadSettings() }, [loadSettings])

  function updateValue(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const now = new Date().toISOString()
      const userId = user?.id || null

      // Build upsert payload
      const rows = Object.entries(values).map(([key, value]) => ({
        key,
        value,
        updated_by: userId,
        updated_at: now,
      }))

      // Single upsert call (requires unique constraint on "key" column)
      const { error: upsertErr } = await supabase
        .from('site_settings')
        .upsert(rows, { onConflict: 'key' })

      if (upsertErr) {
        // Fallback: save one by one if upsert fails (e.g. no unique constraint)
        for (const item of rows) {
          const { data: existing } = await supabase
            .from('site_settings')
            .select('id')
            .eq('key', item.key)
            .maybeSingle()

          if (existing) {
            const { error: updateErr } = await supabase
              .from('site_settings')
              .update({ value: item.value, updated_by: item.updated_by, updated_at: item.updated_at })
              .eq('key', item.key)
            if (updateErr) {
              setError(`Erreur sauvegarde ${item.key}: ${updateErr.message}`)
              setSaving(false)
              return
            }
          } else {
            const { error: insertErr } = await supabase
              .from('site_settings')
              .insert(item)
            if (insertErr) {
              setError(`Erreur sauvegarde ${item.key}: ${insertErr.message}`)
              setSaving(false)
              return
            }
          }
        }
      }

      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 4000)
    } catch (err) {
      setError(`Erreur inattendue: ${err instanceof Error ? err.message : 'Veuillez reessayer'}`)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#A29BFE] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Parametres
          </h1>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
            Personnalisez l&apos;apparence, les textes et la configuration de la plateforme.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-sm font-medium" style={{ color: '#55EFC4' }}>Sauvegarde !</span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
            style={{ background: '#A29BFE', color: '#fff' }}
          >
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.25)', color: '#FF6B6B' }}>
          {error}
        </div>
      )}

      {sections.map((section) => (
        <div key={section.title} className="rounded-xl p-6" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
          <h2 className="font-semibold text-lg mb-5 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <span>{section.icon}</span> {section.title}
          </h2>
          <div className="space-y-5">
            {section.fields.map((field) => (
              <div key={field.key}>
                {field.type === 'upload' ? (
                  <FileUpload
                    label={field.label}
                    accept={field.accept || '*'}
                    folder={field.folder || 'site'}
                    currentUrl={values[field.key] || null}
                    hint={field.hint}
                    onUploaded={(url) => updateValue(field.key, url)}
                    onRemoved={() => updateValue(field.key, '')}
                  />
                ) : field.type === 'color' ? (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <label className="text-sm sm:w-48 flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>
                      {field.label}
                    </label>
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="color"
                        value={values[field.key] || field.default}
                        onChange={(e) => updateValue(field.key, e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer border-0"
                        style={{ background: 'transparent' }}
                      />
                      <input
                        type="text"
                        value={values[field.key] || ''}
                        onChange={(e) => updateValue(field.key, e.target.value)}
                        className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
                      />
                    </div>
                  </div>
                ) : field.type === 'textarea' ? (
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                      {field.label}
                    </label>
                    <textarea
                      value={values[field.key] || ''}
                      onChange={(e) => updateValue(field.key, e.target.value)}
                      rows={3}
                      className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-y"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <label className="text-sm sm:w-48 flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>
                      {field.label}
                    </label>
                    <input
                      type="text"
                      value={values[field.key] || ''}
                      onChange={(e) => updateValue(field.key, e.target.value)}
                      className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Bottom save button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
          style={{ background: '#A29BFE', color: '#fff' }}
        >
          {saving ? 'Sauvegarde...' : 'Sauvegarder les parametres'}
        </button>
      </div>
    </div>
  )
}
