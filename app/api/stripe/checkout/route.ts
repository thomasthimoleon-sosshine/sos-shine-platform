import { NextResponse } from 'next/server'
import { getPaymentLink, PLAN_NAMES } from '@/lib/stripe'
import type { PlanId, DurationId } from '@/lib/stripe'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { sendRawEmail } from '@/lib/email-templates/automated-emails'
import crypto from 'crypto'

const VALID_PLANS: PlanId[] = ['essential', 'serenite', 'premium']
const VALID_DURATIONS: DurationId[] = ['monthly', 'quarterly', 'semiannual', 'annual']

export async function POST(request: Request) {
  try {
    const { plan, duration = 'monthly', email, prenom } = await request.json()

    if (!plan || !VALID_PLANS.includes(plan)) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
    }

    if (!VALID_DURATIONS.includes(duration)) {
      return NextResponse.json({ error: 'Durée invalide' }, { status: 400 })
    }

    const effectiveDuration: DurationId = (plan === 'essential' && duration !== 'monthly') ? 'monthly' : duration
    const trimmedEmail = email?.trim()?.toLowerCase()

    if (!trimmedEmail) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 })
    }

    // Get payment link
    const paymentLink = getPaymentLink(plan as PlanId, effectiveDuration)
    if (!paymentLink) {
      return NextResponse.json({ error: `L'offre ${plan} en ${effectiveDuration} n'est pas encore disponible.` }, { status: 400 })
    }

    // Create account in Supabase before redirecting to Stripe
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const firstName = prenom?.trim() || 'Membre'
    const planName = PLAN_NAMES[plan as PlanId] || plan

    if (supabaseUrl && supabaseKey) {
      const supabase = createSupabaseClient(supabaseUrl, supabaseKey)

      // Check if user already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', trimmedEmail)
        .single()

      if (!existingProfile) {
        // Generate temp password and create account
        const tempPassword = crypto.randomBytes(6).toString('base64url')

        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: trimmedEmail,
          password: tempPassword,
          email_confirm: true,
        })

        if (authError || !authUser?.user) {
          console.error('[Checkout] Failed to create user:', authError)
          // Don't block — still redirect to payment
        } else {
          const userId = authUser.user.id

          // Create profile
          await supabase.from('profiles').upsert({
            id: userId,
            email: trimmedEmail,
            prenom: firstName !== 'Membre' ? firstName : null,
            role: 'member',
            plan,
            is_active: true,
            created_at: new Date().toISOString(),
          }, { onConflict: 'id' })

          // Create subscription record
          try {
            await supabase.from('subscriptions').upsert({
              user_id: userId,
              plan,
              duration: effectiveDuration,
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' })
          } catch {
            // Ignore subscription creation errors
          }

          // Send welcome email with credentials
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
            || (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : 'https://sosshine.com')

          console.log(`[Checkout] Sending welcome email to ${trimmedEmail}...`)
          const emailResult = await sendWelcomeEmail(trimmedEmail, firstName, planName, tempPassword, siteUrl)
          console.log(`[Checkout] Welcome email result for ${trimmedEmail}:`, JSON.stringify(emailResult))

          console.log(`[Checkout] Account created for ${trimmedEmail} — plan: ${plan}_${effectiveDuration}`)
        }
      } else {
        console.log(`[Checkout] User already exists: ${trimmedEmail}`)
      }
    }

    // Redirect to Stripe Payment Link
    const url = new URL(paymentLink)
    url.searchParams.set('prefilled_email', trimmedEmail)
    if (prenom) url.searchParams.set('client_reference_id', prenom.trim())

    return NextResponse.json({ url: url.toString() })
  } catch (err: unknown) {
    console.error('[Checkout] Error:', err)
    return NextResponse.json({ error: 'Une erreur est survenue. Veuillez réessayer.' }, { status: 500 })
  }
}

async function sendWelcomeEmail(
  email: string,
  firstName: string,
  planName: string,
  tempPassword: string,
  siteUrl: string,
) {
  const loginUrl = `${siteUrl}/login`
  const resetUrl = `${siteUrl}/forgot-password`

  const html = `
    <h2 style="color:#D4AF37;font-family:Georgia,'Times New Roman',serif;font-weight:300;font-size:24px;margin:0 0 24px;">
      Bienvenue dans SOS Shine, ${firstName} !
    </h2>
    <p style="color:#E0E0E0;font-size:15px;line-height:1.7;margin:0 0 16px;">
      Votre compte <strong>SOS Shine</strong> a &eacute;t&eacute; cr&eacute;&eacute; avec succ&egrave;s
      avec l'offre <strong style="color:#D4AF37;">${planName}</strong>.
    </p>
    <div style="background:rgba(212,175,55,0.08);border:1px solid rgba(212,175,55,0.2);border-radius:12px;padding:24px;margin:24px 0;">
      <p style="color:#D4AF37;font-size:13px;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 12px;font-weight:600;">
        Vos identifiants de connexion
      </p>
      <p style="color:#E0E0E0;font-size:15px;margin:0 0 8px;">
        <strong>Email :</strong> ${email}
      </p>
      <p style="color:#E0E0E0;font-size:15px;margin:0;">
        <strong>Mot de passe temporaire :</strong> <code style="background:rgba(255,255,255,0.08);padding:3px 8px;border-radius:4px;font-size:16px;letter-spacing:0.05em;">${tempPassword}</code>
      </p>
    </div>
    <p style="color:#E0E0E0;font-size:15px;line-height:1.7;margin:0 0 24px;">
      Connectez-vous et changez votre mot de passe d&egrave;s que possible pour s&eacute;curiser votre compte.
    </p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#D4AF37,#B8960F);color:#050505;padding:14px 40px;border-radius:50px;text-decoration:none;font-weight:600;font-size:15px;">
        Se connecter
      </a>
    </div>
    <p style="color:#999;font-size:13px;line-height:1.6;margin:24px 0 0;text-align:center;">
      Vous pouvez aussi <a href="${resetUrl}" style="color:#D4AF37;text-decoration:underline;">cr&eacute;er un nouveau mot de passe</a> si vous pr&eacute;f&eacute;rez.
    </p>
  `

  const result = await sendRawEmail(
    email,
    'Bienvenue sur SOS Shine — Vos identifiants de connexion',
    html,
    { recipientName: firstName }
  )
  console.log(`[Checkout] sendRawEmail result for ${email}:`, JSON.stringify(result))
  return result
}
