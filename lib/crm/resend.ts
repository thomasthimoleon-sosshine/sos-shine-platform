import { Resend } from 'resend';

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

export async function getResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail,
  };
}
