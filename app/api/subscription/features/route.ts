import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const featureKey = searchParams.get('feature')

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Config missing' }, { status: 500 })
    }

    const supabase = createSupabaseClient(supabaseUrl, supabaseKey)

    // Si on demande les features d'un utilisateur spécifique
    if (userId) {
      // Récupérer le profil et l'abonnement
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, plan, is_active')
        .eq('id', userId)
        .single()

      if (!profile) {
        return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
      }

      const isAdmin = ['founder', 'admin_content', 'admin_support'].includes(profile.role)

      // Admins ont accès à tout
      if (isAdmin) {
        const { data: allFeatures } = await supabase
          .from('plan_features')
          .select('feature_key, feature_label')
          .eq('plan', 'premium')
        return NextResponse.json({
          plan: 'admin',
          is_admin: true,
          features: (allFeatures || []).reduce((acc, f) => ({ ...acc, [f.feature_key]: true }), {}),
        })
      }

      // Vérifier l'abonnement
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('plan, status')
        .eq('user_id', userId)
        .single()

      const isActive = sub && (sub.status === 'active' || sub.status === 'trialing')
      const userPlan = isActive ? sub.plan : null

      if (!userPlan) {
        return NextResponse.json({
          plan: null,
          is_active: false,
          features: {},
        })
      }

      // Récupérer les features du plan
      const { data: features } = await supabase
        .from('plan_features')
        .select('feature_key, feature_label, is_enabled')
        .eq('plan', userPlan)

      const featureMap = (features || []).reduce((acc, f) => ({
        ...acc,
        [f.feature_key]: f.is_enabled,
      }), {} as Record<string, boolean>)

      // Si on demande une feature spécifique
      if (featureKey) {
        return NextResponse.json({
          plan: userPlan,
          feature: featureKey,
          has_access: featureMap[featureKey] || false,
        })
      }

      return NextResponse.json({
        plan: userPlan,
        is_active: true,
        features: featureMap,
      })
    }

    // Sans user_id, retourner toutes les features par plan (pour la page pricing)
    const { data: allFeatures } = await supabase
      .from('plan_features')
      .select('plan, feature_key, feature_label, is_enabled')
      .order('plan')

    const byPlan: Record<string, Record<string, boolean>> = {}
    const labels: Record<string, string> = {}

    for (const f of allFeatures || []) {
      if (!byPlan[f.plan]) byPlan[f.plan] = {}
      byPlan[f.plan][f.feature_key] = f.is_enabled
      labels[f.feature_key] = f.feature_label
    }

    return NextResponse.json({ plans: byPlan, labels })
  } catch (err) {
    console.error('Features API error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
