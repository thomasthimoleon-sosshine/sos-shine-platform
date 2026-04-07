import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: Détermine quelle variante afficher selon l'IP du visiteur
export async function GET(req: NextRequest) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = await createClient() as any

  // Récupérer l'IP du visiteur
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.headers.get('x-real-ip') || 'unknown'

  // Vérifier si ce visiteur a déjà été assigné à une variante
  const { data: existingVisit } = await supabase
    .from('ab_test_visits')
    .select('variant_id')
    .eq('visitor_ip', ip)
    .order('visited_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existingVisit) {
    // Retourner la variante déjà assignée
    const { data: variant } = await supabase
      .from('landing_page_variants')
      .select('name')
      .eq('id', existingVisit.variant_id)
      .single()

    return NextResponse.json({ variant: variant?.name || 'default', variant_id: existingVisit.variant_id })
  }

  // Récupérer les variantes actives
  const { data: variants } = await supabase
    .from('landing_page_variants')
    .select('id, name')
    .eq('is_active', true)
    .order('name')

  if (!variants || variants.length === 0) {
    return NextResponse.json({ variant: 'default', variant_id: null })
  }

  // Si une seule variante active, l'utiliser
  if (variants.length === 1) {
    const chosen = variants[0]
    await supabase.from('ab_test_visits').insert({
      visitor_ip: ip,
      variant_id: chosen.id,
      user_agent: req.headers.get('user-agent') || '',
    })
    return NextResponse.json({ variant: chosen.name, variant_id: chosen.id })
  }

  // Compter les visites par variante pour un round-robin équilibré
  const counts: Record<string, number> = {}
  for (const v of variants) {
    const { count } = await supabase
      .from('ab_test_visits')
      .select('*', { count: 'exact', head: true })
      .eq('variant_id', v.id)
    counts[v.id] = count || 0
  }

  // Choisir la variante avec le moins de visites (round-robin)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sorted = variants.sort((a: any, b: any) => (counts[a.id] || 0) - (counts[b.id] || 0))
  const chosen = sorted[0]

  // Enregistrer la visite
  await supabase.from('ab_test_visits').insert({
    visitor_ip: ip,
    variant_id: chosen.id,
    user_agent: req.headers.get('user-agent') || '',
  })

  return NextResponse.json({ variant: chosen.name, variant_id: chosen.id })
}

// POST: Marquer une conversion
export async function POST(req: NextRequest) {
  const { variant_id, conversion_type } = await req.json()

  if (!variant_id) {
    return NextResponse.json({ error: 'variant_id required' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = await createClient() as any
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.headers.get('x-real-ip') || 'unknown'

  // Trouver la visite la plus récente de cette IP pour cette variante
  const { data: visit } = await supabase
    .from('ab_test_visits')
    .select('id')
    .eq('visitor_ip', ip)
    .eq('variant_id', variant_id)
    .eq('converted', false)
    .order('visited_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (visit) {
    await supabase
      .from('ab_test_visits')
      .update({
        converted: true,
        converted_at: new Date().toISOString(),
        conversion_type: conversion_type || 'signup',
      })
      .eq('id', visit.id)
  }

  return NextResponse.json({ success: true })
}
