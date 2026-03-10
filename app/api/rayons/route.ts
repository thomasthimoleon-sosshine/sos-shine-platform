import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ShineConnection } from '@/types/database'

// GET — Récupérer les connexions de l'utilisateur
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  // Connexions acceptées
  const { data: connections } = await supabase
    .from('shine_connections')
    .select('*')
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .eq('status', 'accepted')
    .order('updated_at', { ascending: false })

  // Rayons reçus en attente
  const { data: pendingReceived } = await supabase
    .from('shine_connections')
    .select('*')
    .eq('receiver_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  // Rayons envoyés en attente
  const { data: pendingSent } = await supabase
    .from('shine_connections')
    .select('*')
    .eq('sender_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  // Collecter tous les user IDs pour charger les profils
  const allConnections = [...(connections || []), ...(pendingReceived || []), ...(pendingSent || [])] as ShineConnection[]
  const userIds = new Set<string>()
  for (const c of allConnections) {
    if (c.sender_id !== user.id) userIds.add(c.sender_id)
    if (c.receiver_id !== user.id) userIds.add(c.receiver_id)
  }

  let profiles: Record<string, { id: string; prenom: string; pseudo: string | null; avatar_url: string | null; role: string; bio: string | null }> = {}
  if (userIds.size > 0) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, prenom, pseudo, avatar_url, role, bio')
      .in('id', Array.from(userIds))
    if (profileData) {
      for (const p of profileData) {
        profiles[p.id] = p
      }
    }
  }

  return NextResponse.json({
    connections: connections || [],
    pendingReceived: pendingReceived || [],
    pendingSent: pendingSent || [],
    profiles,
  })
}

// POST — Envoyer un rayon (demande de connexion)
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { receiver_id } = await req.json()
  if (!receiver_id || receiver_id === user.id) {
    return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
  }

  // Vérifier s'il n'y a pas déjà une connexion
  const { data: existing } = await supabase
    .from('shine_connections')
    .select('id, status')
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiver_id}),and(sender_id.eq.${receiver_id},receiver_id.eq.${user.id})`)
    .maybeSingle()

  if (existing) {
    // Si la connexion précédente a été refusée, la supprimer pour permettre un nouvel envoi
    if (existing.status === 'declined') {
      await supabase.from('shine_connections').delete().eq('id', existing.id)
    } else {
      return NextResponse.json({ error: 'Connexion déjà existante', status: existing.status }, { status: 409 })
    }
  }

  const { data, error } = await supabase
    .from('shine_connections')
    .insert({ sender_id: user.id, receiver_id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Envoyer une notification au destinataire
  const { data: senderProfile } = await supabase
    .from('profiles')
    .select('prenom, pseudo')
    .eq('id', user.id)
    .single()

  const senderName = senderProfile?.pseudo || senderProfile?.prenom || 'Un membre'

  await supabase.from('notifications').insert({
    user_id: receiver_id,
    title: 'Nouveau Rayon reçu !',
    body: `${senderName} veut rayonner avec vous !`,
    link: '/dashboard/mes-rayons',
    notification_type: 'new_post',
  })

  return NextResponse.json({ connection: data })
}

// PATCH — Accepter/refuser/supprimer un rayon
export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { connection_id, action } = await req.json()
  if (!connection_id || !['accept', 'decline', 'cancel', 'remove'].includes(action)) {
    return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
  }

  if (action === 'cancel' || action === 'remove') {
    const { error } = await supabase
      .from('shine_connections')
      .delete()
      .eq('id', connection_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  const newStatus = action === 'accept' ? 'accepted' : 'declined'
  const { error } = await supabase
    .from('shine_connections')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', connection_id)
    .eq('receiver_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Si accepté, notifier l'envoyeur
  if (action === 'accept') {
    const { data: conn } = await supabase
      .from('shine_connections')
      .select('sender_id')
      .eq('id', connection_id)
      .single()

    if (conn) {
      const { data: receiverProfile } = await supabase
        .from('profiles')
        .select('prenom, pseudo')
        .eq('id', user.id)
        .single()

      const receiverName = receiverProfile?.pseudo || receiverProfile?.prenom || 'Un membre'

      await supabase.from('notifications').insert({
        user_id: conn.sender_id,
        title: 'Rayon accepté !',
        body: `${receiverName} rayonne maintenant avec vous !`,
        link: '/dashboard/mes-rayons',
        notification_type: 'new_post',
      })
    }
  }

  return NextResponse.json({ success: true, status: newStatus })
}
