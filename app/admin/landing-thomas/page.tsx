'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { SectionContent } from '@/lib/landing-defaults'
import { LANDING_DEFAULTS } from '@/lib/landing-defaults'
import FileUpload from '@/components/FileUpload'

const VARIANT = 'thomas'

/* ── Toutes les section_keys éditables (landing visible) ── */
const ALL_SECTION_KEYS = LANDING_DEFAULTS
  .filter((d) => !d.section_key.startsWith('legal_') && d.section_key !== '_global')
  .map((d) => d.section_key)

const SECTION_LABELS: Record<string, { label: string; icon: string }> = {
  hero: { label: 'Hero (en-tête)', icon: '🎬' },
  probleme: { label: 'La Vérité', icon: '💡' },
  histoire: { label: 'Julia & le Livre', icon: '📖' },
  temoignages: { label: 'Témoignages', icon: '💬' },
  encyclopedie: { label: 'Encyclopédie', icon: '📚' },
  steps: { label: 'Le Parcours', icon: '🚀' },
  communaute: { label: 'Communauté', icon: '🤝' },
  produit: { label: 'Dès Jour 1', icon: '🎁' },
  manifeste: { label: 'Ce que nous ne sommes pas', icon: '🚫' },
  pricing: { label: 'Tarification', icon: '💰' },
  pour_qui: { label: 'Pour qui', icon: '🎯' },
  cta_dark: { label: 'CTA Final', icon: '💫' },
  footer: { label: 'Footer', icon: '🔗' },
  ticker_1: { label: 'Bandeau 1', icon: '📜' },
  ticker_2: { label: 'Bandeau 2', icon: '📜' },
  stats: { label: 'Chiffres clés', icon: '📊' },
  signature_cta: { label: 'CTA Signature', icon: '✨' },
  principe: { label: 'Le Principe', icon: '⚡' },
  fondateurs: { label: 'Fondateurs', icon: '👥' },
  transformation: { label: 'Transformation', icon: '🔄' },
  garantie: { label: 'Garantie', icon: '🛡️' },
  cta_light: { label: 'CTA Clair', icon: '☀️' },
  faq: { label: 'FAQ', icon: '❓' },
}

/* ── Styles ── */
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
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} placeholder={placeholder} />
    </div>
  )
}

function TextAreaField({ label, value, onChange, rows = 3, placeholder = '' }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)}
        rows={rows} className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-y" style={inputStyle} placeholder={placeholder} />
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
      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#74C0FC' }}>{title}</p>
    </div>
  )
}

