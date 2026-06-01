'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

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
  const searchParams = useSearchParams()
  const lastTracked = useRef<string>('')

  useEffect(() => {
    if (pathname === lastTracked.current) return
    lastTracked.current = pathname

    if (pathname.startsWith('/api/') || pathname.startsWith('/_next/')) return

    const sessionId = getSessionId()

    const utm = {
      utm_source: searchParams.get('utm_source'),
      utm_medium: searchParams.get('utm_medium'),
      utm_campaign: searchParams.get('utm_campaign'),
      utm_content: searchParams.get('utm_content'),
    }

    const timer = setTimeout(() => {
      fetch('/api/track/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_path: pathname,
          referrer: document.referrer || null,
          session_id: sessionId,
          timestamp: new Date().toISOString(),
          ...utm,
        }),
      }).catch(() => {})
    }, 500)

    return () => clearTimeout(timer)
  }, [pathname, searchParams])

  return null
}
