import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Fil d'actualité : Éclat posts des Rayons (connexions acceptées)
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  // 1. Récupérer les IDs des connexions acceptées (mes Rayons)
  const { data: connections, error: connError } = await supabase
    .from('shine_connections')
    .select('sender_id, receiver_id')
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .eq('status', 'accepted')

  // Si la table n'existe pas encore, retourner un feed vide
  if (connError && connError.message.includes('schema cache')) {
    return NextResponse.json({ posts: [], profiles: {} })
  }

  const rayonIds = new Set<string>()
  for (const c of connections || []) {
    if (c.sender_id !== user.id) rayonIds.add(c.sender_id)
    if (c.receiver_id !== user.id) rayonIds.add(c.receiver_id)
  }

  if (rayonIds.size === 0) {
    return NextResponse.json({ posts: [], profiles: {} })
  }

  const rayonArray = Array.from(rayonIds)

  // 2. Récupérer les posts Éclat des Rayons
  const { data: posts } = await supabase
    .from('posts')
    .select('id, author_id, title, content, image_url, video_url, audio_url, category, media_type, created_at')
    .in('author_id', rayonArray)
    .eq('post_type', 'eclat')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(30)

  if (!posts || posts.length === 0) {
    return NextResponse.json({ posts: [], profiles: {} })
  }

  // 3. Récupérer les likes et commentaires
  const postIds = posts.map(p => p.id)

  const { data: likeData } = await supabase
    .from('post_likes').select('post_id').in('post_id', postIds)
  const likeCountMap = new Map<string, number>()
  for (const l of (likeData || []) as { post_id: string }[]) {
    likeCountMap.set(l.post_id, (likeCountMap.get(l.post_id) || 0) + 1)
  }

  // Vérifier les posts que l'utilisateur a liké
  const { data: userLikes } = await supabase
    .from('post_likes')
    .select('post_id')
    .eq('user_id', user.id)
    .in('post_id', postIds)
  const userLikedSet = new Set((userLikes || []).map((l: { post_id: string }) => l.post_id))

  const { data: commentData } = await supabase
    .from('post_comments').select('post_id').in('post_id', postIds)
  const commentCountMap = new Map<string, number>()
  for (const c of (commentData || []) as { post_id: string }[]) {
    commentCountMap.set(c.post_id, (commentCountMap.get(c.post_id) || 0) + 1)
  }

  const enrichedPosts = posts.map(p => ({
    ...p,
    likes_count: likeCountMap.get(p.id) || 0,
    comments_count: commentCountMap.get(p.id) || 0,
    user_has_liked: userLikedSet.has(p.id),
  }))

  // 4. Profils des auteurs
  const authorIds = [...new Set(posts.map(p => p.author_id))]
  const { data: profileData } = await supabase
    .from('profiles')
    .select('id, prenom, pseudo, avatar_url, role')
    .in('id', authorIds)

  const profiles: Record<string, { id: string; prenom: string; pseudo: string | null; avatar_url: string | null; role: string }> = {}
  for (const p of profileData || []) {
    profiles[p.id] = p
  }

  return NextResponse.json({ posts: enrichedPosts, profiles })
}
