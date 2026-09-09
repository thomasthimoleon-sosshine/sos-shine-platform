import { Resend } from 'resend';
import { estDesabonne } from '@/lib/crm/desabonnement'

let connectionSettings: Record<string, any> | null = null;

async function getCredentialsFromReplit() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? 'depl ' + process.env.WEB_REPL_RENEWAL
    : null;

  if (!hostname || !xReplitToken) {
    return null;
  }

  try {
    connectionSettings = await fetch(
      'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
      {
        headers: {
          'Accept': 'application/json',
          'X_REPLIT_TOKEN': xReplitToken,
        },
      }
    ).then(res => res.json()).then(data => data.items?.[0]);

    if (!connectionSettings || !connectionSettings.settings?.api_key) {
      return null;
    }
    return {
      apiKey: connectionSettings.settings.api_key,
      fromEmail: connectionSettings.settings.from_email || 'noreply@example.com',
    };
  } catch {
    return null;
  }
}

async function getCredentials() {
  const replitCreds = await getCredentialsFromReplit();
  if (replitCreds) return replitCreds;

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    return {
      apiKey,
      fromEmail: process.env.RESEND_FROM_EMAIL || 'noreply@sosshine.com',
    };
  }

  throw new Error('Resend not configured: set RESEND_API_KEY or connect via Replit integration');
}

// ✅ EMAILS ACTIFS
const EMAILS_PAUSED = false

const noopResend = {
  emails: {
    send: async (payload: unknown) => {
      console.warn('[EMAILS_PAUSED] Envoi bloqué :', JSON.stringify(payload).slice(0, 200))
      return { data: null, error: null }
    },
  },
} as unknown as Resend

/**
 * Refuse d'envoyer à une adresse désabonnée.
 *
 * Le contrôle est posé ici, au seul endroit par lequel passent TOUS les
 * envois, plutôt que répété dans la douzaine de routes qui expédient des
 * e-mails : c'est le seul moyen qu'un nouvel envoi ajouté demain ne passe pas
 * à côté. Auparavant aucune route ne vérifiait quoi que ce soit.
 */
function respecterLesDesabonnements(client: Resend): Resend {
  const envoyer = client.emails.send.bind(client.emails)
  return {
    ...client,
    emails: {
      ...client.emails,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      send: async (payload: any, options?: any) => {
        const destinataires = Array.isArray(payload?.to) ? payload.to : [payload?.to]
        const premier = typeof destinataires[0] === 'string' ? destinataires[0] : ''
        if (premier && (await estDesabonne(premier))) {
          console.warn('[desabonnement] envoi ignore pour une adresse desabonnee')
          return { data: null, error: null }
        }
        return envoyer(payload, options)
      },
    },
  } as unknown as Resend
}

/**
 * @param options.transactionnel  À poser pour un message que la personne a
 *   elle-même déclenché et attend : résultat de questionnaire, confirmation de
 *   réservation, avis de paiement. Un désabonnement commercial ne doit pas
 *   faire disparaître ces messages-là. Tout le reste est filtré.
 */
export async function getResendClient(options: { transactionnel?: boolean } = {}) {
  if (EMAILS_PAUSED) {
    return { client: noopResend, fromEmail: 'paused@sosshine.com' }
  }
  const { apiKey, fromEmail } = await getCredentials();
  const brut = new Resend(apiKey)
  return {
    client: options.transactionnel ? brut : respecterLesDesabonnements(brut),
    fromEmail,
  };
}
