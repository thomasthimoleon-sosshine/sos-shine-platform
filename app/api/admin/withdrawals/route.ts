import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendTemplateEmail } from '@/lib/email-templates/automated-emails'
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

// GET — list all withdrawal requests
export async function GET() {
  const caller = await getCallerProfile()
  if (!caller || !isAdmin(caller.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('withdrawal_requests')
      .select('*, profiles:user_id(prenom, email, avatar_url)')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ withdrawals: data || [] })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// PATCH — process a withdrawal request (approve/complete/reject)
export async function PATCH(request: Request) {
  const caller = await getCallerProfile()
  if (!caller || !isAdmin(caller.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const { withdrawalId, action, admin_note } = await request.json()

    if (!withdrawalId || !action) {
      return NextResponse.json({ error: 'withdrawalId et action requis' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Fetch the withdrawal request
    const { data: withdrawal, error: fetchError } = await admin
      .from('withdrawal_requests')
      .select('*')
      .eq('id', withdrawalId)
      .single() as { data: { id: string; affiliate_id: string; amount: number; status: string } | null; error: unknown }

    if (fetchError || !withdrawal) {
      return NextResponse.json({ error: 'Demande introuvable' }, { status: 404 })
    }

    if (action === 'processing') {
      const { error } = await admin
        .from('withdrawal_requests')
        .update({
          status: 'processing',
          processed_by: caller.id,
          admin_note: admin_note || null,
        })
        .eq('id', withdrawalId)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, status: 'processing' })
    }

    if (action === 'complete') {
      // Mark as completed and update affiliate earnings
      const { error: updateError } = await admin
        .from('withdrawal_requests')
        .update({
          status: 'completed',
          processed_by: caller.id,
          processed_at: new Date().toISOString(),
          admin_note: admin_note || null,
        })
        .eq('id', withdrawalId)

      if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

      // Deduct from pending_earnings and add to paid_earnings
      const { data: affiliate } = await admin
        .from('affiliates')
        .select('pending_earnings, paid_earnings')
        .eq('id', withdrawal.affiliate_id)
        .single()

      if (affiliate) {
        await admin
          .from('affiliates')
          .update({
            pending_earnings: Math.max(0, (affiliate.pending_earnings || 0) - withdrawal.amount),
            paid_earnings: (affiliate.paid_earnings || 0) + withdrawal.amount,
          })
          .eq('id', withdrawal.affiliate_id)
      }

      // ── Email automatique : notification virement affilié ──
      const { data: affiliateData } = await admin
        .from('affiliates')
        .select('user_id')
        .eq('id', withdrawal.affiliate_id)
        .single()

      if (affiliateData) {
        const { data: prof } = await admin
          .from('profiles')
          .select('prenom, email')
          .eq('id', affiliateData.user_id)
          .single()

        if (prof?.email) {
          const amountFormatted = `${withdrawal.amount.toFixed(2).replace('.', ',')}€`
          sendTemplateEmail('affiliate_payout', prof.email, {
            firstName: prof.prenom || 'Ambassadeur',
            email: prof.email,
            payoutAmount: amountFormatted,
          }, { recipientName: prof.prenom || 'Ambassadeur' }).catch(() => {})
        }
      }

      return NextResponse.json({ success: true, status: 'completed' })
    }

    if (action === 'reject') {
      const { error } = await admin
        .from('withdrawal_requests')
        .update({
          status: 'rejected',
          processed_by: caller.id,
          processed_at: new Date().toISOString(),
          admin_note: admin_note || null,
        })
        .eq('id', withdrawalId)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, status: 'rejected' })
    }

    return NextResponse.json({ error: 'Action invalide (processing, complete, reject)' }, { status: 400 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST — user creates a withdrawal request
export async function POST(request: Request) {
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
    if (!user) {
      return NextResponse.json({ error: 'Non authentifie' }, { status: 401 })
    }

    const { amount, iban, paypal_email, payment_method } = await request.json()

    if (!amount || amount < 50) {
      return NextResponse.json({ error: 'Le montant minimum est de 50€' }, { status: 400 })
    }

    if (!payment_method || !['bank_transfer', 'paypal'].includes(payment_method)) {
      return NextResponse.json({ error: 'Methode de paiement invalide' }, { status: 400 })
    }

    if (payment_method === 'bank_transfer' && !iban) {
      return NextResponse.json({ error: 'IBAN requis pour un virement bancaire' }, { status: 400 })
    }

    if (payment_method === 'paypal' && !paypal_email) {
      return NextResponse.json({ error: 'Email PayPal requis' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Check affiliate exists and has enough pending earnings
    const { data: affiliate, error: affError } = await adminClient
      .from('affiliates')
      .select('id, pending_earnings, status')
      .eq('user_id', user.id)
      .eq('status', 'approved')
      .single()

    if (affError || !affiliate) {
      return NextResponse.json({ error: 'Compte affilie introuvable ou non approuve' }, { status: 400 })
    }

    if (affiliate.pending_earnings < amount) {
      return NextResponse.json({ error: 'Solde insuffisant' }, { status: 400 })
    }

    // Check no pending withdrawal request exists
    const { data: existingRequest } = await adminClient
      .from('withdrawal_requests')
      .select('id')
      .eq('user_id', user.id)
      .in('status', ['pending', 'processing'])
      .limit(1)

    if (existingRequest && existingRequest.length > 0) {
      return NextResponse.json({ error: 'Vous avez deja une demande de retrait en cours' }, { status: 400 })
    }

    // Create withdrawal request
    const { data: newRequest, error: insertError } = await adminClient
      .from('withdrawal_requests')
      .insert({
        user_id: user.id,
        affiliate_id: affiliate.id,
        amount,
        iban: iban || null,
        paypal_email: paypal_email || null,
        payment_method,
        status: 'pending',
        admin_note: null,
        processed_by: null,
        processed_at: null,
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, withdrawal: newRequest })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
