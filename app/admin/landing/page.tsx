'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LANDING_DEFAULTS } from '@/lib/landing-defaults'
import type { LandingSectionRow } from '@/lib/landing-defaults'
import FileUpload from '@/components/FileUpload'
import LandingStyleToolbar from '@/components/LandingStyleToolbar'
import LandingPreview from '@/components/LandingPreview'

/* ── Select options ── */
const fontOpts = [
  { label: 'Cormorant Garamond (Elegant)', value: 'Cormorant Garamond' },
  { label: 'DM Sans (Moderne)', value: 'DM Sans' },
  { label: 'Georgia (Classique)', value: 'Georgia' },
  { label: 'Arial (Simple)', value: 'Arial' },
  { label: 'Times New Roman', value: 'Times New Roman' },
]
const alignOpts = [
  { label: 'Gauche', value: 'left' },
  { label: 'Centre', value: 'center' },
  { label: 'Droite', value: 'right' },
]
const sizeOpts = [
  { label: 'Petit (30px)', value: 'sm' },
  { label: 'Moyen (36px)', value: 'md' },
  { label: 'Grand (48px)', value: 'lg' },
  { label: 'Très grand (60px)', value: 'xl' },
  { label: 'Immense (72px)', value: '2xl' },
]
const variantOpts = [
  { label: 'Primary', value: 'primary' },
  { label: 'Outline', value: 'outline' },
]

/* ── Shared styles ── */
const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid var(--dark-border)',
  color: 'var(--text-primary)',
}
const selectBgImage = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238E6E7E' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`

/* ── Reusable field components ── */
function TextField({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <label className="text-sm sm:w-52 flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="flex-1 rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} />
    </div>
  )
}

function TextAreaField({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)}
        rows={rows} className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-y" style={inputStyle} />
    </div>
  )
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <label className="text-sm sm:w-52 flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      <div className="flex items-center gap-2 flex-1">
        <input type="color" value={value || '#000000'} onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg cursor-pointer border-0" style={{ background: 'transparent' }} />
        <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)}
          placeholder="Défaut" className="flex-1 rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} />
      </div>
    </div>
  )
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <label className="text-sm sm:w-52 flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      <select value={value || ''} onChange={(e) => onChange(e.target.value)}
        className="flex-1 rounded-lg px-3 py-2.5 text-sm outline-none cursor-pointer appearance-none"
        style={{ ...inputStyle, backgroundImage: selectBgImage, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}>
        {options.map((o) => <option key={o.value} value={o.value} style={{ background: '#362038', color: '#F5EDF0' }}>{o.label}</option>)}
      </select>
    </div>
  )
}

function CheckboxField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      <button type="button" onClick={() => onChange(!checked)}
        className="w-10 h-5 rounded-full relative transition-colors cursor-pointer"
        style={{ background: checked ? '#74C0FC' : 'rgba(255,255,255,0.1)' }}>
        <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
          style={{ left: checked ? '22px' : '2px' }} />
      </button>
    </div>
  )
}

function Separator({ label }: { label: string }) {
  return (
    <div className="pt-3 mt-1" style={{ borderTop: '1px solid var(--dark-border)' }}>
      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</p>
    </div>
  )
}

