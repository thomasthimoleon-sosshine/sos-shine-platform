'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let sid = sessionStorage.getItem('shine_session_id')
  if (!sid) {
    sid = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    sessionStorage.setItem('shine_session_id', sid)
  }
  return sid
}

export default function VisitTracker() {
  const pathname = usePathname()
  const lastTracked = useRef<string>('')

  useEffect(() => {
    // Avoid tracking the same page twice in quick succession
    if (pathname === lastTracked.current) return
    lastTracked.current = pathname

    // Skip API routes, static assets, etc.
    if (pathname.startsWith('/api/') || pathname.startsWith('/_next/')) return

    const sessionId = getSessionId()

    // Fire and forget — don't block rendering
    fetch('/api/track/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page_path: pathname,
        referrer: document.referrer || null,
        session_id: sessionId,
      }),
    }).then(async (res) => {
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        console.warn('[VisitTracker] Tracking failed:', res.status, body)
      }
    }).catch((err) => {
      console.warn('[VisitTracker] Network error:', err.message)
    })
  }, [pathname])

  return null
}
