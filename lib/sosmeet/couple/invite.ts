/**
 * SOS Meet Couple, le code d'invitation.
 * Ce code donne accès à un espace intime : il est traité comme un secret.
 * Alphabet sans ambiguïté visuelle (ni I, ni O, ni 0, ni 1), tirage
 * cryptographique, 8 caractères, soit environ 40 bits d'entropie.
 */
import { randomInt } from 'crypto'

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const LENGTH = 8
export const INVITE_TTL_DAYS = 7

export function generateInviteCode(): string {
  let out = ''
  for (let i = 0; i < LENGTH; i++) out += ALPHABET[randomInt(ALPHABET.length)]
  return out
}

/**
 * Normalise ce que la personne colle depuis un message : espaces, tirets,
 * minuscules. L'alphabet excluant déjà les caractères ambigus, tout ce qui
 * n'en fait pas partie est simplement retiré.
 */
export function normalizeInviteCode(raw: string): string {
  return [...String(raw || '').toUpperCase()]
    .filter(c => ALPHABET.includes(c))
    .join('')
    .slice(0, LENGTH)
}

export function isValidShape(code: string): boolean {
  return code.length === LENGTH && [...code].every(c => ALPHABET.includes(c))
}

export function inviteExpiry(from: Date = new Date()): string {
  const d = new Date(from)
  d.setDate(d.getDate() + INVITE_TTL_DAYS)
  return d.toISOString()
}

export function isExpired(expiresAt: string | null | undefined): boolean {
  if (!expiresAt) return true
  return new Date(expiresAt).getTime() < Date.now()
}
