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
    const results: { bot: string; action: string; status: string }[] = []

    const numChatMessages = Math.floor(Math.random() * 3) + 1
    for (let i = 0; i < numChatMessages; i++) {
      const bot = BOT_PROFILES[Math.floor(Math.random() * BOT_PROFILES.length)]
      const { data: profile } = await admin
        .from('profiles')
        .select('id')
        .eq('email', bot.email)
        .single()

      if (!profile) continue

      const msg = getRandomMessage(bot.prenom)
      const { error } = await admin.from('messages').insert({
        user_id: profile.id,
        content: msg,
        is_general: true,
        douleur_id: null,
        is_deleted: false,
        is_anonymous: false,
        message_type: 'text',
      })

      results.push({
        bot: bot.prenom,
        action: 'chat',
        status: error ? `error: ${error.message}` : 'sent',
      })
    }

    if (Math.random() < 0.3) {
      const bot = BOT_PROFILES[Math.floor(Math.random() * BOT_PROFILES.length)]
      const { data: profile } = await admin
        .from('profiles')
        .select('id')
        .eq('email', bot.email)
        .single()

      if (profile) {
        const post = getRandomPost(bot.prenom)
        if (post) {
          // --- CORRECTION ICI : Alignement sur le schéma V2 ---
          const { error } = await admin.from('posts').insert({
            author_id: profile.id,
            title: post.title,
            content: post.content,
            post_type: 'general',
            is_published: true,
            image_url: null,
            category: 'partage', // Valeur valide requise par le type PostCategory
            media_type: 'text',  // Valeur valide par défaut
            video_url: null      // Champ requis par le nouveau schéma
          })

          results.push({
            bot: bot.prenom,
            action: 'wall_post',
            status: error ? `error: ${error.message}` : 'posted',
          })
        }
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
