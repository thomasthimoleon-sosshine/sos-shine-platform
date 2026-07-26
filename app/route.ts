import { readFile } from 'fs/promises'
import path from 'path'

// Page d'accueil du site : sert la landing 3D autonome (public/landingtest3d.html)
// tel quel, hors du layout global (document HTML complet + Three.js).
// L'ancienne page d'accueil reste disponible sur /accueil-classique.
export const runtime = 'nodejs'
export const dynamic = 'force-static'

export async function GET() {
  try {
    // L'accueil sert la version 3D (landing-home.html), découplée de /landingtest3d
    // qui sert la version d'essai (Projection).
    const html = await readFile(path.join(process.cwd(), 'public', 'landing-home.html'), 'utf8')
    return new Response(html, {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=0, must-revalidate',
      },
    })
  } catch {
    return new Response('Page introuvable', { status: 404 })
  }
}
