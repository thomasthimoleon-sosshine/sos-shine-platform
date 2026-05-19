import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { V3Profile } from '@/lib/quiz-v3/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `Tu es le cœur analytique de SOS Shine, une plateforme de transformation intérieure fondée par Julia Thimoleon. Tu vas rédiger une fiche de lecture personnalisée pour quelqu'un qui vient de répondre à 40 questions profondes sur lui-même.

Ton rôle : transformer un profil multidimensionnel anonyme en un texte humain, chaleureux, précis et transformateur. Tu parles à la personne directement, avec une voix douce mais honnête, comme quelqu'un qui la voit vraiment.

RÈGLES ABSOLUES :
- Ne jamais nommer les dimensions techniques (ARCH, MF, PAR, COND, ATT, SOMA, etc.)
- Ne jamais utiliser les mots "chakra", "énergie subtile", "karma", "masculin/féminin intérieur" comme concepts séparés
- Ne jamais citer les schémas parentaux comme une grille
- Le vocabulaire s'adapte au niveau SPI détecté :
  • SPI fermée ou faible → langage concret, psychologique, ancré dans le quotidien (pas de métaphores spirituelles)
  • SPI moyenne → langage ouvert, curiosité, quelques images intuitives
  • SPI élevée → langage plus symbolique, énergétique, profond, images du vivant

STRUCTURE IMPOSÉE — exactement 5 paragraphes, titrés ainsi :
1. "Ce que je perçois de vous"
2. "Ce qui s'est construit"
3. "Ce qui se rejoue"
4. "Le chemin qui s'ouvre"
5. "Votre protocole de départ"

Chaque paragraphe : 4 à 6 phrases. Ton global : intime, juste, sans jugement. Jamais clinique. Jamais générique — chaque phrase doit resonner comme écrite uniquement pour cette personne.

Dans le paragraphe 5, intègre naturellement le protocole recommandé sans en faire un argumentaire commercial.`

function buildUserMessage(profile: V3Profile): string {
  const spiLevel = profile.spiritualLevel
  const lines: string[] = [
    `Prénom : ${profile.firstName}`,
    ``,
    `=== PROFIL MULTIDIMENSIONNEL ===`,
    ``,
    `Archétype dominant : ${profile.archetype}`,
    `Style d'attachement : ${profile.attachmentStyle}`,
    `Polarité masculine/féminine dominante : ${profile.mfDominant}`,
    ``,
    `Phase de vie actuelle : ${profile.phase}`,
    `Niveau d'ouverture spirituelle : ${spiLevel}`,
    `Niveau d'ouverture énergétique : ${profile.energyLevel}`,
    ``,
    `Schéma paternel : ${profile.parentalPere}`,
    `Schéma maternel : ${profile.parentalMere}`,
    `Type d'enfance : ${profile.enfanceType}`,
    ``,
    `Zones somatiques principales : ${profile.somaZones.join(', ') || 'non déterminées'}`,
    `Rapport au corps : ${profile.corpsRapport}`,
    ``,
    `Niveau transgénérationnel : ${profile.tgenLevel}`,
    ``,
    `Conditionnements dominants : ${profile.conditionnements.join(', ') || 'non déterminés'}`,
    ``,
    `Ce que la personne cherche en priorité : ${profile.q40Desire}`,
    ``,
    `=== PROTOCOLE RECOMMANDÉ ===`,
    `Titre : ${profile.topProtocolTitle || 'Protocole de reconstruction'}`,
    profile.topProtocolSlug ? `Slug : ${profile.topProtocolSlug}` : '',
    ``,
    `=== INSTRUCTION ===`,
    `Rédige maintenant la fiche personnalisée en 5 paragraphes comme indiqué. Commence directement par le titre "Ce que je perçois de vous" sans introduction.`,
  ]

  if (profile.birthdate) {
    lines.splice(3, 0, `Date de naissance : ${profile.birthdate}`)
  }

  return lines.filter(l => l !== null).join('\n')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { profile: V3Profile }
    const { profile } = body

    if (!profile?.firstName || !profile?.archetype) {
      return NextResponse.json({ error: 'Invalid profile' }, { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 503 })
    }

    const userMessage = buildUserMessage(profile)

    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(chunk.delta.text))
            }
          }
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (err) {
    console.error('quiz-v3 generate error:', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
