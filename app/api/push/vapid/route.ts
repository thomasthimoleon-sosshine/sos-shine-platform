import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  FABRIQUER UNE PAIRE DE CLÉS VAPID
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Ces clés ne se récupèrent auprès de personne : ce sont deux nombres tirés au
 *  hasard, qui prouvent aux serveurs d'Apple et de Google que les notifications
 *  viennent bien de SOS Shine. On les fabrique une fois, on les range dans les
 *  variables d'environnement, et on n'y touche plus.
 *
 *  Cette route ne fait que les engendrer. Elle ne les enregistre nulle part et
 *  ne les relit jamais : la paire n'existe que dans la réponse, une seule fois.
 *  C'est voulu — une clé privée conservée quelque part est une clé privée à
 *  protéger quelque part.
 */

function clientAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export async function POST(request: Request) {
  const supabase = clientAdmin()
  if (!supabase) {
    return NextResponse.json({ error: 'Configuration serveur incomplète' }, { status: 500 })
  }

  // Fondation ou administration du contenu, comme pour l'envoi.
  const jeton = request.headers.get('x-user-token')
  if (!jeton) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { data: { user } } = await supabase.auth.getUser(jeton)
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { data: profil } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const role = (profil as { role: string } | null)?.role
  if (!role || !['founder', 'admin_content'].includes(role)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { publicKey, privateKey } = webpush.generateVAPIDKeys()
  return NextResponse.json({ publicKey, privateKey })
}
