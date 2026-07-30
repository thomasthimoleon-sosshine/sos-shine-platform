import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { PROFILES, type ProfileKey } from '@/lib/signature-test'
import { generateSignatureResultEmail } from '@/lib/email-templates/signature-result'
import { getResendClient } from '@/lib/crm/resend'
import { withTrackingPixel } from '@/lib/crm/tracking-pixel'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL
    || (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : null)
    || 'https://sosshine.com'
}

export async function POST(request: NextRequest) {
  try {
    const { rateLimit, getIp } = await import('@/lib/rate-limit')
    const { allowed } = rateLimit(getIp(request), { maxRequests: 10, windowMs: 60_000 })
    if (!allowed) return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 })

    const { email, firstName, profileKey, profileName } = await request.json()
    // Read A/B variant from cookie for lead attribution
    const abVariantRaw = request.cookies.get('ab_variant')?.value
    const abVariant = (abVariantRaw === 'julia' || abVariantRaw === 'thomas') ? abVariantRaw : null

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }

    // Anti-spam validation
    const { validateAntiSpam } = await import('@/lib/anti-spam')
    const spamError = validateAntiSpam(email, firstName)
    if (spamError) {
      return NextResponse.json({ error: spamError }, { status: 400 })
    }

    const supabase = getAdminClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Configuration serveur manquante' }, { status: 500 })
    }

    const cleanEmail = email.toLowerCase().trim()
    const cleanName = firstName?.trim() || null

    const { error } = await supabase.from('signature_leads').upsert({
      email: cleanEmail,
      first_name: cleanName,
      profile_key: profileKey || null,
      profile_name: profileName || null,
      created_at: new Date().toISOString(),
    }, { onConflict: 'email' })

    if (error) {
      console.error('Signature lead insert error:', error)
      if (error.code === '42P01') {
        return NextResponse.json({ message: 'table_missing' }, { status: 200 })
      }
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    // Enroll in CRM contacts (with A/B variant attribution)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('crm_contacts') as any).upsert({
        email: cleanEmail,
        first_name: cleanName,
        source: 'signature_test',
        ...(abVariant ? { ab_variant: abVariant } : {}),
      }, { onConflict: 'email', ignoreDuplicates: true })
    } catch {}

    // Enroll in CRM sequence
    try {
      const siteUrl = getSiteUrl()
      if (siteUrl) {
        await fetch(`${siteUrl}/api/crm/sequences/enroll`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trigger_type: 'signature_test',
            email: cleanEmail,
            first_name: cleanName,
          }),
        })
      }
    } catch {}

    // Send result email
    let emailSent = false
    if (profileKey && PROFILES[profileKey as ProfileKey]) {
      try {
        const profile = PROFILES[profileKey as ProfileKey]
        const siteUrl = getSiteUrl()
        const displayName = cleanName || 'Cher(e) membre'
        const { subject, html } = generateSignatureResultEmail(displayName, profile, siteUrl)

        const { client: resend, fromEmail } = await getResendClient()
        const { error: sendErr } = await resend.emails.send({
          from: `SOS Shine® <${fromEmail}>`,
          to: cleanEmail,
          subject,
          html: withTrackingPixel(html, cleanEmail, 'signature_result'),
        })

        if (!sendErr) {
          emailSent = true
          // Log in CRM events for tracking
          try {
            await supabase.from('crm_campaign_events').insert({
              contact_email: cleanEmail,
              event_type: 'signature_result_sent',
              metadata: {
                email: cleanEmail,
                first_name: cleanName,
                profile_key: profileKey,
                profile_name: profileName,
                sent_at: new Date().toISOString(),
              },
            })
          } catch {}
        } else {
          console.error('Signature result email send error:', sendErr)
        }
      } catch (e) {
        console.error('Failed to send signature result email:', e)
      }
    }

    return NextResponse.json({ message: 'success', emailSent }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
