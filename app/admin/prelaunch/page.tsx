'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import FileUpload from '@/components/FileUpload'

interface FieldDef {
  label: string
  key: string
  type: 'text' | 'textarea' | 'upload' | 'color' | 'toggle' | 'separator'
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
    title: 'Activation', icon: '🚀',
    fields: [
      { label: 'Activer la page de pre-lancement', key: 'prelaunch_enabled', type: 'toggle', default: 'false' },
      { label: 'Date de lancement (ex: 2026-03-22T00:00:00+02:00)', key: 'prelaunch_launch_date', type: 'text', default: '2026-03-22T00:00:00+02:00' },
    ],
  },
  {
    title: 'Titre & Texte hero', icon: '✨',
    fields: [
      { label: 'Badge (petit texte au dessus)', key: 'prelaunch_badge', type: 'text', default: 'Lancement exclusif' },
      { label: 'Titre ligne 1', key: 'prelaunch_title_1', type: 'text', default: 'Quelque chose' },
      { label: 'Titre ligne 2', key: 'prelaunch_title_2', type: 'text', default: 'de' },
      { label: 'Titre ligne 3 (shimmer)', key: 'prelaunch_title_3', type: 'text', default: 'puissant' },
      { label: 'Titre ligne 4', key: 'prelaunch_title_4', type: 'text', default: 'arrive.' },
      { label: 'Sous-titre ligne 1', key: 'prelaunch_subtitle_1', type: 'text', default: "L'encyclopedie complete des challenges emotionnels." },
      { label: 'Sous-titre ligne 2', key: 'prelaunch_subtitle_2', type: 'text', default: 'Un espace pour comprendre, apaiser et ne plus jamais etre seul.' },
    ],
  },
  {
    title: 'Countdown', icon: '⏳',
    fields: [
      { label: 'Texte au-dessus du compteur', key: 'prelaunch_countdown_label', type: 'text', default: 'Ouverture le 22 mars 2026 a minuit' },
      { label: 'Texte quand le compteur atteint 0', key: 'prelaunch_launched_text', type: 'text', default: 'Les portes sont ouvertes' },
      sep('Labels du compteur'),
      { label: 'Label jours', key: 'prelaunch_countdown_days', type: 'text', default: 'Jours' },
      { label: 'Label heures', key: 'prelaunch_countdown_hours', type: 'text', default: 'Heures' },
      { label: 'Label minutes', key: 'prelaunch_countdown_minutes', type: 'text', default: 'Minutes' },
      { label: 'Label secondes', key: 'prelaunch_countdown_seconds', type: 'text', default: 'Secondes' },
    ],
  },
  {
    title: 'Tarifs & Offre', icon: '💎',
    fields: [
      { label: 'Texte avantage', key: 'prelaunch_pricing_label', type: 'text', default: "Avantage liste d'attente" },
      { label: 'Description offre', key: 'prelaunch_pricing_desc', type: 'text', default: "Rejoignez maintenant et beneficiez d'un tarif preferentiel a vie." },
      sep('Tarif Early Bird'),
      { label: 'Prix early bird', key: 'prelaunch_price_early', type: 'text', default: '19,90' },
      { label: 'Label tarif early bird', key: 'prelaunch_price_early_label', type: 'text', default: 'Tarif fondateur — a vie' },
      sep('Tarif Standard'),
      { label: 'Prix standard', key: 'prelaunch_price_standard', type: 'text', default: '29,90' },
      { label: 'Label tarif standard', key: 'prelaunch_price_standard_label', type: 'text', default: 'Tarif standard apres lancement' },
      sep('Affichage'),
      { label: 'Suffixe prix (ex: /mois)', key: 'prelaunch_price_suffix', type: 'text', default: '/mois' },
      { label: 'Texte separateur (ex: au lieu de)', key: 'prelaunch_price_separator', type: 'text', default: 'au lieu de' },
      sep('Economies'),
      { label: 'Texte engagement', key: 'prelaunch_no_commitment', type: 'text', default: 'Sans engagement — Annulable a tout instant' },
      { label: 'Texte economie', key: 'prelaunch_savings_text', type: 'text', default: "10€ d'economie/mois, pour toujours." },
    ],
  },
  {
    title: 'Formulaire & Waitlist', icon: '📝',
    fields: [
      { label: 'Placeholder prenom', key: 'prelaunch_form_name_placeholder', type: 'text', default: 'Votre prenom (optionnel)' },
      { label: 'Placeholder email', key: 'prelaunch_form_email_placeholder', type: 'text', default: 'Votre email' },
      { label: 'Texte du bouton', key: 'prelaunch_form_button', type: 'text', default: "Rejoindre la liste d'attente — 19,90€/mois a vie" },
      sep('Messages'),
      { label: 'Titre apres inscription', key: 'prelaunch_success_title', type: 'text', default: 'Bienvenue parmi les fondateurs' },
      { label: 'Message apres inscription', key: 'prelaunch_success_message', type: 'textarea', default: "Votre place est reservee. Vous recevrez un email le jour de l'ouverture avec votre acces prioritaire au tarif de 19,90€/mois a vie." },
      { label: 'Message deja inscrit', key: 'prelaunch_already_message', type: 'text', default: 'Vous etes deja inscrit(e). Nous vous contacterons le 22 mars.' },
      { label: 'Texte en cours (bouton)', key: 'prelaunch_form_loading', type: 'text', default: 'Inscription...' },
      { label: 'Message d\'erreur', key: 'prelaunch_error_message', type: 'text', default: 'Une erreur est survenue. Veuillez reessayer.' },
      sep('Preuve sociale'),
      { label: 'Texte preuve sociale (utilisez {count} pour le nombre)', key: 'prelaunch_social_proof', type: 'text', default: '{count} personne(s) sur la liste d\'attente' },
    ],
  },
  {
    title: 'Features teaser', icon: '🎯',
    fields: [
      { label: 'Titre section', key: 'prelaunch_features_label', type: 'text', default: 'Ce qui vous attend' },
      { label: 'Feature 1', key: 'prelaunch_feature_1', type: 'text', default: "Encyclopedie complete des experiences de vie (A-Z)" },
      { label: 'Feature 2', key: 'prelaunch_feature_2', type: 'text', default: 'Videos de coaching immersif' },
      { label: 'Feature 3', key: 'prelaunch_feature_3', type: 'text', default: 'Soins energetiques & meditations' },
      { label: 'Feature 4', key: 'prelaunch_feature_4', type: 'text', default: 'Chat dedie par challenge emotionnel' },
      { label: 'Feature 5', key: 'prelaunch_feature_5', type: 'text', default: 'Communaute & mur de partage' },
      { label: 'Feature 6', key: 'prelaunch_feature_6', type: 'text', default: 'Soins collectifs & evenements' },
    ],
  },
  {
    title: 'Pied de page', icon: '📎',
    fields: [
      { label: 'Lien connexion (ex: Deja membre ? Se connecter)', key: 'prelaunch_login_link', type: 'text', default: 'Deja membre ? Se connecter' },
      { label: 'Copyright', key: 'prelaunch_copyright', type: 'text', default: '© 2026 SOS Shine. Tous droits reserves.' },
    ],
  },
  {
    title: 'Logo & Images', icon: '🖼️',
    fields: [
      { label: 'Logo (utilise le logo du site par defaut)', key: 'prelaunch_logo', type: 'upload', accept: 'image/*', folder: 'prelaunch', hint: 'Logo affiche en haut de la page', default: '' },
    ],
  },
]

