/**
 * SOS Meet Couple — la carte.
 * GET : renvoie la carte du couple de la personne connectée. La génère et la
 * stocke la première fois que les deux questionnaires sont scellés.
 *
 * Décision produit : la carte NE DÉPEND PAS du profilage manuel. Les quatre
 * profils enrichiront la dynamique de dyade plus tard ; ils ne doivent pas
 * empêcher un couple d'avoir sa lecture aujourd'hui.
 *
 * Invariant I1 : cette route ne renvoie JAMAIS une réponse. Elle ne sort que
 * la carte, composée de nombres et de formulations d'un catalogue fermé.
 */
import { NextResponse } from 'next/server'
import { currentUser, admin, coupleOf, sideOf, advanceStatus, audit } from '@/lib/sosmeet/couple/store'
import { buildCoupleReport, ENGINE_VERSION } from '@/lib/sosmeet/couple/report'
import type { Naissance } from '@/lib/sosmeet/couple/energetics'

/** Prénom affichable, sans jamais échouer. */
async function prenomDe(db: any, userId: string, defaut: string): Promise<string> {
  try {
    const { data } = await db.from('profiles').select('prenom').eq('id', userId).maybeSingle()
    if (data?.prenom) return String(data.prenom).trim().slice(0, 40)
  } catch { /* la table peut différer selon l'environnement */ }
  try {
    const { data } = await db.from('sosmeet_profiles').select('first_name').eq('user_id', userId).maybeSingle()
    if (data?.first_name) return String(data.first_name).trim().slice(0, 40)
  } catch { /* idem */ }
  return defaut
}

export async function GET() {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const db = admin()
  if (!db) return NextResponse.json({ error: 'Config' }, { status: 500 })

  const couple = await coupleOf(user.id)
  if (!couple || !sideOf(couple, user.id)) {
    return NextResponse.json({ etat: 'aucun_duo' }, { status: 404 })
  }
  if (couple.status === 'SUSPENDU_VIGILANCE') {
    return NextResponse.json({ etat: 'suspendu' })
  }

  // Carte déjà produite : on la renvoie telle quelle.
  const { data: existante } = await (db as any).from('sosmeet_couple_reports')
    .select('crossing, energetics, synthesis, engine_version, created_at')
    .eq('couple_id', couple.id).order('version', { ascending: false }).limit(1).maybeSingle()

  const prenomA = await prenomDe(db, couple.partner_a, 'L’un de vous')
  const prenomB = couple.partner_b ? await prenomDe(db, couple.partner_b, 'L’autre') : 'L’autre'

  if (existante) {
    return NextResponse.json({
      etat: 'prete', prenomA, prenomB,
      report: {
        engineVersion: existante.engine_version,
        crossing: existante.crossing,
        narrative: existante.synthesis,
        energetique: existante.energetics ?? null,
        energetiqueAbsente: existante.energetics ? null
          : 'La lecture énergétique demande les deux dates de naissance, et le consentement de chacun.',
      },
    })
  }

  // Sinon : les deux ont-ils scellé ?
  const { data: reponses } = await (db as any).from('sosmeet_couple_answers')
    .select('user_id, answers, sealed_at').eq('couple_id', couple.id)

  const lignes = (reponses || []) as Array<{ user_id: string; answers: Record<string, number>; sealed_at: string | null }>
  const a = lignes.find(r => r.user_id === couple.partner_a)
  const b = couple.partner_b ? lignes.find(r => r.user_id === couple.partner_b) : undefined

  if (!a?.sealed_at || !b?.sealed_at) {
    return NextResponse.json({
      etat: 'en_attente',
      moiPret: !!lignes.find(r => r.user_id === user.id)?.sealed_at,
      partenairePret: !!lignes.find(r => r.user_id !== user.id)?.sealed_at,
    })
  }

  // Dates de naissance, si les deux les ont données avec leur consentement.
  const { data: naissances } = await (db as any).from('sosmeet_couple_birth')
    .select('user_id, birth_date, birth_time, birth_lat, birth_lon, consent').eq('couple_id', couple.id)

  const toNaissance = (uid: string): Naissance | null => {
    const r = (naissances || []).find((n: any) => n.user_id === uid)
    if (!r || !r.consent || !r.birth_date) return null
    return { date: r.birth_date, heure: r.birth_time || null, lat: r.birth_lat ?? null, lon: r.birth_lon ?? null }
  }

  await advanceStatus(couple.id, couple.status, 'CALCUL_EN_COURS')

  const report = buildCoupleReport(a.answers || {}, b.answers || {}, {
    prenomA, prenomB,
    naissanceA: toNaissance(couple.partner_a),
    naissanceB: couple.partner_b ? toNaissance(couple.partner_b) : null,
  })

  const { error } = await (db as any).from('sosmeet_couple_reports').insert({
    couple_id: couple.id, version: 1,
    crossing: report.crossing, energetics: report.energetique,
    synthesis: report.narrative, engine_version: ENGINE_VERSION,
    published_at: new Date().toISOString(),
  })
  if (error && error.code !== '23505') {   // 23505 : une autre requête l'a créée en parallèle
    console.error('[couple/report] insert:', error.code, error.message)
  }

  await advanceStatus(couple.id, 'CALCUL_EN_COURS', 'DIAGNOSTIC_PRET')
  await audit(couple.id, null, 'carte_generee', undefined, { engineVersion: ENGINE_VERSION })

  return NextResponse.json({ etat: 'prete', prenomA, prenomB, report })
}
