/**
 * Enroll a contact into CRM sequences matching a trigger type.
 * Non-blocking — failures are logged but don't throw.
 */
export async function enrollInSequence(
  trigger_type: string,
  email: string,
  first_name?: string | null
): Promise<void> {
  try {
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : null) ||
      'https://sosshine.com'

    await fetch(`${siteUrl}/api/crm/sequences/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trigger_type, email, first_name }),
    })
  } catch (err) {
    console.error(`CRM enrollment error (${trigger_type}):`, err)
  }
}
