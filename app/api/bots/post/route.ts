import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { BOT_PROFILES } from '@/lib/bots/profiles'
import { getRandomMessage, getRandomPost } from '@/lib/bots/messages'
import { verifyAdminSession } from '@/lib/bots/auth'

export async function POST(req: Request) {
  const isAuthed = await verifyAdminSession(req)
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const admin = createAdminClient()
    const body = await req.json().catch(() => ({}))
    const action = (body as { action?: string }).action || 'chat'

    const bot = BOT_PROFILES[Math.floor(Math.random() * BOT_PROFILES.length)]

    const { data: profile } = await admin
      .from('profiles')
      .select('id')
      .eq('email', bot.email)
      .single()

    if (!profile) {
      return NextResponse.json({ error: `Bot profile not found for ${bot.prenom}. Run /api/bots/seed first.` }, { status: 404 })
    }

    if (action === 'wall') {
      const post = getRandomPost(bot.prenom)
      if (!post) {
        return NextResponse.json({ error: 'No wall posts available' }, { status: 400 })
      }

      // --- CORRECTION ICI : Alignement sur le schéma V2 ---
      const { error } = await admin.from('posts').insert({
        author_id: profile.id,
        title: post.title,
        content: post.content,
        post_type: 'community',
        category,
        media_type: 'text',
        is_published: true,
        image_url: null,
        category: 'partage', // Valeur valide requise par le type PostCategory
        media_type: 'text',  // Valeur valide par défaut
        video_url: null      // Champ requis par le nouveau schéma
      })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, action: 'wall', bot: bot.prenom, title: post.title })
    }

    const message = getRandomMessage(bot.prenom)
    const { error } = await admin.from('messages').insert({
      user_id: profile.id,
      content: message,
      is_general: true,
      douleur_id: null,
      is_deleted: false,
      is_anonymous: false,
      message_type: 'text',
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, action: 'chat', bot: bot.prenom, message })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
