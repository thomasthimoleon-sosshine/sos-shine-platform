'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// Maps DB setting keys to CSS custom properties
const COLOR_MAP: Record<string, string> = {
  color_primary:        '--gold',
  color_secondary:      '--accent',
  color_bg:             '--dark',
  color_card:           '--dark-card',
  color_border:         '--dark-border',
  color_text:           '--text-primary',
  color_text_secondary: '--text-secondary',
  color_text_muted:     '--text-muted',
  color_button:         '--button-bg',
}

function hexShift(hex: string, dr: number, dg: number, db: number): string {
  const h = hex.replace('#', '')
  const r = Math.max(0, Math.min(255, parseInt(h.substring(0, 2), 16) + dr))
  const g = Math.max(0, Math.min(255, parseInt(h.substring(2, 4), 16) + dg))
  const b = Math.max(0, Math.min(255, parseInt(h.substring(4, 6), 16) + db))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false)

  const applyTheme = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', Object.keys(COLOR_MAP))

      if (data && data.length > 0) {
        const root = document.documentElement
        data.forEach((row: { key: string; value: string }) => {
          if (row.value && COLOR_MAP[row.key]) {
            root.style.setProperty(COLOR_MAP[row.key], row.value)
          }
        })

        // Derive gold-light and gold-deep from primary
        const primary = data.find((r: { key: string }) => r.key === 'color_primary')
        if (primary?.value) {
          root.style.setProperty('--gold-light', hexShift(primary.value, 20, 29, 55))
          root.style.setProperty('--gold-deep', hexShift(primary.value, -28, -25, -40))
        }
      }
    } catch {
      // Silently use CSS defaults from globals.css
    }
    setLoaded(true)
  }, [])

  useEffect(() => {
    applyTheme()
  }, [applyTheme])

  useEffect(() => {
    const saved = localStorage.getItem('sos-shine-theme') as 'dark' | 'light' | null
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved)
    }
  }, [])

  return <>{children}</>
}
