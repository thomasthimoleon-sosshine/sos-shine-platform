'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LANDING_DEFAULTS } from '@/lib/landing-defaults'
import type { LandingSectionRow } from '@/lib/landing-defaults'
import FileUpload from '@/components/FileUpload'

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
export default function LandingJuliaPage() {
  const [sections, setSections] = useState<LandingSectionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSection, setSelectedSection] = useState<string>('')
  const [variantId, setVariantId] = useState<string | null>(null)
  const [duplicating, setDuplicating] = useState(false)

  /* ── Load sections ── */
  const loadSections = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createClient() as any

    // Trouver ou créer la variante Julia
    let { data: variant } = await supabase
      .from('landing_page_variants')
      .select('id')
      .eq('name', 'julia')
      .single()

    if (!variant) {
      const { data: newVariant } = await supabase
        .from('landing_page_variants')
        .insert({ name: 'julia', label: 'Landing Page Julia (B)' })
        .select('id')
        .single()
      variant = newVariant
    }

    if (!variant) {
      setError('Impossible de créer la variante Julia. Veuillez exécuter le SQL SQL_AB_TESTING.sql dans Supabase.')
      setLoading(false)
      return
    }

    setVariantId(variant.id)

    // Charger les sections de la variante Julia
    const { data: variantSections } = await supabase
      .from('landing_variant_sections')
      .select('*')
      .eq('variant_id', variant.id)
      .order('position')

    if (variantSections && variantSections.length > 0) {
      setSections(variantSections as LandingSectionRow[])
      setSelectedSection(variantSections[0].section_key)
    }

    setLoading(false)
  }, [])

  useEffect(() => { loadSections() }, [loadSections])

  /* ── Duplicate from current landing page ── */
  async function duplicateFromCurrent() {
    if (!variantId) return
    if (!confirm('Cela va copier toutes les sections de la landing page actuelle vers la Landing Page Julia. Les sections existantes seront écrasées. Continuer ?')) return

    setDuplicating(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createClient() as any

    // Charger les sections actuelles
    const { data: currentSections } = await supabase
      .from('landing_sections')
      .select('*')
      .order('position')

    if (!currentSections || currentSections.length === 0) {
      setError('Aucune section trouvée dans la landing page actuelle.')
      setDuplicating(false)
      return
    }

    // Supprimer les sections existantes de Julia
    await supabase
      .from('landing_variant_sections')
      .delete()
      .eq('variant_id', variantId)

    // Copier les sections
    const { data: { user } } = await supabase.auth.getUser()
    const now = new Date().toISOString()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = (currentSections as any[]).map((s: any) => ({
      variant_id: variantId,
      section_key: s.section_key,
      label: s.label,
      position: s.position,
      is_visible: s.is_visible,
      content: s.content,
      styles: s.styles,
      updated_by: user?.id || null,
      updated_at: now,
    }))

    const { error: insertErr } = await supabase
      .from('landing_variant_sections')
      .insert(rows)

    if (insertErr) {
      setError(`Erreur: ${insertErr.message}`)
      setDuplicating(false)
      return
    }

    // Recharger
    await loadSections()
    setDuplicating(false)
  }

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

  function moveSection(index: number, direction: -1 | 1) {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= sections.length) return
    setSections((prev) => {
      const next = [...prev]
      const tmp = next[index]
      next[index] = next[targetIndex]
      next[targetIndex] = tmp
      return next.map((s, i) => ({ ...s, position: i }))
    })
    setSaved(false)
  }

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

  /* ── Add a custom HTML section ── */
  function addCustomSection() {
    const id = `custom_${Date.now()}`
    const newSec: LandingSectionRow = {
      id: '',
      section_key: id,
      label: 'Nouvelle section HTML',
      position: sections.length,
      is_visible: true,
      content: { title: '', html_content: '', bg_color: '', padding: '4rem 1.5rem' },
      styles: {},
      updated_by: null,
      updated_at: new Date().toISOString(),
    }
    setSections((prev) => [...prev, newSec])
    setSelectedSection(id)
    setSaved(false)
  }

  /* ── Delete section ── */
  async function deleteSection(sectionKey: string) {
    if (!confirm('Supprimer cette section ?')) return
    if (variantId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabase = createClient() as any
      await supabase
        .from('landing_variant_sections')
        .delete()
        .eq('variant_id', variantId)
        .eq('section_key', sectionKey)
    }
    setSections((prev) => prev.filter((s) => s.section_key !== sectionKey))
    setSelectedSection('')
    setSaved(false)
  }

  /* ── Save ── */
  async function handleSave() {
    if (!variantId) return
    setSaving(true)
    setError(null)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabase = createClient() as any
      const { data: { user } } = await supabase.auth.getUser()
      const now = new Date().toISOString()
      const userId = user?.id || null

      // Supprimer toutes les sections existantes puis réinsérer
      await supabase
        .from('landing_variant_sections')
        .delete()
        .eq('variant_id', variantId)

      const rows = sections.map((s) => ({
        variant_id: variantId,
        section_key: s.section_key,
        label: s.label,
        position: s.position,
        is_visible: s.is_visible,
        content: s.content,
        styles: s.styles,
        updated_by: userId,
        updated_at: now,
      }))

      const { error: insertErr } = await supabase
        .from('landing_variant_sections')
        .insert(rows)

      if (insertErr) {
        setError(`Erreur: ${insertErr.message}`)
        setSaving(false)
        return
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
        <div className="w-8 h-8 border-2 border-[#A78BFA] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  /* ── Render all section fields generically with HTML support ── */
  function renderSectionFields(sec: LandingSectionRow) {
    const c = sec.content
    const key = sec.section_key

    // Pour chaque section, on affiche tous les champs du content avec un éditeur approprié
    // Plus un éditeur HTML libre
    return (
      <>
        {/* Champs texte auto-détectés */}
        {Object.entries(c).map(([fieldKey, fieldValue]) => {
          if (fieldKey === 'html_content') return null // Affiché séparément
          if (Array.isArray(fieldValue)) {
            // Champs tableau - afficher comme textarea (un par ligne) ou items complexes
            if (fieldValue.length > 0 && typeof fieldValue[0] === 'object') {
              return (
                <div key={fieldKey}>
                  <Separator label={fieldKey.replace(/_/g, ' ')} />
                  {fieldValue.map((item: Record<string, unknown>, i: number) => (
                    <div key={i} className="rounded-lg p-4 space-y-3 mb-2" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--dark-border)' }}>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{fieldKey} {i + 1}</p>
                        <button type="button" onClick={() => removeArrayItem(key, fieldKey, i)}
                          className="text-xs px-2 py-1 rounded cursor-pointer" style={{ color: '#FF6B6B' }}>Supprimer</button>
                      </div>
                      {Object.entries(item).map(([itemKey, itemVal]) => {
                        if (itemKey === 'image' || itemKey === 'image_url') {
                          return (
                            <FileUpload key={itemKey} label={itemKey} accept="image/*" folder="landing-julia"
                              currentUrl={(itemVal as string) || null}
                              onUploaded={(url) => updateArrayItem(key, fieldKey, i, itemKey, url)}
                              onRemoved={() => updateArrayItem(key, fieldKey, i, itemKey, '')} />
                          )
                        }
                        if (typeof itemVal === 'boolean') {
                          return <CheckboxField key={itemKey} label={itemKey} checked={itemVal} onChange={(v) => updateArrayItem(key, fieldKey, i, itemKey, v)} />
                        }
                        if (typeof itemVal === 'string' && itemVal.length > 100) {
                          return <TextAreaField key={itemKey} label={itemKey} value={String(itemVal)} onChange={(v) => updateArrayItem(key, fieldKey, i, itemKey, v)} />
                        }
                        return <TextField key={itemKey} label={itemKey} value={String(itemVal ?? '')} onChange={(v) => updateArrayItem(key, fieldKey, i, itemKey, v)} />
                      })}
                    </div>
                  ))}
                  <button type="button" onClick={() => {
                    const template: Record<string, unknown> = {}
                    if (fieldValue[0]) {
                      Object.keys(fieldValue[0]).forEach((k) => { template[k] = '' })
                    }
                    addArrayItem(key, fieldKey, template)
                  }}
                    className="text-sm px-4 py-2 rounded-lg cursor-pointer" style={{ color: '#A78BFA', border: '1px dashed #A78BFA' }}>
                    + Ajouter
                  </button>
                </div>
              )
            }
            // Tableau de strings
            return (
              <TextAreaField key={fieldKey} label={fieldKey.replace(/_/g, ' ')} rows={4}
                value={fieldValue.join('\n')}
                onChange={(v) => updateContent(key, fieldKey, v.split('\n').filter((line: string) => line.trim() !== ''))} />
            )
          }
          if (typeof fieldValue === 'boolean') {
            return <CheckboxField key={fieldKey} label={fieldKey.replace(/_/g, ' ')} checked={fieldValue} onChange={(v) => updateContent(key, fieldKey, v)} />
          }
          if (typeof fieldValue === 'number') {
            return <TextField key={fieldKey} label={fieldKey.replace(/_/g, ' ')} value={String(fieldValue)} type="number" onChange={(v) => updateContent(key, fieldKey, parseInt(v) || 0)} />
          }
          if (typeof fieldValue === 'string') {
            if (fieldKey.includes('url') || fieldKey.includes('image')) {
              return (
                <FileUpload key={fieldKey} label={fieldKey.replace(/_/g, ' ')} accept="image/*,video/*" folder="landing-julia"
                  currentUrl={fieldValue || null}
                  onUploaded={(url) => updateContent(key, fieldKey, url)}
                  onRemoved={() => updateContent(key, fieldKey, '')} />
              )
            }
            if (fieldKey.includes('color')) {
              return <ColorField key={fieldKey} label={fieldKey.replace(/_/g, ' ')} value={fieldValue} onChange={(v) => updateContent(key, fieldKey, v)} />
            }
            if (fieldValue.length > 100 || fieldKey.includes('description') || fieldKey.includes('paragraph') || fieldKey.includes('title')) {
              return <TextAreaField key={fieldKey} label={fieldKey.replace(/_/g, ' ')} value={fieldValue} onChange={(v) => updateContent(key, fieldKey, v)} />
            }
            return <TextField key={fieldKey} label={fieldKey.replace(/_/g, ' ')} value={fieldValue} onChange={(v) => updateContent(key, fieldKey, v)} />
          }
          return null
        })}

        {/* Éditeur HTML libre */}
        <Separator label="Contenu HTML personnalisé" />
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>HTML libre (remplace le rendu par défaut si rempli)</label>
          <textarea
            value={c.html_content || ''}
            onChange={(e) => updateContent(key, 'html_content', e.target.value)}
            rows={12}
            className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-y font-mono"
            style={inputStyle}
            placeholder={'<div style="text-align: center; padding: 2rem;">\n  <h2>Titre</h2>\n  <p>Votre contenu ici...</p>\n</div>'}
          />
          <p className="text-[10px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
            HTML complet supporté : &lt;h1&gt;-&lt;h6&gt;, &lt;p&gt;, &lt;div&gt;, &lt;span&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;, &lt;a&gt;, &lt;img&gt;, &lt;style&gt;, etc.
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

        {/* Style fields */}
        {Object.keys(sec.styles).length > 0 && (
          <>
            <Separator label="Styles" />
            {Object.entries(sec.styles).map(([styleKey, styleVal]) => {
              if (styleKey.includes('color')) {
                return <ColorField key={styleKey} label={styleKey.replace(/_/g, ' ')} value={styleVal} onChange={(v) => updateStyle(key, styleKey, v)} />
              }
              if (styleKey.includes('font')) {
                return <SelectField key={styleKey} label={styleKey.replace(/_/g, ' ')} value={styleVal} options={fontOpts} onChange={(v) => updateStyle(key, styleKey, v)} />
              }
              if (styleKey.includes('align')) {
                return <SelectField key={styleKey} label={styleKey.replace(/_/g, ' ')} value={styleVal} options={alignOpts} onChange={(v) => updateStyle(key, styleKey, v)} />
              }
              if (styleKey.includes('size')) {
                return <SelectField key={styleKey} label={styleKey.replace(/_/g, ' ')} value={styleVal} options={sizeOpts} onChange={(v) => updateStyle(key, styleKey, v)} />
              }
              return <TextField key={styleKey} label={styleKey.replace(/_/g, ' ')} value={styleVal} onChange={(v) => updateStyle(key, styleKey, v)} />
            })}
          </>
        )}
      </>
    )
  }

  /* ── Main render ── */
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* ── Sticky header ── */}
      <div className="flex items-center justify-between sticky top-0 z-20 py-4 -mx-4 px-4" style={{ background: 'var(--dark)' }}>
        <div>
          <h1 className="font-display text-3xl font-semibold" style={{ color: '#A78BFA' }}>Landing Page Julia</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Variante B pour l&apos;A/B testing. Modifiez, supprimez ou ajoutez des sections librement.
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

      {/* ── Error message ── */}
      {error && (
        <div className="rounded-xl px-4 py-3 text-sm"
          style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.25)', color: '#FF6B6B' }}>
          {error}
        </div>
      )}

      {/* ── Duplicate button if empty ── */}
      {sections.length === 0 && (
        <div className="rounded-xl p-8 text-center space-y-4" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center" style={{ background: 'rgba(167,139,250,0.1)' }}>
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="#A78BFA" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.5a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Landing Page Julia vide
          </h3>
          <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Dupliquez la landing page actuelle pour commencer. Vous pourrez ensuite modifier, supprimer ou ajouter des sections.
          </p>
          <button onClick={duplicateFromCurrent} disabled={duplicating}
            className="px-8 py-3 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-50"
            style={{ background: '#A78BFA', color: '#fff' }}>
            {duplicating ? 'Duplication en cours...' : 'Dupliquer la Landing Page actuelle'}
          </button>
        </div>
      )}

      {/* ── Section editor ── */}
      {sections.length > 0 && (
        <>
          {/* Section selector */}
          <div className="rounded-xl p-5 space-y-4" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <label className="text-sm font-medium flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>Section</label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="flex-1 rounded-lg px-4 py-3 text-sm outline-none cursor-pointer appearance-none"
                style={{ ...inputStyle, backgroundImage: selectBgImage, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}>
                <option value="" style={{ background: '#1a1a2e', color: '#F5EDF0' }}>-- Choisir une section --</option>
                {sections.map((s) => (
                  <option key={s.section_key} value={s.section_key} style={{ background: '#1a1a2e', color: '#F5EDF0' }}>
                    {s.label} {!s.is_visible ? '(masquée)' : ''}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button type="button" onClick={addCustomSection}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer flex items-center gap-2 flex-shrink-0"
                  style={{ border: '1px dashed rgba(167,139,250,0.4)', color: '#A78BFA', background: 'rgba(167,139,250,0.04)' }}>
                  + Section HTML
                </button>
                <button type="button" onClick={duplicateFromCurrent} disabled={duplicating}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer flex items-center gap-2 flex-shrink-0"
                  style={{ border: '1px dashed rgba(255,107,107,0.4)', color: '#FF6B6B', background: 'rgba(255,107,107,0.04)' }}>
                  Re-dupliquer
                </button>
              </div>
            </div>
          </div>

          {/* Selected section editor */}
          {(() => {
            const idx = sections.findIndex((s) => s.section_key === selectedSection)
            if (idx === -1) return null
            const sec = sections[idx]
            return (
              <div className="rounded-xl overflow-hidden" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
                {/* Section toolbar */}
                <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--dark-border)' }}>
                  <h2 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
                    {sec.label}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => moveSection(idx, -1)} disabled={idx === 0}
                      className="p-1.5 rounded-lg cursor-pointer disabled:opacity-20" style={{ color: 'var(--text-muted)' }} title="Monter">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
                    </button>
                    <button type="button" onClick={() => moveSection(idx, 1)} disabled={idx === sections.length - 1}
                      className="p-1.5 rounded-lg cursor-pointer disabled:opacity-20" style={{ color: 'var(--text-muted)' }} title="Descendre">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                    </button>
                    <button type="button" onClick={() => toggleVisibility(sec.section_key)}
                      className="p-1.5 rounded-lg cursor-pointer"
                      style={{ color: sec.is_visible ? '#A78BFA' : 'var(--text-muted)' }}
                      title={sec.is_visible ? 'Visible' : 'Masquée'}>
                      {sec.is_visible ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                      )}
                    </button>
                    <button type="button" onClick={() => deleteSection(sec.section_key)}
                      className="p-1.5 rounded-lg cursor-pointer" style={{ color: '#FF6B6B' }}
                      title="Supprimer cette section">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                    </button>
                  </div>
                </div>

                {/* Section content */}
                <div className="px-5 pb-5 pt-4 space-y-4">
                  {!sec.is_visible && (
                    <div className="rounded-lg px-3 py-2 text-xs" style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)' }}>
                      Cette section est actuellement masquée.
                    </div>
                  )}
                  <TextField label="Nom de la section" value={sec.label || ''} onChange={(v) => {
                    setSections((prev) => prev.map((s) => s.section_key === sec.section_key ? { ...s, label: v } : s))
                    setSaved(false)
                  }} />
                  {renderSectionFields(sec)}
                </div>
              </div>
            )
          })()}

          {/* Bottom save */}
          <div className="flex justify-end pb-8">
            <button onClick={handleSave} disabled={saving}
              className="px-6 py-3 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-50"
              style={{ background: '#A78BFA', color: '#fff' }}>
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
