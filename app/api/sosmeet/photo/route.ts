/**
 * SOS Meet — photo de profil (privée, révélation progressive).
 * La photo est stockée dans un bucket PRIVÉ (`sosmeet-photos`). On ne sert
 * JAMAIS l'URL aux autres avant un match : ici, seul le propriétaire obtient
 * une URL signée pour se prévisualiser.
 *
 * POST  (multipart, champ `photo`) : upload + enregistre photo_path.
 * DELETE : retire la photo.
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const BUCKET = 'sosmeet-photos'
const MAX = 8 * 1024 * 1024
const TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }

async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function POST(request: Request) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Connecte-toi.' }, { status: 401 })
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: 'Config' }, { status: 500 })

  let form: FormData
  try { form = await request.formData() } catch { return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 }) }
  const file = form.get('photo')
  if (!(file instanceof File)) return NextResponse.json({ error: 'Aucune image.' }, { status: 400 })
  const ext = TYPES[file.type]
  if (!ext) return NextResponse.json({ error: 'Format accepté : JPG, PNG ou WebP.' }, { status: 400 })
  if (file.size > MAX) return NextResponse.json({ error: 'Image trop lourde (8 Mo max).' }, { status: 400 })

  const buf = Buffer.from(await file.arrayBuffer())
  const path = `${user.id}/photo_${Date.now()}.${ext}`

  const { error: upErr } = await (admin as any).storage.from(BUCKET).upload(path, buf, { contentType: file.type, upsert: true })
  if (upErr) {
    console.error('[sosmeet/photo] upload error:', upErr.message)
    return NextResponse.json({ error: 'Upload impossible, réessaie.' }, { status: 500 })
  }

  // Récupère l'ancienne photo pour la supprimer après.
  const { data: prof } = await (admin as any).from('sosmeet_profiles').select('id, photo_path').eq('user_id', user.id).maybeSingle()
  if (prof) {
    await (admin as any).from('sosmeet_profiles').update({ photo_path: path, updated_at: new Date().toISOString() }).eq('id', prof.id)
    if (prof.photo_path && prof.photo_path !== path) {
      await (admin as any).storage.from(BUCKET).remove([prof.photo_path]).catch(() => {})
    }
  } else {
    // profil pas encore créé : on stocke le chemin sur une ligne minimale (rattachée au compte)
    await (admin as any).from('sosmeet_profiles').insert({ user_id: user.id, email: (user.email || '').toLowerCase(), photo_path: path })
  }

  const { data: signed } = await (admin as any).storage.from(BUCKET).createSignedUrl(path, 3600)
  return NextResponse.json({ message: 'success', url: signed?.signedUrl || null })
}

export async function DELETE() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Connecte-toi.' }, { status: 401 })
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: 'Config' }, { status: 500 })

  const { data: prof } = await (admin as any).from('sosmeet_profiles').select('id, photo_path').eq('user_id', user.id).maybeSingle()
  if (prof?.photo_path) {
    await (admin as any).storage.from(BUCKET).remove([prof.photo_path]).catch(() => {})
    await (admin as any).from('sosmeet_profiles').update({ photo_path: null, updated_at: new Date().toISOString() }).eq('id', prof.id)
  }
  return NextResponse.json({ message: 'success' })
}
