import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { LANDING_DEFAULTS, buildSectionMap } from '@/lib/landing-defaults'
import type { LandingSectionDefault, SectionContent, LandingVariant } from '@/lib/landing-defaults'
import LandingClient from './LandingClient'
import type { SectionMap } from './LandingClient'
import type { PrelaunchSettings } from './page-prelaunch'

function matchCase(original: string, replacement: string): string {
  if (original === original.toUpperCase()) return replacement.toUpperCase()
  if (original[0] === original[0].toUpperCase()) return replacement[0].toUpperCase() + replacement.slice(1)
  return replacement
}

function sanitizeContent(content: SectionContent): SectionContent {
  function sanitizeStr(str: string): string {
    let r = str
    r = r.replace(/Encyclopédie complète des douleurs/gi, (m) => {
      const isUpper = m[0] === m[0].toUpperCase()
      return isUpper ? 'Encyclopédie complète des expériences de vie' : 'encyclopédie complète des expériences de vie'
    })
    r = r.replace(/(\d+)\s+étapes?\s+par\s+douleur/gi, '$1 étapes par challenge émotionnel')
    r = r.replace(/Chat dédié par douleur/gi, (m) => matchCase(m[0], 'C') === 'C' ? 'Chat dédié par challenge émotionnel' : 'chat dédié par challenge émotionnel')
    r = r.replace(/une\s+douleur\s+ancienne/gi, (m) => matchCase(m[0], 'u') + 'n challenge émotionnel ancien')
    r = r.replace(/(chaque)\s+douleur/gi, (_m, p1: string) => p1 + ' challenge émotionnel')
    r = r.replace(/(la)\s+douleur/gi, (_m, p1: string) => matchCase(p1, 'le') + ' challenge émotionnel')
    r = r.replace(/(nouvelle)\s+douleur/gi, (_m, p1: string) => p1 + ' expérience de vie')
    r = r.replace(/(des|les|vos)\s+douleurs/gi, (_m, p1: string) => p1 + ' expériences de vie')
    r = r.replace(/douleurs/gi, (m) => m[0] === m[0].toUpperCase() ? 'Expériences de vie' : 'expériences de vie')
    r = r.replace(/douleur/gi, (m) => m[0] === m[0].toUpperCase() ? 'Challenge émotionnel' : 'challenge émotionnel')
    return r
  }

  function sanitizeValue(val: unknown): unknown {
    if (typeof val === 'string') return sanitizeStr(val)
    if (Array.isArray(val)) return val.map(sanitizeValue)
    if (val && typeof val === 'object') {
      const out: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(val)) out[k] = sanitizeValue(v)
      return out
    }
    return val
  }

  return sanitizeValue(content) as SectionContent
}

/** Determine which variant this visitor should see */
async function resolveVariant(cookieStore: Awaited<ReturnType<typeof cookies>>): Promise<LandingVariant> {
  // Check URL override (for preview mode)
  // This is handled client-side, so server just checks cookie

  // Check existing cookie
  const existingVariant = cookieStore.get('ab_variant')?.value
  if (existingVariant === 'julia' || existingVariant === 'thomas') {
    return existingVariant
  }

  // Check if A/B testing is active
  try {
    const supabase = await createClient()
    const { data: configRaw } = await supabase
      .from('ab_test_config')
      .select('is_active, split_ratio, variant_a, variant_b')
      .eq('test_name', 'landing_page')
      .maybeSingle()

    const config = configRaw as unknown as { is_active: boolean; split_ratio: number; variant_a: string; variant_b: string } | null

    if (config?.is_active) {
      // Random split based on ratio
      const random = Math.random()
      return random < (config.split_ratio || 0.5)
        ? (config.variant_a || 'julia') as LandingVariant
        : (config.variant_b || 'thomas') as LandingVariant
    }
  } catch {
    // A/B test config table may not exist yet — fall through
  }

  // Default: show Julia's version (existing behavior)
  return 'julia'
}

export default async function Home() {
  const cookieStore = await cookies()
  const variant = await resolveVariant(cookieStore)

  let initialSections: SectionMap = {}
  let initialPositions: Record<string, number> = {}
  let initialPrelaunchEnabled = false
  let initialPrelaunchSettings: PrelaunchSettings = {}

  try {
    const supabase = await createClient()

    // Fetch landing sections for the resolved variant
    const { data } = await supabase
      .from('landing_sections')
      .select('*')
      .eq('variant', variant)
      .order('position')

    if (data && data.length > 0) {
      const rows = data as unknown as LandingSectionDefault[]
      const dbMap = buildSectionMap(rows)
      const merged: SectionMap = {}
      const posMap: Record<string, number> = {}
      for (const d of LANDING_DEFAULTS) {
        const row = dbMap[d.section_key]
        merged[d.section_key] = row
          ? { content: sanitizeContent(row.content), styles: row.styles, is_visible: row.is_visible }
          : { content: d.content, styles: d.styles, is_visible: d.is_visible }
        if (row) posMap[row.section_key] = row.position
      }
      for (const row of rows) {
        if (!merged[row.section_key]) {
          merged[row.section_key] = { content: sanitizeContent(row.content), styles: row.styles, is_visible: row.is_visible }
        }
        if (!(row.section_key in posMap)) posMap[row.section_key] = row.position
      }
      initialSections = merged
      initialPositions = posMap
    } else {
      // Fallback: try without variant filter (backward compat for pre-migration)
      const { data: fallbackData } = await supabase
        .from('landing_sections')
        .select('*')
        .order('position')

      if (fallbackData && fallbackData.length > 0) {
        const rows = fallbackData as unknown as LandingSectionDefault[]
        const dbMap = buildSectionMap(rows)
        const merged: SectionMap = {}
        const posMap: Record<string, number> = {}
        for (const d of LANDING_DEFAULTS) {
          const row = dbMap[d.section_key]
          merged[d.section_key] = row
            ? { content: sanitizeContent(row.content), styles: row.styles, is_visible: row.is_visible }
            : { content: d.content, styles: d.styles, is_visible: d.is_visible }
          if (row) posMap[row.section_key] = row.position
        }
        for (const row of rows) {
          if (!merged[row.section_key]) {
            merged[row.section_key] = { content: sanitizeContent(row.content), styles: row.styles, is_visible: row.is_visible }
          }
          if (!(row.section_key in posMap)) posMap[row.section_key] = row.position
        }
        initialSections = merged
        initialPositions = posMap
      }
    }

    // Fetch prelaunch settings server-side
    const { data: settingsData } = await supabase.from('site_settings').select('key, value').like('key', 'prelaunch_%')
    if (settingsData && settingsData.length > 0) {
      const map: Record<string, string> = {}
      settingsData.forEach((row: { key: string; value: string }) => {
        map[row.key] = row.value
      })
      initialPrelaunchSettings = map
      initialPrelaunchEnabled = map.prelaunch_enabled === 'true'
    }
  } catch {
    // Fallback to client-side loading
  }

  return (
    <LandingClient
      initialSections={initialSections}
      initialPositions={initialPositions}
      initialPrelaunchEnabled={initialPrelaunchEnabled}
      initialPrelaunchSettings={initialPrelaunchSettings}
      variant={variant}
    />
  )
}
