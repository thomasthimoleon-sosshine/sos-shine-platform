import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

async function verifyAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const role = (profile as { role?: string } | null)?.role
    return role === 'founder' || role === 'admin_content' || role === 'admin_support'
  } catch {
    return false
  }
}

// DELETE /api/ceremonie/reservations — delete one or many reservations
export async function DELETE(request: NextRequest) {
  if (!await verifyAdmin()) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const { ids } = await request.json() as { ids: string[] }
  if (!ids?.length) {
    return NextResponse.json({ error: 'ids requis' }, { status: 400 })
  }

  const admin = getAdminClient()
  if (!admin) return NextResponse.json({ error: 'Config manquante' }, { status: 500 })

  const { error } = await admin
    .from('ceremonie_reservations')
    .delete()
    .in('id', ids)

  if (error) return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  return NextResponse.json({ success: true, deleted: ids.length })
}
