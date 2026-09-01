const VOWELS = /[aeiouyàâäéèêëïîôùûüœæ]/i

/**
 * Detects spam-like names: >12 chars with no vowels,
 * or purely random character sequences.
 */
export function isSpamName(name: string): boolean {
  if (!name) return false
  const cleaned = name.trim()
  if (cleaned.length > 12 && !VOWELS.test(cleaned)) return true
  // Repeated same character (aaaaaaa, xxxxxxx)
  if (/^(.)\1{5,}$/.test(cleaned)) return true
  // Too many consonants in a row (>6) suggests gibberish
  if (/[bcdfghjklmnpqrstvwxz]{7,}/i.test(cleaned)) return true
  return false
}

/**
 * Detects spam email patterns:
 * - x.x.x.x@... (single chars separated by dots)
 * - Disposable/temporary email domains
 */
export function isSpamEmail(email: string): boolean {
  if (!email) return false
  const lower = email.toLowerCase().trim()
  const [local] = lower.split('@')
  if (!local) return false

  // Pattern x.x.x.x (single chars separated by dots, 3+ segments)
  const dotParts = local.split('.')
  if (dotParts.length >= 3 && dotParts.filter(p => p.length <= 2).length >= 3) return true

  // Repeated dot-separated pattern (a.a.a.a or ab.ab.ab)
  if (dotParts.length >= 3) {
    const unique = new Set(dotParts)
    if (unique.size === 1) return true
  }

  // Local part is mostly numbers + random chars (bot pattern)
  const digits = (local.match(/\d/g) || []).length
  if (local.length > 10 && digits / local.length > 0.6) return true

  // Known disposable email domains
  const disposable = [
    'yopmail.com', 'tempmail.com', 'guerrillamail.com', 'mailinator.com',
    'throwaway.email', 'temp-mail.org', 'fakeinbox.com', 'trashmail.com',
    'sharklasers.com', 'guerrillamailblock.com', 'grr.la', 'dispostable.com',
    'maildrop.cc', 'mailnesia.com', 'tempail.com', 'tempr.email',
  ]
  const domain = lower.split('@')[1]
  if (domain && disposable.includes(domain)) return true

  return false
}

/**
 * Validates that an input is clean (not spam).
 * Returns null if OK, or an error message string.
 */
export function validateAntiSpam(email: string, name?: string): string | null {
  if (isSpamEmail(email)) {
    return 'Cette adresse email n\'est pas acceptée.'
  }
  if (name && isSpamName(name)) {
    return 'Le prénom saisi semble invalide.'
  }
  return null
}
