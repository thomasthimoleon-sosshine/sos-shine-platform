/**
 *  GET/POST /api/unsubscribe
 *
 *  Tous les e-mails de SOS Shine portaient depuis toujours un lien
 *  « Se désinscrire » vers cette adresse. Elle n'existait pas : le
 *  destinataire tombait sur une page introuvable, et n'avait donc aucun moyen
 *  d'arrêter les envois.
 *
 *  Le lien est volontairement sans jeton ni connexion : c'est ce qu'exige un
 *  désabonnement en un clic, et c'est la forme des liens déjà partis dans les
 *  boîtes de réception — les rendre invalides aujourd'hui laisserait les
 *  anciens destinataires sans recours. Le risque est celui du désabonnement
 *  d'un tiers : sans conséquence pour la personne, qui peut se réinscrire.
 *
 *  POST répond au même endroit pour les clients de messagerie qui pratiquent
 *  le désabonnement en un clic (RFC 8058).
 */

import { NextRequest, NextResponse } from 'next/server'
import { marquerDesabonne } from '@/lib/crm/desabonnement'

export const dynamic = 'force-dynamic'

function page(titre: string, message: string, adresse?: string) {
  return `<!doctype html>
<html lang="fr"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${titre} · SOS Shine</title>
<style>
  :root{color-scheme:dark}
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
       background:#0A0704;color:#E8E3D9;font:16px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:24px}
  .carte{max-width:420px;text-align:center;border:1px solid rgba(201,169,97,.22);
         background:rgba(255,255,255,.02);border-radius:18px;padding:40px 32px}
  h1{font-family:Georgia,serif;font-weight:600;font-size:1.6rem;margin:0 0 14px;color:#C9A961}
  p{margin:0 0 12px;color:#B5AEA1;font-size:15px}
  .adresse{font-family:ui-monospace,monospace;font-size:13px;color:#E8E3D9}
  a{display:inline-block;margin-top:20px;color:#C9A961;text-decoration:none;
    border:1px solid rgba(201,169,97,.35);border-radius:999px;padding:10px 22px;font-size:14px}
</style></head>
<body><div class="carte">
  <h1>${titre}</h1>
  <p>${message}</p>
  ${adresse ? `<p class="adresse">${adresse}</p>` : ''}
  <a href="https://sosshine.com">Retour à SOS Shine</a>
</div></body></html>`
}

function reponseHtml(html: string, status = 200) {
  return new NextResponse(html, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
  })
}

async function traiter(email: string | null) {
  if (!email || !email.includes('@')) {
    return reponseHtml(
      page(
        'Adresse manquante',
        "Ce lien ne contient pas d'adresse e-mail valide. Écrivez-nous à julialaureau@sosshine.com et nous vous retirons de la liste.",
      ),
      400,
    )
  }

  const ok = await marquerDesabonne(email)

  if (!ok) {
    return reponseHtml(
      page(
        "Nous n'avons pas pu enregistrer votre demande",
        "Un incident technique nous en a empêchés. Écrivez-nous à julialaureau@sosshine.com : nous vous retirons de la liste à la main, et nous vous confirmons.",
        email,
      ),
      500,
    )
  }

  return reponseHtml(
    page(
      "C'est fait",
      'Vous ne recevrez plus nos e-mails. Les messages liés à votre compte ou à un achat — confirmation, facture — continueront de vous parvenir.',
      email,
    ),
  )
}

export async function GET(request: NextRequest) {
  return traiter(request.nextUrl.searchParams.get('email'))
}

export async function POST(request: NextRequest) {
  // Désabonnement en un clic : l'adresse arrive dans l'URL, le corps de la
  // requête étant imposé par la norme (List-Unsubscribe=One-Click).
  return traiter(request.nextUrl.searchParams.get('email'))
}
