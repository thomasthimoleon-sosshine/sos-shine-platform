import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendTemplateEmail } from '@/lib/email-templates/automated-emails'
import { enrollInSequence } from '@/lib/crm/enroll'
import type { Database } from '@/types/database'

async function getCallerProfile(): Promise<{ id: string; role: string } | null> {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() {},
        },
      }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single()
    return profile as { id: string; role: string } | null
  } catch {
    return null
  }
}

function isAdmin(role: string): boolean {
  return role === 'founder' || role === 'admin_content' || role === 'admin_support'
}

// GET - list all affiliate applications (candidatures)
export async function GET() {
  const caller = await getCallerProfile()
  if (!caller || !isAdmin(caller.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('affiliates')
      .select('*, profiles:user_id(prenom, email, avatar_url)')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
    }

    return NextResponse.json({ candidatures: data || [] })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// PATCH - approve or reject a candidature
export async function PATCH(request: Request) {
  const caller = await getCallerProfile()
  if (!caller || !isAdmin(caller.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const { affiliateId, action, rejection_reason } = await request.json()

    if (!affiliateId || !action) {
      return NextResponse.json({ error: 'affiliateId et action requis' }, { status: 400 })
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ error: 'Action invalide (approve ou reject)' }, { status: 400 })
    }

    const admin = createAdminClient()

    if (action === 'approve') {
      const { error } = await admin
        .from('affiliates')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          rejected_at: null,
          rejection_reason: null,
        })
        .eq('id', affiliateId)

      if (error) return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })

      // ── Email automatique : bienvenue programme affilié ──
      const { data: affiliateProfile } = await admin
        .from('affiliates')
        .select('user_id, profiles:user_id(prenom, email)')
        .eq('id', affiliateId)
        .single()

      const prof = (affiliateProfile as any)?.profiles
      if (prof?.email) {
        sendTemplateEmail('affiliate_welcome', prof.email, {
          firstName: prof.prenom || 'Ambassadeur',
          email: prof.email,
        }, { recipientName: prof.prenom || 'Ambassadeur' }).catch(() => {})

        // Enrôler dans la séquence CRM "affiliate"
        enrollInSequence('affiliate', prof.email, prof.prenom).catch(() => {})
      }

      return NextResponse.json({ success: true, status: 'approved' })
    }

    if (action === 'reject') {
      const { error } = await admin
        .from('affiliates')
        .update({
          status: 'rejected',
          rejected_at: new Date().toISOString(),
          rejection_reason: rejection_reason || null,
        })
        .eq('id', affiliateId)

      if (error) return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
      return NextResponse.json({ success: true, status: 'rejected' })
    }

    return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
