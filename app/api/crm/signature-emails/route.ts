import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/crm/supabase-admin'

export async function GET() {
  try {
    const supabase = getAdminClient()
    if (!supabase) {
      return NextResponse.json({ emails: [], total: 0 })
    }

    const { data, error } = await supabase
      .from('crm_campaign_events')
      .select('id, metadata, created_at')
      .eq('event_type', 'signature_result_sent')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      // Table might not exist yet
      if (error.code === '42P01') {
        return NextResponse.json({ emails: [], total: 0 })
      }
      console.error('Signature emails fetch error:', error)
      return NextResponse.json({ emails: [], total: 0 })
    }

    const { count } = await supabase
      .from('crm_campaign_events')
      .select('id', { count: 'exact', head: true })
      .eq('event_type', 'signature_result_sent')

    return NextResponse.json({
      emails: data || [],
      total: count || (data?.length ?? 0),
    })
  } catch (e) {
    console.error('Signature emails error:', e)
    return NextResponse.json({ emails: [], total: 0 })
  }
}
