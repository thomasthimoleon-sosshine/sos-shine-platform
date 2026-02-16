'use client'

import { useState } from 'react'

export default function ParametresPage() {
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const sections = [
    {
      title: 'Apparence',
      icon: '🎨',
      fields: [
        { label: 'Couleur principale (or)', key: 'color_primary', type: 'color', default: '#D4A843' },
        { label: 'Couleur secondaire', key: 'color_secondary', type: 'color', default: '#A29BFE' },
        { label: 'Couleur de fond', key: 'color_bg', type: 'color', default: '#0A0A0A' },
        { label: 'URL du logo', key: 'logo_url', type: 'text', default: '' },
        { label: 'URL image de fond hero', key: 'hero_bg_url', type: 'text', default: '' },
      ],
    },
    {
      title: 'Textes de la landing page',
      icon: '✏️',
      fields: [
        { label: 'Titre principal', key: 'hero_title', type: 'text', default: "L'encyclopédie des schémas émotionnels et des expériences de vie." },
        { label: 'Sous-titre', key: 'hero_subtitle', type: 'text', default: 'Un espace ouvert 24h/24, 7j/7, pour comprendre, apaiser et ne plus jamais être seul.' },
        { label: 'URL vidéo d\'introduction', key: 'intro_video_url', type: 'text', default: '' },
      ],
    },
    {
      title: 'Tarification',
      icon: '💰',
      fields: [
        { label: 'Prix Essentiel (€/mois)', key: 'price_essential', type: 'text', default: '29.90' },
        { label: 'Prix Premium (€/mois)', key: 'price_premium', type: 'text', default: '99.90' },
        { label: 'Jours d\'essai gratuit', key: 'trial_days', type: 'text', default: '7' },
      ],
    },
    {
      title: 'Notifications email',
      icon: '📧',
      fields: [
        { label: 'Email expéditeur', key: 'email_from', type: 'text', default: 'contact@sosshine.fr' },
        { label: 'Nom expéditeur', key: 'email_from_name', type: 'text', default: 'SOS Shine' },
      ],
    },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Paramètres
          </h1>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
            Personnalisez l&apos;apparence, les textes et la configuration de la plateforme.
          </p>
        </div>
        {saved && (
          <span className="text-sm font-medium" style={{ color: '#55EFC4' }}>Sauvegardé !</span>
        )}
      </div>

      <div className="rounded-xl p-5" style={{ background: 'rgba(162,155,254,0.06)', border: '1px solid rgba(162,155,254,0.15)' }}>
        <p className="text-sm" style={{ color: '#A29BFE' }}>
          Les modifications seront connectées à la base de données Supabase (table site_settings) une fois les tables créées.
          Pour l&apos;instant, les valeurs par défaut sont affichées.
        </p>
      </div>

      {sections.map((section) => (
        <div key={section.title} className="rounded-xl p-6" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
          <h2 className="font-semibold text-lg mb-5 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <span>{section.icon}</span> {section.title}
          </h2>
          <div className="space-y-4">
            {section.fields.map((field) => (
              <div key={field.key} className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="text-sm sm:w-48 flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>
                  {field.label}
                </label>
                {field.type === 'color' ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input type="color" defaultValue={field.default}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0" style={{ background: 'transparent' }} />
                    <input type="text" defaultValue={field.default}
                      className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }} />
                  </div>
                ) : (
                  <input type="text" defaultValue={field.default}
                    className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <button onClick={handleSave}
        className="px-6 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer"
        style={{ background: '#A29BFE', color: '#fff' }}>
        Sauvegarder les paramètres
      </button>
    </div>
  )
}
