/**
 *  PAGE PUBLIQUE D'UNE PUBLICATION — l'aperçu des liens partagés
 *  ─────────────────────────────────────────────────────────────
 *
 *  Les boutons Facebook / X / WhatsApp envoyaient vers /dashboard/mur?post=…,
 *  qui est derrière l'authentification. Facebook n'y voyait rien : il tombait
 *  sur la page de connexion et reprenait les métadonnées du site — d'où la
 *  même vignette « Briller Comme un Diamant » pour toutes les publications,
 *  quelle que soit celle qu'on partageait.
 *
 *  Cette page-ci est publique et rendue côté serveur : les robots de Facebook
 *  et de WhatsApp y lisent un titre, un extrait et une image propres à la
 *  publication. Elle ne montre qu'un aperçu — le titre, le prénom de l'auteur
 *  et le début du texte — et invite à ouvrir SOS Shine pour la suite.
 *
 *  Elle ne sert que les publications réellement publiques et publiées.
 *  Tout le reste renvoie une page introuvable, sans dire pourquoi.
 */

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCategory } from '@/lib/community/categories'
import ShineIcon from '@/components/icons/ShineIcon'
import LogoSite from '@/components/LogoSite'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

type Apercu = {
  id: string
  titre: string
  contenu: string
  image: string | null
  categorie: string
  auteur: string
  createdAt: string
  /** Où la publication se lit vraiment, une fois connecté. */
  destination: string
}

/** Longueur de l'extrait montré ici et donné à Facebook. */
const EXTRAIT = 280

function extraire(texte: string, longueur = EXTRAIT) {
  const propre = texte.replace(/\s+/g, ' ').trim()
  if (propre.length <= longueur) return propre
  // On coupe au dernier espace : une phrase tronquée en plein mot fait négligé.
  return `${propre.slice(0, longueur).replace(/\s\S*$/, '')}…`
}

async function charger(id: string): Promise<Apercu | null> {
  // Un identifiant qui n'est pas un UUID ne peut rien désigner : on s'arrête
  // avant d'interroger la base, qui répondrait par une erreur de type.
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('posts')
      .select('id, title, content, image_url, category, post_type, author_id, created_at, visibility, is_published')
      .eq('id', id)
      .eq('is_published', true)
      .eq('visibility', 'public')
      .maybeSingle()
    if (!data) return null

    const { data: profil } = await supabase
      .from('profiles')
      .select('prenom')
      .eq('id', data.author_id)
      .maybeSingle()

    return {
      id: data.id,
      titre: data.title || getCategory(data.category).label,
      contenu: data.content || '',
      image: data.image_url,
      categorie: data.category,
      auteur: profil?.prenom || 'Un membre',
      createdAt: data.created_at,
      // Un éclat ne vit pas sur le fil — celui-ci les écarte — mais sur le
      // profil de son auteur, qui respecte déjà leur visibilité.
      destination: data.post_type === 'eclat'
        ? `/dashboard/membre/${data.author_id}`
        : `/dashboard/mur?post=${data.id}`,
    }
  } catch {
    // Sans clé d'administration configurée, la page se comporte comme si la
    // publication n'existait pas plutôt que de rendre une erreur 500 aux robots.
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const p = await charger(id)
  if (!p) return { title: 'SOS Shine', robots: { index: false } }

  const description = extraire(p.contenu, 200) || 'Une publication de la communauté SOS Shine.'
  // L'image de la publication si elle en a une ; sinon la vignette maison,
  // dessinée avec son titre — c'est ce qui la distingue des autres.
  // Adresses relatives : le layout racine pose metadataBase, Next les rend
  // absolues avec le bon domaine. Refaire ce calcul ici, c'est risquer de se
  // tromper de domaine — et une vignette introuvable ne s'affiche pas.
  const image = p.image
    ? p.image
    : `/api/og?title=${encodeURIComponent(extraire(p.titre, 70))}&subtitle=${encodeURIComponent(`Partagé par ${p.auteur} · Communauté SOS Shine`)}`

  return {
    title: `${p.titre} · SOS Shine`,
    description,
    openGraph: {
      title: p.titre,
      description,
      type: 'article',
      siteName: 'SOS Shine',
      locale: 'fr_FR',
      url: `/publication/${p.id}`,
      publishedTime: p.createdAt,
      images: [{ url: image, width: 1200, height: 630, alt: p.titre }],
    },
    twitter: {
      card: 'summary_large_image',
      title: p.titre,
      description,
      images: [image],
    },
    alternates: { canonical: `/publication/${p.id}` },
  }
}

export default async function PagePublication({ params }: Props) {
  const { id } = await params
  const p = await charger(id)
  if (!p) notFound()

  const cat = getCategory(p.categorie)
  const date = new Date(p.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen flex flex-col items-center px-5 py-12" style={{ background: 'var(--surface)' }}>
      <Link href="/" className="mb-10">
        <LogoSite className="h-12 w-auto" alt="SOS Shine" />
      </Link>

      <article
        className="w-full max-w-xl rounded-2xl overflow-hidden"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}
      >
        {p.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.image} alt="" className="w-full" />
        )}

        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-4 text-xs" style={{ color: cat.color }}>
            <ShineIcon name={cat.icon} className="w-3.5 h-3.5" />
            <span className="font-medium">{cat.label}</span>
            <span style={{ color: 'var(--text-muted)' }}>· {p.auteur} · {date}</span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            {p.titre}
          </h1>

          <p className="text-sm sm:text-base leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
            {extraire(p.contenu)}
          </p>
        </div>

        <div className="px-6 sm:px-8 py-6 border-t" style={{ borderColor: 'var(--border)' }}>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            La suite se lit dans la communauté — avec les réponses des autres membres.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={p.destination}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--brand)', color: 'var(--surface)' }}
            >
              Ouvrir dans SOS Shine
            </Link>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl text-sm font-medium"
              style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            >
              Découvrir SOS Shine
            </Link>
          </div>
        </div>
      </article>
    </div>
  )
}
