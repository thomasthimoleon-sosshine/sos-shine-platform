'use client'

// ── Tracking léger du parcours client (100% maison, dans Supabase) ──
// Aucune donnée envoyée à un tiers. Best-effort : ne bloque jamais l'UI
// et n'échoue jamais visiblement pour le visiteur.

const SESSION_KEY = 'sos-shine-sid'

/** Identifiant anonyme et stable par navigateur (pas de PII). */
export function getSessionId(): string {
  if (typeof window === 'undefined') return 'ssr'
  try {
    let sid = localStorage.getItem(SESSION_KEY)
    if (!sid) {
      sid = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
      localStorage.setItem(SESSION_KEY, sid)
    }
    return sid
  } catch {
    return 'no-storage'
  }
}

export interface TrackPayload {
  step?: number
  email?: string | null
  metadata?: Record<string, unknown>
}

/**
 * Enregistre un événement du funnel. Non bloquant.
 * @param event nom de l'événement (voir SQL_FUNNEL_ANALYTICS.sql)
 */
export function track(event: string, payload: TrackPayload = {}): void {
  if (typeof window === 'undefined') return
  try {
    const body = JSON.stringify({
      session_id: getSessionId(),
      event,
      step: payload.step ?? null,
      email: payload.email ?? null,
      path: window.location.pathname,
      metadata: payload.metadata ?? {},
    })

    // sendBeacon survit aux navigations (ex: redirection Stripe) ; fetch en secours.
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' })
      navigator.sendBeacon('/api/track', blob)
    } else {
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {})
    }
  } catch {
    // silencieux — le tracking ne doit jamais casser le parcours
  }
}
