import { NextRequest, NextResponse } from 'next/server'
import { generateSignatureLetter } from '@/lib/email-templates/signature-letter'

export async function POST(request: NextRequest) {
  try {
    const { rateLimit, getIp } = await import('@/lib/rate-limit')
    const { allowed } = rateLimit(getIp(request), { maxRequests: 10, windowMs: 60_000 })
    if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const { slug, prenom, email } = await request.json()
    if (!slug || !email) {
      return NextResponse.json({ error: 'slug and email required' }, { status: 400 })
    }

    const result = generateSignatureLetter({
      slug,
      prenom: prenom || '',
      email,
    })
    if (!result) {
      return NextResponse.json({ error: 'Unknown slug' }, { status: 400 })
    }

    const { getResendClient } = await import('@/lib/crm/resend')
    const { client, fromEmail } = await getResendClient({ transactionnel: true })

    await client.emails.send({
      from: fromEmail,
      to: email.toLowerCase().trim(),
      subject: result.subject,
      html: result.html,
    })

    return NextResponse.json({ ok: true, sent: true })
  } catch (e) {
    console.error('Signature letter email error:', e)
    return NextResponse.json({ ok: true, sent: false })
  }
}
