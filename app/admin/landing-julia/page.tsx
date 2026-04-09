'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { LandingSectionRow, SectionContent } from '@/lib/landing-defaults'
import { LANDING_DEFAULTS } from '@/lib/landing-defaults'
import FileUpload from '@/components/FileUpload'

/* ─────────────────────────────────────────────
   Sections que Julia peut modifier
───────────────────────────────────────────── */
const JULIA_SECTION_KEYS = [
  'hero',            // Vidéo + boutons CTA uniquement
  'ticker_1',        // Bandeau défilant 1
  'ticker_2',        // Bandeau défilant 2
  'stats',           // Chiffres clés
  'cta_dark',        // CTA émotionnel
  'footer',          // Pied de page
  'legal_mentions',  // Mentions légales
  'legal_cgv',       // CGV
  'legal_privacy',   // Confidentialité
  'legal_contact',   // Contact
] as const

const SECTION_LABELS: Record<string, { label: string; icon: string; description: string }> = {
  hero: { label: 'Vidéo & Boutons CTA', icon: '🎬', description: 'La vidéo d\'introduction et les boutons d\'appel à l\'action' },
  ticker_1: { label: 'Bandeau défilant 1', icon: '📜', description: 'Premier bandeau de mots-clés qui défile' },
  ticker_2: { label: 'Bandeau défilant 2', icon: '📜', description: 'Second bandeau de mots-clés qui défile' },
  stats: { label: 'Chiffres clés', icon: '📊', description: 'Les statistiques affichées (social proof)' },
  cta_dark: { label: 'CTA émotionnel', icon: '💫', description: 'Le bloc d\'appel à l\'action final' },
  footer: { label: 'Pied de page', icon: '🔗', description: 'Logo, liens, réseaux sociaux, copyright' },
  legal_mentions: { label: 'Mentions légales', icon: '📄', description: 'Page des mentions légales' },
  legal_cgv: { label: 'CGV', icon: '📄', description: 'Conditions Générales de Vente' },
  legal_privacy: { label: 'Confidentialité', icon: '🔒', description: 'Politique de confidentialité' },
  legal_contact: { label: 'Contact', icon: '📧', description: 'Page de contact' },
}

/* ── Styles réutilisables ── */
const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid var(--dark-border)',
  color: 'var(--text-primary)',
}

/* ── Composants de champs ── */
function TextField({ label, value, onChange, placeholder = '', type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} />
    </div>
  )
}

function TextAreaField({ label, value, onChange, rows = 4, placeholder = '' }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder}
        className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-y" style={inputStyle} />
    </div>
  )
}

function HtmlEditor({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={14}
        className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-y font-mono" style={inputStyle}
        placeholder="<h2>Titre</h2>\n<p>Votre contenu ici...</p>" />
      {value && (
        <div className="mt-3 rounded-lg p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--dark-border)' }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Aperçu</p>
          <div className="prose prose-invert prose-sm max-w-none" style={{ color: 'var(--text-secondary)' }}
            dangerouslySetInnerHTML={{ __html: value }} />
        </div>
      )}
    </div>
  )
}

function ToggleField({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      <button type="button" onClick={() => onChange(!checked)}
        className="w-10 h-5 rounded-full relative transition-colors cursor-pointer"
        style={{ background: checked ? '#74C0FC' : 'rgba(255,255,255,0.1)' }}>
        <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
          style={{ left: checked ? '22px' : '2px' }} />
      </button>
    </div>
  )
}

