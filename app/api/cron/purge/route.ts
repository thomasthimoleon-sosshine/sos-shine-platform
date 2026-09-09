/**
 *  GET /api/cron/purge — durées de conservation
 *
 *  Rien n'était jamais effacé : aucune purge, aucun déclencheur, aucune
 *  anonymisation. Les mesures de visite et les questionnaires abandonnés
 *  s'accumulaient indéfiniment, alors que la politique de confidentialité
 *  promet une suppression après la durée légale.
 *
 *  Deux périmètres seulement, délibérément :
 *
 *  • la mesure d'audience, au-delà de 25 mois — c'est le maximum recommandé
 *    par la CNIL, et ces lignes ne servent plus à rien passé ce délai ;
 *  • les questionnaires abandonnés sans adresse, au-delà de 12 mois : ils ne
 *    contiennent aucun moyen de recontact et ne servent à personne.
 *
 *  Les prospects et les fiches CRM ne sont PAS touchés. La CNIL recommande
 *  trois ans après le dernier contact, mais effacer une base commerciale est
 *  une décision d'entreprise, pas un correctif technique. À trancher, puis à
 *  ajouter ici.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

/** Mesure d'audience : 25 mois, plafond recommandé par la CNIL. */
const MOIS_AUDIENCE = 25
/** Questionnaires abandonnés sans adresse : aucun intérêt passé un an. */
const MOIS_QUIZ_ABANDONNE = 12

function ilYaDesMois(nombre: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() - nombre)
  return d.toISOString()
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization')
  const isVercelCron = request.headers.get('x-vercel-cron') === '1'
  if (!cronSecret || (!isVercelCron && authHeader !== `Bearer ${cronSecret}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let admin
  try {
    admin = createAdminClient()
  } catch {
    return NextResponse.json({ error: 'Purge indisponible' }, { status: 503 })
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any

  const limiteAudience = ilYaDesMois(MOIS_AUDIENCE)
  const limiteQuiz = ilYaDesMois(MOIS_QUIZ_ABANDONNE)
  const resultat: Record<string, string> = {}

  for (const table of ['site_visits', 'ab_test_visits']) {
    const { error } = await db.from(table).delete().lt('created_at', limiteAudience)
    resultat[table] = error ? `ignorée (${error.message})` : `purgée avant ${limiteAudience.slice(0, 10)}`
  }

  for (const table of ['quiz_v2_responses', 'quiz_v3_responses']) {
    // Uniquement ceux qui n'ont ni adresse ni compte : avec l'une ou l'autre,
    // la personne est identifiable et ses données lui appartiennent.
    const { error } = await db
      .from(table)
      .delete()
      .lt('created_at', limiteQuiz)
      .is('email', null)
      .is('user_id', null)
    resultat[table] = error ? `ignorée (${error.message})` : `abandons anonymes purgés avant ${limiteQuiz.slice(0, 10)}`
  }

  return NextResponse.json({ ok: true, resultat })
}
