'use client'

import { useState } from 'react'

/* ── Font, alignment, size options ── */
const FONTS = [
  { value: 'Cormorant Garamond', label: 'Cormorant Garamond', desc: 'Élégant' },
  { value: 'DM Sans', label: 'DM Sans', desc: 'Moderne' },
  { value: 'Georgia', label: 'Georgia', desc: 'Classique' },
  { value: 'Arial', label: 'Arial', desc: 'Simple' },
  { value: 'Times New Roman', label: 'Times New Roman', desc: 'Serif' },
]

const SIZES: { value: string; label: string; px: string }[] = [
  { value: 'sm', label: 'S', px: '30px' },
  { value: 'md', label: 'M', px: '36px' },
  { value: 'lg', label: 'L', px: '48px' },
  { value: 'xl', label: 'XL', px: '60px' },
  { value: '2xl', label: '2XL', px: '72px' },
]

const ALIGNS = [
  { value: 'left', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M3 6h18M3 12h12M3 18h16" /></svg> },
  { value: 'center', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M3 6h18M6 12h12M4 18h16" /></svg> },
  { value: 'right', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M3 6h18M9 12h12M5 18h16" /></svg> },
]

interface StyleToolbarProps {
  styles: Record<string, string>
  onChange: (field: string, value: string) => void
  previewText?: string
}

export default function LandingStyleToolbar({ styles, onChange, previewText }: StyleToolbarProps) {
  const [fontOpen, setFontOpen] = useState(false)
  const titleFont = styles.title_font || 'Cormorant Garamond'
  const titleSize = styles.title_size || 'lg'
  const titleAlign = styles.title_align || 'center'
  const titleColor = styles.title_color || ''
  const textFont = styles.text_font || 'DM Sans'
  const textAlign = styles.text_align || 'center'

  const sizeObj = SIZES.find(s => s.value === titleSize) || SIZES[2]

  return (
    <div className="space-y-4">
      <div className="pt-3 mt-1" style={{ borderTop: '1px solid var(--border)' }}>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Style de la section</p>
      </div>

      {/* Row 1: Title font + size + align + color */}
      <div className="flex flex-wrap gap-2 items-end">
        {/* Font selector with preview */}
        <div className="flex-1 min-w-[200px] relative">
          <label className="block text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Police titre</label>
          <button
            type="button"
            onClick={() => setFontOpen(!fontOpen)}
            className="w-full text-left rounded-lg px-3 py-2.5 text-sm outline-none cursor-pointer"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontFamily: titleFont,
            }}
          >
            {titleFont}
          </button>
          {fontOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setFontOpen(false)} />
              <div className="absolute left-0 right-0 top-full mt-1 z-40 rounded-xl overflow-hidden shadow-xl"
                style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
                {FONTS.map(f => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => { onChange('title_font', f.value); setFontOpen(false) }}
                    className="w-full text-left px-4 py-3 flex items-center justify-between transition-colors cursor-pointer"
                    style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(167,139,250,0.08)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '' }}
                  >
                    <span style={{ fontFamily: f.value, fontSize: '18px', color: 'var(--text-primary)' }}>{f.label}</span>
                    <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{f.desc}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Size selector */}
        <div>
          <label className="block text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Taille</label>
          <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            {SIZES.map(s => (
              <button
                key={s.value}
                type="button"
                onClick={() => onChange('title_size', s.value)}
                className="px-3 py-2.5 text-xs font-semibold cursor-pointer transition-colors"
                style={{
                  background: titleSize === s.value ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.03)',
                  color: titleSize === s.value ? '#A78BFA' : 'var(--text-muted)',
                  borderRight: '1px solid var(--border)',
                }}
                title={s.px}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Alignment */}
        <div>
          <label className="block text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Alignement</label>
          <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            {ALIGNS.map(a => (
              <button
                key={a.value}
                type="button"
                onClick={() => onChange('title_align', a.value)}
                className="px-3 py-2.5 cursor-pointer transition-colors"
                style={{
                  background: titleAlign === a.value ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.03)',
                  color: titleAlign === a.value ? '#A78BFA' : 'var(--text-muted)',
                  borderRight: '1px solid var(--border)',
                }}
              >
                {a.icon}
              </button>
            ))}
          </div>
        </div>

        {/* Title color */}
        <div>
          <label className="block text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Couleur titre</label>
          <div className="flex items-center gap-1.5">
            <input
              type="color"
              value={titleColor || '#C9A961'}
              onChange={e => onChange('title_color', e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer border-0"
              style={{ background: 'transparent' }}
            />
            <input
              type="text"
              value={titleColor || ''}
              onChange={e => onChange('title_color', e.target.value)}
              placeholder="Défaut"
              className="w-20 rounded-lg px-2 py-2.5 text-xs outline-none"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
          </div>
        </div>
      </div>

      {/* Row 2: Text font + align */}
      <div className="flex flex-wrap gap-2 items-end">
        <div className="min-w-[200px]">
          <label className="block text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Police texte</label>
          <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            {FONTS.slice(0, 3).map(f => (
              <button
                key={f.value}
                type="button"
                onClick={() => onChange('text_font', f.value)}
                className="flex-1 px-2 py-2.5 text-xs cursor-pointer transition-colors truncate"
                style={{
                  fontFamily: f.value,
                  background: textFont === f.value ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.03)',
                  color: textFont === f.value ? '#A78BFA' : 'var(--text-muted)',
                  borderRight: '1px solid var(--border)',
                }}
              >
                {f.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Align. texte</label>
          <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            {ALIGNS.map(a => (
              <button
                key={a.value}
                type="button"
                onClick={() => onChange('text_align', a.value)}
                className="px-3 py-2.5 cursor-pointer transition-colors"
                style={{
                  background: textAlign === a.value ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.03)',
                  color: textAlign === a.value ? '#A78BFA' : 'var(--text-muted)',
                  borderRight: '1px solid var(--border)',
                }}
              >
                {a.icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live preview */}
      {previewText && (
        <div className="rounded-xl p-6 mt-2" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)' }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Apercu</p>
          <div style={{ textAlign: titleAlign as 'left' | 'center' | 'right' }}>
            <h3 style={{
              fontFamily: titleFont,
              fontSize: sizeObj.px,
              color: titleColor || '#C9A961',
              lineHeight: 1.1,
              fontWeight: 300,
              marginBottom: '12px',
            }}>
              {previewText}
            </h3>
            <p style={{
              fontFamily: textFont,
              fontSize: '16px',
              color: '#C8A8B8',
              textAlign: textAlign as 'left' | 'center' | 'right',
            }}>
              Ceci est un apercu du style de texte pour cette section.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