export default function PrelaunchEditPage() {
  const [values, setValues] = useState<Record<string, string>>({})
  const [dbValues, setDbValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})

  const loadSettings = useCallback(async () => {
    const supabase = createClient()
    const { data, error: fetchError } = await supabase.from('site_settings').select('key, value')
    if (fetchError) { setError(fetchError.message); setLoading(false); return }

    const defaults: Record<string, string> = {}
    sections.forEach((sec) => sec.fields.forEach((f) => { if (f.key) defaults[f.key] = f.default }))

    const dbMap: Record<string, string> = {}
    if (data) data.forEach((row: { key: string; value: string }) => { dbMap[row.key] = row.value })

    const map: Record<string, string> = { ...defaults, ...dbMap }
    setValues(map)
    setDbValues(map)
    setOpenSections({ [sections[0].title]: true })
    setLoading(false)
  }, [])

  useEffect(() => { loadSettings() }, [loadSettings])

  const hasUnsavedChanges = Object.keys(values).some((key) => values[key] !== dbValues[key])

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
      if (!user) { setError('Session expirée. Veuillez vous reconnecter.'); setSaving(false); return }
      const now = new Date().toISOString()
      const userId = user.id

      const ourKeys = new Set<string>()
      sections.forEach((sec) => sec.fields.forEach((f) => { if (f.key) ourKeys.add(f.key) }))

      const rows = Object.entries(values)
        .filter(([key]) => ourKeys.has(key))
        .map(([key, value]) => ({ key, value, updated_by: userId, updated_at: now }))

      // Try upsert first
      const { error: upsertErr } = await supabase.from('site_settings').upsert(rows, { onConflict: 'key' })
      if (upsertErr) {
        // Fallback: save one by one
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

      // Re-fetch to confirm save and update state
      const { data: freshData, error: fetchErr } = await supabase.from('site_settings').select('key, value')
      if (fetchErr) {
        setError(`Sauvegarde effectuée mais impossible de recharger: ${fetchErr.message}`)
        setSaving(false)
        return
      }
      const freshMap: Record<string, string> = {}
      sections.forEach((sec) => sec.fields.forEach((f) => { if (f.key) freshMap[f.key] = f.default }))
      if (freshData) freshData.forEach((row: { key: string; value: string }) => { freshMap[row.key] = row.value })
      setValues(freshMap)
      setDbValues(freshMap)

      setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 4000)
    } catch (err) {
      setError(`Erreur: ${err instanceof Error ? err.message : 'Veuillez reessayer'}`); setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-[#74C0FC] border-t-transparent rounded-full animate-spin" /></div>

  const isEnabled = values.prelaunch_enabled === 'true'
  const inputStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between sticky top-0 z-20 py-4 -mx-4 px-4" style={{ background: 'var(--dark)' }}>
        <div>
          <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>Page de Pre-lancement</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Activez et personnalisez la page de pre-lancement avec compte a rebours et waitlist.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm font-medium" style={{ color: '#55EFC4' }}>Sauvegarde !</span>}
          {hasUnsavedChanges && !saved && <span className="text-sm font-medium animate-pulse" style={{ color: '#FECA57' }}>Modifications non sauvegardees</span>}
          <button onClick={handleSave} disabled={saving} className="px-6 py-3 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-50" style={{ background: hasUnsavedChanges ? '#FECA57' : '#74C0FC', color: hasUnsavedChanges ? '#000' : '#fff' }}>
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      {/* Status banner */}
      <div className="rounded-xl px-5 py-4 flex items-center justify-between" style={{
        background: isEnabled ? 'rgba(85,239,196,0.08)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${isEnabled ? 'rgba(85,239,196,0.25)' : 'var(--dark-border)'}`,
      }}>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full" style={{ background: isEnabled ? '#55EFC4' : 'var(--text-muted)' }} />
          <span className="text-sm font-medium" style={{ color: isEnabled ? '#55EFC4' : 'var(--text-muted)' }}>
            {isEnabled ? 'Page de pre-lancement ACTIVE — La landing page principale est remplacee' : 'Page de pre-lancement desactivee — La landing page principale est affichee'}
          </span>
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
                    ) : field.type === 'toggle' ? (
                      <div className="flex items-center justify-between py-2">
                        <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{field.label}</label>
                        <button type="button" onClick={() => updateValue(field.key, values[field.key] === 'true' ? 'false' : 'true')}
                          className="w-12 h-6 rounded-full relative transition-colors cursor-pointer"
                          style={{ background: values[field.key] === 'true' ? '#55EFC4' : 'rgba(255,255,255,0.1)' }}>
                          <span className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm"
                            style={{ left: values[field.key] === 'true' ? '26px' : '4px' }} />
                        </button>
                      </div>
                    ) : field.type === 'upload' ? (
                      <FileUpload label={field.label} accept={field.accept || '*'} folder={field.folder || 'prelaunch'}
                        currentUrl={values[field.key] || null} hint={field.hint}
                        onUploaded={(url) => updateValue(field.key, url)} onRemoved={() => updateValue(field.key, '')} />
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
