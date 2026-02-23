import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/crm/supabase-admin'

const PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const campaignId = searchParams.get('cid')
  const contactId = searchParams.get('uid')

  if (campaignId && contactId) {
    try {
      const supabase = getAdminClient()
      if (supabase) {
        const { data: existing } = await supabase
          .from('crm_campaign_events')
          .select('id')
          .eq('campaign_id', campaignId)
          .eq('contact_id', contactId)
          .eq('event_type', 'open')
          .limit(1)

        if (!existing || existing.length === 0) {
          await supabase.from('crm_campaign_events').insert({
            campaign_id: campaignId,
            contact_id: contactId,
            event_type: 'open',
            metadata: {},
          })

          const { data: campData } = await supabase
            .from('crm_campaigns')
            .select('open_count')
            .eq('id', campaignId)
            .single()

          if (campData) {
            await supabase
              .from('crm_campaigns')
              .update({ open_count: (campData.open_count || 0) + 1 })
              .eq('id', campaignId)
          }
        }
      }
    } catch (e) {
      console.error('Track open error:', e)
    }
  }

  return new NextResponse(PIXEL, {
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}