/* ── Main component ── */
export default function LandingAdminPage() {
  const [sections, setSections] = useState<LandingSectionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [openPanels, setOpenPanels] = useState<Record<string, boolean>>({})
  const [selectedSection, setSelectedSection] = useState<string>('')
  const didDragRef = useRef(false)

  /* ── Load sections ── */
  const loadSections = useCallback(async () => {
    const supabase = createClient()
    const { data, error: fetchErr } = await supabase
      .from('landing_sections')
      .select('*')
      .order('position', { ascending: true })

    if (fetchErr) { setError(fetchErr.message); setLoading(false); return }

    if (!data || data.length === 0) {
      // Auto-seed defaults
      const { data: { user } } = await supabase.auth.getUser()
      const now = new Date().toISOString()
      const rows = LANDING_DEFAULTS.map((d) => ({
        section_key: d.section_key,
        label: d.label,
        position: d.position,
        is_visible: d.is_visible,
        content: d.content,
        styles: d.styles,
        updated_by: user?.id || null,
        updated_at: now,
      }))
      const { error: insertErr } = await supabase.from('landing_sections').insert(rows)
      if (insertErr) { setError(insertErr.message); setLoading(false); return }
      // Reload after seed
      const { data: seeded } = await supabase.from('landing_sections').select('*').order('position', { ascending: true })
      if (seeded) {
        const rows = seeded as LandingSectionRow[]
        setSections(rows)
        if (rows.length > 0) { setOpenPanels({ [rows[0].section_key]: true }); setSelectedSection(rows[0].section_key) }
      }
    } else {
      const rows = data as LandingSectionRow[]
      const existingKeys = new Set(rows.map((r) => r.section_key))
      const missingDefaults = LANDING_DEFAULTS.filter((d) => !existingKeys.has(d.section_key))
      if (missingDefaults.length > 0) {
        const { data: { user } } = await supabase.auth.getUser()
        const now = new Date().toISOString()
        const maxPos = Math.max(...rows.map((r) => r.position), -1)
        const newRows = missingDefaults.map((d, i) => ({
          section_key: d.section_key,
          label: d.label,
          position: maxPos + 1 + i,
          is_visible: d.is_visible,
          content: d.content,
          styles: d.styles,
          updated_by: user?.id || null,
          updated_at: now,
        }))
        const { error: insertErr } = await supabase.from('landing_sections').insert(newRows)
        if (insertErr) {
          console.error('Auto-seed missing sections failed:', insertErr.message)
          // Fallback: try inserting one by one
          for (const row of newRows) {
            await supabase.from('landing_sections').insert(row)
          }
        }
        const { data: refreshed } = await supabase.from('landing_sections').select('*').order('position', { ascending: true })
        if (refreshed) {
          const allRows = refreshed as LandingSectionRow[]
          setSections(allRows)
          if (allRows.length > 0) { setOpenPanels({ [allRows[0].section_key]: true }); setSelectedSection(allRows[0].section_key) }
          setLoading(false)
          return
        }
      }
      setSections(rows)
      if (rows.length > 0) { setOpenPanels({ [rows[0].section_key]: true }); setSelectedSection(rows[0].section_key) }
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadSections() }, [loadSections])

  /* ── Helpers to update state ── */
  function updateContent(sectionKey: string, field: string, value: unknown) {
    setSections((prev) => prev.map((s) =>
      s.section_key === sectionKey ? { ...s, content: { ...s.content, [field]: value } } : s
    ))
    setSaved(false)
  }

  function updateStyle(sectionKey: string, field: string, value: string) {
    setSections((prev) => prev.map((s) =>
      s.section_key === sectionKey ? { ...s, styles: { ...s.styles, [field]: value } } : s
    ))
    setSaved(false)
  }

  function toggleVisibility(sectionKey: string) {
    setSections((prev) => prev.map((s) =>
      s.section_key === sectionKey ? { ...s, is_visible: !s.is_visible } : s
    ))
    setSaved(false)
  }

  function togglePanel(sectionKey: string) {
    setOpenPanels((prev) => ({ ...prev, [sectionKey]: !prev[sectionKey] }))
  }

  function moveSection(index: number, direction: -1 | 1) {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= sections.length) return
    setSections((prev) => {
      const next = [...prev]
      const tmp = next[index]
      next[index] = next[targetIndex]
      next[targetIndex] = tmp
      // Update positions
      return next.map((s, i) => ({ ...s, position: i }))
    })
    setSaved(false)
  }

  /* ── Update an item in an array inside content ── */
  function updateArrayItem(sectionKey: string, field: string, index: number, itemField: string, value: unknown) {
    setSections((prev) => prev.map((s) => {
      if (s.section_key !== sectionKey) return s
      const arr = [...(s.content[field] || [])]
      arr[index] = { ...arr[index], [itemField]: value }
      return { ...s, content: { ...s.content, [field]: arr } }
    }))
    setSaved(false)
  }

  function addArrayItem(sectionKey: string, field: string, template: Record<string, unknown>) {
    setSections((prev) => prev.map((s) => {
      if (s.section_key !== sectionKey) return s
      const arr = [...(s.content[field] || []), template]
      return { ...s, content: { ...s.content, [field]: arr } }
    }))
    setSaved(false)
  }

  function removeArrayItem(sectionKey: string, field: string, index: number) {
    setSections((prev) => prev.map((s) => {
      if (s.section_key !== sectionKey) return s
      const arr = [...(s.content[field] || [])]
      arr.splice(index, 1)
      return { ...s, content: { ...s.content, [field]: arr } }
    }))
    setSaved(false)
  }

  /* ── Built-in section keys (can be hidden or deleted & re-seeded from defaults) ── */
  const BUILTIN_KEYS = new Set(LANDING_DEFAULTS.map((d) => d.section_key))

  /* ── Section type menu ── */
  const [showSectionTypeMenu, setShowSectionTypeMenu] = useState(false)

  const CUSTOM_SECTION_TYPES = [
    { type: 'text', label: 'Section Texte', desc: 'Titre, description, image, bouton', icon: 'T' },
    { type: 'cards', label: 'Section Cartes', desc: 'Titre + liste de cartes', icon: '▦' },
    { type: 'cta', label: 'Section CTA', desc: 'Appel à l\'action avec bouton', icon: '→' },
    { type: 'gallery', label: 'Section Galerie', desc: 'Titre + grille d\'images', icon: '▣' },
    { type: 'html', label: 'Section HTML', desc: 'Contenu HTML libre', icon: '</>' },
  ]

  /* ── Add a custom section with a given type ── */
  function addCustomSection(sectionType: string = 'html') {
    const id = `custom_${Date.now()}`
    let label = 'Nouvelle section'
    let content: Record<string, unknown> = {}

    switch (sectionType) {
      case 'text':
        label = 'Nouvelle section Texte'
        content = {
          section_type: 'text',
          label: '',
          title: '',
          subtitle: '',
          description: '',
          image_url: '',
          video_url: '',
          button_label: '',
          button_href: '',
        }
        break
      case 'cards':
        label = 'Nouvelle section Cartes'
        content = {
          section_type: 'cards',
          label: '',
          title: '',
          description: '',
          cards: [
            { title: '', description: '', icon: '', image_url: '' },
          ],
        }
        break
      case 'cta':
        label = 'Nouvelle section CTA'
        content = {
          section_type: 'cta',
          title: '',
          description: '',
          button_label: '',
          button_href: '',
          image_url: '',
        }
        break
      case 'gallery':
        label = 'Nouvelle section Galerie'
        content = {
          section_type: 'gallery',
          label: '',
          title: '',
          description: '',
          images: [],
        }
        break
      case 'html':
      default:
        label = 'Nouvelle section HTML'
        content = { section_type: 'html', title: '', html_content: '', bg_color: '', padding: '4rem 1.5rem' }
        break
    }

    const newSec: LandingSectionRow = {
      id: '',
      section_key: id,
      label,
      position: sections.length,
      is_visible: true,
      content,
      styles: sectionType !== 'html' ? {
        title_font: 'Cormorant Garamond',
        title_size: 'lg',
        title_align: 'center',
      } : {},
      updated_by: null,
      updated_at: new Date().toISOString(),
    }
    setSections((prev) => [...prev, newSec])
    setOpenPanels((prev) => ({ ...prev, [id]: true }))
    setSelectedSection(id)
    setShowSectionTypeMenu(false)
    setSaved(false)
  }

  /* ── Delete any section (built-in sections can be re-added from defaults) ── */
  async function deleteSection(sectionKey: string) {
    const isBuiltin = BUILTIN_KEYS.has(sectionKey)
    const msg = isBuiltin
      ? 'Supprimer cette section ? Elle pourra être recréée depuis les valeurs par défaut en actualisant la page.'
      : 'Supprimer cette section ?'
    if (!confirm(msg)) return
    const supabase = createClient()
    await supabase.from('landing_sections').delete().eq('section_key', sectionKey)
    setSections((prev) => prev.filter((s) => s.section_key !== sectionKey))
    setSaved(false)
  }

  /* ── Save ── */
  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const now = new Date().toISOString()
      const userId = user?.id || null

      const rows = sections.map((s) => ({
        section_key: s.section_key,
        label: s.label,
        position: s.position,
        is_visible: s.is_visible,
        content: s.content,
        styles: s.styles,
        updated_by: userId,
        updated_at: now,
      }))

      const { error: upsertErr } = await supabase
        .from('landing_sections')
        .upsert(rows, { onConflict: 'section_key' })

      if (upsertErr) {
        // Fallback: individual update/insert per row
        for (const row of rows) {
          const { data: existing } = await supabase
            .from('landing_sections')
            .select('id')
            .eq('section_key', row.section_key)
            .maybeSingle()
          if (existing) {
            const { error: e } = await supabase
              .from('landing_sections')
              .update(row)
              .eq('section_key', row.section_key)
            if (e) { setError(`Erreur ${row.section_key}: ${e.message}`); setSaving(false); return }
          } else {
            const { error: e } = await supabase
              .from('landing_sections')
              .insert(row)
            if (e) { setError(`Erreur ${row.section_key}: ${e.message}`); setSaving(false); return }
          }
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

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#74C0FC] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  /* ── Render section-specific content fields ── */
  function renderContentFields(sec: LandingSectionRow) {
    const c = sec.content
    const key = sec.section_key

    switch (key) {
      /* ────────────── _global ────────────── */
      case '_global':
        return (
          <>
            <TextField label="Nom du site" value={c.site_name || ''} onChange={(v) => updateContent(key, 'site_name', v)} />
            <FileUpload label="Logo du site" accept="image/*" folder="site"
              currentUrl={c.logo_url || null} hint="PNG ou SVG, 512x512px"
              onUploaded={(url) => updateContent(key, 'logo_url', url)}
              onRemoved={() => updateContent(key, 'logo_url', '')} />
            <TextField label="Jours d'essai gratuit" value={String(c.trial_days ?? '')} type="number"
              onChange={(v) => updateContent(key, 'trial_days', parseInt(v) || 0)} />
          </>
        )

      /* ────────────── stats ────────────── */
      case 'stats':
        return (
          <>
            <Separator label="Chiffres cles" />
            {(c.items || []).map((item: { value: string; label: string }, i: number) => (
              <div key={i} className="rounded-lg p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--dark-border)' }}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Chiffre {i + 1}</p>
                  <button type="button" onClick={() => removeArrayItem(key, 'items', i)}
                    className="text-xs px-2 py-1 rounded cursor-pointer" style={{ color: '#FF6B6B' }}>Supprimer</button>
                </div>
                <TextField label="Valeur (ex: 200+)" value={item.value || ''} onChange={(v) => updateArrayItem(key, 'items', i, 'value', v)} />
                <TextField label="Label" value={item.label || ''} onChange={(v) => updateArrayItem(key, 'items', i, 'label', v)} />
              </div>
            ))}
            <button type="button" onClick={() => addArrayItem(key, 'items', { value: '', label: '' })}
              className="text-sm px-4 py-2 rounded-lg cursor-pointer" style={{ color: '#74C0FC', border: '1px dashed #74C0FC' }}>
              + Ajouter un chiffre
            </button>
          </>
        )

      /* ────────────── signature_cta ────────────── */
      case 'signature_cta':
        return (
          <>
            <TextField label="Label de section" value={c.label || ''} onChange={(v) => updateContent(key, 'label', v)} />
            <TextField label="Titre" value={c.title || ''} onChange={(v) => updateContent(key, 'title', v)} />
            <TextField label="Texte en surbrillance" value={c.title_highlight || ''} onChange={(v) => updateContent(key, 'title_highlight', v)} />
            <TextAreaField label="Description" value={c.description || ''} onChange={(v) => updateContent(key, 'description', v)} />
            <TextField label="Libelle du bouton" value={c.button_label || ''} onChange={(v) => updateContent(key, 'button_label', v)} />
            <TextField label="Lien du bouton" value={c.button_href || ''} onChange={(v) => updateContent(key, 'button_href', v)} />
          </>
        )

      /* ────────────── hero ────────────── */
      case 'hero':
        return (
          <>
            <TextField label="Sur-titre (micro-copy)" value={c.surtitle || ''} onChange={(v) => updateContent(key, 'surtitle', v)} />
            <TextAreaField label="Titre principal" value={c.title || ''} onChange={(v) => updateContent(key, 'title', v)} />
            <TextAreaField label="Sous-titre" value={c.subtitle || ''} onChange={(v) => updateContent(key, 'subtitle', v)} />
            <FileUpload label="Video d'introduction" accept="video/*" folder="site"
              currentUrl={c.video_url || null} hint="MP4 recommande"
              onUploaded={(url) => updateContent(key, 'video_url', url)}
              onRemoved={() => updateContent(key, 'video_url', '')} />
            <TextField label="Label de la video (placeholder)" value={c.video_label || ''} onChange={(v) => updateContent(key, 'video_label', v)} />
            <FileUpload label="Image hero" accept="image/*" folder="site"
              currentUrl={c.image_url || null}
              onUploaded={(url) => updateContent(key, 'image_url', url)}
              onRemoved={() => updateContent(key, 'image_url', '')} />
            <Separator label="CTA Principal (Signature Emotionnelle)" />
            <TextField label="Libelle du bouton principal" value={c.cta_primary_label || ''} onChange={(v) => updateContent(key, 'cta_primary_label', v)} />
            <TextField label="Lien du bouton principal" value={c.cta_primary_href || ''} onChange={(v) => updateContent(key, 'cta_primary_href', v)} />
            <TextField label="Sous-texte du bouton principal" value={c.cta_primary_subtext || ''} onChange={(v) => updateContent(key, 'cta_primary_subtext', v)} />
            <Separator label="CTA Secondaire" />
            <TextField label="Libelle du bouton secondaire" value={c.cta_secondary_label || ''} onChange={(v) => updateContent(key, 'cta_secondary_label', v)} />
            <TextField label="Lien du bouton secondaire" value={c.cta_secondary_href || ''} onChange={(v) => updateContent(key, 'cta_secondary_href', v)} />
            <Separator label="Elements de reassurance" />
            <TextAreaField label="Elements de confiance (un par ligne)" rows={4}
              value={Array.isArray(c.trust_items) ? c.trust_items.join('\n') : ''}
              onChange={(v) => updateContent(key, 'trust_items', v.split('\n').filter((line: string) => line.trim() !== ''))} />
          </>
        )

      /* ────────────── probleme ────────────── */
      case 'probleme':
        return (
          <>
            <TextField label="Label de section" value={c.label || ''} onChange={(v) => updateContent(key, 'label', v)} />
            <TextAreaField label="Titre (agitation)" value={c.title || ''} onChange={(v) => updateContent(key, 'title', v)} />
            <TextAreaField label="Description (corps du texte)" value={c.description || ''} rows={5} onChange={(v) => updateContent(key, 'description', v)} />
            <TextAreaField label="Phrase de conclusion (en or)" value={c.closing || ''} onChange={(v) => updateContent(key, 'closing', v)} />
            <TextField label="Texte du lien CTA" value={c.cta_text || ''} onChange={(v) => updateContent(key, 'cta_text', v)} />
            <TextField label="Lien CTA (href)" value={c.cta_href || ''} onChange={(v) => updateContent(key, 'cta_href', v)} />
            <Separator label="Symptomes affiches" />
            {(c.symptoms || []).map((symptom: { icon: string; label: string }, i: number) => (
              <div key={i} className="rounded-lg p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--dark-border)' }}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Symptome {i + 1}</p>
                  <button type="button" onClick={() => removeArrayItem(key, 'symptoms', i)}
                    className="text-xs px-2 py-1 rounded cursor-pointer" style={{ color: '#FF6B6B' }}>Supprimer</button>
                </div>
                <TextField label="Label" value={symptom.label || ''} onChange={(v) => updateArrayItem(key, 'symptoms', i, 'label', v)} />
                <SelectField label="Icone" value={symptom.icon || 'anxiety'} options={[
                  { label: 'Anxiete', value: 'anxiety' },
                  { label: 'Coeur', value: 'heart' },
                  { label: 'Deuil', value: 'grief' },
                  { label: 'Burn-out', value: 'burnout' },
                  { label: 'Dependance', value: 'dependency' },
                  { label: 'Trauma', value: 'trauma' },
                ]} onChange={(v) => updateArrayItem(key, 'symptoms', i, 'icon', v)} />
              </div>
            ))}
            <button type="button" onClick={() => addArrayItem(key, 'symptoms', { icon: 'anxiety', label: '' })}
              className="text-sm px-4 py-2 rounded-lg cursor-pointer" style={{ color: '#74C0FC', border: '1px dashed #74C0FC' }}>
              + Ajouter un symptome
            </button>
          </>
        )

      /* ────────────── principe ────────────── */
      case 'principe':
        return (
          <>
            <TextField label="Label de section" value={c.label || ''} onChange={(v) => updateContent(key, 'label', v)} />
            <TextAreaField label="Titre" value={c.title || ''} onChange={(v) => updateContent(key, 'title', v)} />
            <TextAreaField label="Description" value={c.description || ''} onChange={(v) => updateContent(key, 'description', v)} />
            <FileUpload label="Image de section" accept="image/*" folder="site"
              currentUrl={c.image_url || null}
              onUploaded={(url) => updateContent(key, 'image_url', url)}
              onRemoved={() => updateContent(key, 'image_url', '')} />
            <FileUpload label="Video de section" accept="video/*" folder="site"
              currentUrl={c.video_url || null}
              onUploaded={(url) => updateContent(key, 'video_url', url)}
              onRemoved={() => updateContent(key, 'video_url', '')} />
          </>
        )

      /* ────────────── steps ────────────── */
      case 'steps':
        return (
          <>
            <TextField label="Label de section" value={c.label || ''} onChange={(v) => updateContent(key, 'label', v)} />
            <TextField label="Titre de section" value={c.title || ''} onChange={(v) => updateContent(key, 'title', v)} />
            <Separator label="Etapes" />
            {(c.items || []).map((item: { num: string; title: string; subtitle?: string; description: string; color: string }, i: number) => (
              <div key={i} className="rounded-lg p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--dark-border)' }}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Etape {String(i + 1).padStart(2, '0')}</p>
                  <button type="button" onClick={() => removeArrayItem(key, 'items', i)}
                    className="text-xs px-2 py-1 rounded cursor-pointer" style={{ color: '#FF6B6B' }}>Supprimer</button>
                </div>
                <TextField label="Numero" value={item.num || ''} onChange={(v) => updateArrayItem(key, 'items', i, 'num', v)} />
                <TextField label="Titre" value={item.title || ''} onChange={(v) => updateArrayItem(key, 'items', i, 'title', v)} />
                <TextField label="Sous-titre (ex: Le Diagnostic)" value={item.subtitle || ''} onChange={(v) => updateArrayItem(key, 'items', i, 'subtitle', v)} />
                <TextAreaField label="Description" value={item.description || ''} onChange={(v) => updateArrayItem(key, 'items', i, 'description', v)} />
                <ColorField label="Couleur" value={item.color || ''} onChange={(v) => updateArrayItem(key, 'items', i, 'color', v)} />
              </div>
            ))}
            <button type="button" onClick={() => addArrayItem(key, 'items', { num: String(c.items?.length + 1 || 1).padStart(2, '0'), title: '', description: '', color: '#74C0FC' })}
              className="text-sm px-4 py-2 rounded-lg cursor-pointer" style={{ color: '#74C0FC', border: '1px dashed #74C0FC' }}>
              + Ajouter une etape
            </button>
          </>
        )

      /* ────────────── encyclopedie ────────────── */
      case 'encyclopedie':
        return (
          <>
            <TextField label="Label de section" value={c.label || ''} onChange={(v) => updateContent(key, 'label', v)} />
            <TextField label="Titre de section" value={c.title || ''} onChange={(v) => updateContent(key, 'title', v)} />
            <TextAreaField label="Description" value={c.description || ''} onChange={(v) => updateContent(key, 'description', v)} />
            <FileUpload label="Image de section" accept="image/*" folder="site"
              currentUrl={c.image_url || null}
              onUploaded={(url) => updateContent(key, 'image_url', url)}
              onRemoved={() => updateContent(key, 'image_url', '')} />
            <TextAreaField label="Elements (un par ligne)" rows={6}
              value={Array.isArray(c.items) ? c.items.join('\n') : ''}
              onChange={(v) => updateContent(key, 'items', v.split('\n').filter((line: string) => line.trim() !== ''))} />
          </>
        )

      /* ────────────── produit ────────────── */
      case 'produit':
        return (
          <>
            <TextField label="Label de section" value={c.label || ''} onChange={(v) => updateContent(key, 'label', v)} />
            <TextAreaField label="Titre" value={c.title || ''} onChange={(v) => updateContent(key, 'title', v)} />
            <FileUpload label="Image mockup de la plateforme" accept="image/*" folder="site"
              currentUrl={c.mockup_image || null} hint="Screenshot ou mockup de la plateforme"
              onUploaded={(url) => updateContent(key, 'mockup_image', url)}
              onRemoved={() => updateContent(key, 'mockup_image', '')} />
            <Separator label="Checklist (elements recus des J1)" />
            <TextAreaField label="Elements (un par ligne)" rows={8}
              value={Array.isArray(c.checklist) ? c.checklist.join('\n') : ''}
              onChange={(v) => updateContent(key, 'checklist', v.split('\n').filter((line: string) => line.trim() !== ''))} />
            <Separator label="Fonctionnalites" />
            {(c.features || []).map((feature: { icon: string; title: string; description: string }, i: number) => (
              <div key={i} className="rounded-lg p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--dark-border)' }}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Feature {i + 1}</p>
                  <button type="button" onClick={() => removeArrayItem(key, 'features', i)}
                    className="text-xs px-2 py-1 rounded cursor-pointer" style={{ color: '#FF6B6B' }}>Supprimer</button>
                </div>
                <TextField label="Titre" value={feature.title || ''} onChange={(v) => updateArrayItem(key, 'features', i, 'title', v)} />
                <TextAreaField label="Description" value={feature.description || ''} onChange={(v) => updateArrayItem(key, 'features', i, 'description', v)} />
                <SelectField label="Icone" value={feature.icon || 'encyclopedia'} options={[
                  { label: 'Encyclopédie', value: 'encyclopedia' },
                  { label: 'Communauté', value: 'community' },
                  { label: 'Événements', value: 'events' },
                  { label: 'Media', value: 'media' },
                ]} onChange={(v) => updateArrayItem(key, 'features', i, 'icon', v)} />
              </div>
            ))}
            <button type="button" onClick={() => addArrayItem(key, 'features', { icon: 'encyclopedia', title: '', description: '' })}
              className="text-sm px-4 py-2 rounded-lg cursor-pointer" style={{ color: '#74C0FC', border: '1px dashed #74C0FC' }}>
              + Ajouter une fonctionnalite
            </button>
            <Separator label="Bouton CTA" />
            <TextField label="Libelle du bouton" value={c.cta_label || ''} onChange={(v) => updateContent(key, 'cta_label', v)} />
            <TextField label="Lien du bouton" value={c.cta_href || ''} onChange={(v) => updateContent(key, 'cta_href', v)} />
          </>
        )

      /* ────────────── communaute ────────────── */
      case 'communaute':
        return (
          <>
            <TextField label="Label de section" value={c.label || ''} onChange={(v) => updateContent(key, 'label', v)} />
            <TextAreaField label="Titre" value={c.title || ''} onChange={(v) => updateContent(key, 'title', v)} />
            <TextAreaField label="Description" value={c.description || ''} onChange={(v) => updateContent(key, 'description', v)} />
            <FileUpload label="Image de section" accept="image/*" folder="site"
              currentUrl={c.image_url || null}
              onUploaded={(url) => updateContent(key, 'image_url', url)}
              onRemoved={() => updateContent(key, 'image_url', '')} />
            <Separator label="Blocs" />
            {(c.blocks || []).map((block: { title: string; description: string }, i: number) => (
              <div key={i} className="rounded-lg p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--dark-border)' }}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Bloc {i + 1}</p>
                  <button type="button" onClick={() => removeArrayItem(key, 'blocks', i)}
                    className="text-xs px-2 py-1 rounded cursor-pointer" style={{ color: '#FF6B6B' }}>Supprimer</button>
                </div>
                <TextField label="Titre" value={block.title || ''} onChange={(v) => updateArrayItem(key, 'blocks', i, 'title', v)} />
                <TextAreaField label="Description" value={block.description || ''} onChange={(v) => updateArrayItem(key, 'blocks', i, 'description', v)} />
              </div>
            ))}
            <button type="button" onClick={() => addArrayItem(key, 'blocks', { title: '', description: '' })}
              className="text-sm px-4 py-2 rounded-lg cursor-pointer" style={{ color: '#74C0FC', border: '1px dashed #74C0FC' }}>
              + Ajouter un bloc
            </button>
          </>
        )

      /* ────────────── temoignages ────────────── */
      case 'temoignages':
        return (
          <>
            <TextField label="Label de section" value={c.label || ''} onChange={(v) => updateContent(key, 'label', v)} />
            <TextAreaField label="Titre de section" value={c.title || ''} onChange={(v) => updateContent(key, 'title', v)} />
            <TextField label="Badge vérifié" value={c.verified_badge || ''} onChange={(v) => updateContent(key, 'verified_badge', v)} />
            <Separator label="Témoignages" />
            {(c.items || []).map((item: { quote: string; name: string; city: string }, i: number) => (
              <div key={i} className="rounded-lg p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--dark-border)' }}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Témoignage {i + 1}</p>
                  <button type="button" onClick={() => removeArrayItem(key, 'items', i)}
                    className="text-xs px-2 py-1 rounded cursor-pointer" style={{ color: '#FF6B6B' }}>Supprimer</button>
                </div>
                <TextAreaField label="Citation" value={item.quote || ''} onChange={(v) => updateArrayItem(key, 'items', i, 'quote', v)} />
                <TextField label="Nom" value={item.name || ''} onChange={(v) => updateArrayItem(key, 'items', i, 'name', v)} />
                <TextField label="Ville" value={item.city || ''} onChange={(v) => updateArrayItem(key, 'items', i, 'city', v)} />
              </div>
            ))}
            <button type="button" onClick={() => addArrayItem(key, 'items', { quote: '', name: '', city: '' })}
              className="text-sm px-4 py-2 rounded-lg cursor-pointer" style={{ color: '#74C0FC', border: '1px dashed #74C0FC' }}>
              + Ajouter un temoignage
            </button>
          </>
        )

      /* ────────────── histoire ────────────── */
      case 'histoire':
        return (
          <>
            <TextField label="Label de section" value={c.label || ''} onChange={(v) => updateContent(key, 'label', v)} />
            <TextAreaField label="Titre" value={c.title || ''} onChange={(v) => updateContent(key, 'title', v)} />
            <TextAreaField label="Paragraphe 1" value={c.paragraph1 || ''} rows={4} onChange={(v) => updateContent(key, 'paragraph1', v)} />
            <TextAreaField label="Paragraphe 2" value={c.paragraph2 || ''} rows={4} onChange={(v) => updateContent(key, 'paragraph2', v)} />
            <TextAreaField label="Paragraphe 3" value={c.paragraph3 || ''} rows={4} onChange={(v) => updateContent(key, 'paragraph3', v)} />
            <TextAreaField label="Paragraphe 4" value={c.paragraph4 || ''} rows={4} onChange={(v) => updateContent(key, 'paragraph4', v)} />
            <TextAreaField label="Citation" value={c.quote || ''} onChange={(v) => updateContent(key, 'quote', v)} />
            <TextField label="Signature (nom)" value={c.signature || ''} onChange={(v) => updateContent(key, 'signature', v)} />
            <TextField label="Sous-titre de la signature" value={c.signature_subtitle || ''} onChange={(v) => updateContent(key, 'signature_subtitle', v)} />
            <Separator label="Equipe" />
            <TextField label="Titre equipe" value={c.team_title || ''} onChange={(v) => updateContent(key, 'team_title', v)} />
            <TextAreaField label="Description equipe" value={c.team_description || ''} rows={3} onChange={(v) => updateContent(key, 'team_description', v)} />
            <TextField label="Lien du livre (Amazon)" value={c.book_url || ''} onChange={(v) => updateContent(key, 'book_url', v)} />
            <FileUpload label="Image couverture du livre" accept="image/*" folder="site"
              currentUrl={c.book_image || null} hint="Image de la couverture"
              onUploaded={(url) => updateContent(key, 'book_image', url)}
              onRemoved={() => updateContent(key, 'book_image', '')} />
            <TextField label="Libelle du bouton" value={c.button_label || ''} onChange={(v) => updateContent(key, 'button_label', v)} />
            <Separator label="Trinite / Fondateurs (page Notre Histoire)" />
            <TextAreaField label="Titre trinite" value={c.trinite_title || ''} onChange={(v) => updateContent(key, 'trinite_title', v)} />
            <TextAreaField label="Introduction trinite" value={c.trinite_intro || ''} rows={4} onChange={(v) => updateContent(key, 'trinite_intro', v)} />
            <Separator label="Julia" />
            <TextField label="Sous-titre Julia" value={c.julia_pilier || ''} onChange={(v) => updateContent(key, 'julia_pilier', v)} />
            <TextAreaField label="Description Julia" value={c.julia_desc || ''} rows={3} onChange={(v) => updateContent(key, 'julia_desc', v)} />
            <Separator label="William" />
            <TextField label="Sous-titre William" value={c.william_pilier || ''} onChange={(v) => updateContent(key, 'william_pilier', v)} />
            <TextAreaField label="Description William" value={c.william_desc || ''} rows={3} onChange={(v) => updateContent(key, 'william_desc', v)} />
            <Separator label="Thomas" />
            <TextField label="Sous-titre Thomas" value={c.thomas_pilier || ''} onChange={(v) => updateContent(key, 'thomas_pilier', v)} />
            <TextAreaField label="Description Thomas" value={c.thomas_desc || ''} rows={3} onChange={(v) => updateContent(key, 'thomas_desc', v)} />
            <Separator label="Bas de page" />
            <TextField label="Tagline (ex: Âme . Corps . Esprit)" value={c.trinite_tagline || ''} onChange={(v) => updateContent(key, 'trinite_tagline', v)} />
            <TextAreaField label="Conclusion" value={c.trinite_conclusion || ''} rows={3} onChange={(v) => updateContent(key, 'trinite_conclusion', v)} />
            <TextAreaField label="Manifeste (citation)" value={c.manifeste || ''} rows={3} onChange={(v) => updateContent(key, 'manifeste', v)} />
          </>
        )

      /* ────────────── fondateurs ────────────── */
      case 'fondateurs':
        return (
          <>
            <TextField label="Label de section" value={c.label || ''} onChange={(v) => updateContent(key, 'label', v)} />
            <TextAreaField label="Titre" value={c.title || ''} onChange={(v) => updateContent(key, 'title', v)} />
            <TextAreaField label="Description" value={c.description || ''} onChange={(v) => updateContent(key, 'description', v)} />
            <Separator label="Membres de l'equipe" />
            {(c.members || []).map((member: { name: string; role: string; expertise?: string; image: string }, i: number) => (
              <div key={i} className="rounded-lg p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--dark-border)' }}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Membre {i + 1}</p>
                  <button type="button" onClick={() => removeArrayItem(key, 'members', i)}
                    className="text-xs px-2 py-1 rounded cursor-pointer" style={{ color: '#FF6B6B' }}>Supprimer</button>
                </div>
                <TextField label="Prenom" value={member.name || ''} onChange={(v) => updateArrayItem(key, 'members', i, 'name', v)} />
                <TextField label="Role" value={member.role || ''} onChange={(v) => updateArrayItem(key, 'members', i, 'role', v)} />
                <TextField label="Expertise" value={member.expertise || ''} onChange={(v) => updateArrayItem(key, 'members', i, 'expertise', v)} />
                <FileUpload label="Photo" accept="image/*" folder="team"
                  currentUrl={member.image || null} hint="Photo de profil"
                  onUploaded={(url) => updateArrayItem(key, 'members', i, 'image', url)}
                  onRemoved={() => updateArrayItem(key, 'members', i, 'image', '')} />
              </div>
            ))}
            <button type="button" onClick={() => addArrayItem(key, 'members', { name: '', role: '', image: '' })}
              className="text-sm px-4 py-2 rounded-lg cursor-pointer" style={{ color: '#74C0FC', border: '1px dashed #74C0FC' }}>
              + Ajouter un membre
            </button>
          </>
        )

      /* ────────────── pricing ────────────── */
      case 'pricing':
        return (
          <>
            <TextField label="Label de section" value={c.label || ''} onChange={(v) => updateContent(key, 'label', v)} />
            <TextAreaField label="Titre de section" value={c.title || ''} onChange={(v) => updateContent(key, 'title', v)} />
            <TextField label="Sous-titre" value={c.subtitle || ''} onChange={(v) => updateContent(key, 'subtitle', v)} />
            <TextAreaField label="Texte d'inversion de risque" value={c.footer || ''} onChange={(v) => updateContent(key, 'footer', v)} />
            <TextAreaField label="Badges de confiance (un par ligne)" rows={3}
              value={Array.isArray(c.trust_badges) ? c.trust_badges.join('\n') : ''}
              onChange={(v) => updateContent(key, 'trust_badges', v.split('\n').filter((line: string) => line.trim() !== ''))} />
            <Separator label="Plans tarifaires" />
            {(c.plans || []).map((plan: { name: string; tagline?: string; price: string; period: string; button_label: string; button_href: string; highlight: boolean; badge: string; features: string[] }, i: number) => (
              <div key={i} className="rounded-lg p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--dark-border)' }}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Plan {i + 1}</p>
                  <button type="button" onClick={() => removeArrayItem(key, 'plans', i)}
                    className="text-xs px-2 py-1 rounded cursor-pointer" style={{ color: '#FF6B6B' }}>Supprimer</button>
                </div>
                <TextField label="Nom du plan" value={plan.name || ''} onChange={(v) => updateArrayItem(key, 'plans', i, 'name', v)} />
                <TextField label="Tagline (ex: Les fondations)" value={plan.tagline || ''} onChange={(v) => updateArrayItem(key, 'plans', i, 'tagline', v)} />
                <TextField label="Prix" value={plan.price || ''} onChange={(v) => updateArrayItem(key, 'plans', i, 'price', v)} />
                <TextField label="Periode" value={plan.period || ''} onChange={(v) => updateArrayItem(key, 'plans', i, 'period', v)} />
                <TextField label="Libelle du bouton" value={plan.button_label || ''} onChange={(v) => updateArrayItem(key, 'plans', i, 'button_label', v)} />
                <TextField label="Lien du bouton" value={plan.button_href || ''} onChange={(v) => updateArrayItem(key, 'plans', i, 'button_href', v)} />
                <CheckboxField label="Mise en avant" checked={!!plan.highlight} onChange={(v) => updateArrayItem(key, 'plans', i, 'highlight', v)} />
                <TextField label="Badge" value={plan.badge || ''} onChange={(v) => updateArrayItem(key, 'plans', i, 'badge', v)} />
                <TextAreaField label="Features (une par ligne)" rows={5}
                  value={Array.isArray(plan.features) ? plan.features.join('\n') : ''}
                  onChange={(v) => updateArrayItem(key, 'plans', i, 'features', v.split('\n').filter((line: string) => line.trim() !== ''))} />
              </div>
            ))}
            <button type="button" onClick={() => addArrayItem(key, 'plans', { name: '', price: '', period: '/mois', button_label: '', button_href: '/signup', highlight: false, badge: '', features: [] })}
              className="text-sm px-4 py-2 rounded-lg cursor-pointer" style={{ color: '#74C0FC', border: '1px dashed #74C0FC' }}>
              + Ajouter un plan
            </button>
            <Separator label="Garantie sous les plans" />
            <TextField label="Titre de la garantie" value={c.guarantee_title || ''} onChange={(v) => updateContent(key, 'guarantee_title', v)} />
            <TextAreaField label="Description de la garantie" rows={4} value={c.guarantee_description || ''} onChange={(v) => updateContent(key, 'guarantee_description', v)} />
          </>
        )

      /* ────────────── transformation (Avant / Après) ────────────── */
      case 'transformation':
        return (
          <>
            <TextField label="Label de section" value={c.label || ''} onChange={(v) => updateContent(key, 'label', v)} />
            <TextAreaField label="Titre" value={c.title || ''} onChange={(v) => updateContent(key, 'title', v)} />
            <TextAreaField label="Description" value={c.description || ''} onChange={(v) => updateContent(key, 'description', v)} />
            <Separator label="Transformations (Avant / Apres)" />
            {(c.items || []).map((item: { before: string; after: string; timeframe?: string; challenge?: string }, i: number) => (
              <div key={i} className="rounded-lg p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--dark-border)' }}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Transformation {i + 1}</p>
                  <button type="button" onClick={() => removeArrayItem(key, 'items', i)}
                    className="text-xs px-2 py-1 rounded cursor-pointer" style={{ color: '#FF6B6B' }}>Supprimer</button>
                </div>
                <TextField label="Challenge" value={item.challenge || ''} onChange={(v) => updateArrayItem(key, 'items', i, 'challenge', v)} />
                <TextField label="Duree" value={item.timeframe || ''} onChange={(v) => updateArrayItem(key, 'items', i, 'timeframe', v)} />
                <TextAreaField label="Avant" value={item.before || ''} onChange={(v) => updateArrayItem(key, 'items', i, 'before', v)} />
                <TextAreaField label="Apres" value={item.after || ''} onChange={(v) => updateArrayItem(key, 'items', i, 'after', v)} />
              </div>
            ))}
            <button type="button" onClick={() => addArrayItem(key, 'items', { before: '', after: '', timeframe: '', challenge: '' })}
              className="text-sm px-4 py-2 rounded-lg cursor-pointer" style={{ color: '#74C0FC', border: '1px dashed #74C0FC' }}>
              + Ajouter une transformation
            </button>
          </>
        )

      /* ────────────── manifeste (Ce que nous ne sommes pas) ────────────── */
      case 'manifeste':
        return (
          <>
            <TextField label="Label de section" value={c.label || ''} onChange={(v) => updateContent(key, 'label', v)} />
            <TextAreaField label="Titre" value={c.title || ''} onChange={(v) => updateContent(key, 'title', v)} />
            <Separator label="Paragraphes" />
            <TextAreaField label="Paragraphes (un par bloc, separes par un saut de ligne)" rows={12}
              value={Array.isArray(c.paragraphs) ? c.paragraphs.join('\n\n') : ''}
              onChange={(v) => updateContent(key, 'paragraphs', v.split('\n\n').filter((line: string) => line.trim() !== ''))} />
            <TextField label="Signature" value={c.signature || ''} onChange={(v) => updateContent(key, 'signature', v)} />
          </>
        )

      /* ────────────── pour_qui (Pour qui / Pas pour qui) ────────────── */
      case 'pour_qui':
        return (
          <>
            <TextAreaField label="Titre (Pour vous si...)" value={c.title || ''} onChange={(v) => updateContent(key, 'title', v)} />
            <Separator label="Elements positifs" />
            <TextAreaField label="Pour vous si... (un par ligne)" rows={6}
              value={Array.isArray(c.for_items) ? c.for_items.join('\n') : ''}
              onChange={(v) => updateContent(key, 'for_items', v.split('\n').filter((line: string) => line.trim() !== ''))} />
            <Separator label="Elements negatifs" />
            <TextField label="Titre (Pas pour vous si...)" value={c.not_title || ''} onChange={(v) => updateContent(key, 'not_title', v)} />
            <TextAreaField label="Pas pour vous si... (un par ligne)" rows={4}
              value={Array.isArray(c.not_items) ? c.not_items.join('\n') : ''}
              onChange={(v) => updateContent(key, 'not_items', v.split('\n').filter((line: string) => line.trim() !== ''))} />
          </>
        )

      /* ────────────── garantie ────────────── */
      case 'garantie':
        return (
          <>
            <TextField label="Label de section" value={c.label || ''} onChange={(v) => updateContent(key, 'label', v)} />
            <TextAreaField label="Titre" value={c.title || ''} onChange={(v) => updateContent(key, 'title', v)} />
            <TextAreaField label="Description" value={c.description || ''} rows={5} onChange={(v) => updateContent(key, 'description', v)} />
          </>
        )

      /* ────────────── cta_dark ────────────── */
      case 'cta_dark':
        return (
          <>
            <TextAreaField label="Titre" value={c.title || ''} onChange={(v) => updateContent(key, 'title', v)} />
            <TextField label="Sous-titre" value={c.subtitle || ''} onChange={(v) => updateContent(key, 'subtitle', v)} />
            <FileUpload label="Image de fond" accept="image/*" folder="site"
              currentUrl={c.image_url || null}
              onUploaded={(url) => updateContent(key, 'image_url', url)}
              onRemoved={() => updateContent(key, 'image_url', '')} />
            <Separator label="Bouton CTA" />
            <TextField label="Libelle du bouton" value={c.button_label || ''} onChange={(v) => updateContent(key, 'button_label', v)} />
            <TextField label="Lien du bouton" value={c.button_href || ''} onChange={(v) => updateContent(key, 'button_href', v)} />
            <TextField label="Ligne de confiance" value={c.trust_line || ''} onChange={(v) => updateContent(key, 'trust_line', v)} />
          </>
        )

      /* ────────────── cta_light ────────────── */
      case 'cta_light':
        return (
          <>
            <TextAreaField label="Description" value={c.description || ''} onChange={(v) => updateContent(key, 'description', v)} />
            <TextField label="Libelle du bouton" value={c.button_label || ''} onChange={(v) => updateContent(key, 'button_label', v)} />
            <TextField label="Lien du bouton" value={c.button_href || ''} onChange={(v) => updateContent(key, 'button_href', v)} />
            <TextField label="Texte connexion" value={c.login_text || ''} onChange={(v) => updateContent(key, 'login_text', v)} />
          </>
        )

      /* ────────────── footer ────────────── */
      case 'footer':
        return (
          <>
            <TextField label="Nom du site" value={c.name || ''} onChange={(v) => updateContent(key, 'name', v)} />
            <TextField label="Annee de copyright" value={c.copyright_year || ''} onChange={(v) => updateContent(key, 'copyright_year', v)} />
            <Separator label="Liens du footer" />
            {(c.links || []).map((link: { label: string; href: string }, i: number) => (
              <div key={i} className="rounded-lg p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--dark-border)' }}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Lien {i + 1}</p>
                  <button type="button" onClick={() => removeArrayItem(key, 'links', i)}
                    className="text-xs px-2 py-1 rounded cursor-pointer" style={{ color: '#FF6B6B' }}>Supprimer</button>
                </div>
                <TextField label="Libelle" value={link.label || ''} onChange={(v) => updateArrayItem(key, 'links', i, 'label', v)} />
                <TextField label="Lien (href)" value={link.href || ''} onChange={(v) => updateArrayItem(key, 'links', i, 'href', v)} />
              </div>
            ))}
            <button type="button" onClick={() => addArrayItem(key, 'links', { label: '', href: '' })}
              className="text-sm px-4 py-2 rounded-lg cursor-pointer" style={{ color: '#74C0FC', border: '1px dashed #74C0FC' }}>
              + Ajouter un lien
            </button>
          </>
        )

      /* ────────────── ticker_1 / ticker_2 ────────────── */
      case 'ticker_1':
      case 'ticker_2':
        return (
          <>
            <TextAreaField label="Mots du bandeau (un par ligne)" rows={8}
              value={Array.isArray(c.items) ? c.items.join('\n') : ''}
              onChange={(v) => updateContent(key, 'items', v.split('\n').filter((line: string) => line.trim() !== ''))} />
            <TextField label="Vitesse (secondes par boucle)" value={String(c.speed ?? 35)} type="number"
              onChange={(v) => updateContent(key, 'speed', parseInt(v) || 35)} />
          </>
        )

      /* ────────────── faq ────────────── */
      case 'faq':
        return (
          <>
            <TextField label="Label de section" value={c.label || ''} onChange={(v) => updateContent(key, 'label', v)} />
            <TextField label="Titre" value={c.title || ''} onChange={(v) => updateContent(key, 'title', v)} />
            <TextAreaField label="Sous-titre" value={c.subtitle || ''} onChange={(v) => updateContent(key, 'subtitle', v)} />
            <Separator label="Questions / Reponses" />
            {(c.items || []).map((item: { q: string; a: string }, i: number) => (
              <div key={i} className="rounded-lg p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--dark-border)' }}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Question {i + 1}</p>
                  <button type="button" onClick={() => removeArrayItem(key, 'items', i)}
                    className="text-xs px-2 py-1 rounded cursor-pointer" style={{ color: '#FF6B6B' }}>Supprimer</button>
                </div>
                <TextField label="Question" value={item.q || ''} onChange={(v) => updateArrayItem(key, 'items', i, 'q', v)} />
                <TextAreaField label="Reponse" value={item.a || ''} rows={3} onChange={(v) => updateArrayItem(key, 'items', i, 'a', v)} />
              </div>
            ))}
            <button type="button" onClick={() => addArrayItem(key, 'items', { q: '', a: '' })}
              className="text-sm px-4 py-2 rounded-lg cursor-pointer" style={{ color: '#74C0FC', border: '1px dashed #74C0FC' }}>
              + Ajouter une question
            </button>
            <Separator label="Bas de section" />
            <TextField label="Texte d'accroche" value={c.cta_text || ''} onChange={(v) => updateContent(key, 'cta_text', v)} />
            <TextField label="Libelle du bouton" value={c.cta_button_label || ''} onChange={(v) => updateContent(key, 'cta_button_label', v)} />
            <TextField label="Lien du bouton" value={c.cta_button_href || ''} onChange={(v) => updateContent(key, 'cta_button_href', v)} />
          </>
        )

      /* ────────────── legal_mentions / legal_cgv / legal_privacy ────────────── */
      case 'legal_mentions':
      case 'legal_cgv':
      case 'legal_privacy':
        return (
          <>
            <TextField label="Titre de la page" value={c.title || ''} onChange={(v) => updateContent(key, 'title', v)} />
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Contenu HTML</label>
              <textarea
                value={c.html_content || ''}
                onChange={(e) => updateContent(key, 'html_content', e.target.value)}
                rows={20}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-y font-mono"
                style={inputStyle}
                placeholder="<h2>Titre de section</h2>\n<p>Votre contenu ici...</p>"
              />
              <p className="text-[10px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
                Utilisez du HTML : &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;a href=&quot;...&quot;&gt;
              </p>
            </div>
            {c.html_content && (
              <div className="rounded-lg p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)' }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Aperçu</p>
                <div
                  className="prose prose-invert prose-sm max-w-none"
                  style={{ color: 'var(--text-secondary)' }}
                  dangerouslySetInnerHTML={{ __html: c.html_content }}
                />
              </div>
            )}
          </>
        )

      /* ────────────── legal_contact ────────────── */
      case 'legal_contact':
        return (
          <>
            <TextField label="Titre de la page" value={c.title || ''} onChange={(v) => updateContent(key, 'title', v)} />
            <TextField label="Email" value={c.email || ''} onChange={(v) => updateContent(key, 'email', v)} />
            <TextField label="Téléphone" value={c.phone || ''} onChange={(v) => updateContent(key, 'phone', v)} />
            <TextField label="Adresse" value={c.address || ''} onChange={(v) => updateContent(key, 'address', v)} />
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Contenu supplémentaire (HTML)</label>
              <textarea
                value={c.html_content || ''}
                onChange={(e) => updateContent(key, 'html_content', e.target.value)}
                rows={12}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-y font-mono"
                style={inputStyle}
                placeholder="<p>Contenu additionnel ici...</p>"
              />
              <p className="text-[10px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
                Utilisez du HTML : &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;a href=&quot;...&quot;&gt;
              </p>
            </div>
          </>
        )

      default: {
        // Custom sections — differentiate by section_type
        const sectionType = c.section_type || 'html'

        if (sectionType === 'text') {
          return (
            <>
              <TextField label="Label de section" value={c.label || ''} onChange={(v) => updateContent(key, 'label', v)} />
              <TextAreaField label="Titre" value={c.title || ''} onChange={(v) => updateContent(key, 'title', v)} />
              <TextField label="Sous-titre" value={c.subtitle || ''} onChange={(v) => updateContent(key, 'subtitle', v)} />
              <TextAreaField label="Description" value={c.description || ''} rows={5} onChange={(v) => updateContent(key, 'description', v)} />
              <FileUpload label="Image de section" accept="image/*" folder="site"
                currentUrl={c.image_url || null}
                onUploaded={(url) => updateContent(key, 'image_url', url)}
                onRemoved={() => updateContent(key, 'image_url', '')} />
              <FileUpload label="Video de section" accept="video/*" folder="site"
                currentUrl={c.video_url || null}
                onUploaded={(url) => updateContent(key, 'video_url', url)}
                onRemoved={() => updateContent(key, 'video_url', '')} />
              <Separator label="Bouton (optionnel)" />
              <TextField label="Libelle du bouton" value={c.button_label || ''} onChange={(v) => updateContent(key, 'button_label', v)} />
              <TextField label="Lien du bouton" value={c.button_href || ''} onChange={(v) => updateContent(key, 'button_href', v)} />
            </>
          )
        }

        if (sectionType === 'cards') {
          return (
            <>
              <TextField label="Label de section" value={c.label || ''} onChange={(v) => updateContent(key, 'label', v)} />
              <TextAreaField label="Titre" value={c.title || ''} onChange={(v) => updateContent(key, 'title', v)} />
              <TextAreaField label="Description" value={c.description || ''} onChange={(v) => updateContent(key, 'description', v)} />
              <Separator label="Cartes" />
              {(c.cards || []).map((card: { title: string; description: string; icon: string; image_url: string }, i: number) => (
                <div key={i} className="rounded-lg p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--dark-border)' }}>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Carte {i + 1}</p>
                    <button type="button" onClick={() => removeArrayItem(key, 'cards', i)}
                      className="text-xs px-2 py-1 rounded cursor-pointer" style={{ color: '#FF6B6B' }}>Supprimer</button>
                  </div>
                  <TextField label="Titre" value={card.title || ''} onChange={(v) => updateArrayItem(key, 'cards', i, 'title', v)} />
                  <TextAreaField label="Description" value={card.description || ''} onChange={(v) => updateArrayItem(key, 'cards', i, 'description', v)} />
                  <TextField label="Icone (emoji ou texte)" value={card.icon || ''} onChange={(v) => updateArrayItem(key, 'cards', i, 'icon', v)} />
                  <FileUpload label="Image de la carte" accept="image/*" folder="site"
                    currentUrl={card.image_url || null}
                    onUploaded={(url) => updateArrayItem(key, 'cards', i, 'image_url', url)}
                    onRemoved={() => updateArrayItem(key, 'cards', i, 'image_url', '')} />
                </div>
              ))}
              <button type="button" onClick={() => addArrayItem(key, 'cards', { title: '', description: '', icon: '', image_url: '' })}
                className="text-sm px-4 py-2 rounded-lg cursor-pointer" style={{ color: '#74C0FC', border: '1px dashed #74C0FC' }}>
                + Ajouter une carte
              </button>
            </>
          )
        }

        if (sectionType === 'cta') {
          return (
            <>
              <TextAreaField label="Titre" value={c.title || ''} onChange={(v) => updateContent(key, 'title', v)} />
              <TextAreaField label="Description" value={c.description || ''} onChange={(v) => updateContent(key, 'description', v)} />
              <FileUpload label="Image de fond" accept="image/*" folder="site"
                currentUrl={c.image_url || null}
                onUploaded={(url) => updateContent(key, 'image_url', url)}
                onRemoved={() => updateContent(key, 'image_url', '')} />
              <Separator label="Bouton" />
              <TextField label="Libelle du bouton" value={c.button_label || ''} onChange={(v) => updateContent(key, 'button_label', v)} />
              <TextField label="Lien du bouton" value={c.button_href || ''} onChange={(v) => updateContent(key, 'button_href', v)} />
            </>
          )
        }

        if (sectionType === 'gallery') {
          return (
            <>
              <TextField label="Label de section" value={c.label || ''} onChange={(v) => updateContent(key, 'label', v)} />
              <TextAreaField label="Titre" value={c.title || ''} onChange={(v) => updateContent(key, 'title', v)} />
              <TextAreaField label="Description" value={c.description || ''} onChange={(v) => updateContent(key, 'description', v)} />
              <Separator label="Images" />
              {(c.images || []).map((img: { url: string; alt: string; caption: string }, i: number) => (
                <div key={i} className="rounded-lg p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--dark-border)' }}>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Image {i + 1}</p>
                    <button type="button" onClick={() => removeArrayItem(key, 'images', i)}
                      className="text-xs px-2 py-1 rounded cursor-pointer" style={{ color: '#FF6B6B' }}>Supprimer</button>
                  </div>
                  <FileUpload label="Image" accept="image/*" folder="site"
                    currentUrl={img.url || null}
                    onUploaded={(url) => updateArrayItem(key, 'images', i, 'url', url)}
                    onRemoved={() => updateArrayItem(key, 'images', i, 'url', '')} />
                  <TextField label="Texte alternatif" value={img.alt || ''} onChange={(v) => updateArrayItem(key, 'images', i, 'alt', v)} />
                  <TextField label="Legende" value={img.caption || ''} onChange={(v) => updateArrayItem(key, 'images', i, 'caption', v)} />
                </div>
              ))}
              <button type="button" onClick={() => addArrayItem(key, 'images', { url: '', alt: '', caption: '' })}
                className="text-sm px-4 py-2 rounded-lg cursor-pointer" style={{ color: '#74C0FC', border: '1px dashed #74C0FC' }}>
                + Ajouter une image
              </button>
            </>
          )
        }

        // Default: HTML section
        return (
          <>
            <TextField label="Titre de la section" value={c.title || ''} onChange={(v) => updateContent(key, 'title', v)} />
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Contenu HTML</label>
              <textarea
                value={c.html_content || ''}
                onChange={(e) => updateContent(key, 'html_content', e.target.value)}
                rows={16}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-y font-mono"
                style={inputStyle}
                placeholder={'<h2>Titre</h2>\n<p>Votre contenu ici...</p>\n<a href="/rejoindre">Bouton</a>'}
              />
              <p className="text-[10px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
                HTML complet : &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;a&gt;, &lt;img&gt;, &lt;div&gt;, &lt;section&gt;, &lt;style&gt;
              </p>
            </div>
            <Separator label="Style" />
            <ColorField label="Couleur de fond" value={c.bg_color || ''} onChange={(v) => updateContent(key, 'bg_color', v)} />
            <TextField label="Padding (ex: 4rem 0)" value={c.padding || ''} onChange={(v) => updateContent(key, 'padding', v)} />
            {c.html_content && (
              <div className="rounded-lg p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)' }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Apercu</p>
                <div
                  className="prose prose-invert prose-sm max-w-none"
                  style={{ color: 'var(--text-secondary)' }}
                  dangerouslySetInnerHTML={{ __html: c.html_content }}
                />
              </div>
            )}
          </>
        )
      }
    }
  }

  /* ── Render section-specific style fields ── */
  function renderStyleFields(sec: LandingSectionRow) {
    const st = sec.styles
    const key = sec.section_key

    switch (key) {
      case '_global':
        return (
          <>
            <Separator label="Couleurs globales" />
            <ColorField label="Couleur principale (or)" value={st.color_primary || ''} onChange={(v) => updateStyle(key, 'color_primary', v)} />
            <ColorField label="Couleur secondaire (bleu)" value={st.color_secondary || ''} onChange={(v) => updateStyle(key, 'color_secondary', v)} />
            <ColorField label="Couleur de fond" value={st.color_bg || ''} onChange={(v) => updateStyle(key, 'color_bg', v)} />
            <ColorField label="Couleur des cartes" value={st.color_card || ''} onChange={(v) => updateStyle(key, 'color_card', v)} />
            <ColorField label="Couleur des bordures" value={st.color_border || ''} onChange={(v) => updateStyle(key, 'color_border', v)} />
            <ColorField label="Couleur du texte" value={st.color_text || ''} onChange={(v) => updateStyle(key, 'color_text', v)} />
            <ColorField label="Couleur texte secondaire" value={st.color_text_secondary || ''} onChange={(v) => updateStyle(key, 'color_text_secondary', v)} />
            <ColorField label="Couleur texte discret" value={st.color_text_muted || ''} onChange={(v) => updateStyle(key, 'color_text_muted', v)} />
            <ColorField label="Couleur des boutons" value={st.color_button || ''} onChange={(v) => updateStyle(key, 'color_button', v)} />
            <Separator label="Polices globales" />
            <SelectField label="Police d'affichage" value={st.font_display || ''} options={fontOpts} onChange={(v) => updateStyle(key, 'font_display', v)} />
            <SelectField label="Police de corps" value={st.font_body || ''} options={fontOpts} onChange={(v) => updateStyle(key, 'font_body', v)} />
          </>
        )

      case 'hero':
        return (
          <>
            <Separator label="Style" />
            <SelectField label="Police du titre" value={st.title_font || ''} options={fontOpts} onChange={(v) => updateStyle(key, 'title_font', v)} />
            <SelectField label="Taille du titre" value={st.title_size || ''} options={sizeOpts} onChange={(v) => updateStyle(key, 'title_size', v)} />
            <SelectField label="Alignement du titre" value={st.title_align || ''} options={alignOpts} onChange={(v) => updateStyle(key, 'title_align', v)} />
            <ColorField label="Couleur du titre" value={st.title_color || ''} onChange={(v) => updateStyle(key, 'title_color', v)} />
            <SelectField label="Police du texte" value={st.text_font || ''} options={fontOpts} onChange={(v) => updateStyle(key, 'text_font', v)} />
            <SelectField label="Alignement du texte" value={st.text_align || ''} options={alignOpts} onChange={(v) => updateStyle(key, 'text_align', v)} />
          </>
        )

      case 'probleme':
      case 'produit':
      case 'principe':
        return (
          <>
            <Separator label="Style" />
            <SelectField label="Police du titre" value={st.title_font || ''} options={fontOpts} onChange={(v) => updateStyle(key, 'title_font', v)} />
            <SelectField label="Taille du titre" value={st.title_size || ''} options={sizeOpts} onChange={(v) => updateStyle(key, 'title_size', v)} />
            <SelectField label="Alignement du titre" value={st.title_align || ''} options={alignOpts} onChange={(v) => updateStyle(key, 'title_align', v)} />
            <ColorField label="Couleur du titre" value={st.title_color || ''} onChange={(v) => updateStyle(key, 'title_color', v)} />
            <SelectField label="Police du texte" value={st.text_font || ''} options={fontOpts} onChange={(v) => updateStyle(key, 'text_font', v)} />
            <SelectField label="Alignement du texte" value={st.text_align || ''} options={alignOpts} onChange={(v) => updateStyle(key, 'text_align', v)} />
          </>
        )

      case 'steps':
        return (
          <>
            <Separator label="Style" />
            <SelectField label="Police du titre" value={st.title_font || ''} options={fontOpts} onChange={(v) => updateStyle(key, 'title_font', v)} />
            <SelectField label="Taille du titre" value={st.title_size || ''} options={sizeOpts} onChange={(v) => updateStyle(key, 'title_size', v)} />
            <SelectField label="Alignement du titre" value={st.title_align || ''} options={alignOpts} onChange={(v) => updateStyle(key, 'title_align', v)} />
            <SelectField label="Police du texte" value={st.text_font || ''} options={fontOpts} onChange={(v) => updateStyle(key, 'text_font', v)} />
          </>
        )

      case 'encyclopedie':
        return (
          <>
            <Separator label="Style" />
            <SelectField label="Police du titre" value={st.title_font || ''} options={fontOpts} onChange={(v) => updateStyle(key, 'title_font', v)} />
            <SelectField label="Taille du titre" value={st.title_size || ''} options={sizeOpts} onChange={(v) => updateStyle(key, 'title_size', v)} />
            <SelectField label="Alignement du titre" value={st.title_align || ''} options={alignOpts} onChange={(v) => updateStyle(key, 'title_align', v)} />
            <SelectField label="Alignement du texte" value={st.text_align || ''} options={alignOpts} onChange={(v) => updateStyle(key, 'text_align', v)} />
          </>
        )

      case 'communaute':
        return (
          <>
            <Separator label="Style" />
            <SelectField label="Police du titre" value={st.title_font || ''} options={fontOpts} onChange={(v) => updateStyle(key, 'title_font', v)} />
            <SelectField label="Taille du titre" value={st.title_size || ''} options={sizeOpts} onChange={(v) => updateStyle(key, 'title_size', v)} />
            <SelectField label="Alignement du titre" value={st.title_align || ''} options={alignOpts} onChange={(v) => updateStyle(key, 'title_align', v)} />
            <SelectField label="Alignement du texte" value={st.text_align || ''} options={alignOpts} onChange={(v) => updateStyle(key, 'text_align', v)} />
          </>
        )

      case 'temoignages':
        return (
          <>
            <Separator label="Style" />
            <SelectField label="Police" value={st.title_font || ''} options={fontOpts} onChange={(v) => updateStyle(key, 'title_font', v)} />
            <SelectField label="Alignement" value={st.title_align || ''} options={alignOpts} onChange={(v) => updateStyle(key, 'title_align', v)} />
          </>
        )

      case 'histoire':
        return (
          <>
            <Separator label="Style" />
            <SelectField label="Police du titre" value={st.title_font || ''} options={fontOpts} onChange={(v) => updateStyle(key, 'title_font', v)} />
            <SelectField label="Taille du titre" value={st.title_size || ''} options={sizeOpts} onChange={(v) => updateStyle(key, 'title_size', v)} />
            <SelectField label="Alignement du titre" value={st.title_align || ''} options={alignOpts} onChange={(v) => updateStyle(key, 'title_align', v)} />
          </>
        )

      case 'fondateurs':
        return (
          <>
            <Separator label="Style" />
            <SelectField label="Police du titre" value={st.title_font || ''} options={fontOpts} onChange={(v) => updateStyle(key, 'title_font', v)} />
            <SelectField label="Taille du titre" value={st.title_size || ''} options={sizeOpts} onChange={(v) => updateStyle(key, 'title_size', v)} />
            <SelectField label="Alignement du titre" value={st.title_align || ''} options={alignOpts} onChange={(v) => updateStyle(key, 'title_align', v)} />
          </>
        )

      case 'transformation':
        return (
          <>
            <Separator label="Style" />
            <SelectField label="Police du titre" value={st.title_font || ''} options={fontOpts} onChange={(v) => updateStyle(key, 'title_font', v)} />
            <SelectField label="Taille du titre" value={st.title_size || ''} options={sizeOpts} onChange={(v) => updateStyle(key, 'title_size', v)} />
            <SelectField label="Alignement du titre" value={st.title_align || ''} options={alignOpts} onChange={(v) => updateStyle(key, 'title_align', v)} />
          </>
        )

      case 'manifeste':
      case 'pour_qui':
      case 'garantie':
      case 'pricing':
        return (
          <>
            <Separator label="Style" />
            <SelectField label="Police du titre" value={st.title_font || ''} options={fontOpts} onChange={(v) => updateStyle(key, 'title_font', v)} />
            <SelectField label="Taille du titre" value={st.title_size || ''} options={sizeOpts} onChange={(v) => updateStyle(key, 'title_size', v)} />
            <SelectField label="Alignement du titre" value={st.title_align || ''} options={alignOpts} onChange={(v) => updateStyle(key, 'title_align', v)} />
          </>
        )

      case 'cta_dark':
        return (
          <>
            <Separator label="Style" />
            <SelectField label="Police du titre" value={st.title_font || ''} options={fontOpts} onChange={(v) => updateStyle(key, 'title_font', v)} />
            <SelectField label="Taille du titre" value={st.title_size || ''} options={sizeOpts} onChange={(v) => updateStyle(key, 'title_size', v)} />
            <SelectField label="Alignement du titre" value={st.title_align || ''} options={alignOpts} onChange={(v) => updateStyle(key, 'title_align', v)} />
          </>
        )

      case 'cta_light':
        return (
          <>
            <Separator label="Style" />
            <ColorField label="Couleur de fond" value={st.bg || ''} onChange={(v) => updateStyle(key, 'bg', v)} />
            <ColorField label="Couleur du texte" value={st.text_color || ''} onChange={(v) => updateStyle(key, 'text_color', v)} />
            <ColorField label="Couleur texte discret" value={st.muted_color || ''} onChange={(v) => updateStyle(key, 'muted_color', v)} />
          </>
        )

      case 'faq':
        return (
          <>
            <Separator label="Style" />
            <SelectField label="Police du titre" value={st.title_font || ''} options={fontOpts} onChange={(v) => updateStyle(key, 'title_font', v)} />
            <SelectField label="Taille du titre" value={st.title_size || ''} options={sizeOpts} onChange={(v) => updateStyle(key, 'title_size', v)} />
            <SelectField label="Alignement du titre" value={st.title_align || ''} options={alignOpts} onChange={(v) => updateStyle(key, 'title_align', v)} />
          </>
        )

      case 'footer':
      case 'ticker_1':
      case 'ticker_2':
      case 'legal_mentions':
      case 'legal_cgv':
      case 'legal_privacy':
      case 'legal_contact':
        return null // No style fields

      default: {
        const sectionType = sec.content?.section_type || 'html'
        if (sectionType === 'html') return null
        // Style fields for structured custom sections (text, cards, cta, gallery)
        return (
          <>
            <Separator label="Style" />
            <SelectField label="Police du titre" value={st.title_font || ''} options={fontOpts} onChange={(v) => updateStyle(key, 'title_font', v)} />
            <SelectField label="Taille du titre" value={st.title_size || ''} options={sizeOpts} onChange={(v) => updateStyle(key, 'title_size', v)} />
            <SelectField label="Alignement du titre" value={st.title_align || ''} options={alignOpts} onChange={(v) => updateStyle(key, 'title_align', v)} />
            <ColorField label="Couleur du titre" value={st.title_color || ''} onChange={(v) => updateStyle(key, 'title_color', v)} />
            <SelectField label="Police du texte" value={st.text_font || ''} options={fontOpts} onChange={(v) => updateStyle(key, 'text_font', v)} />
            <SelectField label="Alignement du texte" value={st.text_align || ''} options={alignOpts} onChange={(v) => updateStyle(key, 'text_align', v)} />
          </>
        )
      }
    }
  }

  /* ── Main render ── */
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* ── Sticky header ── */}
      <div className="flex items-center justify-between sticky top-0 z-20 py-4 -mx-4 px-4" style={{ background: 'var(--dark)' }}>
        <div>
          <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>Landing Page</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Editez le contenu, les medias et les styles de votre page d&apos;accueil.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm font-medium" style={{ color: '#55EFC4' }}>Sauvegarde !</span>}
          <button onClick={() => window.open('/', '_blank')}
            className="px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer flex items-center gap-2"
            style={{ background: 'rgba(167,139,250,0.15)', color: '#A78BFA', border: '1px solid rgba(167,139,250,0.3)' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Previsualiser
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-6 py-3 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-50"
            style={{ background: '#74C0FC', color: '#fff' }}>
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      {/* ── Error message ── */}
      {error && (
        <div className="rounded-xl px-4 py-3 text-sm"
          style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.25)', color: '#FF6B6B' }}>
          {error}
        </div>
      )}

      {/* ── Visual section list with drag-and-drop ── */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
        <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--dark-border)' }}>
          <div className="flex items-center gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Ordre des sections sur la page</p>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{sections.length} sections</span>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-[10px] hidden sm:block" style={{ color: 'var(--text-muted)' }}>Glissez ou utilisez les fleches pour reorganiser</p>
            <div className="relative flex-shrink-0">
              <button type="button" onClick={() => setShowSectionTypeMenu(!showSectionTypeMenu)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer flex items-center gap-1.5"
                style={{ border: '1px dashed rgba(116,192,252,0.4)', color: '#74C0FC', background: 'rgba(116,192,252,0.04)' }}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Ajouter
              </button>
              {showSectionTypeMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowSectionTypeMenu(false)} />
                  <div className="absolute right-0 top-full mt-2 z-40 rounded-xl overflow-hidden shadow-xl w-72"
                    style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
                    <p className="px-4 pt-3 pb-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                      Type de section
                    </p>
                    {CUSTOM_SECTION_TYPES.map((st) => (
                      <button key={st.type} type="button"
                        onClick={() => addCustomSection(st.type)}
                        className="w-full text-left px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors"
                        style={{ borderTop: '1px solid var(--dark-border)' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(116,192,252,0.08)' }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                        <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-mono flex-shrink-0"
                          style={{ background: 'rgba(116,192,252,0.1)', color: '#74C0FC' }}>
                          {st.icon}
                        </span>
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{st.label}</p>
                          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{st.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="divide-y" style={{ borderColor: 'var(--dark-border)' }}>
          {sections.map((s, i) => {
            const isSelected = s.section_key === selectedSection
            return (
              <div
                key={s.section_key}
                draggable
                onDragStart={(e) => { didDragRef.current = true; e.dataTransfer.setData('text/plain', String(i)); (e.currentTarget as HTMLElement).style.opacity = '0.4' }}
                onDragEnd={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
                onDragOver={(e) => { e.preventDefault(); (e.currentTarget as HTMLElement).style.background = 'rgba(116,192,252,0.08)' }}
                onDragLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '' }}
                onDrop={(e) => {
                  e.preventDefault();
                  (e.currentTarget as HTMLElement).style.background = ''
                  const fromIdx = parseInt(e.dataTransfer.getData('text/plain'))
                  const toIdx = i
                  if (isNaN(fromIdx) || fromIdx === toIdx) return
                  setSections((prev) => {
                    const next = [...prev]
                    const [moved] = next.splice(fromIdx, 1)
                    next.splice(toIdx, 0, moved)
                    return next.map((sec, pos) => ({ ...sec, position: pos }))
                  })
                  setSaved(false)
                }}
                className="flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors"
                style={{ background: isSelected ? 'rgba(116,192,252,0.08)' : 'transparent' }}
                onMouseDown={() => { didDragRef.current = false }}
                onClick={() => { if (!didDragRef.current) setSelectedSection(isSelected ? '' : s.section_key) }}
              >
                {/* Drag handle */}
                <span className="flex-shrink-0 text-xs select-none" style={{ color: 'var(--text-muted)', cursor: 'grab' }} title="Glisser pour deplacer">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                </span>
                {/* Position */}
                <span className="w-6 text-center text-xs font-bold flex-shrink-0" style={{ color: '#74C0FC' }}>{i + 1}</span>
                {/* Label */}
                <span className="flex-1 text-sm truncate" style={{ color: s.is_visible ? 'var(--text-primary)' : 'var(--text-muted)', textDecoration: s.is_visible ? 'none' : 'line-through' }}>
                  {s.label}
                </span>
                {/* Visibility */}
                <button type="button" onClick={(e) => { e.stopPropagation(); toggleVisibility(s.section_key) }}
                  className="p-1 rounded cursor-pointer flex-shrink-0" style={{ color: s.is_visible ? '#74C0FC' : 'var(--text-muted)' }}
                  title={s.is_visible ? 'Visible — cliquer pour masquer' : 'Masquee — cliquer pour afficher'}>
                  {s.is_visible ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                  )}
                </button>
                {/* Move up */}
                <button type="button" onClick={(e) => { e.stopPropagation(); moveSection(i, -1) }} disabled={i === 0}
                  className="p-1 rounded cursor-pointer disabled:opacity-20 flex-shrink-0" style={{ color: 'var(--text-muted)' }} title="Monter">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
                </button>
                {/* Move down */}
                <button type="button" onClick={(e) => { e.stopPropagation(); moveSection(i, 1) }} disabled={i === sections.length - 1}
                  className="p-1 rounded cursor-pointer disabled:opacity-20 flex-shrink-0" style={{ color: 'var(--text-muted)' }} title="Descendre">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                </button>
                {/* Delete */}
                <button type="button" onClick={(e) => { e.stopPropagation(); deleteSection(s.section_key) }}
                  className="p-1 rounded cursor-pointer flex-shrink-0" style={{ color: '#FF6B6B' }} title="Supprimer">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Selected section editor ── */}
      {(() => {
        const idx = sections.findIndex((s) => s.section_key === selectedSection)
        if (idx === -1) return null
        const sec = sections[idx]
        return (
          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
            {/* ── Section toolbar ── */}
            <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--dark-border)' }}>
              <h2 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
                {sec.label}
                <span className="text-xs font-normal ml-2" style={{ color: 'var(--text-muted)' }}>#{idx + 1}</span>
              </h2>
              <div className="flex items-center gap-2">
                {/* Visibility */}
                <button type="button" onClick={() => toggleVisibility(sec.section_key)}
                  className="p-1.5 rounded-lg cursor-pointer"
                  style={{ color: sec.is_visible ? '#74C0FC' : 'var(--text-muted)' }}
                  title={sec.is_visible ? 'Visible' : 'Masquee'}>
                  {sec.is_visible ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  )}
                </button>

                {/* Delete section */}
                <button type="button" onClick={() => { deleteSection(sec.section_key); setSelectedSection('') }}
                  className="p-1.5 rounded-lg cursor-pointer" style={{ color: '#FF6B6B' }}
                  title="Supprimer cette section">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ── Section content ── */}
            <div className="px-5 pb-5 pt-4 space-y-4">
              {!sec.is_visible && (
                <div className="rounded-lg px-3 py-2 text-xs" style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)' }}>
                  Cette section est actuellement masquee sur la page d&apos;accueil.
                </div>
              )}
              <TextField label="Nom de la section" value={sec.label || ''} onChange={(v) => {
                setSections((prev) => prev.map((s) => s.section_key === sec.section_key ? { ...s, label: v } : s))
                setSaved(false)
              }} />
              {renderContentFields(sec)}
              {sec.section_key === '_global' ? (
                renderStyleFields(sec)
              ) : ['footer', 'ticker_1', 'ticker_2', 'legal_mentions', 'legal_cgv', 'legal_privacy', 'legal_contact'].includes(sec.section_key) ? null
              : sec.section_key.startsWith('custom_') && (sec.content?.section_type || 'html') === 'html' ? null
              : (
                <LandingStyleToolbar
                  styles={sec.styles}
                  onChange={(field, value) => updateStyle(sec.section_key, field, value)}
                  previewText={sec.content?.title || sec.label || ''}
                />
              )}
            </div>
          </div>
        )
      })()}

      {/* ── Responsive preview ── */}
      <LandingPreview variant="default" />

      {/* ── Bottom save ── */}
      <div className="flex justify-end pb-8">
        <button onClick={handleSave} disabled={saving}
          className="px-6 py-3 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-50"
          style={{ background: '#74C0FC', color: '#fff' }}>
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>
    </div>
  )
}
