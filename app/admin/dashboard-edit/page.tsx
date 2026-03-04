'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import FileUpload from '@/components/FileUpload'

interface FieldDef {
  label: string
  key: string
  type: 'text' | 'textarea' | 'upload' | 'color' | 'separator'
  accept?: string
  folder?: string
  hint?: string
  default: string
}

interface SectionDef { title: string; icon: string; fields: FieldDef[] }

function sep(label: string): FieldDef {
  return { label, key: '', type: 'separator', default: '' }
}

const sections: SectionDef[] = [
  {
    title: 'Message de bienvenue', icon: '👋',
    fields: [
      { label: 'Texte de bienvenue', key: 'dash_welcome', type: 'text', default: 'Bienvenue,' },
      { label: 'Sous-titre', key: 'dash_subtitle', type: 'textarea', default: "Explorez vos ressources, votre communauté et votre parcours d'accompagnement." },
      sep('Salutations automatiques (selon l\'heure)'),
      { label: 'La nuit (0h-5h)', key: 'dash_greeting_night', type: 'text', default: 'Insomnie ? Qu\'est-ce qui te tracasse' },
      { label: 'Le matin (5h-12h)', key: 'dash_greeting_morning', type: 'text', default: 'Bonjour' },
      { label: 'L\'apres-midi (12h-18h)', key: 'dash_greeting_afternoon', type: 'text', default: 'Bon apres-midi' },
      { label: 'Le soir (apres 18h)', key: 'dash_greeting_evening', type: 'text', default: 'Bonsoir' },
      sep('Image'),
      { label: 'Image de bienvenue (optionnel)', key: 'dash_hero_image', type: 'upload', accept: 'image/*', folder: 'dashboard', hint: 'Image decorative en haut du dashboard', default: '' },
    ],
  },
  {
    title: 'Citation du jour', icon: '💬',
    fields: [
      { label: 'Citation personnalisee (laissez vide pour citation aleatoire)', key: 'dash_custom_quote', type: 'textarea', default: '' },
      { label: 'Auteur de la citation', key: 'dash_custom_quote_author', type: 'text', default: '' },
    ],
  },
  {
    title: 'Section Acces rapide', icon: '⚡',
    fields: [
      { label: 'Titre de section', key: 'dash_quick_title', type: 'text', default: 'Acces rapide' },
      { label: 'Texte au survol des cartes', key: 'dash_explore_label', type: 'text', default: 'Explorer' },
      sep('Carte 1 — Encyclopedie'),
      { label: 'Titre', key: 'dash_quick1_title', type: 'text', default: 'Encyclopedie' },
      { label: 'Description', key: 'dash_quick1_desc', type: 'textarea', default: 'Explorez les challenges emotionnels de A a Z' },
      sep('Carte 2 — Feu de Camp'),
      { label: 'Titre', key: 'dash_quick2_title', type: 'text', default: 'Feu de Camp' },
      { label: 'Description', key: 'dash_quick2_desc', type: 'textarea', default: 'Echangez avec la communaute' },
      sep('Carte 3 — Mur communautaire'),
      { label: 'Titre', key: 'dash_quick3_title', type: 'text', default: 'Le Mur' },
      { label: 'Description', key: 'dash_quick3_desc', type: 'textarea', default: 'Publications et partages de la communaute' },
      sep('Carte 4 — Evenements'),
      { label: 'Titre', key: 'dash_quick4_title', type: 'text', default: 'Evenements' },
      { label: 'Description', key: 'dash_quick4_desc', type: 'textarea', default: 'Soins collectifs, ateliers et rencontres' },
    ],
  },
  {
    title: 'Section Mon parcours', icon: '📈',
    fields: [
      { label: 'Titre de section', key: 'dash_journey_title', type: 'text', default: 'Mon parcours' },
      sep('Carte Objectifs'),
      { label: 'Label "Mes objectifs"', key: 'dash_goals_label', type: 'text', default: 'Mes objectifs' },
      { label: 'Texte compteur (ex: "objectifs en cours")', key: 'dash_goals_count_label', type: 'text', default: 'objectifs en cours' },
      sep('Carte Journal'),
      { label: 'Label "Mon journal"', key: 'dash_journal_label', type: 'text', default: 'Mon journal' },
      { label: 'Texte compteur (ex: "entrees ce mois")', key: 'dash_journal_count_label', type: 'text', default: 'entrees ce mois' },
    ],
  },
  {
    title: 'Les 3 Etapes du protocole', icon: '🔢',
    fields: [
      { label: 'Titre de section', key: 'steps_label', type: 'text', default: 'Le parcours SOS Shine' },
      sep('Etape 1'),
      { label: 'Titre', key: 'step1_title', type: 'text', default: 'Comprendre' },
      { label: 'Description', key: 'step1_desc', type: 'textarea', default: 'Video de coaching immersive' },
      { label: 'Couleur (hex)', key: 'step1_color', type: 'color', default: '#55EFC4' },
      sep('Etape 2'),
      { label: 'Titre', key: 'step2_title', type: 'text', default: 'Liberation Energetique' },
      { label: 'Description', key: 'step2_desc', type: 'textarea', default: 'Soin energetique' },
      { label: 'Couleur (hex)', key: 'step2_color', type: 'color', default: '#74C0FC' },
      sep('Etape 3'),
      { label: 'Titre', key: 'step3_title', type: 'text', default: 'Integration & Meditation' },
      { label: 'Description', key: 'step3_desc', type: 'textarea', default: 'Integration & reconnexion' },
      { label: 'Couleur (hex)', key: 'step3_color', type: 'color', default: '#E17055' },
    ],
  },
  {
    title: 'Pied de page (aide)', icon: '📧',
    fields: [
      { label: 'Texte d\'aide', key: 'dash_help_text', type: 'text', default: 'Besoin d\'aide ? Ecrivez-nous a' },
      { label: 'Email de contact', key: 'dash_help_email', type: 'text', default: 'julialaureau@sosshine.com' },
    ],
  },
]

