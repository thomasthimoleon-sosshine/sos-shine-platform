/**
 * CERVEAU CENTRAL DES SÉQUENCES DE CYCLE DE VIE
 * ------------------------------------------------
 * Garantit la règle d'or « jamais deux files à la fois ».
 *
 * Trois files mutuellement exclusives :
 *   member_onboarding  (File A) — déclenchée au paiement d'un abonnement
 *   protocol_33        (File B) — déclenchée à l'achat d'un protocole 33€ sans abo
 *   nurture_silence    (File C) — déclenchée si rien au soir du 14e jour
 *
 * enrollInLifecycle() inscrit un contact dans UNE file et le désinscrit
 * automatiquement des deux autres. C'est le seul point d'entrée : aucun
 * `scheduleEmail` éparpillé, donc aucun doublon possible.
 *
 * L'envoi et l'avancement des pas sont assurés par le cron générique
 * (app/api/cron/emails/route.ts), qui traite crm_sequence_enrollments.
 */
import type { SupabaseClient } from '@supabase/supabase-js'

export const LIFECYCLE_TRIGGERS = ['member_onboarding', 'protocol_33', 'nurture_silence'] as const
export type LifecycleTrigger = (typeof LIFECYCLE_TRIGGERS)[number]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DB = SupabaseClient<any, any, any>

async function getSequenceId(supabase: DB, trigger: LifecycleTrigger): Promise<string | null> {
  const { data } = await supabase
    .from('crm_sequences')
    .select('id')
    .eq('trigger_type', trigger)
    .eq('status', 'active')
    .limit(1)
  return data && data.length > 0 ? data[0].id : null
}

/**
 * Inscrit un contact dans UNE file de cycle de vie et le sort de toutes les autres.
 * Idempotent : si le contact est déjà actif dans la file cible, ne fait rien.
 *
 * @returns un résumé de l'action (utile pour les logs / tests)
 */
export async function enrollInLifecycle(
  supabase: DB,
  opts: { email: string; firstName?: string | null; trigger: LifecycleTrigger }
): Promise<{ enrolled: boolean; cancelledOthers: number; reason?: string }> {
  const email = opts.email.trim().toLowerCase()
  if (!email) return { enrolled: false, cancelledOthers: 0, reason: 'no-email' }

  const targetId = await getSequenceId(supabase, opts.trigger)
  if (!targetId) return { enrolled: false, cancelledOthers: 0, reason: 'sequence-missing' }

  // Toutes les séquences de cycle de vie, pour identifier "les autres".
  const { data: allSeqs } = await supabase
    .from('crm_sequences')
    .select('id, trigger_type')
    .in('trigger_type', LIFECYCLE_TRIGGERS as unknown as string[])

  const otherIds = (allSeqs || []).filter((s: { id: string }) => s.id !== targetId).map((s: { id: string }) => s.id)

  // 1. Désinscrire des autres files (statut → 'cancelled').
  let cancelledOthers = 0
  if (otherIds.length > 0) {
    const { data: cancelled } = await supabase
      .from('crm_sequence_enrollments')
      .update({ status: 'cancelled' })
      .eq('contact_email', email)
      .eq('status', 'active')
      .in('sequence_id', otherIds)
      .select('id')
    cancelledOthers = cancelled ? cancelled.length : 0
  }

  // 2. Déjà actif dans la file cible ? → rien à faire (pas de doublon).
  const { data: existing } = await supabase
    .from('crm_sequence_enrollments')
    .select('id')
    .eq('contact_email', email)
    .eq('sequence_id', targetId)
    .eq('status', 'active')
    .limit(1)
  if (existing && existing.length > 0) {
    return { enrolled: false, cancelledOthers, reason: 'already-active' }
  }

  // 3. Inscrire dans la file cible : premier pas, envoyé au prochain passage du cron.
  await supabase.from('crm_sequence_enrollments').insert({
    sequence_id: targetId,
    contact_email: email,
    contact_first_name: opts.firstName || null,
    current_step: 1,
    next_send_at: new Date().toISOString(),
    status: 'active',
  })

  return { enrolled: true, cancelledOthers }
}

/**
 * Renvoie le trigger de la file de cycle de vie où le contact est ACTIF, ou null.
 * Sert de garde-fou : ne jamais enrôler en File C quelqu'un déjà dans A ou B.
 */
export async function activeLifecycleTrigger(supabase: DB, email: string): Promise<LifecycleTrigger | null> {
  const clean = email.trim().toLowerCase()
  if (!clean) return null
  const { data } = await supabase
    .from('crm_sequence_enrollments')
    .select('sequence_id, crm_sequences!inner(trigger_type)')
    .eq('contact_email', clean)
    .eq('status', 'active')
  if (!data || data.length === 0) return null
  for (const row of data as Array<{ crm_sequences?: { trigger_type?: string } }>) {
    const t = row.crm_sequences?.trigger_type
    if (t && (LIFECYCLE_TRIGGERS as readonly string[]).includes(t)) return t as LifecycleTrigger
  }
  return null
}

/** Sort un contact de toutes les files de cycle de vie (ex. résiliation, désabonnement). */
export async function exitAllLifecycle(supabase: DB, email: string): Promise<number> {
  const clean = email.trim().toLowerCase()
  if (!clean) return 0
  const { data: seqs } = await supabase
    .from('crm_sequences')
    .select('id')
    .in('trigger_type', LIFECYCLE_TRIGGERS as unknown as string[])
  const ids = (seqs || []).map((s: { id: string }) => s.id)
  if (ids.length === 0) return 0
  const { data } = await supabase
    .from('crm_sequence_enrollments')
    .update({ status: 'cancelled' })
    .eq('contact_email', clean)
    .eq('status', 'active')
    .in('sequence_id', ids)
    .select('id')
  return data ? data.length : 0
}
