import { readFile } from 'fs/promises'
import path from 'path'

// Page secrète et indépendante (hors plateforme, hors layout global).
// Sert un document HTML autonome : l'expérience-questionnaire immersive.
// Non listée dans la navigation ; accessible uniquement via son URL.
export const runtime = 'nodejs'
export const dynamic = 'force-static'

export async function GET() {
  try {
    const html = await readFile(path.join(process.cwd(), 'public', 'reconquete.html'), 'utf8')
    return new Response(html, {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=0, must-revalidate',
        // Page privée/secrète : on demande aux moteurs de ne pas l'indexer.
        'x-robots-tag': 'noindex, nofollow',
      },
    })
  } catch {
    return new Response('Page introuvable', { status: 404 })
  }
}
