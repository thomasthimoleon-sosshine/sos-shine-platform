import { readFile } from 'fs/promises'
import path from 'path'

// Sert la landing 3D autonome (public/landingtest3d.html) tel quel,
// hors du layout global du site (document HTML complet + Three.js).
export const runtime = 'nodejs'
export const dynamic = 'force-static'

export async function GET() {
  try {
    const html = await readFile(path.join(process.cwd(), 'public', 'landingtest3d.html'), 'utf8')
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
