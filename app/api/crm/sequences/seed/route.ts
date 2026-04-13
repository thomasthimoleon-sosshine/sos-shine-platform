import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/crm/supabase-admin'
import { verifyAdminAccess } from '@/lib/crm/auth'
import { EMAIL_TEMPLATE_SEEDS } from '@/lib/email-templates/seeds'

// =============================================
// Organisation des 23 templates de Julia en séquences
// Chaque séquence regroupe les templates par trigger_type
// =============================================

interface SequenceDef {
  name: string
  trigger_type: string
  template_keys: string[]
}

const SEQUENCE_DEFINITIONS: SequenceDef[] = [
  // ── 0. INSCRIPTION GRATUITE → CONVERSION (5 templates) ──
  // Nouveaux inscrits sans abonnement : nurturing pour les convertir
  {
    name: 'Parcours Nouvel Inscrit (Free → Paid)',
    trigger_type: 'registration',
    template_keys: [
      'registration_welcome',
      'registration_conversion_j1',
      'registration_conversion_j3',
      'registration_conversion_j7',
      'registration_conversion_j14',
    ],
  },

  // ── 1. LISTE D'ATTENTE (3 templates) ──
  {
    name: 'Parcours Liste d\'attente',
    trigger_type: 'waitlist',
    template_keys: ['waitlist_confirmation', 'waitlist_reminder_j3', 'waitlist_opening'],
  },

  // ── 2. TEST SIGNATURE ÉMOTIONNELLE (3 templates) ──
  {
    name: 'Parcours Signature Émotionnelle',
    trigger_type: 'signature_test',
    template_keys: ['quiz_result', 'quiz_followup_j2', 'quiz_conversion_j5'],
  },

  // ── 3. NOUVEL ABONNÉ + NURTURING (6 templates) ──
  {
    name: 'Parcours Nouvel Abonné + Nurturing',
    trigger_type: 'subscription',
    template_keys: [
      'subscription_welcome',
      'subscription_confirmation',
      'nurturing_j1',
      'nurturing_j3',
      'nurturing_j7',
      'nurturing_j14',
    ],
  },

  // ── 4. RENOUVELLEMENT (3 templates) ──
  {
    name: 'Parcours Renouvellement',
    trigger_type: 'renewal',
    template_keys: ['renewal_reminder_j7', 'renewal_success', 'renewal_failed'],
  },

  // ── 5. RÉSILIATION + WIN-BACK (2 templates) ──
  {
    name: 'Parcours Résiliation + Win-back',
    trigger_type: 'cancellation',
    template_keys: ['cancellation_confirmation', 'cancellation_winback_j7'],
  },

  // ── 6. PROGRAMME AFFILIÉ (3 templates) ──
  {
    name: 'Parcours Programme Affilié',
    trigger_type: 'affiliate',
    template_keys: ['affiliate_welcome', 'affiliate_referral', 'affiliate_payout'],
  },

  // ── 7. ÉVÉNEMENTS (2 templates) ──
  {
    name: 'Parcours Événements',
    trigger_type: 'events',
    template_keys: ['event_registration', 'event_reminder'],
  },
]

// Build a lookup of template_key -> template seed data
const TEMPLATE_MAP = new Map(
  EMAIL_TEMPLATE_SEEDS.map(t => [t.template_key, t])
)

export async function POST() {
  try {
    const isAdmin = await verifyAdminAccess()
    if (!isAdmin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const supabase = getAdminClient()
    if (!supabase) return NextResponse.json({ error: 'Config missing' }, { status: 500 })

    let created = 0
    let skipped = 0
    const details: string[] = []

    for (const seqDef of SEQUENCE_DEFINITIONS) {
      // Check if a sequence with same name or trigger_type already exists
      const { data: existing } = await supabase
        .from('crm_sequences')
        .select('id')
        .eq('trigger_type', seqDef.trigger_type)
        .limit(1)

      if (existing && existing.length > 0) {
        skipped++
        details.push(`⏭ "${seqDef.name}" — déjà existante`)
        continue
      }

      // Build steps from Julia's templates
      const steps = seqDef.template_keys
        .map(key => TEMPLATE_MAP.get(key))
        .filter(Boolean)
        .map((template, i) => ({
          step_order: i,
          delay_days: template!.trigger_delay_days < 0
            ? 0 // negative delays (J-7, J-1) become 0 (event-triggered)
            : template!.trigger_delay_days,
          subject: template!.subject,
          html_content: template!.html_content,
        }))

      if (steps.length === 0) {
        details.push(`⚠ "${seqDef.name}" — aucun template trouvé`)
        continue
      }

      const { data: sequence, error } = await supabase
        .from('crm_sequences')
        .insert({
          name: seqDef.name,
          trigger_type: seqDef.trigger_type,
          status: 'active',
        })
        .select()
        .single()

      if (error) {
        console.error(`Failed to create sequence ${seqDef.name}:`, error)
        details.push(`❌ "${seqDef.name}" — erreur création`)
        continue
      }

      const stepsToInsert = steps.map(step => ({
        ...step,
        sequence_id: sequence.id,
      }))

      const { error: stepsErr } = await supabase
        .from('crm_sequence_steps')
        .insert(stepsToInsert)

      if (stepsErr) {
        console.error(`Failed to create steps for ${seqDef.name}:`, stepsErr)
        details.push(`❌ "${seqDef.name}" — erreur steps`)
        continue
      }

      created++
      details.push(`✅ "${seqDef.name}" — ${steps.length} emails`)
    }

    return NextResponse.json({
      success: true,
      message: `${created} séquences créées, ${skipped} déjà existantes`,
      total: SEQUENCE_DEFINITIONS.length,
      details,
    })
  } catch (err) {
    console.error('Seed sequences error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
