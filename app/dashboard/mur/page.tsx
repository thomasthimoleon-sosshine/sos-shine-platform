'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { PostWithAuthor } from '@/types/database'

export default function MurPage() {
  const [posts, setPosts] = useState<PostWithAuthor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('posts')
        .select('*, profiles(prenom, role, avatar_url)')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(50)

      if (data) setPosts(data as unknown as PostWithAuthor[])
      setLoading(false)
    }
    load()
  }, [])

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  function getTypeLabel(type: string) {
    const map: Record<string, { label: string; color: string; icon: string }> = {
      announcement: { label: 'Annonce', color: '#D4A843', icon: '📢' },
      douleur_published: { label: 'Nouvelle douleur', color: '#55EFC4', icon: '📘' },
      event_published: { label: 'Nouvel événement', color: '#A29BFE', icon: '📅' },
      general: { label: 'Publication', color: 'var(--text-secondary)', icon: '💬' },
    }
    return map[type] || map.general
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Mur Communautaire
        </h1>
        <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
          Annonces, nouvelles douleurs, événements et publications de la communauté SOS Shine.
        </p>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl" style={{ background: 'rgba(212,168,67,0.08)' }}>
            📋
          </div>
          <h3 className="font-display text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Le mur est prêt
          </h3>
          <p className="text-sm max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Les publications de l&apos;équipe SOS Shine apparaîtront ici. Vous serez notifié par email à chaque nouvelle publication.
          </p>

          {/* Preview cards */}
          <div className="mt-12 space-y-4 text-left">
            {[
              { type: 'announcement', title: 'Bienvenue sur SOS Shine !', content: 'Nous sommes ravis de vous accueillir dans cette communauté. Explorez l\'encyclopédie des douleurs, participez aux chats et rejoignez nos événements. Vous n\'êtes plus seul.', date: new Date().toISOString() },
              { type: 'douleur_published', title: 'Nouvelle douleur disponible : Abandon', content: 'La page "Abandon" est maintenant disponible dans l\'encyclopédie avec son protocole complet en 4 étapes. Vidéo, soin énergétique, méditation et exercices pratiques vous attendent.', date: new Date(Date.now() - 86400000).toISOString() },
              { type: 'event_published', title: 'Shine Walk — Paris, 15 mars', content: 'Rejoignez-nous au Jardin du Luxembourg pour une marche méditative suivie d\'un cercle de parole. Places limitées à 20 personnes.', date: new Date(Date.now() - 172800000).toISOString() },
            ].map((preview, i) => {
              const typeInfo = getTypeLabel(preview.type)
              return (
                <div key={i} className="rounded-2xl p-6" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', opacity: 0.6 }}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm">{typeInfo.icon}</span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: `${typeInfo.color}15`, color: typeInfo.color }}>
                      {typeInfo.label}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Aperçu</span>
                  </div>
                  <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--text-primary)' }}>{preview.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{preview.content}</p>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const typeInfo = getTypeLabel(post.post_type)
            return (
              <article key={post.id} className="rounded-2xl p-6" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
                {/* Post type badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{typeInfo.icon}</span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: `${typeInfo.color}15`, color: typeInfo.color }}>
                      {typeInfo.label}
                    </span>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(post.created_at)}</span>
                </div>

                {/* Author */}
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                    style={{ background: 'rgba(212,168,67,0.12)', color: 'var(--gold)' }}>
                    {post.profiles?.prenom?.charAt(0).toUpperCase() || 'S'}
                  </div>
                  <div>
                    <span className="text-sm font-semibold" style={{ color: post.profiles?.role === 'founder' ? 'var(--gold)' : 'var(--text-primary)' }}>
                      {post.profiles?.prenom || 'SOS Shine'}
                    </span>
                    {post.profiles?.role === 'founder' && (
                      <span className="text-xs ml-2 px-1.5 py-0.5 rounded" style={{ background: 'rgba(212,168,67,0.15)', color: 'var(--gold)' }}>
                        Fondateur
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>{post.title}</h3>
                <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>{post.content}</p>

                {post.image_url && (
                  <div className="mt-4 rounded-xl overflow-hidden">
                    <img src={post.image_url} alt="" className="w-full" />
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