function SectionDivider({ title }: { title: string }) {
  return (
    <div className="pt-4 mt-2" style={{ borderTop: '1px solid var(--dark-border)' }}>
      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#A78BFA' }}>{title}</p>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Éditeurs dédiés par section
───────────────────────────────────────────── */

function HeroEditor({ content, onChange }: { content: SectionContent; onChange: (field: string, value: unknown) => void }) {
  const buttons = (content.buttons || []) as { label: string; href: string; variant: string }[]

  function updateButton(idx: number, field: string, value: string) {
    const updated = [...buttons]
    updated[idx] = { ...updated[idx], [field]: value }
    onChange('buttons', updated)
  }

  function addButton() {
    onChange('buttons', [...buttons, { label: 'Nouveau bouton', href: '/signup', variant: 'outline' }])
  }

  function removeButton(idx: number) {
    onChange('buttons', buttons.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-4">
      <SectionDivider title="Vidéo" />
      <FileUpload
        label="URL de la vidéo"
        accept="video/*"
        folder="landing"
        currentUrl={content.video_url || null}
        onUploaded={(url) => onChange('video_url', url)}
        onRemoved={() => onChange('video_url', '')}
      />
      <TextField label="Texte sous la vidéo" value={content.video_label || ''} onChange={(v) => onChange('video_label', v)} placeholder="Ex: Découvrir SOS Shine en 2 minutes" />

      <SectionDivider title="Boutons CTA" />
      <TextField label="Bouton principal — Texte" value={content.cta_primary_label || ''} onChange={(v) => onChange('cta_primary_label', v)} />
      <TextField label="Bouton principal — Lien" value={content.cta_primary_href || ''} onChange={(v) => onChange('cta_primary_href', v)} />
      <TextField label="Sous-texte CTA" value={content.cta_primary_subtext || ''} onChange={(v) => onChange('cta_primary_subtext', v)} />
      <TextField label="Bouton secondaire — Texte" value={content.cta_secondary_label || ''} onChange={(v) => onChange('cta_secondary_label', v)} />
      <TextField label="Bouton secondaire — Lien" value={content.cta_secondary_href || ''} onChange={(v) => onChange('cta_secondary_href', v)} />

      <SectionDivider title="Boutons personnalisés" />
      {buttons.map((btn, i) => (
        <div key={i} className="rounded-lg p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--dark-border)' }}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Bouton {i + 1}</p>
            <button type="button" onClick={() => removeButton(i)} className="text-xs px-2 py-1 rounded cursor-pointer" style={{ color: '#FF6B6B' }}>Supprimer</button>
          </div>
          <TextField label="Texte" value={btn.label} onChange={(v) => updateButton(i, 'label', v)} />
          <TextField label="Lien" value={btn.href} onChange={(v) => updateButton(i, 'href', v)} />
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Style</label>
            <select value={btn.variant} onChange={(e) => updateButton(i, 'variant', e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none cursor-pointer" style={inputStyle}>
              <option value="primary" style={{ background: '#362038', color: '#F5EDF0' }}>Principal (doré)</option>
              <option value="outline" style={{ background: '#362038', color: '#F5EDF0' }}>Contour</option>
            </select>
          </div>
        </div>
      ))}
      <button type="button" onClick={addButton}
        className="text-sm px-4 py-2 rounded-lg cursor-pointer w-full" style={{ color: '#A78BFA', border: '1px dashed #A78BFA' }}>
        + Ajouter un bouton
      </button>
    </div>
  )
}

function TickerEditor({ content, onChange, tickerNumber }: { content: SectionContent; onChange: (field: string, value: unknown) => void; tickerNumber: number }) {
  const items = (content.items || []) as string[]
  return (
    <div className="space-y-4">
      <TextAreaField
        label={`Mots du bandeau ${tickerNumber} (un par ligne)`}
        value={items.join('\n')}
        onChange={(v) => onChange('items', v.split('\n').filter((s: string) => s.trim() !== ''))}
        rows={8}
        placeholder="Abandon\nAnxiété\nBurn-out\nConfiance en soi\n..."
      />
      <TextField label="Vitesse de défilement (px/s)" value={String(content.speed || 35)} type="number"
        onChange={(v) => onChange('speed', parseInt(v) || 35)} />
    </div>
  )
}

function StatsEditor({ content, onChange }: { content: SectionContent; onChange: (field: string, value: unknown) => void }) {
  const items = (content.items || []) as { value: string; label: string }[]

  function updateItem(idx: number, field: string, value: string) {
    const updated = [...items]
    updated[idx] = { ...updated[idx], [field]: value }
    onChange('items', updated)
  }

  function addItem() {
    onChange('items', [...items, { value: '', label: '' }])
  }

  function removeItem(idx: number) {
    onChange('items', items.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="rounded-lg p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--dark-border)' }}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Chiffre {i + 1}</p>
            <button type="button" onClick={() => removeItem(i)} className="text-xs px-2 py-1 rounded cursor-pointer" style={{ color: '#FF6B6B' }}>Supprimer</button>
          </div>
          <TextField label="Valeur (ex: 200+, 24/7)" value={item.value} onChange={(v) => updateItem(i, 'value', v)} />
          <TextField label="Label (ex: PROTOCOLES)" value={item.label} onChange={(v) => updateItem(i, 'label', v)} />
        </div>
      ))}
      <button type="button" onClick={addItem}
        className="text-sm px-4 py-2 rounded-lg cursor-pointer w-full" style={{ color: '#A78BFA', border: '1px dashed #A78BFA' }}>
        + Ajouter un chiffre
      </button>
    </div>
  )
}

function CtaDarkEditor({ content, onChange }: { content: SectionContent; onChange: (field: string, value: unknown) => void }) {
  return (
    <div className="space-y-4">
      <TextField label="Titre" value={content.title || ''} onChange={(v) => onChange('title', v)} placeholder="Rejoignez-nous." />
      <TextAreaField label="Sous-titre" value={content.subtitle || ''} onChange={(v) => onChange('subtitle', v)}
        placeholder="Ne soyez plus jamais seul(e) face à vos tempêtes." rows={2} />
      <FileUpload
        label="Image de fond (optionnel)"
        accept="image/*"
        folder="landing"
        currentUrl={content.image_url || null}
        onUploaded={(url) => onChange('image_url', url)}
        onRemoved={() => onChange('image_url', '')}
      />
      <SectionDivider title="Bouton" />
      <TextField label="Texte du bouton" value={content.button_label || ''} onChange={(v) => onChange('button_label', v)} placeholder="Rejoindre SOS Shine" />
      <TextField label="Lien du bouton" value={content.button_href || ''} onChange={(v) => onChange('button_href', v)} placeholder="/signup" />
      <TextField label="Ligne de confiance" value={content.trust_line || ''} onChange={(v) => onChange('trust_line', v)}
        placeholder="9,90€/mois · Sans engagement · 7 jours gratuits · Tout inclus" />
    </div>
  )
}

function FooterEditor({ content, onChange }: { content: SectionContent; onChange: (field: string, value: unknown) => void }) {
  const links = (content.links || []) as { label: string; href: string }[]

  function updateLink(idx: number, field: string, value: string) {
    const updated = [...links]
    updated[idx] = { ...updated[idx], [field]: value }
    onChange('links', updated)
  }

  function addLink() {
    onChange('links', [...links, { label: '', href: '' }])
  }

  function removeLink(idx: number) {
    onChange('links', links.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-4">
      <SectionDivider title="Informations" />
      <TextField label="Nom du site" value={content.name || ''} onChange={(v) => onChange('name', v)} placeholder="SOS Shine®" />
      <TextField label="Année copyright" value={content.copyright_year || ''} onChange={(v) => onChange('copyright_year', v)} placeholder="2026" />
      <TextField label="Suffixe copyright" value={content.copyright_suffix || ''} onChange={(v) => onChange('copyright_suffix', v)} placeholder=" — Tous droits réservés" />

      <SectionDivider title="Liens du footer" />
      {links.map((link, i) => (
        <div key={i} className="rounded-lg p-3 space-y-2" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--dark-border)' }}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Lien {i + 1}</p>
            <button type="button" onClick={() => removeLink(i)} className="text-xs px-2 py-1 rounded cursor-pointer" style={{ color: '#FF6B6B' }}>Supprimer</button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <TextField label="Texte" value={link.label} onChange={(v) => updateLink(i, 'label', v)} />
            <TextField label="Lien" value={link.href} onChange={(v) => updateLink(i, 'href', v)} />
          </div>
        </div>
      ))}
      <button type="button" onClick={addLink}
        className="text-sm px-4 py-2 rounded-lg cursor-pointer w-full" style={{ color: '#A78BFA', border: '1px dashed #A78BFA' }}>
        + Ajouter un lien
      </button>

      <SectionDivider title="Réseaux sociaux" />
      <TextField label="YouTube" value={content.social_youtube || ''} onChange={(v) => onChange('social_youtube', v)} placeholder="https://www.youtube.com/..." />
      <TextField label="Instagram" value={content.social_instagram || ''} onChange={(v) => onChange('social_instagram', v)} placeholder="https://www.instagram.com/..." />
      <TextField label="Facebook" value={content.social_facebook || ''} onChange={(v) => onChange('social_facebook', v)} placeholder="https://www.facebook.com/..." />
    </div>
  )
}

function LegalMentionsEditor({ content, onChange }: { content: SectionContent; onChange: (field: string, value: unknown) => void }) {
  return (
    <div className="space-y-4">
      <TextField label="Titre de la page" value={content.title || ''} onChange={(v) => onChange('title', v)} placeholder="Mentions légales" />
      <HtmlEditor label="Contenu HTML" value={content.html_content || ''} onChange={(v) => onChange('html_content', v)} />
    </div>
  )
}

function LegalCgvEditor({ content, onChange }: { content: SectionContent; onChange: (field: string, value: unknown) => void }) {
  return (
    <div className="space-y-4">
      <TextField label="Titre de la page" value={content.title || ''} onChange={(v) => onChange('title', v)} placeholder="Conditions Générales de Vente" />
      <HtmlEditor label="Contenu HTML" value={content.html_content || ''} onChange={(v) => onChange('html_content', v)} />
    </div>
  )
}

function LegalPrivacyEditor({ content, onChange }: { content: SectionContent; onChange: (field: string, value: unknown) => void }) {
  return (
    <div className="space-y-4">
      <TextField label="Titre de la page" value={content.title || ''} onChange={(v) => onChange('title', v)} placeholder="Politique de confidentialité" />
      <HtmlEditor label="Contenu HTML" value={content.html_content || ''} onChange={(v) => onChange('html_content', v)} />
    </div>
  )
}

function LegalContactEditor({ content, onChange }: { content: SectionContent; onChange: (field: string, value: unknown) => void }) {
  return (
    <div className="space-y-4">
      <TextField label="Titre de la page" value={content.title || ''} onChange={(v) => onChange('title', v)} placeholder="Contact" />
      <TextField label="Email" value={content.email || ''} onChange={(v) => onChange('email', v)} placeholder="julialaureau@sosshine.com" />
      <TextField label="Téléphone" value={content.phone || ''} onChange={(v) => onChange('phone', v)} placeholder="+33 ..." />
      <TextField label="Adresse" value={content.address || ''} onChange={(v) => onChange('address', v)} />
      <HtmlEditor label="Contenu HTML additionnel" value={content.html_content || ''} onChange={(v) => onChange('html_content', v)} />
    </div>
  )
}

/* ─────────────────────────────────────────────
   Composant principal
───────────────────────────────────────────── */
export default function LandingJuliaPage() {
  const [sections, setSections] = useState<Record<string, { content: SectionContent; is_visible: boolean }>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSection, setSelectedSection] = useState<string>('hero')

  /* ── Chargement des sections depuis landing_sections ── */
  const loadSections = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data, error: fetchError } = await supabase
        .from('landing_sections')
        .select('section_key, content, is_visible')
        .in('section_key', JULIA_SECTION_KEYS as unknown as string[])

      if (fetchError) {
        setError(`Erreur de chargement: ${fetchError.message}`)
        setLoading(false)
        return
      }

      const map: Record<string, { content: SectionContent; is_visible: boolean }> = {}

      // Initialiser avec les defaults
      for (const key of JULIA_SECTION_KEYS) {
        const def = LANDING_DEFAULTS.find((d) => d.section_key === key)
        if (def) {
          map[key] = { content: { ...def.content }, is_visible: def.is_visible }
        }
      }

      // Écraser avec les données de la BDD
      if (data) {
        for (const row of data) {
          if (JULIA_SECTION_KEYS.includes(row.section_key as typeof JULIA_SECTION_KEYS[number])) {
            map[row.section_key] = {
              content: row.content as SectionContent,
              is_visible: row.is_visible as boolean,
            }
          }
        }
      }

      setSections(map)
    } catch {
      setError('Erreur de connexion à la base de données')
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadSections() }, [loadSections])

  /* ── Mise à jour du contenu ── */
  function updateContent(sectionKey: string, field: string, value: unknown) {
    setSections((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        content: { ...prev[sectionKey].content, [field]: value },
      },
    }))
    setSaved(false)
  }

  function toggleVisibility(sectionKey: string) {
    setSections((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        is_visible: !prev[sectionKey].is_visible,
      },
    }))
    setSaved(false)
  }

  /* ── Sauvegarde ── */
  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const now = new Date().toISOString()

      for (const key of JULIA_SECTION_KEYS) {
        const sec = sections[key]
        if (!sec) continue

        const def = LANDING_DEFAULTS.find((d) => d.section_key === key)

        // Pour hero, on ne sauvegarde que les champs vidéo/CTA, on merge avec le reste
        let contentToSave = sec.content
        if (key === 'hero') {
          // Charger le contenu hero actuel complet pour ne pas écraser les autres champs
          const { data: currentHero } = await supabase
            .from('landing_sections')
            .select('content')
            .eq('section_key', 'hero')
            .maybeSingle()

          const baseContent = currentHero?.content || def?.content || {}
          contentToSave = {
            ...baseContent,
            // Écraser uniquement les champs vidéo et CTA
            video_url: sec.content.video_url,
            video_label: sec.content.video_label,
            cta_primary_label: sec.content.cta_primary_label,
            cta_primary_href: sec.content.cta_primary_href,
            cta_primary_subtext: sec.content.cta_primary_subtext,
            cta_secondary_label: sec.content.cta_secondary_label,
            cta_secondary_href: sec.content.cta_secondary_href,
            buttons: sec.content.buttons,
          }
        }

        const { error: upsertError } = await supabase
          .from('landing_sections')
          .upsert({
            section_key: key,
            label: def?.label || SECTION_LABELS[key]?.label || key,
            position: def?.position ?? 0,
            is_visible: sec.is_visible,
            content: contentToSave,
            styles: def?.styles || {},
            updated_by: user?.id || null,
            updated_at: now,
          }, { onConflict: 'section_key' })

        if (upsertError) {
          setError(`Erreur sur ${SECTION_LABELS[key]?.label || key}: ${upsertError.message}`)
          setSaving(false)
          return
        }
      }

      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 4000)
    } catch (err) {
      setError(`Erreur: ${err instanceof Error ? err.message : 'Veuillez réessayer'}`)
      setSaving(false)
    }
  }

  /* ── Rendu de l'éditeur de la section sélectionnée ── */
  function renderEditor(key: string) {
    const sec = sections[key]
    if (!sec) return null

    const onChange = (field: string, value: unknown) => updateContent(key, field, value)

    switch (key) {
      case 'hero':
        return <HeroEditor content={sec.content} onChange={onChange} />
      case 'ticker_1':
        return <TickerEditor content={sec.content} onChange={onChange} tickerNumber={1} />
      case 'ticker_2':
        return <TickerEditor content={sec.content} onChange={onChange} tickerNumber={2} />
      case 'stats':
        return <StatsEditor content={sec.content} onChange={onChange} />
      case 'cta_dark':
        return <CtaDarkEditor content={sec.content} onChange={onChange} />
      case 'footer':
        return <FooterEditor content={sec.content} onChange={onChange} />
      case 'legal_mentions':
        return <LegalMentionsEditor content={sec.content} onChange={onChange} />
      case 'legal_cgv':
        return <LegalCgvEditor content={sec.content} onChange={onChange} />
      case 'legal_privacy':
        return <LegalPrivacyEditor content={sec.content} onChange={onChange} />
      case 'legal_contact':
        return <LegalContactEditor content={sec.content} onChange={onChange} />
      default:
        return null
    }
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#A78BFA] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  /* ── Rendu principal ── */
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* En-tête sticky */}
      <div className="flex items-center justify-between sticky top-0 z-20 py-4 -mx-4 px-4" style={{ background: 'var(--dark)' }}>
        <div>
          <h1 className="font-display text-3xl font-semibold" style={{ color: '#A78BFA' }}>Landing Page Julia</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Modifiez la vidéo, les CTAs, bandeaux, footer et pages légales
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm font-medium" style={{ color: '#55EFC4' }}>Sauvegardé !</span>}
          <button onClick={handleSave} disabled={saving}
            className="px-6 py-3 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-50"
            style={{ background: '#A78BFA', color: '#fff' }}>
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="rounded-xl px-4 py-3 text-sm"
          style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.25)', color: '#FF6B6B' }}>
          {error}
        </div>
      )}

      {/* Liste des sections + éditeur */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
        {/* Sidebar — liste des sections */}
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--dark-border)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Sections modifiables
            </p>
          </div>
          <div>
            {JULIA_SECTION_KEYS.map((key) => {
              const info = SECTION_LABELS[key]
              const sec = sections[key]
              const isSelected = key === selectedSection
              if (!info) return null
              return (
                <button key={key} type="button"
                  onClick={() => setSelectedSection(key)}
                  className="w-full text-left px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors"
                  style={{
                    background: isSelected ? 'rgba(167,139,250,0.1)' : 'transparent',
                    borderBottom: '1px solid var(--dark-border)',
                    borderLeft: isSelected ? '3px solid #A78BFA' : '3px solid transparent',
                  }}>
                  <span className="text-lg flex-shrink-0">{info.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: isSelected ? '#A78BFA' : 'var(--text-primary)' }}>
                      {info.label}
                    </p>
                    <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
                      {info.description}
                    </p>
                  </div>
                  {sec && (
                    <span className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: sec.is_visible ? '#55EFC4' : 'rgba(255,255,255,0.15)' }}
                      title={sec.is_visible ? 'Visible' : 'Masquée'} />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Éditeur de la section sélectionnée */}
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
          {(() => {
            const info = SECTION_LABELS[selectedSection]
            const sec = sections[selectedSection]
            if (!info || !sec) return null
            return (
              <>
                <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--dark-border)' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{info.icon}</span>
                    <div>
                      <h2 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>{info.label}</h2>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{info.description}</p>
                    </div>
                  </div>
                  <ToggleField label={sec.is_visible ? 'Visible' : 'Masquée'} checked={sec.is_visible} onChange={() => toggleVisibility(selectedSection)} />
                </div>
                <div className="px-5 pb-5 pt-4 space-y-4">
                  {renderEditor(selectedSection)}
                </div>
              </>
            )
          })()}
        </div>
      </div>

      {/* Bouton sauvegarder en bas */}
      <div className="flex justify-end gap-3 pb-8">
        <button onClick={handleSave} disabled={saving}
          className="px-6 py-3 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-50"
          style={{ background: '#A78BFA', color: '#fff' }}>
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>
    </div>
  )
}
