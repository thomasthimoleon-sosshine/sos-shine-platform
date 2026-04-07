'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Variant {
  id: string
  name: string
  label: string
  is_active: boolean
}

interface Stats {
  variant_id: string
  variant_name: string
  variant_label: string
  total_visits: number
  conversions: number
  conversion_rate: number
  is_active: boolean
}

export default function ABTestingPage() {
  const [stats, setStats] = useState<Stats[]>([])
  const [loading, setLoading] = useState(true)
  const [variants, setVariants] = useState<Variant[]>([])

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    const supabase = createClient()

    // Charger les variantes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any
    const { data: variantsRaw } = await sb
      .from('landing_page_variants')
      .select('*')
      .order('name')

    if (!variantsRaw) {
      setLoading(false)
      return
    }

    const variantsData = variantsRaw as unknown as Variant[]
    setVariants(variantsData)

    // Charger les stats pour chaque variante
    const statsArr: Stats[] = []
    for (const v of variantsData) {
      const { count: totalVisits } = await sb
        .from('ab_test_visits')
        .select('*', { count: 'exact', head: true })
        .eq('variant_id', v.id)

      const { count: conversions } = await sb
        .from('ab_test_visits')
        .select('*', { count: 'exact', head: true })
        .eq('variant_id', v.id)
        .eq('converted', true)

      const visits = totalVisits || 0
      const convs = conversions || 0

      statsArr.push({
        variant_id: v.id,
        variant_name: v.name,
        variant_label: v.label,
        total_visits: visits,
        conversions: convs,
        conversion_rate: visits > 0 ? (convs / visits) * 100 : 0,
        is_active: v.is_active,
      })
    }

    setStats(statsArr)
    setLoading(false)
  }

  async function toggleVariant(variantId: string, isActive: boolean) {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb2 = supabase as any
    await sb2.from('landing_page_variants')
      .update({ is_active: !isActive })
      .eq('id', variantId)
    await loadStats()
  }

  async function resetStats() {
    if (!confirm('Supprimer toutes les données de visite A/B ? Cette action est irréversible.')) return
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('ab_test_visits').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await loadStats()
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#74C0FC] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const totalVisits = stats.reduce((sum, s) => sum + s.total_visits, 0)
  const totalConversions = stats.reduce((sum, s) => sum + s.conversions, 0)
  const bestVariant = stats.length > 0
    ? stats.reduce((best, s) => s.conversion_rate > best.conversion_rate ? s : best, stats[0])
    : null

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>A/B Testing</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Comparez les performances de vos landing pages. Chaque nouvelle IP voit alternativement A ou B.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="rounded-xl p-5" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Total visites</p>
          <p className="text-3xl font-display font-semibold" style={{ color: 'var(--text-primary)' }}>{totalVisits}</p>
        </div>
        <div className="rounded-xl p-5" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Total conversions</p>
          <p className="text-3xl font-display font-semibold" style={{ color: '#55EFC4' }}>{totalConversions}</p>
        </div>
        <div className="rounded-xl p-5" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Meilleure variante</p>
          <p className="text-xl font-display font-semibold" style={{ color: '#D4AF37' }}>
            {bestVariant && bestVariant.total_visits > 0 ? bestVariant.variant_label : 'Pas assez de données'}
          </p>
        </div>
      </div>

      {/* Variant details */}
      <div className="space-y-4">
        {stats.map((s) => {
          const barWidth = totalVisits > 0 ? (s.total_visits / totalVisits) * 100 : 0
          const isWinning = bestVariant && s.variant_id === bestVariant.variant_id && s.total_visits > 0

          return (
            <div key={s.variant_id} className="rounded-xl p-6 relative overflow-hidden"
              style={{
                background: 'var(--dark-card)',
                border: isWinning ? '1px solid rgba(85,239,196,0.3)' : '1px solid var(--dark-border)',
                boxShadow: isWinning ? '0 0 30px rgba(85,239,196,0.05)' : undefined,
              }}>
              {isWinning && (
                <div className="absolute top-3 right-3 text-[10px] px-2 py-1 rounded-full font-semibold"
                  style={{ background: 'rgba(85,239,196,0.15)', color: '#55EFC4' }}>
                  En tête
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{s.variant_label}</h3>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {s.is_active ? 'Active' : 'Inactive'} &mdash; {s.variant_name}
                  </p>
                </div>
                <button
                  onClick={() => toggleVariant(s.variant_id, s.is_active)}
                  className="px-4 py-2 rounded-lg text-xs font-medium cursor-pointer"
                  style={{
                    background: s.is_active ? 'rgba(255,107,107,0.1)' : 'rgba(85,239,196,0.1)',
                    color: s.is_active ? '#FF6B6B' : '#55EFC4',
                    border: `1px solid ${s.is_active ? 'rgba(255,107,107,0.2)' : 'rgba(85,239,196,0.2)'}`,
                  }}>
                  {s.is_active ? 'Désactiver' : 'Activer'}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Visites</p>
                  <p className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>{s.total_visits}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Conversions</p>
                  <p className="text-2xl font-semibold" style={{ color: '#55EFC4' }}>{s.conversions}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Taux de conversion</p>
                  <p className="text-2xl font-semibold" style={{ color: '#D4AF37' }}>{s.conversion_rate.toFixed(1)}%</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${barWidth}%`,
                    background: s.variant_name === 'default'
                      ? 'linear-gradient(135deg, #74C0FC, #4DA3E8)'
                      : 'linear-gradient(135deg, #A78BFA, #7C3AED)',
                  }}
                />
              </div>
              <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                {barWidth.toFixed(1)}% du trafic total
              </p>
            </div>
          )
        })}
      </div>

      {/* Reset button */}
      <div className="flex justify-end pb-8">
        <button onClick={resetStats}
          className="px-4 py-2 rounded-lg text-xs font-medium cursor-pointer"
          style={{ color: '#FF6B6B', border: '1px solid rgba(255,107,107,0.2)' }}>
          Réinitialiser les statistiques
        </button>
      </div>
    </div>
  )
}
