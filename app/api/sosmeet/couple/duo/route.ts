/**
 * SOS Meet Couple — le duo.
 * GET    : l'état du duo de la personne connectée (jamais les réponses de l'autre).
 * POST   : crée un duo et son code d'invitation.
 * DELETE : dissout le duo (archivage).
 */
import { NextResponse } from 'next/server'
import { currentUser, admin, coupleOf, sideOf, audit, progressOf } from '@/lib/sosmeet/couple/store'
import { generateInviteCode, inviteExpiry, isExpired } from '@/lib/sosmeet/couple/invite'
import { COUPLE_QUESTION_COUNT } from '@/lib/sosmeet/couple/questionnaire'

export async function GET() {
  const user = await currentUser()
  if (!user) return NextResponse.json({ authenticated: false }, { status: 401 })

  const couple = await coupleOf(user.id)
  if (!couple) return NextResponse.json({ authenticated: true, couple: null })

  const side = sideOf(couple, user.id)
  const progress = await progressOf(couple.id)
  const me = progress.find(p => p.userId === user.id)
  const other = progress.find(p => p.userId !== user.id)

  return NextResponse.json({
    authenticated: true,
    couple: {
      id: couple.id,
      status: couple.status,
      side,
      // Le code n'est montré qu'à celui qui invite, et seulement tant qu'il sert.
      inviteCode: side === 'a' && !couple.partner_b && !isExpired(couple.invite_expires)
        ? couple.invite_code : null,
      inviteExpired: !couple.partner_b && isExpired(couple.invite_expires),
      partnerJoined: !!couple.partner_b,
      total: COUPLE_QUESTION_COUNT,
      // Ce que je sais de l'autre : son avancement, jamais ses réponses.
      me: { answered: me?.answered ?? 0, sealed: me?.sealed ?? false },
      partner: { answered: other?.answered ?? 0, sealed: other?.sealed ?? false },
    },
  })
}

export async function POST() {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'Connecte-toi pour créer votre duo.' }, { status: 401 })
  const db = admin()
  if (!db) return NextResponse.json({ error: 'Config' }, { status: 500 })

  const existing = await coupleOf(user.id)
  if (existing) return NextResponse.json({ error: 'Tu as déjà un duo en cours.', coupleId: existing.id }, { status: 409 })

  // Collision de code très improbable, mais on ne la laisse pas au hasard.
  let code = generateInviteCode()
  for (let i = 0; i < 5; i++) {
    const { data: clash } = await (db as any).from('sosmeet_couples')
      .select('id').eq('invite_code', code).maybeSingle()
    if (!clash) break
    code = generateInviteCode()
  }

  const { data, error } = await (db as any).from('sosmeet_couples').insert({
    invite_code: code,
    invite_expires: inviteExpiry(),
    partner_a: user.id,
    status: 'INVITATION_ENVOYEE',
  }).select('id').single()

  if (error) {
    console.error('[couple/duo] create:', error.code, error.message)
    return NextResponse.json({ error: 'Création impossible, réessaie.' }, { status: 500 })
  }

  await audit(data.id, user.id, 'duo_cree')
  return NextResponse.json({ coupleId: data.id, inviteCode: code })
}

export async function DELETE() {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const db = admin()
  if (!db) return NextResponse.json({ error: 'Config' }, { status: 500 })

  const couple = await coupleOf(user.id)
  if (!couple) return NextResponse.json({ error: 'Aucun duo en cours.' }, { status: 404 })

  await (db as any).from('sosmeet_couples')
    .update({ status: 'ARCHIVE', updated_at: new Date().toISOString() }).eq('id', couple.id)
  await audit(couple.id, user.id, 'duo_dissous')
  return NextResponse.json({ message: 'success' })
}