export default function DashboardEditPage() {
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
    setOpenSections({ [sections[0].title]: true })
    setLoading(false)
  }, [])

  useEffect(() => { loadSettings() }, [loadSettings])

  function updateValue(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
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

      // Only save keys that belong to our sections
      const ourKeys = new Set<string>()
      sections.forEach((sec) => sec.fields.forEach((f) => { if (f.key) ourKeys.add(f.key) }))

      const rows = Object.entries(values)
        .filter(([key]) => ourKeys.has(key))
        .map(([key, value]) => ({ key, value, updated_by: userId, updated_at: now }))

      const { error: upsertErr } = await supabase.from('site_settings').upsert(rows, { onConflict: 'key' })
      if (upsertErr) {
        // Fallback: individual update/insert per row
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
      setError(`Erreur: ${err instanceof Error ? err.message : 'Veuillez reessayer'}`); setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-[#74C0FC] border-t-transparent rounded-full animate-spin" /></div>

  const inputStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between sticky top-0 z-20 py-4 -mx-4 px-4" style={{ background: 'var(--dark)' }}>
        <div>
          <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>Espace Membre</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Modifiez les textes, images et titres du dashboard des membres.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm font-medium" style={{ color: '#55EFC4' }}>Sauvegarde !</span>}
          <button onClick={handleSave} disabled={saving} className="px-6 py-3 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-50" style={{ background: '#74C0FC', color: '#fff' }}>
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      {error && <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.25)', color: '#FF6B6B' }}>{error}</div>}

      {sections.map((section) => {
        const isOpen = openSections[section.title]
        return (
          <div key={section.title} className="rounded-xl overflow-hidden" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
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
                {section.fields.map((field, fi) => (
                  <div key={field.key || `sep-${fi}`}>
                    {field.type === 'separator' ? (
                      <div className="pt-3 mt-1" style={{ borderTop: '1px solid var(--dark-border)' }}>
                        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{field.label}</p>
                      </div>
                    ) : field.type === 'upload' ? (
                      <FileUpload label={field.label} accept={field.accept || '*'} folder={field.folder || 'dashboard'}
                        currentUrl={values[field.key] || null} hint={field.hint}
                        onUploaded={(url) => updateValue(field.key, url)} onRemoved={() => updateValue(field.key, '')} />
                    ) : field.type === 'color' ? (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="text-sm sm:w-52 flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>{field.label}</label>
                        <div className="flex items-center gap-2 flex-1">
                          <input type="color" value={values[field.key] || field.default || '#000000'} onChange={(e) => updateValue(field.key, e.target.value)}
                            className="w-10 h-10 rounded-lg cursor-pointer border-0" style={{ background: 'transparent' }} />
                          <input type="text" value={values[field.key] || ''} onChange={(e) => updateValue(field.key, e.target.value)}
                            placeholder={field.default} className="flex-1 rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} />
                        </div>
                      </div>
                    ) : field.type === 'textarea' ? (
                      <div>
                        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{field.label}</label>
                        <textarea value={values[field.key] || ''} onChange={(e) => updateValue(field.key, e.target.value)}
                          placeholder={field.default}
                          rows={3} className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-y" style={inputStyle} />
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="text-sm sm:w-52 flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>{field.label}</label>
                        <input type="text" value={values[field.key] || ''} onChange={(e) => updateValue(field.key, e.target.value)}
                          placeholder={field.default}
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
