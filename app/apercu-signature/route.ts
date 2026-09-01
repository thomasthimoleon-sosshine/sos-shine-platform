import { readFile } from 'fs/promises'
import path from 'path'

// Page secrète (non liée, non indexée) : aperçu de la landing « Signature ».
// Servie telle quelle, hors layout global, comme la home (public/*.html).
export const runtime = 'nodejs'
export const dynamic = 'force-static'

export async function GET() {
  try {
    const html = await readFile(path.join(process.cwd(), 'public', 'apercu-signature.html'), 'utf8')
    return new Response(html, {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=0, must-revalidate',
        'x-robots-tag': 'noindex, nofollow',
      },
    })
  } catch {
    return new Response('Page introuvable', { status: 404 })
  }
}