/* ── Éditeur générique par section ── */
function GenericSectionEditor({ content, sectionKey, onChange }: {
  content: SectionContent; sectionKey: string; onChange: (field: string, value: unknown) => void
}) {
  // Rendu adaptatif : itère sur les champs du contenu
  const entries = Object.entries(content)

  return (
    <div className="space-y-4">
      {entries.map(([field, value]) => {
        if (field === 'buttons' || field === 'items' || field === 'plans' || field === 'steps'
            || field === 'blocks' || field === 'links' || field === 'socials'
            || field === 'team_members' || field === 'members' || field === 'trust_items'
            || field === 'symptoms' || field === 'positive' || field === 'negative'
            || field === 'questions') {
          // Arrays — text list editor
          if (Array.isArray(value)) {
            if (value.length === 0) return null
            if (typeof value[0] === 'string') {
              return (
                <div key={field}>
                  <TextAreaField
                    label={field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    value={value.join('\n')}
                    rows={Math.min(value.length + 2, 10)}
                    onChange={(v) => onChange(field, v.split('\n').filter((l: string) => l.trim() !== ''))}
                  />
                </div>
              )
            }
            // Complex array (objects) — JSON editor
            return (
              <div key={field}>
                <SectionDivider title={field.replace(/_/g, ' ')} />
                {value.map((item: Record<string, unknown>, i: number) => (
                  <div key={i} className="rounded-lg p-4 mb-2 space-y-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--dark-border)' }}>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{field} #{i + 1}</p>
                      <button type="button" onClick={() => {
                        const arr = [...value]
                        arr.splice(i, 1)
                        onChange(field, arr)
                      }} className="text-xs px-2 py-1 rounded cursor-pointer" style={{ color: '#FF6B6B' }}>Supprimer</button>
                    </div>
                    {Object.entries(item).map(([k, v]) => {
                      if (typeof v === 'string') {
                        const isLong = v.length > 80
                        return isLong ? (
                          <TextAreaField key={k} label={k} value={v} onChange={(val) => {
                            const arr = [...value]; arr[i] = { ...arr[i], [k]: val }; onChange(field, arr)
                          }} />
                        ) : (
                          <TextField key={k} label={k} value={v} onChange={(val) => {
                            const arr = [...value]; arr[i] = { ...arr[i], [k]: val }; onChange(field, arr)
                          }} />
                        )
                      }
                      if (typeof v === 'boolean') {
                        return (
                          <ToggleField key={k} label={k} checked={v} onChange={(val) => {
                            const arr = [...value]; arr[i] = { ...arr[i], [k]: val }; onChange(field, arr)
                          }} />
                        )
                      }
                      if (Array.isArray(v) && v.every((x) => typeof x === 'string')) {
                        return (
                          <TextAreaField key={k} label={k} value={v.join('\n')} rows={3} onChange={(val) => {
                            const arr = [...value]; arr[i] = { ...arr[i], [k]: val.split('\n').filter((l: string) => l.trim()) }; onChange(field, arr)
                          }} />
                        )
                      }
                      return null
                    })}
                  </div>
                ))}
                <button type="button" onClick={() => {
                  const template: Record<string, unknown> = {}
                  if (value.length > 0) {
                    for (const k of Object.keys(value[0])) {
                      const sample = value[0][k]
                      template[k] = typeof sample === 'string' ? '' : typeof sample === 'boolean' ? false : Array.isArray(sample) ? [] : ''
                    }
                  }
                  onChange(field, [...value, template])
                }}
                  className="text-sm px-4 py-2 rounded-lg cursor-pointer w-full" style={{ color: '#74C0FC', border: '1px dashed #74C0FC' }}>
                  + Ajouter
                </button>
              </div>
            )
          }
          return null
        }

        // String fields
        if (typeof value === 'string') {
          if (field.includes('url') || field.includes('image') || field.includes('video')) {
            const isVideo = field.includes('video')
            return (
              <FileUpload key={field} label={field.replace(/_/g, ' ')} accept={isVideo ? 'video/*' : 'image/*'}
                folder="landing" currentUrl={value || null}
                onUploaded={(url) => onChange(field, url)} onRemoved={() => onChange(field, '')} />
            )
          }
          const isLong = value.length > 100 || field.includes('description') || field.includes('paragraph') || field.includes('text') || field.includes('closing') || field.includes('disclaimer')
          return isLong ? (
            <TextAreaField key={`${sectionKey}-${field}`} label={field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} value={value} rows={4} onChange={(v) => onChange(field, v)} />
          ) : (
            <TextField key={`${sectionKey}-${field}`} label={field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} value={value} onChange={(v) => onChange(field, v)} />
          )
        }

        // Boolean
        if (typeof value === 'boolean') {
          return <ToggleField key={field} label={field.replace(/_/g, ' ')} checked={value} onChange={(v) => onChange(field, v)} />
        }

        // Number
        if (typeof value === 'number') {
          return <TextField key={field} label={field.replace(/_/g, ' ')} value={String(value)} type="number" onChange={(v) => onChange(field, parseFloat(v) || 0)} />
        }

        return null
      })}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Composant principal
───────────────────────────────────────────── */
export default function LandingThomasPage() {
  const [sections, setSections] = useState<Record<string, { content: SectionContent; is_visible: boolean; position: number }>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSection, setSelectedSection] = useState<string>('hero')

  /* ── Chargement ── */
  const loadSections = useCallback(async () => {
    try {
      const supabase = createClient()

      // Try with variant filter first, fallback without if column doesn't exist yet
      let data = null
      let fetchError = null

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await (supabase.from('landing_sections') as any)
        .select('section_key, content, is_visible, position')
        .eq('variant', VARIANT)
        .order('position')

      if (res.error && res.error.message.includes('variant')) {
        // Column doesn't exist yet — load without variant filter
        const fallback = await supabase
          .from('landing_sections')
          .select('section_key, content, is_visible, position')
          .order('position')
        data = fallback.data
        fetchError = fallback.error
      } else {
        data = res.data
        fetchError = res.error
      }

      if (fetchError) {
        setError(`Erreur de chargement: ${fetchError.message}`)
        setLoading(false)
        return
      }

      const map: Record<string, { content: SectionContent; is_visible: boolean; position: number }> = {}

      // Defaults
      for (const def of LANDING_DEFAULTS) {
        if (def.section_key.startsWith('legal_') || def.section_key === '_global') continue
        map[def.section_key] = { content: { ...def.content }, is_visible: def.is_visible, position: def.position }
      }

      // Override from DB
      if (data) {
        for (const row of data) {
          if (row.section_key.startsWith('legal_') || row.section_key === '_global') continue
          map[row.section_key] = {
            content: row.content as SectionContent,
            is_visible: row.is_visible as boolean,
            position: row.position as number,
          }
        }
      }

      setSections(map)
    } catch {
      setError('Erreur de connexion')
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadSections() }, [loadSections])

  function updateContent(sectionKey: string, field: string, value: unknown) {
    setSections((prev) => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], content: { ...prev[sectionKey].content, [field]: value } },
    }))
    setSaved(false)
  }

  function toggleVisibility(sectionKey: string) {
    setSections((prev) => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], is_visible: !prev[sectionKey].is_visible },
    }))
    setSaved(false)
  }

  function moveSection(key: string, direction: -1 | 1) {
    const keys = sortedKeys
    const idx = keys.indexOf(key)
    const targetIdx = idx + direction
    if (targetIdx < 0 || targetIdx >= keys.length) return

    setSections((prev) => {
      const updated = { ...prev }
      const currentPos = updated[key].position
      const targetKey = keys[targetIdx]
      const targetPos = updated[targetKey].position
      updated[key] = { ...updated[key], position: targetPos }
      updated[targetKey] = { ...updated[targetKey], position: currentPos }
      return updated
    })
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

      for (const key of Object.keys(sections)) {
        const sec = sections[key]
        if (!sec) continue
        const def = LANDING_DEFAULTS.find((d) => d.section_key === key)

        // Try with variant column, fallback without if migration not run yet
        const row = {
          section_key: key,
          variant: VARIANT,
          label: def?.label || SECTION_LABELS[key]?.label || key,
          position: sec.position,
          is_visible: sec.is_visible,
          content: sec.content,
          styles: def?.styles || {},
          updated_by: user?.id || null,
          updated_at: now,
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: upsertError } = await (supabase.from('landing_sections') as any)
          .upsert(row, { onConflict: 'section_key,variant' })

        if (upsertError) {
          setError(`Erreur ${key}: ${upsertError.message}`)
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

  /* ── Créer une nouvelle section ── */
  const [showNewSection, setShowNewSection] = useState(false)
  const [newSectionName, setNewSectionName] = useState('')
  const [newSectionType, setNewSectionType] = useState<'normal' | 'html'>('normal')

  function createSection() {
    if (!newSectionName.trim()) return
    const key = `custom_${Date.now()}`
    const maxPos = Math.max(...Object.values(sections).map((s) => s.position), 0) + 1

    const content: SectionContent = newSectionType === 'html'
      ? {
          title: newSectionName.trim(),
          html_content: '<h2>Votre titre</h2>\n<p>Votre contenu ici...</p>',
          is_html: true,
        }
      : {
          title: newSectionName.trim(),
          subtitle: '',
          description: '',
          image_url: '',
          button_label: '',
          button_href: '',
          is_html: false,
        }

    setSections((prev) => ({
      ...prev,
      [key]: { content, is_visible: true, position: maxPos },
    }))
    SECTION_LABELS[key] = { label: newSectionName.trim(), icon: newSectionType === 'html' ? '🖥️' : '📄' }
    setSelectedSection(key)
    setNewSectionName('')
    setShowNewSection(false)
    setSaved(false)
  }

  function deleteSection(key: string) {
    setSections((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
    if (selectedSection === key) {
      setSelectedSection(sortedKeysRef.current[0] || 'hero')
    }
    setSaved(false)
  }

  const sortedKeys = Object.keys(sections)
    .sort((a, b) => (sections[a]?.position ?? 99) - (sections[b]?.position ?? 99))
  const sortedKeysRef = { current: sortedKeys }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#74C0FC] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 z-20 py-4 -mx-4 px-4" style={{ background: 'var(--dark)' }}>
        <div>
          <h1 className="font-display text-3xl font-semibold" style={{ color: '#74C0FC' }}>Landing Page</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Votre version — Toutes les sections sont modifiables et réorganisables
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm font-medium" style={{ color: '#55EFC4' }}>Sauvegardé !</span>}
          <a href="/?preview=thomas" target="_blank" rel="noopener noreferrer"
            className="px-5 py-3 rounded-xl text-sm font-semibold cursor-pointer"
            style={{ border: '1px solid var(--dark-border)', color: 'var(--text-secondary)' }}>
            Prévisualiser
          </a>
          <button onClick={handleSave} disabled={saving}
            className="px-6 py-3 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-50"
            style={{ background: '#74C0FC', color: '#fff' }}>
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm"
          style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.25)', color: '#FF6B6B' }}>
          {error}
        </div>
      )}

      {/* ── Dialog nouvelle section ── */}
      {showNewSection && (
        <div className="rounded-xl p-5 space-y-4"
          style={{ background: 'var(--dark-card)', border: '1px solid #74C0FC40' }}>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm" style={{ color: '#74C0FC' }}>Créer une nouvelle section</h3>
            <button type="button" onClick={() => setShowNewSection(false)}
              className="text-xs px-2 py-1 rounded cursor-pointer" style={{ color: 'var(--text-muted)' }}>Annuler</button>
          </div>
          <TextField label="Nom de la section" value={newSectionName} onChange={setNewSectionName} placeholder="Ex: Nos Partenaires" />
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Type de section</label>
            <div className="flex gap-3">
              <button type="button" onClick={() => setNewSectionType('normal')}
                className="flex-1 rounded-lg p-4 text-center cursor-pointer transition-colors"
                style={{
                  background: newSectionType === 'normal' ? 'rgba(116,192,252,0.1)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${newSectionType === 'normal' ? '#74C0FC' : 'var(--dark-border)'}`,
                }}>
                <span className="block text-2xl mb-2">📄</span>
                <span className="block text-sm font-medium" style={{ color: newSectionType === 'normal' ? '#74C0FC' : 'var(--text-primary)' }}>Normal</span>
                <span className="block text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>Titre, texte, image, bouton</span>
              </button>
              <button type="button" onClick={() => setNewSectionType('html')}
                className="flex-1 rounded-lg p-4 text-center cursor-pointer transition-colors"
                style={{
                  background: newSectionType === 'html' ? 'rgba(116,192,252,0.1)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${newSectionType === 'html' ? '#74C0FC' : 'var(--dark-border)'}`,
                }}>
                <span className="block text-2xl mb-2">🖥️</span>
                <span className="block text-sm font-medium" style={{ color: newSectionType === 'html' ? '#74C0FC' : 'var(--text-primary)' }}>HTML</span>
                <span className="block text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>Code HTML libre</span>
              </button>
            </div>
          </div>
          <button type="button" onClick={createSection} disabled={!newSectionName.trim()}
            className="w-full py-3 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-30"
            style={{ background: '#74C0FC', color: '#fff' }}>
            Créer la section
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4">
        {/* Sidebar */}
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
          <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--dark-border)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Sections ({sortedKeys.length})
            </p>
            <button type="button" onClick={() => setShowNewSection(true)}
              className="text-xs px-2 py-1 rounded cursor-pointer"
              style={{ color: '#74C0FC', border: '1px solid rgba(116,192,252,0.3)' }}>
              + Nouvelle
            </button>
          </div>
          <div className="max-h-[70vh] overflow-y-auto">
            {sortedKeys.map((key, idx) => {
              const info = SECTION_LABELS[key] || { label: key, icon: '📄' }
              const sec = sections[key]
              const isSelected = key === selectedSection
              return (
                <div key={key}
                  className="flex items-center px-2 py-1.5 gap-1"
                  style={{
                    background: isSelected ? 'rgba(116,192,252,0.1)' : 'transparent',
                    borderBottom: '1px solid var(--dark-border)',
                    borderLeft: isSelected ? '3px solid #74C0FC' : '3px solid transparent',
                  }}>
                  {/* Move buttons */}
                  <div className="flex flex-col gap-0.5">
                    <button type="button" onClick={() => moveSection(key, -1)} disabled={idx === 0}
                      className="p-0.5 rounded cursor-pointer disabled:opacity-20" style={{ color: 'var(--text-muted)' }}>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                      </svg>
                    </button>
                    <button type="button" onClick={() => moveSection(key, 1)} disabled={idx === sortedKeys.length - 1}
                      className="p-0.5 rounded cursor-pointer disabled:opacity-20" style={{ color: 'var(--text-muted)' }}>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                  </div>

                  {/* Section label */}
                  <button type="button" onClick={() => setSelectedSection(key)}
                    className="flex-1 text-left px-2 py-1.5 flex items-center gap-2 cursor-pointer">
                    <span className="text-sm flex-shrink-0">{info.icon}</span>
                    <span className="text-xs font-medium truncate" style={{ color: isSelected ? '#74C0FC' : 'var(--text-primary)' }}>
                      {info.label}
                    </span>
                  </button>

                  {/* Visibility toggle */}
                  <button type="button" onClick={() => toggleVisibility(key)}
                    className="p-1.5 rounded cursor-pointer flex-shrink-0"
                    style={{ color: sec?.is_visible ? '#74C0FC' : 'var(--text-muted)' }}>
                    {sec?.is_visible ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Editor panel */}
        <div className="rounded-xl p-6" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
          {selectedSection && sections[selectedSection] ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{SECTION_LABELS[selectedSection]?.icon || '📄'}</span>
                  <div>
                    <h2 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
                      {SECTION_LABELS[selectedSection]?.label || selectedSection}
                    </h2>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {sections[selectedSection].is_visible ? 'Visible' : 'Masquée'} · Position {sections[selectedSection].position}
                      {selectedSection.startsWith('custom_') && ' · Section personnalisée'}
                    </p>
                  </div>
                </div>
                {selectedSection.startsWith('custom_') && (
                  <button type="button" onClick={() => { if (confirm('Supprimer cette section ?')) deleteSection(selectedSection) }}
                    className="text-xs px-3 py-1.5 rounded-lg cursor-pointer"
                    style={{ color: '#FF6B6B', border: '1px solid rgba(255,107,107,0.3)' }}>
                    Supprimer
                  </button>
                )}
              </div>

              {/* HTML section: show code editor + preview */}
              {sections[selectedSection].content.is_html ? (
                <div className="space-y-4">
                  <TextField
                    label="Titre de la section"
                    value={sections[selectedSection].content.title || ''}
                    onChange={(v) => updateContent(selectedSection, 'title', v)}
                  />
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Contenu HTML</label>
                    <textarea
                      value={sections[selectedSection].content.html_content || ''}
                      onChange={(e) => updateContent(selectedSection, 'html_content', e.target.value)}
                      rows={20}
                      className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-y font-mono"
                      style={inputStyle}
                      placeholder="<h2>Titre</h2>\n<p>Votre contenu...</p>"
                    />
                    <p className="text-[10px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
                      HTML : &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;a&gt;, &lt;img&gt;, &lt;div&gt;, &lt;section&gt;
                    </p>
                  </div>
                  {sections[selectedSection].content.html_content && (
                    <div className="rounded-lg p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)' }}>
                      <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Aperçu</p>
                      <div className="prose prose-invert prose-sm max-w-none" style={{ color: 'var(--text-secondary)' }}
                        dangerouslySetInnerHTML={{ __html: sections[selectedSection].content.html_content }} />
                    </div>
                  )}
                </div>
              ) : (
                <GenericSectionEditor
                  content={sections[selectedSection].content}
                  sectionKey={selectedSection}
                  onChange={(field, value) => updateContent(selectedSection, field, value)}
                />
              )}
            </>
          ) : (
            <p className="text-sm py-12 text-center" style={{ color: 'var(--text-muted)' }}>
              Sélectionnez une section à modifier
            </p>
          )}
        </div>
      </div>

      {/* Bottom save */}
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
